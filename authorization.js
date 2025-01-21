import { API_KEY, FRONTEND_URL, MACHINE_URL, PORT_AUTH, ALLOWED_IPS, ENVIRONMENT } from "./config/loadEnv.js";
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

appAuth.use((req, res, next) => {
    const allowedIPs = ALLOWED_IPS.split(',');
    let clientIP = req.headers['x-forwarded-for'] 
        ? req.headers['x-forwarded-for'].split(',')[0].trim() 
        : req.connection.remoteAddress;

    if (clientIP.startsWith('::ffff:')) {
        clientIP = clientIP.substring(7);
    }
    const trustedOrigins = FRONTEND_URL.split(',');
    
    const hostname = req.headers.origin ? new URL(req.headers.origin).hostname : '';
    console.log(`Mode: ${clientIP}, ${hostname}`);


    res.header('Access-Control-Allow-Origin', req.headers.origin); // Ensure this header is set
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (ENVIRONMENT === "development") {
        // In development, allow all access
        console.log(`Development Mode: Access granted to IP - ${clientIP}, Hostname - ${hostname}`);
        next();
    } else if (ENVIRONMENT === "testing") {
        // In testing, restrict access only to allowed IPs
        if (allowedIPs.includes(clientIP) || hostname === "localhost" || trustedOrigins.includes(req.headers.origin)) {
            console.log(`Testing Mode: Access granted to IP - ${clientIP}, Hostname - ${hostname} `);
            next();
        } else {
            /* console.log(`Allowed IPs:`);
            console.log(allowedIPs);
            console.log(`clientIP:${clientIP}`);
            console.log(`test: ${allowedIPs.includes(clientIP.toString().trim())}`);
            console.error(`Testing Mode: Access denied to IP - ${clientIP}, Hostname - ${hostname}`); */
            // return res.status(403).json({ error: 'Forbidden: IP not allowed in testing environment' });
            return res.status(403).send( {error:`Forbidden: IP not allowed in testing environment`} );
        }
    }else if (ENVIRONMENT === "production") {
        // In production, restrict to allowed IPs and trusted origins
        if (allowedIPs.includes(clientIP) || trustedOrigins.includes(req.headers.origin)) {
            console.log(`Production Mode: Access granted to IP - ${clientIP}, Origin - ${req.headers.origin}`);
            isAccessFromOffice = true;
            next();
        } else {
            console.error(`Production Mode: Access denied to IP - ${clientIP}, Origin - ${req.headers.origin}`);
            
            // return res.status(403).json({ error: 'Forbidden: Access denied in production environment' });
            return res.status(403).send({error:`Request blocked`});
        }
    }else if (err.name === 'CorsError') {
        return res.status(403).json({
          error: 'CORS error: The origin is not allowed.'+error.message,
        });
    } else {
        return res.status(500).send({error:`Invalid environment configuration`} );
    }
});

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


appAuth.get('/testing-con', (req, res) => {
    console.log('req.headers', req.headers);
    res.send('Testing OK');
});

appAuth.post('/testing-post', (req, res) => {
    console.log('req.body', req.body);
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
