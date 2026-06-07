import { useState, useEffect } from 'react';
import { G, Loader, Toast, Modal, ModalHeader, ConfirmModal } from './ManageCalendar';

const EVENT_TYPES = ['General','Meeting','Training','Conference','Workshop','Ceremony','Other'];
const STATUS_OPTS = ['Upcoming','Ongoing','Completed','Cancelled'];

const TYPE_COLORS = {
  Meeting:    { bg:'#dbeafe', text:'#1d4ed8', dot:'#3b82f6' },
  Training:   { bg:'#fef9c3', text:'#854d0e', dot:'#eab308' },
  Conference: { bg:'#ede9fe', text:'#6d28d9', dot:'#8b5cf6' },
  Workshop:   { bg:'#d1fae5', text:'#065f46', dot:'#10b981' },
  Ceremony:   { bg:'#fce7f3', text:'#9d174d', dot:'#ec4899' },
  General:    { bg:'#f1f5f9', text:'#475569', dot:'#94a3b8' },
  Other:      { bg:'#e5e7eb', text:'#374151', dot:'#9ca3af' },
};
const STATUS_COLORS = {
  Upcoming:  { bg:'#dbeafe', text:'#1e40af' },
  Ongoing:   { bg:'#d1fae5', text:'#065f46' },
  Completed: { bg:'#f1f5f9', text:'#475569' },
  Cancelled: { bg:'#fee2e2', text:'#991b1b' },
};

const EMPTY = { title:'', description:'', event_date:'', event_time:'', venue:'', organizer:'', event_type:'General', status:'Upcoming' };

