const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Helper middleware
function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access Denied: Admin privileges required' });
  }
  next();
}

// ==========================================
// Designations API
// ==========================================

router.get('/designations', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM designations ORDER BY COALESCE(parent_id, 0) ASC, id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching designations:', err);
        res.status(500).json({ error: 'Failed to fetch designations' });
    }
});

router.post('/designations', async (req, res) => {
    const { name, parent_id, status, no_of_employee } = req.body;
    if (!name) return res.status(400).json({ error: 'Designation name is required' });
    
    try {
        const result = await pool.query(
            'INSERT INTO designations (name, parent_id, status, no_of_employee) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, parent_id || null, status || 'Active', no_of_employee || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Designation already exists' });
        }
        console.error('Error creating designation:', err);
        res.status(500).json({ error: 'Failed to create designation' });
    }
});

router.put('/designations/:id', async (req, res) => {
    const { id } = req.params;
    const { name, parent_id, status, no_of_employee } = req.body;
    
    try {
        const oldResult = await pool.query('SELECT * FROM designations WHERE id = $1', [id]);
        if (oldResult.rows.length === 0) return res.status(404).json({ error: 'Designation not found' });

        // Prevent self-referencing parent
        if (parseInt(parent_id) === parseInt(id)) {
            return res.status(400).json({ error: 'A designation cannot be its own parent' });
        }

        const result = await pool.query(
            'UPDATE designations SET name = $1, parent_id = $2, status = $3, no_of_employee = $4 WHERE id = $5 RETURNING *',
            [name, parent_id || null, status, no_of_employee || 0, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Designation name already exists' });
        }
        console.error('Error updating designation:', err);
        res.status(500).json({ error: 'Failed to update designation' });
    }
});

router.delete('/designations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const oldResult = await pool.query('SELECT * FROM designations WHERE id = $1', [id]);
        if (oldResult.rows.length === 0) return res.status(404).json({ error: 'Designation not found' });

        // Check if it has children
        const childrenResult = await pool.query('SELECT * FROM designations WHERE parent_id = $1', [id]);
        if (childrenResult.rows.length > 0) {
            return res.status(400).json({ error: 'Cannot delete designation with sub-designations. Reassign them first.' });
        }

        await pool.query('DELETE FROM designations WHERE id = $1', [id]);
        res.json({ message: 'Designation deleted successfully' });
    } catch (err) {
        console.error('Error deleting designation:', err);
        res.status(500).json({ error: 'Failed to delete designation' });
    }
});

// Designation Menu Rights API
router.get('/designation-menu-rights/:designationId', async (req, res) => {
    try {
        const { designationId } = req.params;
        const result = await pool.query('SELECT menu_name FROM designation_menu_rights WHERE designation_id = $1', [designationId]);
        res.json(result.rows.map(row => row.menu_name));
    } catch (err) {
        console.error('Error fetching menu rights:', err);
        res.status(500).json({ error: 'Failed to fetch menu rights' });
    }
});

router.post('/designation-menu-rights/:designationId', async (req, res) => {
    const { designationId } = req.params;
    const { menus } = req.body; 
    
    if (!Array.isArray(menus)) {
        return res.status(400).json({ error: 'Menus must be an array of menu names' });
    }

    try {
        await pool.query('BEGIN');
        
        await pool.query('DELETE FROM designation_menu_rights WHERE designation_id = $1', [designationId]);
        
        if (menus.length > 0) {
            const values = [];
            const placeholders = [];
            let i = 1;
            
            for (const menu of menus) {
                placeholders.push(`($1, $${i + 1})`);
                values.push(menu);
                i++;
            }
            
            const query = `INSERT INTO designation_menu_rights (designation_id, menu_name) VALUES ${placeholders.join(', ')}`;
            await pool.query(query, [designationId, ...values]);
        }
        
        await pool.query('COMMIT');
        res.json({ message: 'Menu rights updated successfully' });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Error updating menu rights:', err);
        res.status(500).json({ error: 'Failed to update menu rights' });
    }
});

// ============================================================
// Service Center User Rights API
// ============================================================

