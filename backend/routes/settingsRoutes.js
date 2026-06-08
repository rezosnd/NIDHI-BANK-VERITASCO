const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Settings Endpoints
router.get('/settings', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT settings_data FROM system_settings ORDER BY id ASC LIMIT 1");
    res.json(rows[0]?.settings_data || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const incomingSettings = req.body || {};
    const { rows } = await pool.query("SELECT settings_data FROM system_settings ORDER BY id ASC LIMIT 1");
    const currentSettings = rows[0]?.settings_data || {};
    const mergedSettings = { ...currentSettings, ...incomingSettings };

    const historyGroups = [
      { changeType: 'share_value', fields: ['share_member_type', 'share_value', 'min_shares', 'max_shares', 'dividend_declared'] },
      { changeType: 'promoter_member', fields: ['no_of_promoter', 'min_members'] },
      { changeType: 'authorised_capital', fields: ['authorised_capital'] },
      { changeType: 'paidup_capital', fields: ['paidup_capital'] },
      { changeType: 'fee_parameter', fields: ['fee_member_type', 'fee_share', 'fee_adm', 'fee_death', 'fee_building', 'fee_other1', 'fee_other2'] },
      ...([1,2,3,4,5,6,7,8,9,10].map(id => ({
        changeType: 'sb_accounts',
        fields: [
          `sb_${id}_type_name`, `sb_${id}_min_bal`, `sb_${id}_max_bal`, `sb_${id}_roi`, 
          `sb_${id}_min_period`, `sb_${id}_preclosure_chg`, `sb_${id}_penalty_min_bal`, 
          `sb_${id}_min_bal_with_chq_staff`, `sb_${id}_min_bal_without_chq_staff`, 
          `sb_${id}_roi_staff`, `sb_${id}_is_display_website`, `sb_${id}_atm_charges`, 
          `sb_${id}_txn_limit`, `sb_${id}_per_day_limit`
        ]
      }))),
      { changeType: 'sb_account_types', fields: ['sb_account_types', 'od_account_types'] },
      { changeType: 'plan_parameters', fields: ['plan_parameters'] },
      { changeType: 'prematurity_slabs', fields: ['prematurity_slabs'] },
      { changeType: 'approval_limit_parameters', fields: ['approval_limit_parameters'] },
      { changeType: 'service_deductions', fields: ['service_deductions'] },
      { changeType: 'service_charge_categories', fields: ['service_charge_categories'] },
      { changeType: 'deposit_tds_parameters', fields: ['deposit_tds_parameters'] },
      { changeType: 'sms_parameters', fields: ['sms_parameters'] },
      { changeType: 'financial_year', fields: ['financial_year_start', 'financial_year_end'] },
      { changeType: 'lock_settings', fields: ['lock_settings'] }
    ];

    const historyEntries = historyGroups
      .map(group => {
        let isChanged = false;
        let previousValues = {};
        let currentValues = {};
        let changedFieldMap = {};

        group.fields.forEach(field => {
          if (incomingSettings[field] !== undefined && incomingSettings[field] !== currentSettings[field]) {
            isChanged = true;
            previousValues[field] = currentSettings[field];
            currentValues[field] = incomingSettings[field];
            changedFieldMap[field] = true;
          }
        });

        if (!isChanged) return null;

        return {
          changeType: group.changeType,
          changedFields: changedFieldMap,
          previousValues,
          currentValues
        };
      })
      .filter(Boolean);

    await pool.query(
      "UPDATE system_settings SET settings_data = $1 WHERE id = (SELECT id FROM system_settings ORDER BY id ASC LIMIT 1)",
      [mergedSettings]
    );

    for (const entry of historyEntries) {
      await pool.query(
        "INSERT INTO share_parameter_history (change_type, changed_fields, previous_values, current_values) VALUES ($1, $2, $3, $4)",
        [entry.changeType, entry.changedFields, entry.previousValues, entry.currentValues]
      );
    }

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/share-parameters/history', async (req, res) => {
  try {
    const { type } = req.query;
    const params = [];
    let sql = `
      SELECT id, change_type, changed_fields, previous_values, current_values, created_at
      FROM share_parameter_history
    `;

    if (type) {
      params.push(type);
      sql += ` WHERE change_type = $1`;
    }

    sql += ` ORDER BY id DESC`;

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Service Tax Endpoints
router.get('/servicetax', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM service_tax ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/servicetax/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tax_name, total_percent, cgst_percent, sgst_percent, igst_percent, is_igst, status } = req.body;
    await pool.query(
      `UPDATE service_tax 
       SET tax_name = $1, total_percent = $2, cgst_percent = $3, sgst_percent = $4, igst_percent = $5, is_igst = $6, status = $7 
       WHERE id = $8`,
      [tax_name, total_percent, cgst_percent, sgst_percent, igst_percent, is_igst, status, id]
    );
    res.json({ success: true, message: 'Service tax updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Bank Details Endpoints
router.get('/bankdetails', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM bank_details ORDER BY bank_name ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/bankdetails/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { rows } = await pool.query("SELECT * FROM bank_details WHERE bank_code = $1", [code]);
    if (rows.length === 0) return res.status(404).json({ error: 'Bank not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/bankdetails/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { ifsc_code, account_holder_name, account_number } = req.body;
    await pool.query(
      `UPDATE bank_details 
       SET ifsc_code = $1, account_holder_name = $2, account_number = $3, updated_at = CURRENT_TIMESTAMP
       WHERE bank_code = $4`,
      [ifsc_code, account_holder_name, account_number, code]
    );
    res.json({ success: true, message: 'Bank details updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/bankdetails', async (req, res) => {
  try {
    const { bank_name, ifsc_code, account_holder_name, account_number } = req.body;
    const bank_code = 'CUST' + Date.now().toString().slice(-6);
    await pool.query(
      `INSERT INTO bank_details (bank_code, bank_name, ifsc_code, account_holder_name, account_number)
       VALUES ($1, $2, $3, $4, $5)`,
      [bank_code, bank_name, ifsc_code, account_holder_name, account_number]
    );
    res.json({ success: true, message: 'New bank added successfully', bank_code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
