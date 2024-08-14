import "dotenv/config";

import express from "express";
import morgan from "morgan";
import cors from "cors";

import { graphqlHTTP } from "express-graphql";
// import schema from "./graphql/schema.js";
import eSchema from "./graphql/index.js";

// internal source needed
// import {createSatuanLoader} from "./helpers/loader.js";
// import { getPool } from "./config/db.js";
import getPoolForRequest from "./config/mysqlCon.js";


const env = process.env.NODE_ENV || 'DEV';

const app = express();
const PORT = process.env[`PORT_${env}_USER`];
const PORT_GW = process.env[`PORT_${env}_GATEWAY`];

const permissions = {
    'admin':['read','write']
};


app.use(cors({
    origin: [`http://localhost:${PORT_GW}`, process.env.FRONTEND_URL], // Replace with the origin of your React app
    methods: 'GET,POST,OPTIONS', // You can specify the HTTP methods you want to allow
}));

// app.use(cors());

app.use(morgan('dev'));

app.use((req, res, next) => {
    const origin = req.headers.origin || req.connection.remoteAddress;
    // Check if the origin matches a specific IP or port
    if (origin === `http://localhost:${PORT_GW}` || origin === '::ffff:127.0.0.1') {
      // Allow the request
      next();
    } else {
      // Reject the request
      res.status(403).json({ error: 'Forbidden: Invalid origin' });
    }
});
app.use(
    '/graphql',
    graphqlHTTP( async (req, res) => {
        
        let xTenant = "default";
        /* if (!req.headers['x-tenant']) {
            // res.status(400).json({ error: 'Missing tenant in headers' });
            // return;
            // throw new Error('Missing tenant in headers');
            console.log('Missing tenant in headers');
        }else{
            xTenant = req.headers['x-tenant'];
            // console.log('Tenant:',xTenant);
        } */
        
        const pool = await getPoolForRequest(xTenant);

        /* if (!req.body || Object.keys(req.body).length === 0) {
            res.status(400).send({ error: 'Must provide query string' });
            // console.log('Missing body in request');

        } */

        /* if (!eSchema) {
            res.status(500).json({ error: 'No schema defined for the query' });
            return;
        } */

        return{
            schema:eSchema,
            graphiql: true,
            context: {pool: pool}
        }
    })
);

/* app.listen(PORT, ()=>{
    console.log(`Service start on ${PORT}`);
}); */

export default app;