import React, { useState, useEffect } from 'react';
import './ManageServiceTax.css';

export default function ManageNews({ view, user }) {
  const [newsList, setNewsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const isAdmin = user?.role === 'Admin';
  const [isCreating, setIsCreating] = useState(isAdmin && view === 'Create News');
  
  // Search state
  const [searchReceiver, setSearchReceiver] = useState('-1');
  const [searchStatus, setSearchStatus] = useState('-1');
  
  // Create/Edit form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    receiver: 'ALL',
    status: 'Active'
  });
  
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchNews();
    if (view === 'Create News' && isAdmin) {
      setIsCreating(true);
      setEditingId(null);
      resetForm();
    } else {
      setIsCreating(false);
    }
  }, [view, isAdmin]);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      receiver: 'ALL',
      status: 'Active'
    });
  };

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      if (searchReceiver !== '-1') params.append('receiver', searchReceiver);
      if (searchStatus !== '-1') params.append('status', searchStatus);
      
      const res = await fetch(`/api/news?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        let data = await res.json();
        // If it's a branch user, they only see 'Active' news for 'ALL' or 'Branch'
        if (!isAdmin) {
           data = data.filter(n => n.status === 'Active' && (n.receiver === 'ALL' || n.receiver === 'Branch'));
        }
        setNewsList(data);
      }
    } catch (e) {
      console.error('Failed to load news', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNews();
  };

  const handleEditClick = (item) => {
    if (!isAdmin) return;
    setEditingId(item.id);
    setFormData({
      title: item.title,
      content: item.content,
      receiver: item.receiver || 'ALL',
      status: item.status
    });
    setIsCreating(true); // Re-use the form area for editing
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
    setIsCreating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!formData.title.trim() || !formData.content.trim()) {
      setSaveMessage('Title and Content are required.');
      return;
    }
    
    setIsSaving(true);
    setSaveMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const url = editingId ? `/api/news/${editingId}` : '/api/news';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        setSaveMessage(editingId ? 'Updated successfully!' : 'Added successfully!');
        resetForm();
        setEditingId(null);
        setIsCreating(false);
        fetchNews();
        setTimeout(() => setSaveMessage(''), 4000);
      } else {
        setSaveMessage(data.error || 'Failed to save.');
      }
    } catch (e) {
      setSaveMessage('An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm('Are you sure you want to delete this news?')) return;
    
    setSaveMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setSaveMessage('Deleted successfully!');
        fetchNews();
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
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => { 
              setIsCreating(!isCreating); 
              if (!isCreating) {
                setEditingId(null);
                resetForm();
              }
            }}
          >
            {isCreating ? 'View All News' : '+ Add New News'}
          </button>
        </div>
      )}

      {saveMessage && (
        <div className={`st-alert ${saveMessage.includes('Failed') || saveMessage.includes('required') || saveMessage.includes('exists') || saveMessage.includes('error') ? 'error' : 'success'}`}>
          {saveMessage}
        </div>
      )}

      {isCreating && isAdmin ? (
        <div className="st-card" style={{ padding: '20px', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '20px', color: '#0f172a', textTransform: 'uppercase', borderBottom: '1px solid rgba(255, 255, 255, 0.4)', paddingBottom: '8px' }}>
            {editingId ? 'Edit News' : 'Create News'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>News Title</label>
                <input 
                  type="text" 
                  className="st-input" 
                  style={{ width: '100%' }}
                  placeholder="Enter news title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div style={{ width: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>Receivers</label>
                <select 
                  className="st-select" 
                  style={{ width: '100%' }}
                  value={formData.receiver}
                  onChange={(e) => setFormData({...formData, receiver: e.target.value})}
                >
                  <option value="ALL">ALL</option>
                  <option value="Outside">Outside</option>
                  <option value="Branch">Branch</option>
                  <option value="Service Center">Service Center</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
              <div style={{ width: '150px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>Status</label>
                <select 
                  className="st-select" 
                  style={{ width: '100%' }}
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Deactive">Deactive</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>News Content</label>
              <textarea 
                className="st-input" 
                style={{ width: '100%', minHeight: '150px', resize: 'vertical', padding: '12px' }}
                placeholder="Enter the news or announcement content here..."
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-success" disabled={isSaving}>
                {isSaving ? 'Saving...' : (editingId ? 'Update News' : 'Save News')}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline" onClick={handleCancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="st-card">
          {isAdmin && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.4)', backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
              <div style={{ width: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Active Status</label>
                <select className="st-select" style={{ width: '100%' }} value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)}>
                  <option value="-1">All</option>
                  <option value="1">Active</option>
                  <option value="0">Deactive</option>
                </select>
              </div>
              <div style={{ width: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Receivers</label>
                <select className="st-select" style={{ width: '100%' }} value={searchReceiver} onChange={(e) => setSearchReceiver(e.target.value)}>
                  <option value="-1">All</option>
                  <option value="Outside">Outside</option>
                  <option value="Branch">Branch</option>
                  <option value="Service Center">Service Center</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
              <div>
                <button className="btn btn-primary" onClick={handleSearch} style={{ height: '30px' }}>Search</button>
              </div>
            </div>
          )}
        
          <table className="st-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Sl No.</th>
                <th style={{ width: '100px' }}>Date</th>
                <th style={{ width: '25%' }}>Title</th>
                {isAdmin && <th style={{ width: '120px' }}>Receiver</th>}
                <th>News Content</th>
                {isAdmin && <th style={{ width: '80px' }}>Status</th>}
                {isAdmin && <th style={{ width: '120px', textAlign: 'center' }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 4} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>Loading records...</td>
                </tr>
              ) : newsList.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 4} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>No active news found.</td>
                </tr>
              ) : (
                newsList.map((item, index) => {
                  const dateObj = new Date(item.created_at);
                  const formattedDate = !isNaN(dateObj) ? dateObj.toLocaleDateString('en-GB') : '';
                  
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: '600', color: '#64748b' }}>{index + 1}</td>
                      <td style={{ fontSize: '0.75rem', color: '#475569' }}>{formattedDate}</td>
                      <td style={{ fontWeight: '600', color: '#0f172a' }}>{item.title}</td>
                      {isAdmin && <td style={{ fontSize: '0.75rem', color: '#334155' }}>{item.receiver || 'ALL'}</td>}
                      <td>
                        <div style={{ 
                          maxHeight: '40px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          display: '-webkit-box', 
                          WebkitLineClamp: 2, 
                          WebkitBoxOrient: 'vertical',
                          fontSize: '0.75rem',
                          color: '#475569',
                          lineHeight: '1.4'
                        }}>
                          {item.content}
                        </div>
                      </td>
                      {isAdmin && (
                        <td>
                          <span className={`st-badge ${item.status === 'Active' ? 'active' : 'inactive'}`}>
                            {item.status}
                          </span>
                        </td>
                      )}
                      {isAdmin && (
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button onClick={() => handleEditClick(item)} className="btn btn-primary" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
                              Edit
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-outline" style={{ padding: '2px 6px', fontSize: '0.7rem', color: '#ef4444', borderColor: '#fca5a5' }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
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
