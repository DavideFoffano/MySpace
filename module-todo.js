/* ═══════════════════════════════════════════
   MODULE: TODO v3 + CALENDAR
   Kanban 3 colonne · quick-add bar · priorità tag · liste gestibili
═══════════════════════════════════════════ */

const PRI = {
  high:   { label:'Alta',  color:'#d45a5a', bg:'rgba(212,90,90,0.15)'   },
  medium: { label:'Media', color:'#d4b83a', bg:'rgba(212,184,58,0.15)'  },
  low:    { label:'Bassa', color:'#7aba7a', bg:'rgba(122,186,122,0.15)' },
};
const PRI_ORDER = { high:0, medium:1, low:2 };

const STATUS_COLS = ['todo','inprogress','done'];
const STATUS_META = {
  todo:       { label:'Da fare',    color:'#6aadcf' },
  inprogress: { label:'In corso',   color:'#d4943a' },
  done:       { label:'Completate', color:'#7aba7a' },
};

const DEFAULT_LISTS = [
  { id:'personal', name:'Personale', color:'#6aadcf' },
  { id:'work',     name:'Lavoro',    color:'#d4943a' },
];
const LIST_COLORS = ['#6aadcf','#d4943a','#7aba7a','#d4c9a8','#c96a6a','#9a7aba','#6acf9a','#cfb46a'];

const GCAL_SCOPES    = 'https://www.googleapis.com/auth/calendar';
const GCAL_AUTH_URL  = 'https://accounts.google.com/o/oauth2/v2/auth';
const GCAL_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GCAL_API       = 'https://www.googleapis.com/calendar/v3';
const DAY_NAMES_SHORT = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
const MONTH_NAMES = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
                     'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

