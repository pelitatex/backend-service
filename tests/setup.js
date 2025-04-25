import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENVIRONMENT = process.env.NODE_ENV;
const envConfig = dotenv.config({ path: path.resolve(__dirname, `../.env.${ENVIRONMENT}`) });