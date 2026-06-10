import React, { useState, useEffect } from 'react';
import { DotLottiePlayer } from '@lottiefiles/dotlottie-react';
import { ALL_MENU_ITEMS } from './MenuList';
import './DesignationMaster.css'; // Reusing the same CSS for consistency

const DesignationMenuRights = () => {
    const [designations, setDesignations] = useState([]);
    const [selectedDesignation, setSelectedDesignation] = useState('');
    const [selectedMenus, setSelectedMenus] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchDesignations();
    }, []);

    useEffect(() => {
        if (selectedDesignation) {
            fetchMenuRights(selectedDesignation);
        } else {
            setSelectedMenus(new Set());
        }
    }, [selectedDesignation]);

    const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

    const fetchDesignations = async () => {
        setIsLoading(true);
        try {
            const token = getAuthToken();
            const res = await fetch('/api/designations', {
                headers: { 'Authorization': `Bearer ${token || ''}` }
            });
            const data = await res.json();
            if (res.ok) {
                setDesignations(data);
            }
        } catch (error) {
            console.error("Error fetching designations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMenuRights = async (designationId) => {
        setIsLoading(true);
        try {
            const token = getAuthToken();
            const res = await fetch(`/api/designation-menu-rights/${designationId}`, {
                headers: { 'Authorization': `Bearer ${token || ''}` }
            });
            const data = await res.json();
            if (res.ok) {
                setSelectedMenus(new Set(data));
            } else {
                setSelectedMenus(new Set());
            }
        } catch (error) {
            console.error("Error fetching menu rights:", error);
            setSelectedMenus(new Set());
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedMenus(new Set(ALL_MENU_ITEMS));
        } else {
            setSelectedMenus(new Set());
        }
    };

    const handleMenuCheckbox = (menuName, checked) => {
        const newSet = new Set(selectedMenus);
        if (checked) {
            newSet.add(menuName);
        } else {
            newSet.delete(menuName);
        }
        setSelectedMenus(newSet);
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedDesignation) {
            setMessage({ type: 'error', text: 'Please select a designation first.' });
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            const token = getAuthToken();
            const res = await fetch(`/api/designation-menu-rights/${selectedDesignation}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`
                },
                body: JSON.stringify({ menus: Array.from(selectedMenus) })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Assign menu to Designation Added Successfully' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to assign menu rights.' });
            }
        } catch (error) {
            console.error("Error saving menu rights:", error);
            setMessage({ type: 'error', text: 'An unexpected error occurred while saving.' });
        } finally {
            setIsSaving(false);
        }
    };

    // Parse items into groups for the beautiful card UI
    const getGroupedMenus = () => {
        const groups = [];
        let currentGroup = { title: 'COMPANY', items: [] };
        
        for (let i = 0; i < ALL_MENU_ITEMS.length; i++) {
            const item = ALL_MENU_ITEMS[i];
            // Identify headers: All uppercase, no slashes, length > 1, and manually excluding some uppercase items that are just links
            const isHeader = item === item.toUpperCase() && !item.includes('/') && item !== 'UPDATE SHARE DISTINCTIVE' && item !== 'EOD/BOD';
            
            if (isHeader) {
                if (currentGroup.items.length > 0) {
                    groups.push(currentGroup);
                }
                currentGroup = { title: item, items: [] };
            } else {
                currentGroup.items.push(item);
            }
        }
        if (currentGroup.items.length > 0) {
            groups.push(currentGroup);
        }
        return groups;
    };

    const groupedMenus = getGroupedMenus();

    return (
        <div className="designation-master fade-in">
            <header className="module-header">
                <div className="header-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
                </div>
                <div>
                    <h1>Designation Menu Assign Rights</h1>
                    <p>Map application screens and modules to specific designations.</p>
                </div>
            </header>

            {message && (
                <div className={`status-banner ${message.type === 'success' ? 'status-success' : 'status-error'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {message.type === 'success' ? (
                            <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></>
                        ) : (
                            <><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></>
                        )}
                    </svg>
                    <span>{message.text}</span>
                    <button className="close-banner-btn" onClick={() => setMessage(null)}>&times;</button>
                </div>
            )}

            <main className="module-content">
                <section className="card-surface" style={{ marginBottom: '24px' }}>
                    <div className="card-head">
                        <h2>Select Designation to Assign Rights</h2>
                    </div>
                    
                    <form className="designation-form" style={{ paddingBottom: '24px' }}>
                        <div className="form-grid" style={{ alignItems: 'flex-end', marginBottom: 0 }}>
                            <div className="field-group">
                                <span>Select Designation <strong>*</strong></span>
                                <select 
                                    value={selectedDesignation} 
                                    onChange={(e) => setSelectedDesignation(e.target.value)}
                                >
                                    <option value="">Select Designation</option>
                                    {designations.map(d => (
                                        <option key={d.id} value={d.id}>{d.name.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="field-group">
                                <button type="button" onClick={handleAssign} disabled={isSaving || !selectedDesignation} className="primary-button" style={{ maxWidth: '200px' }}>
                                    {isSaving ? <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "-4px 0" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> : 'Assign Rights'}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                {selectedDesignation && (
                    <section className="rights-matrix-section">
                        <div className="rights-matrix-header">
                            <h2>Permissions Matrix</h2>
                            <label className="master-toggle">
                                <input 
                                    type="checkbox" 
                                    checked={selectedMenus.size === ALL_MENU_ITEMS.length}
                                    onChange={handleSelectAll}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-label">Grant All Access</span>
                            </label>
                        </div>

                        {isLoading ? (
                            <div className="loading-state">
                                <DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "80px", height: "80px" }} />
                                <p>Loading permissions map...</p>
                            </div>
                        ) : (
                            <div className="permissions-grid">
                                {groupedMenus.map((group, gIdx) => (
                                    <div key={gIdx} className="permission-card">
                                        <div className="permission-card-header">
                                            <h3>{group.title}</h3>
                                            <label className="group-toggle" title="Select all in group">
                                                <input 
                                                    type="checkbox"
                                                    checked={group.items.every(item => selectedMenus.has(item))}
                                                    onChange={(e) => {
                                                        const newSet = new Set(selectedMenus);
                                                        if (e.target.checked) {
                                                            group.items.forEach(item => newSet.add(item));
                                                            newSet.add(group.title); // Also add the header itself if needed
                                                        } else {
                                                            group.items.forEach(item => newSet.delete(item));
                                                            newSet.delete(group.title);
                                                        }
                                                        setSelectedMenus(newSet);
                                                    }}
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
                                                        onChange={(e) => handleMenuCheckbox(item, e.target.checked)}
                                                    />
                                                    <span className="custom-checkbox"></span>
                                                    <span className="item-name">{item}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default DesignationMenuRights;
