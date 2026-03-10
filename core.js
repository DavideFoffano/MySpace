const {useState,useEffect,useRef,useCallback,useMemo} = React;

/* ═══════════════════════════════════════════
   MODULE COLORS
═══════════════════════════════════════════ */
const MODULE_META = {
  todo:     { label:'To-Do',   icon:'todo',     color:'#6aadcf', bg:'#161614', border:'#252521', surface:'#111110' },
  gym:      { label:'Workout', icon:'gym',      color:'#d4943a', bg:'#1a1208', border:'#2e1e08', surface:'#120d05' },
  expenses: { label:'Spese',   icon:'expenses', color:'#7aba7a', bg:'#161614', border:'#252521', surface:'#111110' },
  notes:    { label:'Note',    icon:'notes',    color:'#d4c9a8', bg:'#1a1810', border:'#2e2c1e', surface:'#120f08' },
};

// Per-module CSS variable overrides — subtle tint of each accent on bg/surface/border
const MODULE_THEME = {
  todo:     { '--bg':'#111110', '--surface':'#161614', '--surface2':'#1e1e1b', '--border':'#252521', '--border2':'#2e2e2a' },
  gym:      { '--bg':'#161614', '--surface':'#1e1e1b', '--surface2':'#252521', '--border':'#35342f', '--border2':'#3f3e38' },
  expenses: { '--bg':'#111110', '--surface':'#161614', '--surface2':'#1e1e1b', '--border':'#252521', '--border2':'#2e2e2a' },
  notes:    { '--bg':'#161614', '--surface':'#1e1e1b', '--surface2':'#252521', '--border':'#35342f', '--border2':'#3f3e38' },
};


/* ═══════════════════════════════════════════
   ICON SYSTEM
═══════════════════════════════════════════ */
const PATHS = {
  // ── Module nav ──
  todo:      "M9 11l3 3 5-6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z",
  gym:       "M3 9h4v6H3zM17 9h4v6h-4zM7 12h10M7 10v4M17 10v4",
  expenses:  "M21 6H3a1 1 0 00-1 1v10a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zM2 11h20M17 15a2 2 0 100-4h-3v4h3z",
  notes:     "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M8 13h8M8 17h5",
  // ── Gym sub-nav ──
  nav_home:  "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
  nav_cards: "M4 6h16M4 10h16M4 14h10",
  nav_hist:  "M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 3",
  nav_chart: "M3 18l4-7 4 4 5-8 5 6",
  nav_sett:  "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06-.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  // ── Notes sub-nav ──
  nav_notes: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M8 13h8M8 17h5",
  nav_shop:  "M1 1h4l2.68 13.39a2 2 0 001.94 1.61h9.72a2 2 0 001.94-1.61L23 6H6M10 21a1 1 0 100 2 1 1 0 000-2zM21 21a1 1 0 100 2 1 1 0 000-2z",
  nav_travel:"M12 2c-1.5 0-2 1-2 2v6L4 14v2l6-1.5v4l-2 1.5v1l4-1.5 4 1.5v-1l-2-1.5v-4L20 16v-2l-6-4V4c0-1-.5-2-2-2z",
  // ── Expense categories ──
  cat_food:  "M5 8a7 7 0 0114 0H5zM4 8h16v3H4zM4 11h16l-1.5 5a1 1 0 01-1 .8H6.5a1 1 0 01-1-.8L4 11z",
  cat_sport: "M3 9h4v6H3zM17 9h4v6h-4zM7 12h10M7 10v4M17 10v4",
  cat_car:   "M2 13L2 11L4 8L8 6.5L16 6.5L20 8L22 11L22 13Q22 12 19.5 12Q17 12 17 13L7 13Q7 12 4.5 12Q2 12 2 13ZM7.5 9L9 7L12.5 7L12.5 10L7.5 10ZM13.5 10L13.5 7L16.5 7L18.5 10ZM5 16a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M7.5 16h.01M14 16a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M16.5 16h.01",
  cat_fun:   "M6 11h4m-2-2v4M15 12h.01M17 12h.01M4 8h16a2 2 0 012 2v5a2 2 0 01-2 2H4a2 2 0 01-2-2v-5a2 2 0 012-2z",
  cat_house: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
  cat_other: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12l8.73-5.04M12 22.08V12",
  // ── Travel templates ──
  t_beach:   "M2 13h20M7 13a5 5 0 0110 0M12 5v2M5.6 7.6l1.4 1.4M18.4 7.6l-1.4 1.4M3 11h2M21 11h-2M2 17c3-2 5 2 8 0s5-2 8 0M2 20c3-2 5 2 8 0s5-2 8 0",
  t_mountain:"M3 20l5-10 4 5 3-5 6 10H3z",
  t_city:    "M3 21V9l6-4v16M3 9h6M15 21V5l6-4v20M15 5h6M9 21v-5h6v5M9 9h.01M9 13h.01M15 9h.01M15 13h.01",
  t_business:"M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M2 13h20",
  t_plane:   "M12 2c-1.5 0-2 1-2 2v6L4 14v2l6-1.5v4l-2 1.5v1l4-1.5 4 1.5v-1l-2-1.5v-4L20 16v-2l-6-4V4c0-1-.5-2-2-2z",
  t_weekend: "M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z",
  nav_cali:  "M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8M4 12c0 2.5 1.2 4.8 3 6.2M20 12c0 2.5-1.2 4.8-3 6.2M12 4v2M12 18v2M8 12h8M12 8l2 4-2 4",
  // ── UI actions ──
  trophy:    "M8 2h8M8 2v6a4 4 0 008 0V2M6 2H4v3a4 4 0 002.5 3.7M18 2h2v3a4 4 0 01-2.5 3.7M12 14v4M9 21h6M10 18h4",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  pin:       "M12 2a7 7 0 017 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 017-7zM12 9h.01",
  search:    "M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z",
  close:     "M18 6L6 18M6 6l12 12",
  back_arr:  "M19 12H5m0 0l7 7m-7-7l7-7",
  check_ic:  "M20 6L9 17l-5-5",
  plus_ic:   "M12 5v14M5 12h14",
};

