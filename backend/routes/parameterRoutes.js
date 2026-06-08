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
// Relationships API
// ==========================================

router.get('/relationships', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM relationships ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/relationships', authorizeAdmin, async (req, res) => {
  const { code, description } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO relationships (code, description, created_by) VALUES ($1, $2, $3) RETURNING *",
      [code, description, req.user.username]
    );
    res.json({ success: true, relationship: rows[0], message: 'Relationship added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/relationships/:id', authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { code, description } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE relationships SET code = $1, description = $2 WHERE id = $3 RETURNING *",
      [code, description, id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Relationship not found' });
    res.json({ success: true, relationship: rows[0], message: 'Relationship updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/relationships/:id', authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM relationships WHERE id = $1", [id]);
    if (rowCount === 0) return res.status(404).json({ success: false, message: 'Relationship not found' });
    res.json({ success: true, message: 'Relationship deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// Parameters API
// ==========================================

router.get('/parameters', async (req, res) => {
  const { type } = req.query;
  try {
    let query = "SELECT * FROM parameters";
    let params = [];
    if (type) {
      query += " WHERE param_type = $1";
      params.push(type);
    }
    query += " ORDER BY param_name ASC";
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/parameters', authorizeAdmin, async (req, res) => {
  const { param_type, param_name, param_value, description, status } = req.body;
  try {
    const sql = `INSERT INTO parameters (param_type, param_name, param_value, description, status, created_by) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const { rows } = await pool.query(sql, [param_type, param_name, param_value, description, status || 'Active', req.user.username]);
    res.json({ success: true, parameter: rows[0], message: 'Parameter added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/parameters/:id', authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { param_type, param_name, param_value, description, status } = req.body;
  try {
    const sql = `UPDATE parameters 
                 SET param_type = $1, param_name = $2, param_value = $3, description = $4, status = $5, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $6 RETURNING *`;
    const { rows } = await pool.query(sql, [param_type, param_name, param_value, description, status, id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Parameter not found' });
    res.json({ success: true, parameter: rows[0], message: 'Parameter updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/parameters/:id', authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM parameters WHERE id = $1", [id]);
    if (rowCount === 0) return res.status(404).json({ success: false, message: 'Parameter not found' });
    res.json({ success: true, message: 'Parameter deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// Online Requests API
// ==========================================

router.get('/online-requests', async (req, res) => {
  try {
    const { branchName, filterType, searchStr, planName, status, fromDate, toDate } = req.query;
    let query = "SELECT * FROM online_requests WHERE 1=1";
    let params = [];
    
    if (branchName && branchName !== '0' && branchName !== 'ALL') {
      params.push(branchName);
      query += \` AND branch_name = $\${params.length}\`;
    }
    
    if (filterType && filterType !== '0' && searchStr) {
      params.push(\`%\${searchStr}%\`);
      const len = params.length;
      if (filterType === '2') query += \` AND member_name ILIKE $\${len}\`; // Name
      if (filterType === '3') query += \` AND contact_no ILIKE $\${len}\`; // Mobile
      if (filterType === '4') query += \` AND email ILIKE $\${len}\`; // Email
      if (filterType === '5') query += \` AND city ILIKE $\${len}\`; // City
      if (filterType === '10') query += \` AND reference_no ILIKE $\${len}\`; // Reference Id
    }
    
    if (planName && planName !== '0' && planName !== 'All') {
      params.push(planName);
      query += \` AND plan_name = $\${params.length}\`;
    }
    
    if (status && status !== '-1' && status !== 'All') {
      let statusStr = status === '1' ? 'Approved' : (status === '2' ? 'Rejected' : 'Pending');
      params.push(statusStr);
      query += \` AND status = $\${params.length}\`;
    }
    
    if (fromDate) {
      params.push(fromDate);
      query += \` AND request_date >= $\${params.length}\`;
    }
    if (toDate) {
      params.push(toDate);
      query += \` AND request_date <= $\${params.length}\`;
    }
    
    query += " ORDER BY id DESC";
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/online-requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approved_date, remark, status } = req.body;
    
    await pool.query(
      "UPDATE online_requests SET status = $1, approved_date = $2, remark = $3 WHERE id = $4",
      [status || 'Approved', approved_date, remark, id]
    );
    res.json({ success: true, message: \`Request \${status || 'Approved'} successfully\` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
