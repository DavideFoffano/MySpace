/* ═══════════════════════════════════════════
   MODULE: EXPENSES v2
   Tab: Home · Movimenti · Analisi · Conti
═══════════════════════════════════════════ */

/* ── Default accounts ── */
const EXP_DEFAULT_ACCOUNTS = [
  {id:'eacc_1', name:'Conto Corrente',  color:'#6aadcf', balance:0},
  {id:'eacc_2', name:'Carta di Credito',color:'#d4943a', balance:0},
  {id:'eacc_3', name:'Contanti',         color:'#7aba7a', balance:0},
  {id:'eacc_4', name:'Risparmio',        color:'#d4c9a8', balance:0},
  {id:'eacc_5', name:'PayPal',           color:'#9b8ec4', balance:0},
];

const EXP_ACC_COLORS = ['#6aadcf','#d4943a','#7aba7a','#d4c9a8','#9b8ec4','#e07070','#c0a070','#70c0a0'];

const EXP_CAT_COLORS = [
  '#c97a4a','#a8c26b','#6dbb8a','#9b8fc2','#d4a84b','#7b8a7a',
  '#6aadcf','#d4943a','#7aba7a','#e07070','#c0a070','#70c0a0',
  '#9b8ec4','#d4c9a8','#c96a6a','#6ab8a0',
];

