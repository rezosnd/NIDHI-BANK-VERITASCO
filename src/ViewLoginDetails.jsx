import React, { useState, useEffect } from 'react';

function ViewLoginDetails() {
  const getTodayFormatted = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [companyProfile, setCompanyProfile] = useState({});
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState('0');
  const [selectedUserType, setSelectedUserType] = useState('0');
  const [selectedUser, setSelectedUser] = useState('0');
  const [fromDate, setFromDate] = useState(getTodayFormatted());
  const [toDate, setToDate] = useState(getTodayFormatted());

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const [branchRes, userRes, profileRes] = await Promise.all([
        fetch('/api/branches', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/profile', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (branchRes.ok && userRes.ok && profileRes.ok) {
        const branchData = await branchRes.json();
        const userData = await userRes.json();
        const profileData = await profileRes.json();
        setBranches(branchData);
        setUsers(userData);
        setCompanyProfile(profileData.profile || {});
      }
    } catch (err) {
      setErrorMessage('Failed to load filter data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      setErrorMessage('');
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/login_history', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          branch_id: selectedBranch,
          user_type: selectedUserType,
          user_id: selectedUser,
          from_date: fromDate,
          to_date: toDate
        })
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      } else {
        setErrorMessage('Failed to search login history.');
      }
    } catch (err) {
      setErrorMessage('Network error while searching.');
    } finally {
      setIsSearching(false);
    }
  };

  // Extract unique roles for the dropdown, or use a static list from the backend
  const userTypes = [...new Set(users.map(u => u.role))];

  // Filter users based on selected branch and user type
  const filteredUsers = users.filter(u => {
    let match = true;
    if (selectedBranch !== '0' && u.branch_id && u.branch_id.toString() !== selectedBranch) match = false;
    if (selectedUserType !== '0' && u.role !== selectedUserType) match = false;
    return match;
  });

  const getBranchName = () => {
    if (selectedBranch === '0') return 'All';
    const branch = branches.find(b => b.id.toString() === selectedBranch);
    return branch ? branch.name : 'Unknown';
  };

  const handlePrint = () => {
    const printElement = document.getElementById('printable-report');
    if (!printElement) return;
    
    // Create a new window for printing to avoid Dashboard CSS conflicts (which caused the blank page)
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert("Please allow popups to print the report.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Login Details Report</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 20px; 
              color: #1e293b;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              font-size: 0.8rem; 
              margin-top: 10px;
            }
            th, td { 
              border: 1px solid #cbd5e1; 
              padding: 8px 14px; 
              text-align: left; 
            }
            th { 
              background-color: #1e293b !important; 
              color: white !important; 
              font-weight: 600;
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            }
            .print-header { display: block !important; }
            .no-print { display: none !important; }
            @media print {
              body { padding: 0; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          ${printElement.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    
    // Slight delay to ensure fonts/styles render before the print dialog opens
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleExportExcel = () => {
    setShowExportMenu(false);
    if (history.length === 0) return;

    // Create a rich HTML structure using classic <table> layouts that Excel understands perfectly.
    // Excel ignores CSS Flexbox and CSS image widths, so we must use native attributes.
    const htmlToExport = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; font-family: 'Arial', sans-serif; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 12px; }
          .no-border { border: none !important; }
          .center { text-align: center; }
          .table-header { background-color: #1e293b; color: white; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="2" class="no-border" style="vertical-align: top;">
              <img src="${window.location.origin}/veritasco.png" width="60" height="60" alt="Logo" />
              <div style="font-weight: bold; color: #0052cc; font-size: 14px; margin-top: 4px;">VeritasCo</div>
              <div style="font-size: 10px; color: #64748b;">Nidhi Bank</div>
            </td>
            <td colspan="4" class="no-border center">
              <h1 style="margin: 0; font-size: 18px;">${companyProfile.company_name || ''}</h1>
              <div style="font-weight: bold; margin-top: 4px;">REG. NO. : ${companyProfile.cin_no || ''}</div>
              <div style="font-size: 11px; margin-top: 4px;">REG. OFFICE : ${[companyProfile.address_line1, companyProfile.address_line2, companyProfile.city, companyProfile.state, companyProfile.pincode].filter(Boolean).join(' ')}</div>
              <div style="font-size: 11px; margin-top: 2px;">WEBSITE: ${companyProfile.website || ''} | EMAIL: ${companyProfile.email || ''} | CONTACT: ${companyProfile.mobile || ''}</div>
              <div style="font-weight: bold; margin-top: 10px; font-size: 13px;">Branch Name : ${getBranchName()}</div>
            </td>
          </tr>
          <tr>
            <td colspan="6" class="no-border center">
              <h3 style="margin-top: 10px; margin-bottom: 10px;">LOGIN DETAILS FROM DATE ${fromDate.split('-').reverse().join('/')} TO ${toDate.split('-').reverse().join('/')}</h3>
            </td>
          </tr>
          <tr class="table-header">
            <th>Sl No</th>
            <th>User Name</th>
            <th>Role / UserType</th>
            <th>Branch</th>
            <th>Login Time</th>
            <th>IP Address</th>
          </tr>
          ${history.map((record, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${record.username}</td>
              <td>${record.user_type}</td>
              <td>${record.branch_name || 'Admin HQ'}</td>
              <td>${new Date(record.login_time).toLocaleString()}</td>
              <td>${record.ip_address || '127.0.0.1'}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([htmlToExport], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Login_Report_${fromDate}_to_${toDate}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
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
          .role-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
          }
          .role-Admin { background-color: #fee2e2; color: #991b1b; }
          .role-Branch { background-color: #dcfce7; color: #166534; }
          .role-Other { background-color: #e0f2fe; color: #075985; }
          .print-header { display: none; }
        `}
      </style>

      {/* Header section */}
      <div className="no-print solid-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              View Login Details
            </h2>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
            {/* Export Dropdown Container */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                  color: '#475569',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Export
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>

              {showExportMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  zIndex: 50,
                  width: '140px',
                  overflow: 'hidden'
                }}>
                  <button 
                    onClick={handleExportExcel}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: 'none', backgroundColor: 'transparent', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#1e293b' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Excel (.xls)
                  </button>
                  <button 
                    onClick={() => { setShowExportMenu(false); handlePrint(); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: 'none', backgroundColor: 'transparent', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', color: '#1e293b', borderTop: '1px solid rgba(255, 255, 255, 0.4)' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    PDF Format
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(16, 185, 129, 0.2)',
                transition: 'background-color 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Report
            </button>
          </div>
        </div>

        {errorMessage && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fca5a5' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {errorMessage}
          </div>
        )}

        {/* Filters Panel */}
        <div className="filter-panel" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            
            {/* Branch Dropdown */}
            <div>
              <label className="solid-label">Branch</label>
              <select 
                className="solid-input"
                value={selectedBranch}
                onChange={(e) => { setSelectedBranch(e.target.value); setSelectedUser('0'); }}
              >
                <option value="0">All Branches</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            {/* User Type Dropdown */}
            <div>
              <label className="solid-label">User Type</label>
              <select 
                className="solid-input"
                value={selectedUserType}
                onChange={(e) => { setSelectedUserType(e.target.value); setSelectedUser('0'); }}
              >
                <option value="0">All Roles</option>
                {userTypes.map((role, idx) => <option key={idx} value={role}>{role}</option>)}
              </select>
            </div>

            {/* User Dropdown */}
            <div>
              <label className="solid-label">Specific User</label>
              <select 
                className="solid-input"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="0">All Users</option>
                {filteredUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="solid-label">From Date</label>
              <input 
                className="solid-input"
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            {/* To Date */}
            <div>
              <label className="solid-label">To Date</label>
              <input 
                className="solid-input"
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
          
          {/* Search Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.4)', paddingTop: '20px' }}>
            <button 
              className="solid-btn"
              onClick={handleSearch}
              disabled={isSearching || isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: (isSearching || isLoading) ? '#94a3b8' : '',
                padding: '8px 24px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: (isSearching || isLoading) ? 'not-allowed' : 'pointer'
              }}
            >
              {isSearching ? 'Searching...' : 'Search Records'}
            </button>
          </div>
        </div>

        {/* Results Data Table (Printable Area) */}
        <div id="printable-report" style={{ backgroundColor: 'transparent' }}>
          
          {/* Print Only Header matching the requested design */}
          <div className="print-header" style={{ marginBottom: '20px', textAlign: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '30%', textAlign: 'left' }}>
                <img 
                  src={`${window.location.origin}/veritasco.png`} 
                  alt="VeritasCo Logo" 
                  style={{ width: '50px', height: 'auto', objectFit: 'contain' }} 
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0052cc' }}>VeritasCo</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Nidhi Bank</div>
                </div>
              </div>
              <div style={{ width: '70%', textAlign: 'center' }}>
                <h1 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: '800' }}>{companyProfile.company_name}</h1>
                <div style={{ fontSize: '11px', fontWeight: '600' }}>REG. NO. : {companyProfile.cin_no}</div>
                <div style={{ fontSize: '10px', color: '#334155', marginTop: '4px' }}>
                  REG. OFFICE : {[companyProfile.address_line1, companyProfile.address_line2, companyProfile.city, companyProfile.state, companyProfile.pincode].filter(Boolean).join(' ')}
                </div>
                <div style={{ fontSize: '10px', color: '#334155' }}>
                  WEBSITE: {companyProfile.website || ''} | EMAIL: {companyProfile.email} | CONTACT: {companyProfile.mobile}
                </div>
                <div style={{ fontSize: '11px', fontWeight: '700', marginTop: '8px' }}>
                  Branch Name : {getBranchName()}
                </div>
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.4)', marginTop: '10px', paddingTop: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                LOGIN DETAILS FROM DATE {fromDate.split('-').reverse().join('/')} TO {toDate.split('-').reverse().join('/')}
              </h3>
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr className="table-solid-header" style={{ textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: '600', border: '1px solid #334155' }}>Sl No</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600', border: '1px solid #334155' }}>User Name</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600', border: '1px solid #334155' }}>Role</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600', border: '1px solid #334155' }}>Branch</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600', border: '1px solid #334155' }}>Login Time</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600', border: '1px solid #334155' }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {isSearching ? (
                  <tr className="no-print">
                    <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#475569' }}>
                      <div className="dotted-loader" style={{ justifyContent: 'center', marginBottom: '8px' }}>
                        <div className="dot" style={{ backgroundColor: '#0f172a' }}></div><div className="dot" style={{ backgroundColor: '#0f172a' }}></div><div className="dot" style={{ backgroundColor: '#0f172a' }}></div>
                      </div>
                      <div style={{ fontWeight: '600' }}>Querying secure database...</div>
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr className="no-print">
                    <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ marginBottom: '8px' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                      </svg>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>No Data Available</div>
                    </td>
                  </tr>
                ) : (
                  history.map((record, idx) => {
                    const roleClass = record.user_type === 'Admin' ? 'role-Admin' : (record.user_type?.includes('Branch') ? 'role-Branch' : 'role-Other');
                    return (
                      <tr key={record.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.4)' }}>
                        <td style={{ padding: '12px', color: '#334155', borderRight: '1px solid rgba(255,255,255,0.4)' }}>{idx + 1}</td>
                        <td style={{ padding: '12px', color: '#0052cc', fontWeight: '700', borderRight: '1px solid rgba(255,255,255,0.4)' }}>{record.username}</td>
                        <td style={{ padding: '12px', borderRight: '1px solid rgba(255,255,255,0.4)' }}>
                          <span className={`role-badge ${roleClass}`}>
                            {record.user_type}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#0f172a', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.4)' }}>{record.branch_name || 'Admin HQ'}</td>
                        <td style={{ padding: '12px', color: '#334155', borderRight: '1px solid rgba(255,255,255,0.4)' }}>
                          {new Date(record.login_time).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', color: '#0f172a', fontFamily: 'monospace' }}>
                          {record.ip_address || '127.0.0.1'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ViewLoginDetails;
