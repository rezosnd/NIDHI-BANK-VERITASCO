import React, { useEffect, useState } from 'react';
import './ShareParameters.css';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';

const Shield = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const CheckCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Clock = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const EditIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const XIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const DEFAULT_SB_TYPES = [
  { id: 1, name: 'SAVING ACCOUNT', status: 'Active' },
  { id: 2, name: 'SNL Saving Account', status: 'Active' },
  { id: 3, name: 'Student Saving Account', status: 'Active' },
  { id: 4, name: 'Salary Saving Account', status: 'Active' },
  { id: 5, name: 'Senior Citizen Saving Account', status: 'Active' }
];

const DEFAULT_OD_TYPES = [
  { id: 1, name: 'Standard OD Account', status: 'Active' },
  { id: 2, name: 'Business OD Account', status: 'Active' }
];

const SbAccountType = () => {
  const [accountCategory, setAccountCategory] = useState('SB'); // 'SB' or 'OD'
  const [sbTypes, setSbTypes] = useState(DEFAULT_SB_TYPES);
  const [odTypes, setOdTypes] = useState(DEFAULT_OD_TYPES);
  
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', status: 'Active' });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async ({ clearMessage = true } = {}) => {
    setIsLoading(true);
    if (clearMessage) setMessage(null);
    try {
      const token = getAuthToken();
      const settingsRes = await fetch('/api/settings', { headers: { Authorization: `Bearer ${token || ''}` } });

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.sb_account_types && Array.isArray(data.sb_account_types)) {
          setSbTypes(data.sb_account_types);
        }
        if (data.od_account_types && Array.isArray(data.od_account_types)) {
          setOdTypes(data.od_account_types);
        }
      }
    } catch (error) {
      console.error('Error loading account types:', error);
      setMessage({ type: 'error', text: 'Failed to load Account Types.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (type) => {
    setEditingId(type.id);
    setFormData({ name: type.name, status: type.status || 'Active' });
    setMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', status: 'Active' });
    setMessage(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Account type name is required.' });
      return;
    }
    
    setIsSaving(true);
    setMessage(null);
    try {
      const token = getAuthToken();
      
      let updatedTypes;
      const currentList = accountCategory === 'SB' ? sbTypes : odTypes;
      const keyName = accountCategory === 'SB' ? 'sb_account_types' : 'od_account_types';

      if (editingId) {
        updatedTypes = currentList.map(t => t.id === editingId ? { ...t, name: formData.name.trim(), status: formData.status } : t);
      } else {
        const newId = currentList.length > 0 ? Math.max(...currentList.map(t => t.id)) + 1 : 1;
        updatedTypes = [...currentList, { id: newId, name: formData.name.trim(), status: formData.status }];
      }
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ [keyName]: updatedTypes })
      });
      
      if (!response.ok) throw new Error('Failed to update account types');
      
      setMessage({ type: 'success', text: `Account type ${editingId ? 'updated' : 'added'} successfully.` });
      
      if (accountCategory === 'SB') setSbTypes(updatedTypes);
      else setOdTypes(updatedTypes);

      handleCancelEdit();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save account type.' });
    } finally {
      setIsSaving(false);
    }
  };

  const activeList = accountCategory === 'SB' ? sbTypes : odTypes;

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
          <section className="share-parameters-card share-panel" style={{ flexBasis: '400px', flexGrow: 0 }}>
            <h2>{editingId ? 'Edit Account Type' : 'Add Account Type'}</h2>
            <div className="share-form">
              <label className="share-field">
                <span>Account Type Name</span>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g., Premium Saving Account"
                />
              </label>

              <label className="share-field">
                <span>Status</span>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>

              <div className="share-actions-row">
                <button type="button" className="share-button" onClick={handleSave} disabled={isSaving || !formData.name.trim()}>
                  {isSaving ? <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "-4px 0" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> : <CheckCircle className="icon-sm" />}
                  {editingId ? 'Update Type' : 'Add Type'}
                </button>
                {editingId && (
                  <button type="button" className="share-button-secondary" onClick={handleCancelEdit} disabled={isSaving}>
                    <XIcon className="icon-sm" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
            <div className="share-parameters-card share-panel share-history-card" style={{ flexGrow: 1, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2>SB / OD Accounts Type</h2>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>Select Category:</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, color: '#475569' }}>
                    <input 
                      type="radio" 
                      name="accountCategory" 
                      value="SB" 
                      checked={accountCategory === 'SB'} 
                      onChange={() => { setAccountCategory('SB'); handleCancelEdit(); }} 
                      style={{ margin: 0, width: '16px', height: '16px' }}
                    />
                    <span style={{ fontWeight: '500' }}>SB</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, color: '#475569' }}>
                    <input 
                      type="radio" 
                      name="accountCategory" 
                      value="OD" 
                      checked={accountCategory === 'OD'} 
                      onChange={() => { setAccountCategory('OD'); handleCancelEdit(); }}
                      style={{ margin: 0, width: '16px', height: '16px' }}
                    />
                    <span style={{ fontWeight: '500' }}>OD</span>
                  </label>
                </div>
              </div>

              <div className="share-table-wrap share-table-wrap--history">
                <table className="share-table share-table--history">
                  <thead>
                    <tr>
                      <th>Sl No</th>
                      <th>Account Type</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && activeList.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="share-empty">
                          <span className="share-loading"><Clock className="icon-sm share-spin" /> Loading...</span>
                        </td>
                      </tr>
                    ) : activeList.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="share-empty">No account types found.</td>
                      </tr>
                    ) : (
                      activeList.map((type, idx) => (
                        <tr key={type.id} className={editingId === type.id ? 'highlight-row' : ''}>
                          <td className="muted" style={{ width: '60px' }}>{idx + 1}</td>
                          <td className="strong">{type.name}</td>
                          <td>
                            <span style={{ 
                              display: 'inline-block', 
                              padding: '2px 8px', 
                              borderRadius: '12px', 
                              fontSize: '0.8rem', 
                              fontWeight: '600',
                              backgroundColor: type.status === 'Active' ? '#dcfce7' : '#fee2e2',
                              color: type.status === 'Active' ? '#166534' : '#991b1b'
                            }}>
                              {type.status || 'Active'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              onClick={() => handleEditClick(type)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#2563eb', 
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: '500'
                              }}
                            >
                              <EditIcon style={{ width: '16px', height: '16px' }} />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SbAccountType;
