import React, { useState, useEffect } from 'react';

export default function AddServiceCenterUser() {
  const [branches, setBranches] = useState([]);
  const [serviceCenters, setServiceCenters] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    branch_id: '',
    service_center_id: '',
    contact_name: '',
    phone_no: '',
    mobile_no: '',
    email: '',
    address: '',
    pin_code: '',
    bank_account_no: '',
    bank_account_name: '',
    bank_name: '',
    bank_ifsc: '',
    bank_branch_name: '',
    min_balance: '',
    username: '',
    password: '',
    confirmPassword: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [branchRes, scRes] = await Promise.all([
        fetch('/api/branches', { headers }),
        fetch('/api/service-centers', { headers })
      ]);

      if (branchRes.ok) setBranches(await branchRes.json());
      if (scRes.ok) setServiceCenters(await scRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.branch_id) return showError('Please Select branch name');
    if (!formData.service_center_id) return showError('Please Select Service Center');
    if (!formData.contact_name) return showError('Enter the contact name');
    if (!formData.mobile_no) return showError('Enter the mobile no');
    if (!formData.username) return showError('Enter the user name');
    if (formData.username.length < 8) return showError('Minimum 8 Characters Required for username');
    if (!formData.password) return showError('Enter the password');
    if (!formData.confirmPassword) return showError('Confirm Password Required');
    if (formData.password !== formData.confirmPassword) return showError('Confirm Password Should Match');
    
    // Password complex check: Minimum 8 characters atleast 1 Alphabet, 1 Number and 1 Special Character
    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;
    if (!passRegex.test(formData.password)) {
      return showError('Password Minimum 8 characters atleast 1 Alphabet, 1 Number and 1 Special Character');
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/service-center-users', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message);
        setFormData({
          branch_id: '', service_center_id: '', contact_name: '', phone_no: '', mobile_no: '', 
          email: '', address: '', pin_code: '', 
          bank_account_no: '', bank_account_name: '', bank_name: '', bank_ifsc: '', bank_branch_name: '', min_balance: '',
          username: '', password: '', confirmPassword: '', is_active: true
        });
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        showError(data.error || 'Failed to create user');
      }
    } catch (err) {
      showError('An error occurred while creating user.');
    } finally {
      setLoading(false);
    }
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  // Filter service centers by selected branch
  const filteredScs = serviceCenters.filter(sc => sc.branch_id == formData.branch_id);

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

      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '6px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase' }}>Create Service Center User</h3>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '15px', alignItems: 'center', maxWidth: '800px' }}>
          
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', paddingLeft: '10px' }}>Select Branch <span style={{color: '#ef4444'}}>*</span></label>
          <select name="branch_id" value={formData.branch_id} onChange={handleInputChange} style={inputStyle} disabled={loading || fetching}>
            <option value="">Select Branch</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', paddingLeft: '10px' }}>Select Service Center <span style={{color: '#ef4444'}}>*</span></label>
          <select name="service_center_id" value={formData.service_center_id} onChange={handleInputChange} style={inputStyle} disabled={loading || fetching}>
            <option value="">Select Service Center</option>
            {filteredScs.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
          </select>

          <label style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', paddingLeft: '10px' }}>Account No <span style={{color: '#ef4444'}}>*</span></label>
          <input type="text" value="" readOnly placeholder="Auto Generated" style={{ ...inputStyle, backgroundColor: '#cbd5e1' }} />

          <label style={lbl}>Contact Name <span style={{color: '#ef4444'}}>*</span></label>
          <input type="text" name="contact_name" value={formData.contact_name} onChange={handleInputChange} style={inputStyle} maxLength="30" disabled={loading} />

          <label style={lbl}>Phone No <span style={{color:'#ef4444'}}>*</span></label>
          <input type="text" name="phone_no" value={formData.phone_no} onChange={handleInputChange} maxLength="10" style={inputStyle} disabled={loading} />

          <label style={lbl}>Mobile No <span style={{color: '#ef4444'}}>*</span></label>
          <input type="text" name="mobile_no" value={formData.mobile_no} onChange={handleInputChange} maxLength="10" style={inputStyle} disabled={loading} />

          <label style={lbl}>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={inputStyle} maxLength="30" disabled={loading} />

          <label style={lbl}>Address</label>
          <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" style={{...inputStyle, resize: 'vertical'}} disabled={loading}></textarea>

          <label style={lbl}>Pin Code</label>
          <input type="text" name="pin_code" value={formData.pin_code} onChange={handleInputChange} maxLength="6" style={inputStyle} disabled={loading} />

          {/* Bank Details */}
          <div style={{ gridColumn: '1 / -1', backgroundColor: '#1e3a8a', color: 'white', padding: '8px 16px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', borderRadius: '4px', marginTop: '0.5rem' }}>
            Bank Details
          </div>

          <label style={lbl}>Bank Account No</label>
          <input type="text" name="bank_account_no" value={formData.bank_account_no} onChange={handleInputChange} maxLength="20" style={inputStyle} disabled={loading} />

          <label style={lbl}>Bank Account Name</label>
          <input type="text" name="bank_account_name" value={formData.bank_account_name} onChange={handleInputChange} maxLength="100" style={inputStyle} disabled={loading} />

          <label style={lbl}>Bank Name</label>
          <input type="text" name="bank_name" value={formData.bank_name} onChange={handleInputChange} maxLength="50" style={inputStyle} disabled={loading} />

          <label style={lbl}>IFSC Code</label>
          <input type="text" name="bank_ifsc" value={formData.bank_ifsc} onChange={handleInputChange} maxLength="11" placeholder="e.g. SBIN0001234" style={inputStyle} disabled={loading} />

          <label style={lbl}>Bank Branch Name</label>
          <input type="text" name="bank_branch_name" value={formData.bank_branch_name} onChange={handleInputChange} maxLength="50" style={inputStyle} disabled={loading} />

          <label style={lbl}>Minimum Balance</label>
          <input type="number" name="min_balance" value={formData.min_balance} onChange={handleInputChange} step="0.01" style={inputStyle} disabled={loading} />

          {/* Login Details */}
          <div style={{ gridColumn: '1 / -1', backgroundColor: '#1e3a8a', color: 'white', padding: '8px 16px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', borderRadius: '4px', marginTop: '0.5rem' }}>
            Login Details
          </div>

          <label style={lbl}>User Name <span style={{color: '#ef4444'}}>*</span></label>
          <input type="text" name="username" value={formData.username} onChange={handleInputChange} maxLength="30" style={inputStyle} disabled={loading} />

          <label style={lbl}>Password <span style={{color: '#ef4444'}}>*</span></label>
          <input type="password" name="password" value={formData.password} onChange={handleInputChange} maxLength="30" style={inputStyle} disabled={loading} />

          <label style={lbl}>Confirm Password <span style={{color: '#ef4444'}}>*</span></label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} maxLength="30" style={inputStyle} disabled={loading} />

          <label style={lbl}>Is Active</label>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingTop: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="radio" name="is_active" checked={formData.is_active !== false} onChange={() => setFormData({...formData, is_active: true})} disabled={loading} />
              <span style={{ color: '#16a34a', fontWeight: '700' }}>Active</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="radio" name="is_active" checked={formData.is_active === false} onChange={() => setFormData({...formData, is_active: false})} disabled={loading} />
              <span style={{ color: '#ef4444', fontWeight: '700' }}>In Active</span>
            </label>
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '1rem' }}>
            <button type="submit" disabled={loading} style={buttonStyle('#1e40af')}>
              {loading ? 'SUBMITTING...' : 'SUBMIT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const lbl = { fontSize: '11px', fontWeight: '700', color: '#374151', paddingLeft: '10px', textTransform: 'uppercase', letterSpacing: '0.3px' };

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
  padding: '10px 20px',
  borderRadius: '4px',
  border: 'none',
  fontWeight: '700',
  fontSize: '12px',
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  transition: 'all 0.2s',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  minWidth: '100px'
});
