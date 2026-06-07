import React, { useState, useEffect } from 'react';

function ViewServiceCenter() {
  const [serviceCenters, setServiceCenters] = useState([]);
  const [branches, setBranches] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [scRes, branchRes, stateRes] = await Promise.all([
        fetch('/api/service-centers', { headers }),
        fetch('/api/branches', { headers }),
        fetch('/api/states', { headers })
      ]);

      if (scRes.ok) setServiceCenters(await scRes.json());
      if (branchRes.ok) setBranches(await branchRes.json());
      if (stateRes.ok) setStates(await stateRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service center?')) return;
    
    setErrorMsg('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/service-centers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg('Service Center deleted successfully!');
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg('Failed to delete service center.');
      }
    } catch (err) {
      setErrorMsg('Failed to delete service center.');
    }
  };

  const handleEditClick = (sc) => {
    setEditingId(sc.id);
    setFormData({ ...sc, state_id: sc.state_id || '', branch_id: sc.branch_id || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(null);
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.branch_id) return showError('Select Branch');
    if (!formData.name) return showError('Enter Service Center Name');
    if (!formData.code) return showError('Enter Service Center Code');
    if (!formData.state_id) return showError('Select State');

    setSaving(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/service-centers/${formData.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setSuccessMsg('Service Center updated successfully!');
        setEditingId(null);
        setFormData(null);
        fetchData();
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        showError('Failed to update service center');
      }
    } catch (err) {
      showError('Failed to update service center');
    } finally {
      setSaving(false);
    }
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  const getBranchName = (id) => {
    const b = branches.find(b => b.id === id);
    return b ? b.name : 'Unknown';
  };

  const getStateName = (id) => {
    const s = states.find(s => s.id === id);
    return s ? s.state_name : 'Unknown';
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

      {editingId && formData && (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid #3b82f6', borderRadius: '6px', padding: '2rem', boxShadow: '0 4px 12px rgba(59,130,246,0.15)', marginBottom: '2rem' }}>
          <div style={{ paddingBottom: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase' }}>Edit Service Center</h3>
            <button onClick={handleCancelEdit} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontWeight: '700' }}>✕ Close</button>
          </div>
          
          <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>Select Branch:<span style={{color: '#ef4444'}}>*</span></label>
              <select name="branch_id" value={formData.branch_id} onChange={handleInputChange} style={inputStyle} disabled={saving}>
                <option value="">Select Branch</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>State:<span style={{color: '#ef4444'}}>*</span></label>
              <select name="state_id" value={formData.state_id} onChange={handleInputChange} style={inputStyle} disabled={saving}>
                <option value="">Select State</option>
                {states.map(s => <option key={s.id} value={s.id}>{s.state_name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>Name:<span style={{color: '#ef4444'}}>*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} maxLength={50} style={inputStyle} disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>Code:<span style={{color: '#ef4444'}}>*</span></label>
              <input type="text" name="code" value={formData.code} onChange={handleInputChange} maxLength={2} style={inputStyle} disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>Address:</label>
              <textarea name="address" value={formData.address || ''} onChange={handleInputChange} rows={2} style={{...inputStyle, resize: 'vertical'}} disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>Contact Name:</label>
              <input type="text" name="contact_name" value={formData.contact_name || ''} onChange={handleInputChange} style={inputStyle} disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>Phone No:</label>
              <input type="text" name="phone_no" value={formData.phone_no || ''} onChange={handleInputChange} maxLength={10} style={inputStyle} disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>Mobile No:</label>
              <input type="text" name="mobile_no" value={formData.mobile_no || ''} onChange={handleInputChange} maxLength={10} style={inputStyle} disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>Email:</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} style={inputStyle} disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>Pin Code:</label>
              <input type="text" name="pin_code" value={formData.pin_code || ''} onChange={handleInputChange} maxLength={6} style={inputStyle} disabled={saving} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1' }}>
              <input 
                type="checkbox" 
                id="editDisplayOnBranchPage"
                name="display_on_branch_page"
                checked={!!formData.display_on_branch_page} 
                onChange={handleInputChange} 
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                disabled={saving}
              />
              <label htmlFor="editDisplayOnBranchPage" style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', cursor: 'pointer' }}>
                Display on Branch Page
              </label>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={saving} style={buttonStyle('#2563eb')}>
                {saving ? 'Updating...' : 'Update Records'}
              </button>
              <button type="button" onClick={handleCancelEdit} disabled={saving} style={{...buttonStyle('#f1f5f9'), color: '#334155', boxShadow: 'none', border: '1px solid #cbd5e1'}}>
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase' }}>View Service Center</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 16px', width: '50px' }}>Sl No</th>
                <th style={{ padding: '12px 16px' }}>Branch</th>
                <th style={{ padding: '12px 16px' }}>Service Center Name</th>
                <th style={{ padding: '12px 16px' }}>Code</th>
                <th style={{ padding: '12px 16px' }}>State</th>
                <th style={{ padding: '12px 16px' }}>Mobile No</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading records...</td>
                </tr>
              ) : serviceCenters.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No service centers found.</td>
                </tr>
              ) : (
                serviceCenters.map((sc, index) => (
                  <tr key={sc.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc', transition: 'all 0.2s' }}>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: '600' }}>{index + 1}</td>
                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: '600' }}>{getBranchName(sc.branch_id)}</td>
                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: '700' }}>{sc.name}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{sc.code}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{getStateName(sc.state_id)}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{sc.mobile_no || '-'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => handleEditClick(sc)} style={actionBtnStyle('#3b82f6')}>Edit</button>
                        <button onClick={() => handleDelete(sc.id)} style={actionBtnStyle('#ef4444')}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
  padding: '10px 20px',
  borderRadius: '4px',
  border: 'none',
  fontWeight: '700',
  fontSize: '12px',
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  transition: 'all 0.2s',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
});

const actionBtnStyle = (color) => ({
  backgroundColor: 'transparent',
  color: color,
  border: `1px solid ${color}`,
  padding: '4px 10px',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'all 0.2s',
  textTransform: 'uppercase'
});

export default ViewServiceCenter;