function Icon({name, size=20, color='currentColor', sw=1.5, style={}}) {
  const d = PATHS[name];
  if(!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round"
      style={{flexShrink:0,...style}}>
      <path d={d}/>
    </svg>
  );
}

/* ═══════════════════════════════════════════
   GYM DATA
═══════════════════════════════════════════ */
const WORKOUTS_DEFAULT = [
  {id:"w1",name:"Allenamento 1",subtitle:"Full Body",color:"#d4943a",exercises:[
    {id:"w1e1",name:"Panca piana manubri",serie:4,reps:11,peso:16},
    {id:"w1e2",name:"Tirate ai cavi bassi",serie:4,reps:15,peso:3},
    {id:"w1e3",name:"Lat machine",serie:4,reps:10,peso:34},
    {id:"w1e4",name:"Pulley",serie:4,reps:14,peso:32},
    {id:"w1e5",name:"Lento avanti",serie:4,reps:8,peso:14},
    {id:"w1e6",name:"Alzate laterali",serie:4,reps:13,peso:8},
    {id:"w1e7",name:"Curl intrarotazione",serie:4,reps:11,peso:8},
    {id:"w1e8",name:"Curl a martello",serie:4,reps:11,peso:8},
  ]},
  {id:"w2",name:"Allenamento 2",subtitle:"Full Body",color:"#c47c28",exercises:[
    {id:"w2e1",name:"Panca stretta manubri",serie:4,reps:9,peso:16},
    {id:"w2e2",name:"Croci",serie:4,reps:11,peso:10},
    {id:"w2e3",name:"Chin up assistiti",serie:4,reps:9,peso:null},
    {id:"w2e4",name:"Rematore su panca inclinata",serie:4,reps:10,peso:16},
    {id:"w2e5",name:"Alzate laterali",serie:4,reps:12,peso:8},
    {id:"w2e6",name:"Alzate frontali / martello",serie:4,reps:13,peso:6},
    {id:"w2e7",name:"Curl panca inclinata",serie:4,reps:10,peso:6},
    {id:"w2e8",name:"Curl a martello",serie:4,reps:8,peso:8},
  ]},
  {id:"w3",name:"Allenamento 3",subtitle:"Full Body",color:"#e8a845",exercises:[
    {id:"w3e1",name:"Push up",serie:4,reps:10,peso:null},
    {id:"w3e2",name:"Croci",serie:4,reps:15,peso:10},
    {id:"w3e3",name:"Pull up assistiti",serie:4,reps:9,peso:null},
    {id:"w3e4",name:"Croci inverse manubri",serie:4,reps:15,peso:8},
    {id:"w3e5",name:"Lento avanti",serie:4,reps:10,peso:13},
    {id:"w3e6",name:"Alzate laterali ai cavi",serie:4,reps:13,peso:3},
    {id:"w3e7",name:"Curl ai cavi",serie:4,reps:13,peso:14},
    {id:"w3e8",name:"Curl a martello ai cavi",serie:4,reps:11,peso:12},
  ]},
  {id:"w4",name:"Leg Day",subtitle:"Gambe · Glutei · Core",color:"#b8722a",exercises:[
    {id:"w4e1",name:"Squat",serie:4,reps:12,peso:null},
    {id:"w4e2",name:"Stacchi",serie:4,reps:12,peso:null},
    {id:"w4e3",name:"Affondi manubri",serie:4,reps:12,peso:null},
    {id:"w4e4",name:"Hiptrust",serie:4,reps:12,peso:null},
    {id:"w4e5",name:"Calf machine",serie:4,reps:12,peso:60},
    {id:"w4e6",name:"Elevazioni gambe parallele",serie:4,reps:15,peso:null},
    {id:"w4e7",name:"Plank",serie:4,reps:12,peso:null},
    {id:"w4e8",name:"Crunch",serie:4,reps:12,peso:null},
  ]},
  {id:"w5",name:"Extra",subtitle:"Allenamento Supplementare",color:"#dba042",exercises:[
    {id:"w5e1",name:"Panca piana bilancere",serie:4,reps:11,peso:30},
    {id:"w5e2",name:"Push up",serie:4,reps:12,peso:null},
    {id:"w5e3",name:"Lat machine presa neutra",serie:4,reps:11,peso:45},
    {id:"w5e4",name:"Pulldown cavi braccia dritte",serie:4,reps:9,peso:12.5},
    {id:"w5e5",name:"Alzate laterali ai cavi",serie:4,reps:16,peso:5},
    {id:"w5e6",name:"Alzate frontali martello cavo",serie:4,reps:15,peso:5},
    {id:"w5e7",name:"Curl intrarotazione",serie:4,reps:11,peso:10},
    {id:"w5e8",name:"Dip",serie:4,reps:11,peso:null},
  ]},
];

