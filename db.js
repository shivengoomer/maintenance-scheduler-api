// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  },
  // Add connection timeout
  connectionTimeoutMillis: 5000,
  // Enable keep-alive
  keepAlive: true
});

pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

module.exports = {
  query: (text, params) => pool.query(text, params),
};