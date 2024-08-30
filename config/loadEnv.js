import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the root .env file first
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Now, load the environment-specific .env file
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, `../.env.${env}`) });

export default env;