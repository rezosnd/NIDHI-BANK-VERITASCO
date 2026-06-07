import React, { useState, useEffect } from 'react';

function CreateServiceCenter() {
  const [branches, setBranches] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [displayOnBranchPage, setDisplayOnBranchPage] = useState(true);

  const [formData, setFormData] = useState({
    branch_id: '',
    name: '',
    code: '',
    state_id: '',
    address: '',
    contact_name: '',
    phone_no: '',
    mobile_no: '',
    email: '',
    pin_code: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [branchRes, stateRes] = await Promise.all([
        fetch('/api/branches', { headers }),
        fetch('/api/states', { headers })
      ]);

      if (branchRes.ok) setBranches(await branchRes.json());
      if (stateRes.ok) setStates(await stateRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.branch_id) {
      showError('Select Branch');
      return;
    }
    if (!formData.name) {
      showError('Enter Service Center Name');
      return;
    }
    if (!formData.code) {
      showError('Enter Service Center Code');
      return;
    }
    if (!formData.state_id) {
      showError('Select State Name');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/service-centers', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, display_on_branch_page: displayOnBranchPage })
      });
      
      if (res.ok) {
        setSuccessMsg('Service Center created successfully!');
        setFormData({
          branch_id: '', name: '', code: '', state_id: '', address: '',
          contact_name: '', phone_no: '', mobile_no: '', email: '', pin_code: ''
        });
        setDisplayOnBranchPage(true);
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        const errData = await res.json();
        showError(errData.message || 'Failed to create service center');
      }
    } catch (err) {
      showError('Failed to create service center');
    } finally {
      setLoading(false);
    }
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  return (
    <div style={{ padding: '0 0 4rem 0', maxWidth: '100%', margin: '0' }}>
      {successMsg && (
        <div style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 16px', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ backgroundColor: '#ef4444', color: 'white', padding: '12px 16px', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {errorMsg}
        </div>
      )}

      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '6px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase' }}>Create Service Center</h3>
        </div>
        
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Select Branch:<span style={{color: '#ef4444', marginLeft: '4px'}}>*</span></label>
            <select name="branch_id" value={formData.branch_id} onChange={handleInputChange} style={inputStyle} disabled={loading}>
              <option value="">Select Branch</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Name:<span style={{color: '#ef4444', marginLeft: '4px'}}>*</span></label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} maxLength={50} style={inputStyle} disabled={loading} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Code:<span style={{color: '#ef4444', marginLeft: '4px'}}>*</span></label>
            <input type="text" name="code" value={formData.code} onChange={handleInputChange} maxLength={2} style={inputStyle} disabled={loading} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>State:<span style={{color: '#ef4444', marginLeft: '4px'}}>*</span></label>
            <select name="state_id" value={formData.state_id} onChange={handleInputChange} style={inputStyle} disabled={loading}>
              <option value="">Select State Name</option>
              {states.map(s => (
                <option key={s.id} value={s.id}>{s.state_name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', alignItems: 'start' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginTop: '10px' }}>Address:</label>
            <textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} style={{...inputStyle, resize: 'vertical', minHeight: '60px'}} disabled={loading} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Contact Name:</label>
            <input type="text" name="contact_name" value={formData.contact_name} onChange={handleInputChange} style={inputStyle} disabled={loading} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Phone No:</label>
            <input type="text" name="phone_no" value={formData.phone_no} onChange={handleInputChange} maxLength={10} style={inputStyle} disabled={loading} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Mobile No:</label>
            <input type="text" name="mobile_no" value={formData.mobile_no} onChange={handleInputChange} maxLength={10} style={inputStyle} disabled={loading} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={inputStyle} disabled={loading} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Pin Code:</label>
            <input type="text" name="pin_code" value={formData.pin_code} onChange={handleInputChange} maxLength={6} style={inputStyle} disabled={loading} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>DISPLAY ON BRANCH PAGE:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '38px' }}>
              <input 
                type="checkbox" 
                id="displayOnBranchPage"
                checked={displayOnBranchPage} 
                onChange={(e) => setDisplayOnBranchPage(e.target.checked)} 
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="displayOnBranchPage" style={{ fontSize: '13px', color: '#334155', cursor: 'pointer', userSelect: 'none' }}>
                Display on Branch Page
              </label>
            </div>
          </div>

          <div style={{ marginTop: '0.5rem', gridColumn: '1 / -1', display: 'flex', gap: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1.5rem' }}>
            <button type="submit" disabled={loading} style={buttonStyle('#2563eb')}>
              {loading ? 'PROCESSING...' : 'SAVE SERVICE CENTER'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '4px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  color: '#0f172a',
  backgroundColor: '#ffffff',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
};

const buttonStyle = (bgColor) => ({
  backgroundColor: bgColor,
  color: 'white',
  padding: '12px 24px',
  borderRadius: '4px',
  border: 'none',
  fontWeight: '700',
  fontSize: '12px',
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  transition: 'all 0.2s',
  boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
  width: '120px'
});

export default CreateServiceCenter;
