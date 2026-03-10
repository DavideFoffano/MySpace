/* ═══════════════════════════════════════════
   MODULE: WORKOUT (myspace)
═══════════════════════════════════════════ */

function getRpeColor(rpe){
  if(rpe<=3) return '#e8a845';
  if(rpe<=5) return '#d4943a';
  if(rpe<=7) return '#c97a4a';
  return '#c96a6a';
}
function getRpeLabel(rpe){
  if(rpe<=3) return 'Facile';
  if(rpe<=5) return 'Moderato';
  if(rpe<=7) return 'Difficile';
  return 'Massimale';
}

function RestTimer({duration,onDone}){
  const [left,setLeft]=useState(duration);
  const SIZE=44;
  useEffect(()=>{
    if(left<=0){onDone();return;}
    const id=setTimeout(()=>setLeft(l=>l-1),1000);
    return()=>clearTimeout(id);
  },[left]);
  return(
    <div className="rest-wrap">
      <div className="rest-banner">
        <div className="rest-ring">
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <circle className="ring-bg" cx={SIZE/2} cy={SIZE/2} r={(SIZE-6)/2} strokeWidth="4" fill="none"/>
            <circle className="ring-fg" cx={SIZE/2} cy={SIZE/2} r={(SIZE-6)/2} strokeWidth="4" fill="none"
              strokeDasharray={`${2*Math.PI*(SIZE-6)/2}`}
              strokeDashoffset={`${2*Math.PI*(SIZE-6)/2*(1-left/duration)}`}/>
          </svg>
          <div className="rest-ring-num">{left}</div>
        </div>
        <div className="rest-info">
          <div className="rest-label">Recupero in corso</div>
          <div className="rest-next">Prossima serie tra {left}s</div>
        </div>
        <div className="rest-skip" onClick={onDone}>Salta →</div>
      </div>
    </div>
  );
}

function WeightChart({data,color}){
  const ref=useRef(null);
  const chartRef=useRef(null);
  useEffect(()=>{
    if(!ref.current||!data||data.length<2) return;
    if(chartRef.current) chartRef.current.destroy();
    chartRef.current=new Chart(ref.current,{
      type:'line',
      data:{labels:data.map(d=>fmtDateShort(d.date)),datasets:[{data:data.map(d=>d.peso),borderColor:color,backgroundColor:color+'20',borderWidth:2,pointBackgroundColor:color,pointRadius:4,tension:.3,fill:true}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'#1a1a1a',borderColor:'#333',borderWidth:1,titleColor:'#888',bodyColor:'#fff',callbacks:{label:ctx=>`${ctx.parsed.y} kg`}}},
        scales:{x:{grid:{color:'#1a1a1a'},ticks:{color:'var(--muted)',font:{size:10}}},y:{grid:{color:'#1a1a1a'},ticks:{color:'var(--muted)',font:{size:10},callback:v=>`${v}kg`},beginAtZero:false}}}
    });
    return()=>{if(chartRef.current) chartRef.current.destroy();};
  },[data,color]);
  if(!data||data.length<2) return <div className="chart-empty">Completa almeno 2 sessioni per il grafico</div>;
  return <canvas ref={ref}/>;
}

function VolumeChart({history}){
  const ref=useRef(null);
  const chartRef=useRef(null);
  const weekData=useMemo(()=>{
    const weeks={};
    history.forEach(h=>{
      const d=new Date(h.date);const weekStart=new Date(d);weekStart.setDate(d.getDate()-d.getDay()+1);
      const key=weekStart.toISOString().slice(0,10);
      if(!weeks[key]) weeks[key]={label:fmtDateShort(weekStart.toISOString()),sets:0,sessions:0};
      weeks[key].sets+=h.doneSets||0;weeks[key].sessions+=1;
    });
    return Object.values(weeks).slice(-8);
  },[history]);
  useEffect(()=>{
    if(!ref.current||weekData.length<2) return;
    if(chartRef.current) chartRef.current.destroy();
    chartRef.current=new Chart(ref.current,{
      type:'bar',
      data:{labels:weekData.map(d=>d.label),datasets:[{data:weekData.map(d=>d.sets),backgroundColor:'#d4943a22',borderColor:'#d4943a',borderWidth:2,borderRadius:6}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'#1a1a1a',borderColor:'#333',borderWidth:1,callbacks:{label:ctx=>`${ctx.parsed.y} serie`}}},
        scales:{x:{grid:{color:'#1a1a1a'},ticks:{color:'var(--muted)',font:{size:10}}},y:{grid:{color:'#1a1a1a'},ticks:{color:'var(--muted)',font:{size:10}},beginAtZero:true}}}
    });
    return()=>{if(chartRef.current) chartRef.current.destroy();};
  },[weekData]);
  if(weekData.length<2) return <div className="chart-empty">Serve almeno 2 settimane di allenamenti</div>;
  return <canvas ref={ref}/>;
}

function BodyWeightChart({data,color}){
  const ref=useRef(null);const chartRef=useRef(null);
  useEffect(()=>{
    if(!ref.current||!data||data.length<2) return;
    if(chartRef.current) chartRef.current.destroy();
    const sorted=[...data].sort((a,b)=>new Date(a.date)-new Date(b.date));
    chartRef.current=new Chart(ref.current,{
      type:'line',
      data:{labels:sorted.map(d=>fmtDateShort(d.date)),datasets:[{data:sorted.map(d=>d.peso),borderColor:color,backgroundColor:color+'18',borderWidth:2,pointBackgroundColor:color,pointRadius:4,tension:.3,fill:true}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'#1a1a1a',borderColor:'#333',borderWidth:1,callbacks:{label:ctx=>`${ctx.parsed.y} kg`}}},
        scales:{x:{grid:{color:'#1a1a1a'},ticks:{color:'var(--muted)',font:{size:10}}},y:{grid:{color:'#1a1a1a'},ticks:{color:'var(--muted)',font:{size:10},callback:v=>`${v}kg`},beginAtZero:false}}}
    });
    return()=>{if(chartRef.current) chartRef.current.destroy();};
  },[data,color]);
  if(!data||data.length<2) return <div className="chart-empty">Aggiungi almeno 2 misurazioni</div>;
  return <canvas ref={ref}/>;
}

function OneRMChart({data,color}){
  const ref=useRef(null);const chartRef=useRef(null);
  useEffect(()=>{
    if(!ref.current||!data||data.length<2) return;
    if(chartRef.current) chartRef.current.destroy();
    const mapped=data.map(d=>({...d,orm:calc1RM(d.peso,d.reps)}));
    chartRef.current=new Chart(ref.current,{
      type:'line',
      data:{labels:mapped.map(d=>fmtDateShort(d.date)),datasets:[{data:mapped.map(d=>d.orm),borderColor:color,backgroundColor:color+'18',borderWidth:2,pointBackgroundColor:color,pointRadius:4,tension:.3,fill:true}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'#1a1a1a',borderColor:'#333',borderWidth:1,callbacks:{label:ctx=>`${ctx.parsed.y} kg 1RM`}}},
        scales:{x:{grid:{color:'#1a1a1a'},ticks:{color:'var(--muted)',font:{size:10}}},y:{grid:{color:'#1a1a1a'},ticks:{color:'var(--muted)',font:{size:10},callback:v=>`${v}kg`},beginAtZero:false}}}
    });
    return()=>{if(chartRef.current) chartRef.current.destroy();};
  },[data,color]);
  if(!data||data.length<2) return <div className="chart-empty">Completa almeno 2 sessioni</div>;
  return <canvas ref={ref}/>;
}

