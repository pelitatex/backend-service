import { connect } from "amqplib";
import { RABBITMQ_URL, RABBITMQ_USER, RABBITMQ_PASSWORD } from "../config/loadEnv.js";

const connection = await connect(`amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_URL}:5672/master`);
const channel = await connection.createChannel();


export const publishExchange = async (exchange, routingKey, message) => {
    channel.publish(exchange, routingKey, message);
};
