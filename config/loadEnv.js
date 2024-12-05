import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to load .env files with error handling
const loadEnvFile = (filePath) => {
  // console.log('path', filePath);
  const result = dotenv.config({ path: filePath });
  // console.log('result', result);
  const envMain = process.env.ENVIRONMENT;
  // console.log('envMain', envMain);
  if (result.error) {
    throw new Error(`Warning: Could not load .env file at ${filePath}`);
  }
};

// Load the root .env file first
loadEnvFile(path.resolve(__dirname, '../.env'));

// Now, load the environment-specific .env file
const envMain = process.env.ENVIRONMENT || 'development';
loadEnvFile(path.resolve(__dirname, `../.env.${envMain}`));


export const LIFETIME = process.env.TOKEN_LIFETIME;
export const TOKENSECRET = process.env.TOKEN_SECRET;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const PORT_APP = process.env.PORT_APP;
export const PORT_GATEWAY = process.env.PORT_GATEWAY;
export const ENVIRONMENT = envMain;

export const DB_HOST = process.env.DB_HOST;
export const DB_USER =  process.env.DB_USER;
export const DB_PASS =  process.env.DB_PASS ;
export const DB_NAME  = process.env.DB_NAME;
export const DB_PORT =  process.env.DB_PORT;
export const TRUSTED_ORIGINS = process.env.TRUSTED_ORIGINS;
export const ALLOWED_IPS = process.env.ALLOWED_IPS;
export const NODE2_URL = process.env.NODE2_URL;

export const RABBITMQ_URL = process.env.RABBITMQ_URL;
export const RABBITMQ_USER = process.env.RABBITMQ_USER;
export const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD;

// Export the variables to be used in other modules
console.log(envMain+' environment detected');
// console.log(LIFETIME, TOKENSECRET, FRONTEND_URL, PORT_APP, PORT_GATEWAY, ENVIRONMENT);


