import React, { useState, useEffect } from 'react';

export default function OnlineRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [searchParams, setSearchParams] = useState({
    branchName: '0',
    filterType: '0',
    searchStr: '',
    planName: '0',
    status: '-1',
    dateRange: '07/06/2026_07/06/2026', // Based on the HTML default
    fromDate: '',
    toDate: ''
  });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalData, setApprovalData] = useState({
    approved_date: new Date().toISOString().split('T')[0],
    remark: '',
    status: 'Approved'
  });

  const [branches, setBranches] = useState([]);
  const services = ['SAVINGS ACCOUNT', 'FIXED DEPOSIT', 'PIGMY DEPOSIT', 'RECURRING DEPOSIT', 'CURRENT ACCOUNT', 'SHARE SUSPENSE', 'Monthly Income Scheme', 'Loan on Deposites', 'GOLD LOAN', 'PIGMY WITHDRAW', 'OVERDRAFT ACCOUNT'];

  useEffect(() => {
    fetchRequests();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/branches', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setBranches(await res.json());
    } catch(err) { console.error('Failed to fetch branches'); }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key]) params.append(key, searchParams[key]);
      });

      const res = await fetch(`/api/online-requests?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (err) {
      console.error(err);
      showError('Failed to fetch online requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
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

  const handleAction = async () => {
    if (!selectedRequest) return;
    if (!approvalData.approved_date) return showError('Please enter an approved date.');

    if (!window.confirm(`Are you sure you want to ${approvalData.status} this request?`)) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/online-requests/${selectedRequest.id}/approve`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(approvalData)
      });
      
      const data = await res.json();
      if (res.ok) {
        showSuccess(data.message || 'Action completed successfully');
        setSelectedRequest(null);
        fetchRequests();
      } else {
        showError(data.error || 'Failed to complete action');
      }
    } catch (err) {
      showError('An error occurred while processing request.');
    }
  };

  const isCustomDate = searchParams.dateRange === '_';

  return (
    <div style={{ padding: '0 0 4rem 0', maxWidth: '100%', margin: '0', position: 'relative' }}>
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

      {/* SEARCH PANEL */}
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '6px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
        <div style={{ paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase' }}>Request Deposit Details</h3>
        </div>
        
        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 150px 1fr', gap: '15px', alignItems: 'center' }}>
          
          <label style={lbl}>Select Branch:</label>
          <select name="branchName" value={searchParams.branchName} onChange={handleSearchChange} style={{...inputStyle, gridColumn: '2 / -1'}}>
            <option value="0">ALL</option>
            {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>

          <label style={lbl}>Select Search Field:</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', gridColumn: '2 / -1' }}>
            <select name="filterType" value={searchParams.filterType} onChange={handleSearchChange} style={{...inputStyle, width: '200px'}}>
              <option value="0">Select Search Field</option>
              <option value="2">Name</option>
              <option value="3">Mobile</option>
              <option value="4">E-mail</option>
              <option value="5">City</option>
              <option value="10">Reference Id</option>
            </select>
            <span style={lbl}>Enter Search Data:</span>
            <input type="text" name="searchStr" value={searchParams.searchStr} onChange={handleSearchChange} style={inputStyle} />
          </div>

          <label style={lbl}>Services:</label>
          <select name="planName" value={searchParams.planName} onChange={handleSearchChange} style={inputStyle}>
            <option value="0">All</option>
            {services.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <label style={lbl}>Approval Status:</label>
          <select name="status" value={searchParams.status} onChange={handleSearchChange} style={inputStyle}>
            <option value="-1">All</option>
            <option value="1">Approved</option>
            <option value="2">Rejected</option>
            <option value="0">Pending</option>
          </select>

          <label style={lbl}>Select Date:</label>
          <select name="dateRange" value={searchParams.dateRange} onChange={handleSearchChange} style={inputStyle}>
            <option value="07/06/2026_07/06/2026">Today</option>
            <option value="01/06/2026_07/06/2026">This Month</option>
            <option value="_">Custom</option>
          </select>

          <label style={lbl}>Select Date Filter:</label>
          <select style={inputStyle}>
            <option value="1">Daily</option>
            <option value="3">Monthly</option>
          </select>

          {isCustomDate && (
            <>
              <label style={lbl}>From Date <span style={{color:'red'}}>*</span>:</label>
              <input type="date" name="fromDate" value={searchParams.fromDate} onChange={handleSearchChange} style={inputStyle} />

              <label style={lbl}>To Date <span style={{color:'red'}}>*</span>:</label>
              <input type="date" name="toDate" value={searchParams.toDate} onChange={handleSearchChange} style={inputStyle} />
            </>
          )}

          <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '1.5rem' }}>
            <button type="submit" disabled={loading} style={buttonStyle('#2563eb')}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* DATA GRID */}
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 16px', width: '50px' }}>Sl No</th>
                <th style={{ padding: '12px 16px' }}>Reference No</th>
                <th style={{ padding: '12px 16px' }}>Request Date</th>
                <th style={{ padding: '12px 16px' }}>Member Name</th>
                <th style={{ padding: '12px 16px' }}>Plan Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading requests...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No results found</td>
                </tr>
              ) : (
                requests.map((req, index) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc', transition: 'all 0.2s' }}>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: '600' }}>{index + 1}</td>
                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: '700' }}>{req.reference_no}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{new Date(req.request_date).toLocaleDateString('en-GB')}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{req.member_name}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{req.plan_name}</td>
                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: '700', textAlign: 'right' }}>₹{Number(req.amount).toFixed(2)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', background: req.status === 'Approved' ? '#dcfce7' : req.status === 'Rejected' ? '#fee2e2' : '#fef9c3', color: req.status === 'Approved' ? '#16a34a' : req.status === 'Rejected' ? '#ef4444' : '#ca8a04' }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button onClick={() => setSelectedRequest(req)} style={actionBtnStyle('#3b82f6')}>View Details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP MODAL */}
      {selectedRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', width: '800px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ backgroundColor: '#1e293b', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px 8px 0 0' }}>
              <h3 style={{ color: 'white', margin: 0, fontSize: '16px' }}>Request Details</h3>
              <button onClick={() => setSelectedRequest(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  <tr>
                    <td style={tdLabel}>Reference No :</td>
                    <td style={tdValue}>{selectedRequest.reference_no}</td>
                    <td style={tdLabel}>Request Date :</td>
                    <td style={tdValue}>{new Date(selectedRequest.request_date).toLocaleDateString('en-GB')}</td>
                  </tr>
                  <tr>
                    <td style={tdLabel}>Branch Name :</td>
                    <td colSpan="3" style={tdValue}>{selectedRequest.branch_name}</td>
                  </tr>
                  <tr>
                    <td style={tdLabel}>Agent No :</td>
                    <td style={tdValue}>{selectedRequest.agent_no}</td>
                    <td style={tdLabel}>Agent Name :</td>
                    <td style={tdValue}>{selectedRequest.agent_name}</td>
                  </tr>
                  <tr>
                    <td style={tdLabel}>Member No :</td>
                    <td style={tdValue}>{selectedRequest.member_no}</td>
                    <td style={tdLabel}>Member Name :</td>
                    <td style={tdValue}>{selectedRequest.member_name}</td>
                  </tr>
                  <tr>
                    <td style={tdLabel}>Contact No :</td>
                    <td colSpan="3" style={tdValue}>{selectedRequest.contact_no}</td>
                  </tr>
                  <tr>
                    <td style={tdLabel}>Address :</td>
                    <td colSpan="3" style={tdValue}>{selectedRequest.address}</td>
                  </tr>
                  <tr>
                    <td style={tdLabel}>Plan Name :</td>
                    <td style={tdValue}>{selectedRequest.plan_name}</td>
                    <td style={tdLabel}>Premimum :</td>
                    <td style={tdValue}>{selectedRequest.premium}</td>
                  </tr>
                  <tr>
                    <td style={tdLabel}>Amount :</td>
                    <td colSpan="3" style={tdValue}>₹{Number(selectedRequest.amount).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              {selectedRequest.status === 'Pending' && (
                <>
                  <h4 style={{ margin: '20px 0 15px', color: '#1e293b', fontSize: '14px', paddingBottom: '5px', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Approve/Reject Request</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <tbody>
                      <tr>
                        <td style={tdLabel}>Date :</td>
                        <td style={{ padding: '8px' }}>
                          <input type="date" value={approvalData.approved_date} onChange={(e) => setApprovalData({...approvalData, approved_date: e.target.value})} style={inputStyle} />
                        </td>
                      </tr>
                      <tr>
                        <td style={tdLabel}>Remark :</td>
                        <td style={{ padding: '8px' }}>
                          <textarea rows="2" value={approvalData.remark} onChange={(e) => setApprovalData({...approvalData, remark: e.target.value})} style={inputStyle}></textarea>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', padding: '20px 0' }}>
                          <button onClick={() => { setApprovalData(p => ({...p, status: 'Approved'})); handleAction(); }} style={{ ...buttonStyle('#16a34a'), marginRight: '10px' }}>Approve</button>
                          <button onClick={() => { setApprovalData(p => ({...p, status: 'Rejected'})); handleAction(); }} style={buttonStyle('#ef4444')}>Reject</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

const lbl = { fontSize: '12px', fontWeight: '700', color: '#1e293b', paddingLeft: '5px' };
const tdLabel = { padding: '10px 15px', backgroundColor: '#f8fafc', fontWeight: '700', color: '#475569', border: '1px solid #e2e8f0', width: '20%' };
const tdValue = { padding: '10px 15px', color: '#0f172a', border: '1px solid #e2e8f0', width: '30%' };

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
