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


const env = process.env.NODE_ENV || 'TEST';

const app = express();
const PORT = process.env[`PORT_${env}_USER`];
const PORT_GW = process.env[`PORT_${env}_GATEWAY`];

const permissions = {
    'admin':['read','write']
};

console.log(PORT_GW);

app.use(cors({
    origin: [`http://localhost:${PORT_GW}`], // Replace with the origin of your React app
    methods: 'GET,POST,OPTIONS', // You can specify the HTTP methods you want to allow
}));

// app.use(cors());

app.use(morgan('dev'));
app.use(
    '/graphql',
    graphqlHTTP( async (req, res) => {
        // console.log('req.headers', req.headers);

        try {
            if (!req.headers['x-tenant']) {
                return res.status(400).json({ error: 'Missing tenante in headers' });
            }
            
            const xTenant = req.headers['x-tenant'];
            const pool = await getPoolForRequest(xTenant);

            console.log('res', res);
            
            return{
                schema:eSchema,
                graphiql: true,
                context: {pool: pool}
            }

        } catch (error) {
            console.error('Error occurred:', error);
            return res.status(500).json({ error: error.message });
        }

    })
);

export default app;

/* app.listen(PORT, () => {
    console.log(`Service start on ${PORT}`);
}); */
