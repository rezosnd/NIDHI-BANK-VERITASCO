const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/news
router.get('/', async (req, res) => {
    try {
        const { receiver, status } = req.query;
        let query = 'SELECT * FROM news WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (receiver && receiver !== '-1') {
            query += ` AND receiver = $${paramIndex++}`;
            params.push(receiver);
        }

        if (status && status !== '-1') {
            query += ` AND status = $${paramIndex++}`;
            params.push(status === '1' ? 'Active' : 'Deactive');
        }

        query += ' ORDER BY id DESC';

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching news:', err);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// POST /api/news
router.post('/', async (req, res) => {
    try {
        const { title, content, receiver, status } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const { rows } = await pool.query(
            'INSERT INTO news (title, content, receiver, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, content, receiver || 'ALL', status || 'Active']
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error creating news:', err);
        res.status(500).json({ error: 'Failed to create news' });
    }
});

// PUT /api/news/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, receiver, status } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const { rowCount } = await pool.query(
            'UPDATE news SET title = $1, content = $2, receiver = $3, status = $4 WHERE id = $5',
            [title, content, receiver || 'ALL', status || 'Active', id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ error: 'News not found' });
        }

        res.json({ success: true, message: 'News updated successfully' });
    } catch (err) {
        console.error('Error updating news:', err);
        res.status(500).json({ error: 'Failed to update news' });
    }
});

// DELETE /api/news/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query('DELETE FROM news WHERE id = $1', [id]);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'News not found' });
        }

        res.json({ success: true, message: 'News deleted successfully' });
    } catch (err) {
        console.error('Error deleting news:', err);
        res.status(500).json({ error: 'Failed to delete news' });
    }
});

module.exports = router;
