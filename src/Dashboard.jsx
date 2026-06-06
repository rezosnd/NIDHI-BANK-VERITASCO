import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import CustomerOnboarding from './CustomerOnboarding';
import BranchManagement from './BranchManagement';
import BranchDashboard from './BranchDashboard';
import Profile from './Profile';
import ViewPromoter from './ViewPromoter';
import CreateFinancialYear from './CreateFinancialYear';
import ViewUpdateFinancialYear from './ViewUpdateFinancialYear';
import LockSetting from './LockSetting';
import EodBod from './EodBod';
import ViewLoginDetails from './ViewLoginDetails';
import CompanySettings from './CompanySettings';
import ManageServiceTax from './ManageServiceTax';
import UpdateBankDetails from './UpdateBankDetails';
import ManageStates from './ManageStates';
import ManageDistricts from './ManageDistricts';
import ManageNews from './ManageNews';
import NewsTicker from './NewsTicker';

const TOP_NAV = [
  { name: 'BANKING MASTER', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>, subItems: ['Relationship', 'Share Parameter', 'Fee Parameter', 'SB Accounts Parameters', 'SB / OD Account Type', 'Plan Parameters', 'Add Prematurity Slabs', 'Approvals Limit Parameters', 'Service Deduction', 'Deposit TDS Parameter', 'Add Service Charge', 'OD Account Parameters', 'Late Fee Parameter', 'Holiday List', 'Create Financial Year', 'View/Update Financial Year', 'Lock Setting'] },
  { name: 'HR MODULE', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, subItems: ['Designation Master', 'Manage Designation', 'Designation Menu Rights', 'Designation Tree View', 'Branch User Rights', 'Service Center User Rights', 'Training Menu', 'Create Employee', 'View/Manage Employee', 'Salary Master', 'Employee Attendance Daily', 'Create Monthly Attendance', 'Create Salary', 'Make Payment Salary', 'View Monthly Attendance', 'View Paid Salary', 'Salary Summary Report', 'View Staff User'] },
  { name: 'LOAN', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> },
  { name: 'GOLD LOAN', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8l4 8H8l4-8z"></path></svg> },
  { name: 'MANAGE AGENT', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> },
  { name: 'ACCOUNTING', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg> },
  { name: 'CARDS', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg> },
  { name: 'PAYMENT GETWAY', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>, subItems: ['Request For NEFT', 'Payment Getway Setup', 'NEFT/RTGS/IMPS Setup', 'Payment Getway Charges', 'Update Virtual Account', 'Websoftex Payment SetUp', 'Transaction History', 'Websoftex Transaction Charges'] },
  { name: 'REPORTS', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
  { name: 'MODIFICATION', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>, subItems: ['Policy Modification', 'Change Nominee', 'Change SB Account Type', 'Senior Citizen ROI Change', 'Update Member Date', 'Deposit Member Change', 'Delete Account Transaction', 'Delete Accounts', 'Block/Un-Block Account', 'Deleted Loans Report', 'Deleted EMI Report', 'Deleted Accounts Report', 'Deleted Account Transaction', 'Report', 'Update Share Date', 'Update Member Profile'] }
];

const BRANCH_TOP_NAV = [
  { name: 'TRANSACTION', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>, subItems: ['Cash Deposit', 'Cash Withdrawal', 'Approval Transactions', 'Rejected Transactions', 'Apply Now', 'Cheque Reconciliation', 'Request For Credit', 'Transfer', 'View Request For NEFT', 'Request For NEFT', 'Renewals', 'Loan Disbursement Payment', 'Loan Disbursement Interest Type', 'Loan Dis. Int. And Pro.Fee Type', 'Service Charge Deduct', 'Print Transaction', 'MIS Interest Pay', 'Loan Emi Payment', 'Add Staff E-Wallet', 'Bulk Deposit', 'Deposit EMI Receivable Today', 'Loan EMI Receivable Today', 'Online Request', 'Approve Vouchers', 'Complaint / Help Request', 'Feedback / Appreciation Report', 'Maturity Alert'] },
  { name: 'TRANSACTION REPORTS', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>, subItems: ['Cheque Reconciliation Report', 'Transactions Report', 'Renewal From App'] },
  { name: 'SERVICE CENTER', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>, subItems: ['Add Credit Service Center', 'View Credit Request', 'Credit History'] },
  { name: 'CUSTOMER ENROLLMENT', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg> },
  { name: 'BANKING', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg> },
  { name: 'LOAN', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> },
  { name: 'PRINT', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> },
  { name: 'ACCOUNTING', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg> },
  { name: 'REPORT', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg> },
  { name: 'PIGMY', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>, subItems: ['Upload Pigmy File', 'Download Pigmy File', 'View Paid Record'] },
  { name: 'TOOLS', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>, subItems: ['Broadcast', 'ADD Standing Instruction', 'Communication', 'Notes', 'Manage Calendar', 'Manage Events'] },
  { name: 'STAFF ENROLLMENT', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> }
];

const DASHBOARD_PANELS = [
  {
    title: 'COMPANY',
    color: '#000c3b',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    items: [
      'Profile', 'Add Promoter', 'View Promoter', 'Create Financial Year', 
      'View/Update Financial Year', 'Lock Setting', 'EOD/BOD', 'View Login Details', 
      'Unencumbered Deposit', 'Get SMS BALANCE', 'Update Content', 'System Setting',
      'Software Config', 'SMS Setting Process'
    ]
  },
  {
    title: 'MANAGE MASTER',
    color: '#ff0000',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>,
    items: [
      'Manage Service Tax', 'Update Bank Details', 'Create State', 'View/Update State', 
      'Create District', 'View/Update District', 'Create News', 'View/Update News', 
      'Add IP Address', 'View/Update IPAddress', 'Create Gallery Category', 'Create Gallery',
      'Manage Popup Screen', 'View Recruitment'
    ]
  },
  {
    title: 'MANAGE BRANCH',
    color: 'green',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    items: [
      'Create Branch', 'View/Update Branch', 'IP Wise Enable/Disable', 
      'Create Service Center', 'View Service Center', 'Add Service Center User', 
      'View Service Center User'
    ]
  },
  {
    title: 'REQUEST',
    color: '#0000ff',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    items: [
      'Add Balance Request', 'Online Request', 'Complaint / Help Request', 
      'Feedback / Appreciation Report', 'Assign Request To Branch', 
      'Share Transfer Request', 'Debit Request Service Center', 
      'View Share Application/Request', 'Member Request Enquiry', 
      'Pending Upload Document For Approval', 'Verify Member Kyc'
    ]
  },
  {
    title: 'TOOLS',
    color: '#4b0082',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>,
    items: [
      'Communication', 'Notes', 'Manage Calendar', 'Manage Events', 'Manage Holidays'
    ]
  }
];

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = location.pathname === '/dashboard' || location.pathname === '/' 
    ? 'Dashboard' 
    : (location.state?.viewName || decodeURIComponent(location.pathname.split('/').pop().replace(/-/g, ' ')));

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [isModuleLoading, setIsModuleLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [globalSettings, setGlobalSettings] = useState(null);

  const handleNavigate = (viewName) => {
    setIsSidebarOpen(false);
    setIsModuleLoading(true);
    
    setTimeout(() => {
      if (viewName === 'Dashboard') {
        navigate('/dashboard');
      } else {
        const slug = viewName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        navigate(`/module/${slug}`, { state: { viewName } });
      }
      setIsModuleLoading(false);
    }, 600);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Fetch global settings on load
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Object.keys(data).length > 0) setGlobalSettings(data);
        }
      } catch (e) {
        console.error('Failed to load global settings', e);
      }
    };
    fetchSettings();
    
    return () => clearInterval(timer);
  }, []);

  const isBranchUser = user?.role?.includes('Branch');

  const filteredNav = TOP_NAV.filter(item => {
    if (isBranchUser) {
      return !['HR MODULE', 'BANKING MASTER', 'MODIFICATION'].includes(item.name);
    }
    return true;
  });

  const filteredPanels = DASHBOARD_PANELS.filter(panel => {
    if (isBranchUser) {
      return !['COMPANY', 'MANAGE MASTER', 'MANAGE BRANCH'].includes(panel.title);
    }
    return true;
  });

  return (
    <>
      {isModuleLoading && (
        <div className="loader-overlay">
          <div className="dotted-loader">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      )}
      <div className="app-container" style={{ flexDirection: 'column' }}>
        
      <header className="main-header" style={{ justifyContent: 'space-between', borderBottom: 'none', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg 
              className="mobile-menu-btn hide-on-desktop" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ cursor: 'pointer' }}
            >
              <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <img src={globalSettings?.logo || "/veritasco.png"} alt="Bank Logo" style={{ height: '36px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', marginLeft: '0.5rem' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827', letterSpacing: '0.5px', lineHeight: '1.2' }}>{globalSettings?.companyfullname || 'VeritasCo Nidhi Bank Limited'}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isBranchUser ? '#0891b2' : 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {isBranchUser ? `BRANCH PORTAL • ${user?.branchName || ''}` : 'Admin Panel'}
              </span>
            </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="hide-on-mobile" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '0.5px' }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          
          <div style={{ position: 'relative' }} ref={profileMenuRef}>
          <div 
            className="header-profile-btn" 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid transparent', transition: 'background-color 0.2s', backgroundColor: isProfileMenuOpen ? '#f1f5f9' : 'transparent' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#334155' }}>
              {isBranchUser ? (user?.branchName || 'Branch') : (user?.username || 'admin')}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ transform: isProfileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          {isProfileMenuOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>{isBranchUser ? (user?.branchName || 'Branch') : (user?.username || 'admin')} ({user?.role || 'Admin'})</span>
              </div>
              <div className="dropdown-body">
                <div className="dropdown-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <span>Change Password</span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={onLogout}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  <span>Logout</span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                  <span>Support</span>
                </div>
                <div className="dropdown-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  <span>Help</span>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </header>
      
      <NewsTicker receiverType={isBranchUser ? 'Branch' : 'ALL'} />

      <nav className={`top-navbar ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <div 
          className={`nav-item ${activeView === 'Dashboard' ? 'active' : ''}`}
          onClick={() => handleNavigate('Dashboard')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span>Dashboard</span>
        </div>
        {isBranchUser ? BRANCH_TOP_NAV.map(item => (
          <div 
            key={item.name} 
            className={`nav-item ${activeView === item.name || (item.subItems && item.subItems.includes(activeView)) ? 'active' : ''}`}
            onClick={(e) => {
              if (!item.subItems) {
                handleNavigate(item.name);
              } else {
                // Toggle mobile dropdown via focus/active state
                e.currentTarget.classList.toggle('mobile-dropdown-open');
              }
            }}
          >
            {item.icon}
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{item.name}</span>
            {item.subItems && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
            )}
            
            {item.subItems && (
              <div className="nav-dropdown">
                {item.subItems.map(sub => (
                  <div 
                    key={sub} 
                    className="nav-dropdown-item"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleNavigate(sub); 
                    }}
                  >
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>
        )) : filteredNav.map(item => (
          <div 
            key={item.name} 
            className={`nav-item ${activeView === item.name || (item.subItems && item.subItems.includes(activeView)) ? 'active' : ''}`}
            onClick={(e) => {
              if (!item.subItems) {
                handleNavigate(item.name);
              } else {
                // Toggle mobile dropdown via focus/active state
                e.currentTarget.classList.toggle('mobile-dropdown-open');
              }
            }}
          >
            {item.icon}
            <span>{item.name}</span>
            {item.subItems && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
            )}
            
            {item.subItems && (
              <div className="nav-dropdown">
                {item.subItems.map(sub => (
                  <div 
                    key={sub} 
                    className="nav-dropdown-item"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleNavigate(sub); 
                    }}
                  >
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <main className="main-content-area" style={{ flex: 1, overflowY: 'auto', padding: isBranchUser && activeView === 'Dashboard' ? '0' : '1.5rem', display: 'flex', flexDirection: 'column' }}>
          {activeView === 'Dashboard' ? (
            isBranchUser ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <BranchDashboard user={user} onNavigate={handleNavigate} />
              </div>
            ) : (
            <div className="dashboard-grid-container">
            <div className="panels-grid">
              {filteredPanels.map(panel => {
                return (
                  <div key={panel.title} className="dashboard-panel">
                    <div className="panel-header" style={{ cursor: 'default' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {panel.icon}
                        <span>{panel.title}</span>
                      </div>
                      <div className="panel-options" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" onClick={(e) => { e.stopPropagation(); /* 3 dot options logic */ }}><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                      </div>
                    </div>
                    <div className="panel-body">
                      {panel.items.map(item => (
                        <div key={item} className="panel-item" onClick={() => handleNavigate(item)}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )) : (
            <div className="module-view" style={{ flex: '1 0 auto' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                  <h2 style={{margin: 0, color: '#111827'}}>{activeView}</h2>
                  <button onClick={() => handleNavigate('Dashboard')} className="back-button">Back</button>
               </div>
               
               {activeView === 'Profile' ? <Profile /> : 
                (activeView === 'Customer Onboarding' || activeView === 'Add Promoter') ? <CustomerOnboarding view={activeView} /> : 
                (activeView === 'Branch Management' || activeView === 'Create Branch' || activeView === 'View/Update Branch') && !isBranchUser ? <BranchManagement view={activeView} /> :
                activeView === 'View Promoter' ? <ViewPromoter /> :
                activeView === 'Create Financial Year' ? <CreateFinancialYear /> :
                activeView === 'View/Update Financial Year' ? <ViewUpdateFinancialYear /> :
                activeView === 'Lock Setting' ? <LockSetting /> :
                activeView === 'EOD/BOD' ? <EodBod /> :
                activeView === 'View Login Details' ? <ViewLoginDetails /> :
                (activeView === 'Update Content' || activeView === 'System Setting' || activeView === 'Software Config') ? <CompanySettings /> :
                activeView === 'Manage Service Tax' ? <ManageServiceTax /> :
                activeView === 'Update Bank Details' ? <UpdateBankDetails /> :
                (activeView === 'Create State' || activeView === 'View/Update State') ? <ManageStates view={activeView} /> :
                (activeView === 'Create District' || activeView === 'View/Update District') ? <ManageDistricts view={activeView} /> :
                (activeView === 'Create News' || activeView === 'View/Update News') ? <ManageNews view={activeView} user={user} /> :
                <div className="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" color="#94a3b8" style={{marginBottom: '1rem'}}>
                    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <h3>{activeView} Module</h3>
                  <p>This module is currently being configured.</p>
                </div>}
            </div>
          )}
          
          <div className="dashboard-footer" style={{ padding: '1rem', textAlign: 'center', marginTop: 'auto', paddingTop: '2rem', flexShrink: 0, color: '#64748b', fontSize: '0.85rem' }}>
            {globalSettings?.copyrighttxt || 'Copyright © 2026 VeritasCo Nidhi Systems. All Rights Reserved.'}
          </div>
      </main>
    </div>
    </>
  );
}

export default Dashboard;
