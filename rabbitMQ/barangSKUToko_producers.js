import {v4 as uuidv4} from 'uuid';
import { getRabbitMQ } from './connection.js';

export const assignBarangToko = async (data) => {
    const {connection} = await getRabbitMQ();
    if(connection === undefined)
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
            response = JSON.parse(content);
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
    if (connection === undefined) 
        throw new Error('No Connection');
    
    if(!pool)
        throw new Error('Database pool not available in context.');

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
            const msg = {company:tokoAlias, barang_id:barang_id, data:[...rows]};
            const correlationId = uuidv4();
    
            ch.consume(q.queue, function(msg) {
                let response = msg.content.toString();
                response = JSON.parse(content);
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
    if(connection === undefined)
        throw new Error('No Connection');

    if(!pool)
        throw new Error('Database pool not available in context.');

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
            barang_id = rowSKU[0].barang_id;
            warna_id = rowSKU[0].warna_id;
        }
        const skuData = rowSKU[0];

        let hasRows = true;
        let offset = 0;
        const limit = 50;

        while(hasRows){

            const query = 'SELECT * FROM nd_toko_barang_assignment WHERE barang_id = ? LIMIT ?,?';
            const [rows] = await pool.query(query, [barang_id, offset, limit]);
            if(rows.length === 0){
                hasRows = false;
                return;
            }

            const msg = {
                sku:skuData,
                toko_list:[...rows]
            };


            const correlationId = uuidv4();

            ch.consume(q.queue, function(msg) {
                if (msg.properties.correlationId === correlationId) {
                    console.log(' [.] Got %s registered', msg.content.toString());
                }
            }, {noAck:true});

            ch.sendToQueue(`add_barang_sku_toko`,
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
