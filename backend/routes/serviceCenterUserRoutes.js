const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access Denied: Admin privileges required' });
  }
  next();
}

// Get all Service Center Users
router.get('/', async (req, res) => {
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

// Create Service Center User
router.post('/', authorizeAdmin, async (req, res) => {
  try {
    const { branch_id, service_center_id, contact_name, mobile_no, phone_no, email, address, pin_code,
            bank_account_no, bank_account_name, bank_name, bank_ifsc, bank_branch_name, min_balance,
            username, password, is_active } = req.body;
    
    const userCheck = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const hashedPassword = await hashPassword(password);
    
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
router.put('/:id', authorizeAdmin, async (req, res) => {
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
      params.push(await hashPassword(password));
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

// Delete Service Center User
router.delete('/:id', authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1 AND role = 'Service Center User'", [id]);
    res.json({ success: true, message: 'Service Center User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
