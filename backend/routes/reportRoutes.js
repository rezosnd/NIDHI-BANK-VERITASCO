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

// ===================== Customer Complaints Report =====================
router.post('/customer-complaints/search', async (req, res) => {
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

    if (req.user.role === 'Branch User') {
      query += ` AND c.branch_id = $${paramIndex++}`;
      params.push(req.user.branchId);
    } else if (branch_id && branch_id !== '0') {
      query += ` AND c.branch_id = $${paramIndex++}`;
      params.push(branch_id);
    }

    if (search_field && search_val) {
      if (search_field === '2') { query += ` AND c.name ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } 
      else if (search_field === '3') { query += ` AND c.mobile ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } 
      else if (search_field === '4') { query += ` AND c.email ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } 
      else if (search_field === '5') { query += ` AND c.city ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } 
      else if (search_field === '10') { query += ` AND c.reference_id ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } 
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

router.put('/customer-complaints/:id/status', authorizeAdmin, async (req, res) => {
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

// ===================== Customer Feedback Report =====================
router.post('/customer-feedback/search', async (req, res) => {
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

    if (req.user.role === 'Branch User') {
      query += ` AND f.branch_id = $${paramIndex++}`;
      params.push(req.user.branchId);
    } else if (branch_id && branch_id !== '0') {
      query += ` AND f.branch_id = $${paramIndex++}`;
      params.push(branch_id);
    }

    if (search_field && search_val) {
      if (search_field === '2') { query += ` AND f.name ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } 
      else if (search_field === '3') { query += ` AND f.mobile ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } 
      else if (search_field === '4') { query += ` AND f.email ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } 
      else if (search_field === '5') { query += ` AND f.city ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } 
      else if (search_field === '10') { query += ` AND f.reference_id ILIKE $${paramIndex++}`; params.push('%' + search_val + '%'); } 
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

// ===================== Member Requests Enquiry =====================
router.post('/member-requests/search', async (req, res) => {
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
      if (status === '0') statusStr = 'Pending'; 
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

// ===================== Share Applications =====================
router.post('/share-applications/search', async (req, res) => {
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

// ===================== All Requests (Assign Online Request) =====================
router.post('/all-requests/search', authorizeAdmin, async (req, res) => {
  try {
    const { branch_id, communication_type, search_field, search_val, service_type, from_date, to_date } = req.body;
    
    let queries = [];
    let params = [];
    let paramIndex = 1;

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

router.post('/all-requests/assign', authorizeAdmin, async (req, res) => {
  try {
    const { requests, target_branch_id } = req.body;
    
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

module.exports = router;
