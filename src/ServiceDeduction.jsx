import React, { useEffect, useState } from 'react';
import './ShareParameters.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Shield = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const CheckCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Clock = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const Edit2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const Trash2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

const defaultChargeCategories = [
  { label: 'BANK CHARGES', options: [{value: '2', label: 'NEFT'}, {value: '3', label: 'RTGS'}, {value: '4', label: 'IMPS'}, {value: '20', label: 'UPI'}] },
  { label: 'CHARGES', options: [{value: '15', label: 'DEBIT CARD'}, {value: '16', label: 'CREDIT CARD'}, {value: '17', label: 'NETBANKING'}, {value: '18', label: 'NEFT / RTGS/ UPI'}, {value: '19', label: 'WALLETS'}] },
  { label: 'LOAN', options: [{value: '9', label: 'DOCUMENT CHARGES'}, {value: '10', label: 'OTHER CHARGES'}, {value: '11', label: 'LEGAL CHARGES'}, {value: '24', label: 'LETTER CHARGES'}, {value: '25', label: 'EMI COLLECTION'}, {value: '26', label: 'SMS CHARGE'}, {value: '27', label: 'EMI BOUNCE CHARGES'}, {value: '28', label: 'PENAL CHARGES'}, {value: '29', label: 'CHARGES'}] },
  { label: 'OTHER CHARGES', options: [{value: '6', label: 'SMS  CHARGES'}, {value: '7', label: 'SB MAINTENANCE CHARGES'}, {value: '23', label: 'SB MISCELLANEOUS CHARGES'}] },
  { label: 'PENAL CHARGES', options: [{value: '30', label: 'OTHER'}] }
];



