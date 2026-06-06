import React, { useState, useEffect } from 'react';
import './ManageServiceTax.css';

export default function ManageDistricts({ view }) {
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [isCreating, setIsCreating] = useState(view === 'Create District');
  const [newDistrictName, setNewDistrictName] = useState('');
  const [newStateId, setNewStateId] = useState('');
  const [newStatus, setNewStatus] = useState('Active');
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    fetchStates();
    fetchDistricts();
    if (view === 'Create District') {
      setIsCreating(true);
    } else {
      setIsCreating(false);
    }
  }, [view]);

  const fetchStates = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/states', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStates(data);
        if (data.length > 0 && !newStateId) {
          setNewStateId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load states', e);
    }
  };

  const fetchDistricts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/districts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDistricts(data);
      }
    } catch (e) {
      console.error('Failed to load districts', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
    setIsCreating(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newDistrictName.trim() || !newStateId) {
      setSaveMessage('District name and State are required.');
      return;
    }
    
    setIsSaving(true);
    setSaveMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/districts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ district_name: newDistrictName, state_id: newStateId, status: newStatus })
      });
      
      const data = await res.json();
      if (res.ok) {
        setSaveMessage('Added successfully!');
        setNewDistrictName('');
        setNewStatus('Active');
        setIsCreating(false);
        fetchDistricts();
        setTimeout(() => setSaveMessage(''), 4000);
      } else {
        setSaveMessage(data.error || 'Failed to add.');
      }
    } catch (e) {
      setSaveMessage('An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editForm || !editForm.district_name.trim()) return;
    
    setIsSaving(true);
    setSaveMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/districts/${editForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      
      const data = await res.json();
      if (res.ok) {
        setSaveMessage('Updated successfully!');
        setEditingId(null);
        fetchDistricts(); 
        setTimeout(() => setSaveMessage(''), 4000);
      } else {
        setSaveMessage(data.error || 'Failed to update.');
      }
    } catch (e) {
      setSaveMessage('An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    setSaveMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/districts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setSaveMessage('Deleted successfully!');
        fetchDistricts();
        setTimeout(() => setSaveMessage(''), 4000);
      } else {
        setSaveMessage('Failed to delete.');
      }
    } catch (e) {
      setSaveMessage('An error occurred.');
    }
  };

  const getStateName = (stateId) => {
    const state = states.find(s => s.id === parseInt(stateId) || s.id === stateId);
    return state ? state.state_name : 'Unknown State';
  };

  return (
    <div className="service-tax-wrapper">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => { setIsCreating(!isCreating); setEditingId(null); }}
        >
          {isCreating ? 'View All Records' : '+ Add New Record'}
        </button>
      </div>

      {saveMessage && (
        <div className={`st-alert ${saveMessage.includes('Failed') || saveMessage.includes('required') || saveMessage.includes('exists') || saveMessage.includes('error') ? 'error' : 'success'}`}>
          {saveMessage}
        </div>
      )}

      {isCreating ? (
        <div className="st-card" style={{ padding: '16px', maxWidth: '500px' }}>
          <h2 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '16px', color: '#0f172a' }}>Add New District</h2>
          <form onSubmit={handleCreateSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>State / UT</label>
              <select 
                className="st-select" 
                style={{ width: '100%' }}
                value={newStateId}
                onChange={(e) => setNewStateId(e.target.value)}
                required
              >
                <option value="">-- Select State --</option>
                {states.map(s => (
                  <option key={s.id} value={s.id}>{s.state_name}</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>District Name</label>
              <input 
                type="text" 
                className="st-input" 
                style={{ width: '100%' }}
                placeholder="e.g. Pune"
                value={newDistrictName}
                onChange={(e) => setNewDistrictName(e.target.value)}
                required
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>Status</label>
              <select 
                className="st-select" 
                style={{ width: '100%', maxWidth: '200px' }}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success" disabled={isSaving}>
              {isSaving ? 'Adding...' : 'Save Record'}
            </button>
          </form>
        </div>
      ) : (
        <div className="st-card">
          <table className="st-table">
            <thead>
              <tr>
                <th>Sl. No.</th>
                <th>District Name</th>
                <th>State / UT</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>Loading records...</td>
                </tr>
              ) : districts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>No records found.</td>
                </tr>
              ) : (
                districts.map((item, index) => {
                  const isEditing = editingId === item.id;
                  const displayItem = isEditing ? editForm : item;
                  
                  return (
                    <tr key={item.id} className={isEditing ? 'editing' : ''}>
                      <td style={{ fontWeight: '600', color: '#64748b', width: '60px' }}>{index + 1}</td>
                      
                      <td>
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="st-input"
                            style={{ width: '200px' }}
                            value={displayItem.district_name} 
                            onChange={(e) => setEditForm({...editForm, district_name: e.target.value})}
                          />
                        ) : (
                          <span style={{ fontWeight: '600', color: '#0f172a' }}>{displayItem.district_name}</span>
                        )}
                      </td>
                      
                      <td>
                        {isEditing ? (
                          <select 
                            className="st-select" 
                            style={{ width: '180px' }}
                            value={displayItem.state_id} 
                            onChange={(e) => setEditForm({...editForm, state_id: e.target.value})}
                          >
                            {states.map(s => (
                              <option key={s.id} value={s.id}>{s.state_name}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ color: '#334155' }}>{getStateName(displayItem.state_id)}</span>
                        )}
                      </td>
                      
                      <td>
                        {isEditing ? (
                          <select 
                            className="st-select" 
                            value={displayItem.status} 
                            onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        ) : (
                          <span className={`st-badge ${displayItem.status === 'Active' ? 'active' : 'inactive'}`}>
                            {displayItem.status}
                          </span>
                        )}
                      </td>
                      
                      <td style={{ textAlign: 'center', width: '160px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button onClick={handleUpdate} disabled={isSaving} className="btn btn-success">
                              {isSaving ? 'Saving' : 'Save'}
                            </button>
                            <button onClick={handleCancelEdit} className="btn btn-outline">Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button onClick={() => handleEditClick(item)} className="btn btn-primary" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
                              Edit
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-outline" style={{ padding: '2px 6px', fontSize: '0.7rem', color: '#ef4444', borderColor: '#fca5a5' }}>
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
