const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ===================== Calendar Events =====================
router.get('/calendar-events', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM calendar_events ORDER BY event_date ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/calendar-events', async (req, res) => {
  try {
    const { title, description, event_date, event_color } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO calendar_events (title, description, event_date, event_color, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, event_date, event_color || '#2563eb', req.user.username]
    );
    res.json({ success: true, event: rows[0], message: 'Event added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/calendar-events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM calendar_events WHERE id = $1", [id]);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ===================== Company Events =====================
router.get('/events', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM company_events ORDER BY event_date ASC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/events', async (req, res) => {
  try {
    const { title, description, event_date, event_time, venue, organizer, event_type } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO company_events (title, description, event_date, event_time, venue, organizer, event_type, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, event_date, event_time, venue, organizer, event_type || 'General', req.user.username]
    );
    res.json({ success: true, event: rows[0], message: 'Event created successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_date, event_time, venue, organizer, event_type, status } = req.body;
    await pool.query(
      `UPDATE company_events SET title=$1, description=$2, event_date=$3, event_time=$4, venue=$5, organizer=$6, event_type=$7, status=$8 WHERE id=$9`,
      [title, description, event_date, event_time, venue, organizer, event_type, status, id]
    );
    res.json({ success: true, message: 'Event updated successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/events/:id', async (req, res) => {
  try {
    await pool.query("DELETE FROM company_events WHERE id = $1", [req.params.id]);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===================== Holidays =====================
router.get('/holidays', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM holidays ORDER BY holiday_date ASC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/holidays', async (req, res) => {
  try {
    const { holiday_name, holiday_date, holiday_type, description } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO holidays (holiday_name, holiday_date, holiday_type, description, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [holiday_name, holiday_date, holiday_type || 'Public', description, req.user.username]
    );
    res.json({ success: true, holiday: rows[0], message: 'Holiday added successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/holidays/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { holiday_name, holiday_date, holiday_type, description, status } = req.body;
    await pool.query(
      `UPDATE holidays SET holiday_name=$1, holiday_date=$2, holiday_type=$3, description=$4, status=$5 WHERE id=$6`,
      [holiday_name, holiday_date, holiday_type, description, status, id]
    );
    res.json({ success: true, message: 'Holiday updated successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/holidays/:id', async (req, res) => {
  try {
    await pool.query("DELETE FROM holidays WHERE id = $1", [req.params.id]);
    res.json({ success: true, message: 'Holiday deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
