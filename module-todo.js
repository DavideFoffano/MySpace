/* ═══════════════════════════════════════════
   MODULE: TODO
═══════════════════════════════════════════ */
function TodoModule({meta}){
  /* ── Todo state ── */
  const [todos,setTodos]=useState(()=>LS.get('ms_todos')||[]);
  const [todoInput,setTodoInput]=useState('');
  const [todoFilter,setTodoFilter]=useState('all');


  /* ── Todo functions ── */
  function addTodo(){
    const text=todoInput.trim();if(!text)return;
    const item={id:uuid(),text,done:false,date:new Date().toISOString()};
    const next=[...todos,item];setTodos(next);LS.set('ms_todos',next);setTodoInput('');
  }
  function toggleTodo(id){
    const next=todos.map(t=>t.id===id?{...t,done:!t.done}:t);
    setTodos(next);LS.set('ms_todos',next);
  }
  function deleteTodo(id){
    const next=todos.filter(t=>t.id!==id);setTodos(next);LS.set('ms_todos',next);
  }
  const filteredTodos=todos.filter(t=>todoFilter==='all'?true:todoFilter==='active'?!t.done:t.done);
  const doneTodosCount=todos.filter(t=>t.done).length;


  return(
    <>
          <div className="screen">
            <div className="hdr">
              <div className="logo">MY<span>TASKS</span></div>
              <div className="hdr-date">{today}</div>
            </div>
            <div className="pad anim">
              <div className="greeting">Le tue<br/><span>attività</span></div>
              <div className="subhead">{doneTodosCount} di {todos.length} completate</div>
              <div className="stats">
                <div className="stat"><div className="n">{todos.length}</div><div className="l">Totale</div></div>
                <div className="stat"><div className="n">{todos.filter(t=>!t.done).length}</div><div className="l">Da fare</div></div>
                <div className="stat"><div className="n">{doneTodosCount}</div><div className="l">Fatte</div></div>
              </div>
              <div className="todo-add">
                <input className="todo-input" placeholder="Aggiungi un'attività..."
                  value={todoInput} onChange={e=>setTodoInput(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&addTodo()}/>
                <button className="todo-add-btn" onClick={addTodo}>+</button>
              </div>
              <div className="todo-filters">
                {[['all','Tutte'],['active','Da fare'],['done','Completate']].map(([v,l])=>(
                  <button key={v} className={`tf${todoFilter===v?' act':''}`} onClick={()=>setTodoFilter(v)}>{l}</button>
                ))}
              </div>
              {filteredTodos.length===0&&<div className="todo-empty">{todoFilter==='done'?'Nessuna attività completata 🎯':'Nessuna attività. Aggiungine una! ✅'}</div>}
              {filteredTodos.map(t=>(
                <div key={t.id} className={`todo-item${t.done?' done-item':''}`}>
                  <button className={`todo-check${t.done?' on':''}`} onClick={()=>toggleTodo(t.id)}>{t.done?'✓':''}</button>
                  <div className="todo-text">{t.text}</div>
                  <div className="todo-del" onClick={()=>deleteTodo(t.id)}><Icon name='close' size={12}/></div>
                </div>
              ))}
            </div>
          </div>
    </>
  );
}