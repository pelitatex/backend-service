const env = process.env.NODE_ENV || 'test';

import jwt from 'jsonwebtoken';
// import jwtEnv from `@config/jwtEnv`[env];
import jwtEnv from '../config/jwtEnv.js';
const envir = jwtEnv[env];

const generateToken = (payload) => {
    return jwt.sign(payload, envir.tokenSecret, {expiresIn: '1h'});
}

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization
        
    if(!token) return res.status(403).send({success: false, message:"Token is required"})
    if(!token.includes(`Bearer `)) return res.status(403).send({success: false, message:"Token is not valid"})
    
    token = token.replace(`Bearer `, ``)
    jwt.verify(token, envir.tokenSecret, function(err, decoded) {
        if(err){
            return res.status(401).send({success: false, message:"Token has expired"})
        }else {
            req.decoded = decoded
            next()
        }
    })

}

export default {generateToken, verifyToken}