/* ════════════════════════════════════════
   MODAL: Custom Category
════════════════════════════════════════ */
function ExpCatModal({cat, type, onSave, onDelete, onClose}){
  const isNew = !cat.id;
  const [name,  setName]  = useState(cat.name||'');
  const [emoji, setEmoji] = useState(cat.emoji||'');
  const [color, setColor] = useState(cat.color||EXP_CAT_COLORS[0]);

  const QUICK_EMOJI = type==='expense'
    ? ['🛒','🍕','🚗','💊','✂️','🎮','👗','📱','⚡','🏠','🐾','☕','📚','🎵','🧴','🏋️','🎁','✈️','🍷','🧾']
    : ['💼','💰','🎁','🏦','↩️','📈','🏡','💎','🎓','🤝','💻','🛠️'];

  function save(){
    if(!name.trim()) return;
    onSave({
      id: cat.id||('custom_'+uuid()),
      name: name.trim(),
      emoji: emoji||'📌',
      color,
      custom: true,
      type,
    });
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.78)',zIndex:210,display:'flex',alignItems:'flex-end'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'var(--surface)',borderRadius:'20px 20px 0 0',width:'100%',padding:24,paddingBottom:44,boxSizing:'border-box',maxHeight:'88vh',overflowY:'auto'}}>
        <div style={{fontFamily:"'Jost',sans-serif",fontSize:17,fontWeight:700,color:'var(--text)',marginBottom:18}}>
          {isNew?`Nuova categoria ${type==='expense'?'uscita':'entrata'}`:'Modifica categoria'}
        </div>

        <label style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:'var(--muted)'}}>Nome</label>
        <input className="exp-note-inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Es. Palestra, Abbonamenti…"
          style={{width:'100%',boxSizing:'border-box',marginTop:6,marginBottom:14,color:'var(--text)'}}/>

        <label style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:'var(--muted)'}}>Emoji</label>
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:8,marginBottom:14}}>
          {QUICK_EMOJI.map(e=>(
            <div key={e} onClick={()=>setEmoji(e)} style={{width:36,height:36,borderRadius:9,
              background:emoji===e?color+'33':'var(--surface2)',
              border:`1px solid ${emoji===e?color:'var(--border)'}`,
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:18,cursor:'pointer',transition:'all .15s'}}>
              {e}
            </div>
          ))}
          <input value={emoji} onChange={e=>setEmoji(e.target.value)} placeholder="✏️"
            style={{width:36,height:36,borderRadius:9,background:'var(--surface2)',
            border:'1px solid var(--border2)',textAlign:'center',fontSize:18,
            color:'var(--text)',outline:'none',boxSizing:'border-box'}}/>
        </div>

        <label style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:'var(--muted)'}}>Colore</label>
        <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:8,marginBottom:20}}>
          {EXP_CAT_COLORS.map(c=>(
            <div key={c} onClick={()=>setColor(c)} style={{width:28,height:28,borderRadius:'50%',background:c,
              border:`2px solid ${color===c?'#fff':'transparent'}`,cursor:'pointer',transition:'border .15s'}}/>
          ))}
        </div>

        {/* Preview */}
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',
          background:'var(--surface2)',borderRadius:12,marginBottom:20}}>
          <div style={{width:40,height:40,borderRadius:13,background:color+'22',
            border:`1.5px solid ${color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>
            {emoji||'📌'}
          </div>
          <span style={{fontFamily:"'Jost',sans-serif",fontSize:14,color:'var(--text)'}}>{name||'Anteprima'}</span>
        </div>

        <div style={{display:'grid',gridTemplateColumns:isNew?'1fr':'1fr 1fr',gap:8,marginBottom:8}}>
          {!isNew&&<button onClick={()=>onDelete(cat.id)} style={{padding:12,borderRadius:12,
            border:'1px solid #e0707066',background:'#e0707018',color:'#e07070',
            fontFamily:"'Jost',sans-serif",fontWeight:600,cursor:'pointer'}}>Elimina</button>}
          <button onClick={save} style={{padding:12,borderRadius:12,border:'none',
            background:color,color:'#0b0c09',fontFamily:"'Jost',sans-serif",fontWeight:700,cursor:'pointer'}}>
            {isNew?'Crea categoria':'Salva'}
          </button>
        </div>
        <button onClick={onClose} style={{width:'100%',padding:10,borderRadius:12,
          border:'1px solid var(--border)',background:'transparent',color:'var(--muted)',
          fontFamily:"'Jost',sans-serif",cursor:'pointer'}}>Annulla</button>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function expNextDue(period, customDays, fromDate){
  const d = fromDate ? new Date(fromDate+'T12:00:00') : new Date();
  if(period==='monthly')  d.setMonth(d.getMonth()+1);
  else if(period==='yearly') d.setFullYear(d.getFullYear()+1);
  else d.setDate(d.getDate()+(parseInt(customDays)||30));
  return d.toISOString();
}
function expKind(e){ return e.type || 'expense'; }

/* ════════════════════════════════════════
   MODAL: Account
════════════════════════════════════════ */
function ExpAccountModal({acc, onSave, onDelete, onClose, ACC}){
  const isNew = !acc.id;
  const [name,    setName]    = useState(acc.name||'');
  const [balance, setBalance] = useState(String(acc.balance ?? 0));
  const [color,   setColor]   = useState(acc.color||ACC);

  function save(){
    if(!name.trim()) return;
    onSave({...acc, id:acc.id||uuid(), name:name.trim(), balance:parseFloat(balance)||0, color});
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:200,display:'flex',alignItems:'flex-end'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'var(--surface)',borderRadius:'20px 20px 0 0',width:'100%',padding:24,paddingBottom:44,boxSizing:'border-box'}}>
        <div style={{fontFamily:"'Jost',sans-serif",fontSize:18,fontWeight:700,color:'var(--text)',marginBottom:20}}>{isNew?'Nuovo conto':'Modifica conto'}</div>
        <label style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:'var(--muted)'}}>Nome</label>
        <input className="exp-note-inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Es. Conto BancoPosta"
          style={{width:'100%',boxSizing:'border-box',marginTop:6,marginBottom:14,color:'var(--text)'}}/>
        <label style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:'var(--muted)'}}>Saldo attuale (€)</label>
        <input className="exp-note-inp" type="number" value={balance} onChange={e=>setBalance(e.target.value)} placeholder="0.00"
          style={{width:'100%',boxSizing:'border-box',marginTop:6,marginBottom:14,color:'var(--text)'}}/>
        <label style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:'var(--muted)'}}>Colore</label>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8,marginBottom:20}}>
          {EXP_ACC_COLORS.map(c=>(
            <div key={c} onClick={()=>setColor(c)} style={{width:28,height:28,borderRadius:'50%',background:c,
              border:`2px solid ${color===c?'#fff':'transparent'}`,cursor:'pointer',transition:'border .15s'}}/>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:isNew?'1fr':'1fr 1fr',gap:8}}>
          {!isNew&&<button onClick={()=>onDelete(acc.id)} style={{padding:12,borderRadius:12,border:'1px solid #e0707066',background:'#e0707018',color:'#e07070',fontFamily:"'Jost',sans-serif",fontWeight:600,cursor:'pointer'}}>Elimina</button>}
          <button onClick={save} style={{padding:12,borderRadius:12,border:'none',background:ACC,color:'#0b0c09',fontFamily:"'Jost',sans-serif",fontWeight:700,cursor:'pointer'}}>{isNew?'Crea conto':'Salva'}</button>
        </div>
        <button onClick={onClose} style={{marginTop:8,width:'100%',padding:10,borderRadius:12,border:'1px solid var(--border)',background:'transparent',color:'var(--muted)',fontFamily:"'Jost',sans-serif",cursor:'pointer'}}>Annulla</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MODAL: Recurring
════════════════════════════════════════ */
function ExpRecurringModal({rec, accounts, onSave, onClose, ACC}){
  const isNew = !rec.id;
  const [amount, setAmount] = useState(String(rec.amount||''));
  const [type,   setType]   = useState(rec.type||'expense');
  const [cat,    setCat]    = useState(rec.category||'cibo');
  const [note,   setNote]   = useState(rec.note||'');
  const [accId,  setAccId]  = useState(rec.accountId||accounts[0]?.id||'');
  const [period, setPeriod] = useState(rec.period||'monthly');
  const [cdays,  setCdays]  = useState(rec.customDays||30);

  function save(){
    const amt = parseFloat(amount);
    if(!amt||amt<=0) return;
    onSave({
      id: rec.id||uuid(), amount:amt, type, category:cat, note, accountId:accId,
      period, customDays: period==='custom'?parseInt(cdays)||30:null,
      nextDue: rec.nextDue||expNextDue(period,cdays),
      createdAt: rec.createdAt||new Date().toISOString()
    });
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:200,display:'flex',alignItems:'flex-end'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'var(--surface)',borderRadius:'20px 20px 0 0',width:'100%',padding:24,paddingBottom:44,boxSizing:'border-box',maxHeight:'88vh',overflowY:'auto'}}>
        <div style={{fontFamily:"'Jost',sans-serif",fontSize:18,fontWeight:700,color:'var(--text)',marginBottom:20}}>{isNew?'Nuova ricorrente':'Modifica ricorrente'}</div>

        {/* Type */}
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          {['expense','income'].map(t=>(
            <button key={t} onClick={()=>setType(t)} style={{flex:1,padding:'9px',borderRadius:10,
              border:`1px solid ${type===t?(t==='income'?ACC:'#e07070'):'var(--border)'}`,
              background:type===t?(t==='income'?ACC+'22':'#e0707022'):'var(--surface2)',
              color:type===t?(t==='income'?ACC:'#e07070'):'var(--muted)',
              fontFamily:"'Jost',sans-serif",fontSize:13,cursor:'pointer',transition:'all .2s'}}>
              {t==='expense'?'🔴 Uscita':'🟢 Entrata'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div style={{position:'relative',marginBottom:10}}>
          <div style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontFamily:"'Jost',sans-serif",fontSize:20,color:'var(--muted)'}}>€</div>
          <input className="exp-amount-inp" type="number" inputMode="decimal" placeholder="0.00" value={amount} onChange={e=>setAmount(e.target.value)}
            style={{paddingLeft:28,width:'100%',boxSizing:'border-box'}}/>
        </div>

        {/* Category */}
        <div style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:'var(--muted)',marginBottom:8}}>Categoria</div>
        <div className="exp-cats" style={{marginBottom:12}}>
          {(type==='expense'?EXPENSE_CATS:[...INCOME_CATS]).map(c=>(
            <div key={c.id} className={`exp-cat${cat===c.id?' sel':''}`} onClick={()=>setCat(c.id)}>
              <div className="exp-cat-icon" style={cat===c.id?{borderColor:c.color,background:c.color+'20'}:{}}>
                {c.emoji
                  ? <span style={{fontSize:18}}>{c.emoji}</span>
                  : <Icon name={c.icon} size={18} color={cat===c.id?c.color:'var(--muted)'}/>
                }
              </div>
              <div className="exp-cat-name">{c.name}</div>
            </div>
          ))}
        </div>

        <input className="exp-note-inp" placeholder="Nota (es. Netflix, Affitto…)" value={note} onChange={e=>setNote(e.target.value)}
          style={{width:'100%',boxSizing:'border-box',marginBottom:8,color:'var(--text)'}}/>
        <select className="exp-note-inp" value={accId} onChange={e=>setAccId(e.target.value)}
          style={{width:'100%',boxSizing:'border-box',marginBottom:8,color:'var(--text)'}}>
          {accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select className="exp-note-inp" value={period} onChange={e=>setPeriod(e.target.value)}
          style={{width:'100%',boxSizing:'border-box',marginBottom:period==='custom'?8:16,color:'var(--text)'}}>
          <option value="monthly">Mensile</option>
          <option value="yearly">Annuale</option>
          <option value="custom">Personalizzata (N giorni)</option>
        </select>
        {period==='custom'&&(
          <input className="exp-note-inp" type="number" placeholder="Ogni N giorni" value={cdays} onChange={e=>setCdays(e.target.value)}
            style={{width:'100%',boxSizing:'border-box',marginBottom:16,color:'var(--text)'}}/>
        )}

        <button onClick={save} style={{width:'100%',padding:12,borderRadius:12,border:'none',background:ACC,color:'#0b0c09',fontFamily:"'Jost',sans-serif",fontWeight:700,cursor:'pointer',marginBottom:8}}>
          {isNew?'Aggiungi':'Salva modifiche'}
        </button>
        <button onClick={onClose} style={{width:'100%',padding:10,borderRadius:12,border:'1px solid var(--border)',background:'transparent',color:'var(--muted)',fontFamily:"'Jost',sans-serif",cursor:'pointer'}}>Annulla</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
/* ════════════════════════════════════════
   COMPONENT: Grafici (charts only)
════════════════════════════════════════ */
function ExpGrafici({expenses, ACC, expCats}){
  expCats = expCats||EXPENSE_CATS;
  const pieRef  = useRef(null);
  const barRef  = useRef(null);
  const pieInst = useRef(null);
  const barInst = useRef(null);

  const now = new Date();
  const nowMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  const monthExps = useMemo(()=>expenses.filter(e=>{
    const d=new Date(e.date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`===nowMonth;
  }),[expenses]);

  const catTotals = useMemo(()=>{
    const t={};
    monthExps.filter(e=>expKind(e)==='expense').forEach(e=>{ t[e.category]=(t[e.category]||0)+e.amount; });
    return t;
  },[monthExps]);

  const monthly6 = useMemo(()=>{
    return Array.from({length:6},(_,i)=>{
      const d=new Date(); d.setMonth(d.getMonth()-(5-i));
      const m=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const label=d.toLocaleDateString('it-IT',{month:'short'});
      const me=expenses.filter(e=>{const ed=new Date(e.date);return `${ed.getFullYear()}-${String(ed.getMonth()+1).padStart(2,'0')}`===m;});
      return {label, out:me.filter(e=>expKind(e)==='expense').reduce((s,e)=>s+e.amount,0), inc:me.filter(e=>expKind(e)==='income').reduce((s,e)=>s+e.amount,0)};
    });
  },[expenses]);

  useEffect(()=>{
    if(typeof Chart==='undefined') return;
    requestAnimationFrame(()=>{
      if(pieRef.current){
        if(pieInst.current){ pieInst.current.destroy(); pieInst.current=null; }
        const cats=expCats.filter(c=>catTotals[c.id]);
        if(cats.length>0){
          pieInst.current=new Chart(pieRef.current,{
            type:'doughnut',
            data:{labels:cats.map(c=>c.name),datasets:[{data:cats.map(c=>catTotals[c.id]),backgroundColor:cats.map(c=>c.color+'cc'),borderColor:'#161614',borderWidth:2}]},
            options:{responsive:true,cutout:'65%',plugins:{legend:{position:'bottom',labels:{color:'#e8e6df',font:{family:'Jost',size:11},padding:10,boxWidth:10}}}}
          });
        }
      }
      if(barRef.current){
        if(barInst.current){ barInst.current.destroy(); barInst.current=null; }
        barInst.current=new Chart(barRef.current,{
          type:'bar',
          data:{
            labels:monthly6.map(d=>d.label),
            datasets:[
              {label:'Uscite',data:monthly6.map(d=>d.out),backgroundColor:'#e07070bb',borderRadius:4},
              {label:'Entrate',data:monthly6.map(d=>d.inc),backgroundColor:ACC+'bb',borderRadius:4}
            ]
          },
          options:{responsive:true,scales:{
            y:{ticks:{color:'#6b6a5e',font:{family:'Jost',size:11}},grid:{color:'#25252166'}},
            x:{ticks:{color:'#6b6a5e',font:{family:'Jost',size:11}},grid:{display:false}}
          },plugins:{legend:{labels:{color:'#e8e6df',font:{family:'Jost',size:11},boxWidth:10}}}}
        });
      }
    });
    return()=>{
      if(pieInst.current){pieInst.current.destroy();pieInst.current=null;}
      if(barInst.current){barInst.current.destroy();barInst.current=null;}
    };
  },[catTotals, monthly6]);

  return (
    <div className="pad anim">
      <div style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:'var(--muted)',marginBottom:10}}>Spese per categoria — mese corrente</div>
      <div style={{background:'var(--surface)',borderRadius:16,padding:16,marginBottom:20,border:'1px solid var(--border)',minHeight:180,display:'flex',alignItems:'center',justifyContent:'center'}}>
        {Object.keys(catTotals).length===0
          ? <div style={{color:'var(--faint)',fontFamily:"'Jost',sans-serif",fontSize:14}}>Nessuna uscita questo mese</div>
          : <canvas ref={pieRef} style={{maxHeight:240}}/>
        }
      </div>
      <div style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:'var(--muted)',marginBottom:10}}>Entrate & Uscite — ultimi 6 mesi</div>
      <div style={{background:'var(--surface)',borderRadius:16,padding:16,border:'1px solid var(--border)'}}>
        <canvas ref={barRef} style={{maxHeight:210}}/>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   TAB: Investimenti
