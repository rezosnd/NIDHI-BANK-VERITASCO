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
import ManageIPAddress from './ManageIPAddress';
import IPWiseEnable from './IPWiseEnable';
import CreateServiceCenter from './CreateServiceCenter';
import ViewServiceCenter from './ViewServiceCenter';
import AddServiceCenterUser from './AddServiceCenterUser';
import ViewServiceCenterUser from './ViewServiceCenterUser';
import AddBalanceRequest from './AddBalanceRequest';
import OnlineRequest from './OnlineRequest';
import CustomerComplaints from './CustomerComplaints';
import CustomerFeedback from './CustomerFeedback';
import AssignOnlineRequest from './AssignOnlineRequest';
import ApproveTransactions from './ApproveTransactions';
import ShareTransferRequest from './ShareTransferRequest';
import DebitRequestServiceCenter from './DebitRequestServiceCenter';
import VerifyMemberKYC from './VerifyMemberKYC';
import PendingUploadDocument from './PendingUploadDocument';
import MemberRequestEnquiry from './MemberRequestEnquiry';
import ViewShareApplication from './ViewShareApplication';
import ManageCalendar from './ManageCalendar';
import ManageEvents from './ManageEvents';
import ManageHolidays from './ManageHolidays';
import ManageRelationship from './ManageRelationship';
import ShareParameters from './ShareParameters';
import FeeParameter from './FeeParameter';
import SbAccountsParameters from './SbAccountsParameters';
import SbAccountType from './SbAccountType';
import PlanParameters from './PlanParameters';
import PlanPrematuritySlabs from './PlanPrematuritySlabs';
import ApprovalLimitParameters from './ApprovalLimitParameters';
import ServiceDeduction from './ServiceDeduction';
import DepositTDSParameter from './DepositTDSParameter';
import AddServiceCharge from './AddServiceCharge';
import OdAccountParameters from './OdAccountParameters';
import LateFeesSettings from './LateFeesSettings';
import HolidayList from './HolidayList';
import AddUpdateParameter from './AddUpdateParameter';
import DesignationMaster from './DesignationMaster';
import DesignationMenuRights from './DesignationMenuRights';
import BranchUserRights from './BranchUserRights';
import ServiceCenterUserRights from './ServiceCenterUserRights';
import CreateEmployee from './CreateEmployee';
import { DotLottiePlayer } from '@lottiefiles/dotlottie-react';
import './FandomLogin.css';

