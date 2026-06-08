// Branch User Menu Structure — exact 391 items from BranchUserRights.aspx
// Each entry: { group: 'GROUP NAME', items: ['item1', 'item2', ...] }
export const BRANCH_MENU_STRUCTURE = [
  {
    group: 'TRANSACTION',
    items: [
      'Cash Deposit', 'Cash Withdrawal', 'Approval Transactions', 'Rejected Transactions',
      'Apply Now', 'Cheque Recounciliation', 'Request For Credit', 'Transfer',
      'View Request For NEFT', 'Request For NEFT', 'Renewals', 'Loan Disbursement Payment',
      'Loan Disbursement Interest Type', 'Loan Dis. Int. and pro.fee Type',
      'Service Charge Deduct', 'Print Transaction', 'MIS Interest Pay', 'Loan Emi Payment',
      'Add Staff E-Wallet', 'Bulk Deposit', 'Deposit EMI Receivable Today',
      'Loan EMI Receivable Today', 'Online Request', 'Approve Vouchers',
      'Complaint / Help Request', 'Feedback / Appreciation Report', 'Maturity Alert'
    ]
  },
  {
    group: 'TRANSACTION REPORTS',
    items: ['Cheque Recounciliation Report', 'Transactions Report', 'Renewal From App']
  },
  {
    group: 'SERVICE CENTER',
    items: ['Add Credit Service Center', 'View Credit Request', 'Credit History']
  },
  {
    group: 'CUSTOMER ENROLLMENT',
    items: [
      'Customer Registration Request', 'View Registration Request', 'View Customer Enrollment',
      'Upload Document', 'Customer Account Details', 'Create Centre Name',
      'view/update Centre Name', 'Create Group', 'view/update Group',
      'Add Customer Bank Details', 'View Customer Bank Details', 'Member Card Request',
      'Update Customer Request', '15G/15H', 'View 15G/15H Documents', 'View Member Request'
    ]
  },
  {
    group: 'CUSTOMER REPORTS',
    items: [
      'Member Enrollment Report', 'Group Enrollment Report',
      'Member KYC Status', '15G/15H Member List'
    ]
  },
  {
    group: 'BANKING - Shares',
    items: [
      'Share Transfer By Cash', 'Share New Application/Request', 'Share Surrender/Withdraw',
      'View Share Report', 'Nominee to Share-Associate', 'Share transfer By SB',
      'View Share Application/Request'
    ]
  },
  {
    group: 'BANKING - SB',
    items: [
      'SB Opening', 'Search SB Accounts', 'SB Ledger', 'closure SB Accounts',
      'Virtual Account Request', 'Approve Virtual Account Request', 'Virtual Account Status',
      'Hold Amount', 'Hold Amount Report'
    ]
  },
  {
    group: 'BANKING - RD',
    items: [
      'RD Opening', 'View All RD Report', 'Installment Enquiry',
      'RD Ledger Report', 'RD Pre Maturity', 'RD Pay Maturity'
    ]
  },
  {
    group: 'BANKING - FD',
    items: [
      'FD Opening', 'Search FD Accounts', 'FD Ledger Report',
      'FD PreMaturity', 'FD Pay Maturity'
    ]
  },
  {
    group: 'BANKING - Pigmy',
    items: [
      'Pigmy Account Opening', 'View All Pigmy Report', 'Pigmy Installment Enquiry',
      'Multiple Renewals', 'Pigmy Ledger Report', 'Pigmy Pre Maturity',
      'Pigmy Pay Maturity', 'Pigmy Interest Calculation'
    ]
  },
  {
    group: 'BANKING - CA',
    items: ['C A Opening', 'Search C A', 'closure CA Accounts', 'C A Ledger']
  },
  {
    group: 'BANKING - MIS',
    items: [
      'MIS Opening', 'View All MIS Reports', 'MIS Renewal',
      'MIS Ledger Report', 'MIS Pre Maturity', 'MIS Pay Maturity'
    ]
  },
  {
    group: 'BANKING - OverDraft',
    items: [
      'OD Opening', 'View OD Account', 'Add OD A/c Amount', 'OD Ledger', 'Closure OD Account'
    ]
  },
  {
    group: 'BANKING - Pigmy Withdraw',
    items: [
      'Pigmy Withdraw Opening', 'View Pigmy Withdraw',
      'Pigmy Withdraw Ledger', 'Pigmy Withdraw Closure'
    ]
  },
  {
    group: 'MORTGAGE',
    items: [
      'Create Mortgage Request', 'View Mortgage Request',
      'View Mortgage', 'Mortgage Closure request'
    ]
  },
  {
    group: 'LOAN',
    items: [
      'Loan Calculator', 'Interest Calculator', 'Apply Loan', 'View Applications',
      'Provisional Processing Fee', 'Disburse Loan', 'Pending Disbursal payment',
      'Repayment Schedule', 'View Loans', 'Create Ecs Details',
      'Add Charges To Loan', 'View Loan Charges Report', 'ForeClosure Loan',
      'Loan Part Payment', 'Waiveoff Request'
    ]
  },
  {
    group: 'LOAN REPORT',
    items: [
      'Loan Account Details', 'Loan List', 'Overdue', 'Loan Balances',
      'EMI Due Report', 'EMI Payment Estimation', 'Without Emi Due Report',
      'View Co-Applicants report', 'Loan Summary Report', 'Vehicle Loan inst Pending Rpt.',
      'Demand Sheet', 'Progress Report', 'Loan Inst Pending Report',
      'Loan Waiveoff Report', 'Memberwise Disbursement Rpt.',
      'Agent Business Report', 'CIBIL Report'
    ]
  },
  {
    group: 'GOLD LOAN',
    items: [
      'Create New Loan', 'View Gold Loan Applications', 'Disbursement Pending Loans',
      'Receive Interest Payment', 'Receive EMI Payment', 'Gold Repayment Schedule',
      'Loan Closure(Emi Type)', 'View Goldloan Details'
    ]
  },
  {
    group: 'GOLD LOAN REPORTS',
    items: [
      'GL Ledger Report', 'GL Loan Balances', 'Approved Gold Loans',
      'Rejected Gold Loans', 'Disbursed Gold Loans', 'Gold EMI Interest Report',
      'Closed Gold Loans', 'Total EMI Due report', 'GL Payment Summary Report',
      'GL Interest Report', 'Gold/Mortgage Loan Value Rpt.', 'Scheme Wise GL Report'
    ]
  },
  {
    group: 'GROUP LOAN',
    items: [
      'Group Loan Bulk Apply', 'Grouploan Bulk Payment',
      'View Group REPORT', 'View Group Member', 'OverDue Report',
      'Active Group Loan', 'Group EMI Due Report', 'Group Loan Balances',
      'Loan Bulk Payment Report'
    ]
  },
  {
    group: 'LOAN PRINT & REPORTS',
    items: [
      'Loan Statement', 'List Of Letters', 'Applied Loans Report',
      'Interest Received Report', 'overdue interest Received Rpt.',
      'Collection Report', 'WAITING LOANS REPORT', 'Loan Nominee Details'
    ]
  },
  {
    group: 'LS',
    items: ['LS Opening', 'Search LS Accounts', 'LS Ledger']
  },
  {
    group: 'MANAGE VENDOR',
    items: [
      'Add Product Category', 'Add Product Vendor', 'view Product Vendor',
      'Vendor Transactions', 'Pay To Vendor'
    ]
  },
  {
    group: 'E-NACH',
    items: [
      'Loans For Create Mandate', 'Download Mandate File', 'Mandate Send File For Bank',
      'Loan Emi File', 'Update Emi Payment', 'Upload NACH File', 'Update Mandate'
    ]
  },
  {
    group: 'PRINT - Passbook & Bonds',
    items: [
      'SB / CA / Pigmy Withdraw Passbook', 'RD / PIGMY Passbook',
      'MIS Bond', 'PIGMY Bond', 'RD Bond', 'FD Bond',
      'Share Statement', 'Welcome Letter'
    ]
  },
  {
    group: 'PRINT - Forms',
    items: [
      'Print Blank Application', 'Print Filled Application', 'Print FORM DA 1',
      'Print RTGS_NEFT Challan', 'Print Debit Slip', 'Print Deposit Form',
      'Print Withdrawal Form', 'Print Account Closure Form',
      'Print Account Closure Letter', 'Print Misuse Letter'
    ]
  },
  {
    group: 'ACCOUNTING',
    items: [
      'GL Transaction', 'GL Receipt', 'GL Payment', 'Journal Entry',
      'Cash/Bank To Bank/Cash Transfer', 'View Voucher', 'Cheque Reconcle',
      'Journal Voucher', 'Salary Transfer', 'Approve Account Entry', 'Approve Transaction View'
    ]
  },
  {
    group: 'ACCOUNTING REPORTS',
    items: [
      'SubDay Book', 'GL DayBalance', 'General Ledger', 'Cash Book', 'Bank Book',
      'Receipt and Payment A/C', 'Trial Balance', 'Profit and Loss A/C', 'Balance Sheet'
    ]
  },
  {
    group: 'ACCOUNTING LEDGER',
    items: ['Create Ledger', 'View Ledger', 'Vendor Enrollment', 'View Vendor Enrollment']
  },
  {
    group: 'REPORT - SB',
    items: [
      'SB Deposit & Withdraw Report', 'SB Interest Report', 'Opened SB Accounts Report',
      'SB Balances Report', 'SB Transaction Report', 'Inactive SB Report'
    ]
  },
  {
    group: 'REPORT - Service Center',
    items: [
      'SC Ledger Report', 'SC Business Report', 'SC Member Report',
      'SC RD Report', 'SC PIGMY Report', 'SC FD Report',
      'SC NEFT Request Report', 'SC Credit/Debit Request Report'
    ]
  },
  {
    group: 'REPORT - RD',
    items: [
      'RD Planwise Report', 'RD Closed Accounts Report',
      'RD Accounts Matured Today', 'RD Interest Report'
    ]
  },
  {
    group: 'REPORT - FD',
    items: [
      'FD Opening Account Report', 'FD Closed Account Report',
      'FD Matured Account Report', 'FD Balance Report'
    ]
  },
  {
    group: 'REPORT - Pigmy',
    items: [
      'Pigmy Planwise Report', 'Pigmy Closed Accounts Report',
      'Pigmy Accounts Matured Today', 'Pigmy Interest Report'
    ]
  },
  {
    group: 'REPORT - MIS',
    items: [
      'MIS Planwise Report', 'MIS Closed Accounts Report',
      'MIS Accounts Matured Today', 'MIS Interest Report'
    ]
  },
  {
    group: 'REPORT - Share',
    items: ['Share Transaction Report', 'Share Holder address', 'Share Transfer Report']
  },
  {
    group: 'REPORT - OD',
    items: [
      'OD Deposit & Withdraw Report', 'Opened OD Accounts Report', 'OD Interest Report',
      'OD Balance', 'Closer A/C Report', 'OD Transaction Report'
    ]
  },
  {
    group: 'REPORT - Pigmy Withdraw',
    items: ['PW Deposit/Withdraw', 'PW Interest', 'PW Balance', 'PW Closed']
  },
  {
    group: 'REPORT - General',
    items: [
      'Delete Renewal', 'Branch Collection Report', 'Total Collection report',
      'Renewal Delete List', 'Late Fees Report', 'Account Balance Report',
      'Daily Collection Report', 'Pending Installment Details', 'Batch Entry Details',
      'New Branch Collection Report', 'Share Report', 'Maturity Report',
      'Closed Pre-Maturity Report', 'Closed Maturity Report', 'Deposit Balance Report',
      'TDS Receivable', 'Pigmy WithDraw Collection RPT',
      'Active/Inactive Accounts History', 'EMI Remainder'
    ]
  },
  {
    group: 'PIGMY MODULE',
    items: ['Upload Pigmy File', 'Download Pigmy File', 'View Paid Record']
  },
  {
    group: 'TOOLS',
    items: [
      'Broadcast', 'ADD Standing Instruction', 'Communication',
      'Notes', 'Manage Calendar', 'Manage Events'
    ]
  },
  {
    group: 'STAFF ENROLLMENT',
    items: ['Create Staff', 'View Staff Enrollment']
  },
  {
    group: 'STAFF REPORTS',
    items: ['Staff Downline Customer', 'Staff Daily Collection Report', 'Staff Business Report']
  },
  {
    group: 'LOAN APPLICATION',
    items: [
      'Application Summery', 'Application Info', 'Co Applicant Info',
      'Upload Loan Document', 'PDC & NACH Details', 'Bank Account Details',
      'Existing Loan Details', 'Credit Card Details', 'Reference Details',
      'Collateral', 'Insurance', 'Vehicle Details', 'Cibil Verification',
      'Address Verification', 'Doc. Verification', 'Print Documents',
      'Payment Settings', 'Add Product Details', 'Collateral Verification'
    ]
  },
  {
    group: 'GOLD LOAN APPLICATION',
    items: ['GL Application Summery', 'GL Application Info', 'Add Items', 'Send for Approval']
  }
];

// Flat list of all menu item names (for total count, select all, etc.)
export const BRANCH_MENU_ITEMS = BRANCH_MENU_STRUCTURE.flatMap(g => g.items);
