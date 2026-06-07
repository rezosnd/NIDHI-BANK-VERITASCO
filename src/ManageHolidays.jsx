import { useState, useEffect } from 'react';
import { G, Loader, Toast, Modal, ModalHeader, ConfirmModal } from './ManageCalendar';

const HOLIDAY_TYPES = ['Public','Bank','Optional','Regional','National'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const TYPE_COLORS = {
  Public:   { bg:'#d1fae5', text:'#065f46', dot:'#10b981' },
  Bank:     { bg:'#dbeafe', text:'#1e40af', dot:'#3b82f6' },
  Optional: { bg:'#fef9c3', text:'#854d0e', dot:'#eab308' },
  Regional: { bg:'#ede9fe', text:'#6d28d9', dot:'#8b5cf6' },
  National: { bg:'#fce7f3', text:'#9d174d', dot:'#ec4899' },
};

const EMPTY = { holiday_name:'', holiday_date:'', holiday_type:'Public', description:'', status:'Active' };

function ManageHolidays() {
  const [holidays,    setHolidays]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [form,        setForm]        = useState(EMPTY);
  const [notif,       setNotif]       = useState(null);
  const [search,      setSearch]      = useState('');
  const [filterType,  setFilterType]  = useState('');
  const [filterYear,  setFilterYear]  = useState(String(new Date().getFullYear()));
  const [viewMode,    setViewMode]    = useState('table'); // 'table' | 'year'
  const [delTarget,   setDelTarget]   = useState(null);

  useEffect(()=>{ fetchHolidays(); },[]);

  const toast = (msg,type='success') => { setNotif({msg,type}); setTimeout(()=>setNotif(null),3500); };

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const tok = localStorage.getItem('authToken');
      const res = await fetch('/api/holidays',{headers:{'Authorization':`Bearer ${tok}`}});
      if(res.ok) setHolidays(await res.json());
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  };

  const openAdd  = () => { setForm(EMPTY); setEditingId(null); setShowModal(true); };
  const openEdit = (h) => {
    setForm({
      holiday_name: h.holiday_name, holiday_date: h.holiday_date?.slice(0,10)||'',
      holiday_type: h.holiday_type||'Public', description: h.description||'', status: h.status||'Active',
    });
    setEditingId(h.id); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const tok = localStorage.getItem('authToken');
      const res = await fetch(editingId?`/api/holidays/${editingId}`:'/api/holidays',{
        method: editingId?'PUT':'POST',
        headers:{'Authorization':`Bearer ${tok}`,'Content-Type':'application/json'},
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if(res.ok){ toast(d.message); setShowModal(false); fetchHolidays(); }
      else toast(d.error||'Failed','error');
    } catch(e){ toast('Server error','error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    setLoading(true); setDelTarget(null);
    try {
      const tok = localStorage.getItem('authToken');
      const res = await fetch(`/api/holidays/${id}`,{method:'DELETE',headers:{'Authorization':`Bearer ${tok}`}});
      const d = await res.json();
      if(res.ok){ toast(d.message); fetchHolidays(); }
      else toast(d.error||'Failed','error');
    } catch(e){ toast('Server error','error'); }
    finally { setLoading(false); }
  };

  const years = [...new Set(holidays.map(h=>new Date(h.holiday_date).getFullYear()))].sort((a,b)=>b-a);

  const filtered = holidays.filter(h=>{
    const mSearch = !search || h.holiday_name?.toLowerCase().includes(search.toLowerCase());
    const mType   = !filterType || h.holiday_type===filterType;
    const mYear   = !filterYear || String(new Date(h.holiday_date).getFullYear())===filterYear;
    return mSearch && mType && mYear;
  });

  // Group by month for year view
  const byMonth = {};
  filtered.forEach(h=>{
    const m = new Date(h.holiday_date).getMonth();
    if(!byMonth[m]) byMonth[m]=[];
    byMonth[m].push(h);
  });

  const totalByType = HOLIDAY_TYPES.map(t=>({type:t, count:filtered.filter(h=>h.holiday_type===t).length, ...TYPE_COLORS[t]}));

  return (
    <div style={{padding:'0 0 4rem',fontFamily:"'Inter',system-ui,sans-serif"}}>
      {loading && <Loader/>}
      {notif   && <Toast msg={notif.msg} type={notif.type}/>}

      {/* Header */}
      <div style={{marginBottom:'1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
        <div>
          <h2 style={{margin:0,fontSize:'1.1rem',fontWeight:'800',color:'#0f172a',letterSpacing:'-0.02em'}}>Manage Holidays</h2>
          <p style={{margin:'2px 0 0',fontSize:'11px',color:'#64748b',fontWeight:'500'}}>{filtered.length} holiday{filtered.length!==1?'s':''} in {filterYear||'all years'}</p>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          {/* View Toggle */}
          <div style={{display:'flex',background:'rgba(241,245,249,0.8)',borderRadius:'8px',padding:'3px',border:'1px solid rgba(203,213,225,0.5)'}}>
            {[{v:'table',icon:'☰'},{v:'year',icon:'📅'}].map(({v,icon})=>(
              <button key={v} onClick={()=>setViewMode(v)} style={{padding:'4px 12px',borderRadius:'6px',border:'none',fontSize:'11px',fontWeight:'700',cursor:'pointer',
                background:viewMode===v?'#fff':'transparent',color:viewMode===v?'#0f172a':'#94a3b8',
                boxShadow:viewMode===v?'0 1px 4px rgba(0,0,0,0.1)':'none',transition:'all 0.2s'}}>
                {icon} {v==='table'?'Table':'Year View'}
              </button>
            ))}
          </div>
          <button onClick={openAdd} style={G.btnPrimary}>
            <span style={{display:'flex',alignItems:'center',gap:'5px'}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Holiday
            </span>
          </button>
        </div>
      </div>

      {/* Type Stats — clickable */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'10px',marginBottom:'16px'}}>
        {totalByType.map(t=>(
          <div key={t.type} onClick={()=>setFilterType(filterType===t.type?'':t.type)}
            style={{...G.card,padding:'12px 14px',cursor:'pointer',transition:'all 0.2s',
              outline:filterType===t.type?`2px solid ${t.dot}`:'2px solid transparent',
              background:filterType===t.type?t.bg:'rgba(255,255,255,0.55)'}}>
            <div style={{fontSize:'18px',fontWeight:'800',color:t.text}}>{t.count}</div>
            <div style={{display:'flex',alignItems:'center',gap:'4px',marginTop:'3px'}}>
              <div style={{width:'5px',height:'5px',borderRadius:'50%',background:t.dot}}/>
              <span style={{fontSize:'10px',fontWeight:'700',color:t.text,textTransform:'uppercase',letterSpacing:'0.5px'}}>{t.type}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{...G.card,padding:'14px 16px',marginBottom:'16px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'10px',alignItems:'end'}}>
          <div>
            <label style={G.label}>Search</label>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Holiday name..." style={G.input}/>
          </div>
          <div>
            <label style={G.label}>Type</label>
            <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={G.input}>
              <option value="">All Types</option>
              {HOLIDAY_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={G.label}>Year</label>
            <select value={filterYear} onChange={e=>setFilterYear(e.target.value)} style={G.input}>
              <option value="">All Years</option>
              {(years.length?years:[new Date().getFullYear()]).map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {(search||filterType) && (
            <div style={{paddingTop:'15px'}}>
              <button onClick={()=>{setSearch('');setFilterType('');}} style={{...G.btnGhost,fontSize:'11px',height:'34px',width:'100%'}}>Clear</button>
            </div>
          )}
        </div>
      </div>

      {/* ── TABLE VIEW ────────────────────────────────────────── */}
      {viewMode==='table' && (
        <div style={{...G.card,overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:'700px'}}>
              <thead>
                <tr style={{background:'linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,58,138,0.85))'}}>
                  {['#','Holiday Name','Date','Day','Type','Description','Status','Actions'].map(h=>(
                    <th key={h} style={{padding:'10px 12px',textAlign:h==='#'?'center':'left',fontSize:'10px',fontWeight:'700',color:'rgba(255,255,255,0.85)',textTransform:'uppercase',letterSpacing:'0.5px',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan="8" style={{padding:'36px',textAlign:'center',color:'#94a3b8',fontSize:'12px'}}>No holidays found. Click "Add Holiday" to get started.</td></tr>
                ) : filtered.map((h,idx)=>{
                  const d = new Date(h.holiday_date);
                  const tc = TYPE_COLORS[h.holiday_type]||TYPE_COLORS.Public;
                  const isWknd = d.getDay()===0||d.getDay()===6;
                  return (
                    <tr key={h.id} style={{borderBottom:'1px solid rgba(226,232,240,0.6)',transition:'background 0.15s'}}
                      onMouseOver={e=>e.currentTarget.style.background='rgba(241,245,249,0.6)'}
                      onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'10px 12px',textAlign:'center',fontSize:'11px',color:'#94a3b8',fontWeight:'600'}}>{idx+1}</td>
                      <td style={{padding:'10px 12px',fontSize:'12px',fontWeight:'700',color:'#0f172a'}}>{h.holiday_name}</td>
                      <td style={{padding:'10px 12px',fontSize:'11.5px',fontWeight:'600',color:'#334155'}}>{d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</td>
                      <td style={{padding:'10px 12px',fontSize:'11px',fontWeight:isWknd?'700':'500',color:isWknd?'#dc2626':'#64748b'}}>{d.toLocaleDateString('en',{weekday:'long'})}</td>
                      <td style={{padding:'10px 12px'}}>
                        <span style={{padding:'3px 9px',borderRadius:'20px',fontSize:'10px',fontWeight:'700',background:tc.bg,color:tc.text,display:'inline-flex',alignItems:'center',gap:'4px'}}>
                          <span style={{width:'5px',height:'5px',borderRadius:'50%',background:tc.dot,display:'inline-block'}}/>
                          {h.holiday_type}
                        </span>
                      </td>
                      <td style={{padding:'10px 12px',fontSize:'11px',color:'#64748b',maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{h.description||<span style={{color:'#cbd5e1'}}>—</span>}</td>
                      <td style={{padding:'10px 12px'}}>
                        <span style={{padding:'3px 9px',borderRadius:'20px',fontSize:'10px',fontWeight:'700',background:h.status==='Active'?'#d1fae5':'#f1f5f9',color:h.status==='Active'?'#065f46':'#475569'}}>{h.status}</span>
                      </td>
                      <td style={{padding:'10px 12px'}}>
                        <div style={{display:'flex',gap:'5px'}}>
                          <button onClick={()=>openEdit(h)} style={{padding:'4px 10px',background:'rgba(219,234,254,0.8)',color:'#1d4ed8',border:'none',borderRadius:'6px',fontSize:'10.5px',fontWeight:'700',cursor:'pointer'}}>Edit</button>
                          <button onClick={()=>setDelTarget(h)} style={{padding:'4px 10px',background:'rgba(254,226,226,0.8)',color:'#b91c1c',border:'none',borderRadius:'6px',fontSize:'10.5px',fontWeight:'700',cursor:'pointer'}}>Del</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── YEAR VIEW ─────────────────────────────────────────── */}
      {viewMode==='year' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'12px'}}>
          {MONTHS.map((mon,mIdx)=>{
            const mHols = (byMonth[mIdx]||[]).sort((a,b)=>new Date(a.holiday_date)-new Date(b.holiday_date));
            const hasHols = mHols.length>0;
            return (
              <div key={mIdx} style={{...G.card,overflow:'hidden',transition:'transform 0.2s'}}
                onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'}
                onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',
                  background:hasHols?'linear-gradient(135deg,rgba(15,23,42,0.85),rgba(30,58,138,0.8))':'rgba(248,250,252,0.7)',
                  borderBottom:'1px solid rgba(255,255,255,0.3)'}}>
                  <span style={{fontWeight:'800',fontSize:'12px',color:hasHols?'#fff':'#94a3b8'}}>{mon}</span>
                  <span style={{fontSize:'10px',fontWeight:'700',color:hasHols?'rgba(147,197,253,0.9)':'#cbd5e1'}}>{mHols.length} holiday{mHols.length!==1?'s':''}</span>
                </div>
                {mHols.length===0 ? (
                  <div style={{padding:'16px',fontSize:'11px',color:'#cbd5e1',textAlign:'center'}}>No holidays this month</div>
                ) : (
                  <div>
                    {mHols.map(h=>{
                      const d  = new Date(h.holiday_date);
                      const tc = TYPE_COLORS[h.holiday_type]||TYPE_COLORS.Public;
                      return (
                        <div key={h.id} style={{padding:'9px 14px',display:'flex',alignItems:'center',gap:'10px',borderBottom:'1px solid rgba(241,245,249,0.8)'}}>
                          <div style={{minWidth:'36px',textAlign:'center',background:tc.bg,borderRadius:'7px',padding:'5px 3px'}}>
                            <div style={{fontSize:'15px',fontWeight:'800',color:tc.text,lineHeight:1}}>{d.getDate()}</div>
                            <div style={{fontSize:'8.5px',fontWeight:'700',color:tc.text,textTransform:'uppercase'}}>{d.toLocaleDateString('en',{weekday:'short'})}</div>
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:'11.5px',fontWeight:'700',color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{h.holiday_name}</div>
                            <span style={{fontSize:'9px',fontWeight:'700',color:tc.text,textTransform:'uppercase',letterSpacing:'0.4px'}}>{h.holiday_type}</span>
                          </div>
                          <button onClick={()=>openEdit(h)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer',fontSize:'13px',padding:'2px',borderRadius:'4px',flexShrink:0}}>✎</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal onClose={()=>setShowModal(false)}>
          <ModalHeader title={editingId?'Edit Holiday':'Add Holiday'} onClose={()=>setShowModal(false)}/>
          <form onSubmit={handleSubmit} style={{padding:'18px 20px'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              <div style={{gridColumn:'1/-1'}}>
                <label style={G.label}>Holiday Name *</label>
                <input type="text" value={form.holiday_name} onChange={e=>setForm({...form,holiday_name:e.target.value})} style={G.input} placeholder="Diwali, Republic Day..." required/>
              </div>
              <div>
                <label style={G.label}>Date *</label>
                <input type="date" value={form.holiday_date} onChange={e=>setForm({...form,holiday_date:e.target.value})} style={G.input} required/>
              </div>
              <div>
                <label style={G.label}>Holiday Type *</label>
                <select value={form.holiday_type} onChange={e=>setForm({...form,holiday_type:e.target.value})} style={G.input}>
                  {HOLIDAY_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              {editingId&&(
                <div>
                  <label style={G.label}>Status</label>
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={G.input}>
                    <option>Active</option><option>Inactive</option>
                  </select>
                </div>
              )}
              <div style={{gridColumn:editingId?'2/-1':'1/-1'}}>
                <label style={G.label}>Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{...G.input,height:'65px',resize:'vertical'}} placeholder="Optional note..."/>
              </div>
            </div>
            <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',marginTop:'16px'}}>
              <button type="button" onClick={()=>setShowModal(false)} style={G.btnGhost}>Cancel</button>
              <button type="submit" style={G.btnPrimary}>{editingId?'Update':'Save Holiday'}</button>
            </div>
          </form>
        </Modal>
      )}

      {delTarget&&<ConfirmModal title="Delete Holiday?" message={`"${delTarget.holiday_name}" will be permanently removed.`} onConfirm={()=>handleDelete(delTarget.id)} onCancel={()=>setDelTarget(null)}/>}

      <style>{`@keyframes calFade{from{opacity:0}to{opacity:1}} @keyframes calUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}} @keyframes calSlideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}} @keyframes calBounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}} *{box-sizing:border-box;}`}</style>
    </div>
  );
}

export default ManageHolidays;