════════════════════════════════════════ */
function ExpInvestimenti({investments, onAdd, onEdit, onSell, onRefresh}){
  const invColor = '#9b8ec4';
  const pieRef  = useRef(null);
  const pieInst = useRef(null);

  const totalInvested = investments.reduce((s,i)=>s+i.buyPrice*i.quantity,0);
  const totalCurrent  = investments.reduce((s,i)=>s+(i.currentPrice||i.buyPrice)*i.quantity,0);
  const totalGain     = totalCurrent-totalInvested;
  const totalGainPct  = totalInvested>0?(totalGain/totalInvested*100):0;
  const etfVal        = investments.filter(i=>i.type==='ETF').reduce((s,i)=>s+(i.currentPrice||i.buyPrice)*i.quantity,0);
  const azioniVal     = investments.filter(i=>i.type==='Azione').reduce((s,i)=>s+(i.currentPrice||i.buyPrice)*i.quantity,0);

  useEffect(()=>{
    if(!pieRef.current||typeof Chart==='undefined') return;
    if(pieInst.current){pieInst.current.destroy();pieInst.current=null;}
    if(investments.length===0) return;
    const data = [etfVal,azioniVal].filter(v=>v>0);
    const labels = ['ETF/Fondi','Azioni'].filter((_,i)=>[etfVal,azioniVal][i]>0);
    const colors = ['#9b8ec4cc','#d4943acc'].filter((_,i)=>[etfVal,azioniVal][i]>0);
    pieInst.current = new Chart(pieRef.current,{
      type:'doughnut',
      data:{labels,datasets:[{data,backgroundColor:colors,borderColor:'#161614',borderWidth:2}]},
      options:{responsive:true,cutout:'65%',plugins:{legend:{position:'bottom',labels:{color:'#e8e6df',font:{family:'Jost',size:11},padding:10,boxWidth:10}}}}
    });
    return()=>{if(pieInst.current){pieInst.current.destroy();pieInst.current=null;}};
  },[investments]);

  return (
    <div className="pad anim">
      {/* Summary card */}
      <div style={{background:'var(--surface)',borderRadius:16,border:'1px solid var(--border)',padding:18,marginBottom:16}}>
        <div style={{fontFamily:"'Jost',sans-serif",fontSize:11,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10}}>Portafoglio</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:3}}>Investito</div>
            <div style={{fontFamily:"'Jost',sans-serif",fontSize:22,fontWeight:700,color:'var(--text)'}}>€{totalInvested.toFixed(2)}</div>
          </div>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:3}}>Valore attuale</div>
            <div style={{fontFamily:"'Jost',sans-serif",fontSize:22,fontWeight:700,color:invColor}}>€{totalCurrent.toFixed(2)}</div>
          </div>
        </div>
        <div style={{padding:'12px 16px',borderRadius:12,
          background:totalGain>=0?'#1a142822':'#1e0a0a22',
          border:`1px solid ${totalGain>=0?invColor+'44':'#e0707044'}`,
          display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:2}}>Gain / Loss totale</div>
            <div style={{fontFamily:"'Jost',sans-serif",fontSize:26,fontWeight:700,color:totalGain>=0?invColor:'#e07070'}}>
              {totalGain>=0?'+':''}€{totalGain.toFixed(2)}
            </div>
          </div>
          <div style={{fontFamily:"'Jost',sans-serif",fontSize:20,fontWeight:700,color:totalGain>=0?invColor:'#e07070'}}>
            {totalGain>=0?'+':''}{totalGainPct.toFixed(2)}%
          </div>
        </div>
        {investments.length>0&&(
          <>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:8}}>Allocazione</div>
            <canvas ref={pieRef} style={{maxHeight:160}}/>
          </>
        )}
      </div>

      {/* Add button */}
      <button onClick={onAdd} style={{width:'100%',padding:'12px',borderRadius:12,border:`1px dashed ${invColor}`,
        background:invColor+'11',color:invColor,fontFamily:"'Jost',sans-serif",fontSize:14,cursor:'pointer',marginBottom:16}}>
        + Nuova posizione
      </button>

      {/* List */}
      {investments.length===0
        ? <div style={{color:'var(--faint)',textAlign:'center',padding:'40px 0',fontFamily:"'Jost',sans-serif",fontSize:18}}>Nessun investimento</div>
        : investments.map(inv=>{
          const current  = inv.currentPrice||inv.buyPrice;
          const invested = inv.buyPrice*inv.quantity;
          const value    = current*inv.quantity;
          const gain     = value-invested;
          const gainPct  = invested>0?(gain/invested*100):0;
          const isPos    = gain>=0;
          const lastUpd  = inv.lastUpdated?new Date(inv.lastUpdated).toLocaleDateString('it-IT',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):null;
          return (
            <div key={inv.id} style={{background:'var(--surface)',borderRadius:16,border:'1px solid var(--border)',marginBottom:10,padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                    <span style={{fontFamily:"'Jost',sans-serif",fontSize:18,fontWeight:700,color:'var(--text)'}}>{inv.ticker}</span>
                    <span style={{fontSize:10,padding:'2px 7px',borderRadius:20,border:`1px solid ${invColor}44`,color:invColor,fontFamily:"'Jost',sans-serif",flexShrink:0}}>{inv.type}</span>
                  </div>
                  {inv.name&&<div style={{fontSize:12,color:'var(--muted)',marginBottom:2}}>{inv.name}</div>}
                  <div style={{fontSize:11,color:'var(--faint)'}}>
                    {inv.quantity} pz · €{inv.buyPrice.toFixed(2)} acquisto
                    {lastUpd&&<><br/>aggiornato {lastUpd}</>}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
                  <div style={{fontFamily:"'Jost',sans-serif",fontSize:20,fontWeight:700,color:invColor}}>€{value.toFixed(2)}</div>
                  <div style={{fontFamily:"'Jost',sans-serif",fontSize:12,fontWeight:600,color:isPos?invColor:'#e07070'}}>
                    {isPos?'+':''}{gainPct.toFixed(2)}%
                  </div>
                  <div style={{fontSize:12,color:isPos?invColor:'#e07070'}}>
                    {isPos?'+':''}€{gain.toFixed(2)}
                  </div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                <button onClick={()=>onRefresh(inv)} style={{padding:'7px',borderRadius:8,border:'1px solid var(--border)',background:'var(--surface2)',color:'var(--muted)',fontFamily:"'Jost',sans-serif",fontSize:11,cursor:'pointer'}}>🔄 Live</button>
                <button onClick={()=>onEdit(inv)} style={{padding:'7px',borderRadius:8,border:`1px solid ${invColor}44`,background:invColor+'11',color:invColor,fontFamily:"'Jost',sans-serif",fontSize:11,cursor:'pointer'}}>Modifica</button>
                <button onClick={()=>onSell(inv)} style={{padding:'7px',borderRadius:8,border:'1px solid #e0707044',background:'#e0707011',color:'#e07070',fontFamily:"'Jost',sans-serif",fontSize:11,cursor:'pointer'}}>Vendi</button>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}

/* ════════════════════════════════════════
   MODAL: Investment
════════════════════════════════════════ */
function ExpInvestmentModal({inv, onSave, onDelete, onClose}){
  const invColor = '#9b8ec4';
  const isNew = !inv.id;
  const [ticker,  setTicker]  = useState(inv.ticker||'');
  const [name,    setName]    = useState(inv.name||'');
  const [type,    setType]    = useState(inv.type||'ETF');
  const [qty,     setQty]     = useState(inv.quantity?String(inv.quantity):'');
  const [buyP,    setBuyP]    = useState(inv.buyPrice?String(inv.buyPrice):'');
  const [curP,    setCurP]    = useState(inv.currentPrice?String(inv.currentPrice):'');
  const [date,    setDate]    = useState(inv.date||new Date().toISOString().slice(0,10));

  function save(){
    if(!ticker.trim()||!qty||!buyP) return;
    onSave({
      id: inv.id||uuid(),
      ticker: ticker.trim().toUpperCase(),
      name: name.trim(),
      type,
      quantity: parseFloat(qty),
      buyPrice: parseFloat(buyP),
      currentPrice: parseFloat(curP)||null,
      date: new Date(date+'T12:00:00').toISOString(),
      lastUpdated: curP ? new Date().toISOString() : null,
    });
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:200,display:'flex',alignItems:'flex-end'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'var(--surface)',borderRadius:'20px 20px 0 0',width:'100%',padding:24,paddingBottom:44,boxSizing:'border-box',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{fontFamily:"'Jost',sans-serif",fontSize:18,fontWeight:700,color:'var(--text)',marginBottom:20}}>{isNew?'Nuova posizione':'Modifica posizione'}</div>

        {/* Type toggle */}
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          {['ETF','Azione'].map(t=>(
            <button key={t} onClick={()=>setType(t)} style={{flex:1,padding:'9px',borderRadius:10,
              border:`1px solid ${type===t?invColor:'var(--border)'}`,
              background:type===t?invColor+'22':'var(--surface2)',
              color:type===t?invColor:'var(--muted)',
              fontFamily:"'Jost',sans-serif",fontSize:13,cursor:'pointer',transition:'all .2s'}}>
              {t==='ETF'?'📈 ETF / Fondo':'📊 Azione'}
            </button>
          ))}
        </div>

        <label style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:'var(--muted)'}}>Ticker (es. VWCE, AAPL)</label>
        <input className="exp-note-inp" value={ticker} onChange={e=>setTicker(e.target.value)} placeholder="VWCE"
          style={{width:'100%',boxSizing:'border-box',marginTop:6,marginBottom:10,color:'var(--text)',textTransform:'uppercase'}}/>

        <label style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:'var(--muted)'}}>Nome (opzionale)</label>
        <input className="exp-note-inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Es. Vanguard FTSE All-World"
          style={{width:'100%',boxSizing:'border-box',marginTop:6,marginBottom:10,color:'var(--text)'}}/>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
          <div>
            <label style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:'var(--muted)'}}>Quantità</label>
            <input className="exp-note-inp" type="number" value={qty} onChange={e=>setQty(e.target.value)} placeholder="10"
              style={{width:'100%',boxSizing:'border-box',marginTop:6,color:'var(--text)'}}/>
          </div>
          <div>
            <label style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:'var(--muted)'}}>Prezzo acquisto €</label>
            <input className="exp-note-inp" type="number" value={buyP} onChange={e=>setBuyP(e.target.value)} placeholder="98.50"
              style={{width:'100%',boxSizing:'border-box',marginTop:6,color:'var(--text)'}}/>
          </div>
        </div>

        <label style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:'var(--muted)'}}>Prezzo attuale € (manuale, opzionale)</label>
        <input className="exp-note-inp" type="number" value={curP} onChange={e=>setCurP(e.target.value)} placeholder="Lascia vuoto per usare live"
          style={{width:'100%',boxSizing:'border-box',marginTop:6,marginBottom:10,color:'var(--text)'}}/>

        <label style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:'var(--muted)'}}>Data acquisto</label>
        <input type="date" className="exp-note-inp" value={date} onChange={e=>setDate(e.target.value)}
          style={{width:'100%',boxSizing:'border-box',marginTop:6,marginBottom:20,color:'var(--text)'}}/>

        <div style={{display:'grid',gridTemplateColumns:isNew?'1fr':'1fr 1fr',gap:8,marginBottom:8}}>
          {!isNew&&<button onClick={()=>onDelete(inv.id)} style={{padding:12,borderRadius:12,border:'1px solid #e0707066',background:'#e0707018',color:'#e07070',fontFamily:"'Jost',sans-serif",fontWeight:600,cursor:'pointer'}}>Elimina</button>}
          <button onClick={save} style={{padding:12,borderRadius:12,border:'none',background:invColor,color:'#0b0c09',fontFamily:"'Jost',sans-serif",fontWeight:700,cursor:'pointer'}}>{isNew?'Aggiungi':'Salva'}</button>
        </div>
        <button onClick={onClose} style={{width:'100%',padding:10,borderRadius:12,border:'1px solid var(--border)',background:'transparent',color:'var(--muted)',fontFamily:"'Jost',sans-serif",cursor:'pointer'}}>Annulla</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MODAL: Sell
