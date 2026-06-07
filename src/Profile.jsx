import { useState, useEffect } from 'react';

const INDIAN_STATES = [
  "Andaman & Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chattisgarh", "Dadra & Nagar Haveli", "Daman & Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Karnataka", "Kerala",
  "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Orissa", "Pondicherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

function Profile() {
  const [formData, setFormData] = useState({
    companyName: '',
    shortName: '',
    aboutCompany: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    mobile: '',
    landline: '',
    cinNo: '',
    email: '',
    panNo: '',
    tanNo: '',
    gstNo: '',
    companyCategory: '',
    companyClass: '',
    ifscCode: '',
    micrCode: '',
    incorporationDate: '',
    ratioOwnedFunds: '',
    ratioDeposits: '',
    percentageUnencumbered: '',
    neftAlertSms: false,
    neftAlertMobile: '',
    
    // Bank Details
    bankSelection: '',
    bankName: '',
    bankIfsc: '',
    accountNo: '',
    accountName: ''
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5000/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.profile) {
          const p = data.profile;
          setFormData({
            companyName: p.company_name || '', shortName: p.short_name || '', aboutCompany: p.about_company || '',
            addressLine1: p.address_line1 || '', addressLine2: p.address_line2 || '', city: p.city || '',
            state: p.state || '', pincode: p.pincode || '', country: p.country || '', mobile: p.mobile || '',
            landline: p.landline || '', cinNo: p.cin_no || '', email: p.email || '', panNo: p.pan_no || '',
            tanNo: p.tan_no || '', gstNo: p.gst_no || '', companyCategory: p.company_category || '',
            companyClass: p.company_class || '', ifscCode: p.ifsc_code || '', micrCode: p.micr_code || '',
            incorporationDate: p.incorporation_date || '', ratioOwnedFunds: p.ratio_owned_funds || '',
            ratioDeposits: p.ratio_deposits || '', percentageUnencumbered: p.percentage_unencumbered || '',
            neftAlertSms: p.neft_alert_sms || false, neftAlertMobile: p.neft_alert_mobile || '',
            bankSelection: p.bank_selection || '', bankName: p.bank_name || '', bankIfsc: p.bank_ifsc || '',
            accountNo: p.account_no || '', accountName: p.account_name || ''
          });
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save profile', err);
    }
  };

  const inputStyle = { textTransform: 'none', fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block', fontSize: '0.875rem' };
  const reqAsterisk = <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>;
  
  const sectionContainerStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
    transition: 'box-shadow 0.3s ease'
  };

  const SectionHeader = ({ title, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', boxShadow: 'inset 0 0 0 1px rgba(37,99,235,0.1)' }}>
        {children}
      </div>
      <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.15rem', fontWeight: '700', letterSpacing: '-0.01em' }}>{title}</h3>
    </div>
  );

  return (
    <div style={{ paddingBottom: '4rem' }}>
      
      {saved && (
        <div style={{ padding: '1rem 1.5rem', backgroundColor: '#dcfce3', border: '1px solid #86efac', color: '#166534', borderRadius: '8px', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(22, 101, 52, 0.1)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          Profile settings securely updated!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* Company Profile Section */}
        <div style={sectionContainerStyle} className="profile-card">
          <SectionHeader title="Company Identity">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16V8.00002C20.9996 7.6493 20.9071 7.30683 20.7315 7.00639C20.556 6.70595 20.3033 6.45785 20 6.28002L13 2.28002C12.696 2.10427 12.352 2.01172 12 2.01172C11.648 2.01172 11.304 2.10427 11 2.28002L4 6.28002C3.69667 6.45785 3.44398 6.70595 3.26846 7.00639C3.09294 7.30683 3.00036 7.6493 3 8.00002V16C3.00036 16.3507 3.09294 16.6932 3.26846 16.9936C3.44398 17.2941 3.69667 17.5422 4 17.72L11 21.72C11.304 21.8958 11.648 21.9883 12 21.9883C12.352 21.9883 12.696 21.8958 13 21.72L20 17.72C20.3033 17.5422 20.556 17.2941 20.7315 16.9936C20.9071 16.6932 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12L20.5 7" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12L3.5 7" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </SectionHeader>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={inputStyle}>Company Name {reqAsterisk}</label>
              <input type="text" name="companyName" className="form-input" value={formData.companyName} onChange={handleChange} required placeholder="Enter company name" />
            </div>
            <div>
              <label style={inputStyle}>Short Name {reqAsterisk}</label>
              <input type="text" name="shortName" className="form-input" value={formData.shortName} onChange={handleChange} required placeholder="Enter short name" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={inputStyle}>About Company {reqAsterisk}</label>
              <textarea name="aboutCompany" className="form-input" rows="2" value={formData.aboutCompany} onChange={handleChange} required placeholder="Brief description of the organization"></textarea>
            </div>
          </div>
        </div>

        {/* Reg. Office Address Section */}
        <div style={sectionContainerStyle} className="profile-card">
          <SectionHeader title="Registered Office">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 10C20 15.5228 12 22 12 22C12 22 4 15.5228 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="10" r="3" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </SectionHeader>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={inputStyle}>Address Line 1 {reqAsterisk}</label>
              <input type="text" name="addressLine1" className="form-input" value={formData.addressLine1} onChange={handleChange} required placeholder="Street address, P.O. box, company building" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={inputStyle}>Address Line 2</label>
              <input type="text" name="addressLine2" className="form-input" value={formData.addressLine2} onChange={handleChange} placeholder="Apartment, suite, unit, floor, etc." />
            </div>
            <div>
              <label style={inputStyle}>City {reqAsterisk}</label>
              <input type="text" name="city" className="form-input" value={formData.city} onChange={handleChange} required placeholder="Enter city" />
            </div>
            <div>
              <label style={inputStyle}>State {reqAsterisk}</label>
              <select name="state" className="form-input" value={formData.state} onChange={handleChange} required>
                <option value="">Select State</option>
                {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>
            <div>
              <label style={inputStyle}>Pincode</label>
              <input type="text" name="pincode" className="form-input" value={formData.pincode} onChange={handleChange} placeholder="6-digit PIN" />
            </div>
            <div>
              <label style={inputStyle}>Country</label>
              <input type="text" name="country" className="form-input" value={formData.country} onChange={handleChange} placeholder="e.g. INDIA" />
            </div>
          </div>
        </div>

        {/* Contact & Compliance Section */}
        <div style={sectionContainerStyle} className="profile-card">
          <SectionHeader title="Contact & Compliance">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22S4 18 4 11V5L12 2L20 5V11C20 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12L11 14L15 10" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </SectionHeader>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={inputStyle}>Mobile No.</label>
              <input type="text" name="mobile" className="form-input" value={formData.mobile} onChange={handleChange} placeholder="10-digit mobile number" />
            </div>
            <div>
              <label style={inputStyle}>Landline No.</label>
              <input type="text" name="landline" className="form-input" value={formData.landline} onChange={handleChange} placeholder="With STD code" />
            </div>
            <div>
              <label style={inputStyle}>Email-ID</label>
              <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="company@example.com" />
            </div>
            <div>
              <label style={inputStyle}>CIN NO.</label>
              <input type="text" name="cinNo" className="form-input" value={formData.cinNo} onChange={handleChange} placeholder="Corporate Identity Number" />
            </div>
            <div>
              <label style={inputStyle}>PAN No.</label>
              <input type="text" name="panNo" className="form-input" value={formData.panNo} onChange={handleChange} placeholder="10-character PAN" maxLength={10} style={{textTransform: 'uppercase'}} />
            </div>
            <div>
              <label style={inputStyle}>TAN No.</label>
              <input type="text" name="tanNo" className="form-input" value={formData.tanNo} onChange={handleChange} placeholder="Tax Deduction Account Number" maxLength={10} style={{textTransform: 'uppercase'}} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={inputStyle}>GST No.</label>
              <input type="text" name="gstNo" className="form-input" value={formData.gstNo} onChange={handleChange} placeholder="15-character GSTIN" maxLength={15} style={{textTransform: 'uppercase'}} />
            </div>
            <div>
              <label style={inputStyle}>Company Category {reqAsterisk}</label>
              <select name="companyCategory" className="form-input" value={formData.companyCategory} onChange={handleChange} required>
                <option value="">Select Category</option>
                <option value="Limited By Shares">Limited By Shares</option>
                <option value="Limited By Guarantee">Limited By Guarantee</option>
                <option value="Unlimited Company">Unlimited Company</option>
              </select>
            </div>
            <div>
              <label style={inputStyle}>Company Class {reqAsterisk}</label>
              <select name="companyClass" className="form-input" value={formData.companyClass} onChange={handleChange} required>
                <option value="">Select Class</option>
                <option value="Public Limited Company">Public Limited Company</option>
                <option value="Association Of Persons">Association Of Persons</option>
              </select>
            </div>
            <div>
              <label style={inputStyle}>Incorporation Date</label>
              <input type="date" name="incorporationDate" className="form-input" value={formData.incorporationDate} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={inputStyle}>Ratio of Net Owned Funds</label>
                <input type="text" name="ratioOwnedFunds" className="form-input" value={formData.ratioOwnedFunds} onChange={handleChange} placeholder="e.g. 1.5" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={inputStyle}>Ratio to Deposits</label>
                <input type="text" name="ratioDeposits" className="form-input" value={formData.ratioDeposits} onChange={handleChange} placeholder="e.g. 10.0" />
              </div>
            </div>
            <div>
              <label style={inputStyle}>% Unencumbered Term Deposits</label>
              <input type="text" name="percentageUnencumbered" className="form-input" value={formData.percentageUnencumbered} onChange={handleChange} placeholder="e.g. 15%" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="neftAlertSms" name="neftAlertSms" checked={formData.neftAlertSms} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                <label htmlFor="neftAlertSms" style={{fontWeight: '600', color: '#334155', margin: 0, cursor: 'pointer'}}>NEFT SMS Alert</label>
              </div>
              <input type="text" name="neftAlertMobile" className="form-input" value={formData.neftAlertMobile} onChange={handleChange} placeholder="Alert mobile no." style={{ flex: 1, padding: '0.5rem 0.75rem' }} />
            </div>
          </div>
        </div>

        {/* Banking Details Section */}
        <div style={sectionContainerStyle} className="profile-card">
          <SectionHeader title="Corporate Banking">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 10H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="16" cy="14" r="1.5" fill="#60a5fa" stroke="#60a5fa"/>
            </svg>
          </SectionHeader>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={inputStyle}>Select Company Bank {reqAsterisk}</label>
              <select name="bankSelection" className="form-input" value={formData.bankSelection} onChange={handleChange} required>
                <option value="">Select Primary Bank</option>
                <option value="add_new">Add New Bank</option>
                <option value="icici">ICICI BANK</option>
                <option value="sbi">STATE BANK OF INDIA</option>
                <option value="paytm">PAYTM BANK</option>
                <option value="rbi">RBI BANK</option>
              </select>
            </div>
            <div>
              <label style={inputStyle}>Bank Name {reqAsterisk}</label>
              <input type="text" name="bankName" className="form-input" value={formData.bankName} onChange={handleChange} required placeholder="Enter precise bank name" />
            </div>
            <div>
              <label style={inputStyle}>Bank IFSC Code {reqAsterisk}</label>
              <input type="text" name="bankIfsc" className="form-input" value={formData.bankIfsc} onChange={handleChange} required placeholder="11-character IFSC" style={{textTransform: 'uppercase'}} />
            </div>
            <div>
              <label style={inputStyle}>Account Number {reqAsterisk}</label>
              <input type="text" name="accountNo" className="form-input" value={formData.accountNo} onChange={handleChange} required placeholder="Full account number" />
            </div>
            <div>
              <label style={inputStyle}>Account Name {reqAsterisk}</label>
              <input type="text" name="accountName" className="form-input" value={formData.accountName} onChange={handleChange} required placeholder="Name as registered with bank" />
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div style={{ position: 'sticky', bottom: '1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', padding: '1.25rem 2rem', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.15), 0 8px 10px -6px rgba(37, 99, 235, 0.1)', border: '1px solid rgba(37, 99, 235, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.05rem' }}>Save Changes</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Update your organization's core settings securely.</span>
          </div>
          <button type="submit" style={{ backgroundColor: '#2563eb', backgroundImage: 'linear-gradient(to right, #2563eb, #1d4ed8)', color: 'white', border: 'none', padding: '0.875rem 3rem', borderRadius: '8px', fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            UPDATE PROFILE
          </button>
        </div>

      </form>
    </div>
  );
}

export default Profile;
