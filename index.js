import {FRONTEND_URL, PORT_GATEWAY, ENVIRONMENT} from "./config/loadEnv.js";
import express from "express";
import morgan from "morgan";
import cors from "cors";

import { graphqlHTTP } from "express-graphql";
import eSchema from "./graphql/index.js";

// import { getPool } from "./config/db.js";
import getPoolForRequest from "./config/mysqlCon.js";

const app = express();
const PORT_GW = PORT_GATEWAY;
const allowedCors = [];
if (ENVIRONMENT === "development" || "testing") {
    allowedCors.push(`http://localhost`);
    allowedCors.push(FRONTEND_URL);
}else{
    allowedCors.push(`http://localhost:${PORT_GW}`);
}
app.use(cors({
    origin: allowedCors, 
    methods: 'GET,POST,OPTIONS',
}));

app.use(morgan('dev'));
app.use((req, res, next) => {
    const allowedIPs = [`127.0.0.1`,'::1', `::ffff:127.0.0.1`];
    const clientIP = req.headers.origin || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    const hostname = req.headers.origin ? new URL(req.headers.origin).hostname : '';

    if (env === "development" || env === "testing" || allowedIPs.includes(clientIP) || hostname == "localhost") {
        console.log(clientIP, hostname);
        next();
    } else {
      return res.status(403).json({ error: 'Forbidden: Invalid origin' });
    }
});
app.use(
    '/graphql',
    graphqlHTTP( async (req, res) => {
        let xTenant = "default";
        if (req.headers['x-tenant']) {
            xTenant = req.headers['x-tenant'];
        }
        
        const pool = await getPoolForRequest(xTenant);

        return{
            schema:eSchema,
            graphiql: true,
            context: {pool: pool}
        }
    })
);

export default app;