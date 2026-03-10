/* ═══════════════════════════════════════════
   MODULE: EXPENSES
═══════════════════════════════════════════ */
function ExpensesModule({meta}){
  /* ── Expenses state ── */
  const [expenses,setExpenses]=useState(()=>LS.get('ms_expenses')||[]);
  const [expCat,setExpCat]=useState('cibo');
  const [expAmount,setExpAmount]=useState('');
  const [expNote,setExpNote]=useState('');


  /* ── Expense functions ── */
  function addExpense(){
    const amount=parseFloat(expAmount);if(!amount||amount<=0)return;
    const item={id:uuid(),amount,category:expCat,note:expNote,date:new Date().toISOString()};
    const next=[item,...expenses];setExpenses(next);LS.set('ms_expenses',next);
    setExpAmount('');setExpNote('');
  }
  function deleteExpense(id){
    const next=expenses.filter(e=>e.id!==id);setExpenses(next);LS.set('ms_expenses',next);
  }
  const monthTotal=useMemo(()=>{
    const now=new Date();
    return expenses.filter(e=>{const d=new Date(e.date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();})
      .reduce((s,e)=>s+e.amount,0);
  },[expenses]);


  return(
    <>
          <div className="screen">
            <div className="hdr">
              <div className="logo">MY<span>SPESE</span></div>
              <div className="hdr-date">{today}</div>
            </div>
            <div className="pad anim">
              <div className="greeting">Le tue<br/><span>spese</span></div>
              <div className="subhead">Traccia le uscite mensili</div>
              <div className="exp-total-card">
                <div className="exp-total-label">Speso questo mese</div>
                <div className="exp-total-amount">€{monthTotal.toFixed(2)}</div>
                <div className="exp-total-sub">{expenses.filter(e=>{const d=new Date(e.date);const n=new Date();return d.getMonth()===n.getMonth()}).length} transazioni</div>
              </div>
              <div className="sec">Categoria</div>
              <div className="exp-cats">
                {EXPENSE_CATS.map(c=>(
                  <div key={c.id} className={`exp-cat${expCat===c.id?' sel':''}`} onClick={()=>setExpCat(c.id)}>
                    <div className="exp-cat-icon" style={expCat===c.id?{borderColor:c.color,background:c.color+'20'}:{}}><Icon name={c.icon} size={20} color={expCat===c.id?c.color:'var(--muted)'}/></div>
                    <div className="exp-cat-name">{c.name}</div>
                  </div>
                ))}
              </div>
              <div className="exp-add">
                <div className="exp-add-row">
                  <div style={{position:'relative',flex:1}}>
                    <div style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontFamily:"'Jost',sans-serif",fontSize:20,fontWeight:400,color:'var(--muted)'}}>€</div>
                    <input className="exp-amount-inp" style={{paddingLeft:28}} type="number" inputMode="decimal" placeholder="0.00" value={expAmount} onChange={e=>setExpAmount(e.target.value)}/>
                  </div>
                  <input className="exp-note-inp" placeholder="Nota (opzionale)" value={expNote} onChange={e=>setExpNote(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addExpense()}/>
                  <button className="exp-submit" style={{background:meta.color}} onClick={addExpense}>+</button>
                </div>
              </div>
              <div className="sec">Transazioni recenti</div>
              {expenses.length===0&&<div style={{color:'var(--faint)',textAlign:'center',padding:'40px 0',fontFamily:"'Jost',sans-serif",fontSize:18}}>Nessuna spesa registrata</div>}
              {expenses.map(e=>{
                const cat=EXPENSE_CATS.find(c=>c.id===e.category)||EXPENSE_CATS[5];
                return(
                  <div className="exp-item" key={e.id}>
                    <div className="exp-item-icon" style={{background:cat.color+'20'}}><Icon name={cat.icon} size={18} color={cat.color}/></div>
                    <div className="exp-item-info">
                      <div className="exp-item-cat" style={{color:cat.color}}>{cat.name}</div>
                      {e.note&&<div className="exp-item-note">{e.note}</div>}
                      <div className="exp-item-date">{fmtDate(e.date)}</div>
                    </div>
                    <div>
                      <div className="exp-item-amount" style={{color:meta.color}}>€{e.amount.toFixed(2)}</div>
                    </div>
                    <div className="exp-item-del" onClick={()=>deleteExpense(e.id)}><Icon name='close' size={12}/></div>
                  </div>
                );
              })}
            </div>
          </div>
        </>}
    </>
  );
}
