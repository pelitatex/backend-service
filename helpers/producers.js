import { connect } from "amqplib";
import { RABBITMQ_URL, RABBITMQ_USER, RABBITMQ_PASSWORD } from "../config/loadEnv.js";
import {v4 as uuidv4} from 'uuid';

let channel;
let confirmChannel;
const connection = await connect(`amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_URL}:5672/master`).catch((err) => {
    console.error(err);
    // process.exit(1);
});

if (connection) {
    channel = await connection.createChannel();
    confirmChannel = await connection.createConfirmChannel();
    console.log('Connected to RabbitMQ');
}
//const channel = await connection.createChannel();


export const publishExchange = async (exchange, routingKey, message, timeout = 0, needConfirm = false) => {
    if (connection === undefined) {
        console.error('No connection');
        return;
    }
    console.log(`Publishing message to exchange ${exchange} with routing key ${routingKey}`);

    if(needConfirm) {
        console.log('Sending message to queue with confirm channel');
        if(timeout > 0) {
            channelConfirm.publish(exchange, routingKey, message, {persistent:true,expiration: timeout}, callbackConfirm);
            return;
        }
        channelConfirm.publish(exchange, routingKey, message, {persistent:true}, callbackConfirm);
        return;
    };

    if(timeout > 0) {
        channel.publish(exchange, routingKey, message, {persistent:true,expiration: timeout});
        return;
    }
    channel.publish(exchange, routingKey, message, {persistent:true});
}; 


export const sendToQueue = async (queue, message, timeout = 0, needConfirm = false) => {
    if (connection === undefined) {
        console.error('No connection');
        return;
        
    }
    console.log(`Sending message to queue ${queue}`);

    if(needConfirm) {
        console.log('Sending message to queue with confirm channel');
        if (timeout > 0) {
            confirmChannel.sendToQueue(queue, message, {persistent:true, expiration: timeout}, callbackConfirm);
            return;
        }
        confirmChannel.sendToQueue(queue, message, {persistent:true}, callbackConfirm);
        return;
    }

    if (timeout > 0) {
        channel.sendToQueue(queue, message, {persistent:true});
        return;
    }
    channel.sendToQueue(queue, message, {persistent:true});
};

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
