import mysql from "mysql2/promise";
import { DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT } from "../config/loadEnv.js";

var pool = {};

async function createPoolForTenant() {

  try {
    const poolGet = await mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASS ,
        database: DB_NAME,
        port: DB_PORT,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // Test the connection
    await poolGet.query('SELECT 1');
    
    return poolGet;
  } catch (error) {
    console.error('Error creating pool for tenant', error);
    return null;
  }

}

async function getPoolForRequest(tenant) {
  const tenantFromHeader = tenant;

  if (!tenantFromHeader) {
    return null;
  }

  console.log("Pool Connection",pool[tenantFromHeader]);

  if (typeof pool[tenantFromHeader] === 'undefined' || pool[tenantFromHeader] === null) {
    pool[tenantFromHeader] = await createPoolForTenant();
    console.log('creating pool for tenant', tenantFromHeader);
  }
  
  return pool[tenantFromHeader];
}


export default getPoolForRequest;