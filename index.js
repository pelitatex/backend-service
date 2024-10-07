import {FRONTEND_URL, PORT_GATEWAY, ENVIRONMENT, ALLOWED_IPS, TRUSTED_ORIGINS, NODE2_URL} from "./config/loadEnv.js";
import express from "express";
import morgan from "morgan";
import cors from "cors";

import { graphqlHTTP } from "express-graphql";
import eSchema from "./graphql/index.js";

// import { getPool } from "./config/db.js";
import getPoolForRequest from "./config/mysqlCon.js";
import axios from 'axios';

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
    }else if (err.name === 'CorsError') {
        return res.status(403).json({
          error: 'CORS error: The origin is not allowed.'+error.message,
        });
    } else {
        return res.status(500).send({error:`Invalid environment configuration`} );
    }
});

app.get('/hello', (req, res) => {
    res.json({message: 'Request allowed'});
});

app.get('/customers-legacy/:company_index', async (req, res) => { 
    const company_index = parseInt(req.params.company_index);
    console.log('company_index', company_index);
    try {
        const otherAppUrl = `${NODE2_URL}/customers/${company_index}`;

        console.log(`Fetching data from other app: ${otherAppUrl}`);

        axios.get(otherAppUrl)
            .then(response => {
                res.json(response.data);
            })
            .catch(error => {
                console.error(`Error fetching data from other app: ${error.message}`);
                res.status(500).json({ error: 'Failed to fetch data from other app' });
            });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from other app' });
    }
});

app.get('/customers-legacy/sudah_verifikasi_oleh_pajak', async (req, res) => { 
    try {
        const otherAppUrl = `${NODE2_URL}/customers/sudah_verifikasi_oleh_pajak`;

        console.log(`Fetching data from other app: ${otherAppUrl}`);

        axios.get(otherAppUrl)
            .then(response => {
                res.json(response.data);
            })
            .catch(error => {
                console.error(`Error fetching data from other app: ${error.message}`);
                res.status(500).json({ error: 'Failed to fetch data from other app' });
            });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from other app' });
    }
});

app.get('/customers-legacy/:company_index/:id', async (req, res) => { 
    const id = parseInt(req.params.id);
    const company_index = parseInt(req.params.company_index);
    console.log('company_index', company_index);
    try {
        const otherAppUrl = `${NODE2_URL}/customers/${company_index}/${id}`;

        console.log(`Fetching data from other app: ${otherAppUrl}`);

        axios.get(otherAppUrl)
            .then(response => {
                res.json(response.data);
            })
            .catch(error => {
                console.error(`Error fetching data from other app: ${error.message}`);
                res.status(500).json({ error: 'Failed to fetch data from other app' });
            });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from other app' });
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