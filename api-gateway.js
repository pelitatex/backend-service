import env from "./config/loadEnv.js";
//==================imports=========================
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { expressjwt } from "express-jwt";

const apiGateway = express();
const TOKENSECRET = process.env[`TOKEN_SECRET`]
const PORT_APP = process.env[`PORT_APP`];


const forwardToMicroservice = {
    "master":`http://localhost:${PORT_APP}/graphql`
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
  

