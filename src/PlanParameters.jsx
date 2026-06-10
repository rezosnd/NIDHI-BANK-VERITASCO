import React, { useEffect, useState } from 'react';
import './ShareParameters.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Shield = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const CheckCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Clock = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

const INITIAL_FORM_STATE = {
  plan_type: '',
  plan_name: '',
  plan_code: '',
  plan_duration: '0',
  plan_duration_type: '',
  plan_roi: '',
  agent_commission: '0.00',
  compounding: '',
  min_deposit_amount: '',
  min_period_months: '',
  sr_citizen_roi: ''
};

const PlanParameters = () => {
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async ({ clearMessage = true } = {}) => {
    setIsLoading(true);
    if (clearMessage) setMessage(null);
    try {
      const token = getAuthToken();
      const settingsRes = await fetch('/api/settings', { headers: { Authorization: `Bearer ${token || ''}` } });

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.plan_parameters && Array.isArray(data.plan_parameters)) {
          setPlans(data.plan_parameters);
        }
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      setMessage({ type: 'error', text: 'Failed to load Plan Parameters.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidation = () => {
    if (!formData.plan_type) return 'Select deposit type';
    if (!formData.plan_name.trim()) return 'Plan name is required';
    if (!formData.plan_code.trim()) return 'Plan Code is required';
    if (!formData.plan_duration || formData.plan_duration === '0') return 'Enter period duration';
    if (!formData.plan_duration_type) return 'Select duration type';
    if (!formData.plan_roi.trim()) return 'Enter ROI';
    if (!formData.agent_commission.trim()) return 'Enter Agent Commission';
    if (!formData.compounding) return 'Select Compounding';
    if (!formData.min_deposit_amount.trim()) return 'Enter Minimum Deposit Amount';
    if (!formData.min_period_months.trim()) return 'Enter Minimum Period';
    if (!formData.sr_citizen_roi.trim()) return 'Enter Senior Citizen rate';
    
    if (formData.plan_type === 'Pigmy' || formData.plan_type === 'PIGMYWITHDRAW') {
      const duration = parseFloat(formData.plan_duration);
      if (formData.plan_duration_type === 'Days' && duration > 730) {
        return 'Pigmy plan duration not more than 2 years or 730 days';
      }
      if (formData.plan_duration_type === 'Years' && duration > 2) {
        return 'Pigmy plan duration not more than 2 years';
      }
    }
    
    return null;
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    
    const errorMsg = handleValidation();
    if (errorMsg) {
      setMessage({ type: 'error', text: errorMsg });
      return;
    }
    
    setIsSaving(true);
    setMessage(null);
    try {
      const token = getAuthToken();
      
      const newId = plans.length > 0 ? Math.max(...plans.map(p => p.id)) + 1 : 1;
      const newPlan = { id: newId, ...formData, created_at: new Date().toISOString() };
      const updatedPlans = [...plans, newPlan];
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ plan_parameters: updatedPlans })
      });
      if (!response.ok) throw new Error('Failed to update plans');
      
      setMessage({ type: 'success', text: 'Plan Parameter added successfully.' });
      setFormData(INITIAL_FORM_STATE);
      setPlans(updatedPlans);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save Plan Parameter.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="share-parameters-page" style={{ paddingBottom: '40px' }}>
      <div className="share-parameters-shell">
        {message && (
          <div className={`share-message ${message.type === 'success' ? 'share-message--success' : 'share-message--error'}`}>
            {message.type === 'success' ? <CheckCircle className="icon-sm" /> : <Shield className="icon-sm" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="share-layout">
          <section className="share-parameters-card share-panel" style={{ flexBasis: '450px', flexGrow: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Plan Parameter's</h2>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Add New Plan</span>
            </div>
            
            <form onSubmit={handleSave} className="share-form">
              <label className="share-field">
                <span>Select Plan <span style={{ color: 'red' }}>*</span></span>
                <select value={formData.plan_type} onChange={(e) => handleChange('plan_type', e.target.value)}>
                  <option value="">Select Deposit Type</option>
                  <option value="Pigmy">Pigmy</option>
                  <option value="RD">RD</option>
                  <option value="FD">FD</option>
                  <option value="MIS">MIS</option>
                  <option value="PIGMYWITHDRAW">PIGMY WITHDRAW</option>
                </select>
              </label>

              <label className="share-field">
                <span>Plan Name <span style={{ color: 'red' }}>*</span></span>
                <input type="text" maxLength="50" value={formData.plan_name} onChange={(e) => handleChange('plan_name', e.target.value)} />
              </label>

              <label className="share-field">
                <span>Plan Code <span style={{ color: 'red' }}>*</span></span>
                <input type="text" maxLength="50" value={formData.plan_code} onChange={(e) => handleChange('plan_code', e.target.value)} />
              </label>

              <div className="share-field" style={{ flexDirection: 'row', alignItems: 'center' }}>
                <span style={{ minWidth: '160px', fontWeight: '600', color: '#1e293b' }}>Plan Duration <span style={{ color: 'red' }}>*</span></span>
                <div style={{ display: 'flex', gap: '8px', flexGrow: 1 }}>
                  <input 
                    type="text" 
                    maxLength="6" 
                    value={formData.plan_duration} 
                    onChange={(e) => handleChange('plan_duration', e.target.value.replace(/[^0-9]/g, ''))} 
                    style={{ width: '80px', marginBottom: 0 }} 
                  />
                  <select 
                    value={formData.plan_duration_type} 
                    onChange={(e) => handleChange('plan_duration_type', e.target.value)}
                    style={{ flexGrow: 1, marginBottom: 0 }}
                  >
                    <option value="">Select Duration</option>
                    <option value="Days">Days</option>
                    <option value="Months">Months</option>
                    <option value="Years">Years</option>
                  </select>
                </div>
              </div>

              <div className="share-field" style={{ flexDirection: 'row', alignItems: 'center' }}>
                <span style={{ minWidth: '160px', fontWeight: '600', color: '#1e293b' }}>Rate of Interest <span style={{ color: 'red' }}>*</span></span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
                  <input type="text" maxLength="6" value={formData.plan_roi} onChange={(e) => handleChange('plan_roi', e.target.value)} style={{ marginBottom: 0, width: '100px' }} />
                  <span style={{ fontWeight: 'bold' }}>%</span>
                </div>
              </div>

              <div className="share-field" style={{ flexDirection: 'row', alignItems: 'center' }}>
                <span style={{ minWidth: '160px', fontWeight: '600', color: '#1e293b' }}>Agent Commission <span style={{ color: 'red' }}>*</span></span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
                  <input type="text" maxLength="6" value={formData.agent_commission} onChange={(e) => handleChange('agent_commission', e.target.value)} style={{ marginBottom: 0, width: '100px' }} />
                  <span style={{ fontWeight: 'bold' }}>%</span>
                </div>
              </div>

              <label className="share-field">
                <span>Compounding <span style={{ color: 'red' }}>*</span></span>
                <select value={formData.compounding} onChange={(e) => handleChange('compounding', e.target.value)}>
                  <option value="">Select Period</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Half Yearly">Half Yearly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="At Maturity">At Maturity</option>
                </select>
              </label>

              <label className="share-field">
                <span>Min Deposit Amount <span style={{ color: 'red' }}>*</span></span>
                <input type="text" maxLength="8" value={formData.min_deposit_amount} onChange={(e) => handleChange('min_deposit_amount', e.target.value.replace(/[^0-9.]/g, ''))} />
              </label>

              <div className="share-field" style={{ flexDirection: 'row', alignItems: 'center' }}>
                <span style={{ minWidth: '160px', fontWeight: '600', color: '#1e293b' }}>Minimum Period <span style={{ color: 'red' }}>*</span></span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
                  <input type="text" maxLength="8" value={formData.min_period_months} onChange={(e) => handleChange('min_period_months', e.target.value.replace(/[^0-9]/g, ''))} style={{ marginBottom: 0, width: '100px' }} />
                  <span style={{ fontSize: '13px', color: '#64748b' }}>(In Months)</span>
                </div>
              </div>

              <div className="share-field" style={{ flexDirection: 'row', alignItems: 'center' }}>
                <span style={{ minWidth: '160px', fontWeight: '600', color: '#1e293b' }}>Sr. Citizen Int. Rate <span style={{ color: 'red' }}>*</span></span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
                  <input type="text" maxLength="6" value={formData.sr_citizen_roi} onChange={(e) => handleChange('sr_citizen_roi', e.target.value)} style={{ marginBottom: 0, width: '100px' }} />
                  <span style={{ fontWeight: 'bold' }}>%</span>
                </div>
              </div>

              <div className="share-actions-row" style={{ marginTop: '20px' }}>
                <button type="submit" className="share-button" disabled={isSaving}>
                  {isSaving ? <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "-4px 0" }}><DotLottieReact src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> : <CheckCircle className="icon-sm" />}
                  Add Plan
                </button>
              </div>
            </form>
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
            <div className="share-parameters-card share-panel share-history-card" style={{ flexGrow: 1, overflow: 'hidden' }}>
              <h2>View Plan Types</h2>
              <div className="share-table-wrap share-table-wrap--history" style={{ maxHeight: '100%', overflowX: 'auto' }}>
                <table className="share-table share-table--history" style={{ minWidth: '1000px' }}>
                  <thead>
                    <tr>
                      <th>Plan Type</th>
                      <th>Plan Name</th>
                      <th>Code</th>
                      <th className="right">Duration</th>
                      <th className="right">ROI (%)</th>
                      <th className="right">Comm (%)</th>
                      <th>Compounding</th>
                      <th className="right">Min Deposit</th>
                      <th className="right">Sr. Citizen (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && plans.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="share-empty">
                          <span className="share-loading"><Clock className="icon-sm share-spin" /> Loading...</span>
                        </td>
                      </tr>
                    ) : plans.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="share-empty">No plans have been configured yet.</td>
                      </tr>
                    ) : (
                      plans.map(plan => (
                        <tr key={plan.id}>
                          <td className="strong">{plan.plan_type}</td>
                          <td>{plan.plan_name}</td>
                          <td className="muted">{plan.plan_code}</td>
                          <td className="right">{plan.plan_duration} {plan.plan_duration_type}</td>
                          <td className="right">{Number(plan.plan_roi).toFixed(2)}</td>
                          <td className="right">{Number(plan.agent_commission).toFixed(2)}</td>
                          <td>{plan.compounding}</td>
                          <td className="right">₹{Number(plan.min_deposit_amount).toFixed(2)}</td>
                          <td className="right">{Number(plan.sr_citizen_roi).toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanParameters;
