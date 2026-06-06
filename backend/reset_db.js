require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query("UPDATE system_settings SET settings_data = '{}'").then(() => {
  console.log('Reset complete');
  pool.end();
}).catch(e => {
  console.error(e);
  pool.end();
});