const WORKOUT_COLORS = ['#d4943a','#b8732a','#c89030','#8a7055','#706050','#a08060','#c4a060','#907060'];

/* ═══════════════════════════════════════════
   CALISTENIA SKILL TREE
═══════════════════════════════════════════ */
const CALI_SKILLS = [
  {
    id:'front_lever', name:'Front Lever', emoji:'🔱',
    color:'#d4943a', desc:'Elemento di forza in sospensione alla sbarra',
    steps:[
      {id:'fl_1', name:'Hang passivo',        desc:'Appenditi alla sbarra a presa prona e tieni 30 secondi con spalle attivate.',           tag:'30s hold',   prereqs:[]},
      {id:'fl_2', name:'Tuck front lever',    desc:'Corpo raggruppato (ginocchia al petto), schiena parallela al suolo. 5 secondi.',        tag:'5s hold',    prereqs:['fl_1']},
      {id:'fl_3', name:'Advanced tuck',       desc:'Gambe semi-estese, fianchi a 90°. Schiena piatta. Tieni 5 secondi.',                   tag:'5s hold',    prereqs:['fl_2']},
      {id:'fl_4', name:'One leg',             desc:'Una gamba completamente tesa, l\'altra raggruppata. Alterna e tieni 5s per lato.',      tag:'5s per lato',prereqs:['fl_3']},
      {id:'fl_5', name:'Straddle',            desc:'Entrambe le gambe tese e divaricate. Corpo parallelo al suolo. 5 secondi.',             tag:'5s hold',    prereqs:['fl_4']},
      {id:'fl_6', name:'Full front lever',    desc:'Corpo completamente teso e parallelo al suolo. L\'obiettivo finale.',                   tag:'5s hold',    prereqs:['fl_5']},
    ]
  },
  {
    id:'planche', name:'Planche', emoji:'⚡',
    color:'#d4943a', desc:'Elemento di spinta in equilibrio orizzontale',
    steps:[
      {id:'pl_1', name:'Planche lean',        desc:'Plank sulle mani con spalle ben avanti rispetto ai polsi. Tieni 20 secondi.',          tag:'20s hold',   prereqs:[]},
      {id:'pl_2', name:'Tuck planche',        desc:'Corpo sollevato con ginocchia al petto, schiena parallela. 5 secondi.',                tag:'5s hold',    prereqs:['pl_1']},
      {id:'pl_3', name:'Advanced tuck',       desc:'Schiena piatta, anche alte, ginocchia leggermente distese. 5 secondi.',                tag:'5s hold',    prereqs:['pl_2']},
      {id:'pl_4', name:'Straddle planche',    desc:'Gambe divaricate e completamente tese, corpo orizzontale. 5 secondi.',                 tag:'5s hold',    prereqs:['pl_3']},
      {id:'pl_5', name:'Half lay',            desc:'Una gamba tesa in asse, l\'altra divaricata. Transizione verso la planche piena.',     tag:'5s hold',    prereqs:['pl_4']},
      {id:'pl_6', name:'Full planche',        desc:'Corpo completamente teso e orizzontale. Pura forza di spinta.',                        tag:'5s hold',    prereqs:['pl_5']},
    ]
  },
  {
    id:'muscle_up', name:'Muscle-Up', emoji:'💪',
    color:'#d4943a', desc:'Transizione esplosiva dalla sbarra ai paralleli',
    steps:[
      {id:'mu_1', name:'Pull-up solido',      desc:'10 pull-up puliti con ROM completo, grip prono. Nessuno slancio.',                     tag:'10 reps',    prereqs:[]},
      {id:'mu_2', name:'Dip solido',          desc:'15 dip alle parallele con ROM completo. Base di spinta necessaria.',                   tag:'15 reps',    prereqs:['mu_1']},
      {id:'mu_3', name:'Chest-to-bar',        desc:'Pull-up dove il petto tocca la sbarra ad ogni ripetizione. 5 reps pulite.',            tag:'5 reps',     prereqs:['mu_2']},
      {id:'mu_4', name:'Negative MU',         desc:'Parti sopra la sbarra e scendi lentamente in 5 secondi fino al hang. 5 reps.',         tag:'5 neg reps', prereqs:['mu_3']},
      {id:'mu_5', name:'Kipping muscle-up',   desc:'Muscle-up con legger slancio delle gambe. 3 ripetizioni consecutive.',                 tag:'3 reps',     prereqs:['mu_4']},
      {id:'mu_6', name:'Strict muscle-up',    desc:'Muscle-up senza nessuno slancio. Forza pura. Il vero obiettivo.',                     tag:'1 rep',      prereqs:['mu_5']},
    ]
  },
  {
    id:'handstand', name:'Handstand', emoji:'🤸',
    color:'#d4943a', desc:'Verticale libera sulle mani',
    steps:[
      {id:'hs_1', name:'Pike hold',           desc:'Triangolo con la testa a terra, gambe tese. Carica progressiva su spalle e polsi.',    tag:'15s hold',   prereqs:[]},
      {id:'hs_2', name:'Wall handstand',      desc:'Verticale con pancia al muro. Spalle attivate, corpo in linea. 20 secondi.',           tag:'20s hold',   prereqs:['hs_1']},
      {id:'hs_3', name:'Chest-to-wall',       desc:'Schiena al muro, corpo il più verticale possibile. Forma pulita. 20 secondi.',         tag:'20s hold',   prereqs:['hs_2']},
      {id:'hs_4', name:'Kick-up libero',      desc:'Vai in verticale senza muro e tieni almeno 3 secondi. Ripeti 5 volte.',               tag:'3s × 5',     prereqs:['hs_3']},
      {id:'hs_5', name:'Handstand 10s',       desc:'Verticale libera tenuta 10 secondi con controllo stabile.',                           tag:'10s free',   prereqs:['hs_4']},
      {id:'hs_6', name:'Handstand 30s',       desc:'Verticale libera tenuta 30 secondi. Padronanza completa dell\'equilibrio.',            tag:'30s free',   prereqs:['hs_5']},
    ]
  },
];

