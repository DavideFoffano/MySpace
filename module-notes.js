/* ═══════════════════════════════════════════
   MODULE: NOTES
═══════════════════════════════════════════ */

/* ── Note Toolbar ── */
function NoteToolbar({taRef,content,onChange,color,mode,onToggleMode}){
  function wrapSel(pre,suf,placeholder){
    const ta=taRef.current;
    if(!ta) return;
    const s=ta.selectionStart,e=ta.selectionEnd;
    const sel=content.substring(s,e)||placeholder;
    const next=content.substring(0,s)+pre+sel+suf+content.substring(e);
    onChange(next);
    setTimeout(function(){ta.focus();ta.setSelectionRange(s+pre.length,s+pre.length+sel.length);},0);
  }
  function linePrefix(pre){
    const ta=taRef.current;
    if(!ta) return;
    const s=ta.selectionStart;
    const ls=content.lastIndexOf('\n',s-1)+1;
    const next=content.substring(0,ls)+pre+content.substring(ls);
    onChange(next);
    setTimeout(function(){ta.focus();ta.setSelectionRange(s+pre.length,s+pre.length);},0);
  }
  const tb={fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:600,padding:'5px 10px',borderRadius:6,border:'none',cursor:'pointer',background:'transparent',color:'var(--muted)',lineHeight:1,transition:'color .15s,background .15s'};
  const tbA={...tb,color:color,background:color+'22'};
  return(
    <div style={{display:'flex',alignItems:'center',gap:2,padding:'5px 10px',borderBottom:'1px solid rgba(120,100,60,0.2)'}}>
      <button style={tb} title="Grassetto" onClick={function(){wrapSel('**','**','testo');}}><b>B</b></button>
      <button style={{...tb,fontStyle:'italic'}} title="Corsivo" onClick={function(){wrapSel('*','*','testo');}}>I</button>
      <button style={tb} title="Intestazione" onClick={function(){linePrefix('## ');}}>H</button>
      <button style={tb} title="Lista puntata" onClick={function(){linePrefix('- ');}}>•—</button>
      <button style={tb} title="Checklist" onClick={function(){linePrefix('- [ ] ');}}>☑</button>
      <div style={{flex:1}}/>
      <button style={mode==='preview'?tbA:tb} title={mode==='preview'?'Torna a modifica':'Anteprima'} onClick={onToggleMode}>
        {mode==='preview'?'✏️ Modifica':'👁 Anteprima'}
      </button>
    </div>
  );
}

