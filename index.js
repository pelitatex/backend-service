import {FRONTEND_URL, PORT_GATEWAY, ENVIRONMENT, ALLOWED_IPS, TRUSTED_ORIGINS} from "./config/loadEnv.js";
import express from "express";
import morgan from "morgan";
import cors from "cors";

import { graphqlHTTP } from "express-graphql";
import eSchema from "./graphql/index.js";

// import { getPool } from "./config/db.js";
import getPoolForRequest from "./config/mysqlCon.js";

process.env.TZ = 'UTC';
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
    const allowedIPs = ALLOWED_IPS.split(',');
    let clientIP = req.headers['x-forwarded-for'] 
        ? req.headers['x-forwarded-for'].split(',')[0].trim() 
        : req.connection.remoteAddress;

    if (clientIP.startsWith('::ffff:')) {
        clientIP = clientIP.substring(7);
    }
    const trustedOrigins = TRUSTED_ORIGINS.split(',');
    
    const hostname = req.headers.origin ? new URL(req.headers.origin).hostname : '';

    /* if (ENVIRONMENT === "development" || ENVIRONMENT === "testing" || allowedIPs.includes(clientIP) || hostname == "localhost") {
        
        console.log(clientIP, hostname);
        next();
    } else {
      return res.status(403).json({ error: 'Forbidden: Invalid origin' });
    } */

    if (ENVIRONMENT === "development") {
        // In development, allow all access
        console.log(`Development Mode: Access granted to IP - ${clientIP}, Hostname - ${hostname}`);
        next();
    } else if (ENVIRONMENT === "testing") {
        // In testing, restrict access only to allowed IPs
        if (allowedIPs.includes(clientIP) || hostname === "localhost") {
            console.log(`Testing Mode: Access granted to IP - ${clientIP}, Hostname - ${hostname} `);
            next();
        } else {
            console.log(`Allowed IPs:`);
            console.log(allowedIPs);
            console.log(`clientIP:${clientIP}`);
            console.log(`test: ${allowedIPs.includes(clientIP.toString().trim())}`);
            console.error(`Testing Mode: Access denied to IP - ${clientIP}, Hostname - ${hostname}`);
            // return res.status(403).json({ error: 'Forbidden: IP not allowed in testing environment' });
            return res.status(403).send( {error:`Forbidden: IP not allowed in testing environment`} );
        }
    }else if (ENVIRONMENT === "production") {
        // In production, restrict to allowed IPs and trusted origins
        if (allowedIPs.includes(clientIP) || trustedOrigins.includes(req.headers.origin)) {
            console.log(`Production Mode: Access granted to IP - ${clientIP}, Origin - ${req.headers.origin}`);
            next();
        } else {
            console.error(`Production Mode: Access denied to IP - ${clientIP}, Origin - ${req.headers.origin}`);
            // return res.status(403).json({ error: 'Forbidden: Access denied in production environment' });
            return res.status(403).send({error:`Request blocked`});
        }
    } else {
        return res.status(500).send({error:`Invalid environment configuration`} );
    }
});

app.get('/hello', (req, res) => {
    res.json({message: 'Request allowed'});
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