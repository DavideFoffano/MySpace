/* ═══════════════════════════════════════════
   MODULE: NOTES
═══════════════════════════════════════════ */
function NotesModule({meta}){
  /* ── Notes state ── */
  const [notes,setNotes]=useState(()=>LS.get('ms_notes')||[]);
  const [editingNote,setEditingNote]=useState(null);
  const [notesSection,setNotesSection]=useState('notes');
  const [noteGroups,setNoteGroups]=useState(()=>LS.get('ms_note_groups')||[]);
  const [noteGroupFilter,setNoteGroupFilter]=useState('all');
  const [noteSearch,setNoteSearch]=useState('');
  const [shoppingLists,setShoppingLists]=useState(()=>LS.get('ms_shopping')||[]);
  const [activeShoppingId,setActiveShoppingId]=useState(null);
  const [showFoodLib,setShowFoodLib]=useState(false);
  const [foodLibSearch,setFoodLibSearch]=useState('');
  const [selectedFoods,setSelectedFoods]=useState([]);
  const [customShopItem,setCustomShopItem]=useState('');
  const [travelLists,setTravelLists]=useState(()=>LS.get('ms_travel')||[]);
  const [activeTravelId,setActiveTravelId]=useState(null);
  const [showNewTravel,setShowNewTravel]=useState(false);
  const [showNewShopping,setShowNewShopping]=useState(false);
  const [newShoppingName,setNewShoppingName]=useState('');
  const [newTravelForm,setNewTravelForm]=useState({name:'',template:'mare'});
  const [showGroupModal,setShowGroupModal]=useState(false);
  const [newGroupName,setNewGroupName]=useState('');
  const [newGroupColor,setNewGroupColor]=useState(NOTE_GROUP_COLORS[0]);
  const [customTravelItem,setCustomTravelItem]=useState('');


  /* ── Notes functions ── */
  const NOTE_COLORS=['#6dbb8a','#a8c26b','#c97a4a','#9b8fc2','#d4a84b','#7ab8b0'];
  function newNote(){setEditingNote({id:null,title:'',content:'',color:'#a8c26b',pinned:false,group:noteGroupFilter!=='all'?noteGroupFilter:null});}
  function openNote(n){setEditingNote({...n});}
  function saveNote(){
    if(!editingNote.title.trim()&&!editingNote.content.trim()){setEditingNote(null);return;}
    let next;
    if(editingNote.id){
      next=notes.map(n=>n.id===editingNote.id?{...editingNote}:n);
    }else{
      next=[{...editingNote,id:uuid(),date:new Date().toISOString()},...notes];
    }
    next=next.sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));
    setNotes(next);LS.set('ms_notes',next);setEditingNote(null);
  }
  function deleteNote(id){
    const next=notes.filter(n=>n.id!==id);setNotes(next);LS.set('ms_notes',next);setEditingNote(null);
  }
  function togglePin(id){
    const next=notes.map(n=>n.id===id?{...n,pinned:!n.pinned}:n).sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));
    setNotes(next);LS.set('ms_notes',next);
  }
  const filteredNotes=useMemo(()=>notes.filter(n=>{
    const mG=noteGroupFilter==='all'||(noteGroupFilter==='nogroup'?!n.group:n.group===noteGroupFilter);
    const mS=!noteSearch.trim()||n.title.toLowerCase().includes(noteSearch.toLowerCase())||n.content.toLowerCase().includes(noteSearch.toLowerCase());
    return mG&&mS;
  }),[notes,noteGroupFilter,noteSearch]);

  /* ── Note Groups ── */
  function saveNoteGroups(g){setNoteGroups(g);LS.set('ms_note_groups',g);}
  function addNoteGroup(){
    if(!newGroupName.trim()) return;
    saveNoteGroups([...noteGroups,{id:uuid(),name:newGroupName.trim(),color:newGroupColor}]);
    setNewGroupName('');setNewGroupColor(NOTE_GROUP_COLORS[0]);setShowGroupModal(false);
  }
  function deleteNoteGroup(id){
    saveNoteGroups(noteGroups.filter(g=>g.id!==id));
    const next=notes.map(n=>n.group===id?{...n,group:null}:n);
    setNotes(next);LS.set('ms_notes',next);
    if(noteGroupFilter===id) setNoteGroupFilter('all');
  }

  /* ── Shopping Lists ── */
  function saveShoppingLists(lists){setShoppingLists(lists);LS.set('ms_shopping',lists);}
  function addShoppingList(){
    if(!newShoppingName.trim()) return;
    const list={id:uuid(),name:newShoppingName.trim(),date:new Date().toISOString(),items:[]};
    saveShoppingLists([list,...shoppingLists]);
    setNewShoppingName('');setShowNewShopping(false);setActiveShoppingId(list.id);
  }
  function deleteShoppingList(id){
    saveShoppingLists(shoppingLists.filter(l=>l.id!==id));
    if(activeShoppingId===id) setActiveShoppingId(null);
  }
  function addFoodsToList(listId,foods){
    const lists=shoppingLists.map(l=>{
      if(l.id!==listId) return l;
      const ex=new Set(l.items.map(i=>i.name.toLowerCase()));
      const newItems=foods.filter(f=>!ex.has(f.toLowerCase())).map(f=>({id:uuid(),name:f,checked:false}));
      return{...l,items:[...l.items,...newItems]};
    });
    saveShoppingLists(lists);setSelectedFoods([]);setShowFoodLib(false);
  }
  function toggleShoppingItem(listId,itemId){
    saveShoppingLists(shoppingLists.map(l=>l.id!==listId?l:{...l,items:l.items.map(i=>i.id===itemId?{...i,checked:!i.checked}:i)}));
  }
  function deleteShoppingItem(listId,itemId){
    saveShoppingLists(shoppingLists.map(l=>l.id!==listId?l:{...l,items:l.items.filter(i=>i.id!==itemId)}));
  }
  function addCustomShopItem(listId,name){
    if(!name.trim()) return;
    saveShoppingLists(shoppingLists.map(l=>l.id!==listId?l:{...l,items:[...l.items,{id:uuid(),name:name.trim(),checked:false}]}));
    setCustomShopItem('');
  }

  /* ── Travel Lists ── */
  function saveTravelLists(lists){setTravelLists(lists);LS.set('ms_travel',lists);}
  function addTravelList(){
    const tmpl=TRAVEL_TEMPLATES.find(t=>t.id===newTravelForm.template);
    const items=tmpl?tmpl.cats.flatMap(c=>c.items.map(name=>({id:uuid(),name,cat:c.cat,checked:false}))):[]; 
    const list={id:uuid(),name:newTravelForm.name.trim()||(tmpl?.name||'Viaggio'),type:newTravelForm.template,date:new Date().toISOString(),items};
    saveTravelLists([list,...travelLists]);
    setNewTravelForm({name:'',template:'mare'});setShowNewTravel(false);setActiveTravelId(list.id);
  }
  function deleteTravelList(id){
    saveTravelLists(travelLists.filter(l=>l.id!==id));
    if(activeTravelId===id) setActiveTravelId(null);
  }
  function toggleTravelItem(listId,itemId){
    saveTravelLists(travelLists.map(l=>l.id!==listId?l:{...l,items:l.items.map(i=>i.id===itemId?{...i,checked:!i.checked}:i)}));
  }
  function deleteTravelItem(listId,itemId){
    saveTravelLists(travelLists.map(l=>l.id!==listId?l:{...l,items:l.items.filter(i=>i.id!==itemId)}));
  }
  function addCustomTravelItem(listId,name){
    if(!name.trim()) return;
    saveTravelLists(travelLists.map(l=>l.id!==listId?l:{...l,items:[...l.items,{id:uuid(),name:name.trim(),cat:'Altro',checked:false}]}));
    setCustomTravelItem('');
  }
  const filteredFoodLib=useMemo(()=>{
    if(!foodLibSearch.trim()) return FOOD_LIB;
    const q=foodLibSearch.toLowerCase();
    return FOOD_LIB.map(g=>({...g,items:g.items.filter(i=>i.toLowerCase().includes(q))})).filter(g=>g.items.length>0);
  },[foodLibSearch]);


  const activeShoppingList=shoppingLists.find(l=>l.id===activeShoppingId);
  const activeTravelList=travelLists.find(l=>l.id===activeTravelId);
  const isViewingShopping=notesSection==='shopping'&&activeShoppingId&&activeShoppingList;
  const isViewingTravel=notesSection==='travel'&&activeTravelId&&activeTravelList;





  if(editingNote){
    return(
      <div className="app">
        <div className="note-editor">
          <div className="note-editor-hdr">
            <button className="back" onClick={()=>setEditingNote(null)}><Icon name="back_arr" size={16}/></button>
            <div style={{flex:1,fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:400,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>
              {editingNote.id?'Modifica nota':'Nuova nota'}
            </div>
            <div className="note-editor-actions">
              {editingNote.id&&<button className="note-editor-btn" onClick={()=>deleteNote(editingNote.id)}><Icon name='close' size={14}/></button>}
              {editingNote.id&&<button className="note-editor-btn" onClick={()=>{togglePin(editingNote.id);setEditingNote(n=>({...n,pinned:!n.pinned}));}}>
                {editingNote.pinned?'📌':'📍'}
              </button>}
              <button className="note-editor-btn note-save-btn" style={{background:meta.color}} onClick={saveNote}>Salva</button>
            </div>
          </div>
          <input className="note-title-inp" placeholder="TITOLO..." value={editingNote.title}
            onChange={e=>setEditingNote(n=>({...n,title:e.target.value}))}/>
          <textarea className="note-body-inp" placeholder="Scrivi qualcosa..." value={editingNote.content}
            onChange={e=>setEditingNote(n=>({...n,content:e.target.value}))}/>
          <div className="note-bottom-bar">
            {noteGroups.length>0&&(
              <div className="note-group-sel">
                <div className={`ngs-pill${!editingNote.group?' sel':''}`} onClick={()=>setEditingNote(n=>({...n,group:null}))}>Nessun gruppo</div>
                {noteGroups.map(g=>(
                  <div key={g.id} className={`ngs-pill${editingNote.group===g.id?' sel':''}`}
                    style={editingNote.group===g.id?{borderColor:g.color,color:g.color,background:g.color+'18'}:{}}
                    onClick={()=>setEditingNote(n=>({...n,group:n.group===g.id?null:g.id}))}>
                    {g.name}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  if(notesSection==='shopping'&&activeShoppingId&&activeShoppingList){
    const list=activeShoppingList;
    const done=list.items.filter(i=>i.checked).length;
    const pct=list.items.length?Math.round(done/list.items.length*100):0;
    const pending=list.items.filter(i=>!i.checked);
    const checked=list.items.filter(i=>i.checked);
    return(
      <div className="app" style={{'--acc':meta.color,'--acc-bg':meta.color+'18','--acc-surface':meta.bg,'--acc-border':meta.border}}>
        {showFoodLib&&(
          <div className="food-lib-overlay">
            <div className="food-lib-hdr">
              <button className="back" onClick={()=>{setShowFoodLib(false);setSelectedFoods([]);setFoodLibSearch('');}}><Icon name="back_arr" size={16}/></button>
              <div className="food-lib-title">Libreria alimenti</div>
              <button className="food-lib-confirm" onClick={()=>addFoodsToList(list.id,selectedFoods)} disabled={!selectedFoods.length}
                style={{opacity:selectedFoods.length?1:.4}}>
                Aggiungi {selectedFoods.length>0?`(${selectedFoods.length})`:''}
              </button>
            </div>
            <input className="food-lib-search" placeholder="Cerca alimento..." value={foodLibSearch} onChange={e=>setFoodLibSearch(e.target.value)}/>
            <div className="food-sel-count">{selectedFoods.length>0?`${selectedFoods.length} selezionati`:'Seleziona gli alimenti da aggiungere'}</div>
            <div className="food-lib-body">
              {filteredFoodLib.map(g=>(
                <div key={g.cat}>
                  <div className="food-cat-hdr">{g.icon} {g.cat}</div>
                  <div className="food-items-grid">
                    {g.items.map(item=>{
                      const sel=selectedFoods.includes(item);
                      return(
                        <div key={item} className={`food-chip${sel?' sel':''}`}
                          onClick={()=>setSelectedFoods(f=>sel?f.filter(x=>x!==item):[...f,item])}>
                          {item}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="shop-detail">
          <div className="shop-hdr">
            <button className="back" onClick={()=>setActiveShoppingId(null)}><Icon name="back_arr" size={16}/></button>
            <div className="shop-hdr-title" style={{display:'flex',alignItems:'center',gap:8}}><Icon name='nav_shop' size={16} color={meta.color}/>{list.name}</div>
            <div style={{fontSize:13,color:'var(--muted)',fontFamily:"'Jost',sans-serif",fontWeight:700}}>{pct}%</div>
          </div>
          <div className="shop-body">
            <div style={{padding:'12px 22px 0'}}>
              <div className="shop-progress"><div className="shop-progress-bar" style={{width:pct+'%'}}/></div>
            </div>
            <div className="shop-add-row">
              <input className="shop-add-inp" placeholder="Aggiungi voce..." value={customShopItem}
                onChange={e=>setCustomShopItem(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'){addCustomShopItem(list.id,customShopItem);}}}/>
              <button className="shop-lib-btn" onClick={()=>{setFoodLibSearch('');setShowFoodLib(true);}}>Libreria</button>
            </div>
            {pending.length>0&&(
              <>
                <div className="shop-section-hdr">Da comprare · {pending.length}</div>
                {pending.map(item=>(
                  <div key={item.id} className="shop-item">
                    <div className={`shop-check${item.checked?' on':''}`} onClick={()=>toggleShoppingItem(list.id,item.id)}>{item.checked?'✓':''}</div>
                    <div className="shop-item-name">{item.name}</div>
                    <div className="shop-item-del" onClick={()=>deleteShoppingItem(list.id,item.id)}><Icon name='close' size={12}/></div>
                  </div>
                ))}
              </>
            )}
            {checked.length>0&&(
              <>
                <div className="shop-section-hdr" style={{marginTop:8}}>Nel carrello · {checked.length}</div>
                {checked.map(item=>(
                  <div key={item.id} className="shop-item done">
                    <div className={`shop-check on`} onClick={()=>toggleShoppingItem(list.id,item.id)}><Icon name='check_ic' size={12}/></div>
                    <div className="shop-item-name">{item.name}</div>
                    <div className="shop-item-del" onClick={()=>deleteShoppingItem(list.id,item.id)}><Icon name='close' size={12}/></div>
                  </div>
                ))}
              </>
            )}
            {list.items.length===0&&<div style={{color:'var(--faint)',textAlign:'center',padding:'40px 0',fontFamily:"'Jost',sans-serif",fontSize:18,letterSpacing:1}}>Lista vuota. Aggiungi dalla libreria!</div>}
            <div style={{height:40}}/>
          </div>
        </div>
      </div>
    );
  }

  if(notesSection==='travel'&&activeTravelId&&activeTravelList){
    const list=activeTravelList;
    const tmpl=TRAVEL_TEMPLATES.find(t=>t.id===list.type);
    const done=list.items.filter(i=>i.checked).length;
    const pct=list.items.length?Math.round(done/list.items.length*100):0;
    // Group by cat
    const cats=[...new Set(list.items.map(i=>i.cat))];
    return(
      <div className="app" style={{'--acc':meta.color,'--acc-bg':meta.color+'18','--acc-surface':meta.bg,'--acc-border':meta.border}}>
        <div className="travel-detail">
          <div className="shop-hdr">
            <button className="back" onClick={()=>setActiveTravelId(null)}><Icon name="back_arr" size={16}/></button>
            <div className="shop-hdr-title">{tmpl?.icon||'✈️'} {list.name}</div>
            <div style={{fontSize:13,color:'var(--muted)',fontFamily:"'Jost',sans-serif",fontWeight:700}}>{done}/{list.items.length}</div>
          </div>
          <div className="shop-body">
            <div style={{padding:'12px 22px 0'}}>
              <div className="shop-progress"><div className="shop-progress-bar" style={{width:pct+'%'}}/></div>
            </div>
            <div className="travel-add-row">
              <input className="travel-add-inp" placeholder="Aggiungi voce personalizzata..." value={customTravelItem}
                onChange={e=>setCustomTravelItem(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'){addCustomTravelItem(list.id,customTravelItem);}}}/>
              <button className="travel-add-submit" onClick={()=>addCustomTravelItem(list.id,customTravelItem)}>+</button>
            </div>
            {cats.map(cat=>{
              const items=list.items.filter(i=>i.cat===cat);
              return(
                <div key={cat} className="travel-section">
                  <div className="travel-section-hdr">{cat} · {items.filter(i=>i.checked).length}/{items.length}</div>
                  {items.map(item=>(
                    <div key={item.id} className={`travel-item${item.checked?' done':''}`}>
                      <div className={`travel-check${item.checked?' on':''}`} onClick={()=>toggleTravelItem(list.id,item.id)}>{item.checked?'✓':''}</div>
                      <div className="travel-item-name">{item.name}</div>
                      <div className="travel-item-del" onClick={()=>deleteTravelItem(list.id,item.id)}><Icon name='close' size={12}/></div>
                    </div>
                  ))}
                </div>
              );
            })}
            <div style={{height:40}}/>
          </div>
        </div>
      </div>
    );
  }


  return(
    <>
          <div className="screen" style={{position:'relative'}}>
            <div className="hdr">
              <div className="logo">MY<span>NOTE</span></div>
              <div className="hdr-date">{today}</div>
            </div>
            {/* Sub-nav */}
            <div className="notes-subnav">
              <button className={`nsn-btn${notesSection==='notes'?' act':''}`} onClick={()=>setNotesSection('notes')} style={{display:'flex',alignItems:'center',gap:6}}><Icon name='nav_notes' size={14}/>Note</button>
              <button className={`nsn-btn${notesSection==='shopping'?' act':''}`} onClick={()=>setNotesSection('shopping')} style={{display:'flex',alignItems:'center',gap:6}}><Icon name='nav_shop' size={14}/>Spesa</button>
              <button className={`nsn-btn${notesSection==='travel'?' act':''}`} onClick={()=>setNotesSection('travel')} style={{display:'flex',alignItems:'center',gap:6}}><Icon name='nav_travel' size={14}/>Viaggio</button>
            </div>

            {/* ── FREE NOTES ── */}
            {notesSection==='notes'&&(
              <div className="pad anim">
                <div className="greeting">Le tue<br/><span>idee</span></div>
                <div className="subhead">{notes.length} note salvate</div>
                {/* Search */}
                <div className="notes-search" style={{position:"relative"}}>
                  <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon name="search" size={14} color="var(--muted)"/></div>
                  <input className="notes-search-inp" style={{paddingLeft:36}} placeholder="Cerca nelle note..." value={noteSearch} onChange={e=>setNoteSearch(e.target.value)}/>
                </div>
                {/* Group filter */}
                {(noteGroups.length>0||true)&&(
                  <div className="notes-group-bar">
                    <div className={`ngb-pill${noteGroupFilter==='all'?' act':''}`} onClick={()=>setNoteGroupFilter('all')}>Tutte</div>
                    <div className={`ngb-pill${noteGroupFilter==='nogroup'?' act':''}`} onClick={()=>setNoteGroupFilter('nogroup')}>Senza gruppo</div>
                    {noteGroups.map(g=>(
                      <div key={g.id} className={`ngb-pill${noteGroupFilter===g.id?' act':''}`}
                        style={noteGroupFilter===g.id?{borderColor:g.color,color:g.color,background:g.color+'18'}:{}}
                        onClick={()=>setNoteGroupFilter(noteGroupFilter===g.id?'all':g.id)}>
                        <div className="ngb-dot" style={{background:g.color}}/>
                        {g.name}
                        <span style={{fontSize:10,color:'var(--muted)',marginLeft:2}} onClick={e=>{e.stopPropagation();deleteNoteGroup(g.id);}}>✕</span>
                      </div>
                    ))}
                    <div className="ngb-pill ngb-add" onClick={()=>setShowGroupModal(true)}>+ Gruppo</div>
                  </div>
                )}
                {/* Notes grid */}
                {filteredNotes.length===0&&<div className="notes-grid"><div className="notes-empty">{noteSearch?'Nessuna nota trovata':'Nessuna nota ancora. Tocca + per iniziare'}</div></div>}
                <div className="notes-grid">
                  {filteredNotes.map(n=>{
                    const grp=noteGroups.find(g=>g.id===n.group);
                    return(
                      <div key={n.id} className={`note-card${n.pinned?' pinned':''}`} onClick={()=>openNote(n)}>
                        {n.pinned&&<div className="note-card-pin"><Icon name='pin' size={12} color={meta.color}/></div>}

                        <div className="note-card-title">{n.title||'Senza titolo'}</div>
                        <div className="note-card-preview">{n.content}</div>
                        {grp&&<div className="note-card-group" style={{color:grp.color}}>● {grp.name}</div>}
                        <div className="note-card-date">{fmtDate(n.date)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── SHOPPING ── */}
            {notesSection==='shopping'&&(
              <div className="pad anim">
                <div className="greeting">Lista<br/><span>spesa</span></div>
                <div className="subhead">{shoppingLists.length} liste salvate</div>
                <button className="s-btn" style={{marginBottom:20}} onClick={()=>setShowNewShopping(true)}>+ Nuova lista</button>
                {shoppingLists.length===0&&<div style={{color:'var(--faint)',textAlign:'center',padding:'40px 0',fontFamily:"'Jost',sans-serif",fontSize:18,letterSpacing:1}}>Nessuna lista ancora</div>}
                <div className="list-cards">
                  {shoppingLists.map(l=>{
                    const done=l.items.filter(i=>i.checked).length;
                    return(
                      <div key={l.id} className="list-card" onClick={()=>setActiveShoppingId(l.id)}>
                        <div className="list-card-icon"><Icon name='nav_shop' size={28} color={meta.color}/></div>
                        <div className="list-card-info">
                          <div className="list-card-name">{l.name}</div>
                          <div className="list-card-meta">{done}/{l.items.length} articoli · {fmtDate(l.date)}</div>
                        </div>
                        <div style={{fontFamily:"'Jost',sans-serif",fontSize:22,fontWeight:500,color:meta.color}}>{l.items.length?Math.round(done/l.items.length*100)+'%':'—'}</div>
                        <div className="list-card-del" onClick={e=>{e.stopPropagation();deleteShoppingList(l.id);}}><Icon name='close' size={12}/></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TRAVEL ── */}
            {notesSection==='travel'&&(
              <div className="pad anim">
                <div className="greeting">Liste<br/><span>viaggio</span></div>
                <div className="subhead">{travelLists.length} liste salvate</div>
                <button className="s-btn" style={{marginBottom:20}} onClick={()=>setShowNewTravel(true)}>+ Nuova lista viaggio</button>
                {travelLists.length===0&&<div style={{color:'var(--faint)',textAlign:'center',padding:'40px 0',fontFamily:"'Jost',sans-serif",fontSize:18,letterSpacing:1}}>Nessuna lista viaggio</div>}
                <div className="list-cards">
                  {travelLists.map(l=>{
                    const tmpl=TRAVEL_TEMPLATES.find(t=>t.id===l.type);
                    const done=l.items.filter(i=>i.checked).length;
                    return(
                      <div key={l.id} className="travel-card" onClick={()=>setActiveTravelId(l.id)}>
                        <div className="travel-card-icon"><Icon name={tmpl?.icon||'t_plane'} size={28} color={tmpl?.color||meta.color}/></div>
                        <div className="travel-card-info">
                          <div className="travel-card-name" style={{color:tmpl?.color||meta.color}}>{l.name}</div>
                          <div className="travel-card-meta">{tmpl?.name||''} · {fmtDate(l.date)}</div>
                          <div style={{fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:400,color:'var(--muted)',marginTop:4}}>{done}/{l.items.length} voci</div>
                        </div>
                        <div style={{fontFamily:"'Jost',sans-serif",fontSize:26,fontWeight:500,color:tmpl?.color||meta.color,flexShrink:0}}>{l.items.length?Math.round(done/l.items.length*100)+'%':'—'}</div>
                        <div className="list-card-del" onClick={e=>{e.stopPropagation();deleteTravelList(l.id);}}><Icon name='close' size={12}/></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {/* FAB only for notes section */}
          {notesSection==='notes'&&<button className="note-add-fab" onClick={newNote} style={{background:meta.color,color:'#000'}}>+</button>}

          {/* Group Modal */}
          {showGroupModal&&(
            <div className="modal-bg" onClick={()=>setShowGroupModal(false)}>
              <div className="modal" onClick={e=>e.stopPropagation()}>
                <div className="m-title">Nuovo gruppo</div>
                <div className="m-row">
                  <input className="m-inp m-inp-text" placeholder="Nome gruppo (es. Lavoro, Idee, Ricette...)"
                    value={newGroupName} onChange={e=>setNewGroupName(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&addNoteGroup()}/>
                </div>
                <div className="m-row" style={{display:'flex',gap:10,alignItems:'center',paddingTop:4}}>
                  {NOTE_GROUP_COLORS.map(c=>(
                    <div key={c} onClick={()=>setNewGroupColor(c)}
                      style={{width:24,height:24,borderRadius:'50%',background:c,cursor:'pointer',
                        border: newGroupColor===c ? '2px solid var(--text)' : '2px solid transparent',
                        boxShadow: newGroupColor===c ? `0 0 6px ${c}88` : 'none',
                        flexShrink:0, transition:'border .15s,box-shadow .15s'}}/>
                  ))}
                </div>
                <div className="m-acts">
                  <button className="m-cancel" onClick={()=>setShowGroupModal(false)}>Annulla</button>
                  <button className="m-save" style={{background:newGroupColor}} onClick={addNoteGroup}>Crea gruppo</button>
                </div>
              </div>
            </div>
          )}

          {/* New Shopping List Modal */}
          {showNewShopping&&(
            <div className="modal-bg" onClick={()=>setShowNewShopping(false)}>
              <div className="modal" onClick={e=>e.stopPropagation()}>
                <div className="m-title">Nuova lista spesa</div>
                <div className="m-row">
                  <input className="m-inp m-inp-text" placeholder="Es. Settimanale, Festa, Cena..."
                    value={newShoppingName} onChange={e=>setNewShoppingName(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&addShoppingList()}/>
                </div>
                <div className="m-acts">
                  <button className="m-cancel" onClick={()=>setShowNewShopping(false)}>Annulla</button>
                  <button className="m-save" onClick={addShoppingList}>Crea lista</button>
                </div>
              </div>
            </div>
          )}

          {/* New Travel List Modal */}
          {showNewTravel&&(
            <div className="modal-bg" onClick={()=>setShowNewTravel(false)}>
              <div className="modal" onClick={e=>e.stopPropagation()} style={{maxHeight:'80dvh',overflowY:'auto'}}>
                <div className="m-title">Nuova lista viaggio</div>
                <div className="m-row">
                  <div className="m-lbl">Nome viaggio (opzionale)</div>
                  <input className="m-inp m-inp-text" placeholder="Es. Vacanze agosto, Roma weekend..."
                    value={newTravelForm.name} onChange={e=>setNewTravelForm(f=>({...f,name:e.target.value}))}/>
                </div>
                <div className="m-lbl" style={{marginBottom:10}}>Tipo di viaggio</div>
                <div className="tmpl-grid">
                  {TRAVEL_TEMPLATES.map(t=>(
                    <div key={t.id} className={`tmpl-card${newTravelForm.template===t.id?' sel':''}`}
                      style={newTravelForm.template===t.id?{'--acc':t.color}:{}}
                      onClick={()=>setNewTravelForm(f=>({...f,template:t.id}))}>
                      <div className="tmpl-card-icon"><Icon name={t.icon} size={26} color={newTravelForm.template===t.id?t.color:'var(--muted)'}/></div>
                      <div className="tmpl-card-name" style={newTravelForm.template===t.id?{color:t.color}:{}}>{t.name}</div>
                    </div>
                  ))}
                </div>
                <div className="m-acts">
                  <button className="m-cancel" onClick={()=>setShowNewTravel(false)}>Annulla</button>
                  <button className="m-save" onClick={addTravelList}>Crea lista</button>
                </div>
              </div>
            </div>
          )}
    </>
  );
}
