import { fileURLToPath } from 'url';
import { dirname } from 'path';

// PM2 requires CommonJS by default. Add this flag in your PM2 start command: `--interpreter node --node-args="--experimental-loader=@esbuild-kit/esm-loader"`

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Export the configuration object
const configuration = {
  apps: [
    {
      name: "pelita-api-app",
      script: "./index.js",
      env: {
        NODE_ENV: "development",
      },
      env_development: {
        ENV_FILE: `.env.development`,
      },
      env_testing: {
        NODE_ENV: "testing",
        ENV_FILE: `.env.testing`,
      },
      env_production: {
        NODE_ENV: "production",
        ENV_FILE: `.env.production`,
      },
    },
  ],
};

export default configuration;
