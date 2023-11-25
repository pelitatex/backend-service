import dotenv from "dotenv";
dotenv.config();

const jwtEnv = {
    "test": {
        "tokenLife" : process.env.TOKEN_LIFE_TEST || `1d`,
        "tokenSecret" : process.env.TOKEN_SECRET_TEST || 'test-rahasia'
    },
    "development" : {
        "tokenLife" : process.env.TOKEN_LIFE_DEV || `1d`,
        "tokenSecret" : process.env.TOKEN_SECRET_DEV || 'development-rahasia',
    },
    "production" : {
        "tokenLife" : process.env.TOKEN_LIFE_PROD || `1d`,
        "tokenSecret" : process.env.TOKEN_SECRET_PROD || 'production-rahasia',
    }
}

export default jwtEnv;