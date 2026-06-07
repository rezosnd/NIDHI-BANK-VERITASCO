require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();

// 🛡️ Security Middleware: Helmet sets various HTTP headers to protect the app
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:5000", "ws://localhost:5173", "http://localhost:5173", "ws://127.0.0.1:5173", "http://127.0.0.1:5173"]
    }
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
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

// Helper to hash passwords using bcrypt
async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
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

    try {
      await pool.query(`ALTER TABLE users ADD COLUMN service_center_id INTEGER`);
    } catch(e) {}

    try { await pool.query(`ALTER TABLE users ADD COLUMN contact_name VARCHAR(255)`); } catch(e) {}
    try { await pool.query(`ALTER TABLE users ADD COLUMN mobile_no VARCHAR(255)`); } catch(e) {}
    try { await pool.query(`ALTER TABLE users ADD COLUMN phone_no VARCHAR(255)`); } catch(e) {}
    try { await pool.query(`ALTER TABLE users ADD COLUMN email VARCHAR(255)`); } catch(e) {}
    try { await pool.query(`ALTER TABLE users ADD COLUMN address TEXT`); } catch(e) {}
    try { await pool.query(`ALTER TABLE users ADD COLUMN pin_code VARCHAR(50)`); } catch(e) {}
    try { await pool.query(`ALTER TABLE users ADD COLUMN bank_account_no VARCHAR(50)`); } catch(e) {}
    try { await pool.query(`ALTER TABLE users ADD COLUMN bank_account_name VARCHAR(255)`); } catch(e) {}
    try { await pool.query(`ALTER TABLE users ADD COLUMN bank_name VARCHAR(255)`); } catch(e) {}
    try { await pool.query(`ALTER TABLE users ADD COLUMN bank_ifsc VARCHAR(20)`); } catch(e) {}
    try { await pool.query(`ALTER TABLE users ADD COLUMN bank_branch_name VARCHAR(255)`); } catch(e) {}
    try { await pool.query(`ALTER TABLE users ADD COLUMN min_balance NUMERIC(18,2) DEFAULT 0`); } catch(e) {}
    try { await pool.query(`ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true`); } catch(e) {}

    // Always ensure the admin user exists (ON CONFLICT DO NOTHING = safe to run every startup)
    await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'Admin') ON CONFLICT (username) DO NOTHING",
      ['admin', await hashPassword('Tiger^123')]
    );

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

    await pool.query(`CREATE TABLE IF NOT EXISTS branch_ip_addresses (
      id SERIAL PRIMARY KEY,
      branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
      ip_address VARCHAR(45) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS service_centers (
      id SERIAL PRIMARY KEY,
      branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(2) NOT NULL,
      state_id INTEGER REFERENCES states(id) ON DELETE SET NULL,
      address TEXT,
      contact_name VARCHAR(255),
      phone_no VARCHAR(15),
      mobile_no VARCHAR(15),
      email VARCHAR(255),
      pin_code VARCHAR(10),
      display_on_branch_page BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    try {
      await pool.query("ALTER TABLE service_centers ADD COLUMN display_on_branch_page BOOLEAN DEFAULT true");
    } catch(e) {}

    await pool.query(`CREATE TABLE IF NOT EXISTS balance_requests (
      id SERIAL PRIMARY KEY,
      account_name VARCHAR(255),
      order_id VARCHAR(255),
      amount NUMERIC(15,2),
      request_date DATE DEFAULT CURRENT_DATE,
      status VARCHAR(50) DEFAULT 'Pending',
      approved_date DATE,
      bank_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS online_requests (
      id SERIAL PRIMARY KEY,
      branch_name VARCHAR(255),
      member_name VARCHAR(255),
      contact_no VARCHAR(50),
      email VARCHAR(255),
      city VARCHAR(255),
      plan_name VARCHAR(255),
      reference_no VARCHAR(255),
      request_date DATE DEFAULT CURRENT_DATE,
      status VARCHAR(50) DEFAULT 'Pending',
      approved_date DATE,
      remark TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS customer_complaints (
      id SERIAL PRIMARY KEY,
      branch_id INTEGER REFERENCES branches(id),
      name VARCHAR(255),
      mobile VARCHAR(50),
      email VARCHAR(255),
      city VARCHAR(255),
      reference_id VARCHAR(100),
      service_type VARCHAR(100),
      status VARCHAR(50) DEFAULT 'Open',
      issue_date DATE DEFAULT CURRENT_DATE,
      description TEXT,
      resolution_remark TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS customer_feedback (
      id SERIAL PRIMARY KEY,
      branch_id INTEGER REFERENCES branches(id),
      name VARCHAR(255),
      mobile VARCHAR(50),
      email VARCHAR(255),
      city VARCHAR(255),
      reference_id VARCHAR(100),
      service_type VARCHAR(100),
      rating INTEGER DEFAULT 5,
      issue_date DATE DEFAULT CURRENT_DATE,
      feedback_text TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS share_transfer_requests (
      id SERIAL PRIMARY KEY,
      branch_id INTEGER REFERENCES branches(id),
      request_date DATE DEFAULT CURRENT_DATE,
      transferor_id VARCHAR(100),
      transferor_name VARCHAR(255),
      transferee_id VARCHAR(100),
      transferee_name VARCHAR(255),
      no_of_shares INTEGER,
      transfer_amount NUMERIC(15,2),
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS service_center_debit_requests (
      id SERIAL PRIMARY KEY,
      branch_id INTEGER REFERENCES branches(id),
      service_center_id INTEGER REFERENCES service_centers(id),
      request_date DATE DEFAULT CURRENT_DATE,
      account_no VARCHAR(255),
      member_name VARCHAR(255),
      amount NUMERIC(15,2),
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS member_requests (
      id SERIAL PRIMARY KEY,
      request_no VARCHAR(255) UNIQUE,
      request_date DATE DEFAULT CURRENT_DATE,
      branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
      service_center_id INTEGER REFERENCES service_centers(id) ON DELETE SET NULL,
      member_id VARCHAR(255),
      member_name VARCHAR(255),
      record_type VARCHAR(255),
      request_type VARCHAR(255),
      request_details TEXT,
      created_by VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS share_applications (
      id SERIAL PRIMARY KEY,
      application_no VARCHAR(255) UNIQUE,
      application_date DATE DEFAULT CURRENT_DATE,
      branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
      member_id VARCHAR(255),
      member_name VARCHAR(255),
      share_type VARCHAR(255),
      no_of_shares INTEGER,
      amount NUMERIC(15,2),
      pay_mode VARCHAR(50),
      status VARCHAR(50) DEFAULT 'Pending',
      created_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS calendar_events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      event_date DATE NOT NULL,
      event_color VARCHAR(50) DEFAULT '#2563eb',
      created_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS company_events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      event_date DATE NOT NULL,
      event_time VARCHAR(20),
      venue VARCHAR(255),
      organizer VARCHAR(255),
      event_type VARCHAR(100) DEFAULT 'General',
      status VARCHAR(50) DEFAULT 'Upcoming',
      created_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS holidays (
      id SERIAL PRIMARY KEY,
      holiday_name VARCHAR(255) NOT NULL,
      holiday_date DATE NOT NULL,
      holiday_type VARCHAR(100) DEFAULT 'Public',
      description TEXT,
      status VARCHAR(50) DEFAULT 'Active',
      created_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

// 🛡️ Role-Based Access: Admin only middleware
function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access Denied: Admin privileges required' });
  }
  next();
}

// 🛡️ Get real client IP — do NOT blindly trust x-forwarded-for (spoofable)
function getClientIp(req) {
  // Only trust x-forwarded-for if explicitly configured (e.g., behind a reverse proxy)
  // For direct connections, use the socket address
  return req.socket.remoteAddress || req.ip || 'unknown';
}

// 🛡️ Validate IP address format (IPv4 and IPv6)
function isValidIp(ip) {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6 = /^[0-9a-fA-F:]{2,39}$/;
  return ipv4.test(ip) || ipv6.test(ip);
}

// API Routes

// Secure Login Route
app.post('/api/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  try {
    const { rows } = await pool.query(`
      SELECT u.*, b.name as branch_name, b.is_active_ip_address 
      FROM users u 
      LEFT JOIN branches b ON u.branch_id = b.id 
      WHERE u.username = $1
    `, [username]);
    const row = rows[0];
    if (row && await bcrypt.compare(password, row.password_hash)) {
      const clientIp = getClientIp(req);

      // 🛡️ Security Feature: Enforce IP Whitelisting for Branch Users
      if (row.role === 'Branch User' && row.is_active_ip_address) {
        const ipCheck = await pool.query("SELECT * FROM branch_ip_addresses WHERE branch_id = $1 AND ip_address = $2", [row.branch_id, clientIp]);
        if (ipCheck.rows.length === 0) {
           return res.status(403).json({ success: false, message: 'Access Denied: You are not logging in from a whitelisted branch network.' });
        }
      }

      // Record login history
      await pool.query(
        "INSERT INTO login_history (user_id, username, user_type, branch_id, ip_address) VALUES ($1, $2, $3, $4, $5)",
        [row.id, row.username, row.role, row.branch_id, clientIp]
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

app.get('/api/kyc/verify/:memberId', authenticateToken, async (req, res) => {
  const { memberId } = req.params;
  const { documentId } = req.query;
  
  try {
    const { rows } = await pool.query("SELECT * FROM customers WHERE cif_number = $1", [memberId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Member ID not found' });
    }
    const customer = rows[0];
    let details = {};
    try { details = JSON.parse(customer.details) || {}; } catch(e) {}
    
    let isVerified = false;
    let documentName = '';
    
    if (documentId === '32') { // Aadhar
      documentName = 'Aadhar Card';
      if (customer.aadhar_number || details.aadhar || details.kycAadhaar) isVerified = true;
    } else if (documentId === '7') { // PAN
      documentName = 'PAN Card';
      if (customer.pan_number || details.panNo || details.kycPan) isVerified = true;
    } else if (documentId === '10') { // Driving License
      documentName = 'Driving License';
      if (details.kycDriving || details.drivingLicense) isVerified = true;
    } else if (documentId === '6') { // Voter ID
      documentName = 'Voter ID Card';
      if (details.kycVoterId || details.voterId) isVerified = true;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid Document ID' });
    }
    
    if (isVerified) {
      res.json({ success: true, message: `KYC for ${documentName} is Verified`, memberName: `${customer.first_name} ${customer.last_name}` });
    } else {
      res.json({ success: false, message: `${documentName} details not found for this member.` });
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/kyc/pending-documents', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, cif_number, first_name, last_name, phone_number, created_at, aadhar_number, pan_number, details FROM customers ORDER BY created_at DESC");
    const formattedData = rows.map((customer, index) => {
      let details = {};
      try { details = JSON.parse(customer.details) || {}; } catch(e) {}
      
      let uploadedKYC = [];
      if (details.kycPassport) uploadedKYC.push('Passport');
      if (details.kycVoterId || details.voterId) uploadedKYC.push('Voter ID');
      if (details.kycPan || customer.pan_number || details.panNo) uploadedKYC.push('PAN Card');
      if (details.kycAadhaar || customer.aadhar_number || details.aadhar) uploadedKYC.push('Aadhaar Card');
      if (details.kycDriving || details.drivingLicense) uploadedKYC.push('Driving License');
      if (details.kycRation) uploadedKYC.push('Ration Card');
      if (details.kycElec) uploadedKYC.push('Electricity Bill');
      // Add Photo and Signature as they seem to be standard
      uploadedKYC.unshift('Photo', 'Signature1'); 
      
      // Remove duplicates
      uploadedKYC = [...new Set(uploadedKYC)];
      
      return {
        id: customer.id,
        slNo: index + 1,
        memberId: customer.cif_number,
        name: `${customer.first_name} ${customer.last_name}`.trim(),
        regDate: new Date(customer.created_at || Date.now()).toLocaleDateString('en-GB'),
        contactNo: customer.phone_number || 'N/A',
        totalKyc: uploadedKYC.length, 
        uploadedKyc: uploadedKYC.join(','),
        uploadedKycCount: uploadedKYC.length,
        status: uploadedKYC.length >= 4 ? 'APPROVED' : 'Pending',
      };
    });
    
    res.json(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Secure Branch Management (Protected by middleware)
app.get('/api/branches', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM branches ORDER BY name ASC");
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

app.post('/api/login_history', authenticateToken, authorizeAdmin, async (req, res) => {
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

    // Safety cap: never return more than 500 rows to prevent memory exhaustion
    query += ` ORDER BY lh.login_time DESC LIMIT 500`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
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

// (Duplicate GET /api/branches removed — was registered twice, first one at line ~479 is canonical)

app.put('/api/branches/locks', authenticateToken, authorizeAdmin, async (req, res) => {
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

app.get('/api/branch-ips', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT b_ip.id, b_ip.ip_address, b_ip.created_at, b.name as branch_name, b.code as branch_code 
      FROM branch_ip_addresses b_ip
      JOIN branches b ON b.id = b_ip.branch_id
      ORDER BY b_ip.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/branch-ips', authenticateToken, authorizeAdmin, async (req, res) => {
  const { branch_id, ip_address } = req.body;
  if (!branch_id || !ip_address) return res.status(400).json({ success: false, message: 'Branch ID and IP Address are required' });
  // 🛡️ Validate IP address format before storing
  if (!isValidIp(ip_address.trim())) {
    return res.status(400).json({ success: false, message: 'Invalid IP address format. Use IPv4 (e.g., 192.168.1.1) or IPv6.' });
  }
  try {
    const result = await pool.query(
      "INSERT INTO branch_ip_addresses (branch_id, ip_address) VALUES ($1, $2) RETURNING id",
      [branch_id, ip_address.trim()]
    );
    res.json({ success: true, message: 'IP Address added successfully', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/branch-ips/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM branch_ip_addresses WHERE id = $1", [id]);
    res.json({ success: true, message: 'IP Address removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/branches', authenticateToken, authorizeAdmin, async (req, res) => {
  const { name, code, state, address, contactName, phoneNo, mobileNo, email, pinCode } = req.body;
  
  // Auto-generate secure branch login credentials
  const cleanCode = (code || 'br').toLowerCase().replace(/[^a-z0-9]/g, '');
  const username = `${cleanCode}_${Math.floor(100 + Math.random() * 900)}`;
  const password = `VNB@${Math.floor(100000 + Math.random() * 900000)}`;
  const hashedPassword = await hashPassword(password); // 🛡️ FIX: was missing await → stored Promise not hash

  try {
    const sql = `INSERT INTO branches (name, code, state, address, contact_name, phone_no, mobile_no, email, pin_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`;
    const result = await pool.query(sql, [name, code, state, address, contactName, phoneNo, mobileNo, email, pinCode]);
    const branchId = result.rows[0].id;

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

app.put('/api/branches/:id', authenticateToken, authorizeAdmin, async (req, res) => {
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

app.put('/api/branches/:id/password', authenticateToken, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const newPassword = `VNB@${Math.floor(100000 + Math.random() * 900000)}`;
  const hashedPassword = await hashPassword(newPassword); // 🛡️ FIX: was missing await

  try {
    const result = await pool.query(
      "UPDATE users SET password_hash = $1 WHERE branch_id = $2 RETURNING username",
      [hashedPassword, id]
    );

    let finalUsername;
    
    if (result.rows.length === 0) {
      const branchRes = await pool.query("SELECT code FROM branches WHERE id = $1", [id]);
      if (branchRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Branch not found' });
      
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
    res.status(500).json({ success: false, message: err.message });
  }
});

// Service Centers Endpoints
app.get('/api/service-centers', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM service_centers ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/service-centers', authenticateToken, async (req, res) => {
  const { branch_id, name, code, state_id, address, contact_name, phone_no, mobile_no, email, pin_code, display_on_branch_page } = req.body;
  try {
    const sql = `INSERT INTO service_centers (branch_id, name, code, state_id, address, contact_name, phone_no, mobile_no, email, pin_code, display_on_branch_page) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`;
    const result = await pool.query(sql, [branch_id, name, code, state_id || null, address, contact_name, phone_no, mobile_no, email, pin_code, display_on_branch_page !== false]);
    res.json({ success: true, message: 'Service Center created successfully', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/service-centers/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { branch_id, name, code, state_id, address, contact_name, phone_no, mobile_no, email, pin_code, display_on_branch_page } = req.body;
  try {
    const sql = `UPDATE service_centers SET branch_id=$1, name=$2, code=$3, state_id=$4, address=$5, contact_name=$6, phone_no=$7, mobile_no=$8, email=$9, pin_code=$10, display_on_branch_page=$11 WHERE id=$12`;
    await pool.query(sql, [branch_id, name, code, state_id || null, address, contact_name, phone_no, mobile_no, email, pin_code, display_on_branch_page !== false, id]);
    res.json({ success: true, message: 'Service Center updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/service-centers/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM service_centers WHERE id = $1", [id]);
    res.json({ success: true, message: 'Service Center deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create Service Center User
app.post('/api/service-center-users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { branch_id, service_center_id, contact_name, mobile_no, phone_no, email, address, pin_code,
            bank_account_no, bank_account_name, bank_name, bank_ifsc, bank_branch_name, min_balance,
            username, password, is_active } = req.body;
    
    // Check if username exists
    const userCheck = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const hashedPassword = await hashPassword(password); // 🛡️ FIX: was missing await
    
    await pool.query(
      `INSERT INTO users (username, password_hash, role, branch_id, service_center_id, contact_name, mobile_no, phone_no, email, address, pin_code, bank_account_no, bank_account_name, bank_name, bank_ifsc, bank_branch_name, min_balance, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [username, hashedPassword, 'Service Center User', branch_id, service_center_id, contact_name, mobile_no, phone_no, email, address, pin_code,
       bank_account_no || null, bank_account_name || null, bank_name || null, bank_ifsc || null, bank_branch_name || null, min_balance || 0, is_active !== false]
    );

    res.json({ success: true, message: 'Service Center User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update Service Center User
app.put('/api/service-center-users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_id, service_center_id, contact_name, mobile_no, phone_no, email, address, pin_code,
            bank_account_no, bank_account_name, bank_name, bank_ifsc, bank_branch_name, min_balance,
            password, username, is_active } = req.body;
    
    let sql = `UPDATE users SET branch_id=$1, service_center_id=$2, contact_name=$3, mobile_no=$4, phone_no=$5, email=$6, address=$7, pin_code=$8, bank_account_no=$9, bank_account_name=$10, bank_name=$11, bank_ifsc=$12, bank_branch_name=$13, min_balance=$14, is_active=$15`;
    let params = [branch_id, service_center_id, contact_name, mobile_no, phone_no, email, address, pin_code,
                  bank_account_no || null, bank_account_name || null, bank_name || null, bank_ifsc || null, bank_branch_name || null, min_balance || 0, is_active !== false];
    let index = 16;

    if (username && username.trim() !== '') {
      sql += `, username=$${index}`;
      params.push(username.trim());
      index++;
    }

    if (password && password.trim() !== '') {
      sql += `, password_hash=$${index}`;
      params.push(await hashPassword(password)); // 🛡️ FIX: was missing await
      index++;
    }

    sql += ` WHERE id=$${index} AND role='Service Center User'`;
    params.push(id);

    await pool.query(sql, params);
    res.json({ success: true, message: 'Service Center User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all Service Center Users
app.get('/api/service-center-users', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id as user_id, u.username, u.role, u.branch_id, u.service_center_id, 
             u.contact_name, u.mobile_no, u.phone_no, u.email, u.address, u.pin_code,
             u.bank_account_no, u.bank_account_name, u.bank_name, u.bank_ifsc, u.bank_branch_name, u.min_balance,
             u.is_active,
             sc.name as service_center_name, sc.code as service_center_code,
             b.name as branch_name
      FROM users u 
      LEFT JOIN service_centers sc ON u.service_center_id = sc.id 
      LEFT JOIN branches b ON u.branch_id = b.id
      WHERE u.role = 'Service Center User'
      ORDER BY u.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Service Center User
app.delete('/api/service-center-users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1 AND role = 'Service Center User'", [id]);
    res.json({ success: true, message: 'Service Center User deleted successfully' });
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
// Customer Complaints Report
app.post('/api/customer-complaints/search', authenticateToken, async (req, res) => {
  try {
    const { branch_id, search_field, search_val, service_type, status, from_date, to_date } = req.body;
    
    let query = `
      SELECT c.*, b.name as branch_name 
      FROM customer_complaints c
      LEFT JOIN branches b ON c.branch_id = b.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Enforce branch_id restriction for Branch Users
    if (req.user.role === 'Branch User') {
      query += ` AND c.branch_id = $${paramIndex++}`;
      params.push(req.user.branchId);
    } else if (branch_id && branch_id !== '0') {
      query += ` AND c.branch_id = $${paramIndex++}`;
      params.push(branch_id);
    }

    if (search_field && search_val) {
      if (search_field === '2') { query += ` AND c.name ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } // Name
      else if (search_field === '3') { query += ` AND c.mobile ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } // Mobile
      else if (search_field === '4') { query += ` AND c.email ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } // E-mail
      else if (search_field === '5') { query += ` AND c.city ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } // City
      else if (search_field === '10') { query += ` AND c.reference_id ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } // Reference Id
    }

    if (service_type && service_type !== '0') {
      query += ` AND c.service_type = $${paramIndex++}`;
      params.push(service_type);
    }

    if (status && status !== '-1') {
      let statusStr = 'Open';
      if(status === '0') statusStr = 'Open';
      else if(status === '1') statusStr = 'Pending';
      else if(status === '2') statusStr = 'Closed';
      else if(status === '3') statusStr = 'Waiting on Customer';
      
      query += ` AND c.status = $${paramIndex++}`;
      params.push(statusStr);
    }

    if (from_date) {
      query += ` AND DATE(c.issue_date) >= $${paramIndex++}`;
      params.push(from_date);
    }
    if (to_date) {
      query += ` AND DATE(c.issue_date) <= $${paramIndex++}`;
      params.push(to_date);
    }

    query += ` ORDER BY c.issue_date DESC LIMIT 500`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Customer Complaint Status
app.put('/api/customer-complaints/:id/status', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_remark } = req.body;
    
    await pool.query(
      "UPDATE customer_complaints SET status = $1, resolution_remark = $2 WHERE id = $3",
      [status, resolution_remark, id]
    );
    res.json({ success: true, message: 'Complaint updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Customer Feedback Report
app.post('/api/customer-feedback/search', authenticateToken, async (req, res) => {
  try {
    const { branch_id, search_field, search_val, service_type, from_date, to_date } = req.body;
    
    let query = `
      SELECT f.*, b.name as branch_name 
      FROM customer_feedback f
      LEFT JOIN branches b ON f.branch_id = b.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Enforce branch_id restriction for Branch Users
    if (req.user.role === 'Branch User') {
      query += ` AND f.branch_id = $${paramIndex++}`;
      params.push(req.user.branchId);
    } else if (branch_id && branch_id !== '0') {
      query += ` AND f.branch_id = $${paramIndex++}`;
      params.push(branch_id);
    }

    if (search_field && search_val) {
      if (search_field === '2') { query += ` AND f.name ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } // Name
      else if (search_field === '3') { query += ` AND f.mobile ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } // Mobile
      else if (search_field === '4') { query += ` AND f.email ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } // E-mail
      else if (search_field === '5') { query += ` AND f.city ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } // City
      else if (search_field === '10') { query += ` AND f.reference_id ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } // Reference Id
    }

    if (service_type && service_type !== '0') {
      query += ` AND f.service_type = $${paramIndex++}`;
      params.push(service_type);
    }

    if (from_date) {
      query += ` AND DATE(f.issue_date) >= $${paramIndex++}`;
      params.push(from_date);
    }
    if (to_date) {
      query += ` AND DATE(f.issue_date) <= $${paramIndex++}`;
      params.push(to_date);
    }

    query += ` ORDER BY f.issue_date DESC LIMIT 500`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Member Requests Enquiry
app.post('/api/member-requests/search', authenticateToken, async (req, res) => {
  try {
    const { branch_id, service_center_id, search_field, search_val, from_date, to_date, status } = req.body;
    let query = `
      SELECT m.*, b.name as branch_name, s.name as service_center_name 
      FROM member_requests m
      LEFT JOIN branches b ON m.branch_id = b.id
      LEFT JOIN service_centers s ON m.service_center_id = s.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Enforce branch_id restriction for Branch Users
    if (req.user.role === 'Branch User') {
      query += ` AND m.branch_id = $${paramIndex++}`;
      params.push(req.user.branchId);
    } else if (branch_id && branch_id !== '0') {
      query += ` AND m.branch_id = $${paramIndex++}`;
      params.push(branch_id);
    }

    if (service_center_id && service_center_id !== '0') {
      query += ` AND m.service_center_id = $${paramIndex++}`;
      params.push(service_center_id);
    }

    if (search_field && search_val) {
      if (search_field === '1') { query += ` AND m.member_id ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); }
      else if (search_field === '2') { query += ` AND m.member_name ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); }
      else if (search_field === '3') { query += ` AND m.request_no ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); }
    }

    if (from_date) { query += ` AND m.request_date >= $${paramIndex++}`; params.push(from_date); }
    if (to_date) { query += ` AND m.request_date <= $${paramIndex++}`; params.push(to_date); }
    
    if (status && status !== '6') {
      let statusStr = 'Pending';
      if (status === '0') statusStr = 'Pending'; // "Not Approved" in UI
      if (status === '1') statusStr = 'Approved';
      if (status === '3') statusStr = 'Reject';
      query += ` AND m.status = $${paramIndex++}`;
      params.push(statusStr);
    }

    query += ` ORDER BY m.request_date DESC LIMIT 500`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Share Applications
app.post('/api/share-applications/search', authenticateToken, async (req, res) => {
  try {
    const { branch_id, search_field, search_val, from_date, to_date, status } = req.body;
    let query = `
      SELECT s.*, b.name as branch_name 
      FROM share_applications s
      LEFT JOIN branches b ON s.branch_id = b.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (req.user.role === 'Branch User') {
      query += ` AND s.branch_id = $${paramIndex++}`;
      params.push(req.user.branchId);
    } else if (branch_id && branch_id !== '0') {
      query += ` AND s.branch_id = $${paramIndex++}`;
      params.push(branch_id);
    }

    if (search_field && search_val) {
      if (search_field === '1') { query += ` AND s.member_id ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); }
      else if (search_field === '2') { query += ` AND s.member_name ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); }
    }

    if (from_date) { query += ` AND s.application_date >= $${paramIndex++}`; params.push(from_date); }
    if (to_date) { query += ` AND s.application_date <= $${paramIndex++}`; params.push(to_date); }
    
    if (status && status !== '6') {
      let statusStr = 'Pending';
      if (status === '0') statusStr = 'Pending';
      if (status === '1') statusStr = 'Approved';
      if (status === '3') statusStr = 'Reject';
      query += ` AND s.status = $${paramIndex++}`;
      params.push(statusStr);
    }

    query += ` ORDER BY s.application_date DESC LIMIT 500`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Calendar Events
app.get('/api/calendar-events', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM calendar_events ORDER BY event_date ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/calendar-events', authenticateToken, async (req, res) => {
  try {
    const { title, description, event_date, event_color } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO calendar_events (title, description, event_date, event_color, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, event_date, event_color || '#2563eb', req.user.username]
    );
    res.json({ success: true, event: rows[0], message: 'Event added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/calendar-events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM calendar_events WHERE id = $1", [id]);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ===================== Company Events =====================
app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM company_events ORDER BY event_date ASC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const { title, description, event_date, event_time, venue, organizer, event_type } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO company_events (title, description, event_date, event_time, venue, organizer, event_type, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, event_date, event_time, venue, organizer, event_type || 'General', req.user.username]
    );
    res.json({ success: true, event: rows[0], message: 'Event created successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_date, event_time, venue, organizer, event_type, status } = req.body;
    await pool.query(
      `UPDATE company_events SET title=$1, description=$2, event_date=$3, event_time=$4, venue=$5, organizer=$6, event_type=$7, status=$8 WHERE id=$9`,
      [title, description, event_date, event_time, venue, organizer, event_type, status, id]
    );
    res.json({ success: true, message: 'Event updated successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM company_events WHERE id = $1", [req.params.id]);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== Holidays =====================
app.get('/api/holidays', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM holidays ORDER BY holiday_date ASC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/holidays', authenticateToken, async (req, res) => {
  try {
    const { holiday_name, holiday_date, holiday_type, description } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO holidays (holiday_name, holiday_date, holiday_type, description, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [holiday_name, holiday_date, holiday_type || 'Public', description, req.user.username]
    );
    res.json({ success: true, holiday: rows[0], message: 'Holiday added successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/holidays/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { holiday_name, holiday_date, holiday_type, description, status } = req.body;
    await pool.query(
      `UPDATE holidays SET holiday_name=$1, holiday_date=$2, holiday_type=$3, description=$4, status=$5 WHERE id=$6`,
      [holiday_name, holiday_date, holiday_type, description, status, id]
    );
    res.json({ success: true, message: 'Holiday updated successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/holidays/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM holidays WHERE id = $1", [req.params.id]);
    res.json({ success: true, message: 'Holiday deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Unify Requests for "Assign Online Request"
app.post('/api/all-requests/search', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { branch_id, communication_type, search_field, search_val, service_type, from_date, to_date } = req.body;
    
    let queries = [];
    let params = [];
    let paramIndex = 1;

    // We build the WHERE clause based on filters, making sure it applies to all tables
    let whereClause = "WHERE 1=1";
    
    if (branch_id && branch_id !== '0') {
      whereClause += ` AND branch_filter = $${paramIndex++}`;
      params.push(branch_id);
    }
    if (service_type && service_type !== '0') {
      whereClause += ` AND service_type = $${paramIndex++}`;
      params.push(service_type);
    }
    if (from_date) {
      whereClause += ` AND req_date >= $${paramIndex++}`;
      params.push(from_date);
    }
    if (to_date) {
      whereClause += ` AND req_date <= $${paramIndex++}`;
      params.push(to_date);
    }
    if (search_field && search_val) {
      if (search_field === '2') { whereClause += ` AND name ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); }
      else if (search_field === '3') { whereClause += ` AND mobile ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); }
      else if (search_field === '4') { whereClause += ` AND email ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); }
      else if (search_field === '5') { whereClause += ` AND city ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); }
      else if (search_field === '10') { whereClause += ` AND reference_id ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); }
    }

    const complaintQuery = `
      SELECT id, 'complaint' as table_type, branch_id::text as branch_filter, b.name as branch_name, 
             name, mobile, email, city, reference_id, service_type, status, issue_date as req_date, description as remark
      FROM customer_complaints c LEFT JOIN branches b ON c.branch_id = b.id
    `;
    const feedbackQuery = `
      SELECT id, 'feedback' as table_type, branch_id::text as branch_filter, b.name as branch_name, 
             name, mobile, email, city, reference_id, service_type, 'Feedback' as status, issue_date as req_date, feedback_text as remark
      FROM customer_feedback f LEFT JOIN branches b ON f.branch_id = b.id
    `;
    const inquiryQuery = `
      SELECT o.id, 'inquiry' as table_type, b.id::text as branch_filter, o.branch_name, 
             member_name as name, contact_no as mobile, email, city, reference_no as reference_id, plan_name as service_type, status, request_date as req_date, remark
      FROM online_requests o LEFT JOIN branches b ON o.branch_name = b.name
    `;

    if (communication_type === '1' || communication_type === '0') queries.push(`SELECT * FROM (${complaintQuery}) as sq1 ${whereClause}`);
    if (communication_type === '2' || communication_type === '0') queries.push(`SELECT * FROM (${inquiryQuery}) as sq2 ${whereClause}`);
    if (communication_type === '3' || communication_type === '0') queries.push(`SELECT * FROM (${feedbackQuery}) as sq3 ${whereClause}`);

    if (queries.length === 0) return res.json([]);

    const finalQuery = queries.join(" UNION ALL ") + " ORDER BY req_date DESC";
    const { rows } = await pool.query(finalQuery, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Assign Requests
app.post('/api/all-requests/assign', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { requests, target_branch_id } = req.body;
    
    // Fetch branch name
    const branchRes = await pool.query("SELECT name FROM branches WHERE id = $1", [target_branch_id]);
    if (branchRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Branch not found' });
    const targetBranchName = branchRes.rows[0].name;

    for (let reqData of requests) {
      if (reqData.table_type === 'complaint') {
        await pool.query("UPDATE customer_complaints SET branch_id = $1 WHERE id = $2", [target_branch_id, reqData.id]);
      } else if (reqData.table_type === 'feedback') {
        await pool.query("UPDATE customer_feedback SET branch_id = $1 WHERE id = $2", [target_branch_id, reqData.id]);
      } else if (reqData.table_type === 'inquiry') {
        await pool.query("UPDATE online_requests SET branch_name = $1 WHERE id = $2", [targetBranchName, reqData.id]);
      }
    }
    
    res.json({ success: true, message: 'Requests successfully assigned.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Approve/Reject Transactions
app.post('/api/transactions/pending', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { date } = req.body;
    let query = "SELECT * FROM transactions WHERE status = 'Pending'";
    const params = [];
    
    if (date) {
      // The opening_date column is a VARCHAR in the schema, we might need a simple ILIKE or Exact match depending on format
      query += " AND opening_date = $1";
      params.push(date);
    }
    
    query += " ORDER BY id DESC";
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/transactions/status', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { ids, status } = req.body; // status can be 'Approved' or 'Rejected'
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    // In a real app, you would use ANY($1) instead of mapping dynamically, but this works universally
    const query = `UPDATE transactions SET status = $1 WHERE id = ANY($2::int[])`;
    await pool.query(query, [status, ids]);
    
    res.json({ success: true, message: `Successfully ${status.toLowerCase()} ${ids.length} transactions.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Share Transfer Request
app.post('/api/share-transfers/search', authenticateToken, async (req, res) => {
  try {
    const { branch_id, search_val, from_date, to_date } = req.body;
    let query = `
      SELECT s.*, b.name as branch_name 
      FROM share_transfer_requests s
      LEFT JOIN branches b ON s.branch_id = b.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (req.user.role === 'Branch User') {
      query += ` AND s.branch_id = $${paramIndex++}`;
      params.push(req.user.branchId);
    } else if (branch_id && branch_id !== '0') {
      query += ` AND s.branch_id = $${paramIndex++}`;
      params.push(branch_id);
    }

    if (search_val) {
      query += ` AND (s.transferor_name ILIKE $${paramIndex} OR s.transferee_name ILIKE $${paramIndex} OR s.transferor_id ILIKE $${paramIndex} OR s.transferee_id ILIKE $${paramIndex})`;
      params.push('%' + search_val + '%');
      paramIndex++;
    }

    if (from_date) {
      query += ` AND DATE(s.request_date) >= $${paramIndex++}`;
      params.push(from_date);
    }
    if (to_date) {
      query += ` AND DATE(s.request_date) <= $${paramIndex++}`;
      params.push(to_date);
    }

    query += ` ORDER BY s.request_date DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/share-transfers/status', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { ids, status } = req.body; 
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const query = `UPDATE share_transfer_requests SET status = $1 WHERE id = ANY($2::int[])`;
    await pool.query(query, [status, ids]);
    
    res.json({ success: true, message: `Successfully ${status.toLowerCase()} ${ids.length} share transfer requests.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Debit Request Service Center
app.post('/api/debit-requests/search', authenticateToken, async (req, res) => {
  try {
    const { branch_id, service_center_id, from_date, to_date, status } = req.body;
    let query = `
      SELECT d.*, b.name as branch_name, s.name as service_center_name
      FROM service_center_debit_requests d
      LEFT JOIN branches b ON d.branch_id = b.id
      LEFT JOIN service_centers s ON d.service_center_id = s.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (req.user.role === 'Branch User') {
      query += ` AND d.branch_id = $${paramIndex++}`;
      params.push(req.user.branchId);
    } else if (branch_id && branch_id !== '0') {
      query += ` AND d.branch_id = $${paramIndex++}`;
      params.push(branch_id);
    }

    if (service_center_id && service_center_id !== '0') {
      query += ` AND d.service_center_id = $${paramIndex++}`;
      params.push(service_center_id);
    }

    if (from_date) {
      query += ` AND DATE(d.request_date) >= $${paramIndex++}`;
      params.push(from_date);
    }
    if (to_date) {
      query += ` AND DATE(d.request_date) <= $${paramIndex++}`;
      params.push(to_date);
    }
    
    // 0 = Not Approved (Pending), 1 = Approved, 2 = Reject
    if (status === '0') {
      query += ` AND d.status = 'Pending'`;
    } else if (status === '1') {
      query += ` AND d.status = 'Approved'`;
    } else if (status === '2') {
      query += ` AND d.status = 'Rejected'`;
    }

    query += ` ORDER BY d.request_date DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/debit-requests/status', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { ids, status } = req.body; 
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const query = `UPDATE service_center_debit_requests SET status = $1 WHERE id = ANY($2::int[])`;
    await pool.query(query, [status, ids]);
    
    res.json({ success: true, message: `Successfully ${status.toLowerCase()} ${ids.length} debit requests.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

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


// --- BALANCE REQUESTS ---
app.get('/api/balance-requests', authenticateToken, async (req, res) => {
  try {
    const { accountName, orderId, fromDate, toDate } = req.query;
    let query = "SELECT * FROM balance_requests WHERE 1=1";
    let params = [];
    
    if (accountName) {
      params.push(`%${accountName}%`);
      query += ` AND account_name ILIKE $${params.length}`;
    }
    if (orderId) {
      params.push(`%${orderId}%`);
      query += ` AND order_id ILIKE $${params.length}`;
    }
    if (fromDate) {
      params.push(fromDate);
      query += ` AND request_date >= $${params.length}`;
    }
    if (toDate) {
      params.push(toDate);
      query += ` AND request_date <= $${params.length}`;
    }
    
    query += " ORDER BY id DESC";
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/balance-requests/:id/approve', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved_date, bank_name } = req.body;
    
    await pool.query(
      "UPDATE balance_requests SET status = 'Approved', approved_date = $1, bank_name = $2 WHERE id = $3",
      [approved_date, bank_name, id]
    );
    res.json({ success: true, message: 'Request approved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// --- ONLINE REQUESTS ---
app.get('/api/online-requests', authenticateToken, async (req, res) => {
  try {
    const { branchName, filterType, searchStr, planName, status, fromDate, toDate } = req.query;
    let query = "SELECT * FROM online_requests WHERE 1=1";
    let params = [];
    
    if (branchName && branchName !== '0' && branchName !== 'ALL') {
      params.push(branchName);
      query += ` AND branch_name = $${params.length}`;
    }
    
    if (filterType && filterType !== '0' && searchStr) {
      params.push(`%${searchStr}%`);
      const len = params.length;
      if (filterType === '2') query += ` AND member_name ILIKE $${len}`; // Name
      if (filterType === '3') query += ` AND contact_no ILIKE $${len}`; // Mobile
      if (filterType === '4') query += ` AND email ILIKE $${len}`; // Email
      if (filterType === '5') query += ` AND city ILIKE $${len}`; // City
      if (filterType === '10') query += ` AND reference_no ILIKE $${len}`; // Reference Id
    }
    
    if (planName && planName !== '0' && planName !== 'All') {
      params.push(planName);
      query += ` AND plan_name = $${params.length}`;
    }
    
    if (status && status !== '-1' && status !== 'All') {
      let statusStr = status === '1' ? 'Approved' : (status === '2' ? 'Rejected' : 'Pending');
      params.push(statusStr);
      query += ` AND status = $${params.length}`;
    }
    
    if (fromDate) {
      params.push(fromDate);
      query += ` AND request_date >= $${params.length}`;
    }
    if (toDate) {
      params.push(toDate);
      query += ` AND request_date <= $${params.length}`;
    }
    
    query += " ORDER BY id DESC";
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/online-requests/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved_date, remark, status } = req.body;
    
    await pool.query(
      "UPDATE online_requests SET status = $1, approved_date = $2, remark = $3 WHERE id = $4",
      [status || 'Approved', approved_date, remark, id]
    );
    res.json({ success: true, message: `Request ${status || 'Approved'} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// (Duplicate /api/bank-details alias removed — use /api/bankdetails instead)

// Serve frontend in production
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 🛡️ Global Error Handler
app.use((err, req, res, next) => {
  console.error('[UNHANDLED ERROR]', err.stack);
  res.status(500).json({ success: false, message: 'An internal server error occurred' });
});
process.on('unhandledRejection', (reason) => console.error('[UNHANDLED REJECTION]', reason));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
