import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'favour_test',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const dbToko = async () => {
    try {
        const pool = await mysql.createPool(dbConfig);
        await pool.query('SELECT 1');
        return pool;
    } catch (error) {
        console.error('Error creating pool for toko_db', error);
        return null;
    }
}

export default dbToko;