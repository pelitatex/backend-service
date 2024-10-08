import "./config/loadEnv.js";

import WebSocket, { WebSocketServer } from 'ws';

const env = process.env.NODE_ENV || 'test';

const PORT = process.env[`PORT_${env}_MESSAGE`];
const PORT_GW = process.env[`PORT_${env}_GATEWAY`];
const PORT_USER = process.env[`PORT_${env}_USER`];
const wss = new WebSocketServer({ port: PORT });

const permissions = {
    'admin':['read','write']
};


const clients = new Map();
const allowedOrigins = [
    `http://localhost:3333`,
    `http://localhost:${PORT_GW}`,
    `http://localhost:${PORT_USER}`
];

const allowedPath = [
    `hameyean`
]

wss.on('connection', function connection(ws, req) {

    const originWithPath = req.headers['sec-websocket-protocol'];
    const origin = req.headers.origin;
    

    if (!allowedOrigins.includes(origin)) {
        // console.log(`Connection incoming from ${user}.`);


        if(req.headers.origin !== 'http://localhost'){
            ws.close();
            console.log(`Connection from ${req.headers.origin} rejected.`);
            return;
        }else{
            if (!allowedPath.includes(originWithPath)) {
                console.log(req.headers.origin, originWithPath);
                ws.close();
                console.log(`Connection from ${originWithPath} rejected.`);
                return;
            }

        }
    }

    const url = new URL(req.url, 'http://localhost');
    const user = url.searchParams.get('user');


    // console.log('A client connected');
    const clientId=generateUniqueId(user);

    
    // You can access the URL path using req.url
    const pathOri = req.url.split("?");
    const path = pathOri[0];
    clients.set(clientId, ws);
    ws.send(JSON.stringify({sender:'server', contentType: 'userID', content:clientId, path:path, user:user}));
    
    if (path === '/chat') {
        // Handle messages from clients
        ws.on('message', (message) => {
          // Broadcast the message to all clients
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({sender:'server', contentType: 'message', content: `message from ${user} : ${message}`,user:user}));
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
});

function generateUniqueId(user){
    const d = new Date();
    let h = (d.getHours());
    let m = (d.getMinutes());
    let s = (d.getSeconds());
    let ms = (d.getMilliseconds());
    const rand = (Math.random(0,10)*100).toFixed(0);
    let time = user+'-' + h + m + s + ms + rand;
    return time;
    
}

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


// app.listen(port, ()=>{
//     console.log(`Service start on ${port}`);
// });