════════════════════════════════════════ */
function ExpSellModal({inv, onSell, onClose}){
  const invColor = '#9b8ec4';
  const [qty,   setQty]   = useState('');
  const [price, setPrice] = useState(String(inv.currentPrice||inv.buyPrice));
  const parsedQty = parseFloat(qty)||0;
  const parsedPrice = parseFloat(price)||0;
  const realizedGain = (parsedPrice - inv.buyPrice)*parsedQty;

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:200,display:'flex',alignItems:'flex-end'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'var(--surface)',borderRadius:'20px 20px 0 0',width:'100%',padding:24,paddingBottom:44,boxSizing:'border-box'}}>
        <div style={{fontFamily:"'Jost',sans-serif",fontSize:18,fontWeight:700,color:'var(--text)',marginBottom:4}}>Vendi {inv.ticker}</div>
        <div style={{fontSize:12,color:'var(--muted)',marginBottom:20}}>Hai {inv.quantity} pz · acquisto €{inv.buyPrice.toFixed(2)}</div>

        <label style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:'var(--muted)'}}>Quantità da vendere</label>
        <input className="exp-note-inp" type="number" value={qty} onChange={e=>setQty(e.target.value)} placeholder={`Max ${inv.quantity}`}
          style={{width:'100%',boxSizing:'border-box',marginTop:6,marginBottom:10,color:'var(--text)'}}/>

        <label style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:'var(--muted)'}}>Prezzo di vendita €</label>
        <input className="exp-note-inp" type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0.00"
          style={{width:'100%',boxSizing:'border-box',marginTop:6,marginBottom:16,color:'var(--text)'}}/>

        {parsedQty>0&&parsedPrice>0&&(
          <div style={{padding:'10px 14px',borderRadius:10,background:realizedGain>=0?invColor+'15':'#e0707015',
            border:`1px solid ${realizedGain>=0?invColor+'44':'#e0707044'}`,marginBottom:16,textAlign:'center'}}>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:2}}>Gain/Loss realizzato</div>
            <div style={{fontFamily:"'Jost',sans-serif",fontSize:22,fontWeight:700,color:realizedGain>=0?invColor:'#e07070'}}>
              {realizedGain>=0?'+':''}€{realizedGain.toFixed(2)}
            </div>
          </div>
        )}

        <button onClick={()=>onSell(inv,qty,price)}
          disabled={!parsedQty||parsedQty>inv.quantity||!parsedPrice}
          style={{width:'100%',padding:12,borderRadius:12,border:'none',
          background:(!parsedQty||parsedQty>inv.quantity||!parsedPrice)?'var(--faint)':'#e07070',
          color:'#0b0c09',fontFamily:"'Jost',sans-serif",fontWeight:700,cursor:'pointer',marginBottom:8}}>
          Conferma vendita
        </button>
        <button onClick={onClose} style={{width:'100%',padding:10,borderRadius:12,border:'1px solid var(--border)',background:'transparent',color:'var(--muted)',fontFamily:"'Jost',sans-serif",cursor:'pointer'}}>Annulla</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN MODULE
