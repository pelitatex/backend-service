import { createPool } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const PORT = 3306;
var pool = {};

async function createPoolForTenant() {

    pool['test'] = await createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database:'testapi001_database',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    return pool['test'];
}

function getPoolForRequest() {

    if (pool === null || typeof pool['test'] === 'undefined') {
      return createPoolForTenant();
    }

    
    return pool['test'];
  }

export default getPoolForRequest;