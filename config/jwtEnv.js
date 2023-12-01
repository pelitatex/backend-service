import dotenv from "dotenv";
dotenv.config();

const jwtEnv = {
    "TEST": {
        "tokenLife" : process.env.TOKEN_LIFE_TEST,
        "tokenSecret" : process.env.TOKEN_SECRET_TEST || 'test-rahasia'
    },
    "DEV" : {
        "tokenLife" : process.env.TOKEN_LIFE_DEV,
        "tokenSecret" : process.env.TOKEN_SECRET_DEV || 'development-rahasia',
    },
    "PROD" : {
        "tokenLife" : process.env.TOKEN_LIFE_PROD,
        "tokenSecret" : process.env.TOKEN_SECRET_PROD || 'production-rahasia',
    }
}

export default jwtEnv;