const ServiceDeduction = () => {
  const [deductions, setDeductions] = useState([]);
  const [chargeCategories, setChargeCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const getChargeLabel = (val) => {
    for (let cat of chargeCategories) {
      if (cat.options) {
        const opt = cat.options.find(o => o.value === String(val));
        if (opt) return opt.label;
      }
    }
    return val;
  };
  
  const [formData, setFormData] = useState({
    charges_type: '0',
    slab_type: '1',
    min_amount: '0',
    max_amount: '0',
    service_charge_type: '1',
    service_charge_value: '0',
    gst_percent: '0',
    gst_applicable: false,
    igst_applicable: false,
    gst_apply_type: '1',
    customer_charge: '0',
    service_center_charge: '0',
    grace_period_days: '0',
    description: '',
    is_active: true
  });
  
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
        if (data.service_deductions && Array.isArray(data.service_deductions)) {
          setDeductions(data.service_deductions);
        }

        let categories = data.service_charge_categories || [];
        setChargeCategories(categories);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setMessage(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (formData.charges_type === '0') return setMessage({ type: 'error', text: 'Select Charges Type' });
    if (formData.slab_type === '1' && Number(formData.max_amount) <= Number(formData.min_amount)) {
      return setMessage({ type: 'error', text: 'Max amount should be greater than Min amount' });
    }

    setIsSaving(true);
    setMessage(null);
    try {
      const token = getAuthToken();
      let updatedDeductions = [...deductions];
      
      if (isEditing) {
        updatedDeductions = updatedDeductions.map(d => 
          d.id === editId ? { ...formData, id: editId, updated_at: new Date().toISOString() } : d
        );
      } else {
        const newId = deductions.length > 0 ? Math.max(...deductions.map(d => d.id)) + 1 : 1;
        updatedDeductions.push({ ...formData, id: newId, created_at: new Date().toISOString() });
      }
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ service_deductions: updatedDeductions })
      });
      
      if (!response.ok) throw new Error('Failed to update service deductions');
      
      setMessage({ type: 'success', text: `Service charge ${isEditing ? 'updated' : 'added'} successfully.` });
      handleCancel();
      setDeductions(updatedDeductions);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save parameter.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMessage(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service charge?')) return;
    
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const updatedDeductions = deductions.filter(d => d.id !== id);
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ service_deductions: updatedDeductions })
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      setDeductions(updatedDeductions);
      setMessage({ type: 'success', text: 'Service charge deleted successfully.' });
      if (isEditing && editId === id) handleCancel();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to delete parameter.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      charges_type: '0',
      slab_type: '1',
      min_amount: '0',
      max_amount: '0',
      service_charge_type: '1',
      service_charge_value: '0',
      gst_percent: '0',
      gst_applicable: false,
      igst_applicable: false,
      gst_apply_type: '1',
      customer_charge: '0',
      service_center_charge: '0',
      grace_period_days: '0',
      description: '',
      is_active: true
    });
    setIsEditing(false);
    setEditId(null);
  };

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
          <section className="share-parameters-card share-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>ADD/VIEW SERVICE CHARGES</h2>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Group 1: Basic Config */}
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <label className="share-field" style={{ flex: '1 1 300px', marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold' }}>Select Charges : <span style={{ color: 'red' }}>*</span></span>
                  <select name="charges_type" value={formData.charges_type} onChange={handleInputChange} style={{ marginBottom: 0 }}>
                    <option value="0">Select Type</option>
                    {chargeCategories && chargeCategories.length > 0 ? chargeCategories.map(cat => (
                      <optgroup key={cat.label} label={cat.label}>
                        {cat.options && cat.options.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </optgroup>
                    )) : (
                      <option disabled>Loading...</option>
                    )}
                  </select>
                </label>

                <div className="share-field" style={{ flex: '1 1 300px', marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold' }}>Slab Type: <span style={{ color: 'red' }}>*</span></span>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                      <input type="radio" name="slab_type" value="0" checked={formData.slab_type === '0'} onChange={handleInputChange} />
                      Without Slab
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                      <input type="radio" name="slab_type" value="1" checked={formData.slab_type === '1'} onChange={handleInputChange} />
                      With Slab
                    </label>
                  </div>
                </div>
              </div>

              {/* Group 2: Slab Amounts */}
              <div style={{ backgroundColor: formData.slab_type === '0' ? '#f1f5f9' : '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '20px', opacity: formData.slab_type === '0' ? 0.6 : 1, transition: 'all 0.3s ease' }}>
                <label className="share-field" style={{ flex: 1, marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold' }}>MIN Amount : <span style={{ color: 'red' }}>*</span></span>
                  <input type="number" name="min_amount" value={formData.min_amount} onChange={handleInputChange} disabled={formData.slab_type === '0'} style={{ marginBottom: 0 }} />
                </label>
                <label className="share-field" style={{ flex: 1, marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold' }}>MAX Amount : <span style={{ color: 'red' }}>*</span></span>
                  <input type="number" name="max_amount" value={formData.max_amount} onChange={handleInputChange} disabled={formData.slab_type === '0'} style={{ marginBottom: 0 }} />
                </label>
              </div>

              {/* Group 3: Service Charges Details */}
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <label className="share-field" style={{ flex: '1 1 120px', marginBottom: 0 }}>
                    <span style={{ fontWeight: 'bold' }}>Service Charges: <span style={{ color: 'red' }}>*</span></span>
                    <select name="service_charge_type" value={formData.service_charge_type} onChange={handleInputChange} style={{ marginBottom: 0 }}>
                      <option value="1">Amount</option>
                      <option value="2">Percent</option>
                    </select>
                  </label>
                  
                  <label className="share-field" style={{ flex: '1 1 120px', marginBottom: 0 }}>
                    <span style={{ fontWeight: 'bold' }}>Value: <span style={{ color: 'red' }}>*</span></span>
                    <input type="number" name="service_charge_value" value={formData.service_charge_value} onChange={handleInputChange} style={{ marginBottom: 0 }} />
                  </label>
                  
                  <label className="share-field" style={{ flex: '1 1 120px', marginBottom: 0 }}>
                    <span style={{ fontWeight: 'bold' }}>GST (%):</span>
                    <input type="number" name="gst_percent" value={formData.gst_percent} onChange={handleInputChange} style={{ marginBottom: 0 }} />
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                    <input type="checkbox" name="gst_applicable" checked={formData.gst_applicable} onChange={handleInputChange} />
                    GST Applicable
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                    <input type="checkbox" name="igst_applicable" checked={formData.igst_applicable} onChange={handleInputChange} />
                    IGST Applicable
                  </label>
                  <div style={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1' }}></div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                    <input type="radio" name="gst_apply_type" value="1" checked={formData.gst_apply_type === '1'} onChange={handleInputChange} />
                    Excluding GST
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                    <input type="radio" name="gst_apply_type" value="0" checked={formData.gst_apply_type === '0'} onChange={handleInputChange} />
                    Including GST
                  </label>
                </div>
              </div>

              {/* Group 4: Additional Config */}
              <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <label className="share-field" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold' }}>Service Charges For Customer: <span style={{ color: 'red' }}>*</span></span>
                  <input type="number" name="customer_charge" value={formData.customer_charge} onChange={handleInputChange} style={{ marginBottom: 0 }} />
                </label>
                <label className="share-field" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold' }}>For Service Center:</span>
                  <input type="number" name="service_center_charge" value={formData.service_center_charge} onChange={handleInputChange} style={{ marginBottom: 0 }} />
                </label>
                <label className="share-field" style={{ flex: '1 1 150px', marginBottom: 0 }}>
                  <span style={{ fontWeight: 'bold' }}>Grace Period (Days):</span>
                  <input type="number" name="grace_period_days" value={formData.grace_period_days} onChange={handleInputChange} style={{ marginBottom: 0 }} />
                </label>
                
                <label className="share-field" style={{ flex: '1 1 100%' }}>
                  <span style={{ fontWeight: 'bold' }}>Description:</span>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" style={{ resize: 'vertical' }} />
                </label>

                <div className="share-field" style={{ flex: '1 1 100%', marginBottom: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#0f172a' }}>
                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} style={{ width: '18px', height: '18px' }} />
                    Active Status
                  </label>
                </div>
              </div>

              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="share-button" disabled={isSaving}>
                  {isSaving ? <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "-4px 0" }}><DotLottieReact src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> : <CheckCircle className="icon-sm" />}
                  {isEditing ? 'Update' : 'Add'}
                </button>
                {isEditing && (
                  <button type="button" className="share-button" style={{ backgroundColor: '#64748b' }} onClick={handleCancel}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="share-parameters-card share-panel share-history-card">
            <div className="share-table-wrap share-table-wrap--history">
              <table className="share-table share-table--history">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>S.N.</th>
                    <th>TYPE</th>
                    <th>Transaction Slab</th>
                    <th>Charges</th>
                    <th className="center" style={{ width: '100px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deductions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="share-empty">No service charges defined.</td>
                    </tr>
                  ) : (
                    deductions.map((d, index) => (
                      <tr key={d.id}>
                        <td>{index + 1}</td>
                        <td style={{ fontWeight: 'bold' }}>{getChargeLabel(d.charges_type)}</td>
                        <td>
                          {d.slab_type === '1' ? 
                            `Above ${Number(d.min_amount).toFixed(2)} to ${Number(d.max_amount).toFixed(2)}` : 
                            'Without Slab'}
                        </td>
                        <td>
                          {Number(d.service_charge_value).toFixed(2)} {d.service_charge_type === '2' ? '%' : ''} 
                          {d.gst_applicable && ` + GST(${Number(d.gst_percent).toFixed(2)}%)`}
                          {!d.is_active && <span style={{ color: 'red', marginLeft: '10px', fontSize: '0.8rem' }}>(Inactive)</span>}
                        </td>
                        <td className="center">
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button type="button" onClick={() => handleEdit(d)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}>
                              <Edit2 className="icon-sm" />
                            </button>
                            <button type="button" onClick={() => handleDelete(d.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                              <Trash2 className="icon-sm" />
                            </button>
                          </div>
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

export default ServiceDeduction;
