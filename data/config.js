const mysql = require('mysql');
const dotenv = require('dotenv');

// Load environment variables from .env file (Vercel injects them directly)
dotenv.config();

const REQUIRED_ENV_VARS = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
if (missingEnvVars.length > 0) {
    throw new Error(
        `Missing database env vars: ${missingEnvVars.join(', ')}. ` +
        'Set them in .env locally or in Vercel Project Settings > Environment Variables.'
    );
}

// Set database connection credentials from environment variables
const config = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 10000
};

// Create a MySQL pool
const pool = mysql.createPool(config);

// Export the pool
module.exports = pool;