/* ── Note Preview renderer ── */
function NotePreview({content,onToggleCheck,dark,color}){
  function mdInline(text){
    return text
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,'<em>$1</em>');
  }
  const lines=(content||'').split('\n');
  const tc=dark?'#c8c5bd':'#3a2810';
  return(
    <div style={{flex:1,overflowY:'auto',padding:'16px 20px',fontFamily:"'Jost',sans-serif",color:tc}}>
      {lines.map(function(line,i){
        if(/^## /.test(line)) return(
          <div key={i} style={{fontSize:19,fontWeight:600,margin:'12px 0 5px',color:dark?'#e8e6df':'#1a1000'}}
            dangerouslySetInnerHTML={{__html:mdInline(line.slice(3))}}/>
        );
        if(/^# /.test(line)) return(
          <div key={i} style={{fontSize:23,fontWeight:600,margin:'14px 0 7px',color:dark?'#e8e6df':'#1a1000'}}
            dangerouslySetInnerHTML={{__html:mdInline(line.slice(2))}}/>
        );
        if(/^- \[[ x]\] /.test(line)){
          const checked=line[3]==='x';
          const text=line.slice(6);
          return(
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',cursor:'pointer'}} onClick={function(){onToggleCheck(i);}}>
              <div style={{width:17,height:17,borderRadius:4,border:'2px solid '+(checked?color:'#888'),background:checked?color:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .15s'}}>
                {checked&&<span style={{color:'#000',fontSize:10,fontWeight:700,lineHeight:1}}>✓</span>}
              </div>
              <span style={{textDecoration:checked?'line-through':'none',color:checked?'#888':tc,fontSize:15,lineHeight:1.5}}>{text}</span>
            </div>
          );
        }
        if(/^- /.test(line)) return(
          <div key={i} style={{display:'flex',gap:8,padding:'2px 0',fontSize:15,lineHeight:1.6}}>
            <span style={{color:color,flexShrink:0}}>•</span>
            <span dangerouslySetInnerHTML={{__html:mdInline(line.slice(2))}}/>
          </div>
        );
        if(line==='') return <div key={i} style={{height:8}}/>;
        return(
          <div key={i} style={{fontSize:15,lineHeight:1.65,padding:'1px 0'}}
            dangerouslySetInnerHTML={{__html:mdInline(line)}}/>
        );
      })}
    </div>
  );
}

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
  const [foodLibEditMode,setFoodLibEditMode]=useState(false);
  const [travelLists,setTravelLists]=useState(()=>LS.get('ms_travel')||[]);
  const [activeTravelId,setActiveTravelId]=useState(null);
  const [showNewTravel,setShowNewTravel]=useState(false);
  const [showTravelTemplateManager,setShowTravelTemplateManager]=useState(false);
  const [customTravelTemplates,setCustomTravelTemplates]=useState(()=>LS.get('ms_travel_templates')||null);
  const [tmplMgrActiveId,setTmplMgrActiveId]=useState(null);
  const [tmplMgrRenamingCat,setTmplMgrRenamingCat]=useState(null);
  const [tmplMgrCatVal,setTmplMgrCatVal]=useState('');
  const [tmplMgrRenamingItem,setTmplMgrRenamingItem]=useState(null);
  const [tmplMgrItemVal,setTmplMgrItemVal]=useState('');
  const [tmplMgrAddingCat,setTmplMgrAddingCat]=useState(null);
  const [tmplMgrNewCat,setTmplMgrNewCat]=useState('');
  const [tmplMgrAddingItem,setTmplMgrAddingItem]=useState(null);
  const [tmplMgrNewItem,setTmplMgrNewItem]=useState('');
  const [showNewShopping,setShowNewShopping]=useState(false);
  const [newShoppingName,setNewShoppingName]=useState('');
  const [newTravelForm,setNewTravelForm]=useState({name:'',template:'mare'});
  const [showGroupModal,setShowGroupModal]=useState(false);
  const [newGroupName,setNewGroupName]=useState('');
  const [newGroupColor,setNewGroupColor]=useState(NOTE_GROUP_COLORS[0]);
  const [showGroupManager,setShowGroupManager]=useState(false);
  const [editingGroupId,setEditingGroupId]=useState(null);
  const [editingGroupName,setEditingGroupName]=useState('');
  const [editingGroupColor,setEditingGroupColor]=useState(NOTE_GROUP_COLORS[0]);
  const [customTravelItem,setCustomTravelItem]=useState('');
  const [travelEditMode,setTravelEditMode]=useState(false);
  const [renamingTravelCat,setRenamingTravelCat]=useState(null);
  const [travelCatRenameVal,setTravelCatRenameVal]=useState('');
  const [renamingTravelItemId,setRenamingTravelItemId]=useState(null);
  const [travelItemRenameVal,setTravelItemRenameVal]=useState('');
  const [showAddTravelCat,setShowAddTravelCat]=useState(false);
  const [newTravelCatInput,setNewTravelCatInput]=useState('');
  const [newTravelCatItemInput,setNewTravelCatItemInput]=useState('');
  const [customFoodCats,setCustomFoodCats]=useState(()=>LS.get('ms_food_custom_cats')||[]);
  const [extraFoodItems,setExtraFoodItems]=useState(()=>LS.get('ms_food_extra_items')||{});
  const [deletedFoodItems,setDeletedFoodItems]=useState(()=>LS.get('ms_food_deleted_items')||{});
  const [renamedFoodItems,setRenamedFoodItems]=useState(()=>LS.get('ms_food_renamed_items')||{});
  const [showAddFoodCat,setShowAddFoodCat]=useState(false);
  const [newFoodCatForm,setNewFoodCatForm]=useState({cat:'',icon:'🍽️'});
  const [addItemTarget,setAddItemTarget]=useState(null);
  const [newFoodItemName,setNewFoodItemName]=useState('');
  const [renamingItem,setRenamingItem]=useState(null);
  const [renameInput,setRenameInput]=useState('');
  const lpTimerRef=useRef(null);
  const [noteEditorDark,setNoteEditorDark]=useState(()=>LS.get('ms_note_editor_dark')||false);
  const [noteSort,setNoteSort]=useState('date_desc');
  const [noteEditorMode,setNoteEditorMode]=useState('edit');
  const taRef=useRef(null);
  function toggleEditorTheme(){const v=!noteEditorDark;setNoteEditorDark(v);LS.set('ms_note_editor_dark',v);}


  /* ── Notes functions ── */
  const NOTE_COLORS=['#6dbb8a','#a8c26b','#c97a4a','#9b8fc2','#d4a84b','#7ab8b0'];
  function newNote(){setNoteEditorMode('edit');setEditingNote({id:null,title:'',content:'',color:'#a8c26b',pinned:false,group:noteGroupFilter!=='all'?noteGroupFilter:null});}
  function openNote(n){setNoteEditorMode('edit');setEditingNote({...n});}
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
  function exportNote(fmt){
    if(!editingNote) return;
    const title=editingNote.title||'nota';
    const body=editingNote.content||'';
    let text,filename,mime;
    if(fmt==='md'){
      text=(editingNote.title?'# '+editingNote.title+'\n\n':'')+body;
      filename=title.replace(/[^a-z0-9]/gi,'_').toLowerCase()+'.md';
      mime='text/markdown';
    } else {
      const plain=body
        .replace(/\*\*(.*?)\*\*/g,'$1').replace(/\*(.*?)\*/g,'$1')
        .replace(/^## /gm,'').replace(/^# /gm,'')
        .replace(/^- \[x\] /gm,'[✓] ').replace(/^- \[ \] /gm,'[ ] ')
        .replace(/^- /gm,'• ');
      text=(editingNote.title?editingNote.title+'\n\n':'')+plain;
      filename=title.replace(/[^a-z0-9]/gi,'_').toLowerCase()+'.txt';
      mime='text/plain';
    }
    const blob=new Blob([text],{type:mime});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=filename;a.click();
    URL.revokeObjectURL(url);
  }
  function toggleCheckLine(lineIdx){
    const lines=(editingNote.content||'').split('\n');
    const line=lines[lineIdx];
    if(!line) return;
    if(/^- \[ \] /.test(line)) lines[lineIdx]=line.replace(/^- \[ \] /,'- [x] ');
    else if(/^- \[x\] /.test(line)) lines[lineIdx]=line.replace(/^- \[x\] /,'- [ ] ');
    setEditingNote(function(n){return{...n,content:lines.join('\n')};});
  }
  const filteredNotes=useMemo(()=>{
    let arr=notes.filter(n=>{
      const mG=noteGroupFilter==='all'||(noteGroupFilter==='nogroup'?!n.group:n.group===noteGroupFilter);
      const mS=!noteSearch.trim()||n.title.toLowerCase().includes(noteSearch.toLowerCase())||n.content.toLowerCase().includes(noteSearch.toLowerCase());
      return mG&&mS;
    });
    if(noteSort==='date_asc') arr=arr.slice().sort(function(a,b){
      if(a.pinned!==b.pinned) return b.pinned?1:-1;
      return new Date(a.date)-new Date(b.date);
    });
    else if(noteSort==='name_asc') arr=arr.slice().sort(function(a,b){
      if(a.pinned!==b.pinned) return b.pinned?1:-1;
      return (a.title||'').localeCompare(b.title||'');
    });
    else if(noteSort==='name_desc') arr=arr.slice().sort(function(a,b){
      if(a.pinned!==b.pinned) return b.pinned?1:-1;
      return (b.title||'').localeCompare(a.title||'');
    });
    return arr;
  },[notes,noteGroupFilter,noteSearch,noteSort]);

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
  function renameNoteGroup(id,name,color){
    saveNoteGroups(noteGroups.map(g=>g.id===id?{...g,name:name.trim()||g.name,color}:g));
    setEditingGroupId(null);
  }
  function openGroupEdit(g){setEditingGroupId(g.id);setEditingGroupName(g.name);setEditingGroupColor(g.color);}

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

  /* ── Travel Templates ── */
  function getEffectiveTemplates(){return customTravelTemplates||TRAVEL_TEMPLATES;}
  function saveTravelTemplates(v){setCustomTravelTemplates(v);LS.set('ms_travel_templates',v);}
  function resetTemplate(id){
    const base=TRAVEL_TEMPLATES.find(function(t){return t.id===id;});
    if(!base) return;
    const current=getEffectiveTemplates();
    saveTravelTemplates(current.map(function(t){return t.id===id?JSON.parse(JSON.stringify(base)):t;}));
  }
  function tmplAddCat(tmplId,catName){
    if(!catName.trim()) return;
    saveTravelTemplates(getEffectiveTemplates().map(function(t){
      if(t.id!==tmplId) return t;
      return{...t,cats:[...t.cats,{cat:catName.trim(),items:[]}]};
    }));
    setTmplMgrAddingCat(null);setTmplMgrNewCat('');
  }
  function tmplDeleteCat(tmplId,catName){
    saveTravelTemplates(getEffectiveTemplates().map(function(t){
      if(t.id!==tmplId) return t;
      return{...t,cats:t.cats.filter(function(c){return c.cat!==catName;})};
    }));
  }
  function tmplRenameCat(tmplId,oldCat,newCat){
    if(!newCat.trim()||newCat.trim()===oldCat){setTmplMgrRenamingCat(null);return;}
    saveTravelTemplates(getEffectiveTemplates().map(function(t){
      if(t.id!==tmplId) return t;
      return{...t,cats:t.cats.map(function(c){return c.cat===oldCat?{...c,cat:newCat.trim()}:c;})};
    }));
    setTmplMgrRenamingCat(null);
  }
  function tmplAddItem(tmplId,catName,itemName){
    if(!itemName.trim()) return;
    saveTravelTemplates(getEffectiveTemplates().map(function(t){
      if(t.id!==tmplId) return t;
      return{...t,cats:t.cats.map(function(c){return c.cat!==catName?c:{...c,items:[...c.items,itemName.trim()]};})};
    }));
    setTmplMgrAddingItem(null);setTmplMgrNewItem('');
  }
  function tmplDeleteItem(tmplId,catName,itemName){
    saveTravelTemplates(getEffectiveTemplates().map(function(t){
      if(t.id!==tmplId) return t;
      return{...t,cats:t.cats.map(function(c){return c.cat!==catName?c:{...c,items:c.items.filter(function(x){return x!==itemName;})};})};
    }));
  }
  function tmplRenameItem(tmplId,catName,oldName,newName){
    if(!newName.trim()||newName.trim()===oldName){setTmplMgrRenamingItem(null);return;}
    saveTravelTemplates(getEffectiveTemplates().map(function(t){
      if(t.id!==tmplId) return t;
      return{...t,cats:t.cats.map(function(c){return c.cat!==catName?c:{...c,items:c.items.map(function(x){return x===oldName?newName.trim():x;})};})};
    }));
    setTmplMgrRenamingItem(null);
  }
  function tmplMoveItem(tmplId,catName,idx,dir){
    saveTravelTemplates(getEffectiveTemplates().map(function(t){
      if(t.id!==tmplId) return t;
      return{...t,cats:t.cats.map(function(c){
        if(c.cat!==catName) return c;
        const arr=[...c.items];
        const ni=idx+dir;
        if(ni<0||ni>=arr.length) return c;
        const tmp=arr[idx];arr[idx]=arr[ni];arr[ni]=tmp;
        return{...c,items:arr};
      })};
    }));
  }
  /* ── Travel Lists ── */
  function saveTravelLists(lists){setTravelLists(lists);LS.set('ms_travel',lists);}
  function addTravelList(){
    const tmpl=getEffectiveTemplates().find(t=>t.id===newTravelForm.template);
    const items=tmpl?tmpl.cats.flatMap(c=>c.items.map(name=>({id:uuid(),name,cat:c.cat,checked:false}))):[]; 
    const list={id:uuid(),name:newTravelForm.name.trim()||(tmpl&&tmpl.name||'Viaggio'),type:newTravelForm.template,date:new Date().toISOString(),items};
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
  function renameTravelCat(listId,oldCat,newCat){
    if(!newCat.trim()||newCat.trim()===oldCat){setRenamingTravelCat(null);return;}
    saveTravelLists(travelLists.map(function(l){
      if(l.id!==listId) return l;
      return{...l,items:l.items.map(function(i){return i.cat===oldCat?{...i,cat:newCat.trim()}:i;})};
    }));
    setRenamingTravelCat(null);
  }
  function deleteTravelCat(listId,cat){
    saveTravelLists(travelLists.map(function(l){
      if(l.id!==listId) return l;
      return{...l,items:l.items.filter(function(i){return i.cat!==cat;})};
    }));
  }
  function renameTravelItemInPlace(listId,itemId,newName){
    if(!newName.trim()){setRenamingTravelItemId(null);return;}
    saveTravelLists(travelLists.map(function(l){
      if(l.id!==listId) return l;
      return{...l,items:l.items.map(function(i){return i.id===itemId?{...i,name:newName.trim()}:i;})};
    }));
    setRenamingTravelItemId(null);
  }
  function moveTravelItem(listId,itemId,dir){
    saveTravelLists(travelLists.map(function(l){
      if(l.id!==listId) return l;
      const item=l.items.find(function(i){return i.id===itemId;});
      if(!item) return l;
      const catItems=l.items.filter(function(i){return i.cat===item.cat;});
      const others=l.items.filter(function(i){return i.cat!==item.cat;});
      const idx=catItems.findIndex(function(i){return i.id===itemId;});
      const newIdx=idx+dir;
      if(newIdx<0||newIdx>=catItems.length) return l;
      const swapped=[...catItems];
      const tmp=swapped[idx];swapped[idx]=swapped[newIdx];swapped[newIdx]=tmp;
      // Rebuild items preserving cat order
      const catOrder=[...new Set(l.items.map(function(i){return i.cat;}))];
      const rebuilt=catOrder.flatMap(function(c){return c===item.cat?swapped:l.items.filter(function(i){return i.cat===c;});});
      return{...l,items:rebuilt};
    }));
  }
  function addTravelCatWithItem(listId,catName,firstItem){
    if(!catName.trim()) return;
    const newItem={id:uuid(),name:firstItem.trim()||'Nuovo elemento',cat:catName.trim(),checked:false};
    saveTravelLists(travelLists.map(function(l){return l.id!==listId?l:{...l,items:[...l.items,newItem]};}));
    setShowAddTravelCat(false);setNewTravelCatInput('');setNewTravelCatItemInput('');
  }
  /* ── Custom Food Library ── */
  function saveCustomFoodCats(v){setCustomFoodCats(v);LS.set('ms_food_custom_cats',v);}
  function saveExtraFoodItems(v){setExtraFoodItems(v);LS.set('ms_food_extra_items',v);}
  function saveDeletedFoodItems(v){setDeletedFoodItems(v);LS.set('ms_food_deleted_items',v);}
  function saveRenamedFoodItems(v){setRenamedFoodItems(v);LS.set('ms_food_renamed_items',v);}
  function addFoodCat(){
    if(!newFoodCatForm.cat.trim()) return;
    saveCustomFoodCats([...customFoodCats,{id:uuid(),cat:newFoodCatForm.cat.trim(),icon:newFoodCatForm.icon||'🍽️',items:[]}]);
    setNewFoodCatForm({cat:'',icon:'🍽️'});setShowAddFoodCat(false);
  }
  function deleteCustomFoodCat(id){saveCustomFoodCats(customFoodCats.filter(c=>c.id!==id));}
  function addItemToBuiltinCat(catName,name){
    if(!name.trim()) return;
    const prev=extraFoodItems[catName]||[];
    if(prev.map(function(x){return x.toLowerCase();}).includes(name.trim().toLowerCase())) return;
    saveExtraFoodItems({...extraFoodItems,[catName]:[...prev,name.trim()]});
    setNewFoodItemName('');setAddItemTarget(null);
  }
  function deleteBuiltinFoodItem(catName,name){
    const prev=deletedFoodItems[catName]||[];
    if(prev.includes(name)) return;
    saveDeletedFoodItems({...deletedFoodItems,[catName]:[...prev,name]});
    const rn={...renamedFoodItems};
    if(rn[catName]&&rn[catName][name]){delete rn[catName][name];saveRenamedFoodItems(rn);}
  }
  function deleteExtraFoodItem(catName,name){
    const next=(extraFoodItems[catName]||[]).filter(function(x){return x!==name;});
    const obj={...extraFoodItems,[catName]:next};
    if(!next.length) delete obj[catName];
    saveExtraFoodItems(obj);
  }
  function renameBuiltinFoodItem(catName,oldName,newName){
    if(!newName.trim()||newName.trim()===oldName){setRenamingItem(null);return;}
    const catRenames={...(renamedFoodItems[catName]||{}),[oldName]:newName.trim()};
    saveRenamedFoodItems({...renamedFoodItems,[catName]:catRenames});
    setSelectedFoods(function(f){return f.map(function(x){return x===oldName?newName.trim():x;});});
    setRenamingItem(null);
  }
  function renameExtraFoodItem(catName,oldName,newName){
    if(!newName.trim()||newName.trim()===oldName){setRenamingItem(null);return;}
    saveExtraFoodItems({...extraFoodItems,[catName]:(extraFoodItems[catName]||[]).map(function(x){return x===oldName?newName.trim():x;})});
    setSelectedFoods(function(f){return f.map(function(x){return x===oldName?newName.trim():x;});});
    setRenamingItem(null);
  }
  function addItemToCustomCat(catId,name){
    if(!name.trim()) return;
    saveCustomFoodCats(customFoodCats.map(function(c){return c.id!==catId?c:{...c,items:[...c.items,name.trim()]};}));
    setNewFoodItemName('');setAddItemTarget(null);
  }
  function deleteCustomFoodItem(catId,name){
    saveCustomFoodCats(customFoodCats.map(function(c){return c.id!==catId?c:{...c,items:c.items.filter(function(x){return x!==name;})};}));
  }
  function renameCustomFoodItem(catId,oldName,newName){
    if(!newName.trim()||newName.trim()===oldName){setRenamingItem(null);return;}
    saveCustomFoodCats(customFoodCats.map(function(c){return c.id!==catId?c:{...c,items:c.items.map(function(x){return x===oldName?newName.trim():x;})};}));
    setSelectedFoods(function(f){return f.map(function(x){return x===oldName?newName.trim():x;});});
    setRenamingItem(null);
  }
  function startLongPress(chipKey,displayName,catObj){
    lpTimerRef.current=setTimeout(function(){
      setRenamingItem({key:chipKey,cat:catObj.cat,catId:catObj.id,isCustomCat:catObj.isCustomCat,isExtra:catObj.isExtra,originalName:displayName});
      setRenameInput(displayName);
    },500);
  }
  function cancelLongPress(){clearTimeout(lpTimerRef.current);}
  function commitRename(){
    if(!renamingItem) return;
    const r=renamingItem;
    if(r.isCustomCat) renameCustomFoodItem(r.catId,r.originalName,renameInput);
    else if(r.isExtra) renameExtraFoodItem(r.cat,r.originalName,renameInput);
    else renameBuiltinFoodItem(r.cat,r.originalName,renameInput);
  }
  const mergedFoodLib=useMemo(function(){
    const deletedSet={};
    Object.keys(deletedFoodItems).forEach(function(c){deletedSet[c]=new Set(deletedFoodItems[c]);});
    const base=FOOD_LIB.map(function(g){
      const del=deletedSet[g.cat]||new Set();
      const rn=renamedFoodItems[g.cat]||{};
      const builtinItems=g.items.filter(function(x){return!del.has(x);}).map(function(x){return rn[x]||x;});
      const extra=(extraFoodItems[g.cat]||[]).filter(function(x){return!del.has(x);});
      return{...g,isCustomCat:false,items:[...builtinItems,...extra],_extraSet:new Set(extra),_renames:rn};
    });
    const custom=customFoodCats.map(function(g){return{...g,isCustomCat:true,_extraSet:new Set()};});
    return[...base,...custom];
  },[customFoodCats,extraFoodItems,deletedFoodItems,renamedFoodItems]);
  const filteredFoodLib=useMemo(()=>{
    if(!foodLibSearch.trim()) return mergedFoodLib;
    const q=foodLibSearch.toLowerCase();
    return mergedFoodLib.map(g=>({...g,items:g.items.filter(i=>i.toLowerCase().includes(q))})).filter(g=>g.items.length>0);
  },[mergedFoodLib,foodLibSearch]);


  const activeShoppingList=shoppingLists.find(l=>l.id===activeShoppingId);
  const activeTravelList=travelLists.find(l=>l.id===activeTravelId);
  const isViewingShopping=notesSection==='shopping'&&activeShoppingId&&activeShoppingList;
  const isViewingTravel=notesSection==='travel'&&activeTravelId&&activeTravelList;





  if(editingNote){
    const bgImg=noteEditorDark
      ?`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E")`
      :`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='0.10'/%3E%3C/svg%3E")`;
    return(
      <div className="app">
        <div className="note-editor" style={{background:noteEditorDark?'#111110':'#e8dfc8',backgroundImage:bgImg}}>
          <div className="note-editor-hdr" style={{background:noteEditorDark?'rgba(17,17,16,0.9)':'rgba(220,200,160,0.25)',borderBottom:noteEditorDark?'1px solid #252521':'1px solid rgba(160,130,90,0.3)'}}>
            <button className="back" onClick={()=>setEditingNote(null)}><Icon name="back_arr" size={16}/></button>
            <div style={{flex:1,fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:400,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>
              {editingNote.id?'Modifica nota':'Nuova nota'}
            </div>
            <div className="note-editor-actions">
              {editingNote.id&&<button className="note-editor-btn" onClick={()=>deleteNote(editingNote.id)}><Icon name='close' size={14}/></button>}
              {editingNote.id&&<button className="note-editor-btn" onClick={()=>{togglePin(editingNote.id);setEditingNote(n=>({...n,pinned:!n.pinned}));}}>
                {editingNote.pinned?'📌':'📍'}
              </button>}
              <button className="note-editor-btn" onClick={toggleEditorTheme} title="Cambia tema" style={{fontSize:'16px',padding:'4px 10px'}}>{noteEditorDark?'☀':'🌙'}</button>
              <button className="note-editor-btn note-save-btn" style={{background:meta.color}} onClick={saveNote}>Salva</button>
            </div>
          </div>
          <NoteToolbar
            taRef={taRef}
            content={editingNote.content||''}
            onChange={function(v){setEditingNote(function(n){return{...n,content:v};});}}
            color={meta.color}
            mode={noteEditorMode}
            onToggleMode={function(){setNoteEditorMode(function(m){return m==='edit'?'preview':'edit';});}}
          />
          <input className="note-title-inp" placeholder="TITOLO..." style={{color:noteEditorDark?'#e8e6df':'#2e1f0a'}} value={editingNote.title}
            onChange={e=>setEditingNote(n=>({...n,title:e.target.value}))}/>
          {noteEditorMode==='edit'
            ?<textarea ref={taRef} className="note-body-inp" placeholder="Scrivi qualcosa... (usa B I H • ☑ sopra per formattare)" style={{color:noteEditorDark?'#c8c5bd':'#3a2810'}} value={editingNote.content}
                onChange={e=>setEditingNote(n=>({...n,content:e.target.value}))}/>
            :<NotePreview content={editingNote.content||''} onToggleCheck={toggleCheckLine} dark={noteEditorDark} color={meta.color}/>
          }
          <div className="note-bottom-bar" style={{background:noteEditorDark?'#161614':'var(--surface)',borderTop:noteEditorDark?'1px solid #252521':'1px solid var(--border)'}}>
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
            <div style={{display:'flex',gap:8,paddingTop:noteGroups.length>0?'8px':'0',justifyContent:'flex-end'}}>
              <button onClick={function(){exportNote('md');}} style={{fontFamily:"'Jost',sans-serif",fontSize:12,fontWeight:500,padding:'5px 12px',borderRadius:8,border:'1px solid var(--border2)',background:'transparent',color:'var(--muted)',cursor:'pointer',letterSpacing:'0.05em'}}>↓ .md</button>
              <button onClick={function(){exportNote('txt');}} style={{fontFamily:"'Jost',sans-serif",fontSize:12,fontWeight:500,padding:'5px 12px',borderRadius:8,border:'1px solid var(--border2)',background:'transparent',color:'var(--muted)',cursor:'pointer',letterSpacing:'0.05em'}}>↓ .txt</button>
            </div>
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
              <button className="back" onClick={()=>{setShowFoodLib(false);setSelectedFoods([]);setFoodLibSearch('');setAddItemTarget(null);setShowAddFoodCat(false);setFoodLibEditMode(false);}}><Icon name="back_arr" size={16}/></button>
              <div className="food-lib-title">Libreria alimenti</div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <button onClick={function(){setFoodLibEditMode(function(v){return!v;});setAddItemTarget(null);setShowAddFoodCat(false);setRenamingItem(null);}}
                  style={{fontFamily:"'Jost',sans-serif",fontSize:12,fontWeight:600,padding:'4px 10px',borderRadius:8,border:'1px solid '+(foodLibEditMode?meta.color:'var(--border2)'),background:foodLibEditMode?meta.color:'transparent',color:foodLibEditMode?'#000':'var(--muted)',cursor:'pointer',transition:'all .15s'}}>
                  {foodLibEditMode?'✓ Fine':'✏️'}
                </button>
                <button className="food-lib-confirm" onClick={()=>addFoodsToList(list.id,selectedFoods)} disabled={!selectedFoods.length}
                  style={{opacity:selectedFoods.length?1:.4}}>
                  Aggiungi {selectedFoods.length>0?`(${selectedFoods.length})`:''}
                </button>
              </div>
            </div>
            <input className="food-lib-search" placeholder="Cerca alimento..." value={foodLibSearch} onChange={e=>setFoodLibSearch(e.target.value)}/>
            <div className="food-sel-count" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span>{selectedFoods.length>0?`${selectedFoods.length} selezionati`:'Seleziona gli alimenti da aggiungere'}</span>
              {foodLibEditMode&&<button onClick={function(){setShowAddFoodCat(function(v){return!v;});setAddItemTarget(null);}}
                style={{fontFamily:"'Jost',sans-serif",fontSize:12,fontWeight:500,padding:'4px 10px',borderRadius:8,border:'1px solid var(--border2)',background:showAddFoodCat?meta.color:'transparent',color:showAddFoodCat?'#000':'var(--muted)',cursor:'pointer',flexShrink:0,transition:'all .15s'}}>
                + Categoria
              </button>}
            </div>
            {showAddFoodCat&&(
              <div style={{margin:'0 12px 10px',background:'var(--surface2)',borderRadius:12,border:'1px dashed var(--border2)',padding:'12px'}}>
                <div style={{display:'flex',gap:8,marginBottom:8}}>
                  <input
                    value={newFoodCatForm.icon}
                    onChange={function(e){setNewFoodCatForm(function(f){return{...f,icon:e.target.value};});}}
                    style={{width:42,textAlign:'center',background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:8,padding:'6px',color:'var(--text)',fontFamily:"'Jost',sans-serif",fontSize:18,outline:'none'}}
                    placeholder="🍽️"
                    maxLength={4}/>
                  <input
                    autoFocus
                    value={newFoodCatForm.cat}
                    onChange={function(e){setNewFoodCatForm(function(f){return{...f,cat:e.target.value};});}}
                    onKeyDown={function(e){if(e.key==='Enter') addFoodCat();}}
                    style={{flex:1,background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:8,padding:'6px 10px',color:'var(--text)',fontFamily:"'Jost',sans-serif",fontSize:14,outline:'none'}}
                    placeholder="Nome categoria..."/>
                </div>
                <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                  <button onClick={function(){setShowAddFoodCat(false);setNewFoodCatForm({cat:'',icon:'🍽️'});}}
                    style={{fontFamily:"'Jost',sans-serif",fontSize:12,padding:'5px 12px',borderRadius:8,border:'1px solid var(--border2)',background:'transparent',color:'var(--muted)',cursor:'pointer'}}>Annulla</button>
                  <button onClick={addFoodCat}
                    style={{fontFamily:"'Jost',sans-serif",fontSize:12,fontWeight:600,padding:'5px 12px',borderRadius:8,border:'none',background:meta.color,color:'#000',cursor:'pointer'}}>Crea</button>
                </div>
              </div>
            )}
            <div className="food-lib-body">
              {filteredFoodLib.map(function(g){
                const isAdding=addItemTarget===g.cat;
                return(
                  <div key={g.cat}>
                    <div className="food-cat-hdr" style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingRight:12}}>
                      <span>{g.icon} {g.cat}</span>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        {foodLibEditMode&&g.isCustomCat&&(
                          <button onClick={function(){deleteCustomFoodCat(g.id);}}
                            style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--muted)',padding:'2px 4px',fontSize:11,lineHeight:1}}>✕</button>
                        )}
                        {foodLibEditMode&&<button onClick={function(){setAddItemTarget(isAdding?null:g.cat);setNewFoodItemName('');}}
                          style={{fontFamily:"'Jost',sans-serif",fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:6,border:'1px solid var(--border2)',background:isAdding?meta.color:'transparent',color:isAdding?'#000':'var(--muted)',cursor:'pointer',transition:'all .15s'}}>
                          +
                        </button>}
                      </div>
                    </div>
                    {isAdding&&(
                      <div style={{padding:'6px 12px 8px',display:'flex',gap:6}}>
                        <input
                          autoFocus
                          value={newFoodItemName}
                          onChange={function(e){setNewFoodItemName(e.target.value);}}
                          onKeyDown={function(e){
                            if(e.key==='Enter'){
                              if(g.isCustomCat) addItemToCustomCat(g.id,newFoodItemName);
                              else addItemToBuiltinCat(g.cat,newFoodItemName);
                            }
                            if(e.key==='Escape') setAddItemTarget(null);
                          }}
                          style={{flex:1,background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:8,padding:'6px 10px',color:'var(--text)',fontFamily:"'Jost',sans-serif",fontSize:13,outline:'none'}}
                          placeholder="Nome alimento..."/>
                        <button onClick={function(){if(g.isCustomCat) addItemToCustomCat(g.id,newFoodItemName);else addItemToBuiltinCat(g.cat,newFoodItemName);}}
                          style={{fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:600,padding:'6px 12px',borderRadius:8,border:'none',background:meta.color,color:'#000',cursor:'pointer'}}>
                          +
                        </button>
                      </div>
                    )}
                    <div className="food-items-grid">
                      {g.items.map(function(item){
                        const sel=selectedFoods.includes(item);
                        const isExtra=g.isCustomCat||(g._extraSet&&g._extraSet.has(item));
                        const chipKey=g.cat+'::'+item;
                        const isRenaming=renamingItem&&renamingItem.key===chipKey;
                        if(isRenaming){
                          return(
                            <div key={item} style={{display:'inline-flex',alignItems:'center',gap:4}}>
                              <input
                                autoFocus
                                value={renameInput}
                                onChange={function(e){setRenameInput(e.target.value);}}
                                onKeyDown={function(e){if(e.key==='Enter') commitRename();if(e.key==='Escape') setRenamingItem(null);}}
                                onBlur={commitRename}
                                style={{background:'var(--surface)',border:'1px solid '+meta.color,borderRadius:8,padding:'4px 8px',color:'var(--text)',fontFamily:"'Jost',sans-serif",fontSize:13,outline:'none',width:110}}/>
                            </div>
                          );
                        }
                        return(
                          <div key={item} style={{position:'relative',display:'inline-flex'}}>
                            <div className={`food-chip${sel?' sel':''}`}
                              style={{paddingRight:foodLibEditMode?20:undefined,userSelect:'none'}}
                              onClick={function(){if(!foodLibEditMode) setSelectedFoods(function(f){return sel?f.filter(function(x){return x!==item;}):[...f,item];});}}
                              onMouseDown={function(){if(foodLibEditMode) startLongPress(chipKey,item,{cat:g.cat,id:g.id,isCustomCat:g.isCustomCat,isExtra});}}
                              onMouseUp={cancelLongPress}
                              onMouseLeave={cancelLongPress}
                              onTouchStart={function(){if(foodLibEditMode) startLongPress(chipKey,item,{cat:g.cat,id:g.id,isCustomCat:g.isCustomCat,isExtra});}}
                              onTouchEnd={cancelLongPress}>
                              {item}
                            </div>
                            {foodLibEditMode&&(
                              <span onClick={function(e){
                                  e.stopPropagation();
                                  if(g.isCustomCat) deleteCustomFoodItem(g.id,item);
                                  else if(isExtra) deleteExtraFoodItem(g.cat,item);
                                  else deleteBuiltinFoodItem(g.cat,item);
                                }}
                                style={{position:'absolute',top:0,right:0,width:16,height:16,borderRadius:'50%',background:'var(--surface)',border:'1px solid var(--border2)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:9,color:'var(--muted)',lineHeight:1,transform:'translate(30%,-30%)'}}>
                                ✕
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
              <div className="shop-progress" style={{background:'var(--border)'}}><div className="shop-progress-bar" style={{width:pct+'%'}}/></div>
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
    const cats=[...new Set(list.items.map(i=>i.cat))];
    const tColor=tmpl?tmpl.color:meta.color;
    const jost={fontFamily:"'Jost',sans-serif"};
    return(
      <div className="app" style={{'--acc':meta.color,'--acc-bg':meta.color+'18','--acc-surface':meta.bg,'--acc-border':meta.border}}>
        <div className="travel-detail">
          <div className="shop-hdr">
            <button className="back" onClick={()=>{setActiveTravelId(null);setTravelEditMode(false);setRenamingTravelCat(null);setRenamingTravelItemId(null);setShowAddTravelCat(false);}}><Icon name="back_arr" size={16}/></button>
            <div className="shop-hdr-title">{tmpl&&tmpl.icon||'✈️'} {list.name}</div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              {!travelEditMode&&<div style={{fontSize:13,color:'var(--muted)',...jost,fontWeight:700}}>{done}/{list.items.length}</div>}
              <button onClick={function(){setTravelEditMode(function(v){return!v;});setRenamingTravelCat(null);setRenamingTravelItemId(null);setShowAddTravelCat(false);}}
                style={{...jost,fontSize:12,fontWeight:600,padding:'4px 12px',borderRadius:8,border:'1px solid '+(travelEditMode?tColor:'var(--border2)'),background:travelEditMode?tColor:'transparent',color:travelEditMode?'#000':'var(--muted)',cursor:'pointer',transition:'all .15s'}}>
                {travelEditMode?'✓ Fine':'✏️ Modifica'}
              </button>
            </div>
          </div>
          <div className="shop-body">
            {!travelEditMode&&(
              <div style={{padding:'12px 22px 0'}}>
                <div className="shop-progress" style={{background:'var(--border)'}}><div className="shop-progress-bar" style={{width:pct+'%',background:tColor}}/></div>
              </div>
            )}
            {!travelEditMode&&(
              <div className="travel-add-row">
                <input className="travel-add-inp" placeholder="Aggiungi voce personalizzata..." value={customTravelItem}
                  onChange={e=>setCustomTravelItem(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'){addCustomTravelItem(list.id,customTravelItem);}}}/>
                <button className="travel-add-submit" onClick={()=>addCustomTravelItem(list.id,customTravelItem)}>+</button>
              </div>
            )}
            {cats.map(function(cat){
              const items=list.items.filter(function(i){return i.cat===cat;});
              const isRenamingCat=renamingTravelCat===cat;
              return(
                <div key={cat} className="travel-section">
                  {/* Category header */}
                  <div className="travel-section-hdr" style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingRight:travelEditMode?8:0}}>
                    {isRenamingCat
                      ?<input autoFocus value={travelCatRenameVal}
                          onChange={function(e){setTravelCatRenameVal(e.target.value);}}
                          onKeyDown={function(e){if(e.key==='Enter') renameTravelCat(list.id,cat,travelCatRenameVal);if(e.key==='Escape') setRenamingTravelCat(null);}}
                          onBlur={function(){renameTravelCat(list.id,cat,travelCatRenameVal);}}
                          style={{flex:1,background:'var(--surface2)',border:'1px solid '+tColor,borderRadius:6,padding:'3px 8px',...jost,fontSize:12,color:'var(--text)',outline:'none',marginRight:8}}/>
                      :<span style={{flex:1}}>{cat} {!travelEditMode&&'· '+items.filter(function(i){return i.checked;}).length+'/'+items.length}</span>
                    }
                    {travelEditMode&&!isRenamingCat&&(
                      <div style={{display:'flex',gap:4,flexShrink:0}}>
                        <button onClick={function(){setRenamingTravelCat(cat);setTravelCatRenameVal(cat);}}
                          style={{...jost,fontSize:11,padding:'2px 8px',borderRadius:6,border:'1px solid var(--border2)',background:'transparent',color:'var(--muted)',cursor:'pointer'}}>
                          ✏️
                        </button>
                        <button onClick={function(){deleteTravelCat(list.id,cat);}}
                          style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--muted)',padding:'2px 4px',display:'flex',alignItems:'center'}}>
                          <Icon name='close' size={11}/>
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Items */}
                  {items.map(function(item,idx){
                    const isRenamingItem=renamingTravelItemId===item.id;
                    return(
                      <div key={item.id} className={`travel-item${item.checked&&!travelEditMode?' done':''}`}
                        style={travelEditMode?{paddingLeft:8,gap:6,background:'transparent'}:{}}>
                        {travelEditMode?(
                          <>
                            <div style={{display:'flex',flexDirection:'column',gap:1,flexShrink:0}}>
                              <button onClick={function(){moveTravelItem(list.id,item.id,-1);}} disabled={idx===0}
                                style={{...jost,fontSize:9,lineHeight:1,padding:'1px 4px',background:'transparent',border:'none',cursor:idx===0?'default':'pointer',color:idx===0?'var(--border2)':'var(--muted)'}}>▲</button>
                              <button onClick={function(){moveTravelItem(list.id,item.id,1);}} disabled={idx===items.length-1}
                                style={{...jost,fontSize:9,lineHeight:1,padding:'1px 4px',background:'transparent',border:'none',cursor:idx===items.length-1?'default':'pointer',color:idx===items.length-1?'var(--border2)':'var(--muted)'}}>▼</button>
                            </div>
                            {isRenamingItem
                              ?<input autoFocus value={travelItemRenameVal}
                                  onChange={function(e){setTravelItemRenameVal(e.target.value);}}
                                  onKeyDown={function(e){if(e.key==='Enter') renameTravelItemInPlace(list.id,item.id,travelItemRenameVal);if(e.key==='Escape') setRenamingTravelItemId(null);}}
                                  onBlur={function(){renameTravelItemInPlace(list.id,item.id,travelItemRenameVal);}}
                                  style={{flex:1,background:'var(--surface2)',border:'1px solid '+tColor,borderRadius:6,padding:'4px 8px',...jost,fontSize:14,color:'var(--text)',outline:'none'}}/>
                              :<div className="travel-item-name" style={{flex:1,cursor:'pointer'}}
                                  onClick={function(){setRenamingTravelItemId(item.id);setTravelItemRenameVal(item.name);}}>
                                {item.name}
                              </div>
                            }
                            {!isRenamingItem&&(
                              <div className="travel-item-del" onClick={function(){deleteTravelItem(list.id,item.id);}}><Icon name='close' size={12}/></div>
                            )}
                          </>
                        ):(
                          <>
                            <div className={`travel-check${item.checked?' on':''}`} onClick={()=>toggleTravelItem(list.id,item.id)} style={item.checked?{background:tColor,borderColor:tColor}:{}}>{item.checked?'✓':''}</div>
                            <div className="travel-item-name">{item.name}</div>
                            <button onClick={function(){deleteTravelItem(list.id,item.id);}}
                              style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--muted)',padding:'4px 6px',display:'flex',alignItems:'center',flexShrink:0,opacity:0.6}}>
                              <Icon name='close' size={11}/>
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {/* Add category in edit mode */}
            {travelEditMode&&(
              <div style={{padding:'12px 16px'}}>
                {showAddTravelCat?(
                  <div style={{background:'var(--surface2)',borderRadius:12,border:'1px dashed var(--border2)',padding:'12px'}}>
                    <div style={{...jost,fontSize:11,color:'var(--muted)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8}}>Nuova categoria</div>
                    <input value={newTravelCatInput} onChange={function(e){setNewTravelCatInput(e.target.value);}}
                      style={{width:'100%',background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:8,padding:'7px 10px',...jost,fontSize:14,color:'var(--text)',outline:'none',marginBottom:8,boxSizing:'border-box'}}
                      placeholder="Nome categoria..."/>
                    <input value={newTravelCatItemInput} onChange={function(e){setNewTravelCatItemInput(e.target.value);}}
                      onKeyDown={function(e){if(e.key==='Enter') addTravelCatWithItem(list.id,newTravelCatInput,newTravelCatItemInput);}}
                      style={{width:'100%',background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:8,padding:'7px 10px',...jost,fontSize:14,color:'var(--text)',outline:'none',marginBottom:10,boxSizing:'border-box'}}
                      placeholder="Primo elemento (opzionale)..."/>
                    <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                      <button onClick={function(){setShowAddTravelCat(false);setNewTravelCatInput('');setNewTravelCatItemInput('');}}
                        style={{...jost,fontSize:13,padding:'6px 14px',borderRadius:10,border:'1px solid var(--border2)',background:'transparent',color:'var(--muted)',cursor:'pointer'}}>
                        Annulla
                      </button>
                      <button onClick={function(){addTravelCatWithItem(list.id,newTravelCatInput,newTravelCatItemInput);}}
                        style={{...jost,fontSize:13,fontWeight:600,padding:'6px 14px',borderRadius:10,border:'none',background:tColor,color:'#000',cursor:'pointer'}}>
                        Crea
                      </button>
                    </div>
                  </div>
                ):(
                  <button onClick={function(){setShowAddTravelCat(true);}}
                    style={{width:'100%',padding:'10px',...jost,fontSize:13,fontWeight:500,borderRadius:12,border:'1px dashed var(--border2)',background:'transparent',color:'var(--muted)',cursor:'pointer',letterSpacing:'0.05em'}}>
                    + Aggiungi categoria
                  </button>
                )}
              </div>
            )}
            <div style={{height:40}}/>
          </div>
        </div>
      </div>
    );
  }


  if(showTravelTemplateManager){
    const jost={fontFamily:"'Jost',sans-serif"};
    const tmpls=getEffectiveTemplates();
    return(
      <div className="app" style={{'--acc':meta.color}}>
        <div className="food-lib-overlay" style={{background:'var(--surface)'}}>
          <div className="food-lib-hdr" style={{borderBottom:'1px solid var(--border)'}}>
            <button className="back" onClick={function(){setShowTravelTemplateManager(false);setTmplMgrActiveId(null);setTmplMgrRenamingCat(null);setTmplMgrRenamingItem(null);}}><Icon name="back_arr" size={16}/></button>
            <div className="food-lib-title">Modifica template</div>
            <div style={{width:60}}/>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'12px 16px'}}>
            {tmpls.map(function(tmpl){
              const isOpen=tmplMgrActiveId===tmpl.id;
              return(
                <div key={tmpl.id} style={{marginBottom:10,borderRadius:14,border:'1px solid '+(isOpen?tmpl.color:'var(--border)'),overflow:'hidden',transition:'border-color .2s'}}>
                  {/* Template header */}
                  <div onClick={function(){setTmplMgrActiveId(isOpen?null:tmpl.id);setTmplMgrRenamingCat(null);setTmplMgrRenamingItem(null);setTmplMgrAddingCat(null);setTmplMgrAddingItem(null);}}
                    style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:'var(--surface2)',cursor:'pointer'}}>
                    <span style={{fontSize:20}}>{tmpl.icon}</span>
                    <div style={{...jost,fontSize:15,fontWeight:500,color:isOpen?tmpl.color:'var(--text)',flex:1,transition:'color .2s'}}>{tmpl.name}</div>
                    <div style={{...jost,fontSize:11,color:'var(--muted)'}}>{tmpl.cats.reduce(function(s,c){return s+c.items.length;},0)} voci</div>
                    <div style={{...jost,fontSize:11,color:'var(--muted)',marginLeft:2}}>{isOpen?'▲':'▼'}</div>
                  </div>
                  {isOpen&&(
                    <div style={{background:'var(--surface)',padding:'8px 0 4px'}}>
                      {tmpl.cats.map(function(cat){
                        const catKey=tmpl.id+'::'+cat.cat;
                        const isRenamingCat=tmplMgrRenamingCat===catKey;
                        const isAddingItem=tmplMgrAddingItem===catKey;
                        return(
                          <div key={cat.cat} style={{borderTop:'1px solid var(--border)',paddingTop:6,marginTop:4}}>
                            {/* Cat row */}
                            <div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 12px'}}>
                              {isRenamingCat
                                ?<input autoFocus value={tmplMgrCatVal}
                                    onChange={function(e){setTmplMgrCatVal(e.target.value);}}
                                    onKeyDown={function(e){if(e.key==='Enter') tmplRenameCat(tmpl.id,cat.cat,tmplMgrCatVal);if(e.key==='Escape') setTmplMgrRenamingCat(null);}}
                                    onBlur={function(){tmplRenameCat(tmpl.id,cat.cat,tmplMgrCatVal);}}
                                    style={{flex:1,background:'var(--surface2)',border:'1px solid '+tmpl.color,borderRadius:6,padding:'3px 8px',...jost,fontSize:12,color:'var(--text)',outline:'none'}}/>
                                :<div style={{...jost,fontSize:12,fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.06em',flex:1}}>{cat.cat}</div>
                              }
                              {!isRenamingCat&&(
                                <>
                                  <button onClick={function(){setTmplMgrRenamingCat(catKey);setTmplMgrCatVal(cat.cat);}}
                                    style={{...jost,fontSize:10,padding:'2px 6px',borderRadius:5,border:'1px solid var(--border2)',background:'transparent',color:'var(--muted)',cursor:'pointer'}}>✏️</button>
                                  <button onClick={function(){tmplDeleteCat(tmpl.id,cat.cat);}}
                                    style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--muted)',padding:'2px 4px',display:'flex',alignItems:'center'}}>
                                    <Icon name='close' size={10}/>
                                  </button>
                                </>
                              )}
                            </div>
                            {/* Items */}
                            {cat.items.map(function(item,idx){
                              const itemKey=catKey+'::'+item;
                              const isRenamingItem=tmplMgrRenamingItem===itemKey;
                              return(
                                <div key={item} style={{display:'flex',alignItems:'center',gap:6,padding:'3px 12px 3px 20px'}}>
                                  <div style={{display:'flex',flexDirection:'column',flexShrink:0}}>
                                    <button onClick={function(){tmplMoveItem(tmpl.id,cat.cat,idx,-1);}} disabled={idx===0}
                                      style={{...jost,fontSize:8,lineHeight:1,padding:'1px 3px',background:'transparent',border:'none',cursor:idx===0?'default':'pointer',color:idx===0?'var(--border2)':'var(--muted)'}}>▲</button>
                                    <button onClick={function(){tmplMoveItem(tmpl.id,cat.cat,idx,1);}} disabled={idx===cat.items.length-1}
                                      style={{...jost,fontSize:8,lineHeight:1,padding:'1px 3px',background:'transparent',border:'none',cursor:idx===cat.items.length-1?'default':'pointer',color:idx===cat.items.length-1?'var(--border2)':'var(--muted)'}}>▼</button>
                                  </div>
                                  {isRenamingItem
                                    ?<input autoFocus value={tmplMgrItemVal}
                                        onChange={function(e){setTmplMgrItemVal(e.target.value);}}
                                        onKeyDown={function(e){if(e.key==='Enter') tmplRenameItem(tmpl.id,cat.cat,item,tmplMgrItemVal);if(e.key==='Escape') setTmplMgrRenamingItem(null);}}
                                        onBlur={function(){tmplRenameItem(tmpl.id,cat.cat,item,tmplMgrItemVal);}}
                                        style={{flex:1,background:'var(--surface2)',border:'1px solid '+tmpl.color,borderRadius:6,padding:'3px 8px',...jost,fontSize:13,color:'var(--text)',outline:'none'}}/>
                                    :<div onClick={function(){setTmplMgrRenamingItem(itemKey);setTmplMgrItemVal(item);}}
                                        style={{...jost,fontSize:13,color:'var(--text)',flex:1,cursor:'pointer',padding:'2px 0'}}>
                                        {item}
                                      </div>
                                  }
                                  {!isRenamingItem&&(
                                    <button onClick={function(){tmplDeleteItem(tmpl.id,cat.cat,item);}}
                                      style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--muted)',padding:'2px 4px',display:'flex',alignItems:'center',flexShrink:0}}>
                                      <Icon name='close' size={10}/>
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                            {/* Add item row */}
                            {isAddingItem?(
                              <div style={{display:'flex',gap:6,padding:'6px 12px 6px 20px'}}>
                                <input autoFocus value={tmplMgrNewItem}
                                  onChange={function(e){setTmplMgrNewItem(e.target.value);}}
                                  onKeyDown={function(e){if(e.key==='Enter') tmplAddItem(tmpl.id,cat.cat,tmplMgrNewItem);if(e.key==='Escape') setTmplMgrAddingItem(null);}}
                                  style={{flex:1,background:'var(--surface2)',border:'1px solid '+tmpl.color,borderRadius:6,padding:'4px 8px',...jost,fontSize:13,color:'var(--text)',outline:'none'}}
                                  placeholder="Nuovo elemento..."/>
                                <button onClick={function(){tmplAddItem(tmpl.id,cat.cat,tmplMgrNewItem);}}
                                  style={{...jost,fontSize:13,fontWeight:600,padding:'4px 10px',borderRadius:6,border:'none',background:tmpl.color,color:'#000',cursor:'pointer'}}>+</button>
                              </div>
                            ):(
                              <button onClick={function(){setTmplMgrAddingItem(catKey);setTmplMgrNewItem('');}}
                                style={{...jost,fontSize:11,padding:'3px 20px',color:'var(--muted)',background:'transparent',border:'none',cursor:'pointer',letterSpacing:'0.04em'}}>
                                + elemento
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {/* Add category */}
                      {tmplMgrAddingCat===tmpl.id?(
                        <div style={{display:'flex',gap:6,padding:'8px 12px',borderTop:'1px solid var(--border)'}}>
                          <input autoFocus value={tmplMgrNewCat}
                            onChange={function(e){setTmplMgrNewCat(e.target.value);}}
                            onKeyDown={function(e){if(e.key==='Enter') tmplAddCat(tmpl.id,tmplMgrNewCat);if(e.key==='Escape') setTmplMgrAddingCat(null);}}
                            style={{flex:1,background:'var(--surface2)',border:'1px solid '+tmpl.color,borderRadius:6,padding:'5px 8px',...jost,fontSize:13,color:'var(--text)',outline:'none'}}
                            placeholder="Nome categoria..."/>
                          <button onClick={function(){tmplAddCat(tmpl.id,tmplMgrNewCat);}}
                            style={{...jost,fontSize:13,fontWeight:600,padding:'5px 10px',borderRadius:6,border:'none',background:tmpl.color,color:'#000',cursor:'pointer'}}>+</button>
                        </div>
                      ):(
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',borderTop:'1px solid var(--border)'}}>
                          <button onClick={function(){setTmplMgrAddingCat(tmpl.id);setTmplMgrNewCat('');}}
                            style={{...jost,fontSize:12,padding:'4px 10px',borderRadius:8,border:'1px dashed var(--border2)',background:'transparent',color:'var(--muted)',cursor:'pointer'}}>
                            + Categoria
                          </button>
                          <button onClick={function(){if(window.confirm('Ripristinare il template '+tmpl.name+' alle impostazioni originali?')) resetTemplate(tmpl.id);}}
                            style={{...jost,fontSize:11,padding:'4px 10px',borderRadius:8,border:'1px solid var(--border2)',background:'transparent',color:'var(--muted)',cursor:'pointer'}}>
                            ↺ Ripristina
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{height:20}}/>
          </div>
        </div>
      </div>
    );
  }

  if(showGroupManager){
    const accentStyle={fontFamily:"'Jost',sans-serif"};
    return(
      <div className="app" style={{'--acc':meta.color}}>
        <div className="food-lib-overlay" style={{background:'var(--surface)'}}>
          <div className="food-lib-hdr" style={{borderBottom:'1px solid var(--border)'}}>
            <button className="back" onClick={()=>{setShowGroupManager(false);setEditingGroupId(null);}}><Icon name="back_arr" size={16}/></button>
            <div className="food-lib-title">Gestisci gruppi</div>
            <div style={{width:60}}/>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
            {noteGroups.length===0&&(
              <div style={{color:'var(--muted)',textAlign:'center',padding:'40px 0',...accentStyle,fontSize:15,letterSpacing:'0.05em'}}>Nessun gruppo ancora</div>
            )}
            {noteGroups.map(function(g){
              const isEdit=editingGroupId===g.id;
              const cnt=notes.filter(function(n){return n.group===g.id;}).length;
              return(
                <div key={g.id} style={{background:'var(--surface2)',borderRadius:14,border:'1px solid var(--border)',marginBottom:10,overflow:'hidden'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px'}}>
                    <div style={{width:12,height:12,borderRadius:'50%',background:isEdit?editingGroupColor:g.color,flexShrink:0,transition:'background .2s'}}/>
                    {isEdit
                      ?<input
                          autoFocus
                          value={editingGroupName}
                          onChange={function(e){setEditingGroupName(e.target.value);}}
                          onKeyDown={function(e){if(e.key==='Enter') renameNoteGroup(g.id,editingGroupName,editingGroupColor);if(e.key==='Escape') setEditingGroupId(null);}}
                          style={{flex:1,background:'var(--surface)',border:'1px solid '+editingGroupColor,borderRadius:8,padding:'5px 10px',color:'var(--text)',fontFamily:"'Jost',sans-serif",fontSize:15,outline:'none'}}/>
                      :<div style={{flex:1,...accentStyle,fontSize:15,fontWeight:500,color:'var(--text)'}}>{g.name}</div>
                    }
                    <div style={{...accentStyle,fontSize:12,color:'var(--muted)',flexShrink:0}}>{cnt} {cnt===1?'nota':'note'}</div>
                    {!isEdit&&(
                      <>
                        <button onClick={function(){openGroupEdit(g);}}
                          style={{background:'transparent',border:'1px solid var(--border2)',borderRadius:8,padding:'4px 10px',...accentStyle,fontSize:12,color:'var(--muted)',cursor:'pointer'}}>
                          Modifica
                        </button>
                        <button onClick={function(){deleteNoteGroup(g.id);}}
                          style={{background:'transparent',border:'none',padding:'4px 6px',cursor:'pointer',color:'var(--muted)',display:'flex',alignItems:'center'}}>
                          <Icon name='close' size={12}/>
                        </button>
                      </>
                    )}
                  </div>
                  {isEdit&&(
                    <div style={{padding:'0 14px 14px'}}>
                      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
                        {NOTE_GROUP_COLORS.map(function(c){
                          return(
                            <div key={c} onClick={function(){setEditingGroupColor(c);}}
                              style={{width:22,height:22,borderRadius:'50%',background:c,cursor:'pointer',flexShrink:0,
                                border:editingGroupColor===c?'2px solid var(--text)':'2px solid transparent',
                                boxShadow:editingGroupColor===c?'0 0 6px '+c+'88':'none',
                                transition:'border .15s,box-shadow .15s'}}/>
                          );
                        })}
                      </div>
                      <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                        <button onClick={function(){setEditingGroupId(null);}}
                          style={{background:'transparent',border:'1px solid var(--border2)',borderRadius:10,padding:'6px 14px',...accentStyle,fontSize:13,color:'var(--muted)',cursor:'pointer'}}>
                          Annulla
                        </button>
                        <button onClick={function(){renameNoteGroup(g.id,editingGroupName,editingGroupColor);}}
                          style={{background:editingGroupColor,border:'none',borderRadius:10,padding:'6px 14px',...accentStyle,fontSize:13,fontWeight:600,color:'#000',cursor:'pointer'}}>
                          Salva
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{background:'var(--surface2)',borderRadius:14,border:'1px dashed var(--border2)',padding:'14px'}}>
              <div style={{...accentStyle,fontSize:12,color:'var(--muted)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>Nuovo gruppo</div>
              <input
                className="m-inp m-inp-text"
                placeholder="Nome gruppo (es. Lavoro, Idee...)"
                value={newGroupName}
                onChange={function(e){setNewGroupName(e.target.value);}}
                onKeyDown={function(e){if(e.key==='Enter') addNoteGroup();}}
                style={{marginBottom:10}}/>
              <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
                {NOTE_GROUP_COLORS.map(function(c){
                  return(
                    <div key={c} onClick={function(){setNewGroupColor(c);}}
                      style={{width:22,height:22,borderRadius:'50%',background:c,cursor:'pointer',flexShrink:0,
                        border:newGroupColor===c?'2px solid var(--text)':'2px solid transparent',
                        boxShadow:newGroupColor===c?'0 0 6px '+c+'88':'none',
                        transition:'border .15s,box-shadow .15s'}}/>
                  );
                })}
              </div>
              <button onClick={addNoteGroup}
                style={{width:'100%',background:newGroupColor,border:'none',borderRadius:10,padding:'9px',...accentStyle,fontSize:14,fontWeight:600,color:'#000',cursor:'pointer'}}>
                + Crea gruppo
              </button>
            </div>
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
                      </div>
                    ))}
                    <div className="ngb-pill ngb-add" onClick={()=>setShowGroupManager(true)}>⚙ Gruppi</div>
                  </div>
                )}
                {/* Sort bar */}
                <div style={{display:'flex',gap:6,marginBottom:12,marginTop:4,flexWrap:'wrap'}}>
                  {[['date_desc','Recenti'],['date_asc','Vecchie'],['name_asc','A→Z'],['name_desc','Z→A']].map(function(item){
                    const val=item[0],label=item[1];
                    return(
                      <div key={val} className="ngb-pill"
                        style={noteSort===val?{borderColor:meta.color,color:meta.color,background:meta.color+'18'}:{}}
                        onClick={function(){setNoteSort(val);}}>
                        {label}
                      </div>
                    );
                  })}
                </div>
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
                <div style={{display:'flex',gap:10,marginBottom:20}}>
                  <button className="s-btn" style={{flex:1}} onClick={()=>setShowNewTravel(true)}>+ Nuova lista</button>
                  <button className="s-btn" style={{flex:'none',padding:'10px 16px',background:'var(--surface2)',color:'var(--muted)'}} onClick={()=>setShowTravelTemplateManager(true)}>⚙ Template</button>
                </div>
                {travelLists.length===0&&<div style={{color:'var(--faint)',textAlign:'center',padding:'40px 0',fontFamily:"'Jost',sans-serif",fontSize:18,letterSpacing:1}}>Nessuna lista viaggio</div>}
                <div className="list-cards">
                  {travelLists.map(l=>{
                    const tmpl=getEffectiveTemplates().find(t=>t.id===l.type);
                    const done=l.items.filter(i=>i.checked).length;
                    return(
                      <div key={l.id} className="travel-card" onClick={()=>setActiveTravelId(l.id)}>
                        <div className="travel-card-icon"><Icon name={tmpl&&tmpl.icon||'t_plane'} size={28} color={tmpl&&tmpl.color||meta.color}/></div>
                        <div className="travel-card-info">
                          <div className="travel-card-name" style={{color:tmpl&&tmpl.color||meta.color}}>{l.name}</div>
                          <div className="travel-card-meta">{tmpl&&tmpl.name||''} · {fmtDate(l.date)}</div>
                          <div style={{fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:400,color:'var(--muted)',marginTop:4}}>{done}/{l.items.length} voci</div>
                        </div>
                        <div style={{fontFamily:"'Jost',sans-serif",fontSize:26,fontWeight:500,color:tmpl&&tmpl.color||meta.color,flexShrink:0}}>{l.items.length?Math.round(done/l.items.length*100)+'%':'—'}</div>
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
                  {getEffectiveTemplates().map(t=>(
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
