import React, { useState, useEffect } from 'react';
import './ManageRelationship.css';
const Edit2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const Trash2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const Plus = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const Search = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const RefreshCw = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;
const LayoutGrid = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>;
const ShieldAlert = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const CheckCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Clock = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

const ManageRelationship = ({ onNavigate }) => {
    const [relationships, setRelationships] = useState([]);
    const [formData, setFormData] = useState({ code: '', description: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

    useEffect(() => {
        fetchRelationships();
    }, []);

    const fetchRelationships = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/relationships', {
                headers: { Authorization: `Bearer ${getAuthToken() || ''}` }
            });
            if (!response.ok) throw new Error('Failed to load');
            const data = await response.json();
            setRelationships(data);
        } catch (error) {
            console.error('Error fetching relationships:', error);
            setMessage({ type: 'error', text: 'Failed to load relationships.' });
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
                body: JSON.stringify(formData)
            };

            let response;
            if (isEditing) {
                response = await fetch(`/api/relationships/${editId}`, { ...config, method: 'PUT' });
            } else {
                response = await fetch('/api/relationships', { ...config, method: 'POST' });
            }
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to save');

            setMessage({ type: 'success', text: `Relationship ${isEditing ? 'updated' : 'added'} successfully!` });
            
            setFormData({ code: '', description: '' });
            setIsEditing(false);
            setEditId(null);
            fetchRelationships();
        } catch (error) {
            console.error('Error saving relationship:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to save relationship.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (rel) => {
        setFormData({ code: rel.code, description: rel.description });
        setIsEditing(true);
        setEditId(rel.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this relationship?')) return;
        
        setIsLoading(true);
        try {
            const response = await fetch(`/api/relationships/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getAuthToken() || ''}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to delete');
            setMessage({ type: 'success', text: 'Relationship deleted successfully!' });
            fetchRelationships();
        } catch (error) {
            console.error('Error deleting relationship:', error);
            setMessage({ type: 'error', text: 'Failed to delete relationship.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({ code: '', description: '' });
        setIsEditing(false);
        setEditId(null);
        setMessage(null);
    };

    const filteredRelationships = relationships.filter(rel => {
        const code = (rel.code || '').toLowerCase();
        const description = (rel.description || '').toLowerCase();
        const query = searchTerm.toLowerCase();
        return code.includes(query) || description.includes(query);
    });

    const handleGoBack = () => {
        if (onNavigate) {
            onNavigate('Dashboard');
        } else {
            window.history.back();
        }
    };

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
                                <h2>{isEditing ? 'Edit Relationship' : 'Add Relationship'}</h2>
                            </div>
                            <div className="card-badge">
                                <Plus className="icon-sm" />
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="relationship-form">
                            <label className="field-group">
                                <span>Relationship Code <strong>*</strong></span>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Mother"
                                />
                            </label>

                            <label className="field-group">
                                <span>Relationship Description <strong>*</strong></span>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Mother"
                                />
                            </label>

                            <div className="helper-box">Keep codes short and descriptive.</div>

                            <div className="action-row">
                                <button type="submit" disabled={isLoading} className="primary-button">
                                    {isLoading ? <Clock className="icon-sm spin" /> : <CheckCircle className="icon-sm" />}
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
                                <h2>Relationship List</h2>
                            </div>

                            <div className="search-wrap">
                                <Search className="icon-sm search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search relationships..."
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
                                        <th>Relationship Code</th>
                                        <th>Relationship</th>
                                        <th className="center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && relationships.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="empty-cell">
                                                <Clock className="icon-md spin" />
                                                Loading relationships...
                                            </td>
                                        </tr>
                                    ) : filteredRelationships.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="empty-cell">
                                                <div className="empty-state">
                                                    <div className="empty-state__title">No records found</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRelationships.map((rel, idx) => (
                                            <tr key={rel.id}>
                                                <td className="serial-cell">{idx + 1}</td>
                                                <td className="code-cell">{rel.code}</td>
                                                <td className="desc-cell">{rel.description}</td>
                                                <td className="action-cell">
                                                    <div className="row-actions">
                                                        <button type="button" onClick={() => handleEdit(rel)} className="icon-button icon-button--blue" title="Edit">
                                                            <Edit2 className="icon-sm" />
                                                        </button>
                                                        <button type="button" onClick={() => handleDelete(rel.id)} className="icon-button icon-button--red" title="Delete">
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

export default ManageRelationship;
