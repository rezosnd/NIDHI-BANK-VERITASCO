import React, { useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  // Basic Info
  companyshortname: 'VeritasCo',
  companyfullname: 'VeritasCo Nidhi Bank Limited',
  distname: '',
  StateName: '',
  office_timings: '9:30 AM to 5:30 PM',
  Working_City_ForSeo: '',
  Services_Area_ForSeo: 'Secured Deposits, Secured Loans',
  board_of_directors: '',
  our_channel_partners: '',
  Our_Branches: '',
  Recruitment_Career: '',
  vision_Mission: 'Yes',

  // Contact Details
  headermobileno: '',
  headeremailid: 'info@veritasco.in',
  callusphone1: '',
  callusphone2: '',
  callusphone3: '',
  contactemail1: '',
  enquirymail: 'support@veritasco.in',
  contactemail2: '',
  contactAddressheadoffice: 'VeritasCo Head Office',
  contactAddresscurrentline1: '',
  contactAddresscurrentline2: '',
  contactAddresscurrentline3: '',
  contactAddresscurrentline4: '',
  contactAddressregisteredoffice: 'VeritasCo Registered Office',
  contactAddressregisteredofficeline1: '',
  contactAddressregisteredofficeline2: '',
  contactAddressregisteredofficeline3: '',
  contactAddressregisteredofficeline4: '',
  googlemapadress: '',

  // Social & Links
  websiteurl: 'https://veritasco.in/',
  logo: '/veritasco.png',
  facebookurl: '',
  twiterurl: '',
  gplusurl: '',
  instagramurl: '',
  linkedinurl: '',
  skypeurl: '',
  youtubeurl: '',
  pinteresturl: '',
  Collection_Mobile_App_Url: '',
  Customer_Mobile_App_Url: '',

  // Legal & Security
  copyrighttxt: 'Copyright © 2026 VeritasCo Nidhi Bank. All Rights Reserved.',
  privacy_policy: 'VeritasCo Privacy Policy...',
  terms_conditions: 'No',
  legal_Doc: 'Hide',
  Security_Tips: 'Never share your OTP or password with anyone calling from the bank.',

  // SEO (Main)
  Index_Title: 'VeritasCo Nidhi Bank - Secure Deposits & Loans',
  Index_Description: 'VeritasCo offers highly secure fixed deposits, recurring deposits, and property loans with attractive interest rates.',
  Index_Keywords: 'VeritasCo, Nidhi Bank, Fixed Deposit, Loan, Banking',

  // Advanced SEO
  About_Title: '', About_Description: '', About_Keywords: '',
  Saving_Title: '', Saving_Description: '', Saving_Keywords: '',
  Fixed_Title: '', Fixed_Description: '', Fixed_Keywords: '',
  Recurring_Title: '', Recurring_Description: '', Recurring_Keywords: '',
  Pigmy_Title: '', Pigmy_Description: '', Pigmy_Keywords: '',
  Mis_Title: '', Mis_Description: '', Mis_Keywords: '',
  General_Title: '', General_Description: '', General_Keywords: '',
  Property_Title: '', Property_Description: '', Property_Keywords: '',
  Vehicle_Title: '', Vehicle_Description: '', Vehicle_Keywords: '',
  Secured_Title: '', Secured_Description: '', Secured_Keywords: '',
  Education_Title: '', Education_Description: '', Education_Keywords: '',
  Business_Title: '', Business_Description: '', Business_Keywords: '',
  Mortgage_Title: '', Mortgage_Description: '', Mortgage_Keywords: '',
  "Loan-Against-Deposit_Title": '', "Loan-Against-Deposit_Description": '', "Loan-Against-Deposit_Keywords": '',
  Gold_Title: '', Gold_Description: '', Gold_Keywords: '',
  Contact_Us_Title: '', Contact_Us_Description: '', Contact_Us_Keywords: '',

  // Theme Settings
  topbordercolor: '#024eb9',
  navbgcolor: '#1a73e8',
  navcolor: 'WHITE',
  navhovercolor: 'white',
  navhoverbgcolor: '#024eb9',
  subnavbgcolor: '#024eb9',
  subnavcolor: 'white',
  bannercolor1: '#45d9f9',
  bannercolor2: '#45f993',
  footerbgcolor: '#024eb9',
  footerbtmbgcolor: '#45d9f9',
  News_BG_Color: '#1a73e8',
  news_text_color: '#FFFFFF',
  Home_Box_BG_Color1: '#1E3C94',
  Home_Box_BG_Color2: '#D32384',
  index_view_bgcolor: '#1a73e8',
  header_phone_color: '#1a73e8',

  // Feature Flags
  Show_Customer_Login: 'Yes',
  Show_Branch_Login: 'Yes',
  Show_Staff_Login: 'Yes',
  Website_Display: 'No',
  Deposit_Menu: 'Yes',
  saving_deposit_scheme: 'yes',
  fixed_deposit_scheme: 'yes',
  pigmy_deposit_scheme: 'yes',
  recurring_deposit_scheme: 'yes',
  daily_deposit_scheme: 'yes',
  monthly_interest_scheme: 'yes',
  Loan_Menu: 'Yes',
  general_loan: 'Yes',
  property_loan: 'Yes',
  vehicle_loan: 'Yes',
  secured_loan: 'Yes',
  education_loan: 'Yes',
  business_loan: 'Yes',
  mortgage_loan: 'Yes',
  loan_against_deposit: 'Yes',
  gold_silver_diamond: 'Yes',
  secured: 'Hide',
  Calculator_Menu: 'hide',
  FD_Calculator: 'hide',
  RD_Calculator: 'hide',
  Pigmy_Calculator: 'hide',
  MIS_Calculator: 'hide',
  Loan_Calculator: 'hide',

  // Advanced Theme & Print Layouts
  subnavhovercolor: 'white',
  subnavhoverbgcolor: '#1a73e8',
  header_height: '100px',
  sub_header_color1: 'WHITE',
  sub_header_color2: 'ORANGE',
  box_style: 'style10',
  heading_color: '#45d9f9',
  home_box_txt_color: 'WHITE',
  sharereceipt_table_width: '672px',
  sharereceipt_table_height: '120px',
  sharereceipt_table_font_size: '14px',
  sharereceipt_table_table_size: '25px',
  print_receipts_table_width: '250px',
  print_receipts_table_font_size: '20px',
  print_receipts_table_table_size: '25px',
  print_receipts_table_height: '500px',
  shareprint_table_width: '675x',
  shareprint_table_height: '220px',
  shareprint_table_font_size: '110px',
  shareprint_table_table_size: '200px',
  shareprint_table_font_family: 'Calibri',
  shareprint_description_1: '',
  shareprint_description_2: '',
  print_rdbond1_table_width: '850px',
  print_rdbond1_table_height: '135px',
  print_rdbond1_signature_1: 'branch manager',
  print_rdbond1_signature_2: 'customer sign',
  print_rdbond1_fontsize: '20px',
  print_rdbond1_fontfamily: 'Times New Roman',
  print_rdbond1_table_size: '20px',
  footer_bg_style_1_to_16: 'pattern_style_16',
  box_style_style_1_to_12: 'style5',
  login_page_bg_style_1_to_50: 'pattern_style_11',
  login_page_bg_color: '#1a73e8',
  Our_Schemes_hvrbox: '#1a73e8',
  Our_Loans_icons_color: '#1a73e8',
  Our_Loans_text_color: '#45d9f9',
  login_images: 'Login-image-8',

  // Banners
  banner_1: 'Yes', banner_1_headline: '', banner_1_text: '',
  banner_2: 'Yes', banner_2_headline: '', banner_2_text: '',
  banner_3: 'Yes', banner_3_headline: '', banner_3_text: '',
  banner_4: 'Yes', banner_4_headline: '', banner_4_text: '',
  banner_5: 'Yes', banner_5_headline: '', banner_5_text: '',
  banner_6: 'Yes', banner_6_headline: '', banner_6_text: '',
};

