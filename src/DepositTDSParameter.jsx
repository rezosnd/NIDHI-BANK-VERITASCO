import React, { useEffect, useState } from 'react';
import './ShareParameters.css';
import { DotLottiePlayer } from '@lottiefiles/dotlottie-react';

const Shield = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const CheckCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Clock = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const Edit2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const Trash2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

const DepositTDSParameter = () => {
  const [tdsParameters, setTdsParameters] = useState([]);
  const [tdsTypes, setTdsTypes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    tds_type: '0',
    min_tds_amount: '0.00',
    max_tds_amount: '0.00',
    normal_tds_pancard: '0.00',
    sc_tds_pancard: '0.00',
    normal_tds_no_pancard: '0.00',
    sc_tds_no_pancard: '0.00'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/settings', { headers: { Authorization: `Bearer ${token || ''}` } });

      if (res.ok) {
        const data = await res.json();
        if (data.deposit_tds_parameters && Array.isArray(data.deposit_tds_parameters)) {
          setTdsParameters(data.deposit_tds_parameters);
        }

        let fetchedTdsTypes = data.tds_types || [];
        setTdsTypes(fetchedTdsTypes);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (formData.tds_type === '0') return setMessage({ type: 'error', text: 'Select TDS Type' });
    if (Number(formData.max_tds_amount) <= Number(formData.min_tds_amount)) {
      return setMessage({ type: 'error', text: 'Max TDS amount should be greater than Min TDS amount' });
    }

    setIsSaving(true);
    setMessage(null);
    try {
      const token = getAuthToken();
      let updatedParameters = [...tdsParameters];
      
      if (isEditing) {
        updatedParameters = updatedParameters.map(p => 
          p.id === editId ? { ...formData, id: editId, updated_at: new Date().toISOString() } : p
        );
      } else {
        const newId = tdsParameters.length > 0 ? Math.max(...tdsParameters.map(p => p.id)) + 1 : 1;
        updatedParameters.push({ ...formData, id: newId, created_at: new Date().toISOString() });
      }
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ deposit_tds_parameters: updatedParameters })
      });
      
      if (!response.ok) throw new Error('Failed to update deposit tds parameters');
      
      setMessage({ type: 'success', text: `Deposit TDS Parameter ${isEditing ? 'updated' : 'added'} successfully.` });
      handleCancel();
      setTdsParameters(updatedParameters);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save parameter.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMessage(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this TDS parameter?')) return;
    
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const updatedParameters = tdsParameters.filter(p => p.id !== id);
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ deposit_tds_parameters: updatedParameters })
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      setTdsParameters(updatedParameters);
      setMessage({ type: 'success', text: 'TDS Parameter deleted successfully.' });
      if (isEditing && editId === id) handleCancel();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to delete parameter.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      tds_type: '0',
      min_tds_amount: '0.00',
      max_tds_amount: '0.00',
      normal_tds_pancard: '0.00',
      sc_tds_pancard: '0.00',
      normal_tds_no_pancard: '0.00',
      sc_tds_no_pancard: '0.00'
    });
    setIsEditing(false);
    setEditId(null);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="share-parameters-page" style={{ paddingBottom: '40px' }}>
      <div className="share-parameters-shell" style={{ maxWidth: '1000px' }}>
        
        {message && (
          <div className={`share-message ${message.type === 'success' ? 'share-message--success' : 'share-message--error'}`}>
            {message.type === 'success' ? <CheckCircle className="icon-sm" /> : <Shield className="icon-sm" />}
            <span>{message.text}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>
          <section className="share-parameters-card share-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Deposit TDS Parameter's</h2>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Group 1: TDS Type and Amounts */}
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <label className="share-field" style={{ flex: '1 1 300px', marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold' }}>TDS Type: <span style={{ color: 'red' }}>*</span></span>
                  <select name="tds_type" value={formData.tds_type} onChange={handleInputChange} style={{ marginBottom: 0 }}>
                    <option value="0">Select TDS Type</option>
                    {tdsTypes.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </label>
                
                <div style={{ flex: '1 1 100%', display: 'flex', gap: '20px', marginTop: '10px' }}>
                  <label className="share-field" style={{ flex: 1, marginBottom: 0 }}>
                    <span style={{ fontWeight: 'bold' }}>Min TDS Amount: <span style={{ color: 'red' }}>*</span></span>
                    <input type="number" name="min_tds_amount" value={formData.min_tds_amount} onChange={handleInputChange} style={{ marginBottom: 0 }} />
                  </label>
                  <label className="share-field" style={{ flex: 1, marginBottom: 0 }}>
                    <span style={{ fontWeight: 'bold' }}>Max TDS Amount: <span style={{ color: 'red' }}>*</span></span>
                    <input type="number" name="max_tds_amount" value={formData.max_tds_amount} onChange={handleInputChange} style={{ marginBottom: 0 }} />
                  </label>
                </div>
              </div>

              {/* Group 2: PAN Card Settings */}
              <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <label className="share-field" style={{ flex: '1 1 300px', marginBottom: 0 }}>
                    <span style={{ fontWeight: 'bold' }}>Normal TDS Value (%) With PanCard: <span style={{ color: 'red' }}>*</span></span>
                    <input type="number" step="0.01" name="normal_tds_pancard" value={formData.normal_tds_pancard} onChange={handleInputChange} style={{ marginBottom: 0 }} />
                  </label>
                  <label className="share-field" style={{ flex: '1 1 300px', marginBottom: 0 }}>
                    <span style={{ fontWeight: 'bold' }}>Senior citizens TDS Value (%) With PanCard: <span style={{ color: 'red' }}>*</span></span>
                    <input type="number" step="0.01" name="sc_tds_pancard" value={formData.sc_tds_pancard} onChange={handleInputChange} style={{ marginBottom: 0 }} />
                  </label>
                </div>
                
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <label className="share-field" style={{ flex: '1 1 300px', marginBottom: 0 }}>
                    <span style={{ fontWeight: 'bold' }}>Normal TDS Value (%) No PanCard: <span style={{ color: 'red' }}>*</span></span>
                    <input type="number" step="0.01" name="normal_tds_no_pancard" value={formData.normal_tds_no_pancard} onChange={handleInputChange} style={{ marginBottom: 0 }} />
                  </label>
                  <label className="share-field" style={{ flex: '1 1 300px', marginBottom: 0 }}>
                    <span style={{ fontWeight: 'bold' }}>Senior citizens TDS Value (%) No PanCard: <span style={{ color: 'red' }}>*</span></span>
                    <input type="number" step="0.01" name="sc_tds_no_pancard" value={formData.sc_tds_no_pancard} onChange={handleInputChange} style={{ marginBottom: 0 }} />
                  </label>
                </div>
              </div>

              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="share-button" disabled={isSaving}>
                  {isSaving ? <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "-4px 0" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> : <CheckCircle className="icon-sm" />}
                  {isEditing ? 'Update' : 'Submit'}
                </button>
                {isEditing && (
                  <button type="button" className="share-button" style={{ backgroundColor: '#64748b' }} onClick={handleCancel}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="share-parameters-card share-panel share-history-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#e11d48' }}>Previous Updated TDS Parameter Record</h3>
            </div>
            <div className="share-table-wrap share-table-wrap--history">
              <table className="share-table share-table--history">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>S.N.</th>
                    <th>Date</th>
                    <th>TDS Type</th>
                    <th>Min TDS Amt</th>
                    <th>Max TDS Amt</th>
                    <th>Normal TDS With PanCard</th>
                    <th>SC TDS With PanCard</th>
                    <th>Normal TDS No PanCard</th>
                    <th>SC TDS No PanCard</th>
                    <th className="center" style={{ width: '80px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tdsParameters.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="share-empty">No TDS Parameters configured.</td>
                    </tr>
                  ) : (
                    tdsParameters.map((p, index) => (
                      <tr key={p.id}>
                        <td>{index + 1}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(p.created_at || p.updated_at)}</td>
                        <td>{p.tds_type}</td>
                        <td>{Number(p.min_tds_amount).toFixed(2)}</td>
                        <td>{Number(p.max_tds_amount).toFixed(2)}</td>
                        <td>{Number(p.normal_tds_pancard).toFixed(2)}</td>
                        <td>{Number(p.sc_tds_pancard).toFixed(2)}</td>
                        <td>{Number(p.normal_tds_no_pancard).toFixed(2)}</td>
                        <td>{Number(p.sc_tds_no_pancard).toFixed(2)}</td>
                        <td className="center">
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button type="button" onClick={() => handleEdit(p)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}>
                              <Edit2 className="icon-sm" />
                            </button>
                            <button type="button" onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                              <Trash2 className="icon-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DepositTDSParameter;