// Genera il progresso iniziale (locked/available) per ogni step
function initCaliProgress(){
  const p={};
  CALI_SKILLS.forEach(sk=>{
    sk.steps.forEach(st=>{
      p[st.id]=st.prereqs.length===0?'available':'locked';
    });
  });
  return p;
}

const COMMON_EXERCISES = [
  {group:'Petto', items:[
    'Panca piana','Panca piana bilancere','Panca piana manubri',
    'Panca inclinata','Panca inclinata bilancere','Panca inclinata manubri',
    'Panca declinata','Panca stretta manubri',
    'Chest press','Chest press (pure strength)','Wide chest press (pure strength)','Incline chest press (pure strength)',
    'Croci','Croci ai cavi','Croci ai cavi bassi',
    'Tirate ai cavi bassi','Pectoral machine','Pullover',
    'Dip','Push up',
  ]},
  {group:'Schiena', items:[
    'Stacco',
    'Lat machine','Lat machine presa inversa','Lat machine presa neutra','Lat machine presa neutra stretta',
    'Lat pull down (pure strength)','Vertical traction',
    'Pull up','Pull up assistiti','Chin up','Chin up assistiti',
    'Rematore bilancere','Rematore manubrio','Rematore su panca inclinata',
    'Row pure strength','Low row',
    'Pulley','Pulley presa larga',
    'Croci inverse manubri','Croci inverse cavi',
    'Pulldown cavi braccia dritte','T-bar row',
  ]},
  {group:'Spalle', items:[
    'Lento avanti','Lento dietro',
    'Shoulder press','Shoulder press pure strength',
    'Alzate laterali','Alzate laterali ai cavi',
    'Alzate frontali','Alzate frontali / a martello manubrio','Alzate frontali a martello cavo','Alzate frontali a martello su panca inclinata',
    'Arnold press','Face pull',
    'Shrug','Scrollate','Scrollate posteriori su panca',
    'V push up',
  ]},
  {group:'Bicipiti', items:[
    'Curl bilancere','Curl bilanciere','Curl manubri',
    'Curl','Arm curl','Curl concentrato',
    'Curl a martello','Curl a martello ai cavi',
    'Curl ai cavi','Curl alla testa cavi','Reverse curl ai cavi',
    'Curl panca inclinata','Curl martello panca inclinata',
    'Curl intrarotazione','Panca scott',
  ]},
  {group:'Tricipiti', items:[
    'Tricipiti ai cavi','Estensioni tricipiti ai cavi','Pushdown tricipiti ai cavi',
    'Estensioni tricipiti manubrio',
    'French press','Dip tricipiti','Kickback','Close grip bench',
  ]},
  {group:'Gambe', items:[
    'Squat',
    'Leg press','Leg press pure strength',
    'Stacchi','Stacchi rumeni',
    'Affondi','Affondi manubri',
    'Leg curl','Leg extension',
    'Calf machine','Calf su leg press',
    'Hiptrust','Hiptrust multipower',
    'Abductor','Adductor',
  ]},
  {group:'Core', items:[
    'Plank','Crunch','Leg raise','Elevazioni gambe parallele',
    'Russian twist','Ab wheel','Hollow body',
  ]},
  {group:'Cardio', items:['Tapis roulant','Cyclette','Vogatore','Ellittica','Jump rope','Box jump']},
];

