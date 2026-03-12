/* ═══════════════════════════════════════════
   APP — slim router + module nav
═══════════════════════════════════════════ */
function App(){
  const [currentModule,setCurrentModule]=useState(()=>LS.get('ms_module')||'gym');

  /* ── Module color CSS vars ── */
  useEffect(()=>{
    const m=MODULE_META[currentModule];
    document.documentElement.style.setProperty('--acc',m.color);
    document.documentElement.style.setProperty('--acc-bg',m.color+'18');
    document.documentElement.style.setProperty('--acc-surface',m.bg);
    document.documentElement.style.setProperty('--acc-border',m.border);
    LS.set('ms_module',currentModule);
  },[currentModule]);

  const meta=MODULE_META[currentModule];

  return(
    <div className={`app${currentModule==='gym'?' gym-mode':''}${currentModule==='notes'?' notes-mode':''}${currentModule==='todo'?' todo-mode':''}${currentModule==='expenses'?' expenses-mode':''}`} style={MODULE_THEME[currentModule]||{}}>
      <div className="module-body">
        {currentModule==='gym'    && <WorkoutModule  meta={meta}/>}
        {currentModule==='todo'   && <TodoModule     meta={meta}/>}
        {currentModule==='expenses'&&<ExpensesModule meta={meta}/>}
        {currentModule==='notes'  && <NotesModule    meta={meta}/>}
      </div>

      {/* ══════════ MODULE NAV ══════════ */}
      <nav className="module-nav">
        {Object.entries(MODULE_META).map(([key,m])=>(
          <button key={key} className={`mn-btn${currentModule===key?' act':''}`}
            style={currentModule===key?{'--acc':m.color}:{}}
            onClick={()=>setCurrentModule(key)}>
            <Icon name={m.icon} size={20}/>
            <span className="mn-label">{m.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
