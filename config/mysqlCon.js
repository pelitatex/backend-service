import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

var pool = {};

function createPoolForTenant() {

    const poolGet = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    return poolGet;
}

function getPoolForRequest(tenant) {
  const tenantFromHeader = tenant;

  if (!tenantFromHeader) {
    return null;
  }

  if (typeof pool[tenantFromHeader] === 'undefined') {
    console.log("test");
    pool[tenantFromHeader] = createPoolForTenant();
  }
  
  return pool[tenantFromHeader];
}


export default getPoolForRequest;