// filepath: /home/lindany-mabaso/projects/bbm_bulk_api/data/config.js
const mysql = require('mysql');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Set database connection credentials from environment variables
const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Create a MySQL pool
const pool = mysql.createPool(config);

// Export the pool
module.exports = pool;