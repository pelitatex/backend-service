import mysql from "mysql2/promise";
import { DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT } from "./loadEnv";

var pool = {};

function createPoolForTenant() {

    const poolGet = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASS ,
        database: DB_NAME,
        port: DB_PORT,
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
    pool[tenantFromHeader] = createPoolForTenant();
  }
  
  return pool[tenantFromHeader];
}


export default getPoolForRequest;