const TOP_NAV = [
  { name: 'BANKING MASTER', color: '#1d4ed8', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>, subItems: ['Relationship', 'Share Parameter', 'Fee Parameter', 'SB Accounts Parameters', 'SB / OD Account Type', 'Plan Parameters', 'Add Prematurity Slabs', 'Approvals Limit Parameters', 'Service Deduction', 'Deposit TDS Parameter', 'Add Service Charge', 'OD Account Parameters', 'Late Fee Parameter', 'Holiday List', 'Create Financial Year', 'View/Update Financial Year', 'Lock Setting'] },
  { name: 'HR MODULE', color: '#047857', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, subItems: ['Designation Master', 'Manage Designation', 'Designation Menu Rights', 'Designation Tree View', 'Branch User Rights', 'Service Center User Rights', 'Training Menu', 'Create Employee', 'View/Manage Employee', 'Salary Master', 'Employee Attendance Daily', 'Create Monthly Attendance', 'Create Salary', 'Make Payment Salary', 'View Monthly Attendance', 'View Paid Salary', 'Salary Summary Report', 'View Staff User'] },
  { name: 'LOAN', color: '#b45309', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> },
  { name: 'GOLD LOAN', color: '#a16207', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8l4 8H8l4-8z"></path></svg> },
  { name: 'MANAGE AGENT', color: '#6d28d9', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> },
  { name: 'ACCOUNTING', color: '#be185d', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg> },
  { name: 'CARDS', color: '#0e7490', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg> },
  { name: 'PAYMENT GETWAY', color: '#c2410c', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>, subItems: ['Request For NEFT', 'Payment Getway Setup', 'NEFT/RTGS/IMPS Setup', 'Payment Getway Charges', 'Update Virtual Account', 'Websoftex Payment SetUp', 'Transaction History', 'Websoftex Transaction Charges'] },
  { name: 'REPORTS', color: '#4338ca', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>, subItems: ['Customer Complaint / Help Report'] },
  { name: 'MODIFICATION', color: '#b91c1c', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>, subItems: ['Policy Modification', 'Change Nominee', 'Change SB Account Type', 'Senior Citizen ROI Change', 'Update Member Date', 'Deposit Member Change', 'Delete Account Transaction', 'Delete Accounts', 'Block/Un-Block Account', 'Deleted Loans Report', 'Deleted EMI Report', 'Deleted Accounts Report', 'Deleted Account Transaction', 'Report', 'Update Share Date', 'Update Member Profile'] }
];

const BRANCH_TOP_NAV = [
  { name: 'TRANSACTION', color: '#1d4ed8', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>, subItems: ['Cash Deposit', 'Cash Withdrawal', 'Approval Transactions', 'Rejected Transactions', 'Apply Now', 'Cheque Reconciliation', 'Request For Credit', 'Transfer', 'View Request For NEFT', 'Request For NEFT', 'Renewals', 'Loan Disbursement Payment', 'Loan Disbursement Interest Type', 'Loan Dis. Int. And Pro.Fee Type', 'Service Charge Deduct', 'Print Transaction', 'MIS Interest Pay', 'Loan Emi Payment', 'Add Staff E-Wallet', 'Bulk Deposit', 'Deposit EMI Receivable Today', 'Loan EMI Receivable Today', 'Online Request', 'Approve Vouchers', 'Complaint / Help Request', 'Feedback / Appreciation Report', 'Maturity Alert'] },
  { name: 'TRANSACTION REPORTS', color: '#4338ca', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>, subItems: ['Cheque Reconciliation Report', 'Transactions Report', 'Renewal From App'] },
  { name: 'SERVICE CENTER', color: '#047857', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>, subItems: ['Add Credit Service Center', 'View Credit Request', 'Credit History'] },
  { name: 'CUSTOMER ENROLLMENT', color: '#b45309', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg> },
  { name: 'BANKING', color: '#6d28d9', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg> },
  { name: 'LOAN', color: '#be185d', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> },
  { name: 'PRINT', color: '#0e7490', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> },
  { name: 'ACCOUNTING', color: '#c2410c', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg> },
  { name: 'REPORT', color: '#b91c1c', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>, subItems: ['Customer Complaint / Help Report'] },
  { name: 'PIGMY', color: '#4d7c0f', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>, subItems: ['Upload Pigmy File', 'Download Pigmy File', 'View Paid Record'] },
  { name: 'TOOLS', color: '#6d28d9', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>, subItems: ['Broadcast', 'ADD Standing Instruction', 'Communication', 'Notes', 'Manage Calendar', 'Manage Events', 'Manage Holidays'] },
  { name: 'STAFF ENROLLMENT', color: '#047857', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> }
];

const DASHBOARD_PANELS = [
  {
    title: 'COMPANY',
    color: '#1d4ed8', // Darker Blue
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
    color: '#b91c1c', // Darker Red
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
    color: '#047857', // Darker Emerald
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    items: [
      'Create Branch', 'View/Update Branch', 'IP Wise Enable/Disable', 
      'Create Service Center', 'View Service Center', 'Add Service Center User', 
      'View Service Center User'
    ]
  },
  {
    title: 'REQUEST',
    color: '#6d28d9', // Darker Violet
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
    color: '#b45309', // Darker Amber
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>,
    items: [
      'Communication', 'Notes', 'Manage Calendar', 'Manage Events', 'Manage Holidays'
    ]
  }
];

const SERVICE_CENTER_TOP_NAV = [
  { name: 'TRANSACTION', color: '#1d4ed8', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>, subItems: ['Cash Deposit', 'Cash Withdrawal', 'Approval Transactions', 'Rejected Transactions', 'Apply Now', 'Request For Credit', 'Transfer', 'Request For NEFT', 'Renewals', 'Loan Disbursement Payment', 'Loan Emi Payment', 'Online Request'] },
  { name: 'TRANSACTION REPORTS', color: '#4338ca', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>, subItems: ['Transactions Report'] },
  { name: 'CUSTOMER ENROLLMENT', color: '#047857', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg> },
  { name: 'BANKING', color: '#b45309', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg> },
  { name: 'REPORT', color: '#b91c1c', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg> },
  { name: 'TOOLS', color: '#6d28d9', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>, subItems: ['Broadcast', 'Communication', 'Notes', 'Manage Calendar', 'Manage Events'] }
];

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = location.pathname === '/dashboard' || location.pathname === '/' 
    ? 'Dashboard' 
    : (location.state?.viewName || decodeURIComponent(location.pathname.split('/').pop().replace(/-/g, ' ')));

  const [isModuleLoading, setIsModuleLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsModuleLoading(true);
    const timer = setTimeout(() => {
      setIsModuleLoading(false);
    }, 1200); // 1.2 second loading animation
    return () => clearTimeout(timer);
  }, [activeView]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [openDropdownMenu, setOpenDropdownMenu] = useState(null);
  const profileMenuRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdownMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [globalSettings, setGlobalSettings] = useState(null);

  const handleNavigate = (viewName) => {
    setIsSidebarOpen(false);
    
    if (viewName === 'Dashboard') {
      navigate('/dashboard');
    } else {
      const slug = viewName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      navigate(`/module/${slug}`, { state: { viewName } });
    }
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

  const isAdmin = user?.role === 'Admin';
  const isServiceCenterUser = user?.role?.includes('Service Center') || user?.service_center_id != null;
  const isBranchUser = !isAdmin && !isServiceCenterUser;

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

  const getTopNav = () => {
    if (isServiceCenterUser) return SERVICE_CENTER_TOP_NAV;
    if (isBranchUser) return BRANCH_TOP_NAV;
    return filteredNav;
  };

  const getPanels = () => {
    if (isBranchUser) return filteredPanels;
    return DASHBOARD_PANELS;
  };

  return (
    <>
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120vh', height: '120vh', zIndex: -1, pointerEvents: 'none', opacity: 0.25, overflow: 'hidden' }}>
        <div className="css-fandom-globe" style={{ width: '100%', height: '100%', animationDuration: '120s' }}></div>
      </div>
      
      <div className="app-container" style={{ flexDirection: 'column', position: 'relative', zIndex: 1, backgroundColor: 'transparent' }}>
        
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
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isAdmin ? 'var(--primary)' : '#0891b2', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {isAdmin ? 'Admin Panel' : isServiceCenterUser ? `SERVICE CENTER PORTAL` : `BRANCH PORTAL • ${user?.branchName || ''}`}
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
              {isAdmin ? (user?.username || 'admin') : (user?.username || 'User')}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ transform: isProfileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          {isProfileMenuOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>{user?.username || 'User'} ({user?.role || 'User'})</span>
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

      <nav className={`top-navbar ${isSidebarOpen ? 'mobile-open' : ''}`} ref={navRef}>
        <div 
          className={`nav-item ${activeView === 'Dashboard' ? 'active' : ''}`}
          onClick={() => handleNavigate('Dashboard')}
          style={{
            ...(activeView === 'Dashboard' && { backgroundColor: '#e0e7ff', color: '#4338ca', boxShadow: '0 4px 10px rgba(67, 56, 202, 0.15)' })
          }}
          onMouseEnter={(e) => {
            if (activeView !== 'Dashboard') {
              e.currentTarget.style.backgroundColor = '#e0e7ff';
              e.currentTarget.style.color = '#4338ca';
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== 'Dashboard') {
              e.currentTarget.style.backgroundColor = '';
              e.currentTarget.style.color = '';
            }
          }}
        >
          <div style={{ color: activeView === 'Dashboard' ? '#4338ca' : '#4f46e5', display: 'flex', alignItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <span>Dashboard</span>
        </div>
        {getTopNav().map(item => {
          const isActive = activeView === item.name || (item.subItems && item.subItems.includes(activeView));
          return (
            <div 
              key={item.name} 
              className={`nav-item ${isActive ? 'active' : ''} ${openDropdownMenu === item.name ? 'click-dropdown-open' : ''}`}
              onClick={(e) => {
                if (!item.subItems) {
                  handleNavigate(item.name);
                  setOpenDropdownMenu(null);
                } else {
                  setOpenDropdownMenu(openDropdownMenu === item.name ? null : item.name);
                  e.currentTarget.classList.toggle('mobile-dropdown-open');
                }
              }}
              style={{
                ...(isActive && { backgroundColor: `${item.color}15`, color: item.color, boxShadow: `0 4px 10px ${item.color}30` })
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = `${item.color}15`;
                  e.currentTarget.style.color = item.color;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = '';
                }
              }}
            >
              <div style={{ color: item.color, display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </div>
              <span style={isBranchUser ? { fontSize: '0.75rem', fontWeight: 'bold' } : {}}>{item.name}</span>
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
                        setOpenDropdownMenu(null);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${item.color}15`;
                        e.currentTarget.style.color = item.color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color = '';
                      }}
                    >
                      {sub}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <main className="main-content-area" style={{ flex: 1, overflowY: 'auto', padding: (isBranchUser || isServiceCenterUser) && activeView === 'Dashboard' ? '0' : '1.5rem', display: 'flex', flexDirection: 'column', backgroundColor: 'transparent' }}>
          {activeView === 'Dashboard' ? (
            (isBranchUser || isServiceCenterUser) ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'transparent' }}>
                <BranchDashboard user={user} onNavigate={handleNavigate} />
              </div>
            ) : (
            <div className="dashboard-grid-container" style={{ backgroundColor: 'transparent' }}>
            <div className="panels-grid">
              {getPanels().map(panel => {
                return (
                  <div key={panel.title} className="dashboard-panel" style={{ borderTopColor: panel.color }}>
                    <div className="panel-header" style={{ cursor: 'default', background: `linear-gradient(to right, ${panel.color}15, transparent)` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ color: panel.color, display: 'flex', alignItems: 'center' }}>
                          {panel.icon}
                        </div>
                        <span style={{ color: '#0f172a' }}>{panel.title}</span>
                      </div>
                      <div className="panel-options" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" onClick={(e) => { e.stopPropagation(); /* 3 dot options logic */ }}><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                      </div>
                    </div>
                    <div className="panel-body">
                      {panel.items.map(item => (
                        <div 
                          key={item} 
                          className="panel-item" 
                          onClick={() => handleNavigate(item)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${panel.color}15`;
                            e.currentTarget.style.color = panel.color;
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '';
                            e.currentTarget.style.color = '';
                            e.currentTarget.style.transform = '';
                          }}
                        >
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
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.4)', paddingBottom: '1rem' }}>
                  <h2 style={{margin: 0, color: '#111827'}}>{activeView}</h2>
                  <button onClick={() => handleNavigate('Dashboard')} className="back-button">Back</button>
               </div>
               {isModuleLoading ? (
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%', minHeight: '50vh' }}>
                   <div style={{ filter: 'drop-shadow(0 15px 25px rgba(37, 99, 235, 0.2))' }}>
                     <DotLottiePlayer
                       src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie"
                       autoplay
                       loop
                       style={{ width: '150px', height: '150px' }}
                     />
                   </div>
                 </div>
               ) : (
                 <>
                  {activeView === 'Profile' ? <Profile /> : 
                   (activeView === 'Customer Onboarding' || activeView === 'Add Promoter') ? <CustomerOnboarding view={activeView} /> : 
                   (activeView === 'Branch Management' || activeView === 'Create Branch' || activeView === 'View/Update Branch') && !isBranchUser ? <BranchManagement view={activeView} /> :
                   activeView === 'IP Wise Enable/Disable' ? <IPWiseEnable /> :
                   activeView === 'Create Service Center' ? <CreateServiceCenter /> :
                   activeView === 'View Service Center' ? <ViewServiceCenter /> :
                   activeView === 'Add Service Center User' ? <AddServiceCenterUser /> :
                   activeView === 'View Service Center User' ? <ViewServiceCenterUser /> :
                   activeView === 'Debit Request Service Center' ? <DebitRequestServiceCenter /> :
                   activeView === 'Add Balance Request' ? <AddBalanceRequest /> :
                   activeView === 'Share Transfer Request' ? <ShareTransferRequest /> :
                   activeView === 'Online Request' ? <OnlineRequest /> :
                   (activeView === 'Approve Transactions' || activeView === 'Approval Transactions' || activeView === 'Approve Transactions Report') ? <ApproveTransactions /> :
                   activeView === 'View Promoter' ? <ViewPromoter /> :
                   (activeView === 'Assign Online Request' || activeView === 'Assign Request To Branch') ? <AssignOnlineRequest /> :
                   (activeView === 'Customer Complaint / Help Report' || activeView === 'Complaint / Help Request') ? <CustomerComplaints /> :
                   (activeView === 'Customer Feedback Report' || activeView === 'Feedback / Appreciation Report') ? <CustomerFeedback /> :
                   activeView === 'Create Financial Year' ? <CreateFinancialYear /> :
                   activeView === 'View/Update Financial Year' ? <ViewUpdateFinancialYear /> :
                   (activeView === 'Verify Member Kyc' || activeView?.toLowerCase() === 'verify member kyc') ? <VerifyMemberKYC /> :
                   (activeView === 'Pending Upload Document For Approval' || activeView?.toLowerCase() === 'pending upload document for approval') ? <PendingUploadDocument /> :
                   (activeView === 'Member Request Enquiry' || activeView?.toLowerCase() === 'member request enquiry') ? <MemberRequestEnquiry /> :
                   (activeView === 'View Share Application/Request' || activeView?.toLowerCase() === 'view share application/request') ? <ViewShareApplication /> :
                   (activeView === 'Manage Calendar' || activeView?.toLowerCase() === 'manage calendar' || activeView?.toLowerCase() === 'manage-calendar') ? <ManageCalendar onNavigate={handleNavigate} /> :
                   (activeView === 'Manage Events' || activeView?.toLowerCase() === 'manage events' || activeView?.toLowerCase() === 'manage-events') ? <ManageEvents onNavigate={handleNavigate} /> :
                   (activeView === 'Manage Holidays' || activeView?.toLowerCase() === 'manage holidays' || activeView?.toLowerCase() === 'manage-holidays' || activeView === 'Holiday List' || activeView?.toLowerCase() === 'holiday list' || activeView?.toLowerCase() === 'holiday-list') ? <ManageHolidays onNavigate={handleNavigate} /> :
                   (activeView === 'Relationship' || activeView?.toLowerCase() === 'relationship') ? <ManageRelationship onNavigate={handleNavigate} /> :
                   (activeView === 'Share Parameter' || activeView?.toLowerCase() === 'share parameter' || activeView?.toLowerCase() === 'share-parameter') ? <ShareParameters onNavigate={handleNavigate} /> :
                   (activeView === 'Fee Parameter' || activeView?.toLowerCase() === 'fee parameter' || activeView?.toLowerCase() === 'fee-parameter') ? <FeeParameter onNavigate={handleNavigate} /> :
                   (activeView === 'SB Accounts Parameters' || activeView?.toLowerCase() === 'sb accounts parameters') ? <SbAccountsParameters onNavigate={handleNavigate} /> :
                   (activeView === 'SB / OD Account Type' || activeView?.toLowerCase() === 'sb / od account type') ? <SbAccountType onNavigate={handleNavigate} /> :
                   (activeView === 'Plan Parameters' || activeView?.toLowerCase() === 'plan parameters') ? <PlanParameters onNavigate={handleNavigate} /> :
                   (activeView === 'Add Prematurity Slabs' || activeView?.toLowerCase() === 'add prematurity slabs') ? <PlanPrematuritySlabs onNavigate={handleNavigate} /> :
                   (activeView === 'Approvals Limit Parameters' || activeView?.toLowerCase() === 'approvals limit parameters') ? <ApprovalLimitParameters onNavigate={handleNavigate} /> :
                   (activeView === 'Service Deduction' || activeView?.toLowerCase() === 'service deduction') ? <ServiceDeduction onNavigate={handleNavigate} /> :
                   (activeView === 'Deposit TDS Parameter' || activeView?.toLowerCase() === 'deposit tds parameter') ? <DepositTDSParameter onNavigate={handleNavigate} /> :
                   (activeView === 'Add Service Charge' || activeView?.toLowerCase() === 'add service charge') ? <AddServiceCharge onNavigate={handleNavigate} /> :
                   (activeView === 'OD Account Parameters' || activeView?.toLowerCase() === 'od account parameters' || activeView === "OD Account Parameter's") ? <OdAccountParameters onNavigate={handleNavigate} /> :
                   (activeView === 'Late Fee Parameter' || activeView?.toLowerCase() === 'late fees settings') ? <LateFeesSettings onNavigate={handleNavigate} /> :
                   (activeView === 'Holiday List' || activeView?.toLowerCase() === 'holiday list') ? <HolidayList onNavigate={handleNavigate} /> :
                   (activeView === 'OD Account Parameters' || activeView === 'Late Fee Parameter') ? <AddUpdateParameter viewType={activeView} onNavigate={handleNavigate} /> :
                   (activeView === 'Designation Master' || activeView === 'Manage Designation' || activeView === 'Designation Tree View') ? <DesignationMaster initialTab={activeView === 'Designation Tree View' ? 'tree' : 'manage'} /> :
                   activeView === 'Designation Menu Rights' ? <DesignationMenuRights /> :
                   activeView === 'Branch User Rights' ? <BranchUserRights /> :
                   (activeView === 'Service Center User Rights' || activeView?.toLowerCase() === 'service center user rights') ? <ServiceCenterUserRights /> :
                   activeView === 'Create Employee' ? <CreateEmployee /> :
                   activeView === 'Lock Setting' ? <LockSetting /> :
                   activeView === 'EOD/BOD' ? <EodBod /> :
                   activeView === 'View Login Details' ? <ViewLoginDetails /> :
                   (activeView === 'Update Content' || activeView === 'System Setting' || activeView === 'Software Config') ? <CompanySettings /> :
                   activeView === 'Manage Service Tax' ? <ManageServiceTax /> :
                   activeView === 'Update Bank Details' ? <UpdateBankDetails /> :
                   (activeView === 'Create State' || activeView === 'View/Update State') ? <ManageStates view={activeView} /> :
                   (activeView === 'Create District' || activeView === 'View/Update District') ? <ManageDistricts view={activeView} /> :
                   (activeView === 'Create News' || activeView === 'View/Update News') ? <ManageNews view={activeView} user={user} /> :
                   (activeView === 'Add IP Address' || activeView === 'View/Update IPAddress') ? <ManageIPAddress /> :
                   <div className="empty-state" style={{
                     display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                     padding: '4rem 2rem', backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
                     border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '24px', boxShadow: '0 16px 40px rgba(31, 38, 135, 0.1), inset 0 0 30px rgba(255, 255, 255, 0.6)',
                     textAlign: 'center', margin: '2rem auto', maxWidth: '600px'
                   }}>
                     <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                       <div style={{ filter: 'drop-shadow(0 15px 25px rgba(37, 99, 235, 0.4))' }}>
                         <DotLottiePlayer
                           src="/a98bb3e4-1186-11ee-8844-2303de03a1b3.lottie"
                           autoplay
                           loop
                           style={{ width: '130px', height: '130px' }}
                         />
                       </div>
                     </div>
                     <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                       {activeView} Module
                     </h3>
                     <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px' }}>
                       WE ARE WORKING ON IT
                     </p>
                     <p style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '500', marginTop: '0.5rem' }}>
                       This feature is currently under development and will be available very soon!
                     </p>
                   </div>}
                 </>
               )}
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
