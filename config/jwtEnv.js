import dotenv from "dotenv";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the root .env file first
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, `../.env.${env}`) });

const jwtEnv = {
    "tokenLife" : process.env.TOKEN_LIFE,
    "tokenSecret" : process.env.TOKEN_SECRET || 'test-rahasia'
}

export default jwtEnv;