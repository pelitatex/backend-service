import { connect } from "amqplib";
import { RABBITMQ_URL, RABBITMQ_USER, RABBITMQ_PASSWORD } from "../config/loadEnv.js";

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
            channelConfirm.publish(exchange, routingKey, message, {persistent:true,expiration: timeout});
            return;
        }
        channelConfirm.publish(exchange, routingKey, message, {persistent:true});
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
            confirmChannel.sendToQueue(queue, message, {persistent:true, expiration: timeout});
            return;
        }
        confirmChannel.sendToQueue(queue, message, {persistent:true});
        return;
    }

    if (timeout > 0) {
        channel.sendToQueue(queue, message, {persistent:true, expiration: timeout});
        return;
    }
    channel.sendToQueue(queue, message, {persistent:true});
};


