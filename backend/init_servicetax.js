const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'veritasco_nidhi',
  password: 'admin',
  port: 5432,
});

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS service_tax (
      id SERIAL PRIMARY KEY,
      tax_name VARCHAR(50) NOT NULL,
      total_percent NUMERIC(5,2) NOT NULL,
      cgst_percent NUMERIC(5,2) NOT NULL,
      sgst_percent NUMERIC(5,2) NOT NULL,
      igst_percent NUMERIC(5,2) NOT NULL,
      is_igst BOOLEAN DEFAULT FALSE,
      status VARCHAR(20) DEFAULT 'Active'
    );
  `);
  
  const res = await pool.query('SELECT COUNT(*) FROM service_tax');
  if (parseInt(res.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO service_tax (tax_name, total_percent, cgst_percent, sgst_percent, igst_percent, is_igst, status)
      VALUES ('GST', 6.00, 3.00, 3.00, 0.00, false, 'Active')
    `);
  }
  console.log('Service tax table created and seeded!');
  pool.end();
}
run().catch(console.error);
