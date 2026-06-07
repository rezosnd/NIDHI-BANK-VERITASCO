import React, { useState, useEffect } from 'react';

function LockSetting() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleCheckboxChange = (id, field) => {
    setBranches(prev => prev.map(branch => 
      branch.id === id ? { ...branch, [field]: !branch[field] } : branch
    ));
  };

  const handleSave = async (actionType) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/branches/locks', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ branches })
      });
      
      if (res.ok) {
        setSuccessMsg(`${actionType} successfully applied!`);
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {(loading || saving) && (
        <div className="loader-overlay">
          <div className="dotted-loader">
            <div className="dot"></div><div className="dot"></div>
            <div className="dot"></div><div className="dot"></div>
            <div className="dot"></div><div className="dot"></div>
            <div className="dot"></div><div className="dot"></div>
          </div>
        </div>
      )}
      <div style={{ padding: '0 0 4rem 0', maxWidth: '100%' }}>
        {/* Top Action Bar / Header */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Lock Setting
          </div>
        </div>

        {successMsg && (
          <div style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 16px', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '12px', fontWeight: '700', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            {successMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => handleSave('User Lock')} style={buttonStyle('#475569')}>User Lock</button>
          <button onClick={() => handleSave('Branch Lock')} style={buttonStyle('#2563eb')}>Lock Branch</button>
          <button onClick={() => handleSave('Date Lock')} style={buttonStyle('#2563eb')}>Lock Date</button>
          <button onClick={() => handleSave('Late Fees')} style={buttonStyle('#2563eb')}>Apply Late Fees</button>
          <button onClick={() => handleSave('IP Address')} style={buttonStyle('#2563eb')}>Active IP Address</button>
        </div>

        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 1px 2px rgba(37,99,235,0.2)' }}>
                  <th style={{ padding: '10px 16px', width: '50px' }}>Sl No</th>
                  <th style={{ padding: '10px 16px' }}>Branch Name</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', width: '110px' }}>Lock Branch</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', width: '110px' }}>Lock Date</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', width: '140px' }}>Is Latefees Applicable</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center', width: '140px' }}>Active IP Address</th>
                </tr>
              </thead>
              <tbody>
                {branches.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      No branches found.
                    </td>
                  </tr>
                ) : (
                  branches.map((branch, index) => (
                    <tr 
                      key={branch.id} 
                      style={{ 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.4)', 
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: '600' }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: '600' }}>
                        {branch.name}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={branch.is_locked || false}
                          onChange={() => handleCheckboxChange(branch.id, 'is_locked')}
                          style={checkboxStyle}
                        />
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={branch.is_date_locked || false}
                          onChange={() => handleCheckboxChange(branch.id, 'is_date_locked')}
                          style={checkboxStyle}
                        />
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={branch.is_latefees_applicable || false}
                          onChange={() => handleCheckboxChange(branch.id, 'is_latefees_applicable')}
                          style={checkboxStyle}
                        />
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={branch.is_active_ip_address || false}
                          onChange={() => handleCheckboxChange(branch.id, 'is_active_ip_address')}
                          style={checkboxStyle}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

const buttonStyle = (bgColor) => ({
  backgroundColor: bgColor,
  color: 'white',
  padding: '8px 16px',
  borderRadius: '4px',
  border: 'none',
  fontWeight: '700',
  fontSize: '11px',
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  transition: 'all 0.2s',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
});

const checkboxStyle = {
  cursor: 'pointer',
  transform: 'scale(1.3)',
  accentColor: '#2563eb'
};

export default LockSetting;
