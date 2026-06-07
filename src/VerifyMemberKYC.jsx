import { useState } from 'react';

const inputStyle = {
  width: '100%', padding: '6px 12px', fontSize: '13px', height: '32px', 
  border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '4px', color: '#1e293b', 
  backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', 
  WebkitBackdropFilter: 'blur(32px)', outline: 'none', transition: 'border-color 0.15s ease'
};

function VerifyMemberKYC() {
  const [formData, setFormData] = useState({
    memberId: '',
    documentId: '0'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!formData.memberId.trim()) {
      alert('Enter Member ID');
      return;
    }
    if (formData.documentId === '0') {
      alert('Select Document Name');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/kyc/verify/${encodeURIComponent(formData.memberId)}?documentId=${formData.documentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, message: 'Failed to connect to backend server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '0 0 4rem 0', maxWidth: '100%' }}>
      {/* Top Action Bar / Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Member KYC Document Approval
          </h2>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
            Verify identity documents for enrolled members
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', 
        border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '6px', padding: '24px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
      }}>
        
        {result && (
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: result.success ? '#f0fdf4' : '#fef2f2', 
            border: `1px solid ${result.success ? '#bbf7d0' : '#fecaca'}`, 
            color: result.success ? '#166534' : '#991b1b', 
            borderRadius: '6px', 
            fontSize: '13px', 
            fontWeight: '700', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            {result.success ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            )}
            {result.message} {result.memberName && ` - Member Name: ${result.memberName}`}
          </div>
        )}

        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '250px 300px 150px', gap: '24px', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Enter Member ID <span style={{color: '#ef4444'}}>*</span> :
            </div>
            <input 
              type="text" 
              name="memberId" 
              value={formData.memberId} 
              onChange={handleChange} 
              style={inputStyle} 
              placeholder="e.g. VER-123456"
            />
          </div>
          
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Select Document Name <span style={{color: '#ef4444'}}>*</span> :
            </div>
            <select 
              name="documentId" 
              value={formData.documentId} 
              onChange={handleChange} 
              style={inputStyle}
            >
              <option value="0">Select Document Name</option>
              <option value="32">Aadhar Card</option>
              <option value="10">Driving License</option>
              <option value="7">PAN Card</option>
              <option value="6">Voter ID Card</option>
            </select>
          </div>

          <div>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                width: '100%',
                height: '32px',
                backgroundColor: '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                fontSize: '12px', 
                fontWeight: '700', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px' 
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {result && result.success && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
              Verified Member Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', rowGap: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Member ID:</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{formData.memberId}</div>
              
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Member Name:</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>{result.memberName}</div>
              
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Document Verified:</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Yes, record matches system database
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default VerifyMemberKYC;
