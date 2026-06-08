const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/districts
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM districts ORDER BY district_name ASC');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching districts:', err);
        res.status(500).json({ error: 'Failed to fetch districts' });
    }
});

// POST /api/districts
router.post('/', async (req, res) => {
    try {
        const { district_name, state_id, status } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO districts (district_name, state_id, status) VALUES ($1, $2, $3) RETURNING *',
            [district_name, state_id, status || 'Active']
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error creating district:', err);
        if (err.code === '23505') return res.status(400).json({ error: 'District already exists in this state' });
        res.status(500).json({ error: 'Failed to create district' });
    }
});

// PUT /api/districts/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { district_name, state_id, status } = req.body;
        
        await pool.query(
            'UPDATE districts SET district_name = $1, state_id = $2, status = $3 WHERE id = $4',
            [district_name, state_id, status, id]
        );
        res.json({ success: true, message: 'District updated successfully' });
    } catch (err) {
        console.error('Error updating district:', err);
        if (err.code === '23505') return res.status(400).json({ error: 'District already exists in this state' });
        res.status(500).json({ error: 'Failed to update district' });
    }
});

// DELETE /api/districts/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM districts WHERE id = $1', [id]);
        res.json({ success: true, message: 'District deleted successfully' });
    } catch (err) {
        console.error('Error deleting district:', err);
        res.status(500).json({ error: 'Failed to delete district' });
    }
});

module.exports = router;
