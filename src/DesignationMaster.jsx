import React, { useState, useEffect, useMemo, useRef } from 'react';
import './DesignationMaster.css';
import { DotLottiePlayer } from '@lottiefiles/dotlottie-react';

const Edit2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const Trash2 = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const CheckCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const ShieldAlert = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const Printer = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;

const CHART_COLORS = ['#1e40af', '#cbd5e1', '#0ea5e9', '#f97316', '#ea580c', '#3b82f6', '#94a3b8', '#f59e0b', '#fca5a5', '#64748b', '#fde047', '#1e3a8a', '#d1d5db', '#0284c7', '#dc2626', '#fcd34d', '#3b82f6'];

// Helper to build a nested tree structure from flat array
const buildTree = (items, parentId = null) => {
    return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
            ...item,
            children: buildTree(items, item.id)
        }));
};

const ReportTableRow = ({ node, level = 0 }) => {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = node.children && node.children.length > 0;
    
    return (
        <React.Fragment>
            <tr className="report-table-row">
                <td className="report-node-cell" style={{ paddingLeft: `${level * 24 + 12}px` }}>
                    {hasChildren ? (
                        <span className="expand-btn" onClick={() => setExpanded(!expanded)}>
                            {expanded ? '-' : '+'}
                        </span>
                    ) : (
                        <span className="expand-placeholder"></span>
                    )}
                    <span className="node-name">{node.name}</span>
                </td>
                <td className="center-col">{node.no_of_employee || 0}</td>
                <td className="level-col">{level === 0 ? 'Company' : `Level ${level}`}</td>
            </tr>
            {expanded && hasChildren && node.children.map(child => (
                <ReportTableRow key={child.id} node={child} level={level + 1} />
            ))}
        </React.Fragment>
    );
};

const DesignationMaster = ({ initialTab = 'manage' }) => {
    const [designations, setDesignations] = useState([]);
    const [companyProfile, setCompanyProfile] = useState({});
    const [formData, setFormData] = useState({ name: '', parent_id: '', status: 'Active', no_of_employee: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState(initialTab); // 'manage' or 'tree'
    const printRef = useRef(null);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleFind = () => {
        if (!searchQuery) return;
        window.find(searchQuery);
    };

    const handleFindNext = () => {
        if (!searchQuery) return;
        // window.find parameters: aString, aCaseSensitive, aBackwards, aWrapAround, aWholeWord, aSearchInFrames, aShowDialog
        window.find(searchQuery, false, false, true, false, true, false);
    };

    const totalEmployees = designations.reduce((sum, d) => sum + (parseInt(d.no_of_employee) || 0), 0);

    const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = getAuthToken();
            const [desigRes, compRes] = await Promise.all([
                fetch('/api/designations', { headers: { Authorization: `Bearer ${token || ''}` } }),
                fetch('/api/profile', { headers: { Authorization: `Bearer ${token || ''}` } })
            ]);

            let fetchedDesignations = [];
            let fetchedCompany = {};

            if (desigRes.ok) {
                fetchedDesignations = await desigRes.json();
            }
            if (compRes.ok) {
                const cData = await compRes.json();
                fetchedCompany = cData.profile || {};
            }

            setDesignations(fetchedDesignations);
            setCompanyProfile(fetchedCompany);

        } catch (error) {
            console.error('Error fetching data:', error);
            setMessage({ type: 'error', text: 'Failed to load designations.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab !== 'tree') return;
        
        let isMounted = true;
        
        const drawChart = () => {
            if (!isMounted || !window.google || !window.google.visualization || designations.length === 0) return;
            
            // Draw OrgChart
            try {
                const data = new window.google.visualization.DataTable();
                data.addColumn('string', 'Entity');
                data.addColumn('string', 'ParentEntity');
                data.addColumn('string', 'ToolTip');
                
                const allIds = new Set(designations.map(d => d.id.toString()));
                
                designations.forEach(d => {
                    const memberId = d.id.toString();
                    const memberName = d.name;
                    let parentId = d.parent_id ? d.parent_id.toString() : '';
                    
                    // Prevent Google OrgChart crash by making orphaned nodes top-level
                    if (parentId && !allIds.has(parentId)) {
                        parentId = '';
                    }
                    
                    data.addRow([{ v: memberId, f: memberName + '' }, parentId, memberName]);
                });
                
                const chartElement = document.getElementById('google_chart_div');
                if (chartElement && window.google.visualization.OrgChart) {
                    const chart = new window.google.visualization.OrgChart(chartElement);
                    chart.draw(data, { allowHtml: true, allowCollapse: true });
                }
            } catch (err) {
                console.error("Error drawing Google OrgChart:", err);
            }

            // Draw ColumnChart
            try {
                if (window.google.visualization.ColumnChart) {
                    const barData = new window.google.visualization.DataTable();
                    barData.addColumn('string', 'Designation Name');
                    barData.addColumn('number', 'No of Employees');
                    barData.addColumn({ type: 'string', role: 'annotation' });
                    barData.addColumn({ type: 'string', role: 'style' });
                    
                    designations.forEach((d, i) => {
                        const count = parseInt(d.no_of_employee) || 0;
                        const color = CHART_COLORS[i % CHART_COLORS.length];
                        barData.addRow([d.name, count, count.toString(), color]);
                    });

                    const barElement = document.getElementById('google_column_chart_div');
                    if (barElement) {
                        const barChart = new window.google.visualization.ColumnChart(barElement);
                        barChart.draw(barData, {
                            legend: { position: 'none' },
                            vAxis: { 
                                title: 'No of E...', 
                                titleTextStyle: { color: '#84cc16', bold: true, italic: false },
                                viewWindow: { min: 0 }
                            },
                            hAxis: { 
                                title: 'Designation Name', 
                                titleTextStyle: { color: '#059669', bold: true, italic: false },
                                textStyle: { bold: true, fontSize: 11 }
                            },
                            height: 350,
                            bar: { groupWidth: '60%' },
                            annotations: {
                                textStyle: { fontSize: 12, color: '#000' },
                                alwaysOutside: true
                            }
                        });
                    }
                }
            } catch (err) {
                console.error("Error drawing Google ColumnChart:", err);
            }
        };

        const loadGoogleCharts = () => {
            if (typeof window.google === 'undefined' || !window.google.charts) {
                const scriptId = 'google-charts-script';
                let script = document.getElementById(scriptId);
                
                if (!script) {
                    script = document.createElement('script');
                    script.id = scriptId;
                    script.src = 'https://www.gstatic.com/charts/loader.js';
                    document.head.appendChild(script);
                }
                
                const onScriptLoad = () => {
                    if (window.google && window.google.charts && isMounted) {
                        try {
                            window.google.charts.load('current', { packages: ['orgchart', 'corechart'] });
                        } catch (e) {
                            // Ignore duplicate load errors
                        }
                        window.google.charts.setOnLoadCallback(drawChart);
                    }
                };

                script.addEventListener('load', onScriptLoad);
                // If it was already loaded but callback didn't fire
                if (window.google && window.google.charts) onScriptLoad();
                
            } else if (window.google && window.google.visualization && window.google.visualization.OrgChart) {
                drawChart();
            } else if (window.google && window.google.charts) {
                try {
                    window.google.charts.load('current', { packages: ['orgchart', 'corechart'] });
                } catch (e) {}
                window.google.charts.setOnLoadCallback(drawChart);
            }
        };

        loadGoogleCharts();

        return () => {
            isMounted = false;
        };
    }, [designations, activeTab]);

    const treeData = useMemo(() => buildTree(designations), [designations]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = getAuthToken();
            const url = isEditing ? `/api/designations/${editId}` : '/api/designations';
            const method = isEditing ? 'PUT' : 'POST';
            
            const payload = {
                name: formData.name,
                parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
                status: formData.status,
                no_of_employee: parseInt(formData.no_of_employee) || 0
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token || ''}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok) {
                showMessage('success', isEditing ? 'Designation updated successfully' : 'Designation added successfully');
                fetchData();
                handleCancel();
            } else {
                showMessage('error', data.error || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving designation:', error);
            showMessage('error', 'Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (designation) => {
        setFormData({
            name: designation.name,
            parent_id: designation.parent_id || '',
            status: designation.status,
            no_of_employee: designation.no_of_employee || 0
        });
        setEditId(designation.id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this designation?')) return;
        setIsLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`/api/designations/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token || ''}` }
            });

            if (response.ok) {
                showMessage('success', 'Designation deleted successfully');
                fetchData();
            } else {
                const data = await response.json();
                showMessage('error', data.error || 'Failed to delete designation');
            }
        } catch (error) {
            console.error('Error deleting designation:', error);
            showMessage('error', 'Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', parent_id: '', status: 'Active', no_of_employee: 0 });
        setIsEditing(false);
        setEditId(null);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="designation-master">
            {/* Header section (hidden when printing) */}
            <div className="no-print">
                <div className="designation-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
                        onClick={() => setActiveTab('manage')}
                    >
                        Manage Designations
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'tree' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tree')}
                    >
                        Designation Tree View
                    </button>
                </div>

                {message && (
                    <div className={`alert-banner ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        {message.type === 'success' ? <CheckCircle className="icon-sm" /> : <ShieldAlert className="icon-sm" />}
                        <span>{message.text}</span>
                    </div>
                )}
            </div>

            {activeTab === 'manage' && (
                <div className="manage-section no-print">
                    <section className="card-surface form-card">
                        <div className="card-accent" />
                        <div className="card-head">
                            <h2>{isEditing ? 'Edit Designation' : 'Add Designation'}</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="designation-form">
                            <div className="form-grid">
                                <label className="field-group">
                                    <span>Designation Name <strong>*</strong></span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Branch Manager"
                                    />
                                </label>

                                <label className="field-group">
                                    <span>Parent Designation</span>
                                    <select
                                        name="parent_id"
                                        value={formData.parent_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">-- None (Top Level) --</option>
                                        {designations.filter(d => d.id !== editId).map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="field-group">
                                    <span>No. of Employees</span>
                                    <input
                                        type="number"
                                        name="no_of_employee"
                                        value={formData.no_of_employee}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                </label>

                                <label className="field-group">
                                    <span>Status</span>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </label>
                            </div>

                            <div className="action-row">
                                <button type="submit" disabled={isLoading} className="primary-button">
                                    {isLoading ? <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "-4px 0" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> : <CheckCircle className="icon-sm" />}
                                    {isEditing ? 'Update Designation' : 'Save Designation'}
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
                            <h2>Designation List</h2>
                        </div>

                        <div className="table-scroll">
                            <table className="designation-table">
                                <thead>
                                    <tr>
                                        <th>Sl. No.</th>
                                        <th>Designation Type Name</th>
                                        <th>Active Status</th>
                                        <th>Designation Name</th>
                                        <th className="center">EDIT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading && designations.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="empty-state">
                                                <div style={{ width: "24px", height: "24px", display: "inline-block" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop /></div> Loading...
                                            </td>
                                        </tr>
                                    ) : designations.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="empty-state">No designations found.</td>
                                        </tr>
                                    ) : (
                                        designations.map((item, index) => {
                                            const parent = designations.find(d => d.id === item.parent_id);
                                            return (
                                                <tr key={item.id}>
                                                    <td className="muted">{index + 1}</td>
                                                    <td>{parent ? parent.name : <span className="badge top-level">Top Level</span>}</td>
                                                    <td>
                                                        <span className={`status-badge ${item.status === 'Active' ? 'active' : 'inactive'}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="strong">{item.name}</td>
                                                    <td className="center actions-cell">
                                                        <button 
                                                            className="secondary-button" 
                                                            style={{ padding: '4px 12px', fontSize: '12px', minHeight: 'auto' }}
                                                            onClick={() => handleEdit(item)}
                                                        >
                                                            EDIT
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}

            {/* Tree View Section (Visible when printing or when Tree tab is active) */}
            <div className={`tree-section ${activeTab === 'tree' ? 'active' : 'hidden'}`}>
                <div className="report-viewer-container card-surface">
                    <div className="report-viewer-title" style={{fontWeight: 'bold', padding: '12px 16px', background: '#e2e8f0', color: '#0f172a', borderBottom: '1px solid #cbd5e1'}}>
                        Designation Master
                    </div>
                    {/* Mock Report Viewer Toolbar */}
                    <div className="report-toolbar no-print">
                        <div className="toolbar-left">
                            <button className="toolbar-btn disabled"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"/></svg> First Page</button>
                            <button className="toolbar-btn disabled"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg> Previous Page</button>
                            <span className="page-info">
                                <input type="text" value="1" readOnly className="page-input" />
                                <span>of 1</span>
                            </span>
                            <button className="toolbar-btn disabled">Next Page <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg></button>
                            <button className="toolbar-btn disabled">Last Page <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"/></svg></button>
                            <div className="toolbar-divider"></div>
                            <button className="toolbar-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg> Go back to the parent report</button>
                        </div>
                        <div className="toolbar-right">
                            <span className="search-group">
                                <input type="text" placeholder="Find" className="search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleFind()} />
                                <span className="search-link" onClick={handleFind}>Find</span> | <span className="search-link" onClick={handleFindNext}>Next</span>
                            </span>
                            <div className="toolbar-divider"></div>
                            <button className="toolbar-btn" onClick={fetchData}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg> Refresh</button>
                            <div className="toolbar-divider"></div>
                            <button className="toolbar-btn" onClick={handlePrint}><Printer className="icon-sm" /> Print</button>
                        </div>
                    </div>

                    <div className="report-content print-area" ref={printRef}>
                        <div className="report-header">
                            <h2 className="company-title">{companyProfile.company_name}</h2>
                            <div className="company-details">
                                <div><strong>REG. NO. :</strong> {companyProfile.cin_no}</div>
                                <div><strong>REG. OFFICE :</strong> {companyProfile.address_line1} {companyProfile.address_line2} {companyProfile.city} {companyProfile.state} &nbsp;&nbsp;&nbsp; <strong>WEBSITE :</strong>  &nbsp;&nbsp;&nbsp; <strong>EMAIL :</strong> {companyProfile.email} &nbsp;&nbsp;&nbsp; <strong>Contact :</strong> {companyProfile.mobile || companyProfile.landline}</div>
                            </div>
                            <h3 className="report-title">COMPANY DESIGNATION TREE STRUCTURE</h3>
                        </div>

                        <div className="report-table-wrapper">
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th>Designation</th>
                                        <th className="center-col">No of Employee</th>
                                        <th className="level-col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {treeData.length > 0 ? (
                                        treeData.map(node => <ReportTableRow key={node.id} node={node} level={0} />)
                                    ) : (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No designations found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="report-footer">
                                <strong>Total : {totalEmployees}</strong>
                            </div>
                        </div>

                        <div className="google-chart-container">
                            <div id="google_chart_div" className="google-chart-render-area"></div>
                        </div>

                        {/* Bar Chart Replication Section */}
                        <div className="bar-chart-container" style={{ border: '2px solid #22c55e', borderRadius: '4px', padding: '20px', marginTop: '30px', background: '#fff' }}>
                            <h3 style={{ textAlign: 'center', color: '#ef4444', fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0' }}>No Of Employee Designation Wise</h3>
                            <div style={{ textAlign: 'center', marginBottom: '16px', color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>Designation</div>
                            
                            <div className="custom-legend" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 24px', marginBottom: '30px', fontSize: '12px', color: '#334155' }}>
                                {designations.map((d, i) => (
                                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', width: '160px' }}>
                                        <span style={{ width: '20px', height: '10px', backgroundColor: CHART_COLORS[i % CHART_COLORS.length], marginRight: '8px', display: 'inline-block' }}></span>
                                        <span>{d.name} ({d.no_of_employee || 0})</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div id="google_column_chart_div" style={{ width: '100%', height: '350px' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignationMaster;
