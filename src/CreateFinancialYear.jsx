import React, { useState, useEffect } from 'react';

const SectionHeader = ({ title }) => (
  <div style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '6px 16px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', borderRadius: '4px', boxShadow: '0 1px 2px rgba(37,99,235,0.2)' }}>
    {title}
  </div>
);

const RowField = ({ label, req, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
    <div style={{ width: '150px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label} {req && <span style={{color: '#ef4444'}}>*</span>}
    </div>
    <div style={{ padding: '0 8px', color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>:</div>
    <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
      {children}
    </div>
  </div>
);

const inputStyle = {
  width: '100%', padding: '4px 8px', fontSize: '12px', height: '26px', 
  border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '3px', color: '#1e293b', 
  backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', outline: 'none', transition: 'border-color 0.15s ease'
};

function CreateFinancialYear() {
  const [nextYear, setNextYear] = useState({ from_year: '', to_year: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchNextYear();
  }, []);

  const fetchNextYear = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/financial-years/next', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setNextYear(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddYear = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/financial-years', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nextYear)
      });
      if (res.ok) {
        setSuccessMsg(`Financial Year ${nextYear.from_year}-${nextYear.to_year} created successfully.`);
        await fetchNextYear();
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        alert('Failed to save financial year');
      }
    } catch (err) {
      alert('Failed to save financial year');
    } finally {
      setSaving(false);
    }
  };

  const handleYearChange = (e) => {
    const { name, value } = e.target;
    if (name === 'from_year') {
      const fromVal = parseInt(value) || '';
      setNextYear({ from_year: fromVal, to_year: fromVal ? fromVal + 1 : '' });
    } else {
      setNextYear(prev => ({ ...prev, [name]: parseInt(value) || '' }));
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
            Manage Financial Year
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button" 
              onClick={handleAddYear}
              disabled={loading || saving}
              style={{ backgroundColor: '#10b981', color: 'white', padding: '6px 16px', borderRadius: '4px', border: 'none', fontWeight: '700', fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}
            >
              + Add Year
            </button>
          </div>
        </div>

        {successMsg && (
          <div style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 16px', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '12px', fontWeight: '700', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            {successMsg}
          </div>
        )}

        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '6px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <SectionHeader title="Create Financial Year" />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 600px)', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <RowField label="From Year" req>
                <input 
                  type="number" 
                  name="from_year"
                  value={nextYear.from_year || ''} 
                  onChange={handleYearChange}
                  style={inputStyle}
                  placeholder="e.g. 2026"
                />
              </RowField>
              
              <RowField label="To Year" req>
                <input 
                  type="number" 
                  name="to_year"
                  value={nextYear.to_year || ''} 
                  onChange={handleYearChange}
                  style={inputStyle}
                  placeholder="e.g. 2027"
                />
              </RowField>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateFinancialYear;
