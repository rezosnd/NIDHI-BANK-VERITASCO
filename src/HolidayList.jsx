import React, { useEffect, useState } from 'react';
import './ShareParameters.css';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';

const Shield = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const CheckCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Clock = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const Plus = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const Trash = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const SearchIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;

const STATIC_BRANCHES = [
  { id: '5', name: 'PATNA' },
  { id: '1', name: 'Namma Bengaluru' },
  { id: '4', name: 'HINGALGANJ SERVICE CENTER' },
  { id: '2', name: 'CHENNAI' },
  { id: '3', name: 'Kolkata-Shyambazar' }
];

const HolidayList = () => {
  const [holidays, setHolidays] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('0');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    name: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/settings', { headers: { Authorization: `Bearer ${token || ''}` } });

      if (res.ok) {
        const data = await res.json();
        if (data.holidays && Array.isArray(data.holidays)) {
          setHolidays(data.holidays);
        } else {
          setHolidays([]); // strictly dynamic
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
    setMessage(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (selectedBranch === '0') return setMessage({ type: 'error', text: 'Select a Branch first.' });
    if (!formData.date) return setMessage({ type: 'error', text: 'Holiday Date is required.' });
    if (!formData.name) return setMessage({ type: 'error', text: 'Holiday Name is required.' });

    setIsSaving(true);
    setMessage(null);
    try {
      const token = getAuthToken();
      let updatedHolidays = [...holidays];
      
      const newId = holidays.length > 0 ? Math.max(...holidays.map(h => h.id)) + 1 : 1;
      updatedHolidays.push({ 
        id: newId, 
        branch_id: selectedBranch,
        date: formData.date,
        name: formData.name,
        created_at: new Date().toISOString() 
      });
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ holidays: updatedHolidays })
      });
      
      if (!response.ok) throw new Error('Failed to update holidays');
      
      setMessage({ type: 'success', text: `Holiday added successfully for the selected branch.` });
      setFormData({ date: '', name: '' });
      setShowAddForm(false);
      setHolidays(updatedHolidays);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save holiday.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    
    try {
      const token = getAuthToken();
      const updatedHolidays = holidays.filter(h => h.id !== id);
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ holidays: updatedHolidays })
      });
      
      if (!response.ok) throw new Error('Failed to update holidays');
      setHolidays(updatedHolidays);
      setMessage({ type: 'success', text: 'Holiday removed successfully.' });
    } catch(err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to delete holiday.' });
    }
  };

  const filteredHolidays = selectedBranch === '0' 
    ? [] 
    : holidays
        .filter(h => h.branch_id === selectedBranch)
        .filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(h => {
          if (!dateFilter.from && !dateFilter.to) return true;
          const hDate = new Date(h.date);
          if (dateFilter.from && new Date(dateFilter.from) > hDate) return false;
          if (dateFilter.to && new Date(dateFilter.to) < hDate) return false;
          return true;
        })
        .sort((a,b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="share-parameters-page" style={{ paddingBottom: '40px' }}>
      <div className="share-parameters-shell" style={{ maxWidth: '1000px' }}>
        
        {message && (
          <div className={`share-message ${message.type === 'success' ? 'share-message--success' : 'share-message--error'}`}>
            {message.type === 'success' ? <CheckCircle className="icon-sm" /> : <Shield className="icon-sm" />}
            <span>{message.text}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>
          
          {/* Header & Branch Selection */}
          <section className="share-parameters-card share-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Manage Holiday List</h2>
              {selectedBranch !== '0' && (
                <button 
                  type="button" 
                  className="share-button share-button--secondary" 
                  onClick={() => setShowAddForm(!showAddForm)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus className="icon-sm" />
                  {showAddForm ? 'Cancel' : 'Add Holiday'}
                </button>
              )}
            </div>
            
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <label className="share-field" style={{ marginBottom: 0, width: '100%', maxWidth: '400px' }}>
                <span style={{ fontWeight: 'bold' }}>Select Branch:</span>
                <select name="branch" value={selectedBranch} onChange={handleBranchChange} style={{ marginBottom: 0 }}>
                  <option value="0">Select Branch</option>
                  {STATIC_BRANCHES.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {/* Inline Add Form */}
          {showAddForm && selectedBranch !== '0' && (
            <section className="share-parameters-card share-panel" style={{ borderLeft: '4px solid #10b981' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Add New Holiday</h3>
              <form onSubmit={handleSave} style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
                <label className="share-field" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Holiday Date <span style={{ color: 'red' }}>*</span></span>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} style={{ marginBottom: 0 }} />
                </label>
                <label className="share-field" style={{ flex: 2, minWidth: '250px', marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Holiday Name/Occasion <span style={{ color: 'red' }}>*</span></span>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Independence Day" style={{ marginBottom: 0 }} />
                </label>
                <button type="submit" className="share-button" disabled={isSaving} style={{ height: '42px' }}>
                  {isSaving ? <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "-4px 0" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> : 'Save Holiday'}
                </button>
              </form>
            </section>
          )}

          {/* Table & Filters */}
          <section className="share-parameters-card share-panel share-history-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b', whiteSpace: 'nowrap' }}>
                {selectedBranch === '0' ? 'Please select a branch to view holidays' : `Holidays for ${STATIC_BRANCHES.find(b => b.id === selectedBranch)?.name}`}
              </h3>
              
              {selectedBranch !== '0' && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <SearchIcon className="icon-sm" style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      placeholder="Quick search..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: '34px', width: '200px', margin: 0, border: '1px solid #cbd5e1', borderRadius: '4px', height: '36px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '0 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>From:</span>
                    <input type="date" value={dateFilter.from} onChange={e => setDateFilter(p => ({...p, from: e.target.value}))} style={{ margin: 0, border: 'none', background: 'transparent', padding: '0', height: '34px' }} />
                    <span style={{ fontSize: '12px', color: '#64748b' }}>To:</span>
                    <input type="date" value={dateFilter.to} onChange={e => setDateFilter(p => ({...p, to: e.target.value}))} style={{ margin: 0, border: 'none', background: 'transparent', padding: '0', height: '34px' }} />
                  </div>
                </div>
              )}
            </div>
            
            <div className="share-table-wrap share-table-wrap--history">
              <table className="share-table share-table--history">
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>S.N.</th>
                    <th style={{ width: '150px' }}>Date</th>
                    <th>Holiday Name</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBranch === '0' ? (
                    <tr>
                      <td colSpan="4" className="share-empty" style={{ padding: '40px', color: '#94a3b8' }}>
                        No branch selected
                      </td>
                    </tr>
                  ) : filteredHolidays.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="share-empty" style={{ padding: '40px', color: '#94a3b8' }}>
                        No holidays configured for this branch.
                      </td>
                    </tr>
                  ) : (
                    filteredHolidays.map((h, index) => (
                      <tr key={h.id}>
                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ fontWeight: '500' }}>{new Date(h.date).toLocaleDateString()}</td>
                        <td>{h.name}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            type="button" 
                            onClick={() => handleDelete(h.id)}
                            style={{ 
                              background: 'none', border: 'none', color: '#ef4444', 
                              cursor: 'pointer', padding: '4px', borderRadius: '4px' 
                            }}
                            title="Delete Holiday"
                          >
                            <Trash className="icon-sm" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default HolidayList;
