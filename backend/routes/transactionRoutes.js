const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Role-Based Access: Admin only middleware
function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access Denied: Admin privileges required' });
  }
  next();
}

router.get('/eod/transactions', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM transactions WHERE status = 'Pending' ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/eod/execute', async (req, res) => {
  try {
    await pool.query("UPDATE transactions SET status = 'Approved' WHERE status = 'Pending'");
    res.json({ success: true, message: 'End of Day executed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Approve/Reject Transactions
router.post('/transactions/pending', authorizeAdmin, async (req, res) => {
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

router.post('/transactions/status', authorizeAdmin, async (req, res) => {
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
router.post('/share-transfers/search', async (req, res) => {
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

router.post('/share-transfers/status', authorizeAdmin, async (req, res) => {
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
router.post('/debit-requests/search', async (req, res) => {
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

router.post('/debit-requests/status', authorizeAdmin, async (req, res) => {
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

// Balance Requests
router.get('/balance-requests', async (req, res) => {
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

router.put('/balance-requests/:id/approve', authorizeAdmin, async (req, res) => {
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

router.put('/balance-requests/:id/reject', authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;
    
    await pool.query(
      "UPDATE balance_requests SET status = 'Rejected', remark = $1 WHERE id = $2",
      [remark, id]
    );
    res.json({ success: true, message: 'Request rejected successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
