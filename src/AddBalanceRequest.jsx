import React, { useState, useEffect } from 'react';

export default function AddBalanceRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [searchParams, setSearchParams] = useState({
    accountName: '',
    orderId: '',
    fromDate: '',
    toDate: ''
  });

  const [approvalData, setApprovalData] = useState({
    approved_date: new Date().toISOString().split('T')[0],
    bank_name: ''
  });

  const [banks, setBanks] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/bank-details', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setBanks(await res.json());
    } catch(err) { console.error('Failed to fetch banks'); }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      if (searchParams.accountName) params.append('accountName', searchParams.accountName);
      if (searchParams.orderId) params.append('orderId', searchParams.orderId);
      if (searchParams.fromDate) params.append('fromDate', searchParams.fromDate);
      if (searchParams.toDate) params.append('toDate', searchParams.toDate);

      const res = await fetch(`/api/balance-requests?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (err) {
      console.error(err);
      showError('Failed to fetch balance requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleApprove = async (id) => {
    if (!approvalData.bank_name) return showError('Please select a bank to approve.');
    if (!approvalData.approved_date) return showError('Please enter an approved date.');

    if (!window.confirm('Are you sure you want to approve this request?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/balance-requests/${id}/approve`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(approvalData)
      });
      
      const data = await res.json();
      if (res.ok) {
        showSuccess(data.message || 'Request approved successfully');
        fetchRequests();
      } else {
        showError(data.error || 'Failed to approve request');
      }
    } catch (err) {
      showError('An error occurred while approving request.');
    }
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

      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '6px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
        <div style={{ paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase' }}>Online Payment Request</h3>
        </div>
        
        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 1fr', gap: '15px', alignItems: 'center' }}>
          
          <label style={lbl}>Account Name:</label>
          <input type="text" name="accountName" value={searchParams.accountName} onChange={handleSearchChange} style={inputStyle} />

          <label style={lbl}>Order ID:</label>
          <input type="text" name="orderId" value={searchParams.orderId} onChange={handleSearchChange} style={inputStyle} />

          <label style={lbl}>From Date:</label>
          <input type="date" name="fromDate" value={searchParams.fromDate} onChange={handleSearchChange} style={inputStyle} />

          <label style={lbl}>To Date:</label>
          <input type="date" name="toDate" value={searchParams.toDate} onChange={handleSearchChange} style={inputStyle} />

          <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '1rem' }}>
            <button type="submit" disabled={loading} style={buttonStyle('#2563eb')}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '15px', alignItems: 'center', backgroundColor: 'rgba(241, 245, 249, 0.5)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <input 
            type="date" 
            value={approvalData.approved_date} 
            onChange={(e) => setApprovalData({...approvalData, approved_date: e.target.value})} 
            style={{ ...inputStyle, width: 'auto' }} 
          />
          <select 
            value={approvalData.bank_name} 
            onChange={(e) => setApprovalData({...approvalData, bank_name: e.target.value})} 
            style={{ ...inputStyle, width: '200px' }}
          >
            <option value="">Select Bank</option>
            {banks.map(b => (
              <option key={b.id} value={b.bank_name}>{b.bank_name}</option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 16px', width: '50px' }}>Sl No</th>
                <th style={{ padding: '12px 16px' }}>Account Name</th>
                <th style={{ padding: '12px 16px' }}>Order ID</th>
                <th style={{ padding: '12px 16px' }}>Request Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading requests...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No results found</td>
                </tr>
              ) : (
                requests.map((req, index) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc', transition: 'all 0.2s' }}>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: '600' }}>{index + 1}</td>
                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: '700' }}>{req.account_name}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{req.order_id}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{new Date(req.request_date).toLocaleDateString('en-GB')}</td>
                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: '700', textAlign: 'right' }}>₹{Number(req.amount).toFixed(2)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', background: req.status === 'Approved' ? '#dcfce7' : '#fef9c3', color: req.status === 'Approved' ? '#16a34a' : '#ca8a04' }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {req.status === 'Pending' ? (
                        <button onClick={() => handleApprove(req.id)} style={actionBtnStyle('#16a34a')}>Approve</button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{req.bank_name || '-'}</span>
                      )}
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

const lbl = { fontSize: '12px', fontWeight: '700', color: '#1e293b', paddingLeft: '5px' };

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
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
  padding: '10px 24px',
  borderRadius: '4px',
  border: 'none',
  fontWeight: '700',
  fontSize: '12px',
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  transition: 'all 0.2s',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  minWidth: '120px'
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
