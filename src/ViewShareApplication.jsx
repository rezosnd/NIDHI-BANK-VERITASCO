import { useState, useEffect } from 'react';

const inputStyle = {
  width: '100%', padding: '8px 12px', fontSize: '13px', height: '36px', 
  border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '6px', color: '#1e293b', 
  backgroundColor: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(32px)', 
  WebkitBackdropFilter: 'blur(32px)', outline: 'none', transition: 'all 0.2s ease',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
};

const labelStyle = {
  fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', 
  letterSpacing: '0.5px', marginBottom: '6px', display: 'block'
};

function ViewShareApplication() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [branches, setBranches] = useState([]);
  
  // Filters
  const [branchId, setBranchId] = useState('0');
  const [searchField, setSearchField] = useState('0');
  const [searchValue, setSearchValue] = useState('');
  const [dateRange, setDateRange] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('6'); // 6=ALL, 0=Not Approved, 1=Approved, 3=Reject

  // Popup state
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchBranches();
    handleSearch();
    // eslint-disable-next-line
  }, []);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const branchRes = await fetch('/api/branches', { headers: { 'Authorization': `Bearer ${token}` } });
      if (branchRes.ok) setBranches(await branchRes.json());
    } catch (err) {
      console.error('Failed to fetch branches', err);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        branch_id: branchId,
        search_field: searchField,
        search_val: searchValue,
        from_date: dateRange === 'Custom' ? fromDate : null,
        to_date: dateRange === 'Custom' ? toDate : null,
        status: status
      };

      const response = await fetch('/api/share-applications/search', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setData(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return { bg: '#dcfce7', text: '#166534' };
    if (status === 'Reject') return { bg: '#fee2e2', text: '#991b1b' };
    return { bg: '#fef3c7', text: '#92400e' }; // Pending / Not Approved
  };

  return (
    <div style={{ padding: '0 0 4rem 0', maxWidth: '100%', position: 'relative' }}>
      {loading && (
        <div className="loader-overlay">
          <div className="dotted-loader">
            <div className="dot"></div><div className="dot"></div>
            <div className="dot"></div><div className="dot"></div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            View Share Application/Request
          </h2>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
            View and manage share allocations and requests
          </div>
        </div>
      </div>

      {/* Filters Container */}
      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', 
        border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '8px', padding: '20px', 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', marginBottom: '24px' 
      }}>
        
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            
            <div>
              <label style={labelStyle}>Select Branch</label>
              <select value={branchId} onChange={(e) => setBranchId(e.target.value)} style={inputStyle}>
                <option value="0">Select Branch</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Select Search Field</label>
              <select value={searchField} onChange={(e) => setSearchField(e.target.value)} style={inputStyle}>
                <option value="0">Select Field</option>
                <option value="1">Member ID</option>
                <option value="2">Name</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Enter Search Data</label>
              <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} style={inputStyle} placeholder="Search data..." />
            </div>

            <div>
              <label style={labelStyle}>Date Range</label>
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={inputStyle}>
                <option value="All">All</option>
                <option value="Today">Today</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Select Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
                <option value="6">ALL</option>
                <option value="0">Pending</option>
                <option value="1">Approved</option>
                <option value="3">Reject</option>
              </select>
            </div>
            
          </div>

          {dateRange === 'Custom' && (
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ flex: '1' }}>
                <label style={labelStyle}>From Date</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={inputStyle} required />
              </div>
              <div style={{ flex: '1' }}>
                <label style={labelStyle}>To Date</label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={inputStyle} required />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <button type="submit" style={{ 
              height: '36px', padding: '0 32px', backgroundColor: '#2563eb', color: 'white', 
              border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '700', 
              cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)', transition: 'background-color 0.2s'
            }}
            onMouseOver={e => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={e => e.target.style.backgroundColor = '#2563eb'}
            >
              SEARCH
            </button>
          </div>
        </form>
      </div>

      {/* Data Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '900px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>App No.</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Branch</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Member ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>Share Type</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#475569' }}>Shares</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#475569' }}>Amount (₹)</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>Pay Mode</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? data.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', transition: 'background-color 0.15s' }}>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#0f172a' }}>{item.application_no}</td>
                  <td style={{ padding: '12px', textAlign: 'left', color: '#334155' }}>
                    {new Date(item.application_date).toLocaleDateString('en-GB')}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'left', color: '#334155' }}>{item.branch_name || 'N/A'}</td>
                  <td style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#2563eb' }}>{item.member_id}</td>
                  <td style={{ padding: '12px', textAlign: 'left', color: '#334155' }}>{item.member_name}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#334155' }}>{item.share_type}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#0f172a' }}>{item.no_of_shares}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>{Number(item.amount).toFixed(2)}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#334155' }}>{item.pay_mode}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '700', 
                      backgroundColor: getStatusColor(item.status).bg,
                      color: getStatusColor(item.status).text
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => setSelectedApp(item)}
                      style={{ 
                        background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', 
                        fontWeight: '600', cursor: 'pointer', fontSize: '11px', padding: '4px 10px',
                        borderRadius: '4px', transition: 'all 0.15s'
                      }}
                      onMouseOver={e => { e.target.style.background = '#e2e8f0'; e.target.style.color = '#0f172a'; }}
                      onMouseOut={e => { e.target.style.background = '#f1f5f9'; e.target.style.color = '#475569'; }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="11" style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup Modal */}
      {selectedApp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '12px', width: '90%', maxWidth: '600px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            overflow: 'hidden', animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ 
              backgroundColor: '#1e293b', padding: '16px 20px', display: 'flex', 
              justifyContent: 'space-between', alignItems: 'center' 
            }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '15px', fontWeight: '600' }}>
                Share Application Details
              </h3>
              <button 
                onClick={() => setSelectedApp(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
                onMouseOver={e => e.target.style.color = 'white'}
                onMouseOut={e => e.target.style.color = '#94a3b8'}
              >
                &times;
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ 
                backgroundColor: '#f8fafc', padding: '10px 16px', borderLeft: '4px solid #10b981', 
                marginBottom: '20px', fontSize: '13px', fontWeight: '700', color: '#047857'
              }}>
                Application Information
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px 16px', fontSize: '13px', marginBottom: '24px' }}>
                <div style={{ color: '#64748b', fontWeight: '600' }}>Application No :</div>
                <div style={{ color: '#0f172a', fontWeight: '600' }}>{selectedApp.application_no}</div>
                
                <div style={{ color: '#64748b', fontWeight: '600' }}>Application Date :</div>
                <div style={{ color: '#0f172a' }}>{new Date(selectedApp.application_date).toLocaleDateString('en-GB')}</div>
                
                <div style={{ color: '#64748b', fontWeight: '600' }}>Branch Name :</div>
                <div style={{ color: '#0f172a' }}>{selectedApp.branch_name || 'N/A'}</div>
                
                <div style={{ color: '#64748b', fontWeight: '600' }}>Member ID :</div>
                <div style={{ color: '#2563eb', fontWeight: '700' }}>{selectedApp.member_id}</div>
                
                <div style={{ color: '#64748b', fontWeight: '600' }}>Member Name :</div>
                <div style={{ color: '#0f172a' }}>{selectedApp.member_name}</div>
                
                <div style={{ color: '#64748b', fontWeight: '600' }}>Share Type :</div>
                <div style={{ color: '#0f172a' }}>{selectedApp.share_type || 'N/A'}</div>
                
                <div style={{ color: '#64748b', fontWeight: '600' }}>No. of Shares :</div>
                <div style={{ color: '#0f172a', fontWeight: '600' }}>{selectedApp.no_of_shares}</div>
                
                <div style={{ color: '#64748b', fontWeight: '600' }}>Amount :</div>
                <div style={{ color: '#16a34a', fontWeight: '700' }}>₹ {Number(selectedApp.amount).toFixed(2)}</div>
                
                <div style={{ color: '#64748b', fontWeight: '600' }}>Payment Mode :</div>
                <div style={{ color: '#0f172a' }}>{selectedApp.pay_mode || 'N/A'}</div>
              </div>

              <div style={{ 
                backgroundColor: '#f8fafc', padding: '10px 16px', borderLeft: '4px solid #10b981', 
                marginBottom: '16px', fontSize: '13px', fontWeight: '700', color: '#047857'
              }}>
                Action Details
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px 16px', fontSize: '13px' }}>
                <div style={{ color: '#64748b', fontWeight: '600' }}>Processed By:</div>
                <div style={{ color: '#0f172a' }}>{selectedApp.created_by || 'Admin'}</div>
              </div>

            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', textAlign: 'right' }}>
              <button 
                onClick={() => setSelectedApp(null)}
                style={{ 
                  padding: '8px 20px', backgroundColor: '#e2e8f0', color: '#475569', 
                  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', 
                  cursor: 'pointer', transition: 'background-color 0.2s'
                }}
                onMouseOver={e => e.target.style.backgroundColor = '#cbd5e1'}
                onMouseOut={e => e.target.style.backgroundColor = '#e2e8f0'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default ViewShareApplication;