/* ─── Helpers ─── */
function dueBadge(d){
  if(!d)return null;
  const dt=new Date(d+'T00:00:00'),now=new Date();now.setHours(0,0,0,0);
  const diff=Math.round((dt-now)/86400000);
  if(diff<0)  return{text:'Scaduta',color:'#d45a5a'};
  if(diff===0)return{text:'Oggi',   color:'#d4943a'};
  if(diff===1)return{text:'Domani', color:'#d4c9a8'};
  return{text:dt.toLocaleDateString('it',{day:'numeric',month:'short'}),color:'#6b6a5e'};
}
function isoDate(d){ return d.toISOString().slice(0,10); }
function startOfWeek(d){ const dt=new Date(d),day=dt.getDay(),diff=day===0?-6:1-day; dt.setDate(dt.getDate()+diff); dt.setHours(0,0,0,0); return dt; }
function addDays(d,n){ const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt; }
function sameDay(a,b){ return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }
function generateVerifier(l=64){ const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'; let s=''; for(let i=0;i<l;i++)s+=c[Math.floor(Math.random()*c.length)]; return s; }
async function generateChallenge(v){ const e=new TextEncoder().encode(v),d=await crypto.subtle.digest('SHA-256',e); return btoa(String.fromCharCode(...new Uint8Array(d))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function sortByPriority(arr){ return[...arr].sort((a,b)=>{ const pa=a.priority!=null?PRI_ORDER[a.priority]:3,pb=b.priority!=null?PRI_ORDER[b.priority]:3; return pa!==pb?pa-pb:(a.order||0)-(b.order||0); }); }
function sortByOrder(arr){ return[...arr].sort((a,b)=>(a.order||0)-(b.order||0)); }

function archiveOldDone(todos){
  const cutoff=Date.now()-86400000;
  const toArchive=todos.filter(t=>t.status==='done'&&t.doneAt&&t.doneAt<cutoff);
  if(!toArchive.length)return todos;
  LS.set('ms_todos_archived',(LS.get('ms_todos_archived')||[]).concat(toArchive));
  return todos.filter(t=>!(t.status==='done'&&t.doneAt&&t.doneAt<cutoff));
}

function migrateTodos(arr){
  return arr.map((t,i)=>({
    listId:'personal',priority:null,dueDate:null,subtasks:[],order:i,
    status:t.status||(t.done?'done':'todo'),
    doneAt:t.doneAt||(t.done?Date.now()-90000000:null),
    ...t,
  }));
}

/* ══════════════════════════════════════════
   SUBTASK INPUT
══════════════════════════════════════════ */
function SubtaskInput({onAdd}){
  const [val,setVal]=useState('');
  function submit(){ if(!val.trim())return; onAdd(val.trim()); setVal(''); }
  return(
    <div className="subtask-add-row">
      <input className="todo-input sm" placeholder="Aggiungi sotto-task..."
        value={val} onChange={e=>setVal(e.target.value)}
        onKeyDown={e=>e.key==='Enter'&&submit()}/>
      <button className="todo-add-btn sm" onClick={submit}>+</button>
    </div>
  );
}

/* ══════════════════════════════════════════
   TASK DETAIL OVERLAY
══════════════════════════════════════════ */
function TaskDetail({task,onSave,onDelete,onClose}){
  const [t,setT]=useState({...task,subtasks:task.subtasks||[]});
  function upd(k,v){ setT(p=>({...p,[k]:v})); }
  function changeStatus(s){
    setT(p=>({...p,status:s,doneAt:s==='done'?Date.now():null}));
  }
  function addSub(text){ setT(p=>({...p,subtasks:[...p.subtasks,{id:uuid(),text,done:false}]})); }
  function togSub(sid){ setT(p=>({...p,subtasks:p.subtasks.map(s=>s.id===sid?{...s,done:!s.done}:s)})); }
  function delSub(sid){ setT(p=>({...p,subtasks:p.subtasks.filter(s=>s.id!==sid)})); }

  const subTot=(t.subtasks||[]).length;
  const subDon=(t.subtasks||[]).filter(s=>s.done).length;

  return(
    <div className="overlay" onClick={()=>onSave(t)}>
      <div className="task-detail" onClick={e=>e.stopPropagation()}>
        <div className="td-hdr">
          <div className="td-title">Dettagli</div>
          <button className="td-close-btn" onClick={()=>onSave(t)}><Icon name="close" size={16}/></button>
        </div>
        <textarea className="td-textarea" value={t.text} rows={2}
          onChange={e=>upd('text',e.target.value)}/>

        <div className="td-label">Stato</div>
        <div className="td-status-row">
          {STATUS_COLS.map(s=>{
            const m=STATUS_META[s],act=t.status===s;
            return(<button key={s} className={`td-status-btn${act?' act':''}`}
              style={act?{background:m.color+'22',borderColor:m.color,color:m.color}:{}}
              onClick={()=>changeStatus(s)}>{m.label}</button>);
          })}
        </div>

        <div className="td-label">Priorità</div>
        <div className="pri-group">
          {Object.entries(PRI).map(([k,v])=>(
            <button key={k} className={`pri-pill${t.priority===k?' act':''}`}
              style={t.priority===k?{background:v.bg,borderColor:v.color,color:v.color}:{}}
              onClick={()=>upd('priority',t.priority===k?null:k)}>{v.label}</button>
          ))}
        </div>

        <div className="td-label">Scadenza</div>
        <input type="date" className="due-input full"
          value={t.dueDate||''} onChange={e=>upd('dueDate',e.target.value||null)}/>

        <div className="td-label">
          Sotto-task
          {subTot>0&&<span className="td-sub-count">{subDon}/{subTot}</span>}
        </div>
        {subTot>0&&(
          <div className="subtask-progress">
            <div className="subtask-bar" style={{width:`${Math.round(subDon/subTot*100)}%`}}/>
          </div>
        )}
        <div className="subtask-list">
          {(t.subtasks||[]).map(s=>(
            <div key={s.id} className="subtask-row">
              <button className={`todo-check sm${s.done?' on':''}`} onClick={()=>togSub(s.id)}>{s.done&&'✓'}</button>
              <span className={`subtask-text${s.done?' done':''}`}>{s.text}</span>
              <div className="todo-del" onClick={()=>delSub(s.id)}><Icon name="close" size={10}/></div>
            </div>
          ))}
          <SubtaskInput onAdd={addSub}/>
        </div>
        <div className="td-actions">
          <button className="btn-danger" onClick={()=>onDelete(t.id)}>Elimina</button>
          <button className="todo-add-btn" style={{flex:1,padding:12}} onClick={()=>onSave(t)}>Salva</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   KANBAN COLUMN
══════════════════════════════════════════ */
function KanbanColumn({status,tasks,onTaskClick,onReorder}){
  const [sortMode,setSortMode]=useState('priority');
  const [dragIdx, setDragIdx] =useState(null);
  const [dragOver,setDragOver]=useState(null);
  const touchRef=useRef(null);
  const bodyRef =useRef(null);

  const meta   =STATUS_META[status];
  const sorted =sortMode==='priority'?sortByPriority(tasks):sortByOrder(tasks);

  function doReorder(from,to){
    if(from===null||to===null||from===to)return;
    const arr=[...sorted];const[item]=arr.splice(from,1);arr.splice(to,0,item);
    setSortMode('manual');
    onReorder(arr.map((t,i)=>({...t,order:i})));
  }
  function onDragStart(e,i){ setDragIdx(i);e.dataTransfer.effectAllowed='move'; }
  function onDragEnd()     { doReorder(dragIdx,dragOver);setDragIdx(null);setDragOver(null); }
  function onTouchStart(e,i){ touchRef.current=i;setDragIdx(i); }
  function onTouchMove(e){
    const y=e.touches[0].clientY;
    const cards=bodyRef.current?.querySelectorAll('.kanban-task');
    if(!cards)return;
    let target=touchRef.current;
    cards.forEach((c,i)=>{ const r=c.getBoundingClientRect();if(y>=r.top&&y<=r.bottom)target=i; });
    touchRef.current=target;setDragOver(target);
  }
  function onTouchEnd(){ doReorder(dragIdx,touchRef.current);setDragIdx(null);setDragOver(null); }

  return(
    <div className="kanban-col">
      <div className="kanban-col-hdr" style={{borderTopColor:meta.color}}>
        <span className="kcol-label" style={{color:meta.color}}>{meta.label}</span>
        <span className="kcol-count">{tasks.length}</span>
        {sortMode==='manual'&&(
          <button className="kcol-sort-btn" onClick={()=>setSortMode('priority')}>
            <Icon name="sort_pri" size={11}/>
          </button>
        )}
      </div>
      <div className="kanban-col-body" ref={bodyRef}>
        {sorted.length===0&&<div className="kcol-empty">—</div>}
        {sorted.map((t,i)=>{
          const p=t.priority?PRI[t.priority]:null;
          const due=dueBadge(t.dueDate);
          const subTot=(t.subtasks||[]).length,subDon=(t.subtasks||[]).filter(s=>s.done).length;
          return(
            <div key={t.id}
              className={`kanban-task${dragIdx===i?' is-dragging':''}${dragOver===i&&dragIdx!==null&&dragIdx!==i?' is-target':''}`}
              style={{borderLeftColor:p?p.color:'var(--border)'}}
              draggable
              onDragStart={e=>onDragStart(e,i)}
              onDragEnter={()=>setDragOver(i)}
              onDragOver={e=>e.preventDefault()}
              onDragEnd={onDragEnd}
              onTouchStart={e=>onTouchStart(e,i)}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onClick={()=>onTaskClick(t)}>
              <div className="kt-text">{t.text}</div>
              {(p||due||subTot>0)&&(
                <div className="kt-badges">
                  {p&&<span className="kt-pri" style={{background:p.bg,color:p.color}}>{p.label.charAt(0)}</span>}
                  {due&&<span className="kt-due" style={{color:due.color}}>{due.text}</span>}
                  {subTot>0&&<span className="kt-sub">{subDon}/{subTot}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MANAGE LISTS MODAL
══════════════════════════════════════════ */
function ManageListsModal({lists,onSave,onClose}){
  const [local,setLocal]=useState(lists.map(l=>({...l})));
  const [editing,setEditing]=useState(null);
  const [newName,setNewName]=useState('');
  const [colorFor,setColorFor]=useState(null);

  function upd(id,k,v){ setLocal(ls=>ls.map(l=>l.id===id?{...l,[k]:v}:l)); }
  function del(id){ if(local.length<=1)return; setLocal(ls=>ls.filter(l=>l.id!==id)); }
  function add(){ if(!newName.trim())return; const nl={id:uuid(),name:newName.trim(),color:LIST_COLORS[local.length%LIST_COLORS.length]}; setLocal(ls=>[...ls,nl]); setNewName(''); }

  return(
    <div className="overlay" onClick={onClose}>
      <div className="td-modal manage-modal" onClick={e=>e.stopPropagation()}>
        <div className="td-hdr">
          <div className="td-title">Gestisci liste</div>
          <button className="td-close-btn" onClick={()=>onSave(local)}><Icon name="close" size={16}/></button>
        </div>

        {local.map(l=>(
          <div key={l.id} className="ml-row">
            <div className="ml-color-wrap">
              <div className="ml-color-dot" style={{background:l.color}}
                onClick={()=>setColorFor(colorFor===l.id?null:l.id)}/>
              {colorFor===l.id&&(
                <div className="ml-color-picker">
                  {LIST_COLORS.map(c=>(
                    <div key={c} className={`ml-color-opt${l.color===c?' sel':''}`}
                      style={{background:c}}
                      onClick={()=>{ upd(l.id,'color',c); setColorFor(null); }}/>
                  ))}
                </div>
              )}
            </div>
            {editing===l.id?(
              <input className="ml-name-input" value={l.name}
                onChange={e=>upd(l.id,'name',e.target.value)}
                onBlur={()=>setEditing(null)}
                onKeyDown={e=>e.key==='Enter'&&setEditing(null)} autoFocus/>
            ):(
              <span className="ml-name" onClick={()=>setEditing(l.id)}>{l.name}</span>
            )}
            {local.length>1&&(
              <button className="ml-del-btn" onClick={()=>del(l.id)}>
                <Icon name="close" size={12}/>
              </button>
            )}
          </div>
        ))}

        <div className="ml-add-row">
          <input className="todo-input sm" placeholder="Nuova lista..."
            value={newName} onChange={e=>setNewName(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&add()}/>
          <button className="todo-add-btn sm" onClick={add}>+</button>
        </div>
        <button className="todo-add-btn" style={{width:'100%',padding:12,marginTop:8}}
          onClick={()=>onSave(local)}>Salva</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   QUICK ADD BAR
══════════════════════════════════════════ */
function QuickAddBar({lists,activeListId,onAdd}){
  const [open,   setOpen]   =useState(false);
  const [text,   setText]   =useState('');
  const [pri,    setPri]    =useState(null);
  const [listId, setListId] =useState(activeListId);
  const [status, setStatus] =useState('todo');
  const [dueDate,setDueDate]=useState('');
  const inputRef=useRef(null);

  useEffect(()=>setListId(activeListId),[activeListId]);

  function submit(){
    if(!text.trim())return;
    onAdd({text:text.trim(),priority:pri,listId,status,dueDate:dueDate||null});
    setText('');setPri(null);setDueDate('');setOpen(false);
  }
  function openBar(){ setOpen(true); setTimeout(()=>inputRef.current?.focus(),80); }

  if(!open) return(
    <div className="qa-bar collapsed" onClick={openBar}>
      <Icon name="plus_ic" size={16} color="var(--acc)"/>
      <span className="qa-trigger-text">Aggiungi attività...</span>
    </div>
  );

  return(
    <div className="qa-bar expanded">
      <input ref={inputRef} className="qa-input"
        placeholder="Titolo attività..."
        value={text} onChange={e=>setText(e.target.value)}
        onKeyDown={e=>e.key==='Enter'&&submit()}/>

      <div className="qa-row">
        <span className="qa-row-label">Priorità</span>
        <div className="qa-chips">
          {Object.entries(PRI).map(([k,v])=>(
            <button key={k} className={`qa-chip${pri===k?' act':''}`}
              style={pri===k?{background:v.bg,borderColor:v.color,color:v.color}:{}}
              onClick={()=>setPri(pri===k?null:k)}>{v.label}</button>
          ))}
        </div>
      </div>

      <div className="qa-row">
        <span className="qa-row-label">Lista</span>
        <div className="qa-chips">
          {lists.map(l=>(
            <button key={l.id} className={`qa-chip${listId===l.id?' act':''}`}
              style={listId===l.id?{borderColor:l.color,color:l.color,background:l.color+'22'}:{}}
              onClick={()=>setListId(l.id)}>
              <span style={{width:6,height:6,borderRadius:'50%',background:l.color,display:'inline-block',marginRight:4,flexShrink:0}}/>
              {l.name}
            </button>
          ))}
        </div>
      </div>

      <div className="qa-row">
        <span className="qa-row-label">Stato</span>
        <div className="qa-chips">
          {STATUS_COLS.map(s=>{
            const m=STATUS_META[s];
            return(<button key={s} className={`qa-chip${status===s?' act':''}`}
              style={status===s?{background:m.color+'22',borderColor:m.color,color:m.color}:{}}
              onClick={()=>setStatus(s)}>{m.label}</button>);
          })}
        </div>
      </div>

      <div className="qa-actions-row">
        <input type="date" className="due-input" style={{flex:1,minWidth:0}}
          value={dueDate} onChange={e=>setDueDate(e.target.value)}/>
        <button className="btn-sec" style={{flex:'none',padding:'8px 10px'}}
          onClick={()=>setOpen(false)}>✕</button>
        <button className="todo-add-btn" style={{flex:'none',padding:'8px 16px'}}
          onClick={submit}>Aggiungi</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TODO SECTION
══════════════════════════════════════════ */
function TodoSection(){
  const [lists,      setLists]      =useState(()=>{ const s=LS.get('ms_todo_lists');return(s&&s.length)?s:DEFAULT_LISTS; });
  const [todos,      setTodos]      =useState(()=>{ const raw=LS.get('ms_todos')||[];return archiveOldDone(migrateTodos(raw)); });
  const [activeList, setActiveList] =useState(()=>{ const s=LS.get('ms_todo_lists');return(s&&s[0])?s[0].id:'personal'; });
  const [editTask,   setEditTask]   =useState(null);
  const [showManage, setShowManage] =useState(false);

  function saveTodos(n){ setTodos(n);LS.set('ms_todos',n); }
  function saveLists(n){ setLists(n);LS.set('ms_todo_lists',n); }

  function addTask({text,priority,listId,status,dueDate}){
    const existing=todos.filter(t=>t.listId===listId&&t.status===status);
    const maxOrd=existing.length?Math.max(...existing.map(t=>t.order||0))+1:0;
    saveTodos([...todos,{id:uuid(),text,listId,priority,status,dueDate,subtasks:[],order:maxOrd,date:new Date().toISOString(),doneAt:status==='done'?Date.now():null}]);
  }

  function saveTask(updated){
    saveTodos(todos.map(t=>t.id===updated.id?updated:t));
    setEditTask(null);
  }

  function deleteTask(id){ saveTodos(todos.filter(t=>t.id!==id));setEditTask(null); }

  function reorderInCol(status,reorderedTasks){
    saveTodos(todos.map(t=>{ const r=reorderedTasks.find(r=>r.id===t.id);return r||t; }));
  }

  function colTasks(status){ return todos.filter(t=>t.listId===activeList&&t.status===status); }

  function onSaveLists(newLists){
    saveLists(newLists);
    if(!newLists.find(l=>l.id===activeList))setActiveList(newLists[0].id);
    setShowManage(false);
  }

  return(
    <div className="todo-layout">

      {/* ── List tabs ── */}
      <div className="list-tabs-row">
        <div className="list-tabs-grid">
          {lists.map(l=>(
            <button key={l.id}
              className={`lt-tab${activeList===l.id?' act':''}`}
              style={activeList===l.id?{borderColor:l.color,background:`${l.color}15`,boxShadow:`0 0 12px ${l.color}20`}:{}}
              onClick={()=>setActiveList(l.id)}>
              <span className="lt-tab-dot" style={{background:l.color}}/>
              <span className="lt-tab-name" style={activeList===l.id?{color:l.color}:{}}>{l.name}</span>
              <span className="lt-tab-count" style={activeList===l.id?{color:l.color,opacity:.7}:{}}>
                {todos.filter(t=>t.listId===l.id&&t.status!=='done').length}
              </span>
            </button>
          ))}
        </div>
        <button className="lt-manage-btn" onClick={()=>setShowManage(true)}>
          <Icon name="nav_sett" size={15}/>
        </button>
      </div>

      {/* ── Kanban ── */}
      <div className="kanban">
        {STATUS_COLS.map(s=>(
          <KanbanColumn key={s} status={s}
            tasks={colTasks(s)}
            onTaskClick={setEditTask}
            onReorder={rt=>reorderInCol(s,rt)}
          />
        ))}
      </div>

      {/* ── Quick add bar ── */}
      <QuickAddBar lists={lists} activeListId={activeList} onAdd={addTask}/>

      {editTask&&(
        <TaskDetail task={editTask} onSave={saveTask} onDelete={deleteTask} onClose={()=>setEditTask(null)}/>
      )}
      {showManage&&(
        <ManageListsModal lists={lists} onSave={onSaveLists} onClose={()=>setShowManage(false)}/>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   CALENDAR SECTION
══════════════════════════════════════════ */
function CalendarSection(){
  const [token,       setToken]       =useState(()=>LS.get('ms_gcal_token')||null);
  const [events,      setEvents]      =useState([]);
  const [loading,     setLoading]     =useState(false);
  const [calView,     setCalView]     =useState('month');
  const [curDate,     setCurDate]     =useState(new Date());
  const [selDate,     setSelDate]     =useState(new Date());
  const [showSettings,setShowSettings]=useState(false);
  const [showNewEvent,setShowNewEvent]=useState(false);
  const [newEvt,      setNewEvt]      =useState({title:'',date:isoDate(new Date()),timeStart:'09:00',timeEnd:'10:00',allDay:true,desc:''});
  const [saveMsg,     setSaveMsg]     =useState('');
  const [editClientId,setEditClientId]=useState(()=>LS.get('ms_gcal_client_id')||'');

  const isConnected=!!token&&token.expires_at>Date.now();

  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    const code=p.get('code'),state=p.get('state');
    const verifier=LS.get('ms_gcal_verifier'),cid=LS.get('ms_gcal_client_id');
    if(code&&state==='gcal'&&verifier&&cid){ window.history.replaceState({},'',window.location.pathname); exchangeCode(code,verifier,cid); }
  },[]);

  useEffect(()=>{ if(isConnected)fetchEvents(); },[token,calView,curDate]);

  async function exchangeCode(code,verifier,cid){
    setLoading(true);
    const redir=window.location.origin+window.location.pathname;
    try{
      const r=await fetch(GCAL_TOKEN_URL,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:cid,code,redirect_uri:redir,grant_type:'authorization_code',code_verifier:verifier})});
      const data=await r.json();
      if(data.access_token){ const tok={access_token:data.access_token,refresh_token:data.refresh_token||null,expires_at:Date.now()+(data.expires_in||3600)*1000}; setToken(tok);LS.set('ms_gcal_token',tok);LS.set('ms_gcal_verifier',null); }
    }catch(e){console.error(e);}
    setLoading(false);
  }

  async function connect(){
    const cid=editClientId.trim();if(!cid)return;
    LS.set('ms_gcal_client_id',cid);
    const verifier=generateVerifier(),challenge=await generateChallenge(verifier);
    LS.set('ms_gcal_verifier',verifier);
    const redir=window.location.origin+window.location.pathname;
    window.location.href=`${GCAL_AUTH_URL}?client_id=${encodeURIComponent(cid)}&redirect_uri=${encodeURIComponent(redir)}&response_type=code&scope=${encodeURIComponent(GCAL_SCOPES)}&code_challenge=${challenge}&code_challenge_method=S256&access_type=offline&prompt=consent&state=gcal`;
  }

  function disconnect(){ setToken(null);LS.set('ms_gcal_token',null);setEvents([]); }

  async function fetchEvents(){
    if(!isConnected)return;setLoading(true);
    let tMin,tMax;
    if(calView==='month'){tMin=new Date(curDate.getFullYear(),curDate.getMonth(),1);tMax=new Date(curDate.getFullYear(),curDate.getMonth()+1,0,23,59,59);}
    else if(calView==='week'){tMin=startOfWeek(curDate);tMax=addDays(tMin,6);tMax.setHours(23,59,59);}
    else{tMin=new Date(curDate);tMin.setHours(0,0,0,0);tMax=new Date(curDate);tMax.setHours(23,59,59);}
    try{
      const r=await fetch(`${GCAL_API}/calendars/primary/events?${new URLSearchParams({timeMin:tMin.toISOString(),timeMax:tMax.toISOString(),singleEvents:'true',orderBy:'startTime',maxResults:'250'})}`,{headers:{Authorization:`Bearer ${token.access_token}`}});
      if(r.status===401){disconnect();return;}
      const data=await r.json();setEvents(data.items||[]);
    }catch(e){console.error(e);}
    setLoading(false);
  }

  async function createEvent(){
    if(!newEvt.title.trim()||!isConnected)return;
    const tz=Intl.DateTimeFormat().resolvedOptions().timeZone;
    const body={summary:newEvt.title,description:newEvt.desc,...(newEvt.allDay?{start:{date:newEvt.date},end:{date:newEvt.date}}:{start:{dateTime:`${newEvt.date}T${newEvt.timeStart}:00`,timeZone:tz},end:{dateTime:`${newEvt.date}T${newEvt.timeEnd}:00`,timeZone:tz}})};
    setLoading(true);
    try{
      const r=await fetch(`${GCAL_API}/calendars/primary/events`,{method:'POST',headers:{Authorization:`Bearer ${token.access_token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(r.ok){setSaveMsg('Evento creato ✓');setTimeout(()=>setSaveMsg(''),2500);setShowNewEvent(false);setNewEvt({title:'',date:isoDate(new Date()),timeStart:'09:00',timeEnd:'10:00',allDay:true,desc:''});fetchEvents();}
    }catch(e){console.error(e);}
    setLoading(false);
  }

  function navPrev(){ const d=new Date(curDate);if(calView==='month')d.setMonth(d.getMonth()-1);else if(calView==='week')d.setDate(d.getDate()-7);else d.setDate(d.getDate()-1);setCurDate(d); }
  function navNext(){ const d=new Date(curDate);if(calView==='month')d.setMonth(d.getMonth()+1);else if(calView==='week')d.setDate(d.getDate()+7);else d.setDate(d.getDate()+1);setCurDate(d); }
  function goToday(){ setCurDate(new Date());setSelDate(new Date()); }

  function navLabel(){
    if(calView==='month')return`${MONTH_NAMES[curDate.getMonth()]} ${curDate.getFullYear()}`;
    if(calView==='week'){const w=startOfWeek(curDate),e=addDays(w,6);return w.getMonth()===e.getMonth()?`${w.getDate()}–${e.getDate()} ${MONTH_NAMES[w.getMonth()]}`:`${w.getDate()} ${MONTH_NAMES[w.getMonth()].slice(0,3)} – ${e.getDate()} ${MONTH_NAMES[e.getMonth()].slice(0,3)}`;}
    return curDate.toLocaleDateString('it',{weekday:'long',day:'numeric',month:'long'});
  }

  function eventsOnDay(d){ return events.filter(e=>{ const s=e.start?.date||e.start?.dateTime;if(!s)return false;return sameDay(new Date(s),d); }); }
  function evtColor(e){ const c=['#6aadcf','#7aba7a','#d4943a','#c96a6a','#9a7aba','#d4c9a8'];return c[(e.id||'').length%c.length]; }
  function evtTime(e){ if(e.start?.date)return'Tutto il giorno';if(e.start?.dateTime){const t=new Date(e.start.dateTime);return t.toLocaleTimeString('it',{hour:'2-digit',minute:'2-digit'});}return''; }

  function EventsList({day}){
    const evts=eventsOnDay(day);
    if(!isConnected)return<div className="cal-connect-hint">Connetti Google Calendar nelle <b onClick={()=>setShowSettings(true)} style={{color:'var(--acc)',cursor:'pointer'}}>impostazioni</b></div>;
    if(loading)return<div className="cal-loading">Caricamento…</div>;
    if(evts.length===0)return<div className="cal-no-events">Nessun evento</div>;
    return(<div className="cal-events-list">{evts.map(e=><div key={e.id} className="cal-event-card" style={{borderLeftColor:evtColor(e)}}><div className="cal-evt-time">{evtTime(e)}</div><div className="cal-evt-title">{e.summary}</div>{e.description&&<div className="cal-evt-desc">{e.description}</div>}</div>)}</div>);
  }

  if(showSettings)return(
    <div className="cal-settings">
      <div className="cal-settings-header">
        <button className="cal-back-btn" onClick={()=>setShowSettings(false)}><Icon name="back_arr" size={18}/> Indietro</button>
        <div className="cal-settings-title">Google Calendar</div>
      </div>
      <div className="cal-sett-section">
        <div className="cal-sett-label">Client ID OAuth 2.0</div>
        <div className="cal-sett-hint">Vai su <b>console.cloud.google.com</b> → credenziali OAuth 2.0 → Applicazione web. URI redirect: <code>{window.location.origin+window.location.pathname}</code></div>
        <input className="todo-input" style={{marginTop:10,fontFamily:'monospace',fontSize:12}} placeholder="xxx.apps.googleusercontent.com" value={editClientId} onChange={e=>setEditClientId(e.target.value)}/>
      </div>
      {isConnected?(<div className="cal-sett-section"><div className="cal-connected-badge">✓ Connesso</div><button className="btn-danger" style={{width:'100%',padding:12,marginTop:8}} onClick={disconnect}>Disconnetti</button></div>):(<button className="todo-add-btn" style={{width:'100%',padding:14,marginTop:8}} onClick={connect}>Connetti Google Calendar</button>)}
      <div className="cal-sett-section" style={{marginTop:24}}><div className="cal-sett-label">Istruzioni</div><ol className="cal-sett-steps"><li>Crea progetto su Google Cloud Console</li><li>Abilita <b>Google Calendar API</b></li><li>Credenziali → OAuth 2.0 → Applicazione web</li><li>Aggiungi URI redirect sopra</li><li>Copia Client ID → Connetti</li></ol></div>
    </div>
  );

  return(
    <div className="cal-wrap">
      <div className="cal-topbar">
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={navPrev}>‹</button>
          <div className="cal-nav-label" onClick={goToday}>{navLabel()}</div>
          <button className="cal-nav-btn" onClick={navNext}>›</button>
        </div>
        <div className="cal-topbar-actions">
          <button className="cal-today-btn" onClick={goToday}>Oggi</button>
          {isConnected&&<button className="cal-add-btn" onClick={()=>setShowNewEvent(true)}>+ Evento</button>}
          <button className="cal-sett-btn" onClick={()=>setShowSettings(true)}><Icon name="nav_sett" size={16}/></button>
        </div>
      </div>
      <div className="cal-view-switcher">
        {[['month','Mese'],['week','Sett.'],['day','Giorno']].map(([v,l])=>(
          <button key={v} className={`cal-vs-btn${calView===v?' act':''}`} onClick={()=>setCalView(v)}>{l}</button>
        ))}
      </div>
      {!isConnected&&<div className="cal-not-connected"><span>📅</span><span>Connetti nelle <b onClick={()=>setShowSettings(true)} style={{color:'var(--acc)',cursor:'pointer'}}>impostazioni</b></span></div>}
      {saveMsg&&<div className="cal-save-msg">{saveMsg}</div>}
      {loading&&<div className="cal-loading-bar"/>}
      {calView==='month'&&(()=>{
        const year=curDate.getFullYear(),month=curDate.getMonth();
        const firstDay=new Date(year,month,1),offset=firstDay.getDay()===0?6:firstDay.getDay()-1;
        const dim=new Date(year,month+1,0).getDate();
        const cells=[];for(let i=0;i<offset;i++)cells.push(null);for(let d=1;d<=dim;d++)cells.push(new Date(year,month,d));
        const todayD=new Date();todayD.setHours(0,0,0,0);
        return(<div className="cal-month">
          <div className="cal-dow-row">{DAY_NAMES_SHORT.map(d=><div key={d} className="cal-dow">{d}</div>)}</div>
          <div className="cal-grid">{cells.map((d,i)=>{
            if(!d)return<div key={`e${i}`} className="cal-cell empty"/>;
            const evts=eventsOnDay(d),isToday=sameDay(d,todayD),isSel=sameDay(d,selDate);
            return(<div key={i} className={`cal-cell${isToday?' today':''}${isSel?' sel':''}`} onClick={()=>{setSelDate(d);setCalView('day');setCurDate(d);}}>
              <div className="cal-num">{d.getDate()}</div>
              <div className="cal-dots">{evts.slice(0,3).map((e,j)=><span key={j} className="cal-dot" style={{background:evtColor(e)}}/>)}</div>
            </div>);
          })}</div>
          <div className="cal-day-preview">
            <div className="cal-preview-title">{selDate.toLocaleDateString('it',{weekday:'long',day:'numeric',month:'long'})}</div>
            <EventsList day={selDate}/>
          </div>
        </div>);
      })()}
      {calView==='week'&&(()=>{
        const wStart=startOfWeek(curDate),days=Array.from({length:7},(_,i)=>addDays(wStart,i));
        const todayD=new Date();todayD.setHours(0,0,0,0);
        return(<div className="cal-week"><div className="cal-week-row">{days.map((d,i)=>{
          const evts=eventsOnDay(d),isToday=sameDay(d,todayD),isSel=sameDay(d,selDate);
          return(<div key={i} className={`cal-week-col${isToday?' today':''}${isSel?' sel':''}`} onClick={()=>{setSelDate(d);setCurDate(d);setCalView('day');}}>
            <div className="cal-week-dow">{DAY_NAMES_SHORT[i]}</div>
            <div className="cal-week-num">{d.getDate()}</div>
            <div className="cal-week-evts">
              {evts.slice(0,3).map((e,j)=><div key={j} className="cal-week-pill" style={{background:evtColor(e)+'28',borderLeft:`2px solid ${evtColor(e)}`}}>{e.summary?.slice(0,12)}</div>)}
              {evts.length>3&&<div className="cal-week-more">+{evts.length-3}</div>}
            </div>
          </div>);
        })}</div></div>);
      })()}
      {calView==='day'&&<div className="cal-day-view"><EventsList day={curDate}/></div>}

      {showNewEvent&&(
        <div className="overlay" onClick={()=>setShowNewEvent(false)}>
          <div className="task-detail" onClick={e=>e.stopPropagation()}>
            <div className="td-hdr"><div className="td-title">Nuovo evento</div><button className="td-close-btn" onClick={()=>setShowNewEvent(false)}><Icon name="close" size={16}/></button></div>
            <input className="todo-input" style={{marginBottom:12,width:'100%',boxSizing:'border-box'}} placeholder="Titolo evento..." value={newEvt.title} onChange={e=>setNewEvt(p=>({...p,title:e.target.value}))}/>
            <div className="td-label">Data</div>
            <input type="date" className="due-input full" style={{marginBottom:12}} value={newEvt.date} onChange={e=>setNewEvt(p=>({...p,date:e.target.value}))}/>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <label className="cal-toggle"><input type="checkbox" checked={newEvt.allDay} onChange={e=>setNewEvt(p=>({...p,allDay:e.target.checked}))}/><span className="cal-toggle-track"/><span className="td-label" style={{marginBottom:0}}>Tutto il giorno</span></label>
            </div>
            {!newEvt.allDay&&(<div style={{display:'flex',gap:8,marginBottom:12}}>
              <div style={{flex:1}}><div className="td-label">Inizio</div><input type="time" className="due-input full" value={newEvt.timeStart} onChange={e=>setNewEvt(p=>({...p,timeStart:e.target.value}))}/></div>
              <div style={{flex:1}}><div className="td-label">Fine</div><input type="time" className="due-input full" value={newEvt.timeEnd} onChange={e=>setNewEvt(p=>({...p,timeEnd:e.target.value}))}/></div>
            </div>)}
            <div className="td-label">Note</div>
            <textarea className="td-textarea" rows={2} placeholder="Descrizione..." value={newEvt.desc} onChange={e=>setNewEvt(p=>({...p,desc:e.target.value}))}/>
            <div className="td-actions">
              <button className="btn-sec" onClick={()=>setShowNewEvent(false)}>Annulla</button>
              <button className="todo-add-btn" style={{flex:1,padding:12}} onClick={createEvent}>Crea evento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   ROOT MODULE
══════════════════════════════════════════ */
function TodoModule({meta}){
  const [section,setSection]=useState('todo');

  return(
    <>
      <div className={`screen${section==='todo'?' todo-kanban-screen':''}`}>
        <div className="hdr">
          <div className="logo">MY<span>TASKS</span></div>
          <div className="hdr-date">{today}</div>
        </div>

        <div className="sub-nav">
          <button className={`sn-btn${section==='todo'?' act':''}`} onClick={()=>setSection('todo')}>
            <Icon name="todo" size={13} style={{marginRight:5}}/>To-Do
          </button>
          <button className={`sn-btn${section==='calendar'?' act':''}`} onClick={()=>setSection('calendar')}>
            <Icon name="nav_cal" size={13} style={{marginRight:5}}/>Calendario
          </button>
        </div>

        <div className={`pad anim${section==='todo'?' todo-pad':''}`}>
          {section==='todo'     &&<TodoSection/>}
          {section==='calendar' &&<CalendarSection/>}
        </div>
      </div>
    </>
  );
}
