import {API_KEY} from "./config/loadEnv.js";
import express from 'express';
import bodyParser from 'body-parser';
import jwtHelper from './helpers/jwt.js';

const app = express();

app.use(bodyParser.json());

const corsOptions= {
    origin: function (origin, callback) {
        /* console.log('allowedCors', allowedCors);
        console.log('origin', origin); */
        if (!origin || allowedCors.indexOf(origin) !== -1) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS')); // Reject the request
        }
    },
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, x-tenant, x-username',
    credentials: true, 
}


app.use(cors(corsOptions)); 


// const users = [
//     { id: 1, username: 'user1', password: 'password1' },
//     { id: 2, username: 'user2', password: 'password2' }
// ];

// const machines = [
//     { id: 1, machineId: 'machine1', secret: 'secret1' },
//     { id: 2, machineId: 'machine2', secret: 'secret2' }
// ];

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const token = jwtHelper.generateToken({ id: user.id, username: user.username });
        res.json({ accessToken: token });
    } else {
        res.status(401).send('Username or password incorrect');
    }
});


app.post('/machine-auth', (req, res) => {

    if (!req.headers['x-api-key'] || req.headers['x-api-key'] !== API_KEY) {
        return res.status(403).send('Forbidden');
    }
    
    const isAuthorized = (req.headers['x-api-key'] === API_KEY);

    if (isAuthorized) {
        // const token = jwtHelper.generateToken({ id: machine.id, machineId: machine.machineId });

        const rand = (Math.random() * 10000).toFixed(0);
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


export { app as appAuth };

/* app.listen(PORT, () => {
    console.log(`Authentication server running on port ${PORT}`);
}); */
