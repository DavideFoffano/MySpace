/* ═══════════════════════════════════════════
   DASHBOARD MODULE — sync + hub
═══════════════════════════════════════════ */

function DashSyncCard(){
  const cfg=LS.get('ms_supa');
  const isConfigured=!!(cfg&&cfg.url&&cfg.key);

  const [syncStatus,setSyncStatus]=useState(null); // null | 'syncing' | 'ok' | 'error'
  const [lastSync,setLastSync]=useState(LS.get('ms_last_sync'));
  const [showConfig,setShowConfig]=useState(!isConfigured);
  const [supaUrl,setSupaUrl]=useState(cfg&&cfg.url?cfg.url:'');
  const [supaKey,setSupaKey]=useState(cfg&&cfg.key?cfg.key:'');
  const [configured,setConfigured]=useState(isConfigured);
  const [statusMsg,setStatusMsg]=useState('');

  function saveConfig(){
    if(!supaUrl.trim()||!supaKey.trim()) return;
    LS.set('ms_supa',{url:supaUrl.trim(),key:supaKey.trim()});
    resetSupaClient();
    setConfigured(true);
    setShowConfig(false);
  }

  function fmtSync(iso){
    if(!iso) return null;
    var d=new Date(iso);
    return d.toLocaleDateString('it-IT',{day:'2-digit',month:'short'})+
           ' '+d.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
  }

  async function handleUp(){
    setSyncStatus('syncing');
    setStatusMsg('');
    var r=await syncAllUp();
    if(r.ok){
      setLastSync(r.at);
      setSyncStatus('ok');
      setStatusMsg('Dati caricati su Supabase');
    } else {
      setSyncStatus('error');
      setStatusMsg(r.err==='not_configured'?'Supabase non configurato':'Errore di connessione');
    }
  }

  async function handleDown(){
    setSyncStatus('syncing');
    setStatusMsg('');
    var r=await syncAllDown();
    if(r.ok){
      if(r.fresh){
        setLastSync(LS.get('ms_last_sync'));
        setSyncStatus('ok');
        setStatusMsg('Dati scaricati — ricarico...');
        setTimeout(function(){window.location.reload();},900);
      } else {
        setSyncStatus('ok');
        setStatusMsg('Già aggiornato');
      }
    } else {
      setSyncStatus('error');
      if(r.err==='not_configured') setStatusMsg('Supabase non configurato');
      else if(r.err==='no_data') setStatusMsg('Nessun dato remoto trovato');
      else setStatusMsg('Errore di connessione');
    }
  }

  var syncing=syncStatus==='syncing';

  return (
    <div className="card" style={{padding:'20px',marginBottom:'16px'}}>

      {/* Header card */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
        <span style={{fontWeight:500,fontSize:'15px',letterSpacing:'0.04em'}}>Sincronizzazione</span>
        <span style={{
          fontSize:'11px',padding:'3px 10px',borderRadius:'20px',fontWeight:500,letterSpacing:'0.05em',
          background:configured?'rgba(122,186,122,0.12)':'rgba(107,106,94,0.15)',
          color:configured?'#7aba7a':'var(--muted)',
          border:configured?'1px solid rgba(122,186,122,0.25)':'1px solid var(--border2)'
        }}>
          {configured?'● ATTIVO':'○ NON CONFIGURATO'}
        </span>
      </div>

      {/* Ultimo sync */}
      {lastSync&&(
        <p style={{fontSize:'12px',color:'var(--muted)',marginBottom:'16px'}}>
          Ultimo sync: <span style={{color:'var(--text)'}}>{fmtSync(lastSync)}</span>
        </p>
      )}

      {/* Bottoni sync */}
      {configured&&(
        <div style={{display:'flex',gap:'10px',marginBottom:'12px'}}>
          <button
            onClick={handleUp}
            disabled={syncing}
            style={{
              flex:1,padding:'11px 0',borderRadius:'10px',border:'none',cursor:syncing?'default':'pointer',
              background:'linear-gradient(145deg,var(--acc),color-mix(in srgb,var(--acc) 70%,#000))',
              color:'#0b0c09',fontWeight:600,fontSize:'13px',letterSpacing:'0.08em',
              opacity:syncing?0.6:1
            }}>
            {syncing?'..':'☁ Carica'}
          </button>
          <button
            onClick={handleDown}
            disabled={syncing}
            style={{
              flex:1,padding:'11px 0',borderRadius:'10px',cursor:syncing?'default':'pointer',
              background:'var(--surface2)',color:'var(--text)',
              border:'1px solid var(--border2)',fontWeight:500,fontSize:'13px',letterSpacing:'0.06em',
              opacity:syncing?0.6:1
            }}>
            {syncing?'..':'↓ Scarica'}
          </button>
        </div>
      )}

      {/* Status message */}
      {statusMsg&&(
        <p style={{
          fontSize:'12px',textAlign:'center',marginBottom:'8px',
          color:syncStatus==='ok'?'#7aba7a':syncStatus==='error'?'#d45a5a':'var(--muted)'
        }}>
          {syncStatus==='ok'?'✓ ':syncStatus==='error'?'✕ ':''}{statusMsg}
        </p>
      )}

      {/* Toggle config */}
      <button
        onClick={function(){setShowConfig(!showConfig);}}
        style={{
          background:'none',border:'none',color:'var(--muted)',
          fontSize:'12px',padding:'6px 0 0',cursor:'pointer',display:'block',letterSpacing:'0.04em'
        }}>
        {showConfig?'▲ Chiudi':'⚙ Configura Supabase'}
      </button>

      {/* Config form */}
      {showConfig&&(
        <div style={{marginTop:'14px',display:'flex',flexDirection:'column',gap:'8px'}}>
          <p style={{fontSize:'11px',color:'var(--muted)',lineHeight:'1.5',marginBottom:'4px'}}>
            Inserisci le credenziali dal tuo progetto Supabase (Impostazioni → API).
            Crea la tabella <code style={{color:'var(--acc)',fontSize:'11px'}}>ms_sync_data</code> con colonne{' '}
            <code style={{fontSize:'11px'}}>user_id text PK, data jsonb, updated_at timestamptz</code>.
          </p>
          <input
            className="m-inp"
            placeholder="Project URL  (https://xxx.supabase.co)"
            value={supaUrl}
            onChange={function(e){setSupaUrl(e.target.value);}}
            style={{fontSize:'13px'}}
          />
          <input
            className="m-inp"
            placeholder="Anon / public key"
            value={supaKey}
            onChange={function(e){setSupaKey(e.target.value);}}
            type="password"
            style={{fontSize:'13px'}}
          />
          <button
            onClick={saveConfig}
            style={{
              padding:'11px',borderRadius:'10px',border:'none',cursor:'pointer',
              background:'linear-gradient(145deg,var(--acc),color-mix(in srgb,var(--acc) 70%,#000))',
              color:'#0b0c09',fontWeight:600,fontSize:'13px',letterSpacing:'0.08em'
            }}>
            Salva configurazione
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Info card: istruzioni SQL ── */
function DashSqlCard(){
  const [open,setOpen]=useState(false);
  const sql=`create table ms_sync_data (\n  user_id text primary key,\n  data jsonb,\n  updated_at timestamptz default now()\n);`;
  return (
    <div className="card" style={{padding:'20px',marginBottom:'16px'}}>
      <button
        onClick={function(){setOpen(!open);}}
        style={{
          background:'none',border:'none',color:'var(--muted)',
          fontSize:'13px',cursor:'pointer',display:'flex',alignItems:'center',gap:'8px',
          width:'100%',textAlign:'left',padding:0
        }}>
        <Icon name="nav_sett" size={14} color="var(--muted)"/>
        <span>Setup tabella Supabase</span>
        <span style={{marginLeft:'auto'}}>{open?'▲':'▼'}</span>
      </button>
      {open&&(
        <pre style={{
          marginTop:'14px',padding:'12px',borderRadius:'8px',
          background:'var(--surface2)',border:'1px solid var(--border2)',
          fontSize:'11px',color:'var(--text)',lineHeight:'1.6',
          overflowX:'auto',whiteSpace:'pre'
        }}>{sql}</pre>
      )}
    </div>
  );
}

/* ── Modulo principale ── */
function DashboardModule(){
  return (
    <div className="screen">
      <div className="hdr">
        <p className="greeting">LA TUA <span>HOME</span></p>
        <p className="subhead">Sincronizzazione tra dispositivi</p>
      </div>
      <div style={{padding:'0 16px 32px'}}>
        <DashSyncCard/>
        <DashSqlCard/>
      </div>
    </div>
  );
}
