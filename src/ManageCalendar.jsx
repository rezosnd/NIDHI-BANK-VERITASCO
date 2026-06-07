import { useState, useEffect } from 'react';

/* ─── Shared design tokens ─────────────────────────────────────────────── */
const G = {
  card: {
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.75)',
    borderRadius: '14px',
    boxShadow: '0 8px 32px rgba(31,38,135,0.08), inset 0 0 20px rgba(255,255,255,0.4)',
  },
  input: {
    width: '100%', padding: '7px 11px', fontSize: '12px', height: '34px',
    border: '1px solid rgba(148,163,184,0.5)', borderRadius: '8px', color: '#1e293b',
    background: 'rgba(255,255,255,0.7)', outline: 'none', transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  label: {
    fontSize: '10px', fontWeight: '700', color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '5px', display: 'block',
  },
  btnPrimary: {
    padding: '7px 18px', background: 'linear-gradient(135deg, #1e40af, #2563eb)',
    color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
    cursor: 'pointer', boxShadow: '0 3px 10px rgba(37,99,235,0.3)', transition: 'all 0.2s',
    letterSpacing: '0.3px',
  },
  btnGhost: {
    padding: '7px 16px', background: 'rgba(255,255,255,0.6)', color: '#475569',
    border: '1px solid rgba(148,163,184,0.4)', borderRadius: '8px', fontSize: '12px',
    fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
  },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/* ─── Source legend ─────────────────────────────────────────────────────── */
const SOURCE_META = {
  calendar: { label: 'Note',    color: '#2563eb', light: '#dbeafe' },
  event:    { label: 'Event',   color: '#7c3aed', light: '#ede9fe' },
  holiday:  { label: 'Holiday', color: '#be123c', light: '#ffe4e6' },
};

function toDateStr(raw) {
  const d = new Date(raw);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function ManageCalendar() {
  const [curDate,   setCurDate]   = useState(new Date());
  const [calItems,  setCalItems]  = useState([]); // calendar_events
  const [evItems,   setEvItems]   = useState([]); // company_events
  const [holItems,  setHolItems]  = useState([]); // holidays
  const [loading,   setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selDate,   setSelDate]   = useState('');
  const [dayPanel,  setDayPanel]  = useState(null); // {dateStr, items[]}
  const [form,      setForm]      = useState({ title:'', description:'', event_color:'#2563eb' });
  const [notif,     setNotif]     = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const toast = (msg, type='success') => { setNotif({msg,type}); setTimeout(()=>setNotif(null),3500); };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const tok = localStorage.getItem('authToken');
      const h = { 'Authorization': `Bearer ${tok}` };
      const [r1, r2, r3] = await Promise.all([
        fetch('/api/calendar-events', { headers: h }),
        fetch('/api/events',          { headers: h }),
        fetch('/api/holidays',        { headers: h }),
      ]);
      if (r1.ok) setCalItems(await r1.json());
      if (r2.ok) setEvItems(await r2.json());
      if (r3.ok) setHolItems(await r3.json());
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const tok = localStorage.getItem('authToken');
      const res = await fetch('/api/calendar-events', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tok}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ ...form, event_date: selDate }),
      });
      const d = await res.json();
      if (res.ok) { toast(d.message); setShowModal(false); setForm({title:'',description:'',event_color:'#2563eb'}); fetchAll(); }
      else toast(d.error||'Failed','error');
    } catch(e){ toast('Server error','error'); }
    finally { setLoading(false); }
  };

  const handleDelCal = async (id) => {
    const tok = localStorage.getItem('authToken');
    await fetch(`/api/calendar-events/${id}`, { method:'DELETE', headers:{'Authorization':`Bearer ${tok}`} });
    toast('Note removed'); fetchAll();
    setDayPanel(null);
  };

  const year  = curDate.getFullYear();
  const month = curDate.getMonth();
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth= new Date(year, month+1, 0).getDate();
  const prevDays   = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDay-1; i>=0; i--) cells.push({day:prevDays-i, cur:false});
  for (let i = 1; i<=daysInMonth; i++) cells.push({day:i, cur:true, year, month});
  const rem = 42 - cells.length;
  for (let i=1;i<=rem;i++) cells.push({day:i,cur:false});

  const getItems = (y,m,d) => {
    const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const items = [];
    calItems.forEach(x => { if(toDateStr(x.event_date)===ds) items.push({...x, _src:'calendar', _color:x.event_color||'#2563eb'}); });
    evItems.forEach(x  => { if(toDateStr(x.event_date)===ds)  items.push({...x, _src:'event',   _color:'#7c3aed', title:x.title}); });
    holItems.forEach(x => { if(toDateStr(x.holiday_date)===ds) items.push({...x, _src:'holiday', _color:'#be123c', title:x.holiday_name}); });
    return items;
  };

  const openDay = (y,m,d) => {
    const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const items = getItems(y,m,d);
    setSelDate(ds);
    if (items.length>0) { setDayPanel({dateStr:ds, items}); }
    else { setShowModal(true); }
  };

  return (
    <div style={{padding:'0 0 4rem', fontFamily:"'Inter',system-ui,sans-serif"}}>
      {loading && <Loader/>}
      {notif && <Toast msg={notif.msg} type={notif.type}/>}

      {/* Header */}
      <div style={{marginBottom:'1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
        <div>
          <h2 style={{margin:0,fontSize:'1.1rem',fontWeight:'800',color:'#0f172a',letterSpacing:'-0.02em'}}>Manage Calendar</h2>
          <p style={{margin:'2px 0 0',fontSize:'11px',color:'#64748b',fontWeight:'500'}}>All events, notes & holidays in one view</p>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          {/* Legend */}
          <div style={{display:'flex',gap:'10px',marginRight:'8px'}}>
            {Object.entries(SOURCE_META).map(([k,v])=>(
              <div key={k} style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'10px',fontWeight:'700',color:v.color}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:v.color}}/>
                {v.label}
              </div>
            ))}
          </div>
          <button onClick={()=>{setSelDate(toDateStr(new Date()));setShowModal(true);}} style={G.btnPrimary}>
            + Add Note
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div style={{...G.card, overflow:'hidden'}}>
        {/* Nav */}
        <div style={{padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(255,255,255,0.5)',background:'rgba(255,255,255,0.35)'}}>
          <h3 style={{margin:0,fontSize:'15px',fontWeight:'800',color:'#0f172a'}}>{MONTHS[month]} {year}</h3>
          <div style={{display:'flex',gap:'6px'}}>
            {[['← Prev',()=>setCurDate(new Date(year,month-1,1))],['Today',()=>setCurDate(new Date())],['Next →',()=>setCurDate(new Date(year,month+1,1))]].map(([l,fn])=>(
              <button key={l} onClick={fn} style={{...G.btnGhost,padding:'5px 12px',fontSize:'11px'}}>{l}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:'rgba(226,232,240,0.4)',gap:'1px'}}>
          {DAYS.map(d=>(
            <div key={d} style={{background:'rgba(255,255,255,0.6)',padding:'10px 6px',textAlign:'center',fontSize:'10px',fontWeight:'700',color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.5px'}}>{d}</div>
          ))}
          {cells.map((cell,idx)=>{
            const isToday = cell.cur && cell.day===new Date().getDate() && cell.month===new Date().getMonth() && cell.year===new Date().getFullYear();
            const items = cell.cur ? getItems(cell.year,cell.month,cell.day) : [];
            return (
              <div key={idx} onClick={()=>cell.cur&&openDay(cell.year,cell.month,cell.day)}
                style={{background:cell.cur?(isToday?'rgba(239,246,255,0.9)':'rgba(255,255,255,0.6)'):'rgba(248,250,252,0.4)',
                  minHeight:'100px',padding:'8px 6px',cursor:cell.cur?'pointer':'default',transition:'background 0.15s',
                  color:cell.cur?'#0f172a':'#cbd5e1'}}
                onMouseOver={e=>{if(cell.cur&&!isToday)e.currentTarget.style.background='rgba(241,245,249,0.95)';}}
                onMouseOut={e=>{if(cell.cur&&!isToday)e.currentTarget.style.background='rgba(255,255,255,0.6)';}}
              >
                <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'22px',height:'22px',borderRadius:'50%',
                  background:isToday?'#2563eb':'transparent',color:isToday?'#fff':undefined,fontSize:'12px',fontWeight:'700',marginBottom:'5px'}}>
                  {cell.day}
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
                  {items.slice(0,3).map((item,i)=>(
                    <div key={i} style={{background:item._color,color:'#fff',borderRadius:'4px',padding:'2px 5px',fontSize:'9.5px',fontWeight:'600',
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',letterSpacing:'0.2px'}}>
                      {item.title}
                    </div>
                  ))}
                  {items.length>3 && <div style={{fontSize:'9px',color:'#64748b',fontWeight:'600',paddingLeft:'2px'}}>+{items.length-3} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Detail Panel */}
      {dayPanel && (
        <Modal onClose={()=>setDayPanel(null)}>
          <ModalHeader title={`Events on ${new Date(dayPanel.dateStr+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}`} onClose={()=>setDayPanel(null)}/>
          <div style={{padding:'16px 20px',display:'flex',flexDirection:'column',gap:'8px'}}>
            {dayPanel.items.map((item,i)=>{
              const meta = SOURCE_META[item._src];
              return (
                <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'10px',padding:'10px 12px',background:meta.light,borderRadius:'8px',border:`1px solid ${meta.color}20`}}>
                  <div style={{width:'28px',height:'28px',borderRadius:'6px',background:meta.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:'10px',fontWeight:'700',color:'#fff'}}>{meta.label[0]}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'12px',fontWeight:'700',color:'#0f172a'}}>{item.title}</div>
                    {item.description && <div style={{fontSize:'11px',color:'#64748b',marginTop:'2px'}}>{item.description}</div>}
                    <div style={{fontSize:'10px',fontWeight:'600',color:meta.color,marginTop:'3px',textTransform:'uppercase',letterSpacing:'0.4px'}}>{meta.label}</div>
                  </div>
                  {item._src==='calendar' && (
                    <button onClick={()=>handleDelCal(item.id)} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:'16px',lineHeight:1,flexShrink:0}}>×</button>
                  )}
                </div>
              );
            })}
            <button onClick={()=>{setDayPanel(null);setShowModal(true);}} style={{...G.btnPrimary,marginTop:'6px',width:'100%'}}>+ Add Note for this Day</button>
          </div>
        </Modal>
      )}

      {/* Add Note Modal */}
      {showModal && (
        <Modal onClose={()=>setShowModal(false)}>
          <ModalHeader title="Add Calendar Note" onClose={()=>setShowModal(false)}/>
          <form onSubmit={handleAdd} style={{padding:'20px'}}>
            <div style={{marginBottom:'14px'}}>
              <label style={G.label}>Date</label>
              <input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)} style={G.input} required/>
            </div>
            <div style={{marginBottom:'14px'}}>
              <label style={G.label}>Title *</label>
              <input type="text" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={G.input} placeholder="Note title..." required/>
            </div>
            <div style={{marginBottom:'14px'}}>
              <label style={G.label}>Description</label>
              <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{...G.input,height:'70px',resize:'vertical'}} placeholder="Optional details..."/>
            </div>
            <div style={{marginBottom:'18px'}}>
              <label style={G.label}>Color</label>
              <div style={{display:'flex',gap:'8px'}}>
                {['#2563eb','#7c3aed','#059669','#d97706','#dc2626','#0891b2'].map(c=>(
                  <div key={c} onClick={()=>setForm({...form,event_color:c})} style={{width:'26px',height:'26px',borderRadius:'50%',background:c,cursor:'pointer',
                    border:form.event_color===c?'3px solid #0f172a':'2px solid transparent',boxShadow:'0 2px 4px rgba(0,0,0,0.15)',transition:'all 0.15s'}}/>
                ))}
              </div>
            </div>
            <div style={{display:'flex',gap:'8px',justifyContent:'flex-end'}}>
              <button type="button" onClick={()=>setShowModal(false)} style={G.btnGhost}>Cancel</button>
              <button type="submit" style={G.btnPrimary}>Save Note</button>
            </div>
          </form>
        </Modal>
      )}

      <Styles/>
    </div>
  );
}