const EXPENSE_CATS = [
  {id:'cibo',    name:'Cibo',       icon:'cat_food',  color:'#c97a4a'},
  {id:'sport',   name:'Sport',      icon:'cat_sport', color:'#a8c26b'},
  {id:'trasporti',name:'Trasporti', icon:'cat_car',   color:'#6dbb8a'},
  {id:'svago',   name:'Svago',      icon:'cat_fun',   color:'#9b8fc2'},
  {id:'casa',    name:'Casa',       icon:'cat_house', color:'#d4a84b'},
  {id:'altro',   name:'Altro',      icon:'cat_other', color:'#7b8a7a'},
];

/* ═══════════════════════════════════════════
   FOOD LIBRARY
═══════════════════════════════════════════ */
const FOOD_LIB=[
  {cat:'Frutta & Verdura',icon:'🥦',items:['Mele','Banane','Arance','Limoni','Pere','Pesche','Fragole','Uva','Kiwi','Ananas','Mango','Avocado','Pomodori','Lattuga','Spinaci','Carote','Cipolle','Aglio','Patate','Zucchine','Melanzane','Peperoni','Broccoli','Cavolfiore','Funghi','Cetrioli','Sedano','Rucola','Piselli','Fagiolini','Mais','Asparagi']},
  {cat:'Carne & Pesce',icon:'🥩',items:['Petto di pollo','Coscia di pollo','Tacchino','Macinato manzo','Bistecca','Maiale','Prosciutto cotto','Prosciutto crudo','Salame','Mortadella','Bresaola','Wurstel','Pancetta','Salmone','Tonno','Merluzzo','Orata','Branzino','Gamberetti','Polpo','Calamari','Sgombro','Acciughe','Baccalà']},
  {cat:'Latticini & Uova',icon:'🧀',items:['Latte intero','Latte parzialmente scremato','Latte scremato','Parmigiano reggiano','Mozzarella','Ricotta','Yogurt bianco','Yogurt greco','Burro','Panna fresca','Pecorino','Gorgonzola','Scamorza','Provola','Uova','Crescenza','Stracchino','Fontina','Emmental']},
  {cat:'Pane & Cereali',icon:'🍞',items:['Pane comune','Pane integrale','Pane in cassetta','Pane di segale','Grissini','Fette biscottate','Riso','Riso integrale','Pasta corta','Spaghetti','Penne','Rigatoni','Fusilli','Farfalle','Lasagne','Avena','Cornflakes','Farina 00','Farina integrale','Polenta','Cous cous','Quinoa','Orzo','Farro']},
  {cat:'Condimenti & Salse',icon:'🫙',items:['Olio extravergine d\'oliva','Olio di semi','Aceto di vino','Aceto balsamico','Sale fino','Sale grosso','Pepe nero','Peperoncino','Ketchup','Maionese','Senape','Passata di pomodoro','Pelati','Concentrato di pomodoro','Salsa di soia','Miele','Zucchero bianco','Zucchero di canna','Nutella','Marmellata','Pesto','Olive nere','Olive verdi','Capperi','Brodo vegetale','Dado']},
  {cat:'Bevande',icon:'🥤',items:['Acqua naturale','Acqua frizzante','Succo d\'arancia','Succo di mela','Succo di pesca','Latte di avena','Latte di mandorla','Latte di soia','Coca Cola','Coca Cola Zero','Aranciata','Limonata','Birra','Vino rosso','Vino bianco','Prosecco','Caffè macinato','Caffè in capsule','Tè verde','Tè nero','Camomilla','Tisane']},
  {cat:'Dolci & Snack',icon:'🍫',items:['Cioccolato fondente','Cioccolato al latte','Cioccolato bianco','Biscotti','Crackers','Grissini','Patatine','Popcorn','Frutta secca mista','Mandorle','Noci','Nocciole','Arachidi','Anacardi','Pistacchi','Barrette proteiche','Merendine','Gelato','Ghiaccioli','Cereali']},
  {cat:'Congelati',icon:'❄️',items:['Piselli surgelati','Fagiolini surgelati','Spinaci surgelati','Pizza surgelata','Bastoncini di pesce','Patate surgelate','Pollo surgelato','Minestrone surgelato','Gelati','Yogurt gelato']},
  {cat:'Igiene & Casa',icon:'🧴',items:['Carta igienica','Fazzoletti','Tovaglioli','Carta da cucina','Detersivo piatti','Detersivo lavatrice','Ammorbidente','Shampoo','Balsamo','Bagnoschiuma','Sapone liquido','Dentifricio','Spazzolino','Deodorante','Spugna','Sacchetti rifiuti','Candeggina','Disinfettante','Detergente multiuso']},
];