════════════════════════════════════════ */
function ExpensesModule({meta}){
  const ACC = meta.color;

  /* ── Navigation ── */
  const [tab,    setTab]    = useState('home');
  const [movSec, setMovSec] = useState('storico');

  /* ── Persistent data ── */
  const [expenses,  setExpenses]  = useState(()=>LS.get('ms_expenses')||[]);
  const [recurring, setRecurring] = useState(()=>LS.get('ms_expenses_recurring')||[]);
  const [accounts,  setAccounts]  = useState(()=>LS.get('ms_expenses_accounts')||EXP_DEFAULT_ACCOUNTS);
  const [budgets,   setBudgets]   = useState(()=>LS.get('ms_expenses_budgets')||{});
  const [investments, setInvestments] = useState(()=>LS.get('ms_expenses_investments')||[]);
  const [invTxns,   setInvTxns]   = useState(()=>LS.get('ms_expenses_inv_txns')||[]);
  const [customCats, setCustomCats] = useState(()=>LS.get('ms_expenses_custom_cats')||{expense:[],income:[]});

  /* ── Merged category lists ── */
  const allExpCats = useMemo(()=>[...EXPENSE_CATS,...(customCats.expense||[])],[customCats]);
  const allIncCats = useMemo(()=>[...INCOME_CATS,...(customCats.income||[])],[customCats]);

  /* ── Default account ── */
  const defaultAccId = useMemo(()=>{
    const accs = LS.get('ms_expenses_accounts')||EXP_DEFAULT_ACCOUNTS;
    return accs.find(a=>a.isDefault)?.id || accs[0]?.id || '';
  },[accounts]);

  /* ── Form state ── */
  const [fAmt,   setFAmt]   = useState('');
  const [fType,  setFType]  = useState('expense');
  const [fCat,   setFCat]   = useState('cibo');
  const [fNote,  setFNote]  = useState('');
  const [fDate,  setFDate]  = useState(()=>new Date().toISOString().slice(0,10));
  const [fAccId, setFAccId] = useState(()=>{
    const accs = LS.get('ms_expenses_accounts')||EXP_DEFAULT_ACCOUNTS;
    return accs.find(a=>a.isDefault)?.id || accs[0]?.id || '';
  });
  const [fRec,   setFRec]   = useState(false);
  const [fPer,   setFPer]   = useState('monthly');
  const [fCDays, setFCDays] = useState(30);

  /* ── UI state ── */
  const [editingAcc, setEditingAcc] = useState(null);
  const [editingRec, setEditingRec] = useState(null);
  const [expandedAcc, setExpandedAcc] = useState(null);
  const [editingInv, setEditingInv] = useState(null);
  const [sellingInv, setSellingInv] = useState(null);
  const [editingCat, setEditingCat] = useState(null); // {cat, type}
  const [showRecurring, setShowRecurring] = useState(false);

  /* ── Storico filters ── */
  const [fltMonth, setFltMonth] = useState(()=>{const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`;});
  const [fltCat,   setFltCat]   = useState('all');
  const [fltAcc,   setFltAcc]   = useState('all');

  /* ── Auto-inject recurring on mount ── */
  useEffect(()=>{
    const todayD = new Date(); todayD.setHours(23,59,59,0);
    let recs  = [...(LS.get('ms_expenses_recurring')||[])];
    let exps  = [...(LS.get('ms_expenses')||[])];
    let accs  = [...(LS.get('ms_expenses_accounts')||EXP_DEFAULT_ACCOUNTS)];
    let dirty = false;

    recs = recs.map(rec=>{
      let r = {...rec};
      let due = new Date(r.nextDue); due.setHours(0,0,0,0);
      // Inject all overdue occurrences
      while(due <= todayD){
        exps = [{
          id:uuid(), amount:r.amount, type:r.type||'expense',
          category:r.category, note:r.note||'',
          date:new Date(due).toISOString(),
          accountId:r.accountId, recurringId:r.id
        }, ...exps];
        accs = accs.map(a=>a.id===r.accountId
          ? {...a, balance: a.balance + (r.type==='income' ? r.amount : -r.amount)}
          : a);
        const nd = new Date(due);
        if(r.period==='monthly')       nd.setMonth(nd.getMonth()+1);
        else if(r.period==='yearly')   nd.setFullYear(nd.getFullYear()+1);
        else                           nd.setDate(nd.getDate()+(r.customDays||30));
        r = {...r, nextDue: nd.toISOString()};
        due = new Date(nd); due.setHours(0,0,0,0);
        dirty = true;
      }
      return r;
    });

    if(dirty){
      setExpenses(exps);  LS.set('ms_expenses',exps);
      setRecurring(recs); LS.set('ms_expenses_recurring',recs);
      setAccounts(accs);  LS.set('ms_expenses_accounts',accs);
    }
  },[]);

  /* ── Computed ── */
  const now = new Date();
  const nowMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  const monthExps = useMemo(()=>expenses.filter(e=>{
    const d=new Date(e.date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`===nowMonth;
  }),[expenses]);

  const monthOut = useMemo(()=>monthExps.filter(e=>expKind(e)==='expense').reduce((s,e)=>s+e.amount,0),[monthExps]);
  const monthIn  = useMemo(()=>monthExps.filter(e=>expKind(e)==='income').reduce((s,e)=>s+e.amount,0),[monthExps]);
  const monthBal = monthIn - monthOut;
  const totalBal = useMemo(()=>accounts.reduce((s,a)=>s+(a.balance||0),0),[accounts]);

  const filteredExps = useMemo(()=>expenses.filter(e=>{
    const d=new Date(e.date);
    const m=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    if(fltMonth&&m!==fltMonth) return false;
    if(fltCat!=='all'&&e.category!==fltCat) return false;
    if(fltAcc!=='all'&&e.accountId!==fltAcc) return false;
    return true;
  }).sort((a,b)=>new Date(b.date)-new Date(a.date)),[expenses,fltMonth,fltCat,fltAcc]);

  /* ── Helpers ── */
  function catById(id){
    return [...EXPENSE_CATS,...INCOME_CATS,...(customCats.expense||[]),...(customCats.income||[])].find(c=>c.id===id)
      || EXPENSE_CATS[EXPENSE_CATS.length-1];
  }
  function accById(id){ return accounts.find(a=>a.id===id); }

  /* ── Actions ── */
  function addExpense(){
    const amt = parseFloat(fAmt);
    if(!amt||amt<=0) return;
    const item = {
      id:uuid(), amount:amt, type:fType, category:fCat, note:fNote,
      date: new Date(fDate+'T12:00:00').toISOString(),
      accountId:fAccId, recurringId:null
    };
    const newAccs = accounts.map(a=>a.id===fAccId
      ? {...a, balance:(a.balance||0)+(fType==='income'?amt:-amt)} : a);
    const newExps = [item,...expenses];
    setExpenses(newExps);  LS.set('ms_expenses',newExps);
    setAccounts(newAccs);  LS.set('ms_expenses_accounts',newAccs);

    if(fRec){
      const rec = {
        id:uuid(), amount:amt, type:fType, category:fCat, note:fNote,
        accountId:fAccId, period:fPer,
        customDays: fPer==='custom'?parseInt(fCDays)||30:null,
        nextDue: expNextDue(fPer,fCDays,fDate),
        createdAt: new Date().toISOString()
      };
      const newRecs=[rec,...recurring];
      setRecurring(newRecs); LS.set('ms_expenses_recurring',newRecs);
    }
    setFAmt(''); setFNote(''); setFDate(new Date().toISOString().slice(0,10)); setFRec(false);
  }

  function deleteExpense(id){
    const exp = expenses.find(e=>e.id===id);
    if(exp){
      const newAccs = accounts.map(a=>a.id===exp.accountId
        ? {...a, balance:(a.balance||0)-(expKind(exp)==='income'?exp.amount:-exp.amount)} : a);
      setAccounts(newAccs); LS.set('ms_expenses_accounts',newAccs);
    }
    const next = expenses.filter(e=>e.id!==id);
    setExpenses(next); LS.set('ms_expenses',next);
  }

  function saveAccount(acc){
    const exists = accounts.find(a=>a.id===acc.id);
    let newAccs = exists ? accounts.map(a=>a.id===acc.id?acc:a) : [...accounts,acc];
    // Se questo conto è default, rimuovo default dagli altri
    if(acc.isDefault) newAccs = newAccs.map(a=>a.id===acc.id?a:{...a,isDefault:false});
    setAccounts(newAccs); LS.set('ms_expenses_accounts',newAccs);
    setEditingAcc(null);
  }

  function setDefaultAccount(id){
    const newAccs = accounts.map(a=>({...a, isDefault: a.id===id}));
    setAccounts(newAccs); LS.set('ms_expenses_accounts',newAccs);
    // Aggiorna anche il form
    setFAccId(id);
  }

  function deleteAccount(id){
    const newAccs = accounts.filter(a=>a.id!==id);
    setAccounts(newAccs); LS.set('ms_expenses_accounts',newAccs);
    setEditingAcc(null);
  }

  function saveRecurring(rec){
    const exists = recurring.find(r=>r.id===rec.id);
    const newRecs = exists ? recurring.map(r=>r.id===rec.id?rec:r) : [rec,...recurring];
    setRecurring(newRecs); LS.set('ms_expenses_recurring',newRecs);
    setEditingRec(null);
  }

  function deleteRecurring(id){
    const next = recurring.filter(r=>r.id!==id);
    setRecurring(next); LS.set('ms_expenses_recurring',next);
  }

  function saveCustomCat(cat){
    const t = cat.type; // 'expense' | 'income'
    const list = customCats[t]||[];
    const exists = list.find(c=>c.id===cat.id);
    const newList = exists ? list.map(c=>c.id===cat.id?cat:c) : [...list,cat];
    const next = {...customCats,[t]:newList};
    setCustomCats(next); LS.set('ms_expenses_custom_cats',next);
    setEditingCat(null);
  }

  function deleteCustomCat(id, type){
    const newList = (customCats[type]||[]).filter(c=>c.id!==id);
    const next = {...customCats,[type]:newList};
    setCustomCats(next); LS.set('ms_expenses_custom_cats',next);
    setEditingCat(null);
  }

  function saveInvestment(inv){
    const exists = investments.find(i=>i.id===inv.id);
    const newInvs = exists ? investments.map(i=>i.id===inv.id?inv:i) : [inv,...investments];
    setInvestments(newInvs); LS.set('ms_expenses_investments',newInvs);
    setEditingInv(null);
  }

  function deleteInvestment(id){
    const next = investments.filter(i=>i.id!==id);
    setInvestments(next); LS.set('ms_expenses_investments',next);
  }

  function sellInvestment(inv, qty, pricePerShare){
    const soldQty = parseFloat(qty);
    const soldPrice = parseFloat(pricePerShare);
    if(!soldQty||!soldPrice||soldQty>inv.quantity) return;
    const realizedGain = (soldPrice - inv.buyPrice) * soldQty;
    const txn = {id:uuid(), invId:inv.id, ticker:inv.ticker, type:'sell', qty:soldQty, price:soldPrice, realizedGain, date:new Date().toISOString()};
    const newTxns = [txn,...invTxns];
    setInvTxns(newTxns); LS.set('ms_expenses_inv_txns',newTxns);
    const remaining = inv.quantity - soldQty;
    if(remaining<=0){
      deleteInvestment(inv.id);
    } else {
      saveInvestment({...inv, quantity:remaining});
    }
    setSellingInv(null);
  }

  async function fetchLivePrice(ticker){
    try{
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`);
      const data = await res.json();
      return data?.chart?.result?.[0]?.meta?.regularMarketPrice||null;
    }catch(e){ return null; }
  }

  async function refreshPrice(inv){
    const price = await fetchLivePrice(inv.ticker);
    if(price){
      saveInvestment({...inv, currentPrice:price, lastUpdated:new Date().toISOString()});
    }
  }

  function renderExpItem(e, compact=false){
    const cat    = catById(e.category);
    const isInc  = expKind(e)==='income';
    const acc    = accById(e.accountId);
    const border = compact ? {borderBottom:'1px solid var(--border2)'} : {};
    const iconEl = cat.emoji
      ? <span style={{fontSize:18}}>{cat.emoji}</span>
      : <Icon name={cat.icon} size={18} color={cat.color}/>;
    return (
      <div className="exp-item" key={e.id} style={compact?{background:'transparent',borderRadius:0,padding:'10px 0',...border}:{}}>
        <div className="exp-item-icon" style={{background:cat.color+'20',flexShrink:0}}>
          {iconEl}
        </div>
        <div className="exp-item-info">
          <div className="exp-item-cat" style={{color:cat.color}}>{cat.name}</div>
          {e.note&&<div className="exp-item-note">{e.note}</div>}
          <div className="exp-item-date">
            {fmtDate(e.date)}
            {acc&&!compact?` · ${acc.name}`:''}
            {e.recurringId?' 🔁':''}
          </div>
        </div>
        <div style={{textAlign:'right',flexShrink:0}}>
          <div className="exp-item-amount" style={{color:isInc?ACC:'#e07070'}}>
            {isInc?'+':'−'}€{e.amount.toFixed(2)}
          </div>
        </div>
        {!compact&&<div className="exp-item-del" onClick={()=>deleteExpense(e.id)}><Icon name='close' size={12}/></div>}
      </div>
    );
  }

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  const TABS = [{id:'home',label:'Home'},{id:'movimenti',label:'Movimenti'},{id:'conti',label:'Conti'},{id:'investimenti',label:'Investimenti'}];

  return (
    <>
      <div className="screen">
        <div className="hdr">
          <div className="logo">MY<span>SPESE</span></div>
          <div className="hdr-date">{today}</div>
        </div>

        {/* Sub-nav */}
        <div className="sub-nav">
          {TABS.map(t=>(
            <button key={t.id} className={`sn-btn${tab===t.id?' act':''}`} onClick={()=>setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── HOME ── */}
        {tab==='home'&&(
          <div className="pad anim">
            <div className="greeting">Le tue<br/><span>spese</span></div>
            <div className="subhead">Traccia entrate e uscite</div>

            {/* Summary row */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
              <div style={{background:'var(--surface)',borderRadius:14,padding:'14px 16px',border:'1px solid var(--border)'}}>
                <div style={{fontFamily:"'Jost',sans-serif",fontSize:11,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>Uscite</div>
                <div style={{fontFamily:"'Jost',sans-serif",fontSize:22,fontWeight:700,color:'#e07070'}}>−€{monthOut.toFixed(2)}</div>
              </div>
              <div style={{background:'var(--surface)',borderRadius:14,padding:'14px 16px',border:'1px solid var(--border)'}}>
                <div style={{fontFamily:"'Jost',sans-serif",fontSize:11,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>Entrate</div>
                <div style={{fontFamily:"'Jost',sans-serif",fontSize:22,fontWeight:700,color:ACC}}>+€{monthIn.toFixed(2)}</div>
              </div>
            </div>
            <div className="exp-total-card" style={{marginBottom:24}}>
              <div className="exp-total-label">Bilancio mensile</div>
              <div className="exp-total-amount" style={{color:monthBal>=0?ACC:'#e07070'}}>
                {monthBal>=0?'+':''}€{monthBal.toFixed(2)}
              </div>
              <div className="exp-total-sub">
                {monthExps.length} transazioni · {monthExps.filter(e=>expKind(e)==='expense').length} uscite · {monthExps.filter(e=>expKind(e)==='income').length} entrate
              </div>
            </div>

            {/* Type toggle */}
            <div style={{display:'flex',gap:8,marginBottom:16}}>
              {['expense','income'].map(t=>(
                <button key={t} onClick={()=>setFType(t)} style={{flex:1,padding:'10px',borderRadius:10,
                  border:`1px solid ${fType===t?(t==='income'?ACC:'#e07070'):'var(--border)'}`,
                  background:fType===t?(t==='income'?ACC+'22':'#e0707022'):'var(--surface2)',
                  color:fType===t?(t==='income'?ACC:'#e07070'):'var(--muted)',
                  fontFamily:"'Jost',sans-serif",fontSize:14,cursor:'pointer',transition:'all .2s'}}>
                  {t==='expense'?'🔴 Uscita':'🟢 Entrata'}
                </button>
              ))}
            </div>

            {/* Category */}
            <div className="sec">Categoria</div>
            <div className="exp-cats">
              {(fType==='expense'?allExpCats:allIncCats).map(c=>(
                <div key={c.id} className={`exp-cat${fCat===c.id?' sel':''}`}
                  onClick={()=>setFCat(c.id)}
                  onContextMenu={e=>{e.preventDefault();c.custom&&setEditingCat({cat:c,type:fType});}}>
                  <div className="exp-cat-icon" style={fCat===c.id?{borderColor:c.color,background:c.color+'20'}:{}}>
                    {c.emoji
                      ? <span style={{fontSize:20}}>{c.emoji}</span>
                      : <Icon name={c.icon} size={20} color={fCat===c.id?c.color:'var(--muted)'}/>
                    }
                  </div>
                  <div className="exp-cat-name" style={{position:'relative'}}>
                    {c.name}
                    {c.custom&&<span style={{position:'absolute',top:-6,right:-4,fontSize:7,color:'var(--muted)'}}>✎</span>}
                  </div>
                </div>
              ))}
              {/* Crea button */}
              <div className="exp-cat" onClick={()=>setEditingCat({cat:{},type:fType})}>
                <div className="exp-cat-icon" style={{borderColor:'var(--border2)',borderStyle:'dashed'}}>
                  <span style={{fontSize:18,color:'var(--muted)'}}>＋</span>
                </div>
                <div className="exp-cat-name">Crea</div>
              </div>
            </div>

            {/* Form */}
            <div className="exp-add">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1.5fr',gap:8,marginBottom:8}}>
                <div style={{position:'relative'}}>
                  <div style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontFamily:"'Jost',sans-serif",fontSize:20,color:'var(--muted)'}}>€</div>
                  <input className="exp-amount-inp" type="number" inputMode="decimal" placeholder="0.00"
                    value={fAmt} onChange={e=>setFAmt(e.target.value)}
                    style={{paddingLeft:28,width:'100%',boxSizing:'border-box'}}
                    onKeyDown={e=>e.key==='Enter'&&addExpense()}/>
                </div>
                <input className="exp-note-inp" placeholder="Nota (opzionale)"
                  value={fNote} onChange={e=>setFNote(e.target.value)} style={{color:'var(--text)'}}
                  onKeyDown={e=>e.key==='Enter'&&addExpense()}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                <input type="date" className="exp-note-inp" value={fDate} onChange={e=>setFDate(e.target.value)} style={{color:'var(--text)'}}/>
                <select className="exp-note-inp" value={fAccId} onChange={e=>setFAccId(e.target.value)} style={{color:'var(--text)'}}>
                  {accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              {/* Recurring toggle */}
              <div onClick={()=>setFRec(!fRec)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',
                background:'var(--surface2)',borderRadius:10,cursor:'pointer',marginBottom:8,
                border:`1px solid ${fRec?ACC+'88':'var(--border)'}`,transition:'border-color .2s'}}>
                <span style={{flex:1,fontFamily:"'Jost',sans-serif",fontSize:14,color:fRec?'var(--text)':'var(--muted)'}}>
                  🔁 Ricorrente
                </span>
                <div style={{width:42,height:24,borderRadius:12,background:fRec?ACC:'var(--faint)',position:'relative',transition:'background .2s',flexShrink:0}}>
                  <div style={{position:'absolute',top:3,left:fRec?20:3,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/>
                </div>
              </div>
              {fRec&&(
                <div style={{display:'grid',gridTemplateColumns:fPer==='custom'?'1.4fr 1fr':'1fr',gap:8,marginBottom:8}}>
                  <select className="exp-note-inp" value={fPer} onChange={e=>setFPer(e.target.value)} style={{color:'var(--text)'}}>
                    <option value="monthly">Mensile</option>
                    <option value="yearly">Annuale</option>
                    <option value="custom">Personalizzata</option>
                  </select>
                  {fPer==='custom'&&(
                    <input className="exp-note-inp" type="number" placeholder="Ogni N giorni"
                      value={fCDays} onChange={e=>setFCDays(e.target.value)} style={{color:'var(--text)'}}/>
                  )}
                </div>
              )}

              <button onClick={addExpense} style={{width:'100%',padding:'13px',borderRadius:12,border:'none',
                background:fType==='income'?ACC:'#e07070',color:'#0b0c09',
                fontFamily:"'Jost',sans-serif",fontSize:15,fontWeight:700,cursor:'pointer'}}>
                {fType==='income'?'+ Aggiungi entrata':'− Aggiungi uscita'}
              </button>
            </div>

            {/* Recent */}
            <div className="sec" style={{marginTop:24}}>Ultime transazioni</div>
            {expenses.length===0
              ? <div style={{color:'var(--faint)',textAlign:'center',padding:'40px 0',fontFamily:"'Jost',sans-serif",fontSize:18}}>Nessuna transazione</div>
              : expenses.slice(0,5).map(e=>renderExpItem(e))
            }
          </div>
        )}

        {/* ── MOVIMENTI ── */}
        {tab==='movimenti'&&(
          <div className="pad anim">
            {/* Inner toggle */}
            <div style={{display:'flex',gap:4,marginBottom:20,background:'var(--surface2)',borderRadius:12,padding:4}}>
              {['storico','grafici'].map(s=>(
                <button key={s} onClick={()=>setMovSec(s)} style={{flex:1,padding:'8px',borderRadius:9,border:'none',
                  background:movSec===s?ACC:'transparent',color:movSec===s?'#0b0c09':'var(--muted)',
                  fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:600,cursor:'pointer',transition:'all .2s'}}>
                  {s==='storico'?'Storico':'Grafici'}
                </button>
              ))}
            </div>

            {/* STORICO */}
            {movSec==='storico'&&(
              <>
                {/* Ricorrenti button */}
                <button onClick={()=>setShowRecurring(v=>!v)}
                  style={{width:'100%',padding:'11px 14px',borderRadius:12,
                  border:`1px solid ${showRecurring?ACC:ACC+'44'}`,
                  background:showRecurring?ACC+'18':'var(--surface)',
                  color:showRecurring?ACC:'var(--muted)',
                  fontFamily:"'Jost',sans-serif",fontSize:13,fontWeight:600,
                  cursor:'pointer',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between',transition:'all .2s'}}>
                  <span>🔁 Spese ricorrenti ({recurring.length})</span>
                  <span style={{fontSize:10}}>{showRecurring?'▲ Chiudi':'▼ Mostra'}</span>
                </button>

                {/* Ricorrenti panel */}
                {showRecurring&&(
                  <div style={{background:'var(--surface)',borderRadius:14,border:`1px solid ${ACC}33`,
                    padding:'4px 0 8px',marginBottom:20}}>
                    <div style={{padding:'10px 14px 8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em'}}>Ricorrenti</div>
                      <button onClick={()=>setEditingRec({id:null,amount:'',type:'expense',category:'alimentari',note:'',accountId:accounts[0]?.id||'',period:'monthly',customDays:30})}
                        style={{padding:'5px 12px',borderRadius:8,border:`1px solid ${ACC}66`,background:ACC+'15',
                        color:ACC,fontFamily:"'Jost',sans-serif",fontSize:12,cursor:'pointer'}}>+ Nuova</button>
                    </div>
                    {recurring.length===0
                      ? <div style={{color:'var(--faint)',textAlign:'center',padding:'16px 0',fontFamily:"'Jost',sans-serif",fontSize:14}}>Nessuna spesa ricorrente</div>
                      : recurring.map(rec=>{
                        const cat = catById(rec.category);
                        const due = new Date(rec.nextDue);
                        const daysLeft = Math.ceil((due-new Date())/(1000*60*60*24));
                        const dueColor = daysLeft<=0?'#e07070':daysLeft<=3?'#d4943a':ACC;
                        const dueLabel = daysLeft<=0?'Scaduta':daysLeft===1?'Domani':`${daysLeft}g`;
                        return (
                          <div key={rec.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',
                            borderTop:'1px solid var(--border)'}}>
                            <div style={{width:32,height:32,borderRadius:9,background:cat.color+'20',
                              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                              {cat.emoji
                                ? <span style={{fontSize:16}}>{cat.emoji}</span>
                                : <Icon name={cat.icon} size={16} color={cat.color}/>}
                            </div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontFamily:"'Jost',sans-serif",fontSize:13,color:'var(--text)',fontWeight:500}}>
                                {rec.note||cat.name}
                              </div>
                              <div style={{fontSize:11,color:'var(--muted)'}}>
                                {rec.period==='monthly'?'Mensile':rec.period==='yearly'?'Annuale':`Ogni ${rec.customDays}g`}
                                {' · '}<span style={{color:dueColor}}>{dueLabel}</span>
                              </div>
                            </div>
                            <div style={{textAlign:'right',flexShrink:0,marginRight:6}}>
                              <div style={{fontFamily:"'Jost',sans-serif",fontWeight:700,fontSize:14,
                                color:rec.type==='income'?ACC:'#e07070'}}>
                                {rec.type==='income'?'+':'−'}€{rec.amount.toFixed(2)}
                              </div>
                            </div>
                            <button onClick={()=>setEditingRec({...rec})}
                              style={{padding:'5px 9px',borderRadius:7,border:`1px solid ${ACC}44`,
                              background:ACC+'11',color:ACC,fontFamily:"'Jost',sans-serif",fontSize:11,cursor:'pointer',flexShrink:0}}>✎</button>
                          </div>
                        );
                      })
                    }
                  </div>
                )}

                {/* Filters */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:14}}>
                  <select className="exp-note-inp" value={fltMonth} onChange={e=>setFltMonth(e.target.value)}
                    style={{color:'var(--text)',fontSize:12,padding:'8px 6px'}}>
                    <option value="">Tutti</option>
                    {Array.from({length:13},(_,i)=>{
                      const d=new Date(); d.setMonth(d.getMonth()-i);
                      const val=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
                      return <option key={val} value={val}>{d.toLocaleDateString('it-IT',{month:'short',year:'2-digit'})}</option>;
                    })}
                  </select>
                  <select className="exp-note-inp" value={fltCat} onChange={e=>setFltCat(e.target.value)}
                    style={{color:'var(--text)',fontSize:12,padding:'8px 6px'}}>
                    <option value="all">Cat.</option>
                    {[...allExpCats,...allIncCats].map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select className="exp-note-inp" value={fltAcc} onChange={e=>setFltAcc(e.target.value)}
                    style={{color:'var(--text)',fontSize:12,padding:'8px 6px'}}>
                    <option value="all">Conto</option>
                    {accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:'var(--muted)',marginBottom:12}}>
                  {filteredExps.length} transazioni
                </div>
                {filteredExps.length===0
                  ? <div style={{color:'var(--faint)',textAlign:'center',padding:'40px 0',fontFamily:"'Jost',sans-serif",fontSize:18}}>Nessuna transazione</div>
                  : filteredExps.map(e=>renderExpItem(e))
                }
              </>
            )}

            {/* GRAFICI */}
            {movSec==='grafici'&&(
              <ExpGrafici expenses={expenses} ACC={ACC} expCats={allExpCats}/>
            )}
          </div>
        )}

        {/* ── CONTI ── */}
        {tab==='conti'&&(
          <div className="pad anim">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div>
                <div style={{fontFamily:"'Jost',sans-serif",fontSize:12,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Liquidità totale</div>
                <div style={{fontFamily:"'Jost',sans-serif",fontSize:30,fontWeight:700,color:totalBal>=0?ACC:'#e07070',marginTop:4}}>
                  {totalBal>=0?'+':''}€{totalBal.toFixed(2)}
                </div>
              </div>
              <button onClick={()=>setEditingAcc({id:null,name:'',balance:0,color:ACC,isDefault:false})}
                style={{padding:'8px 14px',borderRadius:10,border:`1px dashed ${ACC}`,
                background:ACC+'11',color:ACC,fontFamily:"'Jost',sans-serif",fontSize:13,cursor:'pointer'}}>
                + Conto
              </button>
            </div>

            {accounts.map(acc=>{
              const accMoves = expenses.filter(e=>e.accountId===acc.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
              const isExp = expandedAcc===acc.id;
              const isDef = !!acc.isDefault;
              return (
                <div key={acc.id} style={{background:'var(--surface)',borderRadius:16,border:`1px solid ${isDef?acc.color+'66':'var(--border)'}`,marginBottom:12,overflow:'hidden'}}>
                  <div style={{padding:16}}>
                    {/* Header row: dot+name+badge | buttons */}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0}}>
                        <div style={{width:10,height:10,borderRadius:'50%',background:acc.color,flexShrink:0}}/>
                        <div style={{fontFamily:"'Jost',sans-serif",fontSize:16,fontWeight:600,color:'var(--text)',
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{acc.name}</div>
                        {isDef&&<span style={{fontSize:10,padding:'2px 7px',borderRadius:20,flexShrink:0,
                          border:`1px solid ${acc.color}`,color:acc.color,fontFamily:"'Jost',sans-serif"}}>default</span>}
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end',flexShrink:0,marginLeft:10}}>
                        <button onClick={()=>setEditingAcc({...acc})}
                          style={{padding:'6px 14px',borderRadius:8,border:`1px solid ${acc.color}44`,
                          background:acc.color+'11',color:acc.color,fontFamily:"'Jost',sans-serif",fontSize:12,cursor:'pointer',whiteSpace:'nowrap'}}>
                          Modifica
                        </button>
                        <button onClick={()=>setDefaultAccount(acc.id)}
                          style={{padding:'5px 14px',borderRadius:8,border:`1px solid ${isDef?acc.color:'var(--border)'}`,
                          background:isDef?acc.color+'22':'var(--surface2)',color:isDef?acc.color:'var(--muted)',
                          fontFamily:"'Jost',sans-serif",fontSize:12,cursor:'pointer',whiteSpace:'nowrap'}}>
                          {isDef?'⭐ Default':'☆ Default'}
                        </button>
                      </div>
                    </div>
                    {/* Balance: full width, no competition */}
                    <div style={{fontFamily:"'Jost',sans-serif",fontSize:30,fontWeight:700,lineHeight:1.1,
                      color:(acc.balance||0)>=0?acc.color:'#e07070',paddingLeft:18,marginBottom:12,
                      wordBreak:'break-word'}}>
                      {(acc.balance||0)>=0?'+':''}€{(acc.balance||0).toFixed(2)}
                    </div>
                    <button onClick={()=>setExpandedAcc(isExp?null:acc.id)}
                      style={{marginTop:12,width:'100%',padding:'8px',borderRadius:8,
                      border:'1px solid var(--border)',background:'var(--surface2)',
                      color:'var(--muted)',fontFamily:"'Jost',sans-serif",fontSize:12,cursor:'pointer'}}>
                      {isExp?'▲ Nascondi movimenti':'▼ Mostra movimenti'} ({accMoves.length})
                    </button>
                  </div>
                  {isExp&&(
                    <div style={{borderTop:'1px solid var(--border)',padding:'0 16px 8px',maxHeight:320,overflowY:'auto'}}>
                      {accMoves.length===0
                        ? <div style={{color:'var(--faint)',textAlign:'center',padding:20,fontFamily:"'Jost',sans-serif",fontSize:14}}>Nessun movimento</div>
                        : accMoves.slice(0,50).map(e=>renderExpItem(e,true))
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {/* ── INVESTIMENTI ── */}
        {tab==='investimenti'&&(
          <ExpInvestimenti
            investments={investments}
            onAdd={()=>setEditingInv({id:null,ticker:'',name:'',type:'ETF',quantity:'',buyPrice:'',currentPrice:'',date:new Date().toISOString().slice(0,10)})}
            onEdit={inv=>setEditingInv({...inv,quantity:String(inv.quantity),buyPrice:String(inv.buyPrice),currentPrice:String(inv.currentPrice||''),date:inv.date?.slice(0,10)||new Date().toISOString().slice(0,10)})}
            onSell={inv=>setSellingInv({...inv,sellQty:'',sellPrice:String(inv.currentPrice||inv.buyPrice)})}
            onRefresh={refreshPrice}
          />
        )}
      </div>

      {editingAcc&&(
        <ExpAccountModal acc={editingAcc} onSave={saveAccount} onDelete={deleteAccount} onClose={()=>setEditingAcc(null)} ACC={ACC}/>
      )}
      {editingRec&&(
        <ExpRecurringModal rec={editingRec} accounts={accounts} onSave={saveRecurring} onClose={()=>setEditingRec(null)} ACC={ACC}/>
      )}
      {editingInv&&(
        <ExpInvestmentModal inv={editingInv} onSave={saveInvestment} onDelete={deleteInvestment} onClose={()=>setEditingInv(null)}/>
      )}
      {sellingInv&&(
        <ExpSellModal inv={sellingInv} onSell={sellInvestment} onClose={()=>setSellingInv(null)}/>
      )}
      {editingCat&&(
        <ExpCatModal
          cat={editingCat.cat}
          type={editingCat.type}
          onSave={saveCustomCat}
          onDelete={id=>deleteCustomCat(id,editingCat.type)}
          onClose={()=>setEditingCat(null)}
        />
      )}
    </>
  );
}
