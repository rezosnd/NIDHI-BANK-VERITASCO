import React, { useState, useEffect } from 'react';

export default function ViewServiceCenterUser() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [scs, setScs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const h = { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` };
    try {
      const [u, b, s] = await Promise.all([
        fetch('/api/service-center-users', { headers: h }),
        fetch('/api/branches', { headers: h }),
        fetch('/api/service-centers', { headers: h }),
      ]);
      if (u.ok) setUsers(await u.json());
      if (b.ok) setBranches(await b.json());
      if (s.ok) setScs(await s.json());
    } catch { flash('', 'Failed to load'); }
    finally { setLoading(false); }
  };

  const flash = (msg, e) => {
    if (msg) { setOk(msg); setTimeout(() => setOk(''), 4000); }
    if (e)   { setErr(e);  setTimeout(() => setErr(''), 5000); }
  };

  const openEdit = (u) => {
    setEditId(u.user_id);
    setForm({
      id: u.user_id, branch_id: u.branch_id||'', service_center_id: u.service_center_id||'',
      contact_name: u.contact_name||'', phone_no: u.phone_no||'', mobile_no: u.mobile_no||'',
      email: u.email||'', address: u.address||'', pin_code: u.pin_code||'',
      bank_account_no: u.bank_account_no||'', bank_account_name: u.bank_account_name||'',
      bank_name: u.bank_name||'', bank_ifsc: u.bank_ifsc||'', bank_branch_name: u.bank_branch_name||'',
      min_balance: u.min_balance||'', username: u.username||'', password:'', confirmPassword:'',
      is_active: u.is_active !== false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ch = e => setForm(p => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.branch_id) return flash('', 'Select Branch');
    if (!form.service_center_id) return flash('', 'Select Service Center');
    if (!form.contact_name) return flash('', 'Enter Contact Name');
    if (!form.mobile_no) return flash('', 'Enter Mobile No');
    if (!form.username) return flash('', 'Enter Username');
    if (form.password) {
      if (form.password !== form.confirmPassword) return flash('', 'Passwords do not match');
      if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@!%*#?&]).{8,}$/.test(form.password))
        return flash('', 'Password: 8+ chars, 1 letter, 1 number, 1 special char');
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/service-center-users/${form.id}`, {
        method:'PUT',
        headers:{ 'Authorization':`Bearer ${localStorage.getItem('authToken')}`, 'Content-Type':'application/json' },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (res.ok) { flash(d.message||'Updated successfully!', ''); setEditId(null); load(); }
      else flash('', d.error||'Update failed');
    } catch { flash('', 'Network error'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this Service Center User?')) return;
    const res = await fetch(`/api/service-center-users/${id}`, {
      method:'DELETE', headers:{ 'Authorization':`Bearer ${localStorage.getItem('authToken')}` }
    });
    if (res.ok) { flash('User deleted!', ''); load(); }
    else flash('', 'Delete failed');
  };

  const filteredScs = scs.filter(s => form && s.branch_id == form.branch_id);

  return (
    <div style={{ padding: '0 0 4rem 0', maxWidth: '100%', margin: '0' }}>

      {/* Toasts */}
      {ok && (
        <div style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 16px', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          {ok}
        </div>
      )}
      {err && (
        <div style={{ backgroundColor: '#ef4444', color: 'white', padding: '12px 16px', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {err}
        </div>
      )}

      {/* ─── EDIT PANEL ─── */}
      {editId && form && (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid #3b82f6', borderRadius: '6px', padding: '2rem', boxShadow: '0 4px 12px rgba(59,130,246,0.15)', marginBottom: '2rem' }}>
          <div style={{ paddingBottom: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase' }}>Edit Service Center User</h3>
            <button onClick={() => setEditId(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontWeight: '700' }}>✕ Close</button>
          </div>

          <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>Branch <span style={{color: '#ef4444'}}>*</span></label>
              <select name="branch_id" value={form.branch_id} onChange={ch} style={inputStyle} disabled={saving}>
                <option value="">Select Branch</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>Service Center <span style={{color: '#ef4444'}}>*</span></label>
              <select name="service_center_id" value={form.service_center_id} onChange={ch} style={inputStyle} disabled={saving}>
                <option value="">Select Service Center</option>
                {filteredScs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>Contact Name <span style={{color: '#ef4444'}}>*</span></label>
              <input type="text" name="contact_name" value={form.contact_name} onChange={ch} style={inputStyle} maxLength="30" disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>Phone No <span style={{color: '#ef4444'}}>*</span></label>
              <input type="text" name="phone_no" value={form.phone_no} onChange={ch} style={inputStyle} maxLength="10" disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>Mobile No <span style={{color: '#ef4444'}}>*</span></label>
              <input type="text" name="mobile_no" value={form.mobile_no} onChange={ch} style={inputStyle} maxLength="10" disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>Email</label>
              <input type="email" name="email" value={form.email} onChange={ch} style={inputStyle} disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
              <label style={lbl}>Address</label>
              <textarea name="address" value={form.address} onChange={ch} rows="2" style={{ ...inputStyle, resize: 'vertical' }} disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>Pin Code</label>
              <input type="text" name="pin_code" value={form.pin_code} onChange={ch} style={inputStyle} maxLength="6" disabled={saving} />
            </div>
            
            {/* Bank Details section */}
            <div style={{ gridColumn: '1 / -1', backgroundColor: '#1e3a8a', color: 'white', padding: '8px 16px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', borderRadius: '4px', marginTop: '0.5rem' }}>
              Bank Details
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>Bank Account No</label>
              <input type="text" name="bank_account_no" value={form.bank_account_no} onChange={ch} style={inputStyle} maxLength="20" disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>Bank Account Name</label>
              <input type="text" name="bank_account_name" value={form.bank_account_name} onChange={ch} style={inputStyle} maxLength="100" disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>Bank Name</label>
              <input type="text" name="bank_name" value={form.bank_name} onChange={ch} style={inputStyle} maxLength="50" disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>IFSC Code</label>
              <input type="text" name="bank_ifsc" value={form.bank_ifsc} onChange={ch} style={inputStyle} maxLength="11" placeholder="e.g. SBIN0001234" disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>Bank Branch Name</label>
              <input type="text" name="bank_branch_name" value={form.bank_branch_name} onChange={ch} style={inputStyle} maxLength="50" disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>Minimum Balance</label>
              <input type="number" name="min_balance" value={form.min_balance} onChange={ch} style={inputStyle} step="0.01" disabled={saving} />
            </div>
            
            {/* Login Details section */}
            <div style={{ gridColumn: '1 / -1', backgroundColor: '#1e3a8a', color: 'white', padding: '8px 16px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', borderRadius: '4px', marginTop: '0.5rem' }}>
              Login & Security
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>Username <span style={{color: '#ef4444'}}>*</span></label>
              <input type="text" name="username" value={form.username} onChange={ch} style={inputStyle} maxLength="30" disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>New Password <span style={{fontSize: '9px', color: '#64748b'}}>(leave blank to keep)</span></label>
              <input type="password" name="password" value={form.password} onChange={ch} style={inputStyle} placeholder="••••••••" disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>Confirm Password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={ch} style={inputStyle} disabled={saving} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={lbl}>Status</label>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="radio" name="is_active" checked={form.is_active !== false} onChange={() => setForm({...form, is_active: true})} disabled={saving} />
                  <span style={{ color: '#16a34a', fontWeight: '700' }}>Active</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="radio" name="is_active" checked={form.is_active === false} onChange={() => setForm({...form, is_active: false})} disabled={saving} />
                  <span style={{ color: '#ef4444', fontWeight: '700' }}>In Active</span>
                </label>
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={saving} style={buttonStyle('#2563eb')}>
                {saving ? 'Updating...' : 'Update Records'}
              </button>
              <button type="button" onClick={() => setEditId(null)} disabled={saving} style={{...buttonStyle('#f1f5f9'), color: '#334155', boxShadow: 'none', border: '1px solid #cbd5e1'}}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TABLE ─── */}
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase' }}>Service Center Users</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {['Sl No','Branch','Service Center','Code','Contact','Username','Mobile','Status','Action'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: h==='Action'?'center':'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading records...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="9" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No service center users found.</td></tr>
              ) : users.map((u, i) => (
                <tr key={u.user_id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc', transition: 'all 0.2s' }}>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: '600' }}>{i+1}</td>
                  <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: '600' }}>{u.branch_name||'—'}</td>
                  <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: '700' }}>{u.service_center_name||'—'}</td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>{u.service_center_code||'—'}</td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>{u.contact_name||'—'}</td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>{u.username}</td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>{u.mobile_no||'—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', background: u.is_active!==false?'#dcfce7':'#fee2e2', color: u.is_active!==false?'#16a34a':'#ef4444' }}>
                      {u.is_active!==false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => openEdit(u)} style={actionBtnStyle('#3b82f6')}>Edit</button>
                      <button onClick={() => del(u.user_id)} style={actionBtnStyle('#ef4444')}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const lbl = { fontSize: '12px', fontWeight: '700', color: '#1e293b' };

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '4px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  color: '#0f172a',
  backgroundColor: '#ffffff',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
};

const buttonStyle = (bgColor) => ({
  backgroundColor: bgColor,
  color: 'white',
  padding: '10px 20px',
  borderRadius: '4px',
  border: 'none',
  fontWeight: '700',
  fontSize: '12px',
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  transition: 'all 0.2s',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
});

const actionBtnStyle = (color) => ({
  backgroundColor: 'transparent',
  color: color,
  border: `1px solid ${color}`,
  padding: '4px 10px',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'all 0.2s',
  textTransform: 'uppercase'
});