/* ═══════════════════════════════════════════
   TRAVEL TEMPLATES
═══════════════════════════════════════════ */
const TRAVEL_TEMPLATES=[
  {id:'mare',icon:'🏖️',name:'Mare',color:'#6dbb8a',cats:[
    {cat:'Documenti',items:['Carta d\'identità','Tessera sanitaria','Biglietti','Prenotazione hotel','Contanti']},
    {cat:'Abbigliamento',items:['Costume da bagno','Costume extra','Vestitino','Shorts','T-shirt','Camicia','Sandali','Infradito','Occhiali da sole','Cappello']},
    {cat:'Spiaggia',items:['Asciugamano grande','Crema solare SPF50','Crema solare corpo','Doposole','Borsa mare','Telo mare','Cuffia nuoto']},
    {cat:'Igiene',items:['Shampoo','Balsamo','Docciaschiuma','Spazzolino','Dentifricio','Deodorante','Rasoio','Pinzette']},
    {cat:'Farmaci',items:['Antidolorifici','Antistaminico','Cerotti','Farmaci personali','Crema antizanzare']},
  ]},
  {id:'montagna',icon:'🏔️',name:'Montagna',color:'#a8c26b',cats:[
    {cat:'Documenti',items:['Carta d\'identità','Assicurazione','Biglietti','Mappa cartacea']},
    {cat:'Abbigliamento',items:['Giacca impermeabile','Felpa','Maglione','Pantaloni trekking','Scarpe da trekking','Calzini tecnici','Calzini extra','Guanti','Berretto','Strati termici','Gilet']},
    {cat:'Equipaggiamento',items:['Zaino','Bastoni trekking','Torcia frontale','Borraccia','Thermos','Mappa/GPS','Crema solare','Fischietto']},
    {cat:'Igiene',items:['Shampoo','Bagnoschiuma','Spazzolino','Dentifricio','Salviette umide','Crema mani']},
    {cat:'Farmaci',items:['Antidolorifici','Cerotti','Bende','Disinfettante spray','Farmaci di quota','Antinausea']},
  ]},
  {id:'city',icon:'🌆',name:'City Break',color:'#9b8fc2',cats:[
    {cat:'Documenti',items:['Carta d\'identità','Biglietti','Prenotazione hotel','Carte di credito','Contanti locali']},
    {cat:'Abbigliamento',items:['Outfit casual x3','Outfit elegante','Scarpe comode','Scarpe eleganti','Giacca leggera','Impermeabile leggero']},
    {cat:'Tech',items:['Caricatore telefono','Power bank','Cuffie','Adattatore prese','Fotocamera']},
    {cat:'Igiene',items:['Kit igiene ridotto','Profumo','Spazzolino','Dentifricio','Deodorante']},
    {cat:'Altro',items:['Guida turistica','Cuffie da viaggio','Snack','Ombrello pieghevole']},
  ]},
  {id:'business',icon:'💼',name:'Business',color:'#c97a4a',cats:[
    {cat:'Documenti',items:['Passaporto','Carta d\'identità','Biglietti','Biglietti da visita','Documenti riunione','Prenotazione hotel','Polizza assicurativa']},
    {cat:'Abbigliamento',items:['Abito/Completo','Camicia x2','Cravatta','Scarpe eleganti','Cintura','Calzini formali','Abbigliamento casual sera']},
    {cat:'Tech',items:['Laptop','Caricatore laptop','Mouse wireless','Cuffie','Adattatore HDMI','Power bank','Chiavette USB','Tastiera portatile']},
    {cat:'Igiene',items:['Necessaire completo','Rasoio','Dopobarba','Profumo','Kit emergenza macchie']},
  ]},
  {id:'volo',icon:'✈️',name:'Volo lungo',color:'#d4a84b',cats:[
    {cat:'Documenti',items:['Passaporto','Visto','Carta imbarco','Assicurazione viaggio','Prenotazione hotel','Vaccinazioni','Contatti emergenza']},
    {cat:'A bordo',items:['Cuscino da viaggio','Mascherina occhi','Tappi orecchie','Coperta sottile','Calzini volo','Snack']},
    {cat:'Abbigliamento',items:['Vestiti per tutti i giorni','Strati adattabili','Abbigliamento formale','Abbigliamento sportivo','Costume']},
    {cat:'Tech',items:['Adattatore prese universale','Power bank grande','Caricatori','Cuffie noise cancelling','Tablet/eReader','SIM locale']},
    {cat:'Farmaci',items:['Medicinali personali','Antidiarroico','Antistaminico','Sonnifero leggero','Disinfettante mani','Kit pronto soccorso']},
  ]},
  {id:'weekend',icon:'🌿',name:'Weekend',color:'#7ab8b0',cats:[
    {cat:'Documenti',items:['Carta d\'identità','Prenotazione','Contanti']},
    {cat:'Abbigliamento',items:['Cambio per 2 giorni','Pigiama','Scarpe comode','Scarpe eleganti','Giacca']},
    {cat:'Igiene',items:['Spazzolino','Dentifricio','Shampoo','Docciaschiuma','Deodorante']},
    {cat:'Altro',items:['Caricatore telefono','Cuffie','Snack','Libro/eReader']},
  ]},
];

