import "./config/loadEnv.js";

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

const TOKENSECRET = process.env[`TOKEN_SECRET_${env}`]
const PORT_USER = process.env[`PORT_${env}_USER`];
const PORT_GW = process.env[`PORT_${env}_GATEWAY`];
const PORT_MESSAGE = process.env[`PORT_${env}_MESSAGE`];
// const PORT_GW_MS = process.env[`PORT_${env}_Gw_MESSAGE`];
// const wss = new WebSocketServer({ port: PORT_GW_MS });


const forwardToMicroservice = {
    "master":`http://localhost:${PORT_USER}/graphql`
};

apiGateway.use(cors({
    origin: ['http://localhost:8081' , process.env.FRONTEND_URL],
    methods: 'GET,POST',
}));

apiGateway.use(morgan('dev'));

// Rate limiter middleware
/* const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
}); */

apiGateway.use(expressjwt({
    secret:TOKENSECRET,
    algorithms: ['HS256']
})
.unless({
    path:['/login','/graphql','/websocket']
}));

apiGateway.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ error: 'Unauthorized' });
    } else {
        next(err);
    }
});

apiGateway.use('/graphql', (req, res, next) => {
    
    let tenant = req.headers['x-tenant'];
    // const targetMicroservice = req.headers['x-microservice'];
    const targetMicroservice = 'master';
    
    if (!tenant) {
        return res.status(400).json({ error: 'Missing tenant in headers' });
    //    let tenant = "testapi001"; 
    }

    const proxy = createProxyMiddleware({
        target: forwardToMicroservice[targetMicroservice],
        changeOrigin: true,
        pathRewrite: { '^/graphql': '' }, // Remove the '/graphql' prefix before forwarding
    });

    proxy(req, res, next);
});

/* wss.on('connection', (ws, req) => {

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
}); */

/* apiGateway.listen(PORT_GW, () => {
    console.log(`API Gateway is running on port ${PORT_GW}`);
}); */

export default apiGateway;
  

