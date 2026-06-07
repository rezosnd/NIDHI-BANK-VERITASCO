import React, { useState, useEffect } from 'react';

const RefreshCcw = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;
const CheckCircle = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const XCircle = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const Search = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const AlertCircle = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;

const DebitRequestServiceCenter = () => {
  const getTodayFormatted = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [fromDate, setFromDate] = useState(getTodayFormatted());
  const [toDate, setToDate] = useState(getTodayFormatted());
  const [branchId, setBranchId] = useState('0');
  const [serviceCenterId, setServiceCenterId] = useState('0');
  const [status, setStatus] = useState('0'); // 0 = Not Approved, 1 = Approved, 2 = Reject
  
  const [branches, setBranches] = useState([]);
  const [allServiceCenters, setAllServiceCenters] = useState([]);
  
  const [requests, setRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [userRole, setUserRole] = useState('');

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    // Fetch branches, service centers and user role
    const fetchInitialData = async () => {
      try {
        const res = await fetch('/api/branches', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setBranches(data);
        }

        const scRes = await fetch('/api/service-centers', { headers: { 'Authorization': `Bearer ${token}` } });
        if (scRes.ok) {
          const scData = await scRes.json();
          setAllServiceCenters(scData);
        }
        
        const userRes = await fetch('/api/user-profile', { headers: { 'Authorization': `Bearer ${token}` } });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserRole(userData.role);
        }
      } catch (err) {
        console.error("Error loading initial data", err);
      }
    };
    fetchInitialData();
  }, [token]);

  const handleSearch = async () => {
    setLoading(true);
    setMessage('');
    setSuccessMsg('');
    setSelectedIds([]);

    try {
      const res = await fetch('/api/debit-requests/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          branch_id: branchId,
          service_center_id: serviceCenterId,
          from_date: fromDate,
          to_date: toDate,
          status: status
        })
      });
      const data = await res.json();
      if (data.success === false) {
        setMessage(data.message);
      } else {
        setRequests(data);
        if (data.length === 0) setMessage('No debit requests found for the selected criteria.');
      }
    } catch (err) {
      setMessage('Error fetching debit requests.');
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (selectedIds.length === 0) {
      setMessage(`Please select at least one request to ${newStatus.toLowerCase()}.`);
      return;
    }

    setLoading(true);
    setMessage('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/debit-requests/status', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setSelectedIds([]);
        handleSearch(); // Refresh
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage(`Error attempting to ${newStatus.toLowerCase()} requests.`);
    }
    setLoading(false);
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    // Only toggle pending requests
    const pendingIds = requests.filter(r => r.status === 'Pending').map(r => r.id);
    if (pendingIds.length === 0) return;
    
    if (selectedIds.length === pendingIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  };

  const isBranchUser = userRole === 'Branch User';
  const isAdmin = userRole !== 'Branch User' && userRole !== 'Service Center';

  const filteredServiceCenters = branchId === '0' 
    ? allServiceCenters 
    : allServiceCenters.filter(sc => sc.branch_id === parseInt(branchId));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <style>
        {`
          .solid-panel {
            background-color: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(32px);
            -webkit-backdrop-filter: blur(32px);
            box-shadow: 0 16px 40px rgba(31, 38, 135, 0.1), inset 0 0 30px rgba(255, 255, 255, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-top: 1px solid rgba(255, 255, 255, 0.9);
            border-left: 1px solid rgba(255, 255, 255, 0.9);
            border-radius: 24px;
          }
          .filter-panel {
            background-color: rgba(255, 255, 255, 0.5);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            border-radius: 16px;
            box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.5);
          }
          .solid-label {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.8rem;
            font-weight: 700;
            color: #475569;
            margin-bottom: 6px;
          }
          .solid-input, .solid-select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid rgba(255, 255, 255, 0.8);
            border-radius: 8px;
            font-size: 0.85rem;
            color: #0f172a;
            background-color: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(10px);
            outline: none;
            transition: all 0.3s ease;
          }
          .solid-input:focus, .solid-select:focus {
            background-color: rgba(255, 255, 255, 0.9);
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
          }
          .solid-btn {
            background: linear-gradient(135deg, #2563eb, #1e40af);
            color: white;
            border: none;
            border-radius: 8px;
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .solid-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, #3b82f6, #1e3a8a);
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(37, 99, 235, 0.4);
          }
          .solid-btn-success {
            background: linear-gradient(135deg, #10b981, #047857);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.2);
          }
          .solid-btn-success:hover:not(:disabled) {
            background: linear-gradient(135deg, #34d399, #059669);
            box-shadow: 0 12px 30px rgba(16, 185, 129, 0.4);
          }
          .solid-btn-danger {
            background: linear-gradient(135deg, #ef4444, #b91c1c);
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.2);
          }
          .solid-btn-danger:hover:not(:disabled) {
            background: linear-gradient(135deg, #f87171, #dc2626);
            box-shadow: 0 12px 30px rgba(239, 68, 68, 0.4);
          }
          .solid-btn:disabled {
            background: #94a3b8;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          .table-solid-header th {
            background-color: rgba(30, 41, 59, 0.85);
            backdrop-filter: blur(10px);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .table-row-hover {
            background-color: rgba(255, 255, 255, 0.3);
            transition: background-color 0.2s;
          }
          .table-row-hover:hover td {
            background-color: rgba(255, 255, 255, 0.7);
          }
          .checkbox-custom {
            width: 18px;
            height: 18px;
            cursor: pointer;
            border-radius: 4px;
            accent-color: #2563eb;
          }
          .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .status-pending { background-color: #fef08a; color: #854d0e; }
          .status-approved { background-color: #dcfce7; color: #166534; }
          .status-rejected { background-color: #fee2e2; color: #991b1b; }
        `}
      </style>

      <div className="solid-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '16px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCcw size={24} color="#0052cc" />
            Debit Request Service Center
          </h2>
        </div>

        {message && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fca5a5' }}>
            <AlertCircle size={16}/>
            {message}
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #86efac' }}>
            <CheckCircle size={16} />
            {successMsg}
          </div>
        )}

        {/* Filter Bar */}
        <div className="filter-panel" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            
            {!isBranchUser && (
              <div style={{ flex: '1 1 200px' }}>
                <label className="solid-label">Select Branch :</label>
                <select 
                  className="solid-select"
                  value={branchId}
                  onChange={e => {
                    setBranchId(e.target.value);
                    setServiceCenterId('0'); // Reset dependent dropdown
                  }}
                >
                  <option value="0">Select Branch</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ flex: '1 1 200px' }}>
              <label className="solid-label">Select Service Center :</label>
              <select 
                className="solid-select"
                value={serviceCenterId}
                onChange={e => setServiceCenterId(e.target.value)}
              >
                <option value="0">Select Service Center</option>
                {filteredServiceCenters.map(sc => (
                  <option key={sc.id} value={sc.id}>{sc.name}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 140px' }}>
              <label className="solid-label">From Date :</label>
              <input 
                type="date" 
                className="solid-input"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
              />
            </div>

            <div style={{ flex: '1 1 140px' }}>
              <label className="solid-label">To Date :</label>
              <input 
                type="date" 
                className="solid-input"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
              />
            </div>

            <div style={{ flex: '1 1 160px' }}>
              <label className="solid-label">Select Status :</label>
              <select 
                className="solid-select"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="0">Not Approved</option>
                <option value="1">Approved</option>
                <option value="2">Reject</option>
              </select>
            </div>
            
            <div>
              <button 
                className="solid-btn"
                onClick={handleSearch}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 24px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                  height: '38px'
                }}
              >
                <Search size={16} />
                Search
              </button>
            </div>

          </div>
        </div>

        {/* Action Bar (Admin only) */}
        {isAdmin && selectedIds.length > 0 && (
          <div className="filter-panel" style={{ padding: '16px 20px', marginBottom: '24px', backgroundColor: 'rgba(239, 246, 255, 0.6)', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e40af' }}>
                {selectedIds.length} Requests Selected
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="solid-btn solid-btn-success"
                onClick={() => handleStatusUpdate('Approved')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 24px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  letterSpacing: '0.5px'
                }}
              >
                <CheckCircle size={16} />
                APPROVE
              </button>
              
              <button 
                className="solid-btn solid-btn-danger"
                onClick={() => handleStatusUpdate('Rejected')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 24px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  letterSpacing: '0.5px'
                }}
              >
                <XCircle size={16} />
                REJECT
              </button>
            </div>
          </div>
        )}

        {/* Results Data Table */}
        <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            <thead>
              <tr className="table-solid-header" style={{ textAlign: 'left' }}>
                {isAdmin && status === '0' && (
                  <th style={{ padding: '12px', width: '40px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <input 
                      type="checkbox" 
                      className="checkbox-custom" 
                      onChange={toggleAll}
                      checked={requests.length > 0 && requests.filter(r => r.status === 'Pending').length > 0 && selectedIds.length === requests.filter(r => r.status === 'Pending').length}
                    />
                  </th>
                )}
                <th style={{ padding: '12px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Date</th>
                <th style={{ padding: '12px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Branch</th>
                <th style={{ padding: '12px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Service Center</th>
                <th style={{ padding: '12px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Account No</th>
                <th style={{ padding: '12px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Member Name</th>
                <th style={{ padding: '12px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'right' }}>Amount (₹)</th>
                <th style={{ padding: '12px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin && status === '0' ? 8 : 7} style={{ padding: '32px', textAlign: 'center', color: '#475569' }}>
                    <div style={{ fontWeight: '600' }}>Loading debit requests...</div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin && status === '0' ? 8 : 7} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ marginBottom: '8px' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>No Requests Found</div>
                  </td>
                </tr>
              ) : (
                requests.map((t) => {
                  const isChecked = selectedIds.includes(t.id);
                  const isPending = t.status === 'Pending';
                  
                  return (
                    <tr key={t.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.4)', backgroundColor: isChecked ? 'rgba(239, 246, 255, 0.5)' : 'transparent' }}>
                      {isAdmin && status === '0' && (
                        <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.4)' }}>
                          {isPending && (
                            <input 
                              type="checkbox" 
                              className="checkbox-custom" 
                              checked={isChecked}
                              onChange={() => toggleSelection(t.id)}
                            />
                          )}
                        </td>
                      )}
                      <td style={{ padding: '12px', color: '#334155', borderRight: '1px solid rgba(255,255,255,0.4)' }}>
                        {new Date(t.request_date).toLocaleDateString('en-GB')}
                      </td>
                      <td style={{ padding: '12px', color: '#0f172a', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.4)' }}>
                        {t.branch_name || '-'}
                      </td>
                      <td style={{ padding: '12px', color: '#0052cc', fontWeight: '700', borderRight: '1px solid rgba(255,255,255,0.4)' }}>
                        {t.service_center_name || '-'}
                      </td>
                      <td style={{ padding: '12px', color: '#0052cc', fontWeight: '700', borderRight: '1px solid rgba(255,255,255,0.4)' }}>
                        {t.account_no || '-'}
                      </td>
                      <td style={{ padding: '12px', color: '#0f172a', fontWeight: 'bold', borderRight: '1px solid rgba(255,255,255,0.4)' }}>
                        {t.member_name || '-'}
                      </td>
                      <td style={{ padding: '12px', color: '#166534', fontWeight: '800', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.4)' }}>
                        {parseFloat(t.amount || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.4)' }}>
                        <span className={`status-badge status-${t.status?.toLowerCase() || 'pending'}`}>
                          {t.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default DebitRequestServiceCenter;
