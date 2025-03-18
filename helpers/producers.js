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

export const assignBarangSKUToko = async (tokoAlias, toko_id, barang_id, pool) => {
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
            const query = 'SELECT * FROM nd_barang_sku WHERE barang_id = ? LIMIT ?,?';
            const [rows] = await pool.query(query, [barang_id, offset, limit]);
            if(rows.length === 0){
                hasRows = false;
                return;
            }
            
            const correlationId = uuidv4();
    
            ch.consume(q.queue, function(msg) {
                if (msg.properties.correlationId === correlationId) {
                    console.log(' [.] Got %s registered', msg.content.toString());
                }
            }, {noAck:true});

            const msg = {company:tokoAlias, data:[...rows]};

            ch.sendToQueue(`add_barang_sku_master_toko`,
                Buffer.from(JSON.stringify(msg)),
                {
                    correlationId:correlationId,
                    replyTo:q.queue
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
