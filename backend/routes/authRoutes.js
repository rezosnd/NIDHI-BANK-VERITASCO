const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { loginLimiter } = require('../middleware/security');

// 🛡️ Get real client IP
function getClientIp(req) {
  return req.socket.remoteAddress || req.ip || 'unknown';
}

router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required.' });
        }

        const { rows } = await pool.query(`
            SELECT u.*, b.name as branch_name, b.is_active_ip_address 
            FROM users u 
            LEFT JOIN branches b ON u.branch_id = b.id 
            WHERE u.username = $1
        `, [username]);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        if (user.is_active === false) {
             return res.status(403).json({ success: false, message: 'Account is locked or inactive.' });
        }

        const clientIp = getClientIp(req);

        // 🛡️ Security Feature: Enforce IP Whitelisting for Branch Users
        if (user.role === 'Branch User' && user.is_active_ip_address) {
            const ipCheck = await pool.query("SELECT * FROM branch_ip_addresses WHERE branch_id = $1 AND ip_address = $2", [user.branch_id, clientIp]);
            if (ipCheck.rows.length === 0) {
                return res.status(403).json({ success: false, message: 'Access Denied: You are not logging in from a whitelisted branch network.' });
            }
        }

        // Record login history
        await pool.query(
            "INSERT INTO login_history (user_id, username, user_type, branch_id, ip_address) VALUES ($1, $2, $3, $4, $5)",
            [user.id, user.username, user.role, user.branch_id, clientIp]
        );

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, branchName: user.branch_name, branch_id: user.branch_id, service_center_id: user.service_center_id },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                contact_name: user.contact_name,
                branchName: user.branch_name,
                branch_id: user.branch_id,
                service_center_id: user.service_center_id
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

module.exports = router;
