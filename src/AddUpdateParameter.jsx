import React, { useState, useEffect } from 'react';
import './ManageRelationship.css';
import { DotLottiePlayer } from '@lottiefiles/dotlottie-react';
const Edit2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const Trash2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const Plus = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const Search = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const ShieldAlert = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const CheckCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Clock = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

const AddUpdateParameter = ({ viewType, onNavigate }) => {
    const [parameters, setParameters] = useState([]);
    const [formData, setFormData] = useState({ param_name: '', param_value: '', description: '', status: 'Active' });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

    useEffect(() => {
        fetchParameters();
    }, [viewType]);

    const fetchParameters = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/parameters?type=${encodeURIComponent(viewType)}`, {
                headers: { Authorization: `Bearer ${getAuthToken() || ''}` }
            });
            if (!response.ok) throw new Error('Failed to load parameters');
            const data = await response.json();
            setParameters(data);
        } catch (error) {
            console.error('Error fetching parameters:', error);
            setMessage({ type: 'error', text: 'Failed to load parameters.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const config = {
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken() || ''}` 
                },
                body: JSON.stringify({ ...formData, param_type: viewType })
            };

            let response;
            if (isEditing) {
                response = await fetch(`/api/parameters/${editId}`, { ...config, method: 'PUT' });
            } else {
                response = await fetch('/api/parameters', { ...config, method: 'POST' });
            }
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to save');

            setMessage({ type: 'success', text: `${viewType} ${isEditing ? 'updated' : 'added'} successfully!` });
            
            setFormData({ param_name: '', param_value: '', description: '', status: 'Active' });
            setIsEditing(false);
            setEditId(null);
            fetchParameters();
        } catch (error) {
            console.error('Error saving parameter:', error);
            setMessage({ type: 'error', text: error.message || `Failed to save ${viewType}.` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (param) => {
        setFormData({ 
            param_name: param.param_name || '', 
            param_value: param.param_value || '', 
            description: param.description || '',
            status: param.status || 'Active'
        });
        setIsEditing(true);
        setEditId(param.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this parameter?')) return;
        
        setIsLoading(true);
        try {
            const response = await fetch(`/api/parameters/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getAuthToken() || ''}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to delete');
            setMessage({ type: 'success', text: 'Parameter deleted successfully!' });
            fetchParameters();
        } catch (error) {
            console.error('Error deleting parameter:', error);
            setMessage({ type: 'error', text: 'Failed to delete parameter.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({ param_name: '', param_value: '', description: '', status: 'Active' });
        setIsEditing(false);
        setEditId(null);
        setMessage(null);
    };

    const filteredParameters = parameters.filter(param => {
        const name = (param.param_name || '').toLowerCase();
        const desc = (param.description || '').toLowerCase();
        const value = (param.param_value || '').toLowerCase();
        const query = searchTerm.toLowerCase();
        return name.includes(query) || desc.includes(query) || value.includes(query);
    });

    return (
        <div className="relationship-page">
            <div className="relationship-shell">
                {message && (
                    <div className={`alert-banner ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        {message.type === 'success' ? <CheckCircle className="icon-sm" /> : <ShieldAlert className="icon-sm" />}
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="relationship-grid">
                    <section className="card-surface form-card">
                        <div className="card-accent" />
                        <div className="card-head">
                            <div>
                                <h2>{isEditing ? `Edit ${viewType}` : `Add ${viewType}`}</h2>
                            </div>
                            <div className="card-badge">
                                <Plus className="icon-sm" />
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="relationship-form">
                            <label className="field-group">
                                <span>Parameter Name <strong>*</strong></span>
                                <input
                                    type="text"
                                    name="param_name"
                                    value={formData.param_name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter parameter name"
                                />
                            </label>

                            <label className="field-group">
                                <span>Parameter Value</span>
                                <input
                                    type="text"
                                    name="param_value"
                                    value={formData.param_value}
                                    onChange={handleInputChange}
                                    placeholder="Enter value (optional)"
                                />
                            </label>

                            <label className="field-group">
                                <span>Description / Notes</span>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter details..."
                                    rows="3"
                                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                                />
                            </label>

                            <label className="field-group">
                                <span>Status</span>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </label>

                            <div className="action-row">
                                <button type="submit" disabled={isLoading} className="primary-button">
                                    {isLoading ? <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "-4px 0" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> : <CheckCircle className="icon-sm" />}
                                    {isEditing ? 'Update' : 'Save'}
                                </button>
                                {isEditing && (
                                    <button type="button" className="secondary-button" onClick={handleCancel}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>

                    <section className="card-surface table-card">
                        <div className="card-head table-head">
                            <div>
                                <h2>{viewType} List</h2>
                            </div>

                            <div className="search-wrap">
                                <Search className="icon-sm search-icon" />
                                <input
                                    type="text"
                                    placeholder={`Search ${viewType}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="table-scroll">
                            <table className="relationship-table">
                                <thead>
                                    <tr>
                                        <th>S.N.</th>
                                        <th>Parameter Name</th>
                                        <th>Value</th>
                                        <th>Status</th>
                                        <th className="center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && parameters.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="empty-cell">
                                                <Clock className="icon-md spin" />
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : filteredParameters.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="empty-cell">
                                                <div className="empty-state">
                                                    <div className="empty-state__title">No records found</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredParameters.map((param, idx) => (
                                            <tr key={param.id}>
                                                <td className="serial-cell">{idx + 1}</td>
                                                <td className="code-cell">{param.param_name}</td>
                                                <td className="desc-cell">{param.param_value || '-'}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold',
                                                        backgroundColor: param.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                                        color: param.status === 'Active' ? '#166534' : '#991b1b'
                                                    }}>
                                                        {param.status}
                                                    </span>
                                                </td>
                                                <td className="action-cell">
                                                    <div className="row-actions">
                                                        <button type="button" onClick={() => handleEdit(param)} className="icon-button icon-button--blue" title="Edit">
                                                            <Edit2 className="icon-sm" />
                                                        </button>
                                                        <button type="button" onClick={() => handleDelete(param.id)} className="icon-button icon-button--red" title="Delete">
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

export default AddUpdateParameter;
