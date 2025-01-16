import {API_KEY} from "./config/loadEnv.js";
import express from 'express';
import bodyParser from 'body-parser';
import jwtHelper from './helpers/jwt.js';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

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

    if (!req.headers['x-api-key'] || req.headers['x-api-key'] !== 'your-api-key') {
        return res.status(403).send('Forbidden');
    }
    
    const hostname = req.headers.origin ? new URL(req.headers.origin).hostname : '';
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