function ManageEvents() {
  const [events,      setEvents]      = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [form,        setForm]        = useState(EMPTY);
  const [notif,       setNotif]       = useState(null);
  const [search,      setSearch]      = useState('');
  const [filterType,  setFilterType]  = useState('');
  const [filterStatus,setFilterStatus]= useState('');
  const [delTarget,   setDelTarget]   = useState(null);

  useEffect(() => { fetchEvents(); }, []);

  const toast = (msg,type='success') => { setNotif({msg,type}); setTimeout(()=>setNotif(null),3500); };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const tok = localStorage.getItem('authToken');
      const res = await fetch('/api/events',{headers:{'Authorization':`Bearer ${tok}`}});
      if(res.ok) setEvents(await res.json());
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  };

  const openAdd  = () => { setForm(EMPTY); setEditingId(null); setShowModal(true); };
  const openEdit = (ev) => {
    setForm({
      title: ev.title, description: ev.description||'',
      event_date: ev.event_date?.slice(0,10)||'', event_time: ev.event_time||'',
      venue: ev.venue||'', organizer: ev.organizer||'',
      event_type: ev.event_type||'General', status: ev.status||'Upcoming',
    });
    setEditingId(ev.id); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const tok = localStorage.getItem('authToken');
      const res = await fetch(editingId?`/api/events/${editingId}`:'/api/events', {
        method: editingId?'PUT':'POST',
        headers:{'Authorization':`Bearer ${tok}`,'Content-Type':'application/json'},
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if(res.ok){ toast(d.message); setShowModal(false); fetchEvents(); }
      else toast(d.error||'Failed','error');
    } catch(e){ toast('Server error','error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    setLoading(true); setDelTarget(null);
    try {
      const tok = localStorage.getItem('authToken');
      const res = await fetch(`/api/events/${id}`,{method:'DELETE',headers:{'Authorization':`Bearer ${tok}`}});
      const d = await res.json();
      if(res.ok){ toast(d.message); fetchEvents(); }
      else toast(d.error||'Failed','error');
    } catch(e){ toast('Server error','error'); }
    finally { setLoading(false); }
  };

  const filtered = events.filter(ev => {
    const q = search.toLowerCase();
    const ms = !q || ev.title?.toLowerCase().includes(q) || ev.venue?.toLowerCase().includes(q) || ev.organizer?.toLowerCase().includes(q);
    return ms && (!filterType||ev.event_type===filterType) && (!filterStatus||ev.status===filterStatus);
  });

  // Stats
  const stats = STATUS_OPTS.map(s=>({ label:s, count:events.filter(e=>e.status===s).length, ...STATUS_COLORS[s] }));

  return (
    <div style={{padding:'0 0 4rem',fontFamily:"'Inter',system-ui,sans-serif"}}>
      {loading && <Loader/>}
      {notif   && <Toast msg={notif.msg} type={notif.type}/>}

      {/* Header */}
      <div style={{marginBottom:'1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
        <div>
          <h2 style={{margin:0,fontSize:'1.1rem',fontWeight:'800',color:'#0f172a',letterSpacing:'-0.02em'}}>Manage Events</h2>
          <p style={{margin:'2px 0 0',fontSize:'11px',color:'#64748b',fontWeight:'500'}}>{filtered.length} event{filtered.length!==1?'s':''} — all corporate events & meetings</p>
        </div>
        <button onClick={openAdd} style={G.btnPrimary}>
          <span style={{display:'flex',alignItems:'center',gap:'5px'}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Event
          </span>
        </button>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'16px'}}>
        {stats.map(s=>(
          <div key={s.label} onClick={()=>setFilterStatus(filterStatus===s.label?'':s.label)}
            style={{...G.card,padding:'12px 14px',cursor:'pointer',transition:'all 0.2s',outline:filterStatus===s.label?`2px solid ${s.text}`:'2px solid transparent'}}>
            <div style={{fontSize:'20px',fontWeight:'800',color:s.text}}>{s.count}</div>
            <div style={{fontSize:'10px',fontWeight:'700',color:s.text,marginTop:'2px',textTransform:'uppercase',letterSpacing:'0.5px'}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{...G.card,padding:'14px 16px',marginBottom:'16px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'10px',alignItems:'end'}}>
          <div>
            <label style={G.label}>Search</label>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Title, venue, organizer..." style={G.input}/>
          </div>
          <div>
            <label style={G.label}>Event Type</label>
            <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={G.input}>
              <option value="">All Types</option>
              {EVENT_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={G.label}>Status</label>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={G.input}>
              <option value="">All Status</option>
              {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          {(search||filterType||filterStatus) && (
            <div style={{paddingTop:'15px'}}>
              <button onClick={()=>{setSearch('');setFilterType('');setFilterStatus('');}} style={{...G.btnGhost,fontSize:'11px',height:'34px',width:'100%'}}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{...G.card,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'860px'}}>
            <thead>
              <tr style={{background:'linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,58,138,0.85))'}}>
                {['#','Title','Date & Time','Venue / Organizer','Type','Status','Actions'].map(h=>(
                  <th key={h} style={{padding:'10px 12px',textAlign:h==='#'?'center':'left',fontSize:'10px',fontWeight:'700',color:'rgba(255,255,255,0.85)',textTransform:'uppercase',letterSpacing:'0.5px',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan="7" style={{padding:'36px',textAlign:'center',color:'#94a3b8',fontSize:'12px'}}>No events found. Click "Add Event" to create one.</td></tr>
              ) : filtered.map((ev,idx)=>{
                const tc = TYPE_COLORS[ev.event_type]||TYPE_COLORS.General;
                const sc = STATUS_COLORS[ev.status]||STATUS_COLORS.Upcoming;
                return (
                  <tr key={ev.id} style={{borderBottom:'1px solid rgba(226,232,240,0.6)',transition:'background 0.15s'}}
                    onMouseOver={e=>e.currentTarget.style.background='rgba(241,245,249,0.6)'}
                    onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{padding:'10px 12px',textAlign:'center',fontSize:'11px',color:'#94a3b8',fontWeight:'600'}}>{idx+1}</td>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{fontSize:'12px',fontWeight:'700',color:'#0f172a'}}>{ev.title}</div>
                      {ev.description&&<div style={{fontSize:'10.5px',color:'#64748b',marginTop:'2px',maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.description}</div>}
                    </td>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{fontSize:'11.5px',fontWeight:'600',color:'#334155'}}>{ev.event_date?new Date(ev.event_date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'—'}</div>
                      {ev.event_time&&<div style={{fontSize:'10.5px',color:'#64748b',marginTop:'2px'}}>🕐 {ev.event_time}</div>}
                    </td>
                    <td style={{padding:'10px 12px'}}>
                      {ev.venue&&<div style={{fontSize:'11.5px',color:'#334155',fontWeight:'500'}}>📍 {ev.venue}</div>}
                      {ev.organizer&&<div style={{fontSize:'10.5px',color:'#64748b',marginTop:'2px'}}>👤 {ev.organizer}</div>}
                    </td>
                    <td style={{padding:'10px 12px'}}>
                      <span style={{padding:'3px 9px',borderRadius:'20px',fontSize:'10px',fontWeight:'700',background:tc.bg,color:tc.text,display:'inline-flex',alignItems:'center',gap:'4px'}}>
                        <span style={{width:'5px',height:'5px',borderRadius:'50%',background:tc.dot,display:'inline-block'}}/>
                        {ev.event_type}
                      </span>
                    </td>
                    <td style={{padding:'10px 12px'}}>
                      <span style={{padding:'3px 9px',borderRadius:'20px',fontSize:'10px',fontWeight:'700',background:sc.bg,color:sc.text}}>{ev.status}</span>
                    </td>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{display:'flex',gap:'5px'}}>
                        <button onClick={()=>openEdit(ev)} style={{padding:'4px 10px',background:'rgba(219,234,254,0.8)',color:'#1d4ed8',border:'none',borderRadius:'6px',fontSize:'10.5px',fontWeight:'700',cursor:'pointer'}}>Edit</button>
                        <button onClick={()=>setDelTarget(ev)} style={{padding:'4px 10px',background:'rgba(254,226,226,0.8)',color:'#b91c1c',border:'none',borderRadius:'6px',fontSize:'10.5px',fontWeight:'700',cursor:'pointer'}}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal onClose={()=>setShowModal(false)}>
          <ModalHeader title={editingId?'Edit Event':'Add New Event'} onClose={()=>setShowModal(false)}/>
          <form onSubmit={handleSubmit} style={{padding:'18px 20px'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              <div style={{gridColumn:'1/-1'}}>
                <label style={G.label}>Event Title *</label>
                <input type="text" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={G.input} placeholder="Annual General Meeting" required/>
              </div>
              <div>
                <label style={G.label}>Event Date *</label>
                <input type="date" value={form.event_date} onChange={e=>setForm({...form,event_date:e.target.value})} style={G.input} required/>
              </div>
              <div>
                <label style={G.label}>Time</label>
                <input type="time" value={form.event_time} onChange={e=>setForm({...form,event_time:e.target.value})} style={G.input}/>
              </div>
              <div>
                <label style={G.label}>Venue</label>
                <input type="text" value={form.venue} onChange={e=>setForm({...form,venue:e.target.value})} style={G.input} placeholder="Conference Hall A"/>
              </div>
              <div>
                <label style={G.label}>Organizer</label>
                <input type="text" value={form.organizer} onChange={e=>setForm({...form,organizer:e.target.value})} style={G.input} placeholder="HR Department"/>
              </div>
              <div>
                <label style={G.label}>Event Type</label>
                <select value={form.event_type} onChange={e=>setForm({...form,event_type:e.target.value})} style={G.input}>
                  {EVENT_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              {editingId&&(
                <div>
                  <label style={G.label}>Status</label>
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={G.input}>
                    {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div style={{gridColumn:'1/-1'}}>
                <label style={G.label}>Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{...G.input,height:'72px',resize:'vertical'}} placeholder="Event details, agenda..."/>
              </div>
            </div>
            <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',marginTop:'16px'}}>
              <button type="button" onClick={()=>setShowModal(false)} style={G.btnGhost}>Cancel</button>
              <button type="submit" style={G.btnPrimary}>{editingId?'Update Event':'Save Event'}</button>
            </div>
          </form>
        </Modal>
      )}

      {delTarget&&<ConfirmModal title="Delete Event?" message={`"${delTarget.title}" will be permanently removed.`} onConfirm={()=>handleDelete(delTarget.id)} onCancel={()=>setDelTarget(null)}/>}

      <style>{`@keyframes calFade{from{opacity:0}to{opacity:1}} @keyframes calUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}} @keyframes calSlideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}} @keyframes calBounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}} *{box-sizing:border-box;}`}</style>
    </div>
  );
}

export default ManageEvents;
