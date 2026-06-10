import React, { useEffect, useState } from 'react';
import './ShareParameters.css';
import { DotLottiePlayer } from '@lottiefiles/dotlottie-react';

const Shield = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const CheckCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Clock = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

const LateFeesSettings = () => {
  const [lateFees, setLateFees] = useState([]);
  
  const [formData, setFormData] = useState({
    premium_type: '0',
    late_fees: '',
    grace_period: '1'
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
        if (data.late_fees && Array.isArray(data.late_fees)) {
          setLateFees(data.late_fees);
        } else {
          setLateFees([]); // Strictly dynamic, no demo data
        }
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
    
    if (formData.premium_type === '0') return setMessage({ type: 'error', text: 'Select Premium Type.' });
    if (formData.late_fees === '') return setMessage({ type: 'error', text: 'Late Fee(%) is Required' });
    if (formData.grace_period === '') return setMessage({ type: 'error', text: 'Grace Period is Required' });

    setIsSaving(true);
    setMessage(null);
    try {
      const token = getAuthToken();
      let updatedFees = [...lateFees];
      
      const newId = lateFees.length > 0 ? Math.max(...lateFees.map(f => f.id)) + 1 : 1;
      updatedFees.push({ ...formData, id: newId, created_at: new Date().toISOString() });
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ late_fees: updatedFees })
      });
      
      if (!response.ok) throw new Error('Failed to update late fees');
      
      setMessage({ type: 'success', text: `Late Fee Parameter added successfully.` });
      setFormData({ premium_type: '0', late_fees: '', grace_period: '1' });
      setLateFees(updatedFees);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save parameter.' });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getPremiumTypeName = (val) => {
    const mapping = {
      '1': 'Daily',
      '2': 'Monthly',
      '3': 'Quarterly',
      '4': 'Half Yearly',
      '5': 'Yearly'
    };
    return mapping[val] || val;
  };

  return (
    <div className="share-parameters-page" style={{ paddingBottom: '40px' }}>
      <div className="share-parameters-shell" style={{ maxWidth: '900px' }}>
        
        {message && (
          <div className={`share-message ${message.type === 'success' ? 'share-message--success' : 'share-message--error'}`}>
            {message.type === 'success' ? <CheckCircle className="icon-sm" /> : <Shield className="icon-sm" />}
            <span>{message.text}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>
          <section className="share-parameters-card share-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Late Fees Settings</h2>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <label className="share-field" style={{ marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold' }}>Premium Type : <span style={{ color: 'red' }}>*</span></span>
                  <select name="premium_type" value={formData.premium_type} onChange={handleInputChange} style={{ marginBottom: 0 }}>
                    <option value="0">Select Premium</option>
                    <option value="1">Daily</option>
                    <option value="2">Monthly</option>
                    <option value="3">Quarterly</option>
                    <option value="4">Half Yearly</option>
                    <option value="5">Yearly</option>
                  </select>
                </label>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <label className="share-field" style={{ flex: 1, marginBottom: 0 }}>
                    <span style={{ fontWeight: 'bold' }}>Late Fees(%) : <span style={{ color: 'red' }}>*</span></span>
                    <input type="number" step="0.01" name="late_fees" value={formData.late_fees} onChange={handleInputChange} style={{ marginBottom: 0 }} />
                  </label>
                  <label className="share-field" style={{ flex: 1, marginBottom: 0 }}>
                    <span style={{ fontWeight: 'bold' }}>Grace Period(Days): <span style={{ color: 'red' }}>*</span></span>
                    <input type="number" name="grace_period" value={formData.grace_period} onChange={handleInputChange} style={{ marginBottom: 0 }} />
                  </label>
                </div>
              </div>

              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
                <button type="submit" className="share-button" disabled={isSaving}>
                  {isSaving ? <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "-4px 0" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> : <CheckCircle className="icon-sm" />}
                  Update
                </button>
              </div>
            </form>
          </section>

          <section className="share-parameters-card share-panel share-history-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#e11d48' }}>Previous Updated Late fees Parameter Record</h3>
            </div>
            <div className="share-table-wrap share-table-wrap--history">
              <table className="share-table share-table--history">
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>S.N.</th>
                    <th>Date</th>
                    <th>Premium Typ</th>
                    <th>Late Fee</th>
                    <th>Grace</th>
                  </tr>
                </thead>
                <tbody>
                  {lateFees.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="share-empty">No Late Fees Parameters configured.</td>
                    </tr>
                  ) : (
                    lateFees.map((p, index) => (
                      <tr key={p.id}>
                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(p.created_at)}</td>
                        <td>{getPremiumTypeName(p.premium_type)}</td>
                        <td>{Number(p.late_fees).toFixed(2)}</td>
                        <td>{p.grace_period}</td>
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

export default LateFeesSettings;
