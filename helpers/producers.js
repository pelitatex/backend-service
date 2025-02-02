import { connect } from "amqplib";
import { RABBITMQ_URL, RABBITMQ_USER, RABBITMQ_PASSWORD } from "../config/loadEnv.js";

let channel;
const connection = await connect(`amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_URL}:5672/master`).catch((err) => {
    console.error(err);
    // process.exit(1);
});

if (connection) {
    channel = await connection.createChannel();
}
//const channel = await connection.createChannel();


export const publishExchange = async (exchange, routingKey, message) => {
    if (connection === undefined) {
        console.error('No connection');
        return;
        
    }
    console.log(`Publishing message to exchange ${exchange} with routing key ${routingKey}`);
    channel.publish(exchange, routingKey, message);
}; 