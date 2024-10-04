import {FRONTEND_URL, TOKENSECRET, PORT_APP, ALLOWED_IPS, TRUSTED_ORIGINS} from "./config/loadEnv.js";
//==================imports=========================
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { expressjwt } from "express-jwt";

const apiGateway = express();

const forwardToMicroservice = {
    "master":`http://localhost:${PORT_APP}/graphql`
};

apiGateway.use(cors({
    origin: ['http://localhost:8081' , FRONTEND_URL, TRUSTED_ORIGINS],
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

apiGateway.use((req, res, next) => {
    const allowedIPs = ALLOWED_IPS.split(',');
    const clientIP = req.headers['x-forwarded-for'] 
        ? req.headers['x-forwarded-for'].split(',')[0].trim() 
        : req.connection.remoteAddress;
    const trustedOrigins = TRUSTED_ORIGINS.split(',');
    
    const hostname = req.headers.origin ? new URL(req.headers.origin).hostname : '';

    if (ENVIRONMENT === "development") {
        // In development, allow all access
        console.log(`Development Mode: Access granted to IP - ${clientIP}, Hostname - ${hostname}`);
        next();
    } else if (ENVIRONMENT === "testing") {
        // In testing, restrict access only to allowed IPs
        if (allowedIPs.includes(clientIP) || hostname === "localhost") {
            console.log(`Testing Mode: Access granted to IP - ${clientIP}, Hostname - ${hostname}`);
            next();
        } else {
            console.error(`Testing Mode: Access denied to IP - ${clientIP}, Hostname - ${hostname}`);
            return res.status(403).json({ error: 'Forbidden: IP not allowed in testing environment' });
        }
    }else if (ENVIRONMENT === "production") {
        // In production, restrict to allowed IPs and trusted origins
        if (allowedIPs.includes(clientIP) && trustedOrigins.includes(req.headers.origin)) {
            console.log(`Production Mode: Access granted to IP - ${clientIP}, Origin - ${req.headers.origin}`);
            next();
        } else {
            console.error(`Production Mode: Access denied to IP - ${clientIP}, Origin - ${req.headers.origin}`);
            return res.status(403).json({ error: 'Forbidden: Access denied in production environment' });
        }
    } else {
        return res.status(500).json({ error: 'Invalid environment configuration' });
    }
});

apiGateway.use('/graphql', (req, res, next) => {
    
    let tenant = req.headers['x-tenant'];
    const targetMicroservice = 'master';

    
    if (!tenant) {
        return res.status(400).json({ error: 'Missing tenant in headers' });
    }

    const proxy = createProxyMiddleware({
        target: forwardToMicroservice[targetMicroservice],
        changeOrigin: true,
        pathRewrite: { '^/graphql': '' }, // Remove the '/graphql' prefix before forwarding
    });

    proxy(req, res, next);
});

export default apiGateway;
  

