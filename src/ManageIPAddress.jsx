import React, { useState, useEffect } from 'react';

function ManageIPAddress() {
  const [branches, setBranches] = useState([]);
  const [ipList, setIpList] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBranches();
    fetchIpList();
  }, []);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/branches', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setBranches(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIpList = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/branch-ips', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setIpList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedBranch || !ipAddress) {
      setError('Please select a branch and enter an IP address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/branch-ips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ branch_id: selectedBranch, ip_address: ipAddress })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        setIpAddress('');
        setSelectedBranch('');
        fetchIpList();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.error || 'Failed to add IP address');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this IP address?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/branch-ips/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchIpList();
      } else {
        alert(data.error || 'Failed to remove IP address');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', fontSize: '0.9rem',
    border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '8px', color: '#0f172a',
    backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
    outline: 'none', transition: 'border-color 0.15s ease'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Manage Branch IP Addresses</h2>
        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>Configure allowed IP addresses for branches with IP locking enabled.</div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#dcfce3', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Form Panel */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.4)', borderTop: '1px solid rgba(255, 255, 255, 0.9)', borderLeft: '1px solid rgba(255, 255, 255, 0.9)', borderRadius: '24px', padding: '24px', boxShadow: '0 16px 40px rgba(31, 38, 135, 0.1), inset 0 0 30px rgba(255, 255, 255, 0.6)', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#1e293b', fontWeight: '700' }}>Add New IP Address</h3>
          
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Select Branch <span style={{ color: '#ef4444' }}>*</span></label>
              <select 
                style={inputStyle}
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="">Select Branch</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Enter IP Address <span style={{ color: '#ef4444' }}>*</span></label>
              <input 
                type="text" 
                style={inputStyle}
                placeholder="e.g. 192.168.1.100"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)', transition: 'all 0.3s ease' }}
            >
              {loading ? 'Saving...' : 'Submit IP Address'}
            </button>
          </form>
        </div>

        {/* Data Table Panel */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.4)', borderTop: '1px solid rgba(255, 255, 255, 0.9)', borderLeft: '1px solid rgba(255, 255, 255, 0.9)', borderRadius: '24px', padding: '24px', boxShadow: '0 16px 40px rgba(31, 38, 135, 0.1), inset 0 0 30px rgba(255, 255, 255, 0.6)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#1e293b', fontWeight: '700' }}>Configured IPs</h3>
          
          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.6)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(30, 41, 59, 0.85)', backdropFilter: 'blur(10px)', color: 'white', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Sl No</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Branch</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>IP Address</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {ipList.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No IP Addresses configured yet.</td>
                  </tr>
                ) : (
                  ipList.map((item, idx) => (
                    <tr key={item.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', transition: 'background-color 0.2s', borderBottom: '1px solid rgba(255,255,255,0.4)' }}>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{idx + 1}</td>
                      <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: '600' }}>{item.branch_name} ({item.branch_code})</td>
                      <td style={{ padding: '12px 16px', color: '#0052cc', fontWeight: '600', fontFamily: 'monospace' }}>{item.ip_address}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseOver={(e) => { e.target.style.background = '#fef2f2'; }}
                          onMouseOut={(e) => { e.target.style.background = 'transparent'; }}
                        >
                          Remove
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
  );
}

export default ManageIPAddress;
