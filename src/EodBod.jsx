import React, { useState, useEffect } from 'react';

function EodBod() {
  const getTodayFormatted = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const [eodDate] = useState(getTodayFormatted());
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/eod/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        setErrorMessage('Failed to fetch transactions');
      }
    } catch (err) {
      setErrorMessage('Network error while fetching transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEod = async () => {
    if (window.confirm(`Are you sure you want to execute EOD for ${eodDate}?`)) {
      try {
        setIsExecuting(true);
        setErrorMessage('');
        setSuccessMessage('');
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/eod/execute', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
          setSuccessMessage(data.message || 'End of Day successfully executed.');
          setTransactions([]); // Clear transactions after execution
          setTimeout(() => setSuccessMessage(''), 5000);
        } else {
          setErrorMessage(data.message || 'Failed to execute EOD');
        }
      } catch (err) {
        setErrorMessage('Network error while executing EOD');
      } finally {
        setIsExecuting(false);
      }
    }
  };

  const totalAmount = transactions.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header section similar to modern dashboard styling */}
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', color: '#1e293b', fontWeight: '700', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
          End / Begin Of Day
        </h2>

        {successMessage && (
          <div style={{ backgroundColor: '#dcfce3', color: '#166534', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {errorMessage}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
              EOD <span style={{ color: '#ef4444' }}>*</span> :
            </label>
            <input 
              type="text" 
              value={eodDate}
              readOnly
              style={{
                padding: '8px 12px',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                borderRadius: '6px',
                fontSize: '0.95rem',
                color: '#334155',
                backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                width: '120px',
                cursor: 'not-allowed',
                fontWeight: '500'
              }}
            />
          </div>
          <button 
            onClick={handleEod}
            disabled={isExecuting || transactions.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: (isExecuting || transactions.length === 0) ? '#94a3b8' : '#0052cc',
              color: 'white',
              border: 'none',
              padding: '8px 24px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: (isExecuting || transactions.length === 0) ? 'not-allowed' : 'pointer',
              boxShadow: (isExecuting || transactions.length === 0) ? 'none' : '0 2px 4px rgba(0, 82, 204, 0.2)',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => { if (!isExecuting && transactions.length > 0) e.target.style.backgroundColor = '#0043a6'; }}
            onMouseOut={(e) => { if (!isExecuting && transactions.length > 0) e.target.style.backgroundColor = '#0052cc'; }}
          >
            {isExecuting ? 'Executing...' : 'Execute EOD'}
          </button>
        </div>

        {/* Not Approved Transaction Summary */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#e0f2fe', padding: '12px 16px', borderLeft: '4px solid #0284c7', borderRadius: '0 6px 6px 0', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#0369a1', fontWeight: '700' }}>Not Approved Transaction Summary</h3>
          </div>
          <div style={{ padding: '24px', backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.6)', color: '#64748b', textAlign: 'center', fontSize: '0.9rem' }}>
            No unapproved transactions found.
          </div>
        </div>

        {/* Still amount not deposited details */}
        <div>
          <div style={{ backgroundColor: '#fef3c7', padding: '12px 16px', borderLeft: '4px solid #d97706', borderRadius: '0 6px 6px 0', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#92400e', fontWeight: '700' }}>Still amount not deposited details</h3>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: '#0052cc' }}>Total Amount: {totalAmount.toFixed(2)}</span>
          </div>
          
          <div style={{ overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(30, 41, 59, 0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', color: 'white', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Sl No</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Branch</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Type</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Opening Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Account No</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Member ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                      <div className="dotted-loader" style={{ justifyContent: 'center', marginBottom: '12px' }}>
                        <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                      </div>
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" color="#94a3b8" style={{ marginBottom: '12px', display: 'block', margin: '0 auto' }}>
                        <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                        <circle cx="12" cy="12" r="2"></circle>
                        <path d="M6 12h.01M18 12h.01"></path>
                      </svg>
                      No pending deposits for EOD.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, idx) => (
                    <tr key={tx.id || idx} style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', borderBottom: '1px solid rgba(255, 255, 255, 0.4)' }}>
                      <td style={{ padding: '10px 16px', color: '#475569' }}>{idx + 1}</td>
                      <td style={{ padding: '10px 16px', color: '#1e293b', fontWeight: '500' }}>{tx.branch}</td>
                      <td style={{ padding: '10px 16px', color: '#475569' }}>{tx.type}</td>
                      <td style={{ padding: '10px 16px', color: '#475569' }}>{tx.opening_date}</td>
                      <td style={{ padding: '10px 16px', color: '#0052cc', fontWeight: '600' }}>{tx.account_no}</td>
                      <td style={{ padding: '10px 16px', color: '#475569' }}>{tx.member_id}</td>
                      <td style={{ padding: '10px 16px', color: '#1e293b' }}>{tx.name}</td>
                      <td style={{ padding: '10px 16px', color: '#1e293b', fontWeight: '600', textAlign: 'right' }}>{parseFloat(tx.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default EodBod;
