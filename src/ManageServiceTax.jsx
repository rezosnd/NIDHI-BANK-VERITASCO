import React, { useState, useEffect } from 'react';
import './ManageServiceTax.css';

export default function ManageServiceTax() {
  const [taxData, setTaxData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    fetchServiceTax();
  }, []);

  const fetchServiceTax = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/servicetax', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTaxData(data);
      }
    } catch (e) {
      console.error('Failed to load service tax', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    let newForm = { ...editForm, [name]: newValue };
    
    if (name === 'total_percent' || name === 'is_igst') {
      const totalP = parseFloat(newForm.total_percent || 0);
      if (newForm.is_igst) {
        newForm.cgst_percent = (totalP / 3).toFixed(2);
        newForm.sgst_percent = (totalP / 3).toFixed(2);
        newForm.igst_percent = (totalP / 3).toFixed(2);
      } else {
        newForm.cgst_percent = (totalP / 2).toFixed(2);
        newForm.sgst_percent = (totalP / 2).toFixed(2);
        newForm.igst_percent = '0.00';
      }
    }
    
    setEditForm(newForm);
  };

  const handleSave = async () => {
    if (!editForm) return;
    
    setIsSaving(true);
    setSaveMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/servicetax/${editForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      
      if (res.ok) {
        setSaveMessage('Service tax configuration saved securely!');
        setEditingId(null);
        fetchServiceTax(); 
        setTimeout(() => setSaveMessage(''), 4000);
      } else {
        setSaveMessage('Failed to save configuration.');
      }
    } catch (e) {
      console.error(e);
      setSaveMessage('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="service-tax-wrapper">
      {saveMessage && (
        <div className={`st-alert ${saveMessage.includes('Failed') ? 'error' : 'success'}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {saveMessage.includes('Failed') ? (
              <path d="M18 6L6 18M6 6l12 12"></path>
            ) : (
              <polyline points="20 6 9 17 4 12"></polyline>
            )}
          </svg>
          {saveMessage}
        </div>
      )}

      <div className="st-card">
        <table className="st-table">
          <thead>
            <tr>
              <th>Sl. No.</th>
              <th>Tax Name</th>
              <th>Is IGST?</th>
              <th>Total %</th>
              <th>CGST %</th>
              <th>SGST %</th>
              <th>IGST %</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>Loading tax configurations...</td>
              </tr>
            ) : taxData.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>No tax records found in database.</td>
              </tr>
            ) : (
              taxData.map((item, index) => {
                const isEditing = editingId === item.id;
                const displayItem = isEditing ? editForm : item;
                
                return (
                  <tr key={item.id} className={isEditing ? 'editing' : ''}>
                    <td style={{ fontWeight: '700', color: '#64748b' }}>{index + 1}</td>
                    <td style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>{displayItem.tax_name}</td>
                    
                    <td>
                      <input 
                        type="checkbox" 
                        name="is_igst"
                        className="st-checkbox"
                        checked={displayItem.is_igst} 
                        onChange={handleFormChange}
                        disabled={!isEditing}
                      />
                    </td>
                    
                    <td>
                      {isEditing ? (
                        <input 
                          type="number" 
                          name="total_percent"
                          className="st-input"
                          value={displayItem.total_percent} 
                          onChange={handleFormChange}
                          step="0.01"
                        />
                      ) : (
                        <span style={{ color: '#2563eb', fontWeight: '800', fontSize: '0.95rem' }}>{displayItem.total_percent}%</span>
                      )}
                    </td>
                    
                    <td>
                      {isEditing ? (
                        <input type="number" name="cgst_percent" className="st-input" style={{ width: '70px' }} value={displayItem.cgst_percent} onChange={handleFormChange} />
                      ) : (
                        <span style={{ fontWeight: '600' }}>{displayItem.cgst_percent}%</span>
                      )}
                    </td>
                    
                    <td>
                      {isEditing ? (
                        <input type="number" name="sgst_percent" className="st-input" style={{ width: '70px' }} value={displayItem.sgst_percent} onChange={handleFormChange} />
                      ) : (
                        <span style={{ fontWeight: '600' }}>{displayItem.sgst_percent}%</span>
                      )}
                    </td>
                    
                    <td>
                      {isEditing ? (
                        <input type="number" name="igst_percent" className="st-input" style={{ width: '70px' }} value={displayItem.igst_percent} onChange={handleFormChange} />
                      ) : (
                        <span style={{ fontWeight: '600', color: displayItem.igst_percent > 0 ? '#0f172a' : '#94a3b8' }}>
                          {displayItem.igst_percent}%
                        </span>
                      )}
                    </td>
                    
                    <td>
                      {isEditing ? (
                        <select name="status" className="st-select" value={displayItem.status} onChange={handleFormChange}>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      ) : (
                        <span className={`st-badge ${displayItem.status === 'Active' ? 'active' : 'inactive'}`}>
                          {displayItem.status}
                        </span>
                      )}
                    </td>
                    
                    <td style={{ textAlign: 'center' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={handleSave} disabled={isSaving} className="btn btn-success">
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                          <button onClick={handleCancelEdit} className="btn btn-outline">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditClick(item)} className="btn btn-primary">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
