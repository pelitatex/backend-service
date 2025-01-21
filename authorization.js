import { API_KEY, FRONTEND_URL, MACHINE_URL, PORT_AUTH } from "./config/loadEnv.js";
import express from 'express';
import bodyParser from 'body-parser';
import jwt from "./helpers/jwt.js";
import cors from 'cors';

const appAuth = express();

appAuth.use(bodyParser.json());

console.log(MACHINE_URL);

let allowedCors = FRONTEND_URL.split(',');
let allowedMachine = MACHINE_URL.split(',');
let allowedOrigins = [...allowedCors, ...allowedMachine];

const corsOptions= {
    origin: function (origin, callback) {
        /* console.log('allowedCors', allowedCors); 
        console.log('origin', origin); */
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS')); // Reject the request
        }
    },
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, x-tenant, x-username, x-api-key',
    credentials: true, 
}


appAuth.use(cors(corsOptions)); 


// for future development
/* appAuth.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    const payload = {
        id: user.id,
        username: user.username,
        roles: user.roles,
        posisi_id: user.posisi_id,
        time_start: user.time_start,
        time_end: user.time_end
    };
    if (user) {
        const token = jwt.generateToken({ id: user.id, username: user.username });
        res.json({ accessToken: token });
    } else {
        res.status(401).send('Username or password incorrect');
    }
}); */


appAuth.get('/testing', (req, res) => {
    res.send('Testing OK');
});

appAuth.post('/machine-auth', (req, res) => {

    if (!req.headers['x-api-key'] || req.headers['x-api-key'] !== API_KEY) {
        console.log('Forbidden', req.headers['x-api-key']);
        return res.status(403).send('Forbidden');
    }
    
    const isAuthorized = (req.headers['x-api-key'] === API_KEY);

    if (isAuthorized) {
        // const token = jwtHelper.generateToken({ id: machine.id, machineId: machine.machineId });

        const rand = (Math.random() * 10000).toFixed(0);
        const hostname = req.headers.origin ? new URL(req.headers.origin).hostname : '';

        const payload = {
            id: 'machine-'+rand,
            username: `machine-${hostname}-${rand}`,
            roles: `machine`
        };
        const token = jwt.generateToken(payload);
        res.json({ accessToken: token });

    } else {
        res.status(401).send('Authorization failed');
    }
});


// export default appAuth;

appAuth.listen(PORT_AUTH, () => {
    console.log(`Authentication server running on port ${PORT_AUTH}`);
});
