import { useState } from 'react';

const SectionHeader = ({ title }) => (
  <div style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '6px 16px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', borderRadius: '4px', boxShadow: '0 1px 2px rgba(37,99,235,0.2)' }}>
    {title}
  </div>
);

const inputStyle = {
  width: '100%', padding: '4px 8px', fontSize: '12px', height: '26px', 
  border: '1px solid #cbd5e1', borderRadius: '3px', color: '#1e293b', 
  backgroundColor: '#fff', outline: 'none', transition: 'border-color 0.15s ease'
};

const RowField = ({ label, req, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
    <div style={{ width: '150px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label} {req && <span style={{color: '#ef4444'}}>*</span>}
    </div>
    <div style={{ padding: '0 8px', color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>:</div>
    <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
      {children}
    </div>
  </div>
);

const KycCheck = ({ label, name, checked, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
    <input type="checkbox" name={name} checked={checked || false} onChange={onChange} style={{ cursor: 'pointer', accentColor: '#2563eb', width: '14px', height: '14px', marginRight: '8px' }} />
    <div style={{ flex: 1, textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
  </div>
);

function CustomerOnboarding({ view }) {
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate compulsory fields
    const requiredFields = ['firstName', 'lastName', 'dob', 'gender', 'mobile', 'panNo', 'state', 'age', 'permAdd1', 'permAdd2', 'permAdd3'];
    const missing = requiredFields.filter(f => !formData[f] || formData[f].trim() === '');
    if (missing.length > 0) {
      alert('Please fill in all compulsory details before saving.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = view === 'Add Promoter' ? '/api/promoters' : '/api/customers';
      const token = localStorage.getItem('authToken');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // We pack everything into 'details' for backend compatibility with the dynamic JSON schema
        body: JSON.stringify({
          firstName: formData.firstName || 'N/A',
          lastName: formData.lastName || 'N/A',
          details: formData
        })
      });
      const data = await response.json();
      if (data.success) {
        setSubmitted({ cifNumber: data.cifNumber, id: data.id });
        window.scrollTo(0, 0);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({});
        }, 8000);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      {loading && (
        <div className="loader-overlay">
          <div className="dotted-loader">
            <div className="dot"></div><div className="dot"></div>
            <div className="dot"></div><div className="dot"></div>
            <div className="dot"></div><div className="dot"></div>
            <div className="dot"></div><div className="dot"></div>
          </div>
        </div>
      )}
      <div style={{ padding: '0 0 4rem 0', maxWidth: '100%' }}>
      
      {/* Top Action Bar / Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Member Enrollment</h2>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>Secure Customer Verification & Onboarding</div>
        </div>
        <button onClick={handleSubmit} disabled={loading} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '6px 20px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {loading ? 'Processing...' : 'Save Member'}
        </button>
      </div>

      {submitted && (
        <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '6px', fontSize: '13px', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Congratulations ! Promoter Enrolled Successfully Completed, Your Member No is : {100000 + (submitted.id || 0)} Your Apllication Number is : {submitted.id || 0}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        {/* Personal Details Section */}
        <SectionHeader title="Personal Details" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '32px', marginBottom: '16px' }}>
          {/* Left Column */}
          <div>
            <RowField label="First Name" req><input type="text" name="firstName" value={formData.firstName || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Last Name" req><input type="text" name="lastName" value={formData.lastName || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Date Of Birth" req><input type="date" name="dob" value={formData.dob || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Guardian Member No"><input type="text" name="guardianMemNo" value={formData.guardianMemNo || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Gender" req>
              <select name="gender" value={formData.gender || ''} style={inputStyle} onChange={handleChange}>
                <option value="">Select Gender</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
            </RowField>
            <RowField label="Mobile" req><input type="text" name="mobile" value={formData.mobile || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Occupation"><input type="text" name="occupation" value={formData.occupation || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Monthly Income"><input type="text" name="monthlyIncome" value={formData.monthlyIncome || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Pan No" req>
              <input type="text" name="panNo" value={formData.panNo || ''} style={inputStyle} onChange={handleChange} />
            </RowField>
            <RowField label="Passport No"><input type="text" name="passport" value={formData.passport || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="City"><input type="text" name="city" value={formData.city || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Taluk"><input type="text" name="taluk" value={formData.taluk || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="State" req>
              <select name="state" value={formData.state || ''} style={inputStyle} onChange={handleChange}>
                <option value="">Select State</option><option>Maharashtra</option><option>Delhi</option>
              </select>
            </RowField>
          </div>

          {/* Right Column */}
          <div>
            <RowField label="Age" req>
              <input type="text" name="age" value={formData.age || ''} style={{...inputStyle, width: '40px'}} onChange={handleChange} />
              <select name="ageType" value={formData.ageType || ''} style={{...inputStyle, flex: 1}} onChange={handleChange}><option>General</option><option>Minor</option></select>
            </RowField>
            <RowField label="Guardian Name"><input type="text" name="guardianName" value={formData.guardianName || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Religion">
              <select name="religion" value={formData.religion || ''} style={inputStyle} onChange={handleChange}>
                <option value="">Select Religion</option><option>Hinduism</option><option>Islam</option><option>Christianity</option>
              </select>
            </RowField>
            <RowField label="Email ID"><input type="text" name="email" value={formData.email || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Occupational Add"><input type="text" name="occAdd" value={formData.occAdd || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Voter ID"><input type="text" name="voterId" value={formData.voterId || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Aadhar Card No">
              <input type="text" name="aadhar" value={formData.aadhar || ''} style={inputStyle} onChange={handleChange} />
            </RowField>
            <RowField label="Village"><input type="text" name="village" value={formData.village || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="District"><input type="text" name="district" value={formData.district || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Pin"><input type="text" name="pin" value={formData.pin || ''} style={inputStyle} onChange={handleChange} /></RowField>
          </div>
        </div>

        {/* Address Fields (Full Width Spanning) */}
        <div style={{ marginBottom: '24px' }}>
          <RowField label="Permanent Address1" req><input type="text" name="permAdd1" value={formData.permAdd1 || ''} style={inputStyle} onChange={handleChange} /></RowField>
          <RowField label="Permanent Address2" req><input type="text" name="permAdd2" value={formData.permAdd2 || ''} style={inputStyle} onChange={handleChange} /></RowField>
          <RowField label="Permanent Address3" req><input type="text" name="permAdd3" value={formData.permAdd3 || ''} style={inputStyle} onChange={handleChange} /></RowField>
          
          <div style={{ paddingLeft: '175px', marginBottom: '8px' }}>
            <label style={{ fontSize: '10px', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: '#2563eb' }} />
              (SAME AS PERMANENT ADDRESS)
            </label>
          </div>

          <RowField label="Current Address1"><input type="text" name="currAdd1" value={formData.currAdd1 || ''} style={inputStyle} onChange={handleChange} /></RowField>
          <RowField label="Current Address2"><input type="text" name="currAdd2" value={formData.currAdd2 || ''} style={inputStyle} onChange={handleChange} /></RowField>
          <RowField label="Current Address3"><input type="text" name="currAdd3" value={formData.currAdd3 || ''} style={inputStyle} onChange={handleChange} /></RowField>
        </div>

        {/* Nominee Details Section */}
        <SectionHeader title="Nominee Details" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '32px', marginBottom: '24px' }}>
          <div>
            <RowField label="Title">
              <select name="nomTitle" value={formData.nomTitle || ''} style={inputStyle} onChange={handleChange}><option>Select Title</option><option>MR</option><option>MRS</option></select>
            </RowField>
            <RowField label="Name"><input type="text" name="nomName" value={formData.nomName || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Age"><input type="text" name="nomAge" value={formData.nomAge || ''} style={{...inputStyle, width: '40px'}} onChange={handleChange} /></RowField>
            <RowField label="Address"><input type="text" name="nomAdd" value={formData.nomAdd || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="State">
              <select name="nomState" value={formData.nomState || ''} style={inputStyle} onChange={handleChange}><option>Select State</option><option>Maharashtra</option></select>
            </RowField>
          </div>
          <div>
            <RowField label="Date Of Birth"><input type="date" name="nomDob" value={formData.nomDob || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Relation Ship">
              <select name="nomRel" value={formData.nomRel || ''} style={inputStyle} onChange={handleChange}><option>Select Relationship</option><option>Brother</option><option>Wife</option></select>
            </RowField>
            <RowField label="City"><input type="text" name="nomCity" value={formData.nomCity || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Pin"><input type="text" name="nomPin" value={formData.nomPin || ''} style={inputStyle} onChange={handleChange} /></RowField>
          </div>
        </div>

        {/* Introducer Details Section */}
        <SectionHeader title="Introducer Details" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '32px', marginBottom: '24px' }}>
          <div>
            <RowField label="Agent No"><input type="text" name="introAgent" value={formData.introAgent || ''} style={inputStyle} onChange={handleChange} /></RowField>
            <RowField label="Intro Period (Months)"><input type="text" name="introPeriod" value={formData.introPeriod || ''} style={inputStyle} onChange={handleChange} /></RowField>
          </div>
          <div>
            <RowField label="Name"><input type="text" name="introName" value={formData.introName || ''} style={inputStyle} onChange={handleChange} /></RowField>
          </div>
        </div>

        {/* KYC Details Section */}
        <SectionHeader title="KYC Details" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '32px', marginBottom: '16px' }}>
          
          <div style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>PROOF OF IDENTITY</div>
            <KycCheck label="PASSPORT" name="kycPassport" checked={formData.kycPassport} onChange={handleChange} />
            <KycCheck label="VOTER ID CARD" name="kycVoterId" checked={formData.kycVoterId} onChange={handleChange} />
            <KycCheck label="PAN CARD" name="kycPan" checked={formData.kycPan} onChange={handleChange} />
            <KycCheck label="GOVT / DEFENCE ID CARD" name="kycGovt" checked={formData.kycGovt} onChange={handleChange} />
            <KycCheck label="ID CARD OF REPUTED EMPLOYER" name="kycEmployer" checked={formData.kycEmployer} onChange={handleChange} />
            <KycCheck label="DRIVING LICENSE" name="kycDriving" checked={formData.kycDriving} onChange={handleChange} />
            <KycCheck label="PENSION PAYMENT ORDER" name="kycPension" checked={formData.kycPension} onChange={handleChange} />
            <KycCheck label="PHOTO ID CARD ISSUED BY POST OFFICE" name="kycPostOffice" checked={formData.kycPostOffice} onChange={handleChange} />
            <KycCheck label="PHOTO ID CARD ISSUED BY UNIVERSITY" name="kycUni" checked={formData.kycUni} onChange={handleChange} />
            <KycCheck label="PHOTO ID CARD ISSUED BY PUBLIC AUTHORITY" name="kycPublic" checked={formData.kycPublic} onChange={handleChange} />
            <KycCheck label="AADHAAR LETTER / CARD" name="kycAadhaar" checked={formData.kycAadhaar} onChange={handleChange} />
            <KycCheck label="NREGA CARD" name="kycNrega" checked={formData.kycNrega} onChange={handleChange} />
          </div>

          <div style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>PROOF OF ADDRESS/CORRESPONDENCE ADDRESS</div>
            <KycCheck label="CREDIT CARD STATEMENT (NOT MORE THAN 3 MONTHS OLD)" name="kycCredit" checked={formData.kycCredit} onChange={handleChange} />
            <KycCheck label="INCOME / WEALTH TAX ASSESSMENT ORDER" name="kycIncomeTax" checked={formData.kycIncomeTax} onChange={handleChange} />
            <KycCheck label="ELECTRICITY BILL (NOT MORE THAN 6 MONTHS OLD)" name="kycElec" checked={formData.kycElec} onChange={handleChange} />
            <KycCheck label="TELEPHONE BILL (NOT MORE THAN 6 MONTHS OLD)" name="kycPhone" checked={formData.kycPhone} onChange={handleChange} />
            <KycCheck label="BANK ACCOUNT STATEMENT" name="kycBankStmt" checked={formData.kycBankStmt} onChange={handleChange} />
            <KycCheck label="LETTER FROM REPUTED EMPLOYER" name="kycEmpLetter" checked={formData.kycEmpLetter} onChange={handleChange} />
            <KycCheck label="LETTER FROM PUBLIC AUTHORITY" name="kycPubLetter" checked={formData.kycPubLetter} onChange={handleChange} />
            <KycCheck label="RATION CARD" name="kycRation" checked={formData.kycRation} onChange={handleChange} />
            <KycCheck label="VOTER ID CARD (ONLY IF IT CONTAINS CURRENT ADDRESS)" name="kycVoterAdd" checked={formData.kycVoterAdd} onChange={handleChange} />
            <KycCheck label="PENSION PAYMENT ORDER" name="kycPensionAdd" checked={formData.kycPensionAdd} onChange={handleChange} />
            <KycCheck label="REGISTERED LEASE / SALE AGREEMENT" name="kycLease" checked={formData.kycLease} onChange={handleChange} />
            <KycCheck label="PROOF OF RESIDENCE ISSUED BY UNIVERSITY" name="kycUniAdd" checked={formData.kycUniAdd} onChange={handleChange} />
            <KycCheck label="GAS BILL" name="kycGas" checked={formData.kycGas} onChange={handleChange} />
            <KycCheck label="ADDRESS PROOF OF CLOSE RELATIVES" name="kycRel" checked={formData.kycRel} onChange={handleChange} />
          </div>
        </div>

      </form>
    </div>
    </>
  );
}

export default CustomerOnboarding;
