import { createPool } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.DB_PORT || 3306;

function createPoolForTenant(tenant) {

    const pool = createPool({
        host: process.env.DB_HOST || 'localhost',
        user: 'testhendry',
        password: 'Test!@#456&*(',
        database: tenant+'_database',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    return pool;
}

function getPoolForRequest(req) {
    const tenantFromHeader = req.headers['x-tenant'];
  
    if (!tenantFromHeader) {
      // No tenant provided, handle accordingly
      return null;
    }
    return createPoolForTenant(tenantFromHeader);
  }

export default getPoolForRequest;
