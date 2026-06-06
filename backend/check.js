require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'branches';")
  .then(res => console.log(res.rows))
  .catch(console.error)
  .finally(() => pool.end());
