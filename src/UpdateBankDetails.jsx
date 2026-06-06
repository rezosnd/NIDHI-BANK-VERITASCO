import React, { useState, useEffect } from 'react';
import './UpdateBankDetails.css';

export default function UpdateBankDetails() {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [customBankName, setCustomBankName] = useState('');
  const [formData, setFormData] = useState({
    ifsc_code: '',
    account_holder_name: '',
    account_number: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/bankdetails', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBanks(data);
      }
    } catch (e) {
      console.error('Failed to load banks', e);
    }
  };

  const handleBankChange = async (e) => {
    const code = e.target.value;
    setSelectedBank(code);
    setMessage('');
    setCustomBankName('');
    
    if (!code || code === '0' || code === 'OTHER') {
      setFormData({ ifsc_code: '', account_holder_name: '', account_number: '' });
      return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/bankdetails/${code}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          ifsc_code: data.ifsc_code || '',
          account_holder_name: data.account_holder_name || '',
          account_number: data.account_number || ''
        });
      }
    } catch (e) {
      console.error('Failed to load bank details', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedBank || selectedBank === '0') {
      setMessage('Please select a bank first.');
      setMessageType('error');
      return;
    }

    if (selectedBank === 'OTHER' && !customBankName.trim()) {
      setMessage('Please enter a name for the custom bank.');
      setMessageType('error');
      return;
    }
    
    if (!formData.ifsc_code || !formData.account_holder_name || !formData.account_number) {
      setMessage('All fields are required.');
      setMessageType('error');
      return;
    }

    setIsSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('authToken');
      let res;
      
      if (selectedBank === 'OTHER') {
        res = await fetch('/api/bankdetails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            bank_name: customBankName,
            ...formData
          })
        });
      } else {
        res = await fetch(`/api/bankdetails/${selectedBank}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      }
      
      if (res.ok) {
        const data = await res.json();
        setMessage(data.message || 'Bank details updated successfully!');
        setMessageType('success');
        
        await fetchBanks(); // Refresh list to get new bank
        if (selectedBank === 'OTHER' && data.bank_code) {
          setSelectedBank(data.bank_code);
        }
        
        setTimeout(() => setMessage(''), 4000);
      } else {
        setMessage('Failed to update bank details.');
        setMessageType('error');
      }
    } catch (e) {
      console.error(e);
      setMessage('An error occurred while saving.');
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bank-details-wrapper">
      {message && (
        <div className={`bd-alert ${messageType}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {messageType === 'error' ? (
              <path d="M18 6L6 18M6 6l12 12"></path>
            ) : (
              <polyline points="20 6 9 17 4 12"></polyline>
            )}
          </svg>
          {message}
        </div>
      )}

      <div className="bd-card">
        <form onSubmit={handleUpdate}>
          <div className="bd-form-group">
            <label className="bd-label">Bank Name<span>*</span></label>
            <select 
              className="bd-select" 
              value={selectedBank} 
              onChange={handleBankChange}
              required
            >
              <option value="0">Select Bank</option>
              {banks.map(bank => (
                <option key={bank.bank_code} value={bank.bank_code}>
                  {bank.bank_name}
                </option>
              ))}
              <option value="OTHER" style={{ fontWeight: 'bold', color: '#2563eb' }}>+ Add New Custom Bank...</option>
            </select>
          </div>

          {selectedBank === 'OTHER' && (
            <div className="bd-form-group">
              <label className="bd-label">Custom Bank Name<span>*</span></label>
              <input 
                type="text" 
                className="bd-input" 
                maxLength="100"
                value={customBankName}
                onChange={(e) => setCustomBankName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="bd-form-group">
            <label className="bd-label">IFSC Code<span>*</span></label>
            <input 
              type="text" 
              name="ifsc_code"
              className="bd-input" 
              maxLength="15"
              value={formData.ifsc_code}
              onChange={handleFormChange}
              disabled={(!selectedBank || selectedBank === '0') && selectedBank !== 'OTHER' || isLoading}
              required
            />
          </div>

          <div className="bd-form-group">
            <label className="bd-label">Account Holder Name<span>*</span></label>
            <input 
              type="text" 
              name="account_holder_name"
              className="bd-input" 
              maxLength="50"
              value={formData.account_holder_name}
              onChange={handleFormChange}
              disabled={(!selectedBank || selectedBank === '0') && selectedBank !== 'OTHER' || isLoading}
              required
            />
          </div>

          <div className="bd-form-group">
            <label className="bd-label">Account Number<span>*</span></label>
            <input 
              type="text" 
              name="account_number"
              className="bd-input" 
              maxLength="30"
              value={formData.account_number}
              onChange={handleFormChange}
              disabled={(!selectedBank || selectedBank === '0') && selectedBank !== 'OTHER' || isLoading}
              required
            />
          </div>

          <div className="bd-actions">
            <button 
              type="submit" 
              className="bd-btn bd-btn-primary"
              disabled={!selectedBank || selectedBank === '0' || isSaving || isLoading}
            >
              {isSaving ? (selectedBank === 'OTHER' ? 'Adding...' : 'Updating...') : (selectedBank === 'OTHER' ? 'Add Custom Bank' : 'Update Details')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
