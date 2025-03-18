import {v4 as uuidv4} from 'uuid';
import { connection } from './connection.js';

export const assignBarangToko = async (data) => {
    if(connection === undefined)
        throw new Error('No Connection');

    if(!data.pool)
        throw new Error('Database pool not available in context.');

    try {
        const ch = await connection.createConfirmChannel();
        const q = await ch.assertQueue('', {exclusive:true});

        const msg = {
            company:data.company,
            toko_id:data.toko_id,
            barang_id:data.barang_id
        };
        const correlationId = uuidv4();

        ch.consume(q.queue, function(msg) {
            if (msg.properties.correlationId === correlationId) {
                console.log(' [.] Got %s registered', msg.content.toString());
                assignAllBarangSKUToko(data.company, data.toko_id, data.barang_id, data.pool);
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
            const msg = {company:tokoAlias, data:[...rows]};
            const correlationId = uuidv4();
    
            ch.consume(q.queue, function(msg) {
                if (msg.properties.correlationId === correlationId) {
                    console.log(' [.] Got %s registered', msg.content.toString());
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
