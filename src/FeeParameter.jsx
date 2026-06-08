import React, { useEffect, useState } from 'react';
import './ShareParameters.css';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';
const Shield = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const CheckCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Clock = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

const DEFAULT_FEE_SETTINGS = {
  fee_member_type: 'Share Holder',
  fee_share: '0',
  fee_adm: '0',
  fee_death: '0',
  fee_building: '0',
  fee_other1: '0',
  fee_other2: '0'
};

const FeeParameter = () => {
  const [settings, setSettings] = useState(DEFAULT_FEE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [history, setHistory] = useState([]);

  const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async ({ clearMessage = true } = {}) => {
    setIsLoading(true);
    if (clearMessage) setMessage(null);
    try {
      const token = getAuthToken();
      const [settingsRes, historyRes] = await Promise.all([
        fetch('/api/settings', { headers: { Authorization: `Bearer ${token || ''}` } }),
        fetch('/api/share-parameters/history?type=fee_parameter', { headers: { Authorization: `Bearer ${token || ''}` } }),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(prev => ({ ...prev, ...data }));
      }

      if (historyRes.ok) {
        const data = await historyRes.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error loading fee parameters:', error);
      setMessage({ type: 'error', text: 'Failed to load fee parameters.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const token = getAuthToken();
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          fee_member_type: settings.fee_member_type,
          fee_share: settings.fee_share,
          fee_adm: settings.fee_adm,
          fee_death: settings.fee_death,
          fee_building: settings.fee_building,
          fee_other1: settings.fee_other1,
          fee_other2: settings.fee_other2
        })
      });
      if (!response.ok) throw new Error('Failed to update fee parameters');
      setMessage({ type: 'success', text: 'Fee parameters updated successfully.' });
      await fetchAll({ clearMessage: false });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save fee parameters.' });
    } finally {
      setIsSaving(false);
    }
  };

  const renderHistoryRows = () => {
    if (isLoading && history.length === 0) {
      return (
        <tr>
          <td colSpan="10" className="share-empty">
            <span className="share-loading"><Clock className="icon-sm share-spin" /> Loading...</span>
          </td>
        </tr>
      );
    }
    if (history.length === 0) {
      return (
        <tr>
          <td colSpan="10" className="share-empty">No fee parameter history found.</td>
        </tr>
      );
    }
    return history.map((row, idx) => {
      const current = row.current_values || {};
      const prev = row.previous_values || {};
      return (
        <tr key={row.id}>
          <td className="muted">{idx + 1}</td>
          <td className="muted">{new Date(row.created_at).toLocaleString()}</td>
          <td>{current.fee_member_type || prev.fee_member_type || 'Share Holder'}</td>
          <td className="right">{Number(current.fee_share || prev.fee_share || 0).toFixed(2)}</td>
          <td className="right">{current.fee_adm || prev.fee_adm || '0'}</td>
          <td className="right">{current.fee_death || prev.fee_death || '0'}</td>
          <td className="right">{current.fee_building || prev.fee_building || '0'}</td>
          <td className="right">{current.fee_other1 || prev.fee_other1 || '0'}</td>
          <td className="right">0</td> {/* APP FEE hardcoded to 0 based on legacy */}
          <td className="right">{Number(current.fee_other2 || prev.fee_other2 || 0).toFixed(2)}</td>
        </tr>
      );
    });
  };

  return (
    <div className="share-parameters-page">
      <div className="share-parameters-shell">
        {message && (
          <div className={`share-message ${message.type === 'success' ? 'share-message--success' : 'share-message--error'}`}>
            {message.type === 'success' ? <CheckCircle className="icon-sm" /> : <Shield className="icon-sm" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="share-layout">
          <section className="share-parameters-card share-panel">
            <h2>Fee Parameter</h2>
            <div className="share-form">
              <label className="share-field">
                <span>Member Type</span>
                <select value={settings.fee_member_type} onChange={(e) => handleChange('fee_member_type', e.target.value)}>
                  <option value="Share Holder">Share Holder</option>
                </select>
              </label>

              <label className="share-field">
                <span>Share Fee</span>
                <input type="text" value={settings.fee_share} onChange={(e) => handleChange('fee_share', e.target.value)} />
              </label>

              <label className="share-field">
                <span>ADMFEE</span>
                <input type="text" value={settings.fee_adm} onChange={(e) => handleChange('fee_adm', e.target.value)} />
              </label>

              <label className="share-field">
                <span>Death Fund Fee</span>
                <input type="text" value={settings.fee_death} onChange={(e) => handleChange('fee_death', e.target.value)} />
              </label>

              <label className="share-field">
                <span>Building Fund Fee</span>
                <input type="text" value={settings.fee_building} onChange={(e) => handleChange('fee_building', e.target.value)} />
              </label>

              <label className="share-field">
                <span>Other Fee1</span>
                <input type="text" value={settings.fee_other1} onChange={(e) => handleChange('fee_other1', e.target.value)} />
              </label>

              <label className="share-field">
                <span>Other Fee2</span>
                <input type="text" value={settings.fee_other2} onChange={(e) => handleChange('fee_other2', e.target.value)} />
              </label>

              <div className="share-actions-row">
                <button type="button" className="share-button" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "-4px 0" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> : <CheckCircle className="icon-sm" />}
                  Update
                </button>
                <button type="button" className="share-button-secondary" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "-4px 0" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> : <CheckCircle className="icon-sm" />}
                  Submit
                </button>
              </div>
            </div>
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="share-parameters-card share-panel share-history-card">
              <h2>Current Fee Parameter Record</h2>
              <div className="share-table-wrap share-table-wrap--history">
                <table className="share-table share-table--history">
                  <thead>
                    <tr>
                      <th>S.N.</th>
                      <th>MEMTYPE NAME</th>
                      <th className="right">SHARE FEE</th>
                      <th className="right">ADMIN FEE</th>
                      <th className="right">DEATH FUND</th>
                      <th className="right">BULDING</th>
                      <th className="right">OTHER FEE1</th>
                      <th className="right">OTHER FEE2</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="muted">1</td>
                      <td className="strong">{settings.fee_member_type || 'Share Holder'}</td>
                      <td className="right">{Number(settings.fee_share || 0).toFixed(2)}</td>
                      <td className="right">{settings.fee_adm || '0'}</td>
                      <td className="right">{settings.fee_death || '0'}</td>
                      <td className="right">{settings.fee_building || '0'}</td>
                      <td className="right">{settings.fee_other1 || '0'}</td>
                      <td className="right">{Number(settings.fee_other2 || 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="share-parameters-card share-panel share-history-card" style={{ flexGrow: 1 }}>
              <h2>Previous Updated Fee Parameter Record</h2>
              <div className="share-table-wrap share-table-wrap--history" style={{ maxHeight: 'calc(100% - 40px)' }}>
                <table className="share-table share-table--history">
                  <thead>
                    <tr>
                      <th>S.N.</th>
                      <th>Date</th>
                      <th>Mem Type</th>
                      <th className="right">Share Fee</th>
                      <th className="right">Adm Fee</th>
                      <th className="right">Dateh Fee</th>
                      <th className="right">BUL FEE</th>
                      <th className="right">PPN FEE</th>
                      <th className="right">APP FEE</th>
                      <th className="right">Nom Fee</th>
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

export default FeeParameter;
