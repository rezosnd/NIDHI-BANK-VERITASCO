const express = require('express');
const router = express.Router();
const pool = require('../config/db');

function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access Denied: Admin privileges required' });
  }
  next();
}

function isValidIp(ip) {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6 = /^[0-9a-fA-F:]{2,39}$/;
  return ipv4.test(ip) || ipv6.test(ip);
}

// GET /api/branch-ips
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT i.id, i.branch_id, i.ip_address, b.name as branch_name, b.code as branch_code 
            FROM branch_ip_addresses i 
            JOIN branches b ON i.branch_id = b.id 
            ORDER BY b.name ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching branch IPs:', err);
        res.status(500).json({ error: 'Failed to fetch branch IPs' });
    }
});

// POST /api/branch-ips
router.post('/', authorizeAdmin, async (req, res) => {
    try {
        const { branch_id, ip_address } = req.body;
        if (!branch_id || !ip_address) {
            return res.status(400).json({ success: false, error: 'Branch and IP Address are required' });
        }
        
        if (!isValidIp(ip_address.trim())) {
            return res.status(400).json({ success: false, error: 'Invalid IP address format. Use IPv4 (e.g., 192.168.1.1) or IPv6.' });
        }

        await pool.query(
            'INSERT INTO branch_ip_addresses (branch_id, ip_address) VALUES ($1, $2)',
            [branch_id, ip_address]
        );
        res.status(201).json({ success: true, message: 'IP Address added successfully' });
    } catch (err) {
        console.error('Error adding branch IP:', err);
        res.status(500).json({ success: false, error: 'Failed to add IP Address' });
    }
});

// DELETE /api/branch-ips/:id
router.delete('/:id', authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM branch_ip_addresses WHERE id = $1', [id]);
        res.json({ success: true, message: 'IP Address deleted successfully' });
    } catch (err) {
        console.error('Error deleting branch IP:', err);
        res.status(500).json({ success: false, error: 'Failed to delete IP Address' });
    }
});

module.exports = router;
