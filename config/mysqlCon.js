import mysql from "mysql2/promise";
import { DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT } from "../config/loadEnv.js";

async function createPoolForTenant() {

  const dbConfig = {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS ,
    database: DB_NAME,
    port: DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  try {
    const poolGet = await mysql.createPool(dbConfig);

    // Test the connection
    // console.log('dbConfig', dbConfig);
    await poolGet.query('SELECT 1');
    
    return poolGet;
  } catch (error) {
    console.error('Error creating pool for tenant', error);
    return null;
  }

}

export default createPoolForTenant;