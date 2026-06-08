import React, { useEffect, useState } from 'react';
import './ShareParameters.css';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';

const Shield = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const CheckCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Clock = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const Edit2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;

const AddServiceCharge = () => {
  const [charges, setCharges] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    charge_name: '',
    is_active: true
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
        if (data.loan_service_charges && Array.isArray(data.loan_service_charges)) {
          setCharges(data.loan_service_charges);
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setMessage(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formData.charge_name.trim()) return setMessage({ type: 'error', text: 'Enter The Charge Name' });

    setIsSaving(true);
    setMessage(null);
    try {
      const token = getAuthToken();
      let updatedCharges = [...charges];
      
      if (isEditing) {
        updatedCharges = updatedCharges.map(c => 
          c.id === editId ? { ...formData, id: editId, updated_at: new Date().toISOString() } : c
        );
      } else {
        const newId = charges.length > 0 ? Math.max(...charges.map(c => c.id)) + 1 : 1;
        updatedCharges.push({ ...formData, id: newId, created_at: new Date().toISOString() });
      }
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ loan_service_charges: updatedCharges })
      });
      
      if (!response.ok) throw new Error('Failed to update service charges');
      
      setMessage({ type: 'success', text: `Service charge ${isEditing ? 'updated' : 'added'} successfully.` });
      handleCancel();
      setCharges(updatedCharges);
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

  const handleCancel = () => {
    setFormData({
      charge_name: '',
      is_active: true
    });
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className="share-parameters-page" style={{ paddingBottom: '40px' }}>
      <div className="share-parameters-shell" style={{ maxWidth: '800px' }}>
        
        {message && (
          <div className={`share-message ${message.type === 'success' ? 'share-message--success' : 'share-message--error'}`}>
            {message.type === 'success' ? <CheckCircle className="icon-sm" /> : <Shield className="icon-sm" />}
            <span>{message.text}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>
          <section className="share-parameters-card share-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>ADD/VIEW LOAN SERVICE CHARGES</h2>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <label className="share-field" style={{ marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold' }}>Service Charge Name: <span style={{ color: 'red' }}>*</span></span>
                  <input type="text" name="charge_name" value={formData.charge_name} onChange={handleInputChange} style={{ marginBottom: 0 }} placeholder="e.g. DOCUMENT CHARGES" />
                </label>

                <div className="share-field" style={{ marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold' }}>Is Active :</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '8px' }}>
                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} style={{ width: '18px', height: '18px' }} />
                    Active
                  </label>
                </div>
              </div>

              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', gap: '10px' }}>
                <button type="submit" className="share-button" disabled={isSaving}>
                  {isSaving ? <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "-4px 0" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> : <CheckCircle className="icon-sm" />}
                  {isEditing ? 'Update' : 'Add'}
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
            <div className="share-table-wrap share-table-wrap--history">
              <table className="share-table share-table--history">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>S.N.</th>
                    <th>Service Charge Name</th>
                    <th>Status</th>
                    <th className="center" style={{ width: '80px' }}>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {charges.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="share-empty">No loan service charges added yet.</td>
                    </tr>
                  ) : (
                    charges.map((c, index) => (
                      <tr key={c.id}>
                        <td>{index + 1}</td>
                        <td style={{ fontWeight: '600' }}>{c.charge_name}</td>
                        <td>
                          {c.is_active ? 
                            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Active</span> : 
                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Inactive</span>
                          }
                        </td>
                        <td className="center">
                          <button type="button" onClick={() => handleEdit(c)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}>
                            <Edit2 className="icon-sm" />
                          </button>
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

export default AddServiceCharge;