router.get('/sc-users', async (req, res) => {
    try {
        const { service_center_id } = req.query;
        let query = `SELECT u.id, u.username, u.contact_name, u.role, u.service_center_id, u.is_active
                     FROM users u
                     WHERE u.role ILIKE '%service%center%' OR u.service_center_id IS NOT NULL`;
        const params = [];
        if (service_center_id && service_center_id !== '0') {
            params.push(parseInt(service_center_id));
            query += ` AND u.service_center_id = $${params.length}`;
        }
        query += ` ORDER BY COALESCE(u.contact_name, u.username)`;
        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching SC users:', err);
        res.status(500).json({ error: 'Failed to fetch service center users' });
    }
});

router.get('/sc-user-rights/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { rows } = await pool.query(
            `SELECT menu_name FROM sc_user_rights WHERE user_id = $1`,
            [parseInt(userId)]
        );
        res.json(rows.map(r => r.menu_name));
    } catch (err) {
        console.error('Error fetching SC user rights:', err);
        res.status(500).json({ error: 'Failed to fetch SC user rights' });
    }
});

router.post('/sc-user-rights/:userId', async (req, res) => {
    const { userId } = req.params;
    const { menus } = req.body;
    if (!Array.isArray(menus)) return res.status(400).json({ error: 'menus must be an array' });
    try {
        await pool.query('BEGIN');
        await pool.query('DELETE FROM sc_user_rights WHERE user_id = $1', [parseInt(userId)]);
        if (menus.length > 0) {
            const placeholders = menus.map((_, i) => `($1, $${i + 2})`).join(', ');
            await pool.query(
                `INSERT INTO sc_user_rights (user_id, menu_name) VALUES ${placeholders}`,
                [parseInt(userId), ...menus]
            );
        }
        await pool.query('COMMIT');
        res.json({ message: 'SC user rights updated successfully' });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Error updating SC user rights:', err);
        res.status(500).json({ error: 'Failed to update SC user rights' });
    }
});

// ============================================================
// Branch User Rights API
// ============================================================

router.get('/branch-users', async (req, res) => {
    try {
        const { branch_id, designation_id } = req.query;
        let query = `SELECT u.id, u.username, u.contact_name, u.role, u.branch_id, u.is_active FROM users u WHERE u.role != 'Admin'`;
        const params = [];
        if (branch_id && branch_id !== '0') {
            params.push(parseInt(branch_id));
            query += ` AND u.branch_id = $${params.length}`;
        }
        if (designation_id && designation_id !== '0') {
            params.push(parseInt(designation_id));
            query += ` AND u.role = (SELECT name FROM designations WHERE id = $${params.length})`;
        }
        query += ` ORDER BY COALESCE(u.contact_name, u.username)`;
        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching branch users:', err);
        res.status(500).json({ error: 'Failed to fetch branch users' });
    }
});

router.get('/branch-user-rights/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { rows } = await pool.query(
            `SELECT menu_name FROM branch_user_rights WHERE user_id = $1`,
            [parseInt(userId)]
        );
        res.json(rows.map(r => r.menu_name));
    } catch (err) {
        console.error('Error fetching branch user rights:', err);
        res.status(500).json({ error: 'Failed to fetch user rights' });
    }
});

router.post('/branch-user-rights/:userId', async (req, res) => {
    const { userId } = req.params;
    const { menus } = req.body;
    if (!Array.isArray(menus)) return res.status(400).json({ error: 'menus must be an array' });
    try {
        await pool.query('BEGIN');
        await pool.query('DELETE FROM branch_user_rights WHERE user_id = $1', [parseInt(userId)]);
        if (menus.length > 0) {
            const placeholders = menus.map((_, i) => `($1, $${i + 2})`).join(', ');
            await pool.query(
                `INSERT INTO branch_user_rights (user_id, menu_name) VALUES ${placeholders}`,
                [parseInt(userId), ...menus]
            );
        }
        await pool.query('COMMIT');
        res.json({ message: 'User rights updated successfully' });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Error updating branch user rights:', err);
        res.status(500).json({ error: 'Failed to update user rights' });
    }
});

module.exports = router;
