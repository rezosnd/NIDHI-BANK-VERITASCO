import { useState, useEffect } from 'react';

function BranchManagement({ view }) {
  const [branches, setBranches] = useState([]);
  const [showForm, setShowForm] = useState(view === 'Create Branch');
  const [errorMsg, setErrorMsg] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    state: '',
    address: '',
    contactName: '',
    phoneNo: '',
    mobileNo: '',
    email: '',
    pinCode: ''
  });

  const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ];

  useEffect(() => {
    setShowForm(view === 'Create Branch');
    if (view !== 'Create Branch') setEditingId(null);
  }, [view]);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/branches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBranches(data);
      } else {
        console.error("Failed to fetch branches", data.message);
      }
    } catch (err) {
      console.error("Failed to fetch branches", err);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (branch) => {
    setFormData({
      name: branch.name || '',
      code: branch.code || '',
      state: branch.state || '',
      address: branch.address || '',
      contactName: branch.contact_name || '',
      phoneNo: branch.phone_no || '',
      mobileNo: branch.mobile_no || '',
      email: branch.email || '',
      pinCode: branch.pin_code || ''
    });
    setEditingId(branch.id);
    setGeneratedCredentials(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = (branch) => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">VeritasCo Nidhi Bank - Branch Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Branch Code</td><td style="padding: 8px; border: 1px solid #ddd;">${branch.code}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Branch Name</td><td style="padding: 8px; border: 1px solid #ddd;">${branch.name}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">State</td><td style="padding: 8px; border: 1px solid #ddd;">${branch.state}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Contact Name</td><td style="padding: 8px; border: 1px solid #ddd;">${branch.contact_name || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone No</td><td style="padding: 8px; border: 1px solid #ddd;">${branch.phone_no || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Mobile No</td><td style="padding: 8px; border: 1px solid #ddd;">${branch.mobile_no || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #ddd;">${branch.email || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">PIN Code</td><td style="padding: 8px; border: 1px solid #ddd;">${branch.pin_code || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Address</td><td style="padding: 8px; border: 1px solid #ddd;">${branch.address || 'N/A'}</td></tr>
        </table>
        <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">Generated automatically by VeritasCo Nidhi Systems Admin Panel</p>
      </div>
    `;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleResetPassword = async (branch) => {
    if (!window.confirm(`Are you sure you want to reset the login password for the branch: ${branch.name}?`)) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/branches/${branch.id}/password`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.credentials) {
        setGeneratedCredentials(data.credentials);
        setShowForm(true);
        setEditingId(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(data.error || 'Failed to reset password. Note: Only branches created recently have an associated user account.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setGeneratedCredentials(null);
    try {
      const token = localStorage.getItem('authToken');
      const url = editingId ? `/api/branches/${editingId}` : '/api/branches';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error("Server returned an invalid response. Ensure Vite is proxying correctly or refresh the page.");
      }

      if (data.success) {
        setEditingId(null);
        setFormData({ name: '', code: '', state: '', address: '', contactName: '', phoneNo: '', mobileNo: '', email: '', pinCode: '' });
        fetchBranches();
        if (data.credentials) {
          setGeneratedCredentials(data.credentials);
        } else {
          setShowForm(false);
        }
      } else {
        setErrorMsg('Error: ' + (data.error || data.message || 'Unknown error occurred. You may need to log out and log back in.'));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to connect to backend server.');
    }
  };

  return (
    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)', borderTop: '4px solid var(--primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.4)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#0f172a', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Branch Management Console</h3>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            if(showForm) {
              setEditingId(null); // Reset edit state if manually closing
              setGeneratedCredentials(null);
            }
          }} 
          style={{ backgroundColor: showForm ? '#f1f5f9' : 'var(--primary)', color: showForm ? '#475569' : 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          {showForm ? 'Close Form' : '+ Add New Branch'}
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: '2.5rem', padding: '2rem', backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.6)' }}>
          
          {generatedCredentials ? (
            <div style={{ padding: '2rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1)' }}>
              <h3 style={{ color: 'var(--primary)', margin: '0 0 1rem 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Branch & Account Credentials Generated!
              </h3>
              <p style={{ color: '#334155', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: '1.5' }}>
                Please securely share these login credentials with the appointed Branch Manager. <br/>
                <strong style={{ color: '#dc2626' }}>⚠️ You will not be able to view this password again after closing this window.</strong>
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #93c5fd' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.4rem 0', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Branch Username</p>
                  <p style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: '800', margin: 0, userSelect: 'all', fontFamily: 'monospace', backgroundColor: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.6)' }}>
                    {generatedCredentials.username}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.4rem 0', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Secure Password</p>
                  <p style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: '800', margin: 0, userSelect: 'all', fontFamily: 'monospace', backgroundColor: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.6)' }}>
                    {generatedCredentials.password}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button 
                  onClick={() => { setGeneratedCredentials(null); setShowForm(false); }} 
                  style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  onMouseEnter={(e) => { e.target.style.boxShadow = '0 6px 8px -1px rgba(0, 0, 0, 0.15)' }}
                  onMouseLeave={(e) => { e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                >
                  I have saved these credentials
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              {errorMsg && (
                <div style={{ gridColumn: '1 / -1', padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #f87171', color: '#dc2626', borderRadius: '6px', fontWeight: '600' }}>
                  ⚠️ {errorMsg}
                </div>
              )}

          <div>
            <label className="form-label" style={{ textTransform: 'none', fontWeight: '600', color: '#334155', marginBottom: '0.5rem', display: 'block' }}>Branch Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required placeholder="Enter branch name" />
          </div>
          <div>
            <label className="form-label" style={{ textTransform: 'none', fontWeight: '600', color: '#334155', marginBottom: '0.5rem', display: 'block' }}>Branch Code <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" name="code" className="form-input" value={formData.code} onChange={handleChange} required placeholder="e.g. BR-001" />
          </div>
          <div>
            <label className="form-label" style={{ textTransform: 'none', fontWeight: '600', color: '#334155', marginBottom: '0.5rem', display: 'block' }}>State <span style={{ color: '#ef4444' }}>*</span></label>
            <select name="state" className="form-input" value={formData.state} onChange={handleChange} required>
              <option value="">Select State</option>
              {INDIAN_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label" style={{ textTransform: 'none', fontWeight: '600', color: '#334155', marginBottom: '0.5rem', display: 'block' }}>Contact Person</label>
            <input type="text" name="contactName" className="form-input" value={formData.contactName} onChange={handleChange} placeholder="Manager's full name" />
          </div>
          <div>
            <label className="form-label" style={{ textTransform: 'none', fontWeight: '600', color: '#334155', marginBottom: '0.5rem', display: 'block' }}>Phone Number</label>
            <input type="tel" name="phoneNo" className="form-input" value={formData.phoneNo} onChange={handleChange} placeholder="Landline or primary phone" />
          </div>
          <div>
            <label className="form-label" style={{ textTransform: 'none', fontWeight: '600', color: '#334155', marginBottom: '0.5rem', display: 'block' }}>Mobile Number</label>
            <input type="tel" name="mobileNo" className="form-input" value={formData.mobileNo} onChange={handleChange} placeholder="Direct mobile number" />
          </div>
          <div>
            <label className="form-label" style={{ textTransform: 'none', fontWeight: '600', color: '#334155', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
            <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="branch@example.com" />
          </div>
          <div>
            <label className="form-label" style={{ textTransform: 'none', fontWeight: '600', color: '#334155', marginBottom: '0.5rem', display: 'block' }}>PIN Code</label>
            <input type="text" name="pinCode" className="form-input" value={formData.pinCode} onChange={handleChange} placeholder="6-digit PIN code" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" style={{ textTransform: 'none', fontWeight: '600', color: '#334155', marginBottom: '0.5rem', display: 'block' }}>Full Address</label>
            <textarea name="address" className="form-input" rows="2" value={formData.address} onChange={handleChange} placeholder="Enter complete branch address"></textarea>
          </div>
          
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
              {editingId ? 'Update Branch Details' : 'Save Branch Details'}
            </button>
          </div>
        </form>
        )}
      </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', textAlign: 'left' }}>
              <th style={{ padding: '1rem', borderBottom: '2px solid #cbd5e1', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Code</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #cbd5e1', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Branch Name</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #cbd5e1', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>State</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #cbd5e1', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Contact Person</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #cbd5e1', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Phone</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #cbd5e1', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #cbd5e1', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No branches found in database. Add one to get started.</td></tr>
            ) : (
              branches.map(branch => (
                <tr key={branch.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.4)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>{branch.code}</td>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#0f172a' }}>{branch.name}</td>
                  <td style={{ padding: '1rem', color: '#334155', fontSize: '0.9rem' }}>{branch.state}</td>
                  <td style={{ padding: '1rem', color: '#334155', fontSize: '0.9rem' }}>{branch.contact_name}</td>
                  <td style={{ padding: '1rem', color: '#334155', fontSize: '0.9rem' }}>{branch.phone_no}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.35rem 0.85rem', backgroundColor: '#16a34a', color: 'white', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '700', boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)' }}>
                      {branch.status || 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => handleEdit(branch)} style={{ backgroundColor: 'var(--primary)', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: '600', fontSize: '0.8rem', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }} onMouseEnter={(e) => {e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 4px 6px rgba(37, 99, 235, 0.3)'}} onMouseLeave={(e) => {e.target.style.transform = 'none'; e.target.style.boxShadow = '0 2px 4px rgba(37, 99, 235, 0.2)'}}>Edit</button>
                    <button onClick={() => handlePrint(branch)} style={{ backgroundColor: '#475569', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: '600', fontSize: '0.8rem', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(71, 85, 105, 0.2)' }} onMouseEnter={(e) => {e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 4px 6px rgba(71, 85, 105, 0.3)'}} onMouseLeave={(e) => {e.target.style.transform = 'none'; e.target.style.boxShadow = '0 2px 4px rgba(71, 85, 105, 0.2)'}}>Print</button>
                    <button onClick={() => handleResetPassword(branch)} style={{ backgroundColor: '#f59e0b', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: '600', fontSize: '0.8rem', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)' }} onMouseEnter={(e) => {e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 4px 6px rgba(245, 158, 11, 0.3)'; e.target.style.backgroundColor = '#d97706'}} onMouseLeave={(e) => {e.target.style.transform = 'none'; e.target.style.boxShadow = '0 2px 4px rgba(245, 158, 11, 0.2)'; e.target.style.backgroundColor = '#f59e0b'}}>Reset Password</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BranchManagement;
