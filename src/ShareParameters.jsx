import React, { useEffect, useMemo, useState } from 'react';
import './ShareParameters.css';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';
const Shield = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const CheckCircle = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Search = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const Clock = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const RefreshCw = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;

const DEFAULT_SHARE_SETTINGS = {
  share_member_type: 'Share Holder',
  share_value: '100.00',
  min_shares: '1',
  max_shares: '25',
  dividend_declared: '0.00',
  no_of_promoter: '18',
  min_members: '200',
  authorised_capital: '1001000000.00',
  paidup_capital: '11400000.00',
};

const ShareParameters = () => {
  const [settings, setSettings] = useState(DEFAULT_SHARE_SETTINGS);
  const [promoters, setPromoters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(null);
  const [authCapitalForm, setAuthCapitalForm] = useState({ newCapital: '', confirmCapital: '' });
  const [paidCapitalForm, setPaidCapitalForm] = useState({ newCapital: '', confirmCapital: '' });
  const [message, setMessage] = useState(null);
  const [history, setHistory] = useState({
    share_value: [],
    promoter_member: [],
    authorised_capital: [],
    paidup_capital: []
  });

  const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async ({ clearMessage = true } = {}) => {
    setIsLoading(true);
    if (clearMessage) {
      setMessage(null);
    }
    try {
      const token = getAuthToken();
      const [settingsRes, promotersRes, shareHistoryRes, promoterHistoryRes, authorisedHistoryRes, paidupHistoryRes] = await Promise.all([
        fetch('/api/settings', { headers: { Authorization: `Bearer ${token || ''}` } }),
        fetch('/api/promoters', { headers: { Authorization: `Bearer ${token || ''}` } }),
        fetch('/api/share-parameters/history?type=share_value', { headers: { Authorization: `Bearer ${token || ''}` } }),
        fetch('/api/share-parameters/history?type=promoter_member', { headers: { Authorization: `Bearer ${token || ''}` } }),
        fetch('/api/share-parameters/history?type=authorised_capital', { headers: { Authorization: `Bearer ${token || ''}` } }),
        fetch('/api/share-parameters/history?type=paidup_capital', { headers: { Authorization: `Bearer ${token || ''}` } }),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(prev => ({ ...prev, ...data }));
      }

      if (promotersRes.ok) {
        const data = await promotersRes.json();
        setPromoters(Array.isArray(data) ? data : []);
      }

      setHistory({
        share_value: shareHistoryRes.ok ? await shareHistoryRes.json() : [],
        promoter_member: promoterHistoryRes.ok ? await promoterHistoryRes.json() : [],
        authorised_capital: authorisedHistoryRes.ok ? await authorisedHistoryRes.json() : [],
        paidup_capital: paidupHistoryRes.ok ? await paidupHistoryRes.json() : []
      });
    } catch (error) {
      console.error('Error loading share parameters:', error);
      setMessage({ type: 'error', text: 'Failed to load share parameters.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const saveSection = async (sectionKey, payload, successText) => {
    setSavingSection(sectionKey);
    setMessage(null);
    try {
      const token = getAuthToken();
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to update share parameters');
      setMessage({ type: 'success', text: successText });
      await fetchAll({ clearMessage: false });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save share parameters.' });
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveShareValue = () => saveSection(
    'share_value',
    {
      share_member_type: settings.share_member_type,
      share_value: settings.share_value,
      min_shares: settings.min_shares,
      max_shares: settings.max_shares,
      dividend_declared: settings.dividend_declared
    },
    'Share value updated successfully.'
  );

  const handleSavePromoterMember = () => saveSection(
    'promoter_member',
    {
      no_of_promoter: settings.no_of_promoter,
      min_members: settings.min_members
    },
    'Promoter/member settings updated successfully.'
  );

  const handleSaveAuthorisedCapital = () => {
    if (authCapitalForm.newCapital !== authCapitalForm.confirmCapital) {
      setMessage({ type: 'error', text: 'Authorised capital values do not match.' });
      return;
    }
    if (!authCapitalForm.newCapital) {
      setMessage({ type: 'error', text: 'Please enter authorised capital value.' });
      return;
    }
    saveSection('authorised_capital', { authorised_capital: authCapitalForm.newCapital }, 'Authorised capital updated successfully.');
    setAuthCapitalForm({ newCapital: '', confirmCapital: '' });
  };

  const handleSavePaidupCapital = () => {
    if (paidCapitalForm.newCapital !== paidCapitalForm.confirmCapital) {
      setMessage({ type: 'error', text: 'Paid up capital values do not match.' });
      return;
    }
    if (!paidCapitalForm.newCapital) {
      setMessage({ type: 'error', text: 'Please enter paid up capital value.' });
      return;
    }
    saveSection('paidup_capital', { paidup_capital: paidCapitalForm.newCapital }, 'Paid up capital updated successfully.');
    setPaidCapitalForm({ newCapital: '', confirmCapital: '' });
  };

  const totalShares = useMemo(() => {
    return promoters.reduce((acc, item) => acc + (Number(item.no_of_share) || 0), 0);
  }, [promoters]);

  const filteredPromoters = promoters.filter(item => {
    const query = searchTerm.toLowerCase();
    return (
      (item.member_id || '').toLowerCase().includes(query) ||
      (item.member_name || '').toLowerCase().includes(query)
    );
  });

  const activePromoter = promoters.find(item => item.is_active_share_trf);

  const handleSetActive = async (id) => {
    if (!window.confirm('Set this promoter as the active share transfer member?')) return;
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/promoters/${id}/active`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || ''}` }
      });
      if (!response.ok) throw new Error('Failed to update active member');
      await fetchAll();
      setMessage({ type: 'success', text: 'Active member updated.' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to update active member.' });
    }
  };

  const stats = [
    { label: 'Member type', value: settings.share_member_type, note: 'Share configuration' },
    { label: 'Share value', value: settings.share_value, note: 'Per share price' },
    { label: 'Promoter count', value: settings.no_of_promoter, note: 'Configured target' },
    { label: 'Member floor', value: settings.min_members, note: 'Minimum members' },
    { label: 'Promoters', value: String(promoters.length), note: 'Backend list' },
    { label: 'Total shares', value: String(totalShares), note: 'Allocated shares' },
  ];

  const renderCapitalHistoryRows = (rows, emptyLabel, field) => {
    if (isLoading && rows.length === 0) {
      return (
        <tr>
          <td colSpan="4" className="share-empty">
            <span className="share-loading"><div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> Loading...</span>
          </td>
        </tr>
      );
    }
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan="4" className="share-empty">{emptyLabel}</td>
        </tr>
      );
    }
    return rows.map((row, idx) => {
      const currentValues = row.current_values || {};
      const previousValues = row.previous_values || {};
      const val = currentValues[field] || previousValues[field] || '-';
      return (
        <tr key={row.id}>
          <td className="muted">{idx + 1}</td>
          <td className="muted">{new Date(row.created_at).toLocaleString()}</td>
          <td className="right strong">{val}</td>
          <td className="right">{val}</td>
        </tr>
      );
    });
  };

  const renderShareValueHistoryRows = (rows) => {
    if (isLoading && rows.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="share-empty">
            <span className="share-loading"><div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> Loading...</span>
          </td>
        </tr>
      );
    }
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="share-empty">No share value history found.</td>
        </tr>
      );
    }
    return rows.map((row, idx) => {
      const current = row.current_values || {};
      const prev = row.previous_values || {};
      return (
        <tr key={row.id}>
          <td className="muted">{idx + 1}</td>
          <td className="muted">{new Date(row.created_at).toLocaleString()}</td>
          <td>{current.share_member_type || prev.share_member_type || '1'}</td>
          <td className="right">{current.share_value || prev.share_value || '-'}</td>
          <td className="right">{current.min_shares || prev.min_shares || '-'}</td>
          <td className="right">{current.max_shares || prev.max_shares || '-'}</td>
          <td className="right">{current.dividend_declared || prev.dividend_declared || '-'}</td>
        </tr>
      );
    });
  };

  return (
    <div className="share-parameters-page">
      <div className="share-parameters-shell">
        {message && (
          <div className={`share-message ${message.type === 'success' ? 'share-message--success' : 'share-message--error'}`}>
            {message.type === 'success' ? <CheckCircle className="icon-sm" /> : <Shield className="icon-sm" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="share-parameters-grid">
          {stats.map(stat => (
            <div key={stat.label} className="share-stat">
              <div className="share-stat__label">{stat.label}</div>
              <div className="share-stat__value">{stat.value}</div>
              <div className="share-stat__note">{stat.note}</div>
            </div>
          ))}
        </div>

        <div className="share-layout">
          <section className="share-parameters-card share-panel">
            <h2>Update Share Value</h2>
            <div className="share-panel__sub">Current active promoter: {activePromoter ? `${activePromoter.member_name || activePromoter.member_id}` : 'Not selected'}</div>

            <div className="share-form">
              <label className="share-field">
                <span>Member Type</span>
                <select value={settings.share_member_type} onChange={(e) => handleChange('share_member_type', e.target.value)}>
                  <option value="Share Holder">Share Holder</option>
                </select>
              </label>

              <label className="share-field">
                <span>Per Share Value</span>
                <input type="text" value={settings.share_value} onChange={(e) => handleChange('share_value', e.target.value)} />
              </label>

              <label className="share-field">
                <span>Minimum Shares</span>
                <input type="text" value={settings.min_shares} onChange={(e) => handleChange('min_shares', e.target.value)} />
              </label>

              <label className="share-field">
                <span>Maximum Shares</span>
                <input type="text" value={settings.max_shares} onChange={(e) => handleChange('max_shares', e.target.value)} />
              </label>

              <label className="share-field">
                <span>Dividend Declared</span>
                <input type="text" value={settings.dividend_declared} onChange={(e) => handleChange('dividend_declared', e.target.value)} />
              </label>

              <div className="share-actions-row">
                <button type="button" className="share-button" onClick={handleSaveShareValue} disabled={savingSection === 'share_value'}>
                  {savingSection === 'share_value' ? <Clock className="icon-sm share-spin" /> : <CheckCircle className="icon-sm" />}
                  Update Share Value
                </button>
              </div>
            </div>
          </section>

          <section className="share-parameters-card share-panel">
            <h2>Update Promoter / Member</h2>
            <div className="share-panel__sub">These values are stored in the same secure settings table.</div>

            <div className="share-form">
              <label className="share-field">
                <span>Number of Promoters</span>
                <input type="text" value={settings.no_of_promoter} onChange={(e) => handleChange('no_of_promoter', e.target.value)} />
              </label>

              <label className="share-field">
                <span>Minimum Members</span>
                <input type="text" value={settings.min_members} onChange={(e) => handleChange('min_members', e.target.value)} />
              </label>

              <div className="share-actions-row">
                <button type="button" className="share-button" onClick={handleSavePromoterMember} disabled={savingSection === 'promoter_member'}>
                  {savingSection === 'promoter_member' ? <Clock className="icon-sm share-spin" /> : <CheckCircle className="icon-sm" />}
                  Update Member
                </button>
              </div>
            </div>
          </section>

          <section className="share-parameters-card share-panel">
            <h2>Update Authorised Capital</h2>
            <div className="share-form">
              <label className="share-field share-field--readonly">
                <span>Total Authorised Capital</span>
                <input type="text" value={settings.authorised_capital} readOnly />
              </label>

              <label className="share-field">
                <span>Authorised Capital</span>
                <input type="text" value={authCapitalForm.newCapital} onChange={(e) => setAuthCapitalForm(p => ({...p, newCapital: e.target.value}))} />
              </label>

              <label className="share-field">
                <span>Confirm Authorised Capital</span>
                <input type="text" value={authCapitalForm.confirmCapital} onChange={(e) => setAuthCapitalForm(p => ({...p, confirmCapital: e.target.value}))} />
              </label>

              <div className="share-actions-row">
                <button type="button" className="share-button" onClick={handleSaveAuthorisedCapital} disabled={savingSection === 'authorised_capital'}>
                  {savingSection === 'authorised_capital' ? <Clock className="icon-sm share-spin" /> : <CheckCircle className="icon-sm" />}
                  Add New Authorised Capital
                </button>
              </div>
            </div>
          </section>

          <section className="share-parameters-card share-panel">
            <h2>Update Paid up Capital</h2>
            <div className="share-form">
              <label className="share-field share-field--readonly">
                <span>Total Paid up Capital</span>
                <input type="text" value={settings.paidup_capital} readOnly />
              </label>

              <label className="share-field">
                <span>Paid up Capital</span>
                <input type="text" value={paidCapitalForm.newCapital} onChange={(e) => setPaidCapitalForm(p => ({...p, newCapital: e.target.value}))} />
              </label>

              <label className="share-field">
                <span>Confirm Paid up Capital</span>
                <input type="text" value={paidCapitalForm.confirmCapital} onChange={(e) => setPaidCapitalForm(p => ({...p, confirmCapital: e.target.value}))} />
              </label>

              <div className="share-actions-row">
                <button type="button" className="share-button" onClick={handleSavePaidupCapital} disabled={savingSection === 'paidup_capital'}>
                  {savingSection === 'paidup_capital' ? <Clock className="icon-sm share-spin" /> : <CheckCircle className="icon-sm" />}
                  Add New Paid Up Capital
                </button>
              </div>
            </div>
          </section>
        </div>

        <section className="share-history-grid" style={{ marginBottom: '16px' }}>
          <div className="share-parameters-card share-panel share-history-card">
            <h2>View Share Value</h2>
            <div className="share-table-wrap share-table-wrap--history">
              <table className="share-table share-table--history">
                <thead>
                  <tr>
                    <th>S.N.</th>
                    <th>MEMTYPE NAME</th>
                    <th className="right">SHARE VALUE</th>
                    <th className="right">MIN SHARES</th>
                    <th className="right">MAX SHARES</th>
                    <th className="right">DIVIDEND DECLARED</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="muted">1</td>
                    <td className="strong">{settings.share_member_type || '-'}</td>
                    <td className="right">{settings.share_value || '-'}</td>
                    <td className="right">{settings.min_shares || '-'}</td>
                    <td className="right">{settings.max_shares || '-'}</td>
                    <td className="right">{settings.dividend_declared || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="share-parameters-card share-panel share-history-card">
            <h2>View Authorised/Paid up Capital</h2>
            <div className="share-table-wrap share-table-wrap--history">
              <table className="share-table share-table--history">
                <thead>
                  <tr>
                    <th>S.N.</th>
                    <th className="right">Number of Promoter</th>
                    <th className="right">Number of Members</th>
                    <th className="right">Authorised Capital</th>
                    <th className="right">Paid up Capital</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="muted">1</td>
                    <td className="right">{settings.no_of_promoter || '-'}</td>
                    <td className="right">{settings.min_members || '-'}</td>
                    <td className="right">{settings.authorised_capital || '-'}</td>
                    <td className="right">{settings.paidup_capital || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="share-history-grid">
          <div className="share-parameters-card share-panel share-history-card">
            <h2>Previous Updated Share Parameter Record</h2>
            <div className="share-table-wrap share-table-wrap--history">
              <table className="share-table share-table--history">
                <thead>
                  <tr>
                    <th>S.N.</th>
                    <th>Date</th>
                    <th>Mem Type</th>
                    <th className="right">Share Val</th>
                    <th className="right">Min Share</th>
                    <th className="right">Max Share</th>
                    <th className="right">Dividend</th>
                  </tr>
                </thead>
                <tbody>{renderShareValueHistoryRows(history.share_value)}</tbody>
              </table>
            </div>
          </div>

          <div className="share-parameters-card share-panel share-history-card">
            <h2>Previous Updated Authorised Capital Record</h2>
            <div className="share-table-wrap share-table-wrap--history">
              <table className="share-table share-table--history">
                <thead>
                  <tr>
                    <th>S.N.</th>
                    <th>Date</th>
                    <th className="right">Authorised</th>
                    <th className="right">Bal</th>
                  </tr>
                </thead>
                <tbody>{renderCapitalHistoryRows(history.authorised_capital, 'No authorised capital history found.', 'authorised_capital')}</tbody>
              </table>
            </div>
          </div>

          <div className="share-parameters-card share-panel share-history-card">
            <h2>Previous Updated Paid up Capital Record</h2>
            <div className="share-table-wrap share-table-wrap--history">
              <table className="share-table share-table--history">
                <thead>
                  <tr>
                    <th>S.N.</th>
                    <th>Date</th>
                    <th className="right">Paid up</th>
                    <th className="right">Bal</th>
                  </tr>
                </thead>
                <tbody>{renderCapitalHistoryRows(history.paidup_capital, 'No paid up capital history found.', 'paidup_capital')}</tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="share-parameters-card share-table-card">
          <div className="share-table-head">
            <div>
              <h2>View Promoters</h2>
              <p>Manage the active share transfer member from the live backend list.</p>
            </div>
            <div className="share-search">
              <Search className="icon-sm share-search-icon" />
              <input type="text" placeholder="Search promoters..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="share-table-wrap">
            <table className="share-table">
              <thead>
                <tr>
                  <th>S.N.</th>
                  <th>Member Id</th>
                  <th>Member Name</th>
                  <th>Shares</th>
                  <th>Authorize</th>
                  <th>Promoter</th>
                  <th className="center">Share Trf Active</th>
                  <th className="center">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && promoters.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="share-empty">
                      <span className="share-loading"><div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div> Loading...</span>
                    </td>
                  </tr>
                ) : filteredPromoters.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="share-empty">No promoters found.</td>
                  </tr>
                ) : (
                  filteredPromoters.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="muted">{idx + 1}</td>
                      <td className="strong">{item.member_id}</td>
                      <td>{item.member_name}</td>
                      <td className="right">{item.no_of_share || 0}</td>
                      <td className="center">{item.authorize || '-'}</td>
                      <td className="center">{item.promoter_type || '-'}</td>
                      <td className="center">
                        <span className={`share-badge ${item.is_active_share_trf ? 'share-badge--green' : 'share-badge--blue'}`}>
                          {item.is_active_share_trf ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="center">
                        <div className="share-row-actions">
                          {!item.is_active_share_trf && (
                            <button type="button" className="share-icon-button share-icon-button--green" title="Set Active" onClick={() => handleSetActive(item.id)}>
                              <CheckCircle className="icon-sm" />
                            </button>
                          )}
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
  );
};

export default ShareParameters;
