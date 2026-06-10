const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection on module load – log detailed error and exit if connection fails
pool.connect((err, client, release) => {
  if (err) {
    console.error('❗️ Failed to connect to PostgreSQL. Check DATABASE_URL and network access.', err);
    // In a serverless environment, we cannot exit process; we just log. Subsequent DB calls will fail.
  } else {
    console.log('✅ Connected to PostgreSQL database (Modular Config).');
    release();
  }
});

module.exports = pool;
