import {v4 as uuidv4} from 'uuid';
import { getRabbitMQ } from './connection.js';

export const assignBarangToko = async (data) => {
    const {connection} = await getRabbitMQ();
    if(typeof connection === 'undefined')
        throw new Error('No Connection');

    if(!data.pool)
        throw new Error('Database pool not available in context.');

    const pool = data.pool;
    const toko_id = data.toko_id;
    const barang_id = data.barang_id;
    const company = data.company;

    try {
        const ch = await connection.createConfirmChannel();
        const q = await ch.assertQueue('', {exclusive:true});

        const barangQuery = `SELECT * FROM nd_barang WHERE id=?`;
        const [barangRows] = await pool.query(barangQuery, [barang_id]);
        if(barangRows.length === 0){
            throw new Error('Barang not found');
        }

        const nama_barang = barangRows[0].nama_jual;
        const satuan_id = barangRows[0].satuan_id;

        const msg = {
            company:company,
            barang_id:barang_id,
            satuan_id:satuan_id,
            nama_barang:nama_barang
        };
        const correlationId = uuidv4();

        ch.consume(q.queue, function(msg) {
            let response = msg.content.toString();
            if (msg.properties.correlationId === correlationId) {
                console.log(`response for ${correlationId}`, response);
                if(response.status === 'success'){
                    console.log(' [.] ', response.message);
                    assignAllBarangSKUToko(company, toko_id, barang_id, pool);
                }else{
                    console.error(' [.] ', response.message);
                }
            }
        }, {noAck:true});

        ch.sendToQueue(`add_barang_master_toko`,
            Buffer.from(JSON.stringify(msg)),
            {
                correlationId:correlationId,
                replyTo:q.queue,
            },
            async function(err, ok) {
                if (err) {
                    console.error(err);
                    throw err;
                } else {
                    console.log('Message sent to queue');
                }
            }
        );
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const assignAllBarangSKUToko = async (tokoAlias, toko_id, barang_id, pool) => {
    const {connection} = await getRabbitMQ();

    if (typeof connection === 'undefined') 
        throw new Error('No Connection');
    
    if(!pool)
        throw new Error('Database pool not available in context.');

    // 1. ambil data barang_id dan warna_id dari barang_sku_id
    // 2. cek toko apa saja yang terdaftar dari nd_toko_barang_assignment
    // 3. kirim ke queue add_barang_sku_master_toko

    let hasRows = true;
    let offset = 0;
    const limit = 50;

    try {

        const ch = await connection.createConfirmChannel();
        const q = await ch.assertQueue('', {exclusive:true});
        
        while(hasRows){
            const query = `
            SELECT sku.*, nd_warna.nama as warna_jual_master
            FROM (
                SELECT *
                FROM nd_barang_sku WHERE barang_id = ? LIMIT ?,?
            ) sku
            LEFT JOIN nd_warna ON sku.warna_id = nd_warna.id
            `;

            const [rows] = await pool.query(query, [barang_id, offset, limit]); 
            if(rows.length === 0){
                hasRows = false;
                return;
            }

            for(const row of rows){
                const {id, sku_id, warna_jual_master} = row;
                if(!id || !sku_id || !warna_jual_master){
                    if(!sku_id || !warna_jual_master){
                        throw new Error('SKU data tidak lengkap');
                    }
                    hasRows = false;
                    break;
                }
            }

            
            const msg = {company:tokoAlias, barang_id:barang_id, data:[...rows]};
            const correlationId = uuidv4();
    
            ch.consume(q.queue, function(msg) {
                let response = msg.content.toString();
                if (msg.properties.correlationId === correlationId) {
                    console.log(`response for ${correlationId}`, response);
                    if(response.status === 'success'){
                        console.log(`[.]  ${response.affectedRows} ditambahkan`);
                    }else{
                        console.error(' [.] ', response.message);
                    }
                }
            }, {noAck:true});


            ch.sendToQueue(`add_barang_sku_master_toko`,
                Buffer.from(JSON.stringify(msg)),
                {
                    correlationId:correlationId,
                    replyTo:q.queue,
                },
                async function(err, ok) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('Message sent to queue');
                    }
                }
            );

            offset += limit;
        }
        
    } catch (error) {
        console.error(error);
        throw error;        
    }
}

export const assignSingleBarangSKUToko = async (barang_sku_id, pool) => {
    const {connection} = await getRabbitMQ();

    if(connection === undefined)
        throw new Error('No Connection');

    if(!pool)
        throw new Error('Database pool not available in context.');

    // 1. ambil data barang_id dan warna_id dari barang_sku_id
    // 2. cek toko apa saja yang terdaftar dari nd_toko_barang_assignment
    // 3. kirim ke queue add_barang_sku_master_toko
    try {
        
        const ch = await connection.createConfirmChannel();
        const q = await ch.assertQueue('', {exclusive:true});

        let barang_id = null;
        const querySKU = `SELECT sku.*, nd_warna.nama as warna_jual_master
            FROM (
                SELECT *
                FROM nd_barang_sku WHERE id = ?
            ) sku
            LEFT JOIN nd_warna ON sku.warna_id = nd_warna.id`;
        const [rowSKU] = await pool.query(querySKU, [barang_sku_id]);
        if(rowSKU.length === 0){
            throw new Error('Barang SKU not found');
        }else{
            
            if(!rowSKU[0].barang_id || !rowSKU[0].warna_id){
                throw new Error('SKU data tidak lengkap');
            }
            barang_id = rowSKU[0].barang_id;
        }
        const skuData = rowSKU[0];

        let hasRows = true;

        while(hasRows){

            const query = `SELECT toko.id as toko_id, toko.alias as company * 
            FROM (
                SELECT *FROM nd_toko_barang_assignment WHERE barang_id = ? 
            )sku_toko
            LEFT JOIN nd_toko toko ON sku_toko.toko_id = toko.id
            `;
            const [rows] = await pool.query(query, [barang_id, offset, limit]);
            if(rows.length === 0){
                console.warn('Toko not found');
                hasRows = false;
                return;
            }

            const msg = {
                sku:skuData,
                company_list:[...rows]
            };
            const correlationId = uuidv4();

            ch.consume(q.queue, function(msg) {
                if (msg.properties.correlationId === correlationId) {
                    console.log(' [.] Got %s registered', msg.content.toString());
                }
            }, {noAck:true});

            ch.sendToQueue(`add_barang_sku_master_toko_multiple`,
                Buffer.from(JSON.stringify(msg)),
                {
                    correlationId:correlationId,
                    replyTo:q.queue,
                },
                async function(err, ok) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('Message sent to queue');
                    }
                }
            );
            
        }
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}
