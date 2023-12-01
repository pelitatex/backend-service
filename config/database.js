import mysql from 'mysql2';
import dotenv from "dotenv";
dotenv.config();

async function config(tenant) {
  try {
    const connection = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'testhendry',
      password: process.env.DB_PASSWORD || 'Test!@#456&(*',
      database: `${tenant}_database`,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    const db = await mysql.createPool(connection);

    return db;
  } catch (error) {
    console.error('Error creating database pool:', error.message);
    throw error; // Re-throw the error to signal failure
  }
}

export default config;