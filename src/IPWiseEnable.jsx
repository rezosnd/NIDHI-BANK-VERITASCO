import React, { useState, useEffect } from 'react';

function IPWiseEnable() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedBranchId, setSelectedBranchId] = useState('0');
  const [selectedStatus, setSelectedStatus] = useState('-1');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/branches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBranches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedBranchId || selectedBranchId === '0') {
      setErrorMsg('Please select a branch');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    if (selectedStatus === '-1') {
      setErrorMsg('Please select a status');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    setErrorMsg('');
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      
      const updatedBranches = branches.map(branch => {
        if (branch.id.toString() === selectedBranchId) {
          return { ...branch, is_active_ip_address: selectedStatus === '1' };
        }
        return branch;
      });

      const res = await fetch('/api/branches/locks', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ branches: updatedBranches })
      });
      
      if (res.ok) {
        setSuccessMsg('IP Wise Status Successfully Updated!');
        setBranches(updatedBranches);
        setTimeout(() => setSuccessMsg(''), 5000);
        setSelectedBranchId('0');
        setSelectedStatus('-1');
      } else {
        setErrorMsg('Failed to update status');
      }
    } catch (err) {
      setErrorMsg('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>IP Wise Enable/Disable</h3>
          </div>
          
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', alignItems: 'center' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Select Branch:<span style={{color: '#ef4444', marginLeft: '4px'}}>*</span></label>
              <select 
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                style={inputStyle}
                disabled={loading}
              >
                <option value="0">Select Branch</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', alignItems: 'center' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Select Status:</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={inputStyle}
              >
                <option value="-1">Select Status</option>
                <option value="1">Enable</option>
                <option value="0">Disable</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div></div>
              <button type="submit" disabled={saving || loading} style={buttonStyle('#2563eb')}>
                {saving ? 'Updating...' : 'Add/Update'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
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
  width: '160px'
});

export default IPWiseEnable;
