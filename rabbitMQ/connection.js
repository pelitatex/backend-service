import { connect } from "amqplib";
import { RABBITMQ_URL, RABBITMQ_USER, RABBITMQ_PASSWORD } from "../config/loadEnv.js";
import {v4 as uuidv4} from 'uuid';

let channel = null;
let confirmChannel = null;
let connection = null;

const initializeRabbitMQ = async () => {
    try {
        if (!connection) {
            console.log('param status',RABBITMQ_URL, RABBITMQ_USER, RABBITMQ_PASSWORD);
            connection = await connect(`amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_URL}:5672/master`).catch((err) => {
                console.error(err);
                throw new Error('Failed to connect to RabbitMQ');
                // process.exit(1);
            });

            connection.on('error', async (err) => {
                console.error('Connection error:', err);
        
                if (err.message !== "Connection closing") {
                    connection = null;
                    channel = null;
                    confirmChannel = null;

                    setTimeout(async () => {
                        console.log('Reconnecting to RabbitMQ...');
                        await initializeRabbitMQ();
                    }, 2000); // Retry after 1 second
                }
        
            });
        
            connection.on("close", async () => {
                console.warn("RabbitMQ connection closed. Reconnecting...");
                
                connection = null;
                channel = null;
                confirmChannel = null;
                
                setTimeout(async () => {
                    console.log('Reconnecting to RabbitMQ...');
                    await initializeRabbitMQ();
                }, 2000); // Retry after 1 second
            });
        }
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Connection Failed', error.message);
        throw error;
    }

}

export const getRabbitMQ = async()  => {
    console.log('Getting RabbitMQ connection...');
    if(!connection){
        await initializeRabbitMQ();
    }

    if(!channel){
        channel = await connection.createChannel();
    }
    if(!confirmChannel){
        confirmChannel = await connection.createConfirmChannel();
    }

    return {channel, confirmChannel, connection};
}