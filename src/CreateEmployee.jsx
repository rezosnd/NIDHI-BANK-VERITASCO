import React, { useState, useEffect } from 'react';
import './DesignationMaster.css';

const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

const INDIAN_STATES = [
    'Andaman & Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chandigarh', 'Chattisgarh', 'Dadra & Nagar Haveli', 'Daman & Diu', 'Delhi', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Karnataka', 'Kerala',
    'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Orissa', 'Pondicherry/Puducherry', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttaranchal/Uttarakhand', 'West Bengal'
];

export default function CreateEmployee() {
    const [designations, setDesignations] = useState([]);
    const [branches, setBranches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const [formData, setFormData] = useState({
        role: '',
        branch_id: '',
        state: '',
        contact_name: '',
        dob: '',
        blood_group: '',
        mobile_no: '',
        phone_no: '',
        email: '',
        address: '',
        pin_code: '',
        username: '',
        password: '',
        confirm_password: ''
    });

    useEffect(() => {
        const token = getAuthToken();
        const headers = { Authorization: `Bearer ${token || ''}` };

        Promise.all([
            fetch('/api/designations', { headers }).then(r => r.ok ? r.json() : []),
            fetch('/api/branches', { headers }).then(r => r.ok ? r.json() : [])
        ])
            .then(([desigData, branchData]) => {
                setDesignations(Array.isArray(desigData) ? desigData : []);
                setBranches(Array.isArray(branchData) ? branchData : []);
            })
            .catch(() => setMessage({ type: 'error', text: 'Failed to load initial data.' }))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        if (message?.type === 'success') {
            const t = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(t);
        }
    }, [message]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'username' ? value.toLowerCase().replace(/\s/g, '') : value
        }));
    };

    const validateForm = () => {
        if (!formData.role) return 'Please select a Designation.';
        if (!formData.branch_id) return 'Please select a Branch.';
        if (!formData.state) return 'Please select a State.';
        if (!formData.contact_name) return 'Please enter Contact Name.';
        if (!formData.mobile_no) return 'Please enter Mobile No.';
        if (!formData.username) return 'Please enter Username.';
        if (formData.username.length < 8 || formData.username.length > 15) return 'Username must be between 8 and 15 characters.';
        if (!formData.password) return 'Please enter Password.';
        
        const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;
        if (!pwdRegex.test(formData.password)) {
            return 'Password must be min 8 characters with at least 1 Alphabet, 1 Number, and 1 Special Character.';
        }
        
        if (formData.password !== formData.confirm_password) return 'Passwords do not match.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const error = validateForm();
        if (error) {
            setMessage({ type: 'error', text: error });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            const token = getAuthToken();
            const res = await fetch('/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token || ''}`
                },
                body: JSON.stringify({
                    ...formData,
                    // Send role name instead of ID for the users table
                    role: designations.find(d => String(d.id) === formData.role)?.name || formData.role
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: `Employee ${formData.contact_name} created successfully!` });
                setFormData({
                    role: '', branch_id: '', state: '', contact_name: '', dob: '', blood_group: '',
                    mobile_no: '', phone_no: '', email: '', address: '', pin_code: '',
                    username: '', password: '', confirm_password: ''
                });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to create employee.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setIsSaving(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="designation-master fade-in">
            <header className="module-header">
                <div className="header-icon" style={{ background: 'linear-gradient(135deg, #4338ca, #3730a3)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                </div>
                <div>
                    <h1>Create Employee</h1>
                </div>
            </header>

            {message && (
                <div className={`status-banner ${message.type === 'success' ? 'status-success' : 'status-error'}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {message.type === 'success'
                            ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
                            : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                        }
                    </svg>
                    <span>{message.text}</span>
                    <button className="close-banner-btn" onClick={() => setMessage(null)} type="button">×</button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="card-surface" style={{ marginBottom: '32px' }}>
                <div className="card-accent" style={{ background: 'linear-gradient(135deg, #4338ca, #3730a3)' }}></div>
                <div className="card-head">
                    <h2>Employee Information</h2>
                </div>
                <div className="designation-form">
                    <div className="form-grid">
                        
                        <label className="field-group">
                            <span>Designation <strong style={{ color: '#ef4444' }}>*</strong></span>
                            <select name="role" value={formData.role} onChange={handleChange} disabled={isLoading}>
                                <option value="">Select Designation</option>
                                {designations.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </label>

                        <label className="field-group">
                            <span>Branch Name <strong style={{ color: '#ef4444' }}>*</strong></span>
                            <select name="branch_id" value={formData.branch_id} onChange={handleChange} disabled={isLoading}>
                                <option value="">Select Branch</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </label>

                        <label className="field-group">
                            <span>State <strong style={{ color: '#ef4444' }}>*</strong></span>
                            <select name="state" value={formData.state} onChange={handleChange}>
                                <option value="">Select state</option>
                                {INDIAN_STATES.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </label>

                        <label className="field-group">
                            <span>Contact Name <strong style={{ color: '#ef4444' }}>*</strong></span>
                            <input type="text" name="contact_name" value={formData.contact_name} onChange={handleChange} placeholder="Full Name" />
                        </label>

                        <label className="field-group">
                            <span>Date of Birth</span>
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                        </label>

                        <label className="field-group">
                            <span>Blood Group</span>
                            <select name="blood_group" value={formData.blood_group} onChange={handleChange}>
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </label>

                        <label className="field-group">
                            <span>Mobile No <strong style={{ color: '#ef4444' }}>*</strong></span>
                            <input type="tel" name="mobile_no" value={formData.mobile_no} onChange={handleChange} maxLength="10" placeholder="10-digit mobile" />
                        </label>

                        <label className="field-group">
                            <span>Phone No</span>
                            <input type="tel" name="phone_no" value={formData.phone_no} onChange={handleChange} maxLength="15" placeholder="Optional phone" />
                        </label>

                        <label className="field-group">
                            <span>Email</span>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@domain.com" />
                        </label>

                        <label className="field-group">
                            <span>Pin Code</span>
                            <input type="text" name="pin_code" value={formData.pin_code} onChange={handleChange} maxLength="6" placeholder="6-digit pin" />
                        </label>
                    </div>

                    <label className="field-group" style={{ marginTop: '16px', display: 'block' }}>
                        <span>Address</span>
                        <textarea name="address" value={formData.address} onChange={handleChange} rows="2" placeholder="Full residential address" style={{ width: '100%', resize: 'vertical' }}></textarea>
                    </label>
                </div>

                <div className="card-head" style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                    <h2>Login Details</h2>
                </div>
                <div className="designation-form">
                    <div className="form-grid">
                        <label className="field-group">
                            <span>User Name <strong style={{ color: '#ef4444' }}>*</strong></span>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="8-15 characters (auto lowercase)" />
                        </label>

                        <label className="field-group">
                            <span>Password <strong style={{ color: '#ef4444' }}>*</strong></span>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min 8 chars, 1 number, 1 special char" />
                        </label>

                        <label className="field-group">
                            <span>Confirm Password <strong style={{ color: '#ef4444' }}>*</strong></span>
                            <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} placeholder="Re-enter password" />
                        </label>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button type="submit" disabled={isSaving} className="primary-button" style={{ background: 'linear-gradient(135deg, #4338ca, #3730a3)' }}>
                            {isSaving ? 'Creating...' : 'Create Employee'}
                        </button>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            <strong style={{ color: '#ef4444' }}>Note*:</strong> Username cannot be changed later. Password is case sensitive.
                        </span>
                    </div>
                </div>
            </form>
        </div>
    );
}
