const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/states
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM states ORDER BY state_name ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/states
router.post('/', async (req, res) => {
  try {
    const { state_name, type, status } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO states (state_name, type, status) VALUES ($1, $2, $3) RETURNING *",
      [state_name, type || 'State', status || 'Active']
    );
    res.json({ success: true, message: 'State added successfully', state: rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(400).json({ error: 'State already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/states/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { state_name, type, status } = req.body;
    await pool.query(
      "UPDATE states SET state_name = $1, type = $2, status = $3 WHERE id = $4",
      [state_name, type || 'State', status, id]
    );
    res.json({ success: true, message: 'State updated successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(400).json({ error: 'State name already exists' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/states/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM states WHERE id = $1", [id]);
    res.json({ success: true, message: 'State deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
