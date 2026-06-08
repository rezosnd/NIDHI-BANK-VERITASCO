const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Helper to hash passwords using bcrypt
async function hashPassword(password) {
    return await bcrypt.hash(password, 12);
}

// POST /api/employees - create a new employee
router.post('/', async (req, res) => {
    try {
        const {
            role, branch_id, state, contact_name, dob, blood_group,
            mobile_no, phone_no, email, address, pin_code, username, password
        } = req.body;

        if (!role || !branch_id || !contact_name || !mobile_no || !username || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if username already exists
        const userExists = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Username already exists. Please choose a different one.' });
        }

        const hashed = await hashPassword(password);

        const result = await pool.query(
            `INSERT INTO users (
                role, branch_id, state, contact_name, dob, blood_group,
                mobile_no, phone_no, email, address, pin_code, username, password_hash
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
            [role, parseInt(branch_id), state, contact_name, dob, blood_group, mobile_no, phone_no, email, address, pin_code, username, hashed]
        );

        res.json({ success: true, message: 'Employee created successfully', id: result.rows[0].id });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ error: 'Internal server error while creating employee' });
    }
});

module.exports = router;
