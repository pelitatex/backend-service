import "dotenv/config";

import express from "express";
import morgan from "morgan";
import cors from "cors";

import { graphqlHTTP } from "express-graphql";
import schema from "./graphql/schema.js";
import eSchema from "./graphql/resolvers/index.js";

// internal source needed
import {createSatuanLoader} from "./helpers/loader.js";
import { getPool } from "./config/db.js";


const env = process.env.NODE_ENV || 'TEST';

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

const loader = {
    satuanLoader : null
};
app.use(
    '/graphql',
    graphqlHTTP( async (req) => {
        const pool = getPool();
        return{
            schema:eSchema,
            graphiql: true,
            context: {pool: pool}
        }
    })
);

app.listen(PORT, ()=>{
    console.log(`Service start on ${PORT}`);
});