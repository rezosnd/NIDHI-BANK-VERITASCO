// Service Center User Menu Structure — 74 items from servicecenterRights.aspx
// Each entry: { group: 'GROUP NAME', items: ['item1', 'item2', ...] }
export const SC_MENU_STRUCTURE = [
  {
    group: 'TRANSACTION',
    items: [
      'Cash Deposit', 'Cash Withdrawal', 'Approval Transactions', 'Rejected Transactions',
      'Apply Now', 'Cheque Recounciliation', 'Request For Credit', 'Request For NEFT',
      'Transfer', 'Renewals', 'Print Transaction', 'MIS Interest Pay',
      'Loan Emi Payment', 'Online Request', 'Complaint / Help Request',
      'Feedback / Appreciation Report'
    ]
  },
  {
    group: 'TRANSACTION REPORTS',
    items: ['Cheque Recounciliation Report', 'Transactions Report']
  },
  {
    group: 'CUSTOMER ENROLLMENT',
    items: [
      'Customer Registration Request', 'View Registration Request', 'View Customer Enrollment',
      'Upload Document', 'Update Customer Request', 'View Member Request'
    ]
  },
  {
    group: 'CUSTOMER REPORTS',
    items: ['Member Enrollment Report']
  },
  {
    group: 'BANKING - Shares',
    items: [
      'Share New Application/Request', 'Share Surrender/Withdraw', 'View Share Report'
    ]
  },
  {
    group: 'BANKING - SB',
    items: ['SB Opening', 'Search SB Accounts']
  },
  {
    group: 'BANKING - RD',
    items: ['RD Opening', 'RD Installment Enquiry']
  },
  {
    group: 'BANKING - FD',
    items: ['FD Opening']
  },
  {
    group: 'BANKING - Pigmy',
    items: ['Pigmy Account Opening', 'SC Pigmy Installment Enquiry', 'Pigmy Ledger Report']
  },
  {
    group: 'BANKING - MIS',
    items: ['MIS Opening', 'View All MIS Reports', 'MIS Renewal']
  },
  {
    group: 'BANKING - OverDraft',
    items: ['OD Opening', 'View OD Account', 'OD Ledger']
  },
  {
    group: 'BANKING - Pigmy Withdraw',
    items: ['Pigmy Withdraw Opening', 'View Pigmy Withdraw', 'Pigmy Withdraw Ledger']
  },
  {
    group: 'REPORT - Service Center',
    items: [
      'SC Ledger Report', 'SC Business Report', 'SC Member Report',
      'SC RD Report', 'SC PIGMY Report', 'SC FD Report',
      'SC Credit/Debit Request Report'
    ]
  },
  {
    group: 'TOOLS',
    items: ['Broadcast', 'Communication', 'Notes', 'Manage Calendar', 'Manage Events']
  }
];

// Flat list of all SC menu item names
export const SC_MENU_ITEMS = SC_MENU_STRUCTURE.flatMap(g => g.items);
