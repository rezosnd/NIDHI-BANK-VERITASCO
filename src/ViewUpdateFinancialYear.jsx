import React, { useState, useEffect } from 'react';

function ViewUpdateFinancialYear() {
  const [financialYears, setFinancialYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchFinancialYears();
  }, []);

  const fetchFinancialYears = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/financial-years', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setFinancialYears(data);
      
      const active = data.find(fy => fy.is_active);
      if (active) setSelectedId(active.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/financial-years/${selectedId}/activate`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg('Financial year activated successfully!');
        await fetchFinancialYears();
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        alert('Failed to activate financial year');
      }
    } catch (err) {
      alert('Failed to activate financial year');
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
            View/Update Financial Year
          </div>
        </div>

        {successMsg && (
          <div style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 16px', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '12px', fontWeight: '700', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            {successMsg}
          </div>
        )}

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 1px 2px rgba(37,99,235,0.2)' }}>
                  <th style={{ padding: '10px 16px', width: '60px' }}>Sl No</th>
                  <th style={{ padding: '10px 16px' }}>From Year</th>
                  <th style={{ padding: '10px 16px' }}>To Year</th>
                  <th style={{ padding: '10px 16px', width: '100px', textAlign: 'center' }}>Select</th>
                </tr>
              </thead>
              <tbody>
                {financialYears.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      No financial years found. Please create one.
                    </td>
                  </tr>
                ) : (
                  financialYears.map((fy, index) => (
                    <tr 
                      key={fy.id} 
                      style={{ 
                        borderBottom: '1px solid #e2e8f0', 
                        backgroundColor: fy.is_active ? '#f0fdf4' : (index % 2 === 0 ? '#ffffff' : '#f8fafc'),
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: '600' }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: fy.is_active ? '700' : '500' }}>
                        {fy.from_year}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: fy.is_active ? '700' : '500' }}>
                        {fy.to_year}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <input 
                          type="radio" 
                          name="financial_year" 
                          checked={selectedId === fy.id}
                          onChange={() => setSelectedId(fy.id)}
                          style={{ cursor: 'pointer', transform: 'scale(1.2)', accentColor: '#2563eb' }}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {financialYears.length > 0 && (
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleActivate}
                disabled={!selectedId || saving || financialYears.find(f => f.id === selectedId)?.is_active}
                style={{ 
                  backgroundColor: (!selectedId || financialYears.find(f => f.id === selectedId)?.is_active) ? '#cbd5e1' : '#2563eb', 
                  color: 'white', 
                  padding: '8px 24px', 
                  borderRadius: '4px', 
                  border: 'none', 
                  fontWeight: '700', 
                  fontSize: '12px', 
                  cursor: (!selectedId || financialYears.find(f => f.id === selectedId)?.is_active) ? 'not-allowed' : 'pointer', 
                  textTransform: 'uppercase', 
                  letterSpacing: '1px', 
                  transition: 'all 0.2s', 
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' 
                }}
              >
                Submit / Activate
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ViewUpdateFinancialYear;
