const express = require('express');
const router = express.Router();
const pool = require('../config/db');

function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access Denied: Admin privileges required' });
  }
  next();
}

// ==========================================
// Customers
// ==========================================

router.post('/customers', async (req, res) => {
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

// ==========================================
// Users & Login History
// ==========================================

router.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, username, role, branch_id FROM users ORDER BY username ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/login_history', authorizeAdmin, async (req, res) => {
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

    query += ` ORDER BY lh.login_time DESC LIMIT 500`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// Company Profile
// ==========================================

router.get('/profile', async (req, res) => {
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

router.post('/profile', async (req, res) => {
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

// ==========================================
// Promoters
// ==========================================

router.get('/promoters', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM promoters ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/promoters', async (req, res) => {
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

router.put('/promoters/:id', async (req, res) => {
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

router.post('/promoters/:id/active', async (req, res) => {
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

// ==========================================
// Financial Years
// ==========================================

router.get('/financial-years/next', async (req, res) => {
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

router.post('/financial-years', async (req, res) => {
  try {
    const { from_year, to_year } = req.body;
    await pool.query('INSERT INTO financial_years (from_year, to_year) VALUES ($1, $2)', [from_year, to_year]);
    res.json({ success: true, message: 'Financial year added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/financial-years', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM financial_years ORDER BY from_year ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/financial-years/:id/activate', async (req, res) => {
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

module.exports = router;
