const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Helper to hash passwords using bcrypt
async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

// 🛡️ Role-Based Access: Admin only middleware
function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access Denied: Admin privileges required' });
  }
  next();
}

// GET /api/branches - list all branches
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT * FROM branches ORDER BY name ASC`);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).json({ error: 'Failed to fetch branches' });
    }
});

// POST /api/branches
router.post('/', authorizeAdmin, async (req, res) => {
  const { name, code, state, address, contactName, phoneNo, mobileNo, email, pinCode } = req.body;
  
  // Auto-generate secure branch login credentials
  const cleanCode = (code || 'br').toLowerCase().replace(/[^a-z0-9]/g, '');
  const username = `${cleanCode}_${Math.floor(100 + Math.random() * 900)}`;
  const password = `VNB@${Math.floor(100000 + Math.random() * 900000)}`;
  const hashedPassword = await hashPassword(password);

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

// PUT /api/branches/:id
router.put('/:id', authorizeAdmin, async (req, res) => {
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

// PUT /api/branches/:id/password
router.put('/:id/password', authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const newPassword = `VNB@${Math.floor(100000 + Math.random() * 900000)}`;
  const hashedPassword = await hashPassword(newPassword);

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

// PUT /api/branches/locks
router.put('/locks', authorizeAdmin, async (req, res) => {
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

module.exports = router;
