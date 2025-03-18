import { connect } from "amqplib";
import { RABBITMQ_URL, RABBITMQ_USER, RABBITMQ_PASSWORD } from "../config/loadEnv.js";

const connection = await connect(`amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_URL}:5672/master`).catch((err) => {
    console.error(err);
    // process.exit(1);
});


export const assignBarangSKUToko = async (tokoAlias, toko_id, barang_id, pool) => {
    if (!pool) {
        throw new Error('Database pool not available in context.');
    }
    
    const query = 'SELECT * FROM nd_barang_sku WHERE barang_id = ?';
    const [rows] = await pool.query(query, [barang_id]);
    if(rows.length === 0){
        console.log('Barang tidak ada sku');
        return;
    }
    const msg = {company:tokoAlias, ...rows[0]};

    const connection = await connect(`amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_URL}:5672/master`).catch((err) => {
        console.error(err);
    });

    if(connection){
        console.log('Connected to RabbitMQ');
        
        const channel = await connection.createChannel();
        channel.sendToQueue('pairing_barang_sku_toko', Buffer.from(JSON.stringify(msg)));
    }
    
    
}
