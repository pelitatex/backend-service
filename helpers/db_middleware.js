import config from "../config/database.js";

const db_middleware = async (req, res, next) => {
    const tenant = req.headers['x-tenant']; // You can change this based on your strategy for determining the tenant

    if (!tenant) {
        return res.status(400).json({ error: 'Tenant not specified' });
    }

    try {
        const db = await config(tenant);
        req.db = db;
        next();
    } catch (error) {
        console.error('Error configuring database:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default db_middleware;