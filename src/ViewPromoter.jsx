import { useState, useEffect } from 'react';

function ViewPromoter() {
  const [promoters, setPromoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPromoter, setEditingPromoter] = useState(null);

  const fetchPromoters = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/promoters', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPromoters(data);
    } catch (err) {
      setError('Failed to fetch promoters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoters();
  }, []);

  const handleSetActive = async (id) => {
    if (!window.confirm('Are you sure you want to change the share transfer active member? if u change then previous member deactivate.')) {
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/promoters/${id}/active`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchPromoters(); // Re-fetch the updated list
      }
    } catch (err) {
      console.error(err);
      alert('Failed to set active promoter');
      setLoading(false);
    }
  };

  const handleEditClick = (promoter) => {
    setEditingPromoter(promoter);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/promoters/${editingPromoter.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingPromoter)
      });
      if (response.ok) {
        setEditingPromoter(null);
        await fetchPromoters();
      } else {
        throw new Error('Failed to update');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update promoter');
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingPromoter(prev => ({ ...prev, [name]: name === 'no_of_share' ? parseInt(value) || 0 : value }));
  };

  const totalShares = promoters.reduce((acc, p) => acc + (p.no_of_share || 0), 0);

  return (
    <>
      {loading && (
        <div className="loader-overlay">
          <div className="dotted-loader">
            <div className="dot"></div><div className="dot"></div>
            <div className="dot"></div><div className="dot"></div>
            <div className="dot"></div><div className="dot"></div>
            <div className="dot"></div><div className="dot"></div>
          </div>
        </div>
      )}
      <div style={{ padding: '0 1rem' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '0.6rem 1rem', borderRadius: '6px', marginBottom: '1.5rem', color: '#f8fafc', fontWeight: '600', textAlign: 'center', fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        For Working On This Part Please Consult Your Auditor Or Chartered Accountant
      </div>

      <div style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 'bold' }}>
        Total No Of Share Allocated : <span style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{totalShares} Shares</span>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border-soft)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-soft)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-main)', fontWeight: '700' }}>Sl No</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-main)', fontWeight: '700' }}>Member Id</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-main)', fontWeight: '700' }}>Member Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-main)', fontWeight: '700' }}>Din No</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-main)', fontWeight: '700' }}>Appoint. Date</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-main)', fontWeight: '700' }}>Resignation Date</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-main)', fontWeight: '700' }}>No Of Share</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-main)', fontWeight: '700' }}>Authorize</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-main)', fontWeight: '700' }}>Promoter</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-main)', fontWeight: '700' }}>Share Trf Active Mem</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-main)', fontWeight: '700' }}>Edit</th>
            </tr>
          </thead>
          <tbody>
            {promoters.map((p, idx) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-soft)', backgroundColor: idx % 2 === 0 ? 'white' : '#f8fafc', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '1rem' }}>{idx + 1}</td>
                <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--primary)' }}>{p.member_id}</td>
                <td style={{ padding: '1rem', fontWeight: '600' }}>{p.member_name}</td>
                <td style={{ padding: '1rem' }}>{p.din_no || '-'}</td>
                <td style={{ padding: '1rem' }}>{p.appoint_date}</td>
                <td style={{ padding: '1rem' }}>{p.resignation_date || '-'}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>{p.no_of_share}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: p.authorize === 'Yes' ? '#16a34a' : '#ef4444', fontWeight: 'bold' }}>{p.authorize}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: p.promoter_type === 'Director' ? '#16a34a' : 'var(--primary)', fontWeight: '600' }}>{p.promoter_type}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  {p.is_active_share_trf ? (
                    <button 
                      style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 4px rgba(22,163,74,0.2)' }}
                      onClick={() => handleSetActive(p.id)}
                    >
                      Active
                    </button>
                  ) : (
                    <button 
                      style={{ backgroundColor: 'white', color: 'var(--text-main)', border: '1px solid var(--border-soft)', padding: '0.4rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                      onClick={() => handleSetActive(p.id)}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = 'var(--border-soft)'; }}
                    >
                      Set Share Trf Member
                    </button>
                  )}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <button 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '0.25rem' }} 
                    title="Edit"
                    onClick={() => handleEditClick(p)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                </td>
              </tr>
            ))}
            {promoters.length === 0 && (
              <tr>
                <td colSpan="11" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No promoters found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {editingPromoter && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.25rem' }}>Edit Promoter</h3>
            <form onSubmit={handleEditSave}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Member Name</label>
                <input type="text" name="member_name" value={editingPromoter.member_name || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-soft)', outline: 'none' }} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No Of Share</label>
                  <input type="number" name="no_of_share" value={editingPromoter.no_of_share || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-soft)', outline: 'none' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Promoter Type</label>
                  <select name="promoter_type" value={editingPromoter.promoter_type || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-soft)', outline: 'none', backgroundColor: 'white' }}>
                    <option value="Promoter">Promoter</option>
                    <option value="Director">Director</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Din No</label>
                  <input type="text" name="din_no" value={editingPromoter.din_no || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-soft)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Authorize</label>
                  <select name="authorize" value={editingPromoter.authorize || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-soft)', outline: 'none', backgroundColor: 'white' }}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setEditingPromoter(null)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-soft)', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.5rem 1.5rem', border: 'none', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default ViewPromoter;
