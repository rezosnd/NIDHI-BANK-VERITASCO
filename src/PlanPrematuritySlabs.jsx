import React, { useEffect, useState } from 'react';
import './ShareParameters.css';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';

const Shield = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const CheckCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Clock = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const Trash2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

const PlanPrematuritySlabs = () => {
  const [plans, setPlans] = useState([]);
  const [slabs, setSlabs] = useState([]);
  
  const [depositType, setDepositType] = useState('0');
  const [selectedPlanId, setSelectedPlanId] = useState('0');
  
  const [newSlab, setNewSlab] = useState({ from_period: '', to_period: '', deduction_rate: '' });
  
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
      const settingsRes = await fetch('/api/settings', { headers: { Authorization: `Bearer ${token || ''}` } });

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        // --- TEMPORARY DATABASE WIPE ---
        try {
          await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
            body: JSON.stringify({ plan_parameters: [], prematurity_slabs: [] })
          });
        } catch (e) {
          console.error('Wipe failed', e);
        }
        setPlans([]);
        setSlabs([]);
        // -------------------------------
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepositTypeChange = (e) => {
    setDepositType(e.target.value);
    setSelectedPlanId('0'); // Reset plan when deposit type changes
    setMessage(null);
  };

  const handleAddSlab = async (e) => {
    e.preventDefault();
    
    if (selectedPlanId === '0') {
      setMessage({ type: 'error', text: 'Please select a plan first.' });
      return;
    }
    
    if (!newSlab.from_period || !newSlab.to_period || !newSlab.deduction_rate) {
      setMessage({ type: 'error', text: 'All slab fields are required.' });
      return;
    }

    if (parseInt(newSlab.from_period) >= parseInt(newSlab.to_period)) {
      setMessage({ type: 'error', text: 'To Period must be greater than From Period.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      const token = getAuthToken();
      const newId = slabs.length > 0 ? Math.max(...slabs.map(s => s.id)) + 1 : 1;
      
      const slabToAdd = {
        id: newId,
        plan_id: parseInt(selectedPlanId),
        from_period: parseInt(newSlab.from_period),
        to_period: parseInt(newSlab.to_period),
        deduction_rate: parseFloat(newSlab.deduction_rate),
        created_at: new Date().toISOString()
      };
      
      const updatedSlabs = [...slabs, slabToAdd];
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ prematurity_slabs: updatedSlabs })
      });
      
      if (!response.ok) throw new Error('Failed to update slabs');
      
      setMessage({ type: 'success', text: 'Prematurity slab added successfully.' });
      setNewSlab({ from_period: '', to_period: '', deduction_rate: '' });
      setSlabs(updatedSlabs);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save slab.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlab = async (slabId) => {
    if (!window.confirm("Are you sure you want to delete this slab?")) return;
    
    setIsSaving(true);
    setMessage(null);
    try {
      const token = getAuthToken();
      const updatedSlabs = slabs.filter(s => s.id !== slabId);
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ prematurity_slabs: updatedSlabs })
      });
      
      if (!response.ok) throw new Error('Failed to update slabs');
      
      setMessage({ type: 'success', text: 'Slab deleted successfully.' });
      setSlabs(updatedSlabs);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to delete slab.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter plans based on selected deposit type
  const filteredPlans = plans.filter(p => p.plan_type === depositType);
  
  // Filter slabs for the currently selected plan
  const currentPlanSlabs = slabs
    .filter(s => s.plan_id === parseInt(selectedPlanId))
    .sort((a, b) => a.from_period - b.from_period);

  return (
    <div className="share-parameters-page" style={{ paddingBottom: '40px' }}>
      <div className="share-parameters-shell" style={{ maxWidth: '900px' }}>
        
        {message && (
          <div className={`share-message ${message.type === 'success' ? 'share-message--success' : 'share-message--error'}`}>
            {message.type === 'success' ? <CheckCircle className="icon-sm" /> : <Shield className="icon-sm" />}
            <span>{message.text}</span>
          </div>
        )}

        <section className="share-parameters-card share-panel" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Add Pre Maturity Slabs</h2>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Select Plan to Manage Slabs</span>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label className="share-field" style={{ flex: 1, minWidth: '300px', marginBottom: 0 }}>
              <span style={{ fontWeight: 'bold' }}>Search by deposit type :</span>
              <select value={depositType} onChange={handleDepositTypeChange} style={{ marginBottom: 0 }}>
                <option value="0">Select Deposit Type</option>
                <option value="Pigmy">Pigmy</option>
                <option value="RD">RD</option>
                <option value="FD">FD</option>
                <option value="MIS">MIS</option>
              </select>
            </label>

            <label className="share-field" style={{ flex: 1, minWidth: '300px', marginBottom: 0 }}>
              <span style={{ fontWeight: 'bold' }}>Search by Plan Type :</span>
              <select 
                value={selectedPlanId} 
                onChange={(e) => { setSelectedPlanId(e.target.value); setMessage(null); }}
                disabled={depositType === '0'}
                style={{ marginBottom: 0 }}
              >
                <option value="0">Select Plan Name</option>
                {filteredPlans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.plan_name} ({plan.plan_code})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {selectedPlanId !== '0' && (
          <div className="share-layout" style={{ flexDirection: 'column' }}>
            <section className="share-parameters-card share-panel">
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', color: '#1e293b' }}>
                Create New Slab
              </h3>
              <form onSubmit={handleAddSlab} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <label className="share-field" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                  <span style={{ fontSize: '13px' }}>From Period (Months) <span style={{ color: 'red' }}>*</span></span>
                  <input 
                    type="text" 
                    value={newSlab.from_period} 
                    onChange={(e) => setNewSlab({...newSlab, from_period: e.target.value.replace(/[^0-9]/g, '')})} 
                    placeholder="e.g. 0"
                    style={{ marginBottom: 0 }}
                  />
                </label>
                
                <label className="share-field" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                  <span style={{ fontSize: '13px' }}>To Period (Months) <span style={{ color: 'red' }}>*</span></span>
                  <input 
                    type="text" 
                    value={newSlab.to_period} 
                    onChange={(e) => setNewSlab({...newSlab, to_period: e.target.value.replace(/[^0-9]/g, '')})} 
                    placeholder="e.g. 12"
                    style={{ marginBottom: 0 }}
                  />
                </label>

                <label className="share-field" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                  <span style={{ fontSize: '13px' }}>Deduction Rate (%) <span style={{ color: 'red' }}>*</span></span>
                  <input 
                    type="text" 
                    value={newSlab.deduction_rate} 
                    onChange={(e) => setNewSlab({...newSlab, deduction_rate: e.target.value.replace(/[^0-9.]/g, '')})} 
                    placeholder="e.g. 2.5"
                    style={{ marginBottom: 0 }}
                  />
                </label>

                <button type="submit" className="share-button" disabled={isSaving} style={{ marginBottom: 0, height: '42px', padding: '0 20px' }}>
                  {isSaving ? <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "-4px 0" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> : <CheckCircle className="icon-sm" />}
                  Add Slab
                </button>
              </form>
            </section>

            <section className="share-parameters-card share-panel share-history-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Existing Slabs</h3>
              </div>
              <div className="share-table-wrap share-table-wrap--history">
                <table className="share-table share-table--history">
                  <thead>
                    <tr>
                      <th>From Period</th>
                      <th>To Period</th>
                      <th className="right">Deduction Rate (%)</th>
                      <th style={{ textAlign: 'center', width: '80px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPlanSlabs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="share-empty">No slabs configured for this plan.</td>
                      </tr>
                    ) : (
                      currentPlanSlabs.map(slab => (
                        <tr key={slab.id}>
                          <td>{slab.from_period} Months</td>
                          <td>{slab.to_period} Months</td>
                          <td className="right strong" style={{ color: '#e11d48' }}>{Number(slab.deduction_rate).toFixed(2)}%</td>
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              onClick={() => handleDeleteSlab(slab.id)}
                              style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                color: '#ef4444', 
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                              title="Delete Slab"
                            >
                              <Trash2 style={{ width: '18px', height: '18px' }} />
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
        )}
        
      </div>
    </div>
  );
};

export default PlanPrematuritySlabs;
