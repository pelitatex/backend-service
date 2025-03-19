import { connect } from "amqplib";
import { RABBITMQ_URL, RABBITMQ_USER, RABBITMQ_PASSWORD } from "../config/loadEnv.js";

let channel;
let confirmChannel;
let connection;

const initializeRabbitMQ = async () => {
    try {
        if (connection) {
            connection = await connect(`amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_URL}:5672/master`).catch((err) => {
                console.error(err);
                // process.exit(1);
            });
        }
        channel = await connection.createChannel();
        confirmChannel = await connection.createConfirmChannel();
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Error initializing RabbitMQ', error);
    }

    return {channel, confirmChannel, connection};
}

export const getRabbitMQ = async()  => {
    if(!connection){
        return await initializeRabbitMQ();
    }
    return {channel, confirmChannel, connection};
}