export default function CompanySettings() {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Initial State derived from DEFAULT_SETTINGS
  const [formData, setFormData] = useState(DEFAULT_SETTINGS);


  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      
      // Merge fetched settings over initial defaults
      if (Object.keys(data).length > 0) {
        setFormData(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setErrorMessage('Could not load global settings from the server. Using local defaults.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    setErrorMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to update settings');
      
      setSaveMessage('Company settings updated successfully in the secure database.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setErrorMessage('An error occurred while saving the settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Are you sure you want to restore all settings to their original VeritasCo defaults? Any unsaved changes will be lost.')) {
      setFormData(DEFAULT_SETTINGS);
      setSaveMessage('Defaults restored! Click "Save Configuration" to apply permanently.');
      setTimeout(() => setSaveMessage(''), 4000);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path> },
    { id: 'contact', label: 'Contact & Location', icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path> },
    { id: 'social', label: 'Social & Links', icon: <circle cx="12" cy="12" r="10"></circle> },
    { id: 'seo', label: 'SEO & Legal', icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path> },
    { id: 'advseo', label: 'Advanced SEO', icon: <path d="M4 11a9 9 0 0 1 9 9"></path> },
    { id: 'flags', label: 'Feature Flags', icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path> },
    { id: 'theme', label: 'Theme & UI', icon: <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path> },
    { id: 'layout', label: 'Layout & Printers', icon: <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path> },
  ];

  const renderField = ({ label, name, type = 'text', helpText }) => (
    <div key={name} style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '4px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
          value={formData[name] || ''}
          onChange={(e) => handleChange(name, e.target.value)}
        />
      ) : type === 'select' ? (
        <select
          style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '4px', fontSize: '0.9rem', outline: 'none', backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' }}
          value={formData[name] || ''}
          onChange={(e) => handleChange(name, e.target.value)}
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="yes">yes (lowercase)</option>
          <option value="hide">hide</option>
          <option value="Hide">Hide (Capitalized)</option>
        </select>
      ) : type === 'color' ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="color"
            style={{ width: '40px', height: '36px', padding: '0', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '4px', cursor: 'pointer' }}
            value={formData[name] || '#ffffff'}
            onChange={(e) => handleChange(name, e.target.value)}
          />
          <input
            type="text"
            style={{ flex: 1, padding: '8px 12px', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '4px', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }}
            value={formData[name] || ''}
            onChange={(e) => handleChange(name, e.target.value)}
          />
        </div>
      ) : (
        <input
          type={type}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '4px', fontSize: '0.9rem', outline: 'none' }}
          value={formData[name] || ''}
          onChange={(e) => handleChange(name, e.target.value)}
        />
      )}
      {helpText && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{helpText}</div>}
    </div>
  );

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.4)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Global Admin Settings</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Manage company profile, application features, and SEO metadata.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleRestoreDefaults}
            disabled={isSaving}
            style={{ padding: '8px 16px', backgroundColor: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', color: '#475569', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '6px', fontSize: '0.95rem', fontWeight: '600', cursor: isSaving ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            Restore Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{ padding: '8px 24px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: '600', cursor: isSaving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isSaving ? 'Saving...' : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Save Configuration</>
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <div className="dotted-loader" style={{ justifyContent: 'center', marginBottom: '16px' }}>
             <div className="dot" style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)' }}></div>
             <div className="dot" style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)' }}></div>
             <div className="dot" style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)' }}></div>
          </div>
          <p>Loading secure global settings...</p>
        </div>
      ) : (
        <>
          {errorMessage && (
            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '4px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '600', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {errorMessage}
            </div>
          )}

          {saveMessage && (
            <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: '4px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '600', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              {saveMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Sidebar Navigation */}
        <div style={{ width: '250px', backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#f1f5f9' : 'transparent',
                color: activeTab === tab.id ? '#0052cc' : '#475569',
                borderLeft: activeTab === tab.id ? '3px solid #0052cc' : '3px solid transparent',
                borderBottom: '1px solid #f1f5f9',
                fontSize: '0.9rem',
                fontWeight: activeTab === tab.id ? '600' : '500',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {tab.icon}
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          
          {activeTab === 'basic' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#0f172a', marginTop: 0, marginBottom: '20px' }}>Basic Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                {renderField({ label: "Company Short Name", name: "companyshortname" })}
                {renderField({ label: "Company Full Name", name: "companyfullname" })}
                {renderField({ label: "District Name", name: "distname" })}
                {renderField({ label: "State Name", name: "StateName" })}
                {renderField({ label: "Office Timings", name: "office_timings" })}
                {renderField({ label: "Working City (For SEO)", name: "Working_City_ForSeo" })}
                <div style={{ gridColumn: '1 / -1' }}>{renderField({ label: "Services Area (For SEO)", name: "Services_Area_ForSeo" })}</div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#0f172a', marginTop: 0, marginBottom: '20px' }}>Contact & Location</h2>
              
              <h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid rgba(255, 255, 255, 0.4)', paddingBottom: '8px', marginBottom: '16px' }}>Phone & Email</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                {renderField({ label: "Header Mobile No", name: "headermobileno" })}
                {renderField({ label: "Header Email ID", name: "headeremailid" })}
                {renderField({ label: "Call Us Phone 1", name: "callusphone1" })}
                {renderField({ label: "Call Us Phone 2", name: "callusphone2" })}
                {renderField({ label: "Call Us Phone 3", name: "callusphone3" })}
                {renderField({ label: "Contact Email 1", name: "contactemail1" })}
                {renderField({ label: "Contact Email 2", name: "contactemail2" })}
                {renderField({ label: "Enquiry Mail", name: "enquirymail" })}
              </div>

              <h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid rgba(255, 255, 255, 0.4)', paddingBottom: '8px', marginBottom: '16px', marginTop: '24px' }}>Head Office Address</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                {renderField({ label: "Title / Head Office", name: "contactAddressheadoffice" })}
                {renderField({ label: "Address Line 1", name: "contactAddresscurrentline1" })}
                {renderField({ label: "Address Line 2", name: "contactAddresscurrentline2" })}
                {renderField({ label: "Address Line 3", name: "contactAddresscurrentline3" })}
                {renderField({ label: "Address Line 4 (Pin/State)", name: "contactAddresscurrentline4" })}
              </div>

              <h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid rgba(255, 255, 255, 0.4)', paddingBottom: '8px', marginBottom: '16px', marginTop: '24px' }}>Registered Office Address</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                {renderField({ label: "Title / Reg Office", name: "contactAddressregisteredoffice" })}
                {renderField({ label: "Address Line 1", name: "contactAddressregisteredofficeline1" })}
                {renderField({ label: "Address Line 2", name: "contactAddressregisteredofficeline2" })}
                {renderField({ label: "Address Line 3", name: "contactAddressregisteredofficeline3" })}
                {renderField({ label: "Address Line 4 (Pin/State)", name: "contactAddressregisteredofficeline4" })}
              </div>
              
              {renderField({ label: "Google Map Embed Code / URL", name: "googlemapadress", type: "textarea" })}
            </div>
          )}

          {activeTab === 'social' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#0f172a', marginTop: 0, marginBottom: '20px' }}>Social Media & Links</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                {renderField({ label: "Website URL", name: "websiteurl" })}
                {renderField({ label: "Company Logo URL", name: "logo" })}
                {renderField({ label: "Facebook URL", name: "facebookurl" })}
                {renderField({ label: "Twitter URL", name: "twiterurl" })}
                {renderField({ label: "Instagram URL", name: "instagramurl" })}
                {renderField({ label: "LinkedIn URL", name: "linkedinurl" })}
                {renderField({ label: "YouTube URL", name: "youtubeurl" })}
                {renderField({ label: "Skype URL", name: "skypeurl" })}
                {renderField({ label: "Pinterest URL", name: "pinteresturl" })}
                {renderField({ label: "Google+ URL (Legacy)", name: "gplusurl" })}
              </div>

              <h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid rgba(255, 255, 255, 0.4)', paddingBottom: '8px', marginBottom: '16px', marginTop: '16px' }}>Mobile Application Links</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                {renderField({ label: "Collection App APK Path", name: "Collection_Mobile_App_Url" })}
                {renderField({ label: "Customer App APK Path", name: "Customer_Mobile_App_Url" })}
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#0f172a', marginTop: 0, marginBottom: '20px' }}>SEO, Metadata & Legal</h2>
              
              <h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid rgba(255, 255, 255, 0.4)', paddingBottom: '8px', marginBottom: '16px' }}>Legal Pages</h3>
              {renderField({ label: "Copyright Text", name: "copyrighttxt" })}
              {renderField({ label: "Security Tips (Dashboard)", name: "Security_Tips", type: "textarea" })}
              {renderField({ label: "Privacy Policy", name: "privacy_policy", type: "textarea" })}
              
              <h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid rgba(255, 255, 255, 0.4)', paddingBottom: '8px', marginBottom: '16px', marginTop: '24px' }}>SEO - Index / Homepage</h3>
              {renderField({ label: "Index Title", name: "Index_Title" })}
              {renderField({ label: "Index Description", name: "Index_Description", type: "textarea" })}
              {renderField({ label: "Index Keywords", name: "Index_Keywords", type: "textarea" })}
            </div>
          )}

          {activeTab === 'advseo' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '1.2rem', color: '#0f172a', marginTop: 0, marginBottom: '20px' }}>Advanced SEO Settings</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>Manage individual page metadata to improve search engine rankings for specific products.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px' }}>
                {['About', 'Saving', 'Fixed', 'Recurring', 'Pigmy', 'Mis', 'General', 'Property', 'Vehicle', 'Secured', 'Education', 'Business', 'Mortgage', 'Loan-Against-Deposit', 'Gold', 'Contact_Us'].map(prefix => (
                  <React.Fragment key={prefix}>
                    <div style={{ gridColumn: '1 / -1' }}><h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid rgba(255, 255, 255, 0.4)', paddingBottom: '8px', marginBottom: '8px', marginTop: '16px' }}>{prefix.replace(/-/g, ' ')} Page</h3></div>
                    {renderField({ label: `${prefix.replace(/-/g, ' ')} Title`, name: `${prefix}_Title` })}
                    {renderField({ label: `${prefix.replace(/-/g, ' ')} Description`, name: `${prefix}_Description`, type: 'textarea' })}
                    {renderField({ label: `${prefix.replace(/-/g, ' ')} Keywords`, name: `${prefix}_Keywords`, type: 'textarea' })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'flags' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#0f172a', marginTop: 0, marginBottom: '20px' }}>Feature & Module Flags</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>Toggle "Yes/No" or "Hide" to enable or disable specific portal features.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0 24px' }}>
                {renderField({ label: "Show Customer Login", name: "Show_Customer_Login", type: "select" })}
                {renderField({ label: "Show Branch Login", name: "Show_Branch_Login", type: "select" })}
                {renderField({ label: "Show Staff Login", name: "Show_Staff_Login", type: "select" })}
                
                {renderField({ label: "Website Display", name: "Website_Display", type: "select" })}
                {renderField({ label: "Deposit Menu", name: "Deposit_Menu", type: "select" })}
                {renderField({ label: "Loan Menu", name: "Loan_Menu", type: "select" })}
                
                {renderField({ label: "Saving Deposit Scheme", name: "saving_deposit_scheme", type: "select" })}
                {renderField({ label: "Fixed Deposit Scheme", name: "fixed_deposit_scheme", type: "select" })}
                {renderField({ label: "Pigmy Deposit Scheme", name: "pigmy_deposit_scheme", type: "select" })}
                
                {renderField({ label: "General Loan", name: "general_loan", type: "select" })}
                {renderField({ label: "Property Loan", name: "property_loan", type: "select" })}
                {renderField({ label: "Vehicle Loan", name: "vehicle_loan", type: "select" })}
                
                {renderField({ label: "Secured Loan", name: "secured_loan", type: "select" })}
                {renderField({ label: "Education Loan", name: "education_loan", type: "select" })}
                {renderField({ label: "Business Loan", name: "business_loan", type: "select" })}
                
                {renderField({ label: "Mortgage Loan", name: "mortgage_loan", type: "select" })}
                {renderField({ label: "Loan Against Deposit", name: "loan_against_deposit", type: "select" })}
                {renderField({ label: "Gold/Silver/Diamond", name: "gold_silver_diamond", type: "select" })}
                
                {renderField({ label: "Secured Flag", name: "secured", type: "select" })}
                
                {renderField({ label: "Calculator Menu", name: "Calculator_Menu", type: "select" })}
                {renderField({ label: "FD Calculator", name: "FD_Calculator", type: "select" })}
                {renderField({ label: "RD Calculator", name: "RD_Calculator", type: "select" })}
                {renderField({ label: "Pigmy Calculator", name: "Pigmy_Calculator", type: "select" })}
                {renderField({ label: "MIS Calculator", name: "MIS_Calculator", type: "select" })}
                {renderField({ label: "Loan Calculator", name: "Loan_Calculator", type: "select" })}
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#0f172a', marginTop: 0, marginBottom: '20px' }}>Theme & UI Colors</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>Configure the colors for your frontend website and admin panel.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                {renderField({ label: "Navigation Background Color", name: "navbgcolor", type: "color" })}
                {renderField({ label: "Navigation Text Color", name: "navcolor", type: "text", helpText: "Supports hex (#FFF) or text (WHITE)" })}
                {renderField({ label: "Nav Hover Background", name: "navhoverbgcolor", type: "color" })}
                {renderField({ label: "Nav Hover Text", name: "navhovercolor", type: "text" })}
                
                {renderField({ label: "Sub-Nav Background", name: "subnavbgcolor", type: "color" })}
                {renderField({ label: "Sub-Nav Text", name: "subnavcolor", type: "text" })}
                {renderField({ label: "Sub-Nav Hover Background", name: "subnavhoverbgcolor", type: "color" })}
                {renderField({ label: "Sub-Nav Hover Text", name: "subnavhovercolor", type: "text" })}
                
                {renderField({ label: "Top Border Color", name: "topbordercolor", type: "color" })}
                {renderField({ label: "Header Phone Color", name: "header_phone_color", type: "color" })}
                {renderField({ label: "Header Height", name: "header_height", type: "text" })}
                
                {renderField({ label: "Sub Header Color 1", name: "sub_header_color1", type: "text" })}
                {renderField({ label: "Sub Header Color 2", name: "sub_header_color2", type: "text" })}
                {renderField({ label: "Box Style", name: "box_style", type: "text" })}
                {renderField({ label: "Heading Color", name: "heading_color", type: "color" })}
                {renderField({ label: "Home Box Text Color", name: "home_box_txt_color", type: "text" })}
                
                {renderField({ label: "Footer Background", name: "footerbgcolor", type: "color" })}
                {renderField({ label: "Footer Bottom Background", name: "footerbtmbgcolor", type: "color" })}
                
                {renderField({ label: "Banner Color 1", name: "bannercolor1", type: "color" })}
                {renderField({ label: "Banner Color 2", name: "bannercolor2", type: "color" })}
                
                {renderField({ label: "News Background", name: "News_BG_Color", type: "color" })}
                {renderField({ label: "News Text Color", name: "news_text_color", type: "color" })}
                
                {renderField({ label: "Home Box BG 1", name: "Home_Box_BG_Color1", type: "color" })}
                {renderField({ label: "Home Box BG 2", name: "Home_Box_BG_Color2", type: "color" })}
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '1.2rem', color: '#0f172a', marginTop: 0, marginBottom: '20px' }}>Advanced Layouts & Printers</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>Configure receipt printing dimensions, specific banner texts, and precise legacy layouts.</p>
              
              <h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid rgba(255, 255, 255, 0.4)', paddingBottom: '8px', marginBottom: '16px' }}>Print Dimensions & Layout</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                {renderField({ label: "Share Receipt Table Width", name: "sharereceipt_table_width" })}
                {renderField({ label: "Share Receipt Table Height", name: "sharereceipt_table_height" })}
                {renderField({ label: "Share Receipt Font Size", name: "sharereceipt_table_font_size" })}
                {renderField({ label: "Share Receipt Table Size", name: "sharereceipt_table_table_size" })}
                
                {renderField({ label: "Print Receipts Table Width", name: "print_receipts_table_width" })}
                {renderField({ label: "Print Receipts Table Height", name: "print_receipts_table_height" })}
                {renderField({ label: "Print Receipts Font Size", name: "print_receipts_table_font_size" })}
                {renderField({ label: "Print Receipts Table Size", name: "print_receipts_table_table_size" })}
                
                {renderField({ label: "Share Print Table Width", name: "shareprint_table_width" })}
                {renderField({ label: "Share Print Table Height", name: "shareprint_table_height" })}
                {renderField({ label: "Share Print Font Size", name: "shareprint_table_font_size" })}
                {renderField({ label: "Share Print Table Size", name: "shareprint_table_table_size" })}
                {renderField({ label: "Share Print Font Family", name: "shareprint_table_font_family" })}
                
                <div style={{ gridColumn: '1 / -1' }}>{renderField({ label: "Share Print Desc 1", name: "shareprint_description_1", type: "textarea" })}</div>
                <div style={{ gridColumn: '1 / -1' }}>{renderField({ label: "Share Print Desc 2", name: "shareprint_description_2", type: "textarea" })}</div>
                
                {renderField({ label: "RD Bond Print Width", name: "print_rdbond1_table_width" })}
                {renderField({ label: "RD Bond Print Height", name: "print_rdbond1_table_height" })}
                {renderField({ label: "RD Bond Font Size", name: "print_rdbond1_fontsize" })}
                {renderField({ label: "RD Bond Font Family", name: "print_rdbond1_fontfamily" })}
                {renderField({ label: "RD Bond Table Size", name: "print_rdbond1_table_size" })}
                {renderField({ label: "RD Bond Signature 1", name: "print_rdbond1_signature_1" })}
                {renderField({ label: "RD Bond Signature 2", name: "print_rdbond1_signature_2" })}
                
                {renderField({ label: "Footer BG Style (1-16)", name: "footer_bg_style_1_to_16" })}
                {renderField({ label: "Box Style (1-12)", name: "box_style_style_1_to_12" })}
                {renderField({ label: "Login Page Style (1-50)", name: "login_page_bg_style_1_to_50" })}
                {renderField({ label: "Login Page BG Color", name: "login_page_bg_color", type: "color" })}
                {renderField({ label: "Our Schemes Hover", name: "Our_Schemes_hvrbox", type: "color" })}
                {renderField({ label: "Our Loans Icons Color", name: "Our_Loans_icons_color", type: "color" })}
                {renderField({ label: "Our Loans Text Color", name: "Our_Loans_text_color", type: "color" })}
                {renderField({ label: "Login Images", name: "login_images" })}
              </div>

              <h3 style={{ fontSize: '1rem', color: '#334155', borderBottom: '1px solid rgba(255, 255, 255, 0.4)', paddingBottom: '8px', marginBottom: '16px', marginTop: '24px' }}>Dynamic Homepage Banners</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px' }}>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <div key={num} style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.6)' }}>
                    {renderField({ label: `Show Banner ${num}`, name: `banner_${num}`, type: 'select' })}
                    {renderField({ label: `Banner ${num} Headline`, name: `banner_${num}_headline` })}
                    {renderField({ label: `Banner ${num} Text`, name: `banner_${num}_text`, type: 'textarea' })}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
          </div>
        </>
      )}
    </div>
  );
}
