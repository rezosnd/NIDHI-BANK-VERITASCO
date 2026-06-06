import React, { useState, useEffect } from 'react';
import './ManageServiceTax.css';

export default function ManageStates({ view }) {
  const [states, setStates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [isCreating, setIsCreating] = useState(view === 'Create State');
  const [newStateName, setNewStateName] = useState('');
  const [newStateType, setNewStateType] = useState('State');
  const [newStateStatus, setNewStateStatus] = useState('Active');
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    fetchStates();
    if (view === 'Create State') {
      setIsCreating(true);
    } else {
      setIsCreating(false);
    }
  }, [view]);

  const fetchStates = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/states', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStates(data);
      }
    } catch (e) {
      console.error('Failed to load states', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item, type: item.type || 'State' });
    setIsCreating(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newStateName.trim()) {
      setSaveMessage('State name is required.');
      return;
    }
    
    setIsSaving(true);
    setSaveMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/states', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ state_name: newStateName, type: newStateType, status: newStateStatus })
      });
      
      const data = await res.json();
      if (res.ok) {
        setSaveMessage('Added successfully!');
        setNewStateName('');
        setNewStateType('State');
        setIsCreating(false);
        fetchStates();
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
    if (!editForm || !editForm.state_name.trim()) return;
    
    setIsSaving(true);
    setSaveMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/states/${editForm.id}`, {
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
        fetchStates(); 
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
      const res = await fetch(`/api/states/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setSaveMessage('Deleted successfully!');
        fetchStates();
        setTimeout(() => setSaveMessage(''), 4000);
      } else {
        setSaveMessage('Failed to delete.');
      }
    } catch (e) {
      setSaveMessage('An error occurred.');
    }
  };

  return (
    <div className="service-tax-wrapper">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => { setIsCreating(!isCreating); setEditingId(null); }}
        >
          {isCreating ? 'View All Records' : '+ Add New Record'}
        </button>
      </div>

      {saveMessage && (
        <div className={`st-alert ${saveMessage.includes('Failed') || saveMessage.includes('required') || saveMessage.includes('exists') || saveMessage.includes('error') ? 'error' : 'success'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {saveMessage.includes('Failed') || saveMessage.includes('required') || saveMessage.includes('exists') || saveMessage.includes('error') ? (
              <path d="M18 6L6 18M6 6l12 12"></path>
            ) : (
              <polyline points="20 6 9 17 4 12"></polyline>
            )}
          </svg>
          {saveMessage}
        </div>
      )}

      {isCreating ? (
        <div className="st-card" style={{ padding: '24px', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '1.2rem', marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>Add New State / UT</h2>
          <form onSubmit={handleCreateSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px', textTransform: 'uppercase' }}>Name</label>
              <input 
                type="text" 
                className="st-input" 
                style={{ width: '100%', maxWidth: '400px' }}
                placeholder="e.g. Maharashtra"
                value={newStateName}
                onChange={(e) => setNewStateName(e.target.value)}
                required
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px', textTransform: 'uppercase' }}>Type</label>
              <select 
                className="st-select" 
                style={{ width: '100%', maxWidth: '200px' }}
                value={newStateType}
                onChange={(e) => setNewStateType(e.target.value)}
              >
                <option value="State">State</option>
                <option value="Union Territory">Union Territory</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px', textTransform: 'uppercase' }}>Status</label>
              <select 
                className="st-select" 
                style={{ width: '100%', maxWidth: '200px' }}
                value={newStateStatus}
                onChange={(e) => setNewStateStatus(e.target.value)}
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
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>Loading records...</td>
                </tr>
              ) : states.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>No records found.</td>
                </tr>
              ) : (
                states.map((item, index) => {
                  const isEditing = editingId === item.id;
                  const displayItem = isEditing ? editForm : item;
                  const isUT = displayItem.type === 'Union Territory';
                  
                  return (
                    <tr key={item.id} className={isEditing ? 'editing' : ''}>
                      <td style={{ fontWeight: '700', color: '#64748b', width: '80px' }}>{index + 1}</td>
                      
                      <td>
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="st-input"
                            style={{ width: '200px' }}
                            value={displayItem.state_name} 
                            onChange={(e) => setEditForm({...editForm, state_name: e.target.value})}
                          />
                        ) : (
                          <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>{displayItem.state_name}</span>
                        )}
                      </td>
                      
                      <td>
                        {isEditing ? (
                          <select 
                            className="st-select" 
                            value={displayItem.type} 
                            onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                          >
                            <option value="State">State</option>
                            <option value="Union Territory">Union Territory</option>
                          </select>
                        ) : (
                          <span style={{ fontWeight: '500', color: '#334155', fontSize: '0.85rem' }}>
                            {displayItem.type || 'State'}
                          </span>
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
                      
                      <td style={{ textAlign: 'center', width: '180px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={handleUpdate} disabled={isSaving} className="btn btn-success">
                              {isSaving ? 'Saving' : 'Save'}
                            </button>
                            <button onClick={handleCancelEdit} className="btn btn-outline">Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => handleEditClick(item)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                              Edit
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.7rem', color: '#ef4444', borderColor: '#fca5a5' }}>
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
