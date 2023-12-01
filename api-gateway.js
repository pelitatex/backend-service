import dotenv from "dotenv";
dotenv.config();

//==================imports=========================
import { createServer } from 'http';
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

import { expressjwt } from "express-jwt";
import jwtEnv from "./config/jwtEnv.js";
import WebSocket, { WebSocketServer } from 'ws';


const apiGateway = express();
var server = createServer(apiGateway);
//==================jwt=========================
const env = process.env.NODE_ENV || 'TEST';
const envir = jwtEnv[env];

const PORT_USER = process.env[`PORT_${env}_USER`];
const PORT_GW = process.env[`PORT_${env}_GATEWAY`];
const PORT_MESSAGE = process.env[`PORT_${env}_MESSAGE`];
const PORT_GW_MS = process.env[`PORT_${env}_Gw_MESSAGE`];
const wss = new WebSocketServer({ port: PORT_GW_MS });


const forwardToMicroservice = {
    "users":`http://localhost:${PORT_USER}/graphql`
};

apiGateway.use(cors({
    origin: ['http://localhost:8081', 'http://localhost:3333'],
    methods: 'GET,POST',
}));

apiGateway.use(morgan('dev'));

apiGateway.use(expressjwt({
    secret:envir.tokenSecret,
    algorithms: ['HS256']
    })
    .unless({
        path:['/login','/graphql','/websocket']
    })
);

apiGateway.use('/graphql', (req, res, next) => {
    
    const tenant = req.headers['x-tenant'];
    const targetMicroservice = req.headers['x-microservice'];
    console.log('tenant',tenant, 'ms',targetMicroservice );
    if (typeof tenant === 'undefined') {
        return res.status(400).json({ error: 'tenant undefined in headers' });
        
    }
    if (!tenant || !targetMicroservice) {
        return res.status(400).json({ error: 'Missing tenant or Microservice in headers' });
    }
    

    createProxyMiddleware({
        target: forwardToMicroservice[targetMicroservice],
        changeOrigin: true,
        pathRewrite: { '^/graphql': '' }, // Remove the '/graphql' prefix before forwarding
    })(req, res, next);
});

wss.on('connection', (ws, req) => {

    console.log('re',req);
    // Handle WebSocket connections
    console.log('WebSocket connection established');
  
    ws.on('message', (message) => {
      console.log(`Received: ${message}`);
    });
  
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
});

const wsProxy = createProxyMiddleware({
    target: `http://localhost:${PORT_MESSAGE}`,
    ws: true,
    changeOrigin: true,
});

server.on('upgrade', (request, socket, head) => {
    console.log('request', request);
    wsProxy(request, socket, head);
});

apiGateway.listen(PORT_GW, () => {
    console.log(`API Gateway is running on port ${PORT_GW}`);
});
  

