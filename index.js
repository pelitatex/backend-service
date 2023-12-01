import "./config/loadEnv.js";

import express from "express";
import morgan from "morgan";
import cors from "cors";

import { graphqlHTTP } from "express-graphql";
import schema from "./graphql/schema.js";
import resolvers from "./graphql/resolvers/index.js";

const env = process.env.NODE_ENV || 'TEST';

const app = express();
const PORT = process.env[`PORT_${env}_USER`];
const PORT_GW = process.env[`PORT_${env}_GATEWAY`];

const permissions = {
    'admin':['read','write']
};


app.use(cors({
    origin: [`http://localhost:${PORT_GW}`], // Replace with the origin of your React app
    methods: 'GET,POST', // You can specify the HTTP methods you want to allow
}));

app.use(morgan('dev'));

app.use(
    '/graphql',
    graphqlHTTP({
        schema:schema,
        rootValue: resolvers,
        graphiql: (env === 'test' || env === 'dev' ? true : false)
    })
);

app.listen(PORT, ()=>{
    console.log(`Service start on ${PORT}`);
});