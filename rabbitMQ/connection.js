import { connect } from "amqplib";
import { RABBITMQ_URL, RABBITMQ_USER, RABBITMQ_PASSWORD } from "../config/loadEnv.js";
import {v4 as uuidv4} from 'uuid';

let channel;
let confirmChannel;
let connection;

const initializeRabbitMQ = async () => {
    try {
        if (!connection) {
            console.log('param status',RABBITMQ_URL, RABBITMQ_USER, RABBITMQ_PASSWORD);
            connection = await connect(`amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_URL}:5672/master`).catch((err) => {
                console.error(err);
                // process.exit(1);
            });
        }

        if(!channel){
            channel = await connection.createChannel();
        }
        if(!confirmChannel){
            confirmChannel = await connection.createConfirmChannel();
        }
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Error initializing RabbitMQ', error);
    }

}

export const getRabbitMQ = async()  => {
    console.log('Getting RabbitMQ connection...');
    console.log('connection status',connection, channel, confirmChannel);
    if(!connection || !channel || !confirmChannel){
        await initializeRabbitMQ();
    }
    return {channel, confirmChannel, connection};
}