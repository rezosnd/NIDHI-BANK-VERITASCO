import { useState, useEffect } from 'react';

const inputStyle = {
  width: '100%', padding: '6px 12px', fontSize: '13px', height: '32px', 
  border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '4px', color: '#1e293b', 
  backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', 
  WebkitBackdropFilter: 'blur(32px)', outline: 'none', transition: 'border-color 0.15s ease'
};

function PendingUploadDocument() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchField, setSearchField] = useState('0');
  const [searchValue, setSearchValue] = useState('');
  const [dateRange, setDateRange] = useState('All');
  const [statusFilter, setStatusFilter] = useState('6'); // 6=ALL, 0=Pending, 1=Approved
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/kyc/pending-documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Front-end filtering since the backend returned all Data
  };

  const filteredData = data.filter(item => {
    let matchesSearch = true;
    if (searchValue.trim() !== '') {
      const query = searchValue.toLowerCase();
      if (searchField === '1') matchesSearch = item.memberId.toLowerCase().includes(query);
      else if (searchField === '2') matchesSearch = item.name.toLowerCase().includes(query);
      else if (searchField === '3') matchesSearch = item.contactNo.includes(query);
      else matchesSearch = item.memberId.toLowerCase().includes(query) || item.name.toLowerCase().includes(query) || item.contactNo.includes(query);
    }
    
    let matchesStatus = true;
    if (statusFilter === '0') matchesStatus = item.status === 'Pending';
    else if (statusFilter === '1') matchesStatus = item.status === 'APPROVED';
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '0 0 4rem 0', maxWidth: '100%' }}>
      {loading && (
        <div className="loader-overlay">
          <div className="dotted-loader">
            <div className="dot"></div><div className="dot"></div>
            <div className="dot"></div><div className="dot"></div>
          </div>
        </div>
      )}

      {/* Top Action Bar / Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Member Pending Upload Document For Approval Request
          </h2>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
            View and manage member KYC uploads
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', 
        border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '6px', padding: '16px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
      }}>
        
        {/* Filters */}
        <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Select Search Field:
            </div>
            <select value={searchField} onChange={(e) => setSearchField(e.target.value)} style={inputStyle}>
              <option value="0">Select Field</option>
              <option value="1">Member ID</option>
              <option value="2">Name</option>
              <option value="3">Mobile No</option>
            </select>
          </div>
          
          <div style={{ flex: '2 1 300px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Enter Search Data:
            </div>
            <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} style={inputStyle} placeholder="Enter value..." />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Date Range:
            </div>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={inputStyle}>
              <option value="All">All</option>
              <option value="Today">Today</option>
              <option value="This Month">This Month</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Status:
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={inputStyle}>
              <option value="6">ALL</option>
              <option value="0">Pending</option>
              <option value="1">Approved</option>
            </select>
          </div>

          <div style={{ flex: '0 0 auto' }}>
            <button type="submit" style={{ 
              height: '32px', padding: '0 24px', backgroundColor: '#2563eb', color: 'white', 
              border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '700', 
              cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' 
            }}>
              SEARCH
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#2563eb' }}>
            No of Total Upload Document For Approval : {filteredData.length}
          </div>
          <button style={{ 
              height: '28px', padding: '0 16px', backgroundColor: '#10b981', color: 'white', 
              border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: '700', 
              cursor: 'pointer', boxShadow: '0 1px 2px rgba(16,185,129,0.2)' 
          }}>
            EXPORT TO EXCEL
          </button>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>Sl No.</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Member ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Reg.Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Contact No</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>Total KYC</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>Uploaded KYC</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#334155' }}>{idx + 1}</td>
                  <td style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#0f172a' }}>{item.memberId}</td>
                  <td style={{ padding: '12px', textAlign: 'left', color: '#334155' }}>{item.name}</td>
                  <td style={{ padding: '12px', textAlign: 'left', color: '#334155' }}>{item.regDate}</td>
                  <td style={{ padding: '12px', textAlign: 'left', color: '#334155' }}>{item.contactNo}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#334155' }}>{item.totalKyc}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#334155' }}>
                    <div style={{ fontSize: '11px', marginBottom: '2px' }}>{item.uploadedKyc}</div>
                    <span style={{ fontWeight: '600' }}>({item.uploadedKycCount})</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '700', 
                      backgroundColor: item.status === 'APPROVED' ? '#dcfce7' : '#fee2e2',
                      color: item.status === 'APPROVED' ? '#166534' : '#991b1b'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button style={{ 
                      background: 'none', border: 'none', color: '#2563eb', fontWeight: '700', 
                      cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' 
                    }}>
                      View
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default PendingUploadDocument;
