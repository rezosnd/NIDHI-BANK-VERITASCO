require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();

// 🛡️ Security Middleware: Helmet sets various HTTP headers to protect the app
app.use(helmet({
  contentSecurityPolicy: false, // Disabled to allow frontend assets in local dev/proxy
}));

app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit payload size to prevent DOS

// 🛡️ Security Middleware: Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 login requests per minute
  message: { success: false, message: 'Too many login attempts, please try again after a minute.' }
});

app.use('/api/', apiLimiter);

// Prevent invalid JSON from crashing the server
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON payload format' });
  }
  next();
});

// Helper to hash passwords using built-in crypto (SHA-256)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Connect to PostgreSQL DB (Neon) via Environment Variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL database.');
    release();
    initDb();
  }
});

async function initDb() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE,
      password_hash VARCHAR(255),
      role VARCHAR(255)
    )`);

    try {
      await pool.query(`ALTER TABLE users ADD COLUMN branch_id INTEGER`);
    } catch(e) {}

    const { rows } = await pool.query("SELECT count(*) as count FROM users");
    if (parseInt(rows[0].count) === 0) {
      await pool.query("INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)", ['admin', hashPassword('Tiger^123'), 'Admin']);
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      cif_number VARCHAR(255) UNIQUE,
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      dob VARCHAR(255),
      gender VARCHAR(255),
      aadhar_number VARCHAR(255),
      pan_number VARCHAR(255),
      phone_number VARCHAR(255),
      email VARCHAR(255),
      address TEXT,
      account_type VARCHAR(255),
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS branches (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      code VARCHAR(255) UNIQUE,
      state VARCHAR(255),
      address TEXT,
      contact_name VARCHAR(255),
      phone_no VARCHAR(255),
      mobile_no VARCHAR(255),
      email VARCHAR(255),
      pin_code VARCHAR(50),
      status VARCHAR(50) DEFAULT 'Active'
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS company_profile (
      id SERIAL PRIMARY KEY,
      company_name VARCHAR(255),
      short_name VARCHAR(255),
      about_company TEXT,
      address_line1 TEXT,
      address_line2 TEXT,
      city VARCHAR(255),
      state VARCHAR(255),
      pincode VARCHAR(50),
      country VARCHAR(255),
      mobile VARCHAR(50),
      landline VARCHAR(50),
      cin_no VARCHAR(255),
      email VARCHAR(255),
      pan_no VARCHAR(255),
      tan_no VARCHAR(255),
      gst_no VARCHAR(255),
      company_category VARCHAR(255),
      company_class VARCHAR(255),
      ifsc_code VARCHAR(50),
      micr_code VARCHAR(50),
      incorporation_date VARCHAR(50),
      ratio_owned_funds VARCHAR(50),
      ratio_deposits VARCHAR(50),
      percentage_unencumbered VARCHAR(50),
      neft_alert_sms BOOLEAN DEFAULT false,
      neft_alert_mobile VARCHAR(50),
      bank_selection VARCHAR(255),
      bank_name VARCHAR(255),
      bank_ifsc VARCHAR(255),
      account_no VARCHAR(255),
      account_name VARCHAR(255)
    )`);

    const { rows: profileRows } = await pool.query("SELECT count(*) as count FROM company_profile");
    if (parseInt(profileRows[0].count) === 0) {
      await pool.query("INSERT INTO company_profile (company_name) VALUES ('VeritasCo')");
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS system_settings (
      id SERIAL PRIMARY KEY,
      settings_data JSONB DEFAULT '{}'
    )`);
    const { rows: settingsRows } = await pool.query("SELECT count(*) as count FROM system_settings");
    if (parseInt(settingsRows[0].count) === 0) {
      await pool.query("INSERT INTO system_settings (settings_data) VALUES ('{}')");
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS service_tax (
      id SERIAL PRIMARY KEY,
      tax_name VARCHAR(50) NOT NULL,
      total_percent NUMERIC(5,2) NOT NULL,
      cgst_percent NUMERIC(5,2) NOT NULL,
      sgst_percent NUMERIC(5,2) NOT NULL,
      igst_percent NUMERIC(5,2) NOT NULL,
      is_igst BOOLEAN DEFAULT FALSE,
      status VARCHAR(20) DEFAULT 'Active'
    )`);
    const { rows: taxRows } = await pool.query("SELECT count(*) as count FROM service_tax");
    if (parseInt(taxRows[0].count) === 0) {
      await pool.query(`
        INSERT INTO service_tax (tax_name, total_percent, cgst_percent, sgst_percent, igst_percent, is_igst, status)
        VALUES ('GST', 6.00, 3.00, 3.00, 0.00, false, 'Active')
      `);
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS bank_details (
      bank_code VARCHAR(50) PRIMARY KEY,
      bank_name VARCHAR(100) NOT NULL,
      ifsc_code VARCHAR(50) DEFAULT '',
      account_holder_name VARCHAR(100) DEFAULT '',
      account_number VARCHAR(100) DEFAULT '',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Seed initial banks
    const { rows: bankRows } = await pool.query("SELECT count(*) as count FROM bank_details");
    if (parseInt(bankRows[0].count) === 0) {
      const defaultBanks = [
        ['AL119', 'ICICI BANK'],
        ['AL156', 'PAYUMONEY'],
        ['EN504', 'PAYTM BANK'],
        ['EN506', 'IDSPAY BANK'],
        ['EN507', 'CASHFREE WALLET'],
        ['AL158', 'STATE BANK OF INDIA'],
        ['AL161', 'Bandhan Bank HO'],
        ['AL166', 'RBI BANK'],
        ['AL181', 'gns']
      ];
      
      for (const [code, name] of defaultBanks) {
        await pool.query(
          "INSERT INTO bank_details (bank_code, bank_name) VALUES ($1, $2)",
          [code, name]
        );
      }
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS states (
      id SERIAL PRIMARY KEY,
      state_name VARCHAR(100) UNIQUE NOT NULL,
      type VARCHAR(50) DEFAULT 'State',
      status VARCHAR(20) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Auto-add type column if missing (for seamless migration)
    try { await pool.query(`ALTER TABLE states ADD COLUMN type VARCHAR(50) DEFAULT 'State'`); } catch(e) {}

    const { rows: stateRows } = await pool.query("SELECT count(*) as count FROM states");
    if (parseInt(stateRows[0].count) === 0) {
      const defaultStates = [
        { name: 'Andhra Pradesh', type: 'State' }, { name: 'Arunachal Pradesh', type: 'State' }, { name: 'Assam', type: 'State' }, 
        { name: 'Bihar', type: 'State' }, { name: 'Chhattisgarh', type: 'State' }, { name: 'Goa', type: 'State' }, 
        { name: 'Gujarat', type: 'State' }, { name: 'Haryana', type: 'State' }, { name: 'Himachal Pradesh', type: 'State' }, 
        { name: 'Jharkhand', type: 'State' }, { name: 'Karnataka', type: 'State' }, { name: 'Kerala', type: 'State' }, 
        { name: 'Madhya Pradesh', type: 'State' }, { name: 'Maharashtra', type: 'State' }, { name: 'Manipur', type: 'State' }, 
        { name: 'Meghalaya', type: 'State' }, { name: 'Mizoram', type: 'State' }, { name: 'Nagaland', type: 'State' }, 
        { name: 'Odisha', type: 'State' }, { name: 'Punjab', type: 'State' }, { name: 'Rajasthan', type: 'State' }, 
        { name: 'Sikkim', type: 'State' }, { name: 'Tamil Nadu', type: 'State' }, { name: 'Telangana', type: 'State' }, 
        { name: 'Tripura', type: 'State' }, { name: 'Uttar Pradesh', type: 'State' }, { name: 'Uttarakhand', type: 'State' }, 
        { name: 'West Bengal', type: 'State' }, 
        { name: 'Andaman and Nicobar Islands', type: 'Union Territory' }, { name: 'Chandigarh', type: 'Union Territory' }, 
        { name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'Union Territory' }, { name: 'Lakshadweep', type: 'Union Territory' }, 
        { name: 'Delhi', type: 'Union Territory' }, { name: 'Puducherry', type: 'Union Territory' }, 
        { name: 'Ladakh', type: 'Union Territory' }, { name: 'Jammu and Kashmir', type: 'Union Territory' }
      ];
      
      for (const s of defaultStates) {
        await pool.query("INSERT INTO states (state_name, type) VALUES ($1, $2) ON CONFLICT DO NOTHING", [s.name, s.type]);
      }
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS districts (
      id SERIAL PRIMARY KEY,
      district_name VARCHAR(100) NOT NULL,
      state_id INTEGER REFERENCES states(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(district_name, state_id)
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      receiver VARCHAR(50) DEFAULT 'ALL',
      status VARCHAR(20) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS promoters (
      id SERIAL PRIMARY KEY,
      member_id VARCHAR(255) UNIQUE,
      member_name VARCHAR(255),
      din_no VARCHAR(255),
      appoint_date VARCHAR(255),
      resignation_date VARCHAR(255),
      no_of_share INTEGER,
      authorize VARCHAR(50),
      promoter_type VARCHAR(50),
      is_active_share_trf BOOLEAN DEFAULT false
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS financial_years (
      id SERIAL PRIMARY KEY,
      from_year INTEGER,
      to_year INTEGER,
      is_active BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    try {
      await pool.query("ALTER TABLE branches ADD COLUMN is_locked BOOLEAN DEFAULT false");
      await pool.query("ALTER TABLE branches ADD COLUMN is_date_locked BOOLEAN DEFAULT false");
      await pool.query("ALTER TABLE branches ADD COLUMN is_latefees_applicable BOOLEAN DEFAULT true");
      await pool.query("ALTER TABLE branches ADD COLUMN is_active_ip_address BOOLEAN DEFAULT false");
    } catch (e) {
      // Columns likely already exist
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      branch VARCHAR(255),
      type VARCHAR(255),
      opening_date VARCHAR(255),
      account_no VARCHAR(255),
      member_id VARCHAR(255),
      name VARCHAR(255),
      amount NUMERIC(15,2),
      status VARCHAR(50) DEFAULT 'Pending'
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS login_history (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      username VARCHAR(255),
      user_type VARCHAR(255),
      branch_id INTEGER,
      login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ip_address VARCHAR(255)
    )`);

    console.log("Database schema initialized successfully.");
  } catch (error) {
    console.error("Error initializing database schema:", error);
  }
}

// 🛡️ Security Middleware: Verify JWT Authentication Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied: No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Access Denied: Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// API Routes

// Secure Login Route
app.post('/api/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  const hashedPassword = hashPassword(password);

  try {
    const { rows } = await pool.query(`
      SELECT u.*, b.name as branch_name 
      FROM users u 
      LEFT JOIN branches b ON u.branch_id = b.id 
      WHERE u.username = $1 AND u.password_hash = $2
    `, [username, hashedPassword]);
    const row = rows[0];
    if (row) {
      // Record login history
      await pool.query(
        "INSERT INTO login_history (user_id, username, user_type, branch_id, ip_address) VALUES ($1, $2, $3, $4, $5)",
        [row.id, row.username, row.role, row.branch_id, req.ip || req.connection.remoteAddress]
      );

      // 🛡️ Generate a secure JWT token instead of an in-memory session
      const token = jwt.sign(
        { id: row.id, username: row.username, role: row.role, branchName: row.branch_name },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );
      
      res.json({ 
        success: true, 
        token, 
        user: { username: row.username, role: row.role, branchName: row.branch_name } 
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Secure Customer Management (Protected by middleware)
app.post('/api/customers', authenticateToken, async (req, res) => {
  const { firstName, lastName, dob, gender, aadharNumber, panNumber, phoneNumber, email, address, accountType, details } = req.body;
  const cifNumber = 'VER-' + Math.floor(100000 + Math.random() * 900000); 

  const sql = `INSERT INTO customers (cif_number, first_name, last_name, dob, gender, aadhar_number, pan_number, phone_number, email, address, account_type, details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`;
  
  try {
    await pool.query("ALTER TABLE customers ADD COLUMN IF NOT EXISTS details TEXT");
    const detailsStr = details ? JSON.stringify(details) : null;
    const result = await pool.query(sql, [cifNumber, firstName, lastName, dob, gender, aadharNumber, panNumber, phoneNumber, email, address, accountType, detailsStr]);
    const id = result.rows[0].id;
    res.json({ success: true, cifNumber, id, message: 'Customer created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Secure Branch Management (Protected by middleware)
app.get('/api/branches', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM branches ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, username, role, branch_id FROM users ORDER BY username ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login_history', authenticateToken, async (req, res) => {
  const { branch_id, user_type, user_id, from_date, to_date } = req.body;
  try {
    let query = `
      SELECT lh.*, b.name as branch_name 
      FROM login_history lh
      LEFT JOIN branches b ON lh.branch_id = b.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (branch_id && branch_id !== '0') {
      query += ` AND lh.branch_id = $${paramIndex++}`;
      params.push(branch_id);
    }
    if (user_type && user_type !== '0') {
      query += ` AND lh.user_type = $${paramIndex++}`;
      params.push(user_type);
    }
    if (user_id && user_id !== '0') {
      query += ` AND lh.user_id = $${paramIndex++}`;
      params.push(user_id);
    }
    if (from_date) {
      query += ` AND DATE(lh.login_time) >= $${paramIndex++}`;
      params.push(from_date);
    }
    if (to_date) {
      query += ` AND DATE(lh.login_time) <= $${paramIndex++}`;
      params.push(to_date);
    }

    query += ` ORDER BY lh.login_time DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Secure Profile Management (Protected by middleware)
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM company_profile ORDER BY id ASC LIMIT 1");
    if (rows.length > 0) {
      res.json({ success: true, profile: rows[0] });
    } else {
      res.json({ success: true, profile: {} });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Secure Promoter Management (Protected by middleware)
app.get('/api/promoters', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM promoters ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/promoters', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, details } = req.body;
    const memberName = `${firstName} ${lastName}`.trim();
    const memberId = Math.floor(100000 + Math.random() * 900000).toString();
    const appointDate = new Date().toLocaleDateString('en-GB');
    
    const result = await pool.query(
      "INSERT INTO promoters (member_id, member_name, din_no, appoint_date, resignation_date, no_of_share, authorize, promoter_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
      [memberId, memberName, '', appointDate, '', 0, 'No', 'Promoter']
    );
    
    res.json({ success: true, id: result.rows[0].id, cifNumber: memberId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/financial-years/next', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT from_year, to_year FROM financial_years ORDER BY to_year DESC LIMIT 1');
    if (rows.length > 0) {
      res.json({ from_year: rows[0].from_year + 1, to_year: rows[0].to_year + 1 });
    } else {
      const currentYear = new Date().getFullYear();
      res.json({ from_year: currentYear, to_year: currentYear + 1 });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/financial-years', authenticateToken, async (req, res) => {
  try {
    const { from_year, to_year } = req.body;
    await pool.query('INSERT INTO financial_years (from_year, to_year) VALUES ($1, $2)', [from_year, to_year]);
    res.json({ success: true, message: 'Financial year added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/financial-years', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM financial_years ORDER BY from_year ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/financial-years/:id/activate', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE financial_years SET is_active = false');
    await client.query('UPDATE financial_years SET is_active = true WHERE id = $1', [req.params.id]);
    await client.query('COMMIT');
    res.json({ success: true, message: 'Financial year activated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.post('/api/promoters/:id/active', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE promoters SET is_active_share_trf = false");
    await pool.query("UPDATE promoters SET is_active_share_trf = true WHERE id = $1", [id]);
    res.json({ success: true, message: 'Share transfer active member updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/promoters/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { member_name, din_no, appoint_date, resignation_date, no_of_share, authorize, promoter_type } = req.body;
  try {
    await pool.query(
      "UPDATE promoters SET member_name = $1, din_no = $2, appoint_date = $3, resignation_date = $4, no_of_share = $5, authorize = $6, promoter_type = $7 WHERE id = $8",
      [member_name, din_no, appoint_date, resignation_date, no_of_share, authorize, promoter_type, id]
    );
    res.json({ success: true, message: 'Promoter updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile', authenticateToken, async (req, res) => {
  try {
    const {
      companyName, shortName, aboutCompany, addressLine1, addressLine2,
      city, state, pincode, country, mobile, landline, cinNo, email, panNo,
      tanNo, gstNo, companyCategory, companyClass, ifscCode, micrCode,
      incorporationDate, ratioOwnedFunds, ratioDeposits, percentageUnencumbered,
      neftAlertSms, neftAlertMobile, bankSelection, bankName, bankIfsc,
      accountNo, accountName
    } = req.body;

    const sql = `
      UPDATE company_profile SET
        company_name = $1, short_name = $2, about_company = $3, address_line1 = $4,
        address_line2 = $5, city = $6, state = $7, pincode = $8, country = $9,
        mobile = $10, landline = $11, cin_no = $12, email = $13, pan_no = $14,
        tan_no = $15, gst_no = $16, company_category = $17, company_class = $18,
        ifsc_code = $19, micr_code = $20, incorporation_date = $21,
        ratio_owned_funds = $22, ratio_deposits = $23, percentage_unencumbered = $24,
        neft_alert_sms = $25, neft_alert_mobile = $26, bank_selection = $27,
        bank_name = $28, bank_ifsc = $29, account_no = $30, account_name = $31
      WHERE id = (SELECT id FROM company_profile ORDER BY id ASC LIMIT 1)
    `;
    
    await pool.query(sql, [
      companyName, shortName, aboutCompany, addressLine1, addressLine2,
      city, state, pincode, country, mobile, landline, cinNo, email, panNo,
      tanNo, gstNo, companyCategory, companyClass, ifscCode, micrCode,
      incorporationDate, ratioOwnedFunds, ratioDeposits, percentageUnencumbered,
      neftAlertSms, neftAlertMobile, bankSelection, bankName, bankIfsc,
      accountNo, accountName
    ]);
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/branches', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM branches ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/branches/locks', authenticateToken, async (req, res) => {
  const { branches } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const b of branches) {
      await client.query(
        'UPDATE branches SET is_locked = $1, is_date_locked = $2, is_latefees_applicable = $3, is_active_ip_address = $4 WHERE id = $5',
        [b.is_locked, b.is_date_locked, b.is_latefees_applicable, b.is_active_ip_address, b.id]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true, message: 'Locks updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.post('/api/branches', authenticateToken, async (req, res) => {
  const { name, code, state, address, contactName, phoneNo, mobileNo, email, pinCode } = req.body;
  
  // Auto-generate secure branch login credentials
  const cleanCode = (code || 'br').toLowerCase().replace(/[^a-z0-9]/g, '');
  const username = `${cleanCode}_${Math.floor(100 + Math.random() * 900)}`;
  const password = `VNB@${Math.floor(100000 + Math.random() * 900000)}`;
  const hashedPassword = hashPassword(password);

  try {
    const sql = `INSERT INTO branches (name, code, state, address, contact_name, phone_no, mobile_no, email, pin_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`;
    const result = await pool.query(sql, [name, code, state, address, contactName, phoneNo, mobileNo, email, pinCode]);
    const branchId = result.rows[0].id;

    // Start a transaction-like sequence (first branch, then user with linked branch_id)
    await pool.query("INSERT INTO users (username, password_hash, role, branch_id) VALUES ($1, $2, $3, $4)", [username, hashedPassword, 'Branch User', branchId]);
    
    res.json({ 
      success: true, 
      message: 'Branch and user account created successfully', 
      id: branchId,
      credentials: { username, password }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/branches/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, code, state, address, contactName, phoneNo, mobileNo, email, pinCode } = req.body;
  const sql = `UPDATE branches SET name=$1, code=$2, state=$3, address=$4, contact_name=$5, phone_no=$6, mobile_no=$7, email=$8, pin_code=$9 WHERE id=$10`;
  
  try {
    await pool.query(sql, [name, code, state, address, contactName, phoneNo, mobileNo, email, pinCode, id]);
    res.json({ success: true, message: 'Branch updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/branches/:id/password', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const newPassword = `VNB@${Math.floor(100000 + Math.random() * 900000)}`;
  const hashedPassword = hashPassword(newPassword);

  try {
    const result = await pool.query(
      "UPDATE users SET password_hash = $1 WHERE branch_id = $2 RETURNING username",
      [hashedPassword, id]
    );

    let finalUsername;
    
    if (result.rows.length === 0) {
      // The branch exists, but there's no user account for it (likely a legacy branch created before user auth was added)
      // We will create the user account for it right now!
      const branchRes = await pool.query("SELECT code FROM branches WHERE id = $1", [id]);
      if (branchRes.rows.length === 0) return res.status(404).json({ error: 'Branch not found' });
      
      const cleanCode = (branchRes.rows[0].code || 'br').toLowerCase().replace(/[^a-z0-9]/g, '');
      finalUsername = `${cleanCode}_${Math.floor(100 + Math.random() * 900)}`;
      
      await pool.query(
        "INSERT INTO users (username, password_hash, role, branch_id) VALUES ($1, $2, $3, $4)",
        [finalUsername, hashedPassword, 'Branch User', id]
      );
    } else {
      finalUsername = result.rows[0].username;
    }

    res.json({ 
      success: true, 
      message: 'Branch credentials generated successfully',
      credentials: {
        username: finalUsername,
        password: newPassword
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/eod/transactions', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM transactions WHERE status = 'Pending' ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/eod/execute', authenticateToken, async (req, res) => {
  try {
    await pool.query("UPDATE transactions SET status = 'Approved' WHERE status = 'Pending'");
    res.json({ success: true, message: 'End of Day executed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Settings Endpoints
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT settings_data FROM system_settings ORDER BY id ASC LIMIT 1");
    res.json(rows[0]?.settings_data || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', authenticateToken, async (req, res) => {
  try {
    const settingsData = req.body;
    await pool.query("UPDATE system_settings SET settings_data = $1 WHERE id = (SELECT id FROM system_settings ORDER BY id ASC LIMIT 1)", [settingsData]);
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Service Tax Endpoints
app.get('/api/servicetax', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM service_tax ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/servicetax/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { tax_name, total_percent, cgst_percent, sgst_percent, igst_percent, is_igst, status } = req.body;
    await pool.query(
      `UPDATE service_tax 
       SET tax_name = $1, total_percent = $2, cgst_percent = $3, sgst_percent = $4, igst_percent = $5, is_igst = $6, status = $7 
       WHERE id = $8`,
      [tax_name, total_percent, cgst_percent, sgst_percent, igst_percent, is_igst, status, id]
    );
    res.json({ success: true, message: 'Service tax updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Bank Details Endpoints
app.get('/api/bankdetails', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM bank_details ORDER BY bank_name ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bankdetails/:code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;
    const { rows } = await pool.query("SELECT * FROM bank_details WHERE bank_code = $1", [code]);
    if (rows.length === 0) return res.status(404).json({ error: 'Bank not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bankdetails/:code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;
    const { ifsc_code, account_holder_name, account_number } = req.body;
    await pool.query(
      `UPDATE bank_details 
       SET ifsc_code = $1, account_holder_name = $2, account_number = $3, updated_at = CURRENT_TIMESTAMP
       WHERE bank_code = $4`,
      [ifsc_code, account_holder_name, account_number, code]
    );
    res.json({ success: true, message: 'Bank details updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bankdetails', authenticateToken, async (req, res) => {
  try {
    const { bank_name, ifsc_code, account_holder_name, account_number } = req.body;
    const bank_code = 'CUST' + Date.now().toString().slice(-6);
    await pool.query(
      `INSERT INTO bank_details (bank_code, bank_name, ifsc_code, account_holder_name, account_number)
       VALUES ($1, $2, $3, $4, $5)`,
      [bank_code, bank_name, ifsc_code, account_holder_name, account_number]
    );
    res.json({ success: true, message: 'New bank added successfully', bank_code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// States Endpoints
app.get('/api/states', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM states ORDER BY state_name ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/states', authenticateToken, async (req, res) => {
  try {
    const { state_name, type, status } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO states (state_name, type, status) VALUES ($1, $2, $3) RETURNING *",
      [state_name, type || 'State', status || 'Active']
    );
    res.json({ success: true, message: 'State added successfully', state: rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(400).json({ error: 'State already exists' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/states/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { state_name, type, status } = req.body;
    await pool.query(
      "UPDATE states SET state_name = $1, type = $2, status = $3 WHERE id = $4",
      [state_name, type || 'State', status, id]
    );
    res.json({ success: true, message: 'State updated successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(400).json({ error: 'State name already exists' });
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/states/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM states WHERE id = $1", [id]);
    res.json({ success: true, message: 'State deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- DISTRICTS ---
app.get('/api/districts', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT d.*, s.state_name 
      FROM districts d 
      JOIN states s ON d.state_id = s.id 
      ORDER BY s.state_name, d.district_name
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/districts', authenticateToken, async (req, res) => {
  try {
    const { district_name, state_id, status } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO districts (district_name, state_id, status) VALUES ($1, $2, $3) RETURNING *",
      [district_name, state_id, status || 'Active']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'This district already exists in the selected state.' });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/districts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { district_name, state_id, status } = req.body;
    const { rows } = await pool.query(
      "UPDATE districts SET district_name = $1, state_id = $2, status = $3 WHERE id = $4 RETURNING *",
      [district_name, state_id, status, id]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'This district already exists in the selected state.' });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/districts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM districts WHERE id = $1", [id]);
    res.json({ success: true, message: 'District deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- NEWS ---
app.get('/api/news', authenticateToken, async (req, res) => {
  try {
    const { receiver, status } = req.query;
    let query = "SELECT * FROM news";
    let params = [];
    let conditions = [];

    if (receiver && receiver !== 'ALL' && receiver !== '-1') {
      conditions.push(`receiver IN ('ALL', $${params.length + 1})`);
      params.push(receiver);
    }
    if (status && status !== '-1') {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status === '1' ? 'Active' : 'Deactive');
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY created_at DESC";

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/news', authenticateToken, async (req, res) => {
  if (req.user.role?.includes('Branch')) return res.status(403).json({ error: 'Only admin can create news' });
  try {
    const { title, content, receiver, status } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO news (title, content, receiver, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, content, receiver || 'ALL', status || 'Active']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/news/:id', authenticateToken, async (req, res) => {
  if (req.user.role?.includes('Branch')) return res.status(403).json({ error: 'Only admin can update news' });
  try {
    const { id } = req.params;
    const { title, content, receiver, status } = req.body;
    const { rows } = await pool.query(
      "UPDATE news SET title = $1, content = $2, receiver = $3, status = $4 WHERE id = $5 RETURNING *",
      [title, content, receiver, status, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/news/:id', authenticateToken, async (req, res) => {
  if (req.user.role?.includes('Branch')) return res.status(403).json({ error: 'Only admin can delete news' });
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM news WHERE id = $1", [id]);
    res.json({ success: true, message: 'News deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Serve frontend in production
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