function TrainingHeatmap({history,color}){
  const data=useMemo(()=>{
    // Mappa date → numero sessioni
    const map={};
    history.forEach(h=>{
      const key=h.date.slice(0,10);
      map[key]=(map[key]||0)+1;
    });
    return map;
  },[history]);

  // Genera 53 settimane a ritroso da oggi
  const today=new Date();today.setHours(0,0,0,0);
  // Trova il lunedì della settimana corrente
  const dayOfWeek=today.getDay()||7; // 1=lun, 7=dom
  const weekStart=new Date(today);weekStart.setDate(today.getDate()-dayOfWeek+1);

  // Costruisce colonne (settimane), 53 settimane indietro
  const weeks=[];
  for(let w=52;w>=0;w--){
    const days=[];
    for(let d=0;d<7;d++){
      const date=new Date(weekStart);
      date.setDate(weekStart.getDate()-w*7+d);
      if(date>today) {days.push(null);continue;}
      const key=date.toISOString().slice(0,10);
      days.push({date:key,count:data[key]||0,future:false});
    }
    weeks.push(days);
  }

  // Etichette mesi
  const monthLabels=[];
  weeks.forEach((week,wi)=>{
    const firstDay=week.find(d=>d);
    if(!firstDay) return;
    const d=new Date(firstDay.date);
    if(wi===0||d.getDate()<=7){
      monthLabels.push({wi,label:d.toLocaleDateString('it-IT',{month:'short'})});
    }
  });

  const getColor=(count)=>{
    if(count===0) return 'var(--surface2)';
    if(count===1) return color+'50';
    if(count===2) return color+'90';
    return color;
  };

  const totalSessions=history.length;
  const activeDays=Object.keys(data).length;
  const thisYear=history.filter(h=>new Date(h.date).getFullYear()===today.getFullYear()).length;

  return(
    <div>
      <div style={{display:'flex',gap:10,marginBottom:16}}>
        <div className="stat"><div className="n">{totalSessions}</div><div className="l">Totale</div></div>
        <div className="stat"><div className="n">{thisYear}</div><div className="l">Quest'anno</div></div>
        <div className="stat"><div className="n">{activeDays}</div><div className="l">Giorni attivi</div></div>
      </div>
      <div className="chart-wrap">
        <div className="chart-title">Frequenza allenamenti</div>
        <div className="chart-sub">Ultime 52 settimane</div>
        <div className="heatmap-wrap">
          <div style={{display:'flex'}}>
            {/* Day labels */}
            <div className="heatmap-day-labels">
              {['L','M','M','G','V','S','D'].map((l,i)=>(
                <div key={i} className="heatmap-day-label">{i%2===0?l:''}</div>
              ))}
            </div>
            <div>
              {/* Month labels */}
              <div className="heatmap-months">
                {weeks.map((week,wi)=>{
                  const ml=monthLabels.find(m=>m.wi===wi);
                  return(
                    <div key={wi} style={{width:11,flexShrink:0}}>
                      {ml&&<div className="heatmap-month-label">{ml.label}</div>}
                    </div>
                  );
                })}
              </div>
              {/* Grid */}
              <div className="heatmap-grid">
                {weeks.map((week,wi)=>(
                  <div key={wi} className="heatmap-col">
                    {week.map((day,di)=>(
                      <div key={di} className="heatmap-cell"
                        style={{background:day?getColor(day.count):'transparent'}}
                        title={day?`${day.date}: ${day.count} session${day.count!==1?'i':'e'}`:''}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="heatmap-legend">
            <span className="heatmap-legend-label">Meno</span>
            {[0,1,2,3].map(n=>(
              <div key={n} className="heatmap-cell" style={{background:getColor(n),flexShrink:0}}/>
            ))}
            <span className="heatmap-legend-label">Di più</span>
          </div>
        </div>
      </div>
    </div>
  );
}


function WorkoutModule({meta}){
  /* ── Gym state ── */
  const [workouts,setWorkouts]=useState(()=>LS.get('workouts')||WORKOUTS_DEFAULT);
  const [history,setHistory]=useState(()=>LS.get('history')||[]);
  const [weightLog,setWeightLog]=useState(()=>LS.get('weightLog')||{});
  const [gymSettings,setGymSettings]=useState(()=>LS.get('settings')||{restTime:60});
  const [gymView,setGymView]=useState('home');
  const [activeW,setActiveW]=useState(null);
  const [session,setSession]=useState(null);
  const [elapsed,setElapsed]=useState(0);
  const [complete,setComplete]=useState(false);
  const [openEx,setOpenEx]=useState(null);
  const [editModal,setEditModal]=useState(null);
  const [restActive,setRestActive]=useState(false);
  const [syncStatus,setSyncStatus]=useState('idle');
  const [supaForm,setSupaForm]=useState(()=>LS.get('ms_supa')||{url:'',key:''});
  const [selectedEx,setSelectedEx]=useState(null);
  const [histTab,setHistTab]=useState('grafici');
  const timerRef=useRef(null);

  // Session post-workout state
  const [sessionNote,setSessionNote]=useState('');
  const [sessionRpe,setSessionRpe]=useState(null);
  
  // New PRs detected this session
  const [newPrs,setNewPrs]=useState([]);

  // Workout editor state
  const [editingWorkout,setEditingWorkout]=useState(null); // null | workout object
  const [showCreateWorkout,setShowCreateWorkout]=useState(false);
  const [newWorkoutForm,setNewWorkoutForm]=useState({name:'',subtitle:'',color:'#d4943a'});
  const [showAddExercise,setShowAddExercise]=useState(false);
  const [addExSearch,setAddExSearch]=useState('');
  const [addExCustom,setAddExCustom]=useState('');

  /* ── Calistenia state ── */
  const [caliProgress,setCaliProgress]=useState(()=>LS.get('ms_cali_progress')||initCaliProgress());
  const [activeCaliSkill,setActiveCaliSkill]=useState(null); // id skill in dettaglio

  /* ── Spotify state ── */
  const [spClientId,setSpClientId]=useState(()=>LS.get('ms_spotify_client_id')||'');
  const [spToken,setSpToken]=useState(()=>LS.get('ms_spotify_token')||null);
  const [spTrack,setSpTrack]=useState(null);
  const [spPlaying,setSpPlaying]=useState(false);
  const [spNoDevice,setSpNoDevice]=useState(false);
  const spPollRef=useRef(null);

  /* ── Chart toggle / Confronto ── */
  const [chartMode,setChartMode]=useState('peso'); // 'peso' | '1rm'
  const [confWorkout,setConfWorkout]=useState(null); // id scheda selezionata per confronto

  /* ── Body Weight state ── */
  const [bodyWeightLog,setBodyWeightLog]=useState(()=>LS.get('ms_bodyweight')||[]);
  const [bwInput,setBwInput]=useState('');
  const [bwNote,setBwNote]=useState('');


  /* ── Gym timer ── */
  useEffect(()=>{
    if(gymView==='session') timerRef.current=setInterval(()=>setElapsed(e=>e+1),1000);
    else clearInterval(timerRef.current);
    return()=>clearInterval(timerRef.current);
  },[gymView]);

  /* ── Gym sync down ── */
  useEffect(()=>{
    // Gestione callback OAuth Spotify
    const params=new URLSearchParams(window.location.search);
    const code=params.get('code');
    if(code){
      const cid=LS.get('ms_spotify_client_id');
      if(cid){(async()=>{
        const tok=await spExchangeCode(code,cid);
        if(tok){LS.set('ms_spotify_token',tok);setSpToken(tok);}
        window.history.replaceState({},'',window.location.pathname);
      })();}
      else window.history.replaceState({},'',window.location.pathname);
    }
    // Gym sync
    (async()=>{
      setSyncStatus('syncing');
      const remote=await syncDown();
      if(remote){
        if(remote.workouts) setWorkouts(remote.workouts);
        if(remote.history) setHistory(remote.history);
        if(remote.weightLog) setWeightLog(remote.weightLog);
        if(remote.settings) setGymSettings(remote.settings);
      }
      setSyncStatus(remote?'ok':'idle');
    })();
  },[]);

  const saveGymAll=useCallback(async(patch)=>{
    const next={workouts,history,weightLog,settings:gymSettings,...patch};
    if(patch.workouts){setWorkouts(patch.workouts);LS.set('workouts',patch.workouts);}
    if(patch.history){setHistory(patch.history);LS.set('history',patch.history);}
    if(patch.weightLog){setWeightLog(patch.weightLog);LS.set('weightLog',patch.weightLog);}
    if(patch.settings){setGymSettings(patch.settings);LS.set('settings',patch.settings);}
    setSyncStatus('syncing');
    await syncUp(next);
    setSyncStatus('ok');
  },[workouts,history,weightLog,gymSettings]);

  /* ── PR computation ── */
  const personalRecords=useMemo(()=>{
    const prs={};
    Object.entries(weightLog).forEach(([exId,entries])=>{
      if(!entries||!entries.length) return;
      const best=entries.reduce((b,e)=>e.peso>b.peso?e:b,entries[0]);
      prs[exId]={peso:best.peso,reps:best.reps,date:best.date,oneRM:calc1RM(best.peso,best.reps)};
    });
    return prs;
  },[weightLog]);

  /* ── Gym functions ── */
  function startWorkout(w){
    const sets={};
    w.exercises.forEach(ex=>{
      // Usa l'ultimo peso registrato nel weightLog se disponibile, altrimenti il default della scheda
      const lastLog=weightLog[ex.id]?.slice(-1)[0];
      const startPeso=lastLog?.peso??ex.peso??'';
      const startReps=lastLog?.reps??ex.reps;
      sets[ex.id]=Array.from({length:ex.serie},()=>({reps:startReps,peso:startPeso,done:false}));
    });
    setActiveW(w);setSession({sets});setElapsed(0);setComplete(false);
    setOpenEx(w.exercises[0]?.id||null);setRestActive(false);
    setSessionNote('');setSessionRpe(null);setNewPrs([]);
    setGymView('session');
  }
  function toggleSet(exId,si){
    setSession(prev=>{
      const sets={...prev.sets};
      const wasDone=sets[exId][si].done;
      sets[exId]=sets[exId].map((s,i)=>i===si?{...s,done:!s.done}:s);
      if(!wasDone) setRestActive(true);
      return{...prev,sets};
    });
  }
  function updSet(exId,si,field,val){
    setSession(prev=>{
      const sets={...prev.sets};
      sets[exId]=sets[exId].map((s,i)=>i===si?{...s,[field]:val}:s);
      return{...prev,sets};
    });
  }
  const totalSets=session?Object.values(session.sets).flat().length:0;
  const doneSets=session?Object.values(session.sets).flat().filter(s=>s.done).length:0;
  const pct=totalSets?Math.round((doneSets/totalSets)*100):0;

  async function finishGym(){
    const newWL={...weightLog};
    const detectedPrs=[];
    activeW.exercises.forEach(ex=>{
      const exSets=session.sets[ex.id]||[];
      const doneWithPeso=exSets.filter(s=>s.done&&s.peso!=='');
      if(doneWithPeso.length){
        const maxPeso=Math.max(...doneWithPeso.map(s=>Number(s.peso)));
        if(!newWL[ex.id]) newWL[ex.id]=[];
        const prevBest=personalRecords[ex.id]?.peso||0;
        if(maxPeso>prevBest) detectedPrs.push({name:ex.name,peso:maxPeso,prev:prevBest});
        newWL[ex.id]=[...newWL[ex.id],{date:new Date().toISOString(),peso:maxPeso,reps:doneWithPeso[0].reps}];
      }
    });
    setNewPrs(detectedPrs);
    const entry={
      id:Date.now(),workoutId:activeW.id,workoutName:activeW.name,workoutColor:activeW.color,
      date:new Date().toISOString(),elapsed,totalSets,doneSets,
      note:sessionNote,rpe:sessionRpe
    };
    const newHistory=[entry,...history];
    await saveGymAll({history:newHistory,weightLog:newWL});
    setComplete(true);clearInterval(timerRef.current);
  }
  function closeComplete(){setComplete(false);setGymView('home');setActiveW(null);setSession(null);}
  
  function openEdit(w,i){
    const ex=w.exercises[i];
    setEditModal({wid:w.id,i,name:ex.name,serie:ex.serie,reps:ex.reps,peso:ex.peso??'',notes:ex.notes||''});
  }
  async function saveEdit(){
    const newSerie=Number(editModal.serie);
    const newReps=Number(editModal.reps);
    const newPeso=editModal.peso!==''?Number(editModal.peso):null;
    const updated=workouts.map(w=>{
      if(w.id!==editModal.wid) return w;
      return{...w,exercises:w.exercises.map((e,i)=>i!==editModal.i?e:{...e,name:editModal.name,serie:newSerie,reps:newReps,peso:newPeso,notes:editModal.notes||''})};
    });
    if(activeW?.id===editModal.wid) setActiveW(updated.find(w=>w.id===editModal.wid));
    // Sync session.sets: ridimensiona le serie e aggiorna reps/peso sulle serie non fatte
    if(session){
      const exId=activeW?.exercises[editModal.i]?.id;
      if(exId){
        setSession(prev=>{
          const oldSets=prev.sets[exId]||[];
          // Resize: se serie aumentano aggiungi con nuovi default, se diminuiscono taglia
          let newSets;
          if(newSerie>oldSets.length){
            newSets=[...oldSets,...Array.from({length:newSerie-oldSets.length},()=>({reps:newReps,peso:newPeso??'',done:false}))];
          } else {
            newSets=oldSets.slice(0,newSerie);
          }
          // Aggiorna reps/peso solo sulle serie non ancora completate
          newSets=newSets.map(s=>s.done?s:{...s,reps:newReps,peso:newPeso??''});
          return{...prev,sets:{...prev.sets,[exId]:newSets}};
        });
      }
    }
    await saveGymAll({workouts:updated});
    setEditModal(null);
  }

  /* ── Workout CRUD ── */
  async function createWorkout(){
    if(!newWorkoutForm.name.trim()) return;
    const w={id:'w'+uuid(),name:newWorkoutForm.name.toUpperCase(),subtitle:newWorkoutForm.subtitle||'',color:newWorkoutForm.color,exercises:[]};
    const updated=[...workouts,w];
    await saveGymAll({workouts:updated});
    setShowCreateWorkout(false);
    setNewWorkoutForm({name:'',subtitle:'',color:'#d4943a'});
    setEditingWorkout(w);
  }
  async function duplicateWorkout(w){
    const dup={...w,id:'w'+uuid(),name:w.name+' (copia)',exercises:w.exercises.map(e=>({...e,id:'e'+uuid()}))};
    await saveGymAll({workouts:[...workouts,dup]});
  }
  async function deleteWorkout(wid){
    const updated=workouts.filter(w=>w.id!==wid);
    await saveGymAll({workouts:updated});
    setEditingWorkout(null);
  }
  async function saveWorkoutMeta(wid,patch){
    const updated=workouts.map(w=>w.id===wid?{...w,...patch}:w);
    await saveGymAll({workouts:updated});
    setEditingWorkout(prev=>({...prev,...patch}));
  }

  /* ── Exercise CRUD in workout editor ── */
  async function addExerciseToWorkout(name){
    if(!editingWorkout||!name.trim()) return;
    const ex={id:'e'+uuid(),name:name.trim().toUpperCase(),serie:4,reps:10,peso:null};
    const updated=workouts.map(w=>w.id===editingWorkout.id?{...w,exercises:[...w.exercises,ex]}:w);
    const newW=updated.find(w=>w.id===editingWorkout.id);
    await saveGymAll({workouts:updated});
    setEditingWorkout(newW);
    setAddExCustom('');
    setShowAddExercise(false);
  }
  async function removeExerciseFromWorkout(exId){
    const updated=workouts.map(w=>w.id===editingWorkout.id?{...w,exercises:w.exercises.filter(e=>e.id!==exId)}:w);
    const newW=updated.find(w=>w.id===editingWorkout.id);
    await saveGymAll({workouts:updated});
    setEditingWorkout(newW);
  }
  async function moveExercise(exId,dir){
    const w=workouts.find(w=>w.id===editingWorkout.id);
    const idx=w.exercises.findIndex(e=>e.id===exId);
    if(idx<0) return;
    const newIdx=idx+dir;
    if(newIdx<0||newIdx>=w.exercises.length) return;
    const exArr=[...w.exercises];
    [exArr[idx],exArr[newIdx]]=[exArr[newIdx],exArr[idx]];
    const updated=workouts.map(wk=>wk.id===editingWorkout.id?{...wk,exercises:exArr}:wk);
    await saveGymAll({workouts:updated});
    setEditingWorkout({...editingWorkout,exercises:exArr});
  }

  async function saveSupaSettings(){
    supaClient=null;LS.set('ms_supa',supaForm);setSyncStatus('syncing');
    const remote=await syncDown();setSyncStatus(remote?'ok':'err');
  }

  /* ── Spotify Connect functions ── */
  async function spGetToken(){
    let tok=spToken;if(!tok?.access_token) return null;
    if(Date.now()>=(tok.expires_at||0)-60000){
      const refreshed=await spRefreshToken(tok,LS.get('ms_spotify_client_id'));
      if(!refreshed){spDisconnect();return null;}
      LS.set('ms_spotify_token',refreshed);setSpToken(refreshed);tok=refreshed;
    }
    return tok;
  }
  async function spPoll(){
    const tok=await spGetToken();if(!tok) return;
    const state=await spApi('/me/player','GET',null,tok.access_token);
    if(!state||state.error){setSpNoDevice(true);return;}
    setSpNoDevice(false);setSpTrack(state.item||null);setSpPlaying(state.is_playing||false);
  }
  useEffect(()=>{
    if(spToken?.access_token&&gymView==='session'){
      spPoll();spPollRef.current=setInterval(spPoll,5000);
    } else clearInterval(spPollRef.current);
    return()=>clearInterval(spPollRef.current);
  },[spToken,gymView]);
  async function spToggle(){
    const tok=await spGetToken();if(!tok) return;
    await spApi(spPlaying?'/me/player/pause':'/me/player/play','PUT',null,tok.access_token);
    setSpPlaying(p=>!p);setTimeout(spPoll,600);
  }
  async function spNext(){const tok=await spGetToken();if(!tok) return;await spApi('/me/player/next','POST',null,tok.access_token);setTimeout(spPoll,700);}
  async function spPrev(){const tok=await spGetToken();if(!tok) return;await spApi('/me/player/previous','POST',null,tok.access_token);setTimeout(spPoll,700);}
  async function spSaveClientId(){LS.set('ms_spotify_client_id',spClientId);await spLogin(spClientId);}
  function spDisconnect(){clearInterval(spPollRef.current);LS.set('ms_spotify_token',null);setSpToken(null);setSpTrack(null);setSpPlaying(false);setSpNoDevice(false);}

  /* ── Body Weight functions ── */
  function addBodyWeight(){
    const peso=parseFloat(bwInput);if(!peso||peso<20||peso>400) return;
    const entry={id:uuid(),date:new Date().toISOString(),peso,note:bwNote.trim()};
    const next=[entry,...bodyWeightLog];setBodyWeightLog(next);LS.set('ms_bodyweight',next);
    setBwInput('');setBwNote('');
  }
  function deleteBodyWeight(id){const next=bodyWeightLog.filter(e=>e.id!==id);setBodyWeightLog(next);LS.set('ms_bodyweight',next);}
  const bwSorted=useMemo(()=>[...bodyWeightLog].sort((a,b)=>new Date(b.date)-new Date(a.date)),[bodyWeightLog]);
  const bwLatest=bwSorted[0];
  const bwDelta=bwSorted.length>1?+(bwLatest.peso-bwSorted[bwSorted.length-1].peso).toFixed(1):null;

  /* ── Streak settimanale ── */
  const weeklyStreak=useMemo(()=>{
    if(!history.length) return 0;
    // Costruisce set di settimane con almeno 1 sessione (key: YYYY-WW)
    const getWeekKey=date=>{
      const d=new Date(date);
      const day=d.getDay()||7;
      d.setDate(d.getDate()+4-day);
      const jan1=new Date(d.getFullYear(),0,1);
      return d.getFullYear()+'-'+Math.ceil(((d-jan1)/86400000+1)/7);
    };
    const weeksWithSession=new Set(history.map(h=>getWeekKey(h.date)));
    // Conta settimane consecutive a ritroso dalla settimana corrente
    let streak=0;
    const now=new Date();
    for(let i=0;i<52;i++){
      const d=new Date(now);d.setDate(d.getDate()-i*7);
      if(weeksWithSession.has(getWeekKey(d.toISOString()))) streak++;
      else if(i>0) break; // tolleranza: la settimana corrente può ancora essere incompleta
    }
    return streak;
  },[history]);

  /* ── Ordine schede ── */
  async function moveWorkout(id,dir){
    const idx=workouts.findIndex(w=>w.id===id);
    const newIdx=idx+dir;
    if(newIdx<0||newIdx>=workouts.length) return;
    const arr=[...workouts];[arr[idx],arr[newIdx]]=[arr[newIdx],arr[idx]];
    await saveGymAll({workouts:arr});
  }

  /* ── Calistenia functions ── */
  function caliAdvance(stepId){
    const cur=caliProgress[stepId];
    let next;
    if(cur==='available')      next='in_progress';
    else if(cur==='in_progress') next='achieved';
    else return;
    const updated={...caliProgress,[stepId]:next};
    // Unlock step che hanno questo come prerequisito
    if(next==='achieved'){
      CALI_SKILLS.forEach(sk=>{
        sk.steps.forEach(st=>{
          if(updated[st.id]==='locked'&&st.prereqs.every(pid=>updated[pid]==='achieved')){
            updated[st.id]='available';
          }
        });
      });
    }
    setCaliProgress(updated);
    LS.set('ms_cali_progress',updated);
  }

  function caliReset(stepId){
    // Torna a available, ri-blocca gli step che dipendevano da questo
    const updated={...caliProgress,[stepId]:'available'};
    // Ricalcola lock a cascata
    CALI_SKILLS.forEach(sk=>{
      sk.steps.forEach(st=>{
        if(st.prereqs.includes(stepId)&&updated[st.id]!=='achieved'){
          updated[st.id]=st.prereqs.every(pid=>updated[pid]==='achieved')?'available':'locked';
        }
      });
    });
    setCaliProgress(updated);
    LS.set('ms_cali_progress',updated);
  }

  function caliSkillProgress(skill){
    const total=skill.steps.length;
    const achieved=skill.steps.filter(st=>caliProgress[st.id]==='achieved').length;
    const inProg=skill.steps.filter(st=>caliProgress[st.id]==='in_progress').length;
    return{total,achieved,inProg,pct:Math.round((achieved/total)*100)};
  }

  const allExercises=useMemo(()=>{
    const seen=new Set();const list=[];
    workouts.forEach(w=>w.exercises.forEach(e=>{if(!seen.has(e.id)&&weightLog[e.id]?.length){seen.add(e.id);list.push(e);}}));
    return list;
  },[workouts,weightLog]);


  const syncColor=syncStatus==='ok'?'#d4943a':syncStatus==='syncing'?'#dba042':syncStatus==='err'?'#ff4444':'#333';
  const isInSession=gymView==='session';
  

  /* ── Add exercise search filter ── */
  const filteredExGroups=useMemo(()=>{
    if(!addExSearch.trim()) return COMMON_EXERCISES;
    const q=addExSearch.toLowerCase();
    return COMMON_EXERCISES.map(g=>({...g,items:g.items.filter(i=>i.toLowerCase().includes(q))})).filter(g=>g.items.length>0);
  },[addExSearch]);

  
  
  
  



  if(editingWorkout){
    const wObj=workouts.find(w=>w.id===editingWorkout.id)||editingWorkout;
    return(
      <div className="app">
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div className="sess-hdr">
            <button className="back" onClick={()=>setEditingWorkout(null)}><Icon name="back_arr" size={16}/></button>
            <div className="sess-title" style={{color:wObj.color}}>{wObj.name}</div>
            <button className="we-btn" onClick={()=>duplicateWorkout(wObj)}>Duplica</button>
          </div>
          <div className="screen">
            <div className="pad anim">
              {/* Edit name/color */}
              <div className="settings-section">
                <div className="settings-title">Dettagli scheda</div>
                <div className="s-row">
                  <div className="s-lbl">Nome</div>
                  <input className="s-inp" value={wObj.name}
                    onChange={e=>saveWorkoutMeta(wObj.id,{name:e.target.value.toUpperCase()})}
                    placeholder="NOME SCHEDA"/>
                </div>
                <div className="s-row">
                  <div className="s-lbl">Sottotitolo</div>
                  <input className="s-inp" value={wObj.subtitle}
                    onChange={e=>saveWorkoutMeta(wObj.id,{subtitle:e.target.value})}
                    placeholder="Muscoli · Tipo"/>
                </div>
                <div className="s-lbl" style={{marginBottom:8}}>Colore</div>
                <div className="color-picker">
                  {WORKOUT_COLORS.map(c=>(
                    <div key={c} className={`color-dot${wObj.color===c?' sel':''}`}
                      style={{background:c}}
                      onClick={()=>saveWorkoutMeta(wObj.id,{color:c})}/>
                  ))}
                </div>
              </div>

              {/* Exercises */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                <div className="sec" style={{margin:0}}>{wObj.exercises.length} esercizi</div>
                <button className="we-btn" style={{background:'var(--acc-bg)',borderColor:'var(--acc)',color:'var(--acc)'}}
                  onClick={()=>{setAddExSearch('');setShowAddExercise(true);}}>+ Aggiungi</button>
              </div>
              {wObj.exercises.length===0&&(
                <div style={{textAlign:'center',padding:'30px 0',color:'var(--faint)',fontFamily:"'Jost',sans-serif",fontSize:16}}>
                  Nessun esercizio.<br/>Tocca + Aggiungi per iniziare.
                </div>
              )}
              {wObj.exercises.map((ex,i)=>(
                <div className="exed-item" key={ex.id}>
                  <div style={{display:'flex',flexDirection:'column',gap:2,marginRight:2}}>
                    <button style={{background:'none',border:'none',color:i===0?'#2a2a2a':'#666',fontSize:14,cursor:i===0?'default':'pointer',padding:'2px',lineHeight:1}} onClick={()=>moveExercise(ex.id,-1)} style={{transform:'rotate(90deg)'}}>↑</button>
                    <button style={{background:'none',border:'none',color:i===wObj.exercises.length-1?'#2a2a2a':'#666',fontSize:14,cursor:i===wObj.exercises.length-1?'default':'pointer',padding:'2px',lineHeight:1}} onClick={()=>moveExercise(ex.id,1)} style={{transform:'rotate(90deg)'}}>↓</button>
                  </div>
                  <div style={{width:22,height:22,borderRadius:6,background:'#222',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:11,fontWeight:400,color:'var(--muted)',flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1}}>
                    <div className="exed-name">{ex.name}</div>
                    <div className="exed-meta">{ex.serie}×{ex.reps}{ex.peso?' · '+ex.peso+'kg':''}</div>
                  </div>
                  <button className="exed-del" onClick={()=>removeExerciseFromWorkout(ex.id)}>✕</button>
                </div>
              ))}

              {/* Danger zone */}
              <div style={{marginTop:24,paddingTop:16,borderTop:'1px solid #1e1e1e'}}>
                <button onClick={()=>{if(window.confirm('Eliminare questa scheda?')) deleteWorkout(wObj.id);}}
                  style={{width:'100%',padding:'12px',borderRadius:10,background:'#1a0808',border:'1px solid #3a1010',color:'#c96a6a',fontFamily:"'Jost',sans-serif",fontSize:14,fontWeight:400,letterSpacing:'0.06em',textTransform:'uppercase',cursor:'pointer'}}>
                  🗑 Elimina scheda
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ADD EXERCISE MODAL */}
        {showAddExercise&&(
          <div className="modal-bg" onClick={()=>setShowAddExercise(false)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="m-title">Aggiungi esercizio</div>
              {/* Custom name */}
              <div className="ae-custom-row">
                <input className="ae-custom-inp" placeholder="Nome personalizzato..." value={addExCustom}
                  onChange={e=>setAddExCustom(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&addExerciseToWorkout(addExCustom)}/>
                <button className="ae-custom-btn" onClick={()=>addExerciseToWorkout(addExCustom)}>Aggiungi</button>
              </div>
              {/* Search */}
              <input className="ae-search" placeholder="🔍 Cerca esercizio..." value={addExSearch}
                onChange={e=>setAddExSearch(e.target.value)}/>
              {/* List */}
              <div style={{maxHeight:320,overflowY:'auto'}}>
                {filteredExGroups.map(g=>(
                  <div key={g.group}>
                    <div className="ae-group-title">{g.group}</div>
                    <div className="ae-items">
                      {g.items.map(item=>(
                        <button key={item} className="ae-item" onClick={()=>addExerciseToWorkout(item)}>{item}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if(gymView==='session'&&activeW&&session){
    return(
      <div className="app">
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>
          <div className="sess-hdr">
            <button className="back" onClick={()=>setGymView('home')}><Icon name="back_arr" size={16}/></button>
            <div className="sess-title" style={{color:activeW.color}}>{activeW.name}</div>
            <div className="timer-val">{fmtTime(elapsed)}</div>
          </div>
          <div className="screen">
            <div className="prog-wrap">
              <div className="prog-top"><div className="prog-pct" style={{color:activeW.color}}>{pct}%</div><div className="prog-sub">{doneSets}/{totalSets} serie</div></div>
              <div className="prog-bar"><div className="prog-fill" style={{width:pct+'%',background:activeW.color}}/></div>
            </div>
            {restActive&&<RestTimer duration={gymSettings.restTime||60} onDone={()=>setRestActive(false)}/>}
            <div className="ex-list">
              {activeW.exercises.map((ex,i)=>{
                const exSets=session.sets[ex.id]||[];
                const done=exSets.every(s=>s.done);
                const isOpen=openEx===ex.id;
                const lastPeso=weightLog[ex.id]?.slice(-1)[0]?.peso;
                const isPR=personalRecords[ex.id];
                return(
                  <div className={`ex${done?' done':''}`} key={ex.id}>
                    <div className="ex-hdr" onClick={()=>setOpenEx(isOpen?null:ex.id)}>
                      <div className="ex-num">{i+1}</div>
                      <div className="ex-name-txt">{ex.name}</div>
                      <div className="ex-right">
                        {lastPeso&&<div className="ex-info">{lastPeso}kg</div>}
                        {isPR&&<div className="ex-pr-badge">PR:{isPR.peso}kg</div>}
                        <div className="ex-edit" onClick={e=>{e.stopPropagation();openEdit(activeW,i);}}><Icon name="nav_sett" size={13} color="var(--muted)"/></div>
                        <div className={`chev${isOpen?' open':''}`}>▼</div>
                      </div>
                    </div>
                    {isOpen&&<div className="sets-wrap">
                      {exSets.map((s,si)=>(
                        <div className="set-row" key={si}>
                          <div className="set-lbl">S{si+1}</div>
                          <div className="inp-grp"><div className="inp-lbl">Reps</div>
                            <input className="inp" type="number" inputMode="numeric" value={s.reps} onChange={e=>updSet(ex.id,si,'reps',e.target.value)}/>
                          </div>
                          <div className="inp-grp"><div className="inp-lbl">Kg</div>
                            <input className="inp" type="number" inputMode="decimal" value={s.peso} placeholder="—" onChange={e=>updSet(ex.id,si,'peso',e.target.value)}/>
                          </div>
                          <button className={`chk${s.done?' on':''}`} onClick={()=>toggleSet(ex.id,si)}>{s.done?'✓':''}</button>
                        </div>
                      ))}
                      {ex.notes&&<div className="ex-note">💡 {ex.notes}</div>}
                    </div>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="finish-bar">
            {spToken?.access_token&&(
              <div className="sp-bar">
                {spNoDevice?(
                  <>
                    <div className="sp-art-ph">♪</div>
                    <div className="sp-info">
                      <div className="sp-track" style={{color:'var(--muted)'}}>Nessun dispositivo attivo</div>
                      <div className="sp-no-device">Apri Spotify e avvia un brano</div>
                    </div>
                  </>
                ):(
                  <>
                    {spTrack?.album?.images?.[2]?.url
                      ?<img className="sp-art" src={spTrack.album.images[2].url} alt=""/>
                      :<div className="sp-art-ph">♪</div>}
                    <div className="sp-info">
                      <div className="sp-track">{spTrack?.name||'—'}</div>
                      <div className="sp-artist">{spTrack?.artists?.map(a=>a.name).join(', ')||'—'}</div>
                    </div>
                    <div className="sp-controls">
                      <button className="sp-btn" onClick={spPrev}>⏮</button>
                      <button className="sp-btn play" onClick={spToggle}>{spPlaying?'⏸':'▶'}</button>
                      <button className="sp-btn" onClick={spNext}>⏭</button>
                    </div>
                  </>
                )}
              </div>
            )}
            <button className={`finish-btn${pct===100?' on':' off'}`} onClick={pct===100?finishGym:undefined}>
              {pct===100?'✓ Completa Allenamento':`Completa tutte le serie (${pct}%)`}
            </button>
          </div>

          {/* COMPLETE OVERLAY */}
          {complete&&(
            <div className="overlay">
              <div className="ov-emoji"><Icon name={newPrs.length>0?'trophy':'star'} size={48} color={meta.color} sw={1}/></div>
              <div className="ov-title">{newPrs.length>0?'Nuovo Record!':'Allenamento\nCompletato!'}</div>
              <div className="ov-sub">{activeW.name} · {activeW.subtitle}</div>

              {/* NEW PRs */}
              {newPrs.length>0&&(
                <div style={{width:'100%',marginBottom:14}}>
                  {newPrs.map((pr,i)=>(
                    <div key={i} className="pr-banner pr-pop" style={{animationDelay:`${i*0.1}s`}}>
                      <div className="pr-trophy"><Icon name='trophy' size={24} color={meta.color}/></div>
                      <div className="pr-info">
                        <div className="pr-title">{pr.name}</div>
                        <div className="pr-sub">{pr.prev>0?`Precedente: ${pr.prev}kg`:'Primo record!'}</div>
                      </div>
                      <div className="pr-val">{pr.peso}kg</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="ov-stats">
                <div className="ov-stat"><div className="n">{fmtTime(elapsed)}</div><div className="l">Durata</div></div>
                <div className="ov-stat"><div className="n">{doneSets}</div><div className="l">Serie</div></div>
                <div className="ov-stat"><div className="n">{activeW.exercises.length}</div><div className="l">Esercizi</div></div>
              </div>

              {/* RPE */}
              <div className="rpe-wrap">
                <div className="rpe-label">Come ti sei sentito? (RPE)</div>
                <div className="rpe-btns">
                  {[1,2,3,4,5,6,7,8,9,10].map(r=>(
                    <button key={r} className={`rpe-btn${sessionRpe===r?' sel':''}`}
                      style={sessionRpe===r?{'--rpe-col':getRpeColor(r)}:{}}
                      onClick={()=>setSessionRpe(r)}>{r}</button>
                  ))}
                </div>
                {sessionRpe&&<div style={{textAlign:'center',marginTop:6,fontSize:11,color:getRpeColor(sessionRpe),fontFamily:"'Jost',sans-serif",fontWeight:400,letterSpacing:'0.06em',textTransform:'uppercase'}}>
                  {getRpeLabel(sessionRpe)}
                </div>}
              </div>

              {/* Note */}
              <div className="sess-note-wrap">
                <textarea className="sess-note-inp" rows={2} placeholder="Note sulla sessione (opzionale)..."
                  value={sessionNote} onChange={e=>setSessionNote(e.target.value)}/>
              </div>

              <button className="ov-btn" onClick={closeComplete}>Salva e chiudi</button>
            </div>
          )}

          {/* EDIT EXERCISE MODAL */}
          {editModal&&(
            <div className="modal-bg" onClick={()=>setEditModal(null)}>
              <div className="modal" onClick={e=>e.stopPropagation()}>
                <div className="m-title">Modifica esercizio</div>
                <div className="m-row"><div className="m-lbl">Nome</div><input className="m-inp m-inp-text" value={editModal.name} onChange={e=>setEditModal(m=>({...m,name:e.target.value}))}/></div>
                <div className="m-row"><div className="m-lbl">Serie</div><input className="m-inp" type="number" inputMode="numeric" value={editModal.serie} onChange={e=>setEditModal(m=>({...m,serie:e.target.value}))}/></div>
                <div className="m-row"><div className="m-lbl">Reps</div><input className="m-inp" type="number" inputMode="numeric" value={editModal.reps} onChange={e=>setEditModal(m=>({...m,reps:e.target.value}))}/></div>
                <div className="m-row"><div className="m-lbl">Peso (kg)</div><input className="m-inp" type="number" inputMode="decimal" value={editModal.peso} placeholder="—" onChange={e=>setEditModal(m=>({...m,peso:e.target.value}))}/></div>
                <div className="m-row" style={{flexDirection:'column',alignItems:'stretch',gap:4}}>
                  <div className="m-lbl">Nota</div>
                  <textarea className="m-inp" style={{resize:'none',minHeight:52,fontFamily:'var(--font)',fontSize:13,fontWeight:300,padding:'8px 10px'}}
                    placeholder="Es. mantieni schiena dritta, grip neutro..."
                    value={editModal.notes} onChange={e=>setEditModal(m=>({...m,notes:e.target.value}))}/>
                </div>
                <div className="m-acts">
                  <button className="m-cancel" onClick={()=>setEditModal(null)}>Annulla</button>
                  <button className="m-save" onClick={saveEdit}>Salva</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }


  /* ── MAIN WORKOUT VIEW ── */
  return(
    <>
          <div className="screen">
            <div className="hdr">
              <div className="logo">MY<span>WORKOUT</span></div>
              <div className="hdr-right">
                <div className="sync-dot" style={{background:syncColor}}/>
                <div className="hdr-date">{today}</div>
              </div>
            </div>
            {/* Sub-nav */}
            <div className="sub-nav">
              {[['home','nav_home','Home'],['workouts','nav_cards','Schede'],['cali','nav_cali','Skills'],['history','nav_hist','Storico'],['charts','nav_chart','Progressi'],['settings','nav_sett','']].map(([v,ico,label])=>(
                <button key={v} className={`sn-btn${gymView===v?' act':''}`} onClick={()=>setGymView(v)} style={{display:'flex',alignItems:'center',gap:5}}><Icon name={ico} size={14}/>{label&&<span>{label}</span>}</button>
              ))}
            </div>

            {/* ── HOME ── */}
            {gymView==='home'&&<div className="pad anim">
              {weeklyStreak>=2&&(
                <div style={{marginBottom:8}}>
                  <span className="streak-badge">🔥 {weeklyStreak} settimane di fila</span>
                </div>
              )}
              <div className="greeting">Pronto ad<br/><span>allenarti?</span></div>
              <div className="subhead">Scegli il tuo allenamento di oggi</div>
              <div className="stats">
                <div className="stat"><div className="n">{history.length}</div><div className="l">Sessioni</div></div>
                <div className="stat"><div className="n">{history.filter(h=>(new Date()-new Date(h.date))/86400000<7).length}</div><div className="l">Questa sett.</div></div>
                <div className="stat"><div className="n">{Object.keys(personalRecords).length}</div><div className="l">Record</div></div>
              </div>
              <div className="sec">Le tue schede</div>
              <div className="cards">
                {workouts.map(w=>{
                  const last=history.find(h=>h.workoutId===w.id);
                  const lp=last?Math.round((last.doneSets/last.totalSets)*100):0;
                  return(
                    <div className="card" key={w.id} onClick={()=>startWorkout(w)}>
                      <div className="card-bar" style={{background:w.color}}/>
                      <div className="card-top">
                        <div><div className="card-name" style={{color:w.color}}>{w.name}</div><div className="card-sub">{w.subtitle}</div></div>
                        <div className="card-badge" style={{color:w.color,borderColor:w.color+'40',background:w.color+'12'}}>{w.exercises.length} esercizi</div>
                      </div>
                      {last&&<>
                        <div className="card-prog"><div className="card-prog-fill" style={{width:lp+'%',background:w.color}}/></div>
                        <div className="card-foot"><span>{lp}% ultima volta</span><span>{fmtDate(last.date)}</span></div>
                      </>}
                    </div>
                  );
                })}
              </div>
            </div>}

            {/* ── WORKOUTS MANAGER ── */}
            {gymView==='workouts'&&<div className="pad anim">
              <div className="greeting">Le tue<br/><span>schede.</span></div>
              <div className="subhead">Gestisci, crea e modifica i tuoi allenamenti</div>
              <button onClick={()=>setShowCreateWorkout(true)}
                style={{width:'100%',padding:'13px',borderRadius:12,background:'var(--acc-bg)',border:'1px solid var(--acc)',color:'var(--acc)',fontFamily:"'Jost',sans-serif",fontSize:15,fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',cursor:'pointer',marginBottom:20}}>
                + Crea nuova scheda
              </button>
              {workouts.map((w,wi)=>(
                <div className="we-card" key={w.id}>
                  <div className="we-reorder">
                    <button className={`we-reorder-btn${wi===0?' dis':''}`} onClick={()=>moveWorkout(w.id,-1)}>▲</button>
                    <button className={`we-reorder-btn${wi===workouts.length-1?' dis':''}`} onClick={()=>moveWorkout(w.id,1)}>▼</button>
                  </div>
                  <div className="we-hdr" style={{flex:1}}>
                    <div className="we-color-bar" style={{background:w.color}}/>
                    <div style={{flex:1}}>
                      <div className="we-name" style={{color:w.color}}>{w.name}</div>
                      <div className="we-sub">{w.subtitle} · {w.exercises.length} esercizi</div>
                    </div>
                    <div className="we-actions">
                      <button className="we-btn" onClick={()=>setEditingWorkout(w)}>✏️ Modifica</button>
                      <button className="we-btn" onClick={()=>duplicateWorkout(w)}>📋</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>}

            {/* ── HISTORY ── */}
            {gymView==='history'&&<div className="pad anim">
              <div className="greeting">Il tuo<br/><span>storico</span></div>
              <div className="subhead" style={{marginBottom:20}}>{history.length} sessioni completate</div>
              {history.length===0&&<div style={{color:'var(--faint)',textAlign:'center',padding:'48px 0',fontFamily:"'Jost',sans-serif",fontSize:18}}>Nessuna sessione ancora.<br/>Inizia ad allenarti! 💪</div>}
              {history.map(h=>(
                <div className="hist-item" key={h.id}>
                  <div className="hist-top">
                    <div className="hdot" style={{background:h.workoutColor}}/>
                    <div style={{flex:1}}>
                      <div className="hname" style={{color:h.workoutColor}}>{h.workoutName}</div>
                      <div className="hdate">{fmtDate(h.date)} · {fmtTime(h.elapsed)}</div>
                    </div>
                    <div className="hsets">
                      <div className="n">{h.doneSets}</div>
                      <div className="l">serie</div>
                    </div>
                  </div>
                  {/* RPE badge */}
                  {h.rpe&&(
                    <div style={{marginTop:8,display:'flex',alignItems:'center',gap:6}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:getRpeColor(h.rpe),flexShrink:0}}/>
                      <span style={{fontFamily:"'Jost',sans-serif",fontSize:12,fontWeight:400,color:getRpeColor(h.rpe),letterSpacing:'0.06em',textTransform:'uppercase'}}>
                        RPE {h.rpe} — {getRpeLabel(h.rpe)}
                      </span>
                    </div>
                  )}
                  {/* Session note */}
                  {h.note&&<div className="hist-note">💬 {h.note}</div>}
                </div>
              ))}
            </div>}

            {/* ── CHARTS / PROGRESSI ── */}
            {gymView==='charts'&&<div className="pad anim">
              <div className="greeting">I tuoi<br/><span>progressi</span></div>
              <div className="subhead" style={{marginBottom:20}}>Evoluzione dei tuoi pesi</div>
              <div className="tabs">
                {[['grafici','Grafici'],['volume','Volume'],['record','Record'],['confronto','Confronto'],['storico','Pesi'],['corpo','Corpo']].map(([v,l])=>(
                  <div key={v} className={`tab${histTab===v?' sel':''}`} onClick={()=>setHistTab(v)}>{l}</div>
                ))}
              </div>

              {/* GRAFICI */}
              {histTab==='grafici'&&<>
                {allExercises.length===0&&<div style={{color:'var(--faint)',textAlign:'center',padding:'40px 0',fontFamily:"'Jost',sans-serif",fontSize:16}}>Completa qualche allenamento<br/>per vedere i grafici 📈</div>}
                {allExercises.length>0&&<>
                  <div className="sec">Seleziona esercizio</div>
                  <div className="ex-selector">
                    {allExercises.map(ex=>(
                      <div key={ex.id} className={`ex-pill${selectedEx===ex.id?' sel':''}`} onClick={()=>setSelectedEx(ex.id===selectedEx?null:ex.id)}>{ex.name}</div>
                    ))}
                  </div>
                  {selectedEx&&(()=>{
                    const ex=allExercises.find(e=>e.id===selectedEx);
                    const wObj=workouts.find(w=>w.exercises.find(e=>e.id===selectedEx));
                    const data=weightLog[selectedEx]||[];
                    const best=data.length?Math.max(...data.map(d=>d.peso)):null;
                    const bestOrm=data.length?Math.max(...data.map(d=>calc1RM(d.peso,d.reps))):null;
                    return(
                      <div className="chart-wrap">
                        <div className="chart-title">{ex?.name}</div>
                        <div className="chart-toggle">
                          <button className={`chart-tog-btn${chartMode==='peso'?' act':''}`} onClick={()=>setChartMode('peso')}>Peso sollevato</button>
                          <button className={`chart-tog-btn${chartMode==='1rm'?' act':''}`} onClick={()=>setChartMode('1rm')}>1RM stimato</button>
                        </div>
                        <div className="chart-sub">
                          {chartMode==='peso'?`${data.length} sessioni · Max: ${best}kg`:`${data.length} sessioni · Best 1RM: ${bestOrm}kg`}
                        </div>
                        <div className="chart-canvas-wrap">
                          {chartMode==='peso'
                            ?<WeightChart data={data} color={wObj?.color||'#d4943a'}/>
                            :<OneRMChart data={data} color={wObj?.color||'#d4943a'}/>
                          }
                        </div>
                      </div>
                    );
                  })()}
                </>}
              </>}

              {/* VOLUME SETTIMANALE */}
              {histTab==='volume'&&<>
                <div className="chart-wrap">
                  <div className="chart-title">Volume settimanale</div>
                  <div className="chart-sub">Serie totali per settimana</div>
                  <div className="chart-canvas-wrap"><VolumeChart history={history}/></div>
                </div>
                {history.length>0&&(()=>{
                  const thisWeek=history.filter(h=>(new Date()-new Date(h.date))/86400000<7);
                  const lastWeek=history.filter(h=>{const d=(new Date()-new Date(h.date))/86400000;return d>=7&&d<14;});
                  const twSets=thisWeek.reduce((s,h)=>s+(h.doneSets||0),0);
                  const lwSets=lastWeek.reduce((s,h)=>s+(h.doneSets||0),0);
                  const diff=twSets-lwSets;
                  return(
                    <div style={{display:'flex',gap:10,marginTop:4,marginBottom:20}}>
                      <div className="stat"><div className="n">{thisWeek.length}</div><div className="l">Sessioni sett.</div></div>
                      <div className="stat"><div className="n">{twSets}</div><div className="l">Serie sett.</div></div>
                      <div className="stat"><div className="n" style={{color:diff>=0?'#d4943a':'#ff4444'}}>{diff>=0?'+':''}{diff}</div><div className="l">vs sett. prec.</div></div>
                    </div>
                  );
                })()}
                <TrainingHeatmap history={history} color={meta.color}/>
              </>}

              {/* RECORD PERSONALI */}
              {histTab==='record'&&<>
                {Object.keys(personalRecords).length===0&&<div style={{color:'var(--faint)',textAlign:'center',padding:'40px 0',fontFamily:"'Jost',sans-serif",fontSize:16}}>Nessun record ancora.<br/>Allena duro! 🏆</div>}
                {workouts.map(w=>{
                  const wPRs=w.exercises.filter(e=>personalRecords[e.id]);
                  if(!wPRs.length) return null;
                  return(
                    <div key={w.id}>
                      <div className="sec" style={{color:w.color,marginBottom:8}}>{w.name}</div>
                      {wPRs.map(ex=>{
                        const pr=personalRecords[ex.id];
                        return(
                          <div className="pr-item" key={ex.id}>
                            <div style={{fontSize:20}}>🥇</div>
                            <div style={{flex:1}}>
                              <div className="pr-item-name">{ex.name}</div>
                              <div style={{fontSize:11,color:'var(--muted)'}}>{fmtDate(pr.date)} · {pr.reps} reps</div>
                            </div>
                            <div className="pr-item-val">
                              <div className="pr-item-kg">{pr.peso}kg</div>
                              <div className="pr-item-1rm">1RM ~{pr.oneRM}kg</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </>}

              {/* CONFRONTO SESSIONI */}
              {histTab==='confronto'&&<>
                {history.length<2&&<div style={{color:'var(--faint)',textAlign:'center',padding:'40px 0',fontSize:14}}>Completa almeno 2 sessioni<br/>per vedere il confronto.</div>}
                {history.length>=2&&<>
                  <div className="sec" style={{marginBottom:10}}>Seleziona scheda</div>
                  <div className="conf-select">
                    {workouts.filter(w=>history.filter(h=>h.workoutId===w.id).length>=2).map(w=>(
                      <div key={w.id} className={`conf-pill${confWorkout===w.id?' act':''}`}
                        style={confWorkout===w.id?{borderColor:w.color,background:w.color+'18',color:w.color}:{}}
                        onClick={()=>setConfWorkout(confWorkout===w.id?null:w.id)}>
                        {w.name}
                      </div>
                    ))}
                    {workouts.filter(w=>history.filter(h=>h.workoutId===w.id).length>=2).length===0&&(
                      <div style={{color:'var(--faint)',fontSize:13}}>Completa la stessa scheda almeno 2 volte.</div>
                    )}
                  </div>
                  {confWorkout&&(()=>{
                    const w=workouts.find(x=>x.id===confWorkout);
                    const sessions=history.filter(h=>h.workoutId===confWorkout).slice(0,2);
                    const [curr,prev]=sessions;
                    const volDiff=(curr.doneSets||0)-(prev.doneSets||0);
                    const timeDiff=(curr.elapsed||0)-(prev.elapsed||0);
                    // Per ogni esercizio della scheda, trova il best peso nelle due sessioni
                    const exData=w.exercises.map(ex=>{
                      const currSets=Object.entries(curr.doneSets?{}:{}).length; // placeholder
                      // Cerchiamo nel weightLog le entry corrispondenti alle date delle sessioni
                      const wl=weightLog[ex.id]||[];
                      const currDate=curr.date.slice(0,10);
                      const prevDate=prev.date.slice(0,10);
                      const currPeso=wl.filter(e=>e.date.slice(0,10)===currDate).map(e=>e.peso);
                      const prevPeso=wl.filter(e=>e.date.slice(0,10)===prevDate).map(e=>e.peso);
                      const cMax=currPeso.length?Math.max(...currPeso):null;
                      const pMax=prevPeso.length?Math.max(...prevPeso):null;
                      return{name:ex.name,curr:cMax,prev:pMax};
                    }).filter(e=>e.curr!==null||e.prev!==null);
                    return(
                      <>
                        <div className="conf-grid">
                          <div className="conf-col">
                            <div className="conf-col-hdr">Ultima sessione</div>
                            <div className="conf-col-date">{fmtDate(curr.date)}</div>
                            <div className="conf-col-stat"><span>{curr.doneSets}</span> serie · <span>{fmtTime(curr.elapsed||0)}</span></div>
                            {curr.rpe&&<div className="conf-col-stat" style={{marginTop:4}}>RPE <span style={{color:getRpeColor(curr.rpe)}}>{curr.rpe}</span></div>}
                          </div>
                          <div className="conf-col">
                            <div className="conf-col-hdr">Sessione precedente</div>
                            <div className="conf-col-date">{fmtDate(prev.date)}</div>
                            <div className="conf-col-stat"><span>{prev.doneSets}</span> serie · <span>{fmtTime(prev.elapsed||0)}</span></div>
                            {prev.rpe&&<div className="conf-col-stat" style={{marginTop:4}}>RPE <span style={{color:getRpeColor(prev.rpe)}}>{prev.rpe}</span></div>}
                          </div>
                        </div>
                        <div style={{display:'flex',gap:8,marginBottom:16}}>
                          <div className="stat"><div className="n" style={{color:volDiff>=0?'#d4943a':'#c96a6a'}}>{volDiff>=0?'+':''}{volDiff}</div><div className="l">Serie</div></div>
                          <div className="stat"><div className="n" style={{color:timeDiff<=0?'#d4943a':'#c96a6a'}}>{timeDiff>0?'+':''}{fmtTime(Math.abs(timeDiff))}</div><div className="l">Tempo</div></div>
                        </div>
                        {exData.length>0&&(
                          <div className="chart-wrap">
                            <div className="chart-title" style={{marginBottom:12}}>Pesi per esercizio</div>
                            {exData.map((e,i)=>(
                              <div className="conf-ex-row" key={i}>
                                <div className="conf-ex-name">{e.name}</div>
                                <div className="conf-ex-vals">
                                  <span className={`conf-ex-val${e.curr&&e.prev?(e.curr>e.prev?' better':e.curr<e.prev?' worse':''):''}`}>
                                    {e.curr!==null?`${e.curr}kg`:'—'}
                                  </span>
                                  <span style={{fontSize:11,color:'var(--faint)',alignSelf:'center'}}>vs</span>
                                  <span className="conf-ex-val" style={{color:'var(--muted)'}}>{e.prev!==null?`${e.prev}kg`:'—'}</span>
                                  {e.curr&&e.prev&&e.curr!==e.prev&&(
                                    <span style={{fontSize:11,color:e.curr>e.prev?'#d4943a':'#c96a6a',alignSelf:'center'}}>
                                      {e.curr>e.prev?'+':''}{(e.curr-e.prev).toFixed(1)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>}
              </>}

              {/* STORICO PESI */}
              {histTab==='storico'&&<>
                {allExercises.length===0&&<div style={{color:'var(--faint)',textAlign:'center',padding:'40px 0',fontFamily:"'Jost',sans-serif",fontSize:16}}>Nessun peso registrato ancora.</div>}
                {allExercises.map(ex=>{
                  const data=(weightLog[ex.id]||[]).slice().reverse();
                  const wObj=workouts.find(w=>w.exercises.find(e=>e.id===ex.id));
                  return(
                    <div className="chart-wrap" key={ex.id}>
                      <div className="chart-title" style={{color:wObj?.color}}>{ex.name}</div>
                      <div className="chart-sub">{data.length} rilevazioni</div>
                      {data.slice(0,8).map((d,i)=>(
                        <div className="wh-row" key={i}>
                          <div className="wh-date">{fmtDate(d.date)}</div>
                          <div><span className="wh-val">{d.peso} kg</span><span className="wh-reps"> × {d.reps} reps</span></div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </>}

              {/* CORPO — BODY WEIGHT TRACKER */}
              {histTab==='corpo'&&<>
                <div className="bw-card">
                  {bwLatest?(
                    <div className="bw-big">
                      <div><span className="bw-big-val">{bwLatest.peso}</span><span className="bw-big-unit">kg</span></div>
                      <div className="bw-big-date">ultima misurazione · {fmtDate(bwLatest.date)}</div>
                      {bwDelta!==null&&(
                        <div style={{display:'flex',justifyContent:'center',marginTop:8}}>
                          <span className={`bw-delta${bwDelta>0?' pos':bwDelta<0?' neg':' zero'}`}>
                            {bwDelta>0?'+':''}{bwDelta} kg dall'inizio
                          </span>
                        </div>
                      )}
                    </div>
                  ):(
                    <div style={{textAlign:'center',padding:'12px 0 16px',color:'var(--faint)',fontSize:14}}>
                      Nessuna misurazione ancora. Aggiungila qui sotto.
                    </div>
                  )}
                  <div className="bw-add-row">
                    <input className="bw-inp" type="number" inputMode="decimal" placeholder="75.5"
                      value={bwInput} onChange={e=>setBwInput(e.target.value)}
                      onKeyDown={e=>e.key==='Enter'&&addBodyWeight()}/>
                    <input className="bw-note-inp" placeholder="nota (es. mattino)"
                      value={bwNote} onChange={e=>setBwNote(e.target.value)}/>
                    <button className="bw-add-btn" onClick={addBodyWeight}>+</button>
                  </div>
                </div>

                {bwSorted.length>1&&(()=>{
                  const vals=bwSorted.map(e=>e.peso);
                  const min=Math.min(...vals),max=Math.max(...vals);
                  const avg=(vals.reduce((s,v)=>s+v,0)/vals.length).toFixed(1);
                  return(
                    <div className="bw-stats">
                      <div className="stat"><div className="n">{min}</div><div className="l">Min</div></div>
                      <div className="stat"><div className="n">{max}</div><div className="l">Max</div></div>
                      <div className="stat"><div className="n">{avg}</div><div className="l">Media</div></div>
                      <div className="stat"><div className="n">{bwSorted.length}</div><div className="l">Log</div></div>
                    </div>
                  );
                })()}

                {bwSorted.length>=2&&(
                  <div className="chart-wrap" style={{marginBottom:16}}>
                    <div className="chart-title">Andamento peso corporeo</div>
                    <div className="chart-sub">{bwSorted.length} misurazioni</div>
                    <div className="chart-canvas-wrap"><BodyWeightChart data={bodyWeightLog} color={meta.color}/></div>
                  </div>
                )}

                {bwSorted.length>0&&(
                  <div className="chart-wrap">
                    <div className="chart-title" style={{marginBottom:12}}>Storico</div>
                    {bwSorted.map((e,i)=>(
                      <div className="bw-row" key={e.id}>
                        <div className="bw-row-left">
                          <div className="bw-row-date">{fmtDate(e.date)}</div>
                          {e.note&&<div className="bw-row-note">{e.note}</div>}
                        </div>
                        <div className="bw-row-right">
                          {i<bwSorted.length-1&&(()=>{
                            const diff=+(e.peso-bwSorted[i+1].peso).toFixed(1);
                            if(diff===0) return null;
                            return<span className="bw-row-diff" style={{color:diff<0?'#d4943a':'#c96a6a'}}>{diff>0?'+':''}{diff}</span>;
                          })()}
                          <span className="bw-row-val">{e.peso} kg</span>
                          <button className="bw-row-del" onClick={()=>deleteBodyWeight(e.id)}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {bodyWeightLog.length===0&&(
                  <div style={{color:'var(--faint)',textAlign:'center',padding:'32px 0',fontSize:14}}>
                    Inizia ad aggiungere misurazioni<br/>per vedere il grafico 📈
                  </div>
                )}
              </>}
            </div>}

            {/* ── SETTINGS ── */}
            {gymView==='settings'&&<div className="pad anim">
              <div className="greeting">Impo-<br/><span>stazioni</span></div>
              <div className="subhead" style={{marginBottom:20}}>Personalizza la tua esperienza</div>
              <div className="settings-section">
                <div className="settings-title">⏱ Timer Recupero</div>
                <div className="s-lbl" style={{marginBottom:10}}>Durata pausa tra le serie</div>
                <div className="timer-options">
                  {[30,45,60,90,120].map(t=>(
                    <div key={t} className={`timer-opt${(gymSettings.restTime||60)===t?' sel':''}`}
                      onClick={async()=>await saveGymAll({settings:{...gymSettings,restTime:t}})}>
                      {t<60?`${t}s`:`${t/60}min`}
                    </div>
                  ))}
                </div>
              </div>

              {/* SPOTIFY */}
              <div className="settings-section">
                <div className="settings-title">🎵 Spotify</div>
                {spToken?.access_token?(
                  <>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:'#1DB954',flexShrink:0}}/>
                      <span style={{fontSize:12,fontWeight:500,color:'#1DB954',letterSpacing:'.05em',textTransform:'uppercase'}}>Connesso</span>
                    </div>
                    <div className="s-hint" style={{marginBottom:12}}>
                      Il player appare durante le sessioni. Tieni Spotify aperto sul dispositivo che vuoi usare come altoparlante.
                    </div>
                    <button onClick={spDisconnect}
                      style={{width:'100%',padding:'12px',borderRadius:10,background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--muted)',fontFamily:'var(--font)',fontSize:13,fontWeight:400,cursor:'pointer',letterSpacing:'.05em'}}>
                      Disconnetti Spotify
                    </button>
                  </>
                ):(
                  <>
                    <div className="s-hint" style={{marginBottom:10}}>
                      Crea un'app su <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer" style={{color:'#1DB954'}}>developer.spotify.com</a> e aggiungi come Redirect URI:
                      <br/><span style={{fontFamily:'monospace',fontSize:11,color:'var(--muted)',wordBreak:'break-all'}}>{spRedirectUri()}</span>
                    </div>
                    <div className="s-row">
                      <div className="s-lbl">Client ID</div>
                      <input className="s-inp" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={spClientId} onChange={e=>setSpClientId(e.target.value)}/>
                    </div>
                    <button className="s-btn" style={{background:'#1DB954',color:'#0b0c09',opacity:spClientId.trim()?1:.4}}
                      onClick={()=>spClientId.trim()&&spSaveClientId()}>
                      Connetti con Spotify
                    </button>
                  </>
                )}
              </div>

              <div className="settings-section">
                <div className="settings-title">☁️ Sincronizzazione</div>
                <div className="s-lbl" style={{marginBottom:4}}>Il tuo ID dispositivo</div>
                <div className="s-uid">{getUserId()}</div>
                <div className="s-hint" style={{marginBottom:14}}>Copia questo ID sull'altro dispositivo per sincronizzare.</div>
                <div className="s-row"><div className="s-lbl">Supabase URL</div><input className="s-inp" placeholder="https://xxx.supabase.co" value={supaForm.url} onChange={e=>setSupaForm(f=>({...f,url:e.target.value}))}/></div>
                <div className="s-row"><div className="s-lbl">Anon Key</div><input className="s-inp" placeholder="eyJ..." value={supaForm.key} onChange={e=>setSupaForm(f=>({...f,key:e.target.value}))}/></div>
                <button className="s-btn" onClick={saveSupaSettings}>{syncStatus==='syncing'?'Connessione..':syncStatus==='ok'?'✓ Connesso':syncStatus==='err'?'⚠ Errore — Riprova':'Salva e Connetti'}</button>
              </div>
            </div>}

            {/* ── SKILLS / CALISTENIA ── */}
            {gymView==='cali'&&<div className="pad anim">

              {/* Vista dettaglio skill */}
              {activeCaliSkill?(()=>{
                const skill=CALI_SKILLS.find(s=>s.id===activeCaliSkill);
                if(!skill) return null;
                const {achieved,inProg,pct}=caliSkillProgress(skill);
                const statusLabel={locked:'Bloccato',available:'Disponibile',in_progress:'In corso',achieved:'Completato'};
                const actionLabel={available:'Inizia',in_progress:'Completato ✓'};
                return(
                  <div style={{'--cali-col':skill.color}}>
                    <button className="back" style={{marginBottom:16,display:'flex',alignItems:'center',gap:6,background:'none',border:'none',color:'var(--muted)',fontFamily:'var(--font)',fontSize:13,cursor:'pointer',padding:0,letterSpacing:'.04em'}}
                      onClick={()=>setActiveCaliSkill(null)}>
                      <Icon name="back_arr" size={14}/> Tutte le skill
                    </button>
                    <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:8}}>
                      <div style={{fontSize:36,lineHeight:1}}>{skill.emoji}</div>
                      <div>
                        <div style={{fontFamily:'var(--font)',fontSize:24,fontWeight:500,textTransform:'uppercase',letterSpacing:'.04em',color:skill.color}}>{skill.name}</div>
                        <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>{skill.desc}</div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{marginBottom:20}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                        <span style={{fontFamily:'var(--font)',fontSize:11,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em'}}>Progressione</span>
                        <span style={{fontFamily:'var(--font)',fontSize:11,color:skill.color}}>{achieved}/{skill.steps.length} step · {pct}%</span>
                      </div>
                      <div className="cali-card-prog">
                        <div className="cali-card-prog-fill" style={{width:pct+'%',background:skill.color}}/>
                      </div>
                    </div>

                    {/* Steps */}
                    {skill.steps.map((st,i)=>{
                      const status=caliProgress[st.id]||'locked';
                      const isLast=status==='achieved';
                      const canAct=status==='available'||status==='in_progress';
                      const prereqNames=st.prereqs.map(pid=>{
                        const pskill=CALI_SKILLS.find(s=>s.steps.find(x=>x.id===pid));
                        return pskill?.steps.find(x=>x.id===pid)?.name||pid;
                      });
                      return(
                        <div key={st.id} className={`cali-step ${status}`}>
                          {/* Status icon */}
                          <div className={`cali-step-icon ${status}`}>
                            {status==='locked'&&'🔒'}
                            {status==='available'&&<span style={{fontFamily:'var(--font)',fontSize:11,fontWeight:600}}>{i+1}</span>}
                            {status==='in_progress'&&'◑'}
                            {status==='achieved'&&'✓'}
                          </div>
                          {/* Body */}
                          <div className="cali-step-body">
                            <div className="cali-step-name" style={status==='achieved'?{textDecoration:'line-through',color:'var(--muted)'}:{}}>{st.name}</div>
                            <div className="cali-step-desc">{st.desc}</div>
                            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:6}}>
                              <span className="cali-step-tag">{st.tag}</span>
                              {status==='achieved'&&<span className="cali-step-tag" style={{borderColor:skill.color+'60',color:skill.color}}>✓ Completato</span>}
                              {status==='in_progress'&&<span className="cali-step-tag" style={{borderColor:skill.color+'60',color:skill.color}}>In allenamento</span>}
                            </div>
                            {status==='locked'&&prereqNames.length>0&&(
                              <div className="cali-step-prereq">Richiede: {prereqNames.join(', ')}</div>
                            )}
                          </div>
                          {/* Action */}
                          <div style={{display:'flex',flexDirection:'column',gap:6,flexShrink:0}}>
                            {canAct&&(
                              <button className={`cali-action-btn ${status==='available'?'start':'done'}`}
                                style={status==='in_progress'?{background:skill.color,color:'#0b0c09'}:{borderColor:skill.color,color:skill.color}}
                                onClick={()=>caliAdvance(st.id)}>
                                {actionLabel[status]}
                              </button>
                            )}
                            {status==='achieved'&&(
                              <button className="cali-action-btn reset" onClick={()=>caliReset(st.id)}>Reset</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })():(
                /* Vista lista skill */
                <>
                  <div className="greeting">Le tue<br/><span>skills.</span></div>
                  <div className="subhead" style={{marginBottom:20}}>Progressioni di calistenia passo dopo passo</div>

                  {/* Riepilogo globale */}
                  <div className="cali-summary">
                    {(()=>{
                      const totalAchieved=CALI_SKILLS.reduce((s,sk)=>s+sk.steps.filter(st=>caliProgress[st.id]==='achieved').length,0);
                      const totalSteps=CALI_SKILLS.reduce((s,sk)=>s+sk.steps.length,0);
                      const totalInProg=CALI_SKILLS.reduce((s,sk)=>s+sk.steps.filter(st=>caliProgress[st.id]==='in_progress').length,0);
                      const completedSkills=CALI_SKILLS.filter(sk=>sk.steps.every(st=>caliProgress[st.id]==='achieved')).length;
                      return(<>
                        <div className="stat"><div className="n">{totalAchieved}</div><div className="l">Step completati</div></div>
                        <div className="stat"><div className="n">{totalInProg}</div><div className="l">In allenamento</div></div>
                        <div className="stat"><div className="n">{completedSkills}/{CALI_SKILLS.length}</div><div className="l">Skill complete</div></div>
                      </>);
                    })()}
                  </div>

                  {/* Skill cards */}
                  {CALI_SKILLS.map(skill=>{
                    const {total,achieved,inProg,pct}=caliSkillProgress(skill);
                    const isComplete=achieved===total;
                    const hasInProg=inProg>0;
                    const badgeLabel=isComplete?'Completata':hasInProg?`${inProg} in corso`:`${achieved}/${total} step`;
                    const badgeColor=isComplete?skill.color:hasInProg?skill.color:'var(--muted)';
                    return(
                      <div key={skill.id} className="cali-card" onClick={()=>setActiveCaliSkill(skill.id)}>
                        <div className="cali-card-bar" style={{background:skill.color}}/>
                        <div className="cali-card-body">
                          <div className="cali-card-emoji">{skill.emoji}</div>
                          <div className="cali-card-info">
                            <div className="cali-card-name" style={{color:skill.color}}>{skill.name}</div>
                            <div className="cali-card-desc">{skill.desc}</div>
                          </div>
                          <div className="cali-card-badge" style={{color:badgeColor,borderColor:badgeColor+'50',background:badgeColor+'12'}}>
                            {badgeLabel}
                          </div>
                        </div>
                        <div className="cali-card-prog-wrap">
                          <div className="cali-card-prog-label">
                            <span className="cali-card-prog-pct">{pct}%</span>
                            <span className="cali-card-prog-pct">{skill.steps.length} step totali</span>
                          </div>
                          <div className="cali-card-prog">
                            <div className="cali-card-prog-fill" style={{width:pct+'%',background:isComplete?skill.color:hasInProg?skill.color+'cc':skill.color+'66'}}/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>}

            {/* Fine delle varie viste (Settings/Cali) */}
          </div> 

        {showCreateWorkout && (
          <div className="modal-bg" onClick={() => setShowCreateWorkout(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="m-title">Nuova scheda</div>
              <div className="m-row">
                <div className="m-lbl">Nome</div>
                <input className="m-inp m-inp-text" placeholder="Es. Petto/Tricipiti" value={newWorkoutForm.name}
                  onChange={e => setNewWorkoutForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="m-row">
                <div className="m-lbl">Sottotitolo</div>
                <input className="m-inp m-inp-text" placeholder="Es. Petto · Tricipiti · Spalle" value={newWorkoutForm.subtitle}
                  onChange={e => setNewWorkoutForm(f => ({ ...f, subtitle: e.target.value }))} />
              </div>
              <div className="m-lbl" style={{ marginBottom: 8 }}>Colore</div>
              <div className="color-picker" style={{ marginBottom: 16 }}>
                {WORKOUT_COLORS.map(c => (
                  <div key={c} className={`color-dot${newWorkoutForm.color === c ? ' sel' : ''}`}
                    style={{ background: c }} onClick={() => setNewWorkoutForm(f => ({ ...f, color: c }))} />
                ))}
              </div>
              <div className="m-acts">
                <button className="m-cancel" onClick={() => setShowCreateWorkout(false)}>Annulla</button>
                <button className="m-save" onClick={createWorkout}>Crea scheda</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
}