const NOTE_GROUP_COLORS=['#9b8fc2','#6dbb8a','#a8c26b','#c97a4a','#d4a84b','#7ab8b0'];

/* ═══════════════════════════════════════════
   STORAGE + SUPABASE
═══════════════════════════════════════════ */
const LS = {
  get:(k,fb=null)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb}catch{return fb}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}},
};
function getUserId(){
  let id=LS.get('ms_uid');
  if(!id){id='user_'+Math.random().toString(36).slice(2,10);LS.set('ms_uid',id);}
  return id;
}
let supaClient=null;
function getSupabase(){
  const cfg=LS.get('ms_supa');
  if(!cfg?.url||!cfg?.key) return null;
  if(!supaClient) supaClient=supabase.createClient(cfg.url,cfg.key);
  return supaClient;
}
async function syncUp(state){
  const sb=getSupabase();if(!sb)return;
  try{await sb.from('ironlog_data').upsert({user_id:getUserId(),data:state,updated_at:new Date().toISOString()},{onConflict:'user_id'});}
  catch(e){console.warn('Sync up failed',e);}
}
async function syncDown(){
  const sb=getSupabase();if(!sb)return null;
  try{const{data}=await sb.from('ironlog_data').select('data').eq('user_id',getUserId()).single();return data?.data||null;}
  catch(e){return null;}
}

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const pad=n=>String(n).padStart(2,'0');
const fmtTime=s=>`${pad(Math.floor(s/60))}:${pad(s%60)}`;
const fmtDate=iso=>new Date(iso).toLocaleDateString('it-IT',{day:'2-digit',month:'short'});
const fmtDateShort=iso=>new Date(iso).toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit'});
const uuid=()=>Math.random().toString(36).slice(2);
const today=new Date().toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'});