/* ── Shared micro-components ────────────────────────────────────────────── */
export function Loader() {
  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.45)',zIndex:9998,backdropFilter:'blur(3px)'}}>
      <div style={{display:'flex',gap:'7px'}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:'9px',height:'9px',background:'#2563eb',borderRadius:'50%',animation:`calBounce 1.2s ${i*0.2}s infinite ease-in-out both`}}/>)}
      </div>
    </div>
  );
}

export function Toast({msg,type}) {
  return (
    <div style={{position:'fixed',top:'20px',right:'20px',zIndex:9999,padding:'12px 20px',borderRadius:'10px',color:'#fff',fontSize:'12px',fontWeight:'700',
      background:type==='error'?'linear-gradient(135deg,#ef4444,#dc2626)':'linear-gradient(135deg,#10b981,#059669)',
      boxShadow:'0 10px 30px rgba(0,0,0,0.15)',animation:'calSlideIn 0.3s ease-out',display:'flex',alignItems:'center',gap:'8px',letterSpacing:'0.2px'}}>
      <span style={{fontSize:'14px'}}>{type==='error'?'✕':'✓'}</span> {msg}
    </div>
  );
}

export function Modal({children,onClose}) {
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.55)',backdropFilter:'blur(6px)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:9999,animation:'calFade 0.2s ease'}}>
      <div style={{...G.card,width:'90%',maxWidth:'440px',overflow:'hidden',animation:'calUp 0.3s ease',maxHeight:'90vh',overflowY:'auto',background:'rgba(255,255,255,0.92)',backdropFilter:'blur(40px)',WebkitBackdropFilter:'blur(40px)'}}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({title,onClose}) {
  return (
    <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#0f172a,#1e3a8a)',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
      <h3 style={{margin:0,color:'#fff',fontSize:'13px',fontWeight:'700',letterSpacing:'-0.01em'}}>{title}</h3>
      <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,0.6)',fontSize:'20px',cursor:'pointer',lineHeight:1,padding:'0 2px',transition:'color 0.15s'}}
        onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='rgba(255,255,255,0.6)'}>×</button>
    </div>
  );
}

