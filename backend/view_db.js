require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query("SELECT settings_data FROM system_settings").then(res => {
  console.log('DATA:', JSON.stringify(res.rows[0]));
  pool.end();
}).catch(e => {
  console.error(e);
  pool.end();
});
