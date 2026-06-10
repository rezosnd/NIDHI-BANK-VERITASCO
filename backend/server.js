require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const app = express();

const pool = require('./config/db');
const { setupSecurityMiddleware } = require('./middleware/security');
const authenticateToken = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const newsRoutes = require('./routes/newsRoutes');
const districtRoutes = require('./routes/districtRoutes');
const ipRoutes = require('./routes/ipRoutes');
const branchRoutes = require('./routes/branchRoutes');
const stateRoutes = require('./routes/stateRoutes');
const serviceCenterRoutes = require('./routes/serviceCenterRoutes');
const serviceCenterUserRoutes = require('./routes/serviceCenterUserRoutes');
const reportRoutes = require('./routes/reportRoutes');
const eventRoutes = require('./routes/eventRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const parameterRoutes = require('./routes/parameterRoutes');
const userRightsRoutes = require('./routes/userRightsRoutes');
const kycRoutes = require('./routes/kycRoutes');
const adminRoutes = require('./routes/adminRoutes');

// 🛡️ Apply Modular Security Middleware (Helmet, CORS, Rate Limits, Body Parser)
setupSecurityMiddleware(app);

// 🚪 Apply Auth Router
app.use('/api', authRoutes);

// Helper to hash passwords using bcrypt
async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

// Pool is now handled by ./config/db

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
    try { await pool.query(`ALTER TABLE users ADD COLUMN state VARCHAR(255)`); } catch(e) {}
    try { await pool.query(`ALTER TABLE users ADD COLUMN dob VARCHAR(255)`); } catch(e) {}
    try { await pool.query(`ALTER TABLE users ADD COLUMN blood_group VARCHAR(50)`); } catch(e) {}

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

    await pool.query(`CREATE TABLE IF NOT EXISTS designations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      parent_id INTEGER REFERENCES designations(id) ON DELETE SET NULL,
      status VARCHAR(50) DEFAULT 'Active',
      no_of_employee INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS designation_menu_rights (
      id SERIAL PRIMARY KEY,
      designation_id INTEGER REFERENCES designations(id) ON DELETE CASCADE,
      menu_name VARCHAR(255) NOT NULL,
      UNIQUE(designation_id, menu_name)
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

    await pool.query(`CREATE TABLE IF NOT EXISTS share_parameter_history (
      id SERIAL PRIMARY KEY,
      change_type VARCHAR(50) NOT NULL,
      changed_fields JSONB DEFAULT '{}',
      previous_values JSONB DEFAULT '{}',
      current_values JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

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

    await pool.query(`CREATE TABLE IF NOT EXISTS relationships (
      id SERIAL PRIMARY KEY,
      code VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      created_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Seed default relationships if empty
    const { rows: relRows } = await pool.query("SELECT count(*) as count FROM relationships");
    if (parseInt(relRows[0].count) === 0) {
        const defaults = [
            ['Mother', 'Mother'], ['Father', 'Father'], ['Son', 'Son'], ['Daughter', 'Daughter'],
            ['Son-in-Law', 'Son-in-Law'], ['Husband', 'Husband'], ['Sister', 'Sister'],
            ['other', 'others'], ['Wife', 'Wife'], ['Grand D', 'Grand daughter'],
            ['Grand son', 'Grand son'], ['BROUTHER', 'BROUTHER'], ['F in law', 'Father in law'],
            ['D in law', 'Daughter in Law'], ['NIECE', 'NIECE'], ['NEPHEW', 'NEPHEW'],
            ['M in law', 'Mother in law'], ['Cousin', 'Cousin']
        ];
        for (const [code, desc] of defaults) {
            await pool.query("INSERT INTO relationships (code, description) VALUES ($1, $2)", [code, desc]);
        }
    }

    await pool.query(`CREATE TABLE IF NOT EXISTS parameters (
      id SERIAL PRIMARY KEY,
      param_type VARCHAR(100) NOT NULL,
      param_name VARCHAR(255) NOT NULL,
      param_value VARCHAR(255),
      description TEXT,
      status VARCHAR(50) DEFAULT 'Active',
      created_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log("Database schema initialized successfully.");
  } catch (error) {
    console.error("Error initializing database schema:", error);
  }
}

// authenticateToken is now imported from middleware/auth.js

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

// /api/login extracted to routes/authRoutes.js

// Legacy code extracted to adminRoutes.js and branchRoutes.js







// Modular Parameter & HR Routes
app.use('/api', authenticateToken, parameterRoutes);
app.use('/api', authenticateToken, userRightsRoutes);
app.use('/api', authenticateToken, kycRoutes);
app.use('/api', authenticateToken, adminRoutes);


// POST /api/employees - extracted to routes/employeeRoutes.js
app.use('/api/employees', authenticateToken, employeeRoutes);

// Modular Master Routes
app.use('/api/news', authenticateToken, newsRoutes);
app.use('/api/districts', authenticateToken, districtRoutes);
app.use('/api/branch-ips', authenticateToken, ipRoutes);
app.use('/api/branches', authenticateToken, branchRoutes);
app.use('/api/states', authenticateToken, stateRoutes);
app.use('/api/service-centers', authenticateToken, serviceCenterRoutes);
app.use('/api/service-center-users', authenticateToken, serviceCenterUserRoutes);

// Modular Report & Event Routes
app.use('/api', authenticateToken, reportRoutes);
app.use('/api', authenticateToken, eventRoutes);

// Modular Settings & Transactions Routes
app.use('/api', authenticateToken, settingsRoutes);
app.use('/api', authenticateToken, transactionRoutes);

// Health check – useful for Vercel monitoring
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running' });
});

// Serve frontend build (if it exists)
app.use(express.static(path.join(__dirname, '../dist')));
// Fallback for SPA routing
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
// Log important env info at startup (won't expose secrets)
console.log('🚀 Backend starting – PORT:', PORT, '| NODE_ENV:', process.env.NODE_ENV || 'development');
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ WARNING: DATABASE_URL is not set – DB connections will fail');
}
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
