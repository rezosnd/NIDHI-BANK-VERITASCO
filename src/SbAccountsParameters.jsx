import React, { useEffect, useState } from 'react';
import './ShareParameters.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Shield = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const CheckCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Clock = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

const DEFAULT_SB_TYPES = [
  { id: 1, name: 'SAVING ACCOUNT' },
  { id: 2, name: 'SNL Saving Account' },
  { id: 3, name: 'Student Saving Account' },
  { id: 4, name: 'Salary Saving Account' },
  { id: 5, name: 'Senior Citizen Saving Account' }
];

const SbAccountsParameters = () => {
  const [settings, setSettings] = useState({});
  const [sbTypes, setSbTypes] = useState(DEFAULT_SB_TYPES);
  const [selectedTypeId, setSelectedTypeId] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [history, setHistory] = useState([]);

  // Local form state
  const [formData, setFormData] = useState({
    sb_min_bal: '0',
    sb_max_bal: '0',
    sb_roi: '0',
    sb_min_period: '0',
    sb_preclosure_chg: '0',
    sb_penalty_min_bal: '0',
    sb_min_bal_with_chq_staff: '0',
    sb_min_bal_without_chq_staff: '0',
    sb_roi_staff: '0',
    sb_is_display_website: false,
    sb_atm_charges: '0',
    sb_txn_limit: '0',
    sb_per_day_limit: '0'
  });

  const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    // Populate form data when selected type or settings change
    if (settings) {
      setFormData({
        sb_min_bal: settings[`sb_${selectedTypeId}_min_bal`] || '0',
        sb_max_bal: settings[`sb_${selectedTypeId}_max_bal`] || '0',
        sb_roi: settings[`sb_${selectedTypeId}_roi`] || '0',
        sb_min_period: settings[`sb_${selectedTypeId}_min_period`] || '0',
        sb_preclosure_chg: settings[`sb_${selectedTypeId}_preclosure_chg`] || '0',
        sb_penalty_min_bal: settings[`sb_${selectedTypeId}_penalty_min_bal`] || '0',
        sb_min_bal_with_chq_staff: settings[`sb_${selectedTypeId}_min_bal_with_chq_staff`] || '0',
        sb_min_bal_without_chq_staff: settings[`sb_${selectedTypeId}_min_bal_without_chq_staff`] || '0',
        sb_roi_staff: settings[`sb_${selectedTypeId}_roi_staff`] || '0',
        sb_is_display_website: settings[`sb_${selectedTypeId}_is_display_website`] || false,
        sb_atm_charges: settings[`sb_${selectedTypeId}_atm_charges`] || '0',
        sb_txn_limit: settings[`sb_${selectedTypeId}_txn_limit`] || '0',
        sb_per_day_limit: settings[`sb_${selectedTypeId}_per_day_limit`] || '0'
      });
    }
  }, [selectedTypeId, settings]);

  const fetchAll = async ({ clearMessage = true } = {}) => {
    setIsLoading(true);
    if (clearMessage) setMessage(null);
    try {
      const token = getAuthToken();
      const [settingsRes, historyRes] = await Promise.all([
        fetch('/api/settings', { headers: { Authorization: `Bearer ${token || ''}` } }),
        fetch('/api/share-parameters/history?type=sb_accounts', { headers: { Authorization: `Bearer ${token || ''}` } }),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data);
        if (data.sb_account_types && Array.isArray(data.sb_account_types)) {
          setSbTypes(data.sb_account_types);
          if (!data.sb_account_types.find(t => t.id === selectedTypeId)) {
            setSelectedTypeId(data.sb_account_types[0]?.id || 1);
          }
        }
      }

      if (historyRes.ok) {
        const data = await historyRes.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error loading SB parameters:', error);
      setMessage({ type: 'error', text: 'Failed to load SB Accounts parameters.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const token = getAuthToken();
      const typeName = sbTypes.find(t => t.id === Number(selectedTypeId))?.name || 'SAVING ACCOUNT';
      
      const updatePayload = {
        [`sb_${selectedTypeId}_type_name`]: typeName,
        [`sb_${selectedTypeId}_min_bal`]: formData.sb_min_bal,
        [`sb_${selectedTypeId}_max_bal`]: formData.sb_max_bal,
        [`sb_${selectedTypeId}_roi`]: formData.sb_roi,
        [`sb_${selectedTypeId}_min_period`]: formData.sb_min_period,
        [`sb_${selectedTypeId}_preclosure_chg`]: formData.sb_preclosure_chg,
        [`sb_${selectedTypeId}_penalty_min_bal`]: formData.sb_penalty_min_bal,
        [`sb_${selectedTypeId}_min_bal_with_chq_staff`]: formData.sb_min_bal_with_chq_staff,
        [`sb_${selectedTypeId}_min_bal_without_chq_staff`]: formData.sb_min_bal_without_chq_staff,
        [`sb_${selectedTypeId}_roi_staff`]: formData.sb_roi_staff,
        [`sb_${selectedTypeId}_is_display_website`]: formData.sb_is_display_website,
        [`sb_${selectedTypeId}_atm_charges`]: formData.sb_atm_charges,
        [`sb_${selectedTypeId}_txn_limit`]: formData.sb_txn_limit,
        [`sb_${selectedTypeId}_per_day_limit`]: formData.sb_per_day_limit,
      };

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify(updatePayload)
      });
      if (!response.ok) throw new Error('Failed to update SB parameters');
      setMessage({ type: 'success', text: 'Savings Bank parameters updated successfully.' });
      await fetchAll({ clearMessage: false });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save parameters.' });
    } finally {
      setIsSaving(false);
    }
  };

  const renderHistoryRows = () => {
    if (isLoading && history.length === 0) {
      return (
        <tr>
          <td colSpan="15" className="share-empty">
            <span className="share-loading"><Clock className="icon-sm share-spin" /> Loading...</span>
          </td>
        </tr>
      );
    }
    if (history.length === 0) {
      return (
        <tr>
          <td colSpan="15" className="share-empty">No SB parameter history found.</td>
        </tr>
      );
    }
    return history.map((row, idx) => {
      const current = row.current_values || {};
      const prev = row.previous_values || {};
      
      // Determine which ID was updated in this row by looking at keys
      const updatedKey = Object.keys(current).find(k => k.startsWith('sb_') && k.endsWith('_type_name'));
      const id = updatedKey ? updatedKey.split('_')[1] : '1';
      
      const typeName = current[`sb_${id}_type_name`] || prev[`sb_${id}_type_name`] || 'SAVING ACCOUNT';

      return (
        <tr key={row.id}>
          <td className="muted">{idx + 1}</td>
          <td className="muted">{new Date(row.created_at).toLocaleString()}</td>
          <td>{typeName}</td>
          <td className="right">{Number(current[`sb_${id}_min_bal`] || prev[`sb_${id}_min_bal`] || 0).toFixed(2)}</td>
          <td className="right">{Number(current[`sb_${id}_max_bal`] || prev[`sb_${id}_max_bal`] || 0).toFixed(2)}</td>
          <td className="right">{Number(current[`sb_${id}_roi`] || prev[`sb_${id}_roi`] || 0).toFixed(2)}</td>
          <td className="right">{Number(current[`sb_${id}_min_period`] || prev[`sb_${id}_min_period`] || 0).toFixed(2)}</td>
          <td className="right">{Number(current[`sb_${id}_preclosure_chg`] || prev[`sb_${id}_preclosure_chg`] || 0).toFixed(2)}</td>
          <td className="right">{Number(current[`sb_${id}_penalty_min_bal`] || prev[`sb_${id}_penalty_min_bal`] || 0).toFixed(2)}</td>
          <td className="right">{Number(current[`sb_${id}_min_bal_with_chq_staff`] || prev[`sb_${id}_min_bal_with_chq_staff`] || 0).toFixed(2)}</td>
          <td className="right">{Number(current[`sb_${id}_min_bal_without_chq_staff`] || prev[`sb_${id}_min_bal_without_chq_staff`] || 0).toFixed(2)}</td>
          <td className="right">{Number(current[`sb_${id}_roi_staff`] || prev[`sb_${id}_roi_staff`] || 0).toFixed(2)}</td>
          <td className="right">{Number(current[`sb_${id}_atm_charges`] || prev[`sb_${id}_atm_charges`] || 0).toFixed(2)}</td>
          <td className="right">{Number(current[`sb_${id}_txn_limit`] || prev[`sb_${id}_txn_limit`] || 0).toFixed(2)}</td>
          <td className="right">{Number(current[`sb_${id}_per_day_limit`] || prev[`sb_${id}_per_day_limit`] || 0).toFixed(2)}</td>
        </tr>
      );
    });
  };

  return (
    <div className="share-parameters-page" style={{ paddingBottom: '40px' }}>
      <div className="share-parameters-shell">
        {message && (
          <div className={`share-message ${message.type === 'success' ? 'share-message--success' : 'share-message--error'}`}>
            {message.type === 'success' ? <CheckCircle className="icon-sm" /> : <Shield className="icon-sm" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="share-layout">
          <section className="share-parameters-card share-panel" style={{ flexBasis: '400px', flexGrow: 0 }}>
            <h2>Savings Bank Parameter's</h2>
            <div className="share-form">
              <label className="share-field">
                <span>SB Type</span>
                <select value={selectedTypeId} onChange={(e) => setSelectedTypeId(Number(e.target.value))}>
                  {sbTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>

              <label className="share-field">
                <span>SB Minimum Balance</span>
                <input type="text" value={formData.sb_min_bal} onChange={(e) => handleChange('sb_min_bal', e.target.value)} />
              </label>

              <label className="share-field">
                <span>SB Maximum Balance</span>
                <input type="text" value={formData.sb_max_bal} onChange={(e) => handleChange('sb_max_bal', e.target.value)} />
              </label>

              <label className="share-field">
                <span>SB Rate of Interest</span>
                <input type="text" value={formData.sb_roi} onChange={(e) => handleChange('sb_roi', e.target.value)} />
              </label>

              <label className="share-field">
                <span>SB Minimum Period</span>
                <input type="text" value={formData.sb_min_period} onChange={(e) => handleChange('sb_min_period', e.target.value)} />
              </label>

              <label className="share-field">
                <span>Service Charge for PreClosure</span>
                <input type="text" value={formData.sb_preclosure_chg} onChange={(e) => handleChange('sb_preclosure_chg', e.target.value)} />
              </label>

              <label className="share-field">
                <span>Penalty for Min Balance</span>
                <input type="text" value={formData.sb_penalty_min_bal} onChange={(e) => handleChange('sb_penalty_min_bal', e.target.value)} />
              </label>

              <label className="share-field">
                <span>Min Bal with Cheque (Staff)</span>
                <input type="text" value={formData.sb_min_bal_with_chq_staff} onChange={(e) => handleChange('sb_min_bal_with_chq_staff', e.target.value)} />
              </label>

              <label className="share-field">
                <span>Min Bal without Cheque (Staff)</span>
                <input type="text" value={formData.sb_min_bal_without_chq_staff} onChange={(e) => handleChange('sb_min_bal_without_chq_staff', e.target.value)} />
              </label>

              <label className="share-field">
                <span>Rate of Interest (Staff)</span>
                <input type="text" value={formData.sb_roi_staff} onChange={(e) => handleChange('sb_roi_staff', e.target.value)} />
              </label>

              <label className="share-field share-field--checkbox" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.sb_is_display_website} 
                  onChange={(e) => handleChange('sb_is_display_website', e.target.checked)} 
                  style={{ width: 'auto', marginBottom: 0 }}
                />
                <span style={{ marginBottom: 0 }}>IS Display Website</span>
              </label>

              <label className="share-field">
                <span>ATM Charges</span>
                <input type="text" value={formData.sb_atm_charges} onChange={(e) => handleChange('sb_atm_charges', e.target.value)} />
              </label>

              <label className="share-field">
                <span>Txn. Limit</span>
                <input type="text" value={formData.sb_txn_limit} onChange={(e) => handleChange('sb_txn_limit', e.target.value)} />
              </label>

              <label className="share-field">
                <span>Per Day Limit</span>
                <input type="text" value={formData.sb_per_day_limit} onChange={(e) => handleChange('sb_per_day_limit', e.target.value)} />
              </label>

              <div className="share-actions-row">
                <button type="button" className="share-button" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "-4px 0" }}><DotLottieReact src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> : <CheckCircle className="icon-sm" />}
                  Add/Update
                </button>
              </div>
            </div>
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
            <div className="share-parameters-card share-panel share-history-card" style={{ flexGrow: 1, overflow: 'hidden' }}>
              <h2>Previous Updated SB Parameters Record</h2>
              <div className="share-table-wrap share-table-wrap--history" style={{ maxHeight: '100%', overflowX: 'auto' }}>
                <table className="share-table share-table--history" style={{ minWidth: '1200px' }}>
                  <thead>
                    <tr>
                      <th>S.N.</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th className="right">Min Bal</th>
                      <th className="right">Max Bal</th>
                      <th className="right">ROI</th>
                      <th className="right">Min Period</th>
                      <th className="right">PreClosure Chg</th>
                      <th className="right">Penalty Min Bal</th>
                      <th className="right">Min Bal With Chq</th>
                      <th className="right">Min Bal Without Chq</th>
                      <th className="right">Roi Staff</th>
                      <th className="right">Atm Charg</th>
                      <th className="right">Txn Limt</th>
                      <th className="right">Per Day Limit</th>
                    </tr>
                  </thead>
                  <tbody>{renderHistoryRows()}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SbAccountsParameters;
