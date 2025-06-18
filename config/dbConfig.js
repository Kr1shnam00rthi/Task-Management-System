const mysql = require('mysql2');
require('dotenv').config();

// Create database connection pool 
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 5
}).promise();

// Function to test database connection
async function testConnection() {
    try {
        await db.query('SELECT 1');
        console.log('Connected to MySQL');
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
}

testConnection();

module.exports = { db };