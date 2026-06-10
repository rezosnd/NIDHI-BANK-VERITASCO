import React, { useState, useEffect } from 'react';
import './DesignationMaster.css';
import { BRANCH_MENU_STRUCTURE, BRANCH_MENU_ITEMS } from './BranchMenuList';
import { DotLottiePlayer } from '@lottiefiles/dotlottie-react';

const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

export default function BranchUserRights() {
    const [designations, setDesignations] = useState([]);
    const [branches, setBranches] = useState([]);
    const [users, setUsers] = useState([]);

    const [selectedDesignation, setSelectedDesignation] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedUser, setSelectedUser] = useState('');

    const [selectedMenus, setSelectedMenus] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [isRightsLoading, setIsRightsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Fetch designations and branches on mount
    useEffect(() => {
        const token = getAuthToken();
        const headers = { Authorization: `Bearer ${token || ''}` };
        Promise.all([
            fetch('/api/designations', { headers }).then(r => r.ok ? r.json() : []),
            fetch('/api/branches', { headers }).then(r => r.ok ? r.json() : [])
        ]).then(([desigs, brs]) => {
            setDesignations(Array.isArray(desigs) ? desigs : []);
            setBranches(Array.isArray(brs) ? brs : []);
        }).catch(() => {
            setMessage({ type: 'error', text: 'Failed to load data. Please refresh.' });
        }).finally(() => setIsLoading(false));
    }, []);

    // Fetch users when designation or branch changes
    useEffect(() => {
        setUsers([]);
        setSelectedUser('');
        setSelectedMenus(new Set());
        if (!selectedDesignation && !selectedBranch) return;

        setIsUsersLoading(true);
        const token = getAuthToken();
        const params = new URLSearchParams();
        if (selectedBranch) params.set('branch_id', selectedBranch);
        if (selectedDesignation) params.set('designation_id', selectedDesignation);

        fetch(`/api/branch-users?${params}`, { headers: { Authorization: `Bearer ${token || ''}` } })
            .then(r => r.ok ? r.json() : [])
            .then(data => setUsers(Array.isArray(data) ? data : []))
            .catch(() => setMessage({ type: 'error', text: 'Failed to load users.' }))
            .finally(() => setIsUsersLoading(false));
    }, [selectedDesignation, selectedBranch]);

    // Load saved rights when user is selected
    useEffect(() => {
        setSelectedMenus(new Set());
        if (!selectedUser) return;
        setIsRightsLoading(true);
        const token = getAuthToken();
        fetch(`/api/branch-user-rights/${selectedUser}`, { headers: { Authorization: `Bearer ${token || ''}` } })
            .then(r => r.ok ? r.json() : [])
            .then(data => setSelectedMenus(new Set(Array.isArray(data) ? data : [])))
            .catch(() => setMessage({ type: 'error', text: 'Failed to load user rights.' }))
            .finally(() => setIsRightsLoading(false));
    }, [selectedUser]);

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedMenus(new Set(BRANCH_MENU_ITEMS));
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
            setMessage({ type: 'error', text: 'Please select a user first.' });
            return;
        }
        setIsSaving(true);
        setMessage(null);
        try {
            const token = getAuthToken();
            const res = await fetch(`/api/branch-user-rights/${selectedUser}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
                body: JSON.stringify({ menus: Array.from(selectedMenus) })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: `✅ Rights assigned successfully to ${selectedUserObj?.contact_name || selectedUserObj?.username}!` });
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
    const totalSelected = selectedMenus.size;
    const totalMenus = BRANCH_MENU_ITEMS.length;

    return (
        <div className="designation-master fade-in">

            {/* ─── Header ─── */}
            <header className="module-header">
                <div className="header-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                </div>
                <div>
                    <h1>Branch User Rights</h1>
                    <p>Assign individual menu access rights to specific branch employees.</p>
                </div>
            </header>

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

            {/* ─── Filter Card ─── */}
            <section className="card-surface" style={{ marginBottom: '24px' }}>
                <div className="card-accent"></div>
                <div className="card-head">
                    <h2>Select User to Assign Rights</h2>
                </div>
                <div className="designation-form">
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', alignItems: 'flex-end' }}>

                        <label className="field-group">
                            <span>Filter by Designation</span>
                            <select value={selectedDesignation} onChange={e => setSelectedDesignation(e.target.value)} disabled={isLoading}>
                                <option value="">All Designations</option>
                                {designations.map(d => <option key={d.id} value={d.id}>{d.name.toUpperCase()}</option>)}
                            </select>
                        </label>

                        <label className="field-group">
                            <span>Filter by Branch</span>
                            <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} disabled={isLoading}>
                                <option value="">All Branches</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </label>

                        <label className="field-group">
                            <span>Select User <strong>*</strong></span>
                            <select
                                value={selectedUser}
                                onChange={e => setSelectedUser(e.target.value)}
                                disabled={isUsersLoading || (!selectedDesignation && !selectedBranch)}
                            >
                                <option value="">
                                    {isUsersLoading
                                        ? 'Loading users...'
                                        : (!selectedDesignation && !selectedBranch)
                                            ? 'Select designation or branch first'
                                            : users.length === 0 ? 'No users found' : 'Select User'}
                                </option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.contact_name || u.username} — {u.role}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="field-group">
                            <span style={{ visibility: 'hidden' }}>Action</span>
                            <button
                                type="button"
                                onClick={handleAssign}
                                disabled={isSaving || !selectedUser}
                                className="primary-button"
                            >
                                {isSaving ? 'Saving...' : '✓ Assign Rights'}
                            </button>
                        </div>
                    </div>

                    {/* User info strip */}
                    {selectedUserObj && (
                        <div style={{
                            marginTop: '16px', padding: '14px 18px',
                            background: '#f0f9ff', border: '1px solid #bae6fd',
                            borderRadius: '10px', display: 'flex',
                            alignItems: 'center', gap: '32px', flexWrap: 'wrap'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>User</div>
                                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{selectedUserObj.contact_name || selectedUserObj.username}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Designation</div>
                                <div style={{ fontWeight: 700, color: '#0284c7', marginTop: 2 }}>{selectedUserObj.role}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
                                <span style={{
                                    display: 'inline-block', marginTop: 4, padding: '2px 10px',
                                    borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
                                    background: selectedUserObj.is_active !== false ? '#dcfce7' : '#fee2e2',
                                    color: selectedUserObj.is_active !== false ? '#166534' : '#991b1b'
                                }}>
                                    {selectedUserObj.is_active !== false ? '● Active' : '● Inactive'}
                                </span>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rights Selected</div>
                                <div style={{ fontWeight: 800, color: '#7c3aed', fontSize: '1.25rem', marginTop: 2 }}>
                                    {totalSelected} <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.9rem' }}>/ {totalMenus}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ─── Permissions Matrix ─── */}
            {selectedUser && (
                <section className="rights-matrix-section">
                    <div className="rights-matrix-header">
                        <h2>Permissions Matrix
                            <span style={{ marginLeft: 12, fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>
                                {BRANCH_MENU_STRUCTURE.length} groups · {totalMenus} permissions
                            </span>
                        </h2>
                        <label className="master-toggle">
                            <input
                                type="checkbox"
                                checked={totalSelected === totalMenus && totalMenus > 0}
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
                            {BRANCH_MENU_STRUCTURE.map((group, gIdx) => {
                                const allChecked = group.items.length > 0 && group.items.every(item => selectedMenus.has(item));
                                return (
                                    <div key={gIdx} className="permission-card">
                                        <div className="permission-card-header">
                                            <h3>{group.group}</h3>
                                            <label className="group-toggle" title={`Select all in ${group.group}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={allChecked}
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

                    {/* Bottom action bar */}
                    <div style={{
                        padding: '16px 24px', borderTop: '1px solid #f1f5f9',
                        background: '#f8fafc', display: 'flex',
                        alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: '12px'
                    }}>
                        <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
                            <strong style={{ color: '#7c3aed' }}>{totalSelected}</strong> of <strong>{totalMenus}</strong> permissions selected
                            {selectedUserObj && <> for <strong style={{ color: '#0284c7' }}>{selectedUserObj.contact_name || selectedUserObj.username}</strong></>}
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="secondary-button" onClick={() => setSelectedMenus(new Set())}>Clear All</button>
                            <button className="primary-button" onClick={handleAssign} disabled={isSaving || !selectedUser}>
                                {isSaving ? 'Saving...' : '✓ Save & Assign Rights'}
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* ─── Empty state ─── */}
            {!selectedUser && !isLoading && (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', padding: '60px 0',
                    color: '#94a3b8', textAlign: 'center'
                }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b', margin: 0 }}>
                        Select a user above to manage their menu rights
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
                        Filter by designation and branch to narrow down the user list
                    </p>
                </div>
            )}
        </div>
    );
}
