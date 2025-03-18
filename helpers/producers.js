import { channel, connection } from "./connection.js";

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