// 1RM Epley formula
const calc1RM=(peso,reps)=>reps===1?peso:Math.round(peso*(1+reps/30));

/* ═══════════════════════════════════════════
   SPOTIFY CONNECT (OAuth PKCE + Web API)
═══════════════════════════════════════════ */
function spRedirectUri(){return window.location.origin+window.location.pathname;}
function spGenVerifier(){
  const arr=new Uint8Array(64);window.crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
async function spGenChallenge(v){
  const d=await window.crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));
  return btoa(String.fromCharCode(...new Uint8Array(d))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
async function spLogin(clientId){
  const v=spGenVerifier();sessionStorage.setItem('sp_verifier',v);
  const c=await spGenChallenge(v);
  const p=new URLSearchParams({client_id:clientId,response_type:'code',redirect_uri:spRedirectUri(),
    code_challenge_method:'S256',code_challenge:c,
    scope:'user-read-playback-state user-modify-playback-state user-read-currently-playing'});
  window.location.href='https://accounts.spotify.com/authorize?'+p;
}
async function spExchangeCode(code,clientId){
  const v=sessionStorage.getItem('sp_verifier');if(!v) return null;
  const r=await fetch('https://accounts.spotify.com/api/token',{method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({client_id:clientId,grant_type:'authorization_code',code,redirect_uri:spRedirectUri(),code_verifier:v})});
  sessionStorage.removeItem('sp_verifier');
  const d=await r.json();if(!d.access_token) return null;
  d.expires_at=Date.now()+d.expires_in*1000;return d;
}
async function spRefreshToken(tok,clientId){
  const r=await fetch('https://accounts.spotify.com/api/token',{method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({grant_type:'refresh_token',refresh_token:tok.refresh_token,client_id:clientId})});
  const d=await r.json();if(!d.access_token) return null;
  d.refresh_token=d.refresh_token||tok.refresh_token;d.expires_at=Date.now()+d.expires_in*1000;return d;
}
async function spApi(endpoint,method='GET',body=null,token){
  const r=await fetch('https://api.spotify.com/v1'+endpoint,{method,
    headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},
    ...(body?{body:JSON.stringify(body)}:{})});
  if(r.status===204||r.status===202) return null;
  if(!r.ok) return {error:r.status};
  try{return await r.json();}catch{return null;}
}

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