export function ConfirmModal({title,message,onConfirm,onCancel}) {
  return (
    <Modal onClose={onCancel}>
      <ModalHeader title="Confirm Action" onClose={onCancel}/>
      <div style={{padding:'24px 20px',textAlign:'center'}}>
        <div style={{width:'46px',height:'46px',background:'#fee2e2',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </div>
        <p style={{margin:'0 0 6px',fontSize:'13px',fontWeight:'700',color:'#0f172a'}}>{title}</p>
        <p style={{margin:'0 0 20px',fontSize:'11.5px',color:'#64748b'}}>{message}</p>
        <div style={{display:'flex',gap:'8px',justifyContent:'center'}}>
          <button onClick={onCancel} style={G.btnGhost}>Cancel</button>
          <button onClick={onConfirm} style={{...G.btnPrimary,background:'linear-gradient(135deg,#b91c1c,#dc2626)'}}>Yes, Delete</button>
        </div>
      </div>
    </Modal>
  );
}

export { G };

function Styles() {
  return (
    <style>{`
      @keyframes calFade  { from{opacity:0}         to{opacity:1} }
      @keyframes calUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      @keyframes calSlideIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
      @keyframes calBounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
      *{box-sizing:border-box;}
    `}</style>
  );
}

export default ManageCalendar;
