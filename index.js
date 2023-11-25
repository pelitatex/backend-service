
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import cors from "cors";
import { expressjwt } from "express-jwt";

import { graphqlHTTP } from "express-graphql";
import schema from "./graphql/schema.js";
import resolvers from "./graphql/resolvers/index.js";
import jwtEnv from "./config/jwtEnv.js";
import WebSocket, { WebSocketServer } from 'ws';
import db_middleware from "./helpers/db_middleware.js";

// import jwt from './helpers/jwt.js';
const env = process.env.NODE_ENV || 'test';
const envir = jwtEnv[env];
// import jwtEnv from "./config/jwtEnv.js";

const environment = process.env.NODE_ENV || 'test';
const app = express();
const port = process.env.PORT_TEST || 5555;
const wss = new WebSocketServer({ port: 5577 });

const permissions = {
    'admin':['read','write']
};

app.use(db_middleware);

app.use(cors({
    origin: ['http://localhost:8081', 'http://localhost:3333'], // Replace with the origin of your React app
    methods: 'GET,POST', // You can specify the HTTP methods you want to allow
}));
app.use(morgan('dev'));
app.use(expressjwt({
    secret:envir.tokenSecret,
    algorithms: ['HS256']
    })
    .unless({
        path:['/login','/graphql','/websocket']
    })
);

const clients = new Map();

wss.on('connection', function connection(ws, req) {

    // console.log('A client connected');
    const clientId=generateUniqueId();
    // console.log(`Client ID: ${clientId}`);
    clients.set(clientId, ws);
    ws.send(JSON.stringify({sender:'server', contentType: 'userID', content:clientId}));
    
    // You can access the URL path using req.url
    const path = req.url;
    console.log(path);

    if (path === '/chat') {
        // Handle messages from clients
        ws.on('message', (message) => {
          console.log(`Received: ${message}`);
    
          // Broadcast the message to all clients
          wss.clients.forEach((client) => {
            console.log(client.readyState, WebSocket.OPEN);
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({sender:'server', contentType: 'message', content: `message from ${clientId} : ${message}`}));
            }
          });
        });
    
        // Handle disconnection
        ws.on('close', () => {
          console.log('A client disconnected');
        });
    } else {
        ws.close();
    }

    // ws.on('error', console.error);
  
    // ws.on('message', function message(data) {
    //   console.log('received: %s', data);
    // });
  
    // ws.send('something');    
});

function generateUniqueId(){
    const d = new Date();
    let h = (d.getHours());
    let m = (d.getMinutes());
    let s = (d.getSeconds());
    let ms = (d.getMilliseconds());
    const rand = (Math.random(0,10)*100).toFixed(0);
    let time = 'user' + h + m + s + ms + rand;
    return time;
    
}

// ws.on('error', console.error);

// ws.on('open', function open() {
//   ws.send('something');
// });

// ws.on('message', function message(data) {
//   console.log('received: %s', data);
// });

app.use(
    '/graphql',
    graphqlHTTP({
        schema:schema,
        rootValue: resolvers,
        graphiql: (env === 'test' || env === 'dev' ? true : false)
    })
);

/*  let clients = [];
app.get('/sse', (req,res) =>{
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Add the client to the list
    clients.push(res);

    // Send an initial message to the client
    res.write('data: Connected\n\n');

    // Remove the client when the connection is closed
    req.on('close', () => {
        clients = clients.filter((client) => client !== res);
    });
});

// Example route to trigger a notification
app.get('/trigger-notification', (req, res) => {
    // Send the notification to all connected clients
    clients.forEach((client) => {
      client.write(`data: New data available\n\n`);
    });
  
    res.send('Notification sent');
}); */


app.listen(port, ()=>{
    console.log(`Service start on ${port}`);
});