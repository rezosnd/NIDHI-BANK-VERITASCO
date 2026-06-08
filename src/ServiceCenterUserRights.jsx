import React, { useState, useEffect } from 'react';
import './DesignationMaster.css';
import { SC_MENU_STRUCTURE, SC_MENU_ITEMS } from './ServiceCenterMenuList';
import { DotLottiePlayer } from '@dotlottie/react-player';

const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

export default function ServiceCenterUserRights() {
    const [branches, setBranches] = useState([]);
    const [serviceCenters, setServiceCenters] = useState([]);
    const [users, setUsers] = useState([]);

    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedServiceCenter, setSelectedServiceCenter] = useState('');
    const [selectedUser, setSelectedUser] = useState('');

    const [selectedMenus, setSelectedMenus] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isSCLoading, setIsSCLoading] = useState(false);
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [isRightsLoading, setIsRightsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Auto-dismiss success messages
    useEffect(() => {
        if (message?.type === 'success') {
            const t = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(t);
        }
    }, [message]);

    // Load branches on mount
    useEffect(() => {
        const token = getAuthToken();
        const headers = { Authorization: `Bearer ${token || ''}` };
        fetch('/api/branches', { headers })
            .then(r => r.ok ? r.json() : [])
            .then(data => setBranches(Array.isArray(data) ? data : []))
            .catch(() => setMessage({ type: 'error', text: 'Failed to load branches.' }))
            .finally(() => setIsLoading(false));
    }, []);

    // Load service centers when branch changes
    useEffect(() => {
        setServiceCenters([]);
        setSelectedServiceCenter('');
        setUsers([]);
        setSelectedUser('');
        setSelectedMenus(new Set());
        if (!selectedBranch) return;

        setIsSCLoading(true);
        const token = getAuthToken();
        fetch(`/api/service-centers?branch_id=${selectedBranch}`, {
            headers: { Authorization: `Bearer ${token || ''}` }
        })
            .then(r => r.ok ? r.json() : [])
            .then(data => setServiceCenters(Array.isArray(data) ? data : []))
            .catch(() => setMessage({ type: 'error', text: 'Failed to load service centers.' }))
            .finally(() => setIsSCLoading(false));
    }, [selectedBranch]);

    // Load users when service center changes
    useEffect(() => {
        setUsers([]);
        setSelectedUser('');
        setSelectedMenus(new Set());
        if (!selectedServiceCenter) return;

        setIsUsersLoading(true);
        const token = getAuthToken();
        fetch(`/api/sc-users?service_center_id=${selectedServiceCenter}`, {
            headers: { Authorization: `Bearer ${token || ''}` }
        })
            .then(r => r.ok ? r.json() : [])
            .then(data => setUsers(Array.isArray(data) ? data : []))
            .catch(() => setMessage({ type: 'error', text: 'Failed to load users.' }))
            .finally(() => setIsUsersLoading(false));
    }, [selectedServiceCenter]);

    // Load rights when user changes
    useEffect(() => {
        setSelectedMenus(new Set());
        if (!selectedUser) return;
        setIsRightsLoading(true);
        const token = getAuthToken();
        fetch(`/api/sc-user-rights/${selectedUser}`, {
            headers: { Authorization: `Bearer ${token || ''}` }
        })
            .then(r => r.ok ? r.json() : [])
            .then(data => setSelectedMenus(new Set(Array.isArray(data) ? data : [])))
            .catch(() => setMessage({ type: 'error', text: 'Failed to load user rights.' }))
            .finally(() => setIsRightsLoading(false));
    }, [selectedUser]);

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedMenus(new Set(SC_MENU_ITEMS));
        else setSelectedMenus(new Set());
    };

    const handleGroupToggle = (group, checked) => {
        const newSet = new Set(selectedMenus);
        group.items.forEach(item => checked ? newSet.add(item) : newSet.delete(item));
        setSelectedMenus(newSet);
    };

    const handleMenuCheckbox = (menuName, checked) => {
        const newSet = new Set(selectedMenus);
        checked ? newSet.add(menuName) : newSet.delete(menuName);
        setSelectedMenus(newSet);
    };

    const handleAssign = async () => {
        if (!selectedUser) {
            setMessage({ type: 'error', text: 'Please select a Service Center User first.' });
            return;
        }
        setIsSaving(true);
        setMessage(null);
        try {
            const token = getAuthToken();
            const res = await fetch(`/api/sc-user-rights/${selectedUser}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
                body: JSON.stringify({ menus: Array.from(selectedMenus) })
            });
            const data = await res.json();
            if (res.ok) {
                const userName = selectedUserObj?.contact_name || selectedUserObj?.username || 'User';
                setMessage({ type: 'success', text: `Rights assigned successfully to ${userName}!` });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to save rights.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const selectedUserObj = users.find(u => String(u.id) === String(selectedUser));
    const selectedSCObj = serviceCenters.find(sc => String(sc.id) === String(selectedServiceCenter));
    const totalSelected = selectedMenus.size;
    const totalMenus = SC_MENU_ITEMS.length;
    const allSelected = totalSelected === totalMenus && totalMenus > 0;

    // Completion percentage
    const pct = totalMenus > 0 ? Math.round((totalSelected / totalMenus) * 100) : 0;

    return (
        <div className="designation-master fade-in">

            {/* ─── Status Banner ─── */}
            {message && (
                <div className={`status-banner ${message.type === 'success' ? 'status-success' : 'status-error'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {message.type === 'success'
                            ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
                            : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                        }
                    </svg>
                    <span>{message.text}</span>
                    <button className="close-banner-btn" onClick={() => setMessage(null)}>×</button>
                </div>
            )}

            {/* ─── Selection Card ─── */}
            <section className="card-surface" style={{ marginBottom: '24px' }}>
                <div className="card-accent" style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)' }}></div>
                <div className="card-head">
                    <h2>Select Service Center User</h2>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                        Branch → Service Center → User
                    </span>
                </div>
                <div className="designation-form">
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', alignItems: 'flex-end' }}>

                        {/* Branch */}
                        <label className="field-group">
                            <span>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5, verticalAlign: 'middle', color: '#0891b2' }}>
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                </svg>
                                Select Branch <strong style={{ color: '#ef4444' }}>*</strong>
                            </span>
                            <select
                                value={selectedBranch}
                                onChange={e => setSelectedBranch(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="">{isLoading ? 'Loading...' : 'Select Branch'}</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </label>

                        {/* Service Center */}
                        <label className="field-group">
                            <span>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5, verticalAlign: 'middle', color: '#0891b2' }}>
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                    <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                                </svg>
                                Select Service Center <strong style={{ color: '#ef4444' }}>*</strong>
                            </span>
                            <select
                                value={selectedServiceCenter}
                                onChange={e => setSelectedServiceCenter(e.target.value)}
                                disabled={!selectedBranch || isSCLoading}
                            >
                                <option value="">
                                    {isSCLoading ? 'Loading...' : !selectedBranch ? 'Select branch first' : serviceCenters.length === 0 ? 'No service centers' : 'Select Service Center'}
                                </option>
                                {serviceCenters.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                            </select>
                        </label>

                        {/* User */}
                        <label className="field-group">
                            <span>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5, verticalAlign: 'middle', color: '#0891b2' }}>
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                Service Center User <strong style={{ color: '#ef4444' }}>*</strong>
                            </span>
                            <select
                                value={selectedUser}
                                onChange={e => setSelectedUser(e.target.value)}
                                disabled={!selectedServiceCenter || isUsersLoading}
                            >
                                <option value="">
                                    {isUsersLoading ? 'Loading users...' : !selectedServiceCenter ? 'Select service center first' : users.length === 0 ? 'No users found' : 'Select User'}
                                </option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.contact_name || u.username} — {u.role}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* Assign Button */}
                        <div className="field-group">
                            <span style={{ visibility: 'hidden' }}>Action</span>
                            <button
                                type="button"
                                onClick={handleAssign}
                                disabled={isSaving || !selectedUser}
                                className="primary-button"
                                style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)' }}
                            >
                                {isSaving
                                    ? <><svg style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: 6 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>Saving...</>
                                    : 'Save Assignment'}
                            </button>
                        </div>
                    </div>

                    {/* ─── User Info Strip ─── */}
                    {selectedUserObj && (
                        <div style={{
                            marginTop: '16px', padding: '14px 18px',
                            background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
                            border: '1px solid #bae6fd', borderRadius: '12px',
                            display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>User</div>
                                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{selectedUserObj.contact_name || selectedUserObj.username}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</div>
                                <div style={{ fontWeight: 700, color: '#0891b2', marginTop: 2 }}>{selectedUserObj.role}</div>
                            </div>
                            {selectedSCObj && (
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service Center</div>
                                    <div style={{ fontWeight: 700, color: '#0e7490', marginTop: 2 }}>{selectedSCObj.name}</div>
                                </div>
                            )}
                            <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
                                <span style={{
                                    display: 'inline-block', marginTop: 4, padding: '2px 10px',
                                    borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
                                    background: selectedUserObj.is_active !== false ? '#dcfce7' : '#fee2e2',
                                    color: selectedUserObj.is_active !== false ? '#166534' : '#991b1b'
                                }}>
                                    {selectedUserObj.is_active !== false ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ marginLeft: 'auto', minWidth: 160 }}>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    fontSize: '0.72rem', color: '#64748b', fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6
                                }}>
                                    <span>Rights Selected</span>
                                    <span style={{ color: '#0891b2' }}>{totalSelected}/{totalMenus}</span>
                                </div>
                                <div style={{ background: '#e2e8f0', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', borderRadius: '999px',
                                        width: `${pct}%`,
                                        background: pct === 100 ? 'linear-gradient(90deg, #059669, #10b981)' : 'linear-gradient(90deg, #0891b2, #0e7490)',
                                        transition: 'width 0.4s ease'
                                    }} />
                                </div>
                                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#0891b2', fontWeight: 800, marginTop: 3 }}>{pct}% granted</div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ─── Permissions Matrix ─── */}
            {selectedUser && (
                <section className="rights-matrix-section">
                    <div className="rights-matrix-header">
                        <h2>
                            Permissions Matrix
                            <span style={{ marginLeft: 12, fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>
                                {SC_MENU_STRUCTURE.length} groups · {totalMenus} permissions
                            </span>
                        </h2>
                        <label className="master-toggle">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={handleSelectAll}
                            />
                            <span className="toggle-slider"></span>
                            <span className="toggle-label">Grant All Access</span>
                        </label>
                    </div>

                    {isRightsLoading ? (
                        <div className="loading-state">
                            <DotLottiePlayer
                                src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie"
                                autoplay loop
                                style={{ width: '80px', height: '80px' }}
                            />
                            <p>Loading permissions map...</p>
                        </div>
                    ) : (
                        <div className="permissions-grid">
                            {SC_MENU_STRUCTURE.map((group, gIdx) => {
                                const groupChecked = group.items.length > 0 && group.items.every(item => selectedMenus.has(item));
                                const groupPartial = !groupChecked && group.items.some(item => selectedMenus.has(item));
                                const groupCount = group.items.filter(item => selectedMenus.has(item)).length;
                                return (
                                    <div key={gIdx} className="permission-card">
                                        <div className="permission-card-header">
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ margin: 0 }}>{group.group}</h3>
                                                <span style={{
                                                    fontSize: '0.72rem', fontWeight: 600,
                                                    color: groupChecked ? '#059669' : groupPartial ? '#d97706' : '#94a3b8'
                                                }}>
                                                    {groupCount}/{group.items.length} selected
                                                </span>
                                            </div>
                                            <label className="group-toggle" title={`Select all in ${group.group}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={groupChecked}
                                                    ref={el => {
                                                        if (el) el.indeterminate = groupPartial;
                                                    }}
                                                    onChange={e => handleGroupToggle(group, e.target.checked)}
                                                />
                                                <span className="custom-checkbox"></span>
                                            </label>
                                        </div>
                                        <div className="permission-card-body">
                                            {group.items.map((item, iIdx) => (
                                                <label key={iIdx} className="permission-item">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMenus.has(item)}
                                                        onChange={e => handleMenuCheckbox(item, e.target.checked)}
                                                    />
                                                    <span className="custom-checkbox"></span>
                                                    <span className="item-name">{item}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ─── Bottom Action Bar ─── */}
                    <div style={{
                        padding: '16px 24px', borderTop: '1px solid #f1f5f9',
                        background: 'linear-gradient(to right, #f8fafc, #f0f9ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: '12px', borderRadius: '0 0 16px 16px'
                    }}>
                        <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
                            <strong style={{ color: '#0891b2' }}>{totalSelected}</strong> of{' '}
                            <strong>{totalMenus}</strong> permissions selected
                            {selectedUserObj && <> for <strong style={{ color: '#0891b2' }}>{selectedUserObj.contact_name || selectedUserObj.username}</strong></>}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                className="secondary-button"
                                onClick={() => setSelectedMenus(new Set())}
                                disabled={isSaving}
                            >
                                Clear All
                            </button>
                            <button
                                className="secondary-button"
                                onClick={() => setSelectedMenus(new Set(SC_MENU_ITEMS))}
                                disabled={isSaving}
                                style={{ color: '#0891b2', borderColor: '#bae6fd', background: '#f0f9ff' }}
                            >
                                Select All
                            </button>
                            <button
                                className="primary-button"
                                onClick={handleAssign}
                                disabled={isSaving || !selectedUser}
                                style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)' }}
                            >
                                {isSaving ? 'Saving...' : 'Save & Assign Rights'}
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* ─── Empty State ─── */}
            {!selectedUser && !isLoading && (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', padding: '60px 20px',
                    color: '#94a3b8', textAlign: 'center'
                }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#bae6fd" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b', margin: 0 }}>
                        Select a Service Center User to manage their menu rights
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
                        Choose Branch → Service Center → User to view and assign permissions
                    </p>

                    {/* Step indicators */}
                    <div style={{ display: 'flex', gap: '32px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {[
                            { step: 1, label: 'Select Branch', done: !!selectedBranch, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg> },
                            { step: 2, label: 'Select Service Center', done: !!selectedServiceCenter, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
                            { step: 3, label: 'Select User', done: !!selectedUser, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
                        ].map(({ step, label, done, icon }) => (
                            <div key={step} style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: '50%', margin: '0 auto 8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: done ? 'linear-gradient(135deg, #0891b2, #0e7490)' : '#f1f5f9',
                                    color: done ? '#fff' : '#94a3b8',
                                    boxShadow: done ? '0 4px 12px rgba(8,145,178,0.3)' : 'none',
                                    transition: 'all 0.3s'
                                }}>
                                    {done ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> : icon}
                                </div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: done ? '#0891b2' : '#94a3b8' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
