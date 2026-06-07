import { useState } from 'react';

function BranchDashboard({ user, onNavigate }) {
  const [memberId, setMemberId] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [searchAccountNo, setSearchAccountNo] = useState('');

  // SVG Icons
  const IconUserAdd = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>;
  const IconBook = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
  const IconFolder = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
  const IconFile = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
  const IconBell = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
  const IconMoney = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
  const IconUpload = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
  const IconPiggy = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
  const IconPrinter = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;
  
  const IconLightning = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>;
  const IconSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
  const IconArrowRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;

  const WatermarkPeople = () => <svg style={{ position: 'absolute', right: '-10px', bottom: '-10px', width: '160px', height: '160px', opacity: '0.02', pointerEvents: 'none' }} viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;
  const WatermarkLightning = () => <svg style={{ position: 'absolute', right: '-10px', bottom: '-10px', width: '150px', height: '150px', opacity: '0.02', pointerEvents: 'none' }} viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>;

  const ACCOUNT_OPENING = [
    { title: 'Create Member Request', icon: <IconUserAdd /> },
    { title: 'Open SB Account', icon: <IconBook /> },
    { title: 'Open RD Account', icon: <IconFolder /> },
    { title: 'FD Account', icon: <IconFile /> },
    { title: 'Open PIGMY Account', icon: <IconPiggy /> },
    { title: 'Open MIS Account', icon: <IconBook /> },
    { title: 'Open OD Account', icon: <IconBook /> },
    { title: 'Open PIGMY Withdraw Account', icon: <IconPiggy /> }
  ];
  
  const PRINT = [
    { title: 'SB / CA Passbook', icon: <IconFolder /> },
    { title: 'RD / Pigmy Passbook', icon: <IconUserAdd /> },
    { title: 'MIS Bond', icon: <IconFile /> },
    { title: 'RD Bond', icon: <IconFile /> },
    { title: 'FD Bond', icon: <IconMoney /> },
    { title: 'Share Certificate', icon: <IconUserAdd /> }
  ];

  const ALERT = [
    { title: 'Bulk Deposite', icon: <IconUpload /> },
    { title: 'Deposit EMI Receivable', icon: <IconUpload /> },
    { title: 'Loan EMI Receivable', icon: <IconUpload /> },
    { title: 'Loan EMI Receivable Today', icon: <IconFolder /> },
    { title: 'Maturity Alert', icon: <IconBell /> }
  ];

  const PAYMENT = [
    { title: 'Cash Deposit', icon: <IconMoney /> },
    { title: 'Cash Withdrawl', icon: <IconMoney /> },
    { title: 'Cash Transfer', icon: <IconUpload /> }
  ];

  const LOAN = [
    { title: 'Apply Loan', icon: <IconUserAdd /> },
    { title: 'Disburse Loan', icon: <IconUserAdd /> },
    { title: 'Loan Emi Payment', icon: <IconMoney /> },
    { title: 'Apply Gold Loan', icon: <IconUserAdd /> },
    { title: 'Apply Group Loan', icon: <IconUserAdd /> }
  ];

  const MISC = [
    { title: 'Online Request', icon: <IconFile /> },
    { title: 'Complaint / Help Request', icon: <IconFile /> },
    { title: 'Feedback / Appreciation Report', icon: <IconFile /> },
    { title: 'News(1)', icon: <IconFile />, navigate: 'View/Update News' },
    { title: 'Communication', icon: <IconFile /> }
  ];

  const ActionGrid = ({ title, headerIcon, items }) => (
    <div style={{ marginBottom: '2rem', width: '100%', maxWidth: '1200px', margin: '0 auto 2.5rem auto' }}>
      
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem', gap: '0.5rem' }}>
        <div style={{ color: '#0052cc', display: 'flex', alignItems: 'center' }}>
          {headerIcon}
        </div>
        <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: '800', color: '#1e293b', letterSpacing: '0.5px' }}>
          {title}
        </h3>
        <div style={{ width: '30px', height: '2px', backgroundColor: '#bfdbfe', marginLeft: '0.5rem' }}></div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '1rem' }}>
        {items.map(item => (
          <div 
            key={item.title} 
            onClick={() => {
              if (item.navigate && onNavigate) {
                onNavigate(item.navigate);
              }
            }}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center',
              cursor: 'pointer', gap: '1rem', padding: '1.25rem 0.5rem', 
              borderRadius: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderTop: '1px solid rgba(255, 255, 255, 0.9)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05), inset 0 0 20px rgba(255, 255, 255, 0.5)',
              transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
              minHeight: '110px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(31, 38, 135, 0.1), inset 0 0 25px rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
            }} 
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.05), inset 0 0 20px rgba(255, 255, 255, 0.5)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
            }}
          >
            <div style={{ color: '#0052cc' }}>
              {item.icon}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: '700', lineHeight: '1.4' }}>
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, padding: '2rem', backgroundColor: 'transparent', minHeight: '100%', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Search Container (Two Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', maxWidth: '1200px', width: '100%', margin: '0 auto 3rem auto' }}>
        
        {/* Left Col Search */}
        <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', borderRadius: '24px', padding: '1.75rem', border: '1px solid rgba(255, 255, 255, 0.4)', borderTop: '1px solid rgba(255, 255, 255, 0.9)', borderLeft: '1px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 16px 40px rgba(31, 38, 135, 0.1), inset 0 0 30px rgba(255, 255, 255, 0.6)' }}>
          <WatermarkPeople />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
            <div style={{ color: '#0052cc' }}><IconUserAdd /></div>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1e293b', letterSpacing: '0.5px' }}>MEMBER SEARCH</div>
          </div>
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Enter Member ID / Mobile No.</label>
              <input type="text" value={memberId} onChange={(e) => setMemberId(e.target.value)} placeholder="Enter Member ID / Mobile No." style={{ width: '100%', padding: '0.7rem 1rem', fontSize: '0.8rem', border: '1px solid rgba(255, 255, 255, 0.8)', outline: 'none', borderRadius: '12px', transition: 'all 0.3s ease', backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', color: '#0f172a' }} onFocus={(e) => {e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';}} onBlur={(e) => {e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';}} />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Enter Account Number</label>
              <input type="text" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} placeholder="Enter Account Number" style={{ width: '100%', padding: '0.7rem 1rem', fontSize: '0.8rem', border: '1px solid rgba(255, 255, 255, 0.8)', outline: 'none', borderRadius: '12px', transition: 'all 0.3s ease', backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', color: '#0f172a' }} onFocus={(e) => {e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';}} onBlur={(e) => {e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';}} />
            </div>

            <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: 'white', border: 'none', padding: '0.65rem 1.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', borderRadius: '12px', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #1e3a8a)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(37, 99, 235, 0.4)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb, #1e40af)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.2)'; }}>
              <IconSearch /> Search
            </button>
          </div>
        </div>

        {/* Right Col Search */}
        <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', borderRadius: '24px', padding: '1.75rem', border: '1px solid rgba(255, 255, 255, 0.4)', borderTop: '1px solid rgba(255, 255, 255, 0.9)', borderLeft: '1px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 16px 40px rgba(31, 38, 135, 0.1), inset 0 0 30px rgba(255, 255, 255, 0.6)' }}>
          <WatermarkLightning />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
            <div style={{ color: '#0052cc' }}><IconLightning /></div>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1e293b', letterSpacing: '0.5px' }}>QUICK ACTION</div>
          </div>
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Select Work Type (SB / PIGMY / RD / FD)</label>
              <select style={{ width: '100%', padding: '0.7rem 1rem', fontSize: '0.8rem', border: '1px solid rgba(255, 255, 255, 0.8)', outline: 'none', borderRadius: '12px', transition: 'all 0.3s ease', backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', color: '#0f172a', cursor: 'pointer' }} onFocus={(e) => {e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';}} onBlur={(e) => {e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';}}>
                <option value="">- - - Select Work Type - - -</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>Account No / Member ID</label>
              <input type="text" value={searchAccountNo} onChange={(e) => setSearchAccountNo(e.target.value)} placeholder="e.g. 1004523" style={{ width: '100%', padding: '0.7rem 1rem', fontSize: '0.8rem', border: '1px solid rgba(255, 255, 255, 0.8)', outline: 'none', borderRadius: '12px', transition: 'all 0.3s ease', backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', color: '#0f172a' }} onFocus={(e) => {e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';}} onBlur={(e) => {e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)'; e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';}} />
            </div>

            <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: 'white', border: 'none', padding: '0.65rem 2rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', borderRadius: '12px', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #1e3a8a)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(37, 99, 235, 0.4)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb, #1e40af)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.2)'; }}>
              <IconArrowRight /> Go
            </button>
          </div>
        </div>

      </div>

      {/* Action Grids */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <ActionGrid title="ACCOUNT OPENING" headerIcon={<IconFolder />} items={ACCOUNT_OPENING} />
        <ActionGrid title="PRINT" headerIcon={<IconPrinter />} items={PRINT} />
        <ActionGrid title="ALERT" headerIcon={<IconBell />} items={ALERT} />
        <ActionGrid title="PAYMENT" headerIcon={<IconMoney />} items={PAYMENT} />
        <ActionGrid title="LOAN" headerIcon={<IconUserAdd />} items={LOAN} />
        <ActionGrid title="OTHER REQUESTS" headerIcon={<IconFile />} items={MISC} />
      </div>

    </div>
  );
}

export default BranchDashboard;
