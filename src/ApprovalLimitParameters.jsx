import React, { useEffect, useState } from 'react';
import './ShareParameters.css';
import { DotLottiePlayer } from '@lottiefiles/dotlottie-react';

const Shield = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const CheckCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Clock = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

const ApprovalLimitParameters = () => {
  const [limits, setLimits] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [formData, setFormData] = useState({
    transaction_type: '0',
    branch_id: '0',
    user_name: '0',
    limit_amount: ''
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
      
      const [settingsRes, branchesRes, usersRes] = await Promise.all([
        fetch('/api/settings', { headers: { Authorization: `Bearer ${token || ''}` } }),
        fetch('/api/branches', { headers: { Authorization: `Bearer ${token || ''}` } }),
        fetch('/api/users', { headers: { Authorization: `Bearer ${token || ''}` } })
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.approval_limit_parameters && Array.isArray(data.approval_limit_parameters)) {
          setLimits(data.approval_limit_parameters);
        }
      }
      
      if (branchesRes.ok) {
        const data = await branchesRes.json();
        setBranches(Array.isArray(data) ? data : []);
      }
      
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(Array.isArray(data) ? data : []);
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
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Reset user selection if branch changes
      if (name === 'branch_id') {
        newData.user_name = '0';
      }
      return newData;
    });
    setMessage(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (formData.transaction_type === '0') return setMessage({ type: 'error', text: 'Select type' });
    if (formData.branch_id === '0') return setMessage({ type: 'error', text: 'Select branch' });
    if (formData.user_name === '0') return setMessage({ type: 'error', text: 'Select user' });
    if (!formData.limit_amount) return setMessage({ type: 'error', text: 'Enter Limit Amount' });

    setIsSaving(true);
    setMessage(null);
    try {
      const token = getAuthToken();
      const newId = limits.length > 0 ? Math.max(...limits.map(l => l.id)) + 1 : 1;
      
      const limitToAdd = {
        id: newId,
        transaction_type: formData.transaction_type,
        branch_id: parseInt(formData.branch_id),
        user_name: formData.user_name,
        limit_amount: parseFloat(formData.limit_amount),
        created_at: new Date().toISOString()
      };
      
      const updatedLimits = [...limits, limitToAdd];
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ approval_limit_parameters: updatedLimits })
      });
      
      if (!response.ok) throw new Error('Failed to update limits');
      
      setMessage({ type: 'success', text: 'Approval limit parameter added successfully.' });
      setFormData({
        transaction_type: '0',
        branch_id: '0',
        user_name: '0',
        limit_amount: ''
      });
      setLimits(updatedLimits);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save parameter.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter users based on selected branch
  const filteredUsers = users.filter(u => u.branch_id === parseInt(formData.branch_id) || !formData.branch_id || formData.branch_id === '0');

  const getBranchName = (id) => {
    const b = branches.find(b => b.id === parseInt(id));
    return b ? b.name : 'Unknown Branch';
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

        <section className="share-parameters-card share-panel" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Approval Limit Parameters</h2>
          </div>
          
          <form onSubmit={handleSave} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <label className="share-field" style={{ flex: 1, minWidth: '300px', marginBottom: 0 }}>
              <span style={{ fontWeight: 'bold' }}>Type of Transaction <span style={{ color: 'red' }}>*</span></span>
              <select name="transaction_type" value={formData.transaction_type} onChange={handleInputChange}>
                <option value="0">Select Type</option>
                <option value="Deposite">Deposite</option>
                <option value="Payment">Payment</option>
                <option value="Transfer">Transfer</option>
              </select>
            </label>

            <label className="share-field" style={{ flex: 1, minWidth: '300px', marginBottom: 0 }}>
              <span style={{ fontWeight: 'bold' }}>Branch Name <span style={{ color: 'red' }}>*</span></span>
              <select name="branch_id" value={formData.branch_id} onChange={handleInputChange}>
                <option value="0">Select Branch</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>

            <label className="share-field" style={{ flex: 1, minWidth: '300px', marginBottom: 0 }}>
              <span style={{ fontWeight: 'bold' }}>User Name <span style={{ color: 'red' }}>*</span></span>
              <select name="user_name" value={formData.user_name} onChange={handleInputChange}>
                <option value="0">Select User</option>
                {filteredUsers.map(u => (
                  <option key={u.id} value={u.username}>{u.username}</option>
                ))}
              </select>
            </label>

            <label className="share-field" style={{ flex: 1, minWidth: '300px', marginBottom: 0 }}>
              <span style={{ fontWeight: 'bold' }}>Limit Amount: <span style={{ color: 'red' }}>*</span></span>
              <input 
                type="text" 
                name="limit_amount"
                value={formData.limit_amount} 
                onChange={(e) => setFormData({...formData, limit_amount: e.target.value.replace(/[^0-9]/g, '')})}
                placeholder="0.00"
              />
            </label>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
                <button type="submit" className="share-button" disabled={isSaving}>
                  {isSaving ? <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "-4px 0" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> : <CheckCircle className="icon-sm" />}
                  Save Parameter
                </button>
            </div>
          </form>
        </section>

        <section className="share-parameters-card share-panel share-history-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Previous Updated Approval Limit Parameters Record</h3>
          </div>
          <div className="share-table-wrap share-table-wrap--history">
            <table className="share-table share-table--history">
              <thead>
                <tr>
                  <th>S.N.</th>
                  <th>Date</th>
                  <th>Type Trans</th>
                  <th>Branch Name</th>
                  <th>User Name</th>
                  <th className="right">Limit Amt</th>
                </tr>
              </thead>
              <tbody>
                {limits.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="share-empty">No approval limit records found.</td>
                  </tr>
                ) : (
                  limits.slice().reverse().map((limit, index) => (
                    <tr key={limit.id}>
                      <td>{limits.length - index}</td>
                      <td>{new Date(limit.created_at).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })}</td>
                      <td>{limit.transaction_type}</td>
                      <td>{getBranchName(limit.branch_id)}</td>
                      <td>{limit.user_name}</td>
                      <td className="right strong">{Number(limit.limit_amount).toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
        
      </div>
    </div>
  );
};

export default ApprovalLimitParameters;
