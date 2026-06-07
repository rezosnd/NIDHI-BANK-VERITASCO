import React, { useState, useEffect } from 'react';

const Download = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const Search = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const AlertCircle = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const CheckCircle2 = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>;
const Clock = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

const CustomerComplaints = () => {
  const getTodayFormatted = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [branches, setBranches] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    branch_id: '0',
    search_field: '0',
    search_val: '',
    service_type: '0',
    status: '-1',
    date_range: 'Today', 
    from_date: getTodayFormatted(),
    to_date: getTodayFormatted()
  });

  const [showCustomDate, setShowCustomDate] = useState(false);

  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    if (isAdmin) {
      fetchBranches();
    }
  }, [isAdmin]);

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setBranches(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDateRangeChange = (e) => {
    const val = e.target.value;
    const newFilters = { ...filters, date_range: val };
    
    if (val === 'Custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
      const today = new Date();
      let from = new Date();
      let to = new Date();

      switch (val) {
        case 'Today':
          break;
        case 'Yesterday':
          from.setDate(today.getDate() - 1);
          to.setDate(today.getDate() - 1);
          break;
        case 'This week':
          const day = today.getDay();
          from.setDate(today.getDate() - day + (day === 0 ? -6 : 1)); // Monday
          break;
        case 'Last 15 Days':
          from.setDate(today.getDate() - 15);
          break;
        case 'Last 30 Days':
          from.setDate(today.getDate() - 30);
          break;
        case 'This Month':
          from.setDate(1);
          break;
        default:
          break;
      }
      newFilters.from_date = from.toISOString().split('T')[0];
      newFilters.to_date = to.toISOString().split('T')[0];
    }
    setFilters(newFilters);
  };

  const fetchReport = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/customer-complaints/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filters)
      });
      const data = await res.json();
      if (data.success === false) {
        setMessage(data.message);
      } else {
        setComplaints(data);
        if (data.length === 0) setMessage('No records found for the selected criteria.');
      }
    } catch (err) {
      setMessage('Error fetching report');
    }
    setLoading(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/customer-complaints/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, resolution_remark: 'Updated by admin' })
      });
      const data = await res.json();
      if (data.success) {
        fetchReport();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open': return <span className="status-badge status-active" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}><AlertCircle size={12}/> Open</span>;
      case 'Pending': return <span className="status-badge status-pending" style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}><Clock size={12}/> Pending</span>;
      case 'Waiting on Customer': return <span className="status-badge status-inactive" style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}><Clock size={12}/> Waiting</span>;
      case 'Closed': return <span className="status-badge status-success" style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}><CheckCircle2 size={12}/> Closed</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

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
          .solid-input {
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
          .solid-input:focus {
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
          }
          .solid-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, #3b82f6, #1e3a8a);
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(37, 99, 235, 0.4);
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
        `}
      </style>

      <div className="solid-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Customer Complaint / Help Report
            </h2>
          </div>
          
          <button 
            className="solid-btn"
            disabled={complaints.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: complaints.length === 0 ? 'not-allowed' : 'pointer',
              opacity: complaints.length === 0 ? 0.6 : 1
            }}
          >
            <Download size={16} />
            Export Data
          </button>
        </div>

        {message && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fca5a5' }}>
            <AlertCircle size={16}/>
            {message}
          </div>
        )}

        {/* Filters Panel */}
        <div className="filter-panel" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            
            {isAdmin && (
              <div>
                <label className="solid-label">Branch</label>
                <select 
                  className="solid-input"
                  value={filters.branch_id}
                  onChange={e => setFilters({...filters, branch_id: e.target.value})}
                >
                  <option value="0">ALL BRANCHES</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="solid-label">Search Field</label>
              <select 
                className="solid-input"
                value={filters.search_field}
                onChange={e => setFilters({...filters, search_field: e.target.value})}
              >
                <option value="0">Select Search Field</option>
                <option value="2">Name</option>
                <option value="3">Mobile</option>
                <option value="4">E-mail</option>
                <option value="5">City</option>
                <option value="10">Reference Id</option>
              </select>
            </div>

            <div>
              <label className="solid-label">Search Data</label>
              <input 
                type="text" 
                className="solid-input" 
                value={filters.search_val}
                onChange={e => setFilters({...filters, search_val: e.target.value})}
                placeholder="Enter search term..."
                disabled={filters.search_field === '0'}
              />
            </div>

            <div>
              <label className="solid-label">Services</label>
              <select 
                className="solid-input"
                value={filters.service_type}
                onChange={e => setFilters({...filters, service_type: e.target.value})}
              >
                <option value="0">All</option>
                <option value="DP01">SAVINGS ACCOUNT</option>
                <option value="DP03">FIXED DEPOSIT</option>
                <option value="DP04">PIGMY DEPOSIT</option>
                <option value="DP06">RECURRING DEPOSIT</option>
                <option value="DP08">CURRENT ACCOUNT</option>
                <option value="AL101">SHARE SUSPENSE</option>
                <option value="DP09">Monthly Income Scheme</option>
                <option value="LD01">Loan on Deposites</option>
                <option value="GL01">GOLD LOAN</option>
                <option value="DP10">PIGMY WITHDRAW</option>
                <option value="DP11">OVERDRAFT ACCOUNT</option>
              </select>
            </div>

            <div>
              <label className="solid-label">Request Status</label>
              <select 
                className="solid-input"
                value={filters.status}
                onChange={e => setFilters({...filters, status: e.target.value})}
              >
                <option value="-1">All</option>
                <option value="0">Open</option>
                <option value="1">Pending</option>
                <option value="2">Closed</option>
                <option value="3">Waiting on Customer</option>
              </select>
            </div>

            <div>
              <label className="solid-label">Date Range</label>
              <select 
                className="solid-input"
                value={filters.date_range}
                onChange={handleDateRangeChange}
              >
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="This week">This week</option>
                <option value="Last 15 Days">Last 15 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Month">This Month</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {showCustomDate && (
              <>
                <div>
                  <label className="solid-label">From Date</label>
                  <input 
                    type="date" 
                    className="solid-input"
                    value={filters.from_date}
                    onChange={e => setFilters({...filters, from_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="solid-label">To Date</label>
                  <input 
                    type="date" 
                    className="solid-input"
                    value={filters.to_date}
                    onChange={e => setFilters({...filters, to_date: e.target.value})}
                  />
                </div>
              </>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.4)', paddingTop: '20px' }}>
            <button 
              className="solid-btn"
              onClick={fetchReport}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: loading ? '#94a3b8' : '',
                padding: '8px 32px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.5px'
              }}
            >
              <Search size={16} />
              {loading ? 'Searching...' : 'Search Records'}
            </button>
          </div>
        </div>

        {/* Results Data Table */}
        <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr className="table-solid-header" style={{ textAlign: 'left' }}>
                <th style={{ padding: '12px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Date</th>
                <th style={{ padding: '12px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Reference ID</th>
                <th style={{ padding: '12px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Customer Info</th>
                <th style={{ padding: '12px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Service Type</th>
                <th style={{ padding: '12px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Description</th>
                <th style={{ padding: '12px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Branch</th>
                <th style={{ padding: '12px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Status</th>
                {isAdmin && <th style={{ padding: '12px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)' }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} style={{ padding: '32px', textAlign: 'center', color: '#475569' }}>
                    <div style={{ fontWeight: '600' }}>Querying secure database...</div>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ marginBottom: '8px' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>No Data Available</div>
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.4)' }}>
                    <td style={{ padding: '12px', color: '#334155', borderRight: '1px solid rgba(255,255,255,0.4)' }}>
                      {new Date(c.issue_date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', color: '#0052cc', fontWeight: '700', borderRight: '1px solid rgba(255,255,255,0.4)' }}>
                      {c.reference_id || '-'}
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid rgba(255,255,255,0.4)' }}>
                      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{c.name}</div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>{c.mobile}</div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>{c.email}</div>
                    </td>
                    <td style={{ padding: '12px', color: '#0f172a', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.4)' }}>
                      {c.service_type || 'General'}
                    </td>
                    <td style={{ padding: '12px', color: '#334155', borderRight: '1px solid rgba(255,255,255,0.4)', maxWidth: '200px' }}>
                      {c.description || '-'}
                    </td>
                    <td style={{ padding: '12px', color: '#0f172a', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.4)' }}>
                      {c.branch_name || '-'}
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid rgba(255,255,255,0.4)' }}>
                      {getStatusBadge(c.status)}
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '12px' }}>
                        <select 
                          className="solid-input"
                          value={c.status}
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                          style={{ width: '130px', padding: '4px 8px', fontSize: '11px' }}
                        >
                          <option value="Open">Open</option>
                          <option value="Pending">Pending</option>
                          <option value="Waiting on Customer">Waiting</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default CustomerComplaints;
