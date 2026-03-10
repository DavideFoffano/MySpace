# 📱 MYSPACE — Documento di Progetto
*La tua app personale modulare*

---

## 🧠 VISIONE DEL PROGETTO
MySpace è una web app PWA personale e modulare — una dashboard privata che raccoglie in un unico posto tutti gli strumenti di uso quotidiano. Ogni modulo è indipendente ma condivide lo stesso design system, struttura dati e infrastruttura.

**Principio guida:** costruire per sé stessi prima.

---

## 🗂️ ARCHITETTURA MODULARE

```
MySpace
├── 🏋️  Modulo Workout        ← IMPLEMENTATO (v4)
│    └── 🤸 Sezione Skills    ← IMPLEMENTATO (calistenia)
├── ✅  Modulo To-Do          ← IMPLEMENTATO (v1)
├── 💰  Modulo Spese          ← IMPLEMENTATO (v1)
├── 📓  Modulo Note           ← IMPLEMENTATO (v2)
│    ├── 🛒 Lista Spesa       ← IMPLEMENTATO
│    └── ✈️  Lista Viaggio     ← IMPLEMENTATO
├── 💧  Modulo Abitudini      ← IN PIANO
├── 🍅  Modulo Focus          ← IN PIANO
└── 📊  Dashboard Home        ← IN PIANO
```

**Ordine tab navbar:** Workout → To-Do → Spese → Note

---

## 📁 STRUTTURA FILE

```
myspace/
├── index.html          ← shell HTML + CDN imports
├── styles.css          ← tutto il CSS
├── core.js             ← globals: MODULE_META, PATHS, Icon, costanti, LS, sync, Spotify
├── module-workout.js   ← WorkoutModule + chart components + heatmap
├── module-todo.js      ← TodoModule
├── module-expenses.js  ← ExpensesModule
├── module-notes.js     ← NotesModule (note + shopping + travel)
├── app.js              ← App router + navbar + ReactDOM mount
├── .gitignore
└── README.md
```

### Quale file modificare
| Cosa vuoi fare | File |
|---|---|
| Modifica Workout (sessione, grafici, skills) | `module-workout.js` |
| Modifica To-Do | `module-todo.js` |
| Modifica Spese | `module-expenses.js` |
| Modifica Note / Lista Spesa / Viaggio | `module-notes.js` |
| Nuovo modulo o cambio navbar | `app.js` |
| Nuova icona, costante globale, Supabase | `core.js` |
| Stili, layout, animazioni | `styles.css` |

---

## 🏋️ MODULO WORKOUT — MYWORKOUT (v4)

### Sub-nav
`Home · Schede · Skills · Storico · Progressi · ⚙️`

### Funzionalità completate

**Home**
- Streak badge 🔥 (settimane consecutive, mostrato da ≥2)
- Stats: sessioni totali, questa settimana, record personali
- Griglia schede con barra progresso ultima sessione

**Schede**
- Crea / duplica / elimina / modifica nome + colore + sottotitolo
- Riordino schede ▲▼
- Editor esercizi: aggiungi da libreria (~80 esercizi, 8 gruppi) o nome custom, riordina ▲▼, rimuovi
- Note per esercizio (visibili in sessione come `💡 testo`)

**Sessione (fullscreen)**
- Cronometro, barra progresso serie
- Spunta serie con modifica reps/kg inline
- Pesi precaricati dall'ultima sessione reale (da `weightLog`)
- Modifica esercizi durante sessione (gear icon → modal)
- Timer recupero automatico (30s / 45s / 1min / 90s / 2min)
- Spotify mini player (copertina, brano, artista, ⏮ ⏸/▶ ⏭) se connesso
- Overlay fine sessione: RPE 1–10 con colore dinamico, note libere, banner PR

**Skills / Calistenia**
- 4 skill: Front Lever, Planche, Muscle-Up, Handstand
- 6 step ciascuna con descrizione e tag (es. "5s hold", "10 reps")
- Stati step: `locked → available → in_progress → achieved`
- Unlock automatico cascade al completamento dei prerequisiti
- Vista lista: card con barra progressione e badge stato
- Vista dettaglio: lista step con icona stato, bottoni Inizia / Completato / Reset
- Persistenza `ms_cali_progress`

**Storico**
- Lista sessioni con data, durata, serie completate, RPE colorato, note

**Progressi (6 tab)**

| Tab | Contenuto |
|-----|-----------|
| Grafici | Peso sollevato / 1RM stimato (toggle) per esercizio |
| Volume | Grafico barre serie/settimana + heatmap frequenza 52 settimane + stats vs settimana precedente |
| Record | PR per esercizio con 1RM stimato (formula Epley) |
| Confronto | Ultime 2 sessioni stessa scheda affiancate con delta colorato |
| Pesi | Storico numerico pesi per esercizio |
| Corpo | Tracker peso corporeo: log, grafico lineare, delta, min/max/media |

**Impostazioni**
- Timer recupero default
- Spotify Connect (OAuth PKCE, Web API polling ogni 5s)
- Supabase sync

### Schede default
| ID | Nome | Subtitle | Colore |
|----|------|----------|--------|
| w1 | Allenamento 1 | Full Body | `#d4943a` |
| w2 | Allenamento 2 | Full Body | `#c47c28` |
| w3 | Allenamento 3 | Full Body | `#e8a845` |
| w4 | Leg Day | Gambe · Glutei · Core | `#b8722a` |
| w5 | Extra | Allenamento Supplementare | `#dba042` |

### Funzionalità da aggiungere
- Export sessione in PDF
- Notifiche push reminder
- Tracker misure corporee (circonferenze)
- Supersets / warm-up sets

### Spotify Connect — note tecniche
- **Approccio:** Web API REST (polling ogni 5s), NON Web Playback SDK
- Funziona su PC Chrome, Android Chrome, iOS Safari
- Richiede Spotify aperto su un dispositivo come altoparlante
- OAuth PKCE con redirect URI auto-generato dall'app
- Scopes: `user-read-playback-state user-modify-playback-state user-read-currently-playing`
- Token salvato in `ms_spotify_token` con `expires_at` per auto-refresh

---

## ✅ MODULO TO-DO — MYTASKS (v1)

### Funzionalità completate
- Aggiunta task (Enter o bottone +)
- Toggle completamento, eliminazione
- Filtri: Tutte / Da fare / Completate
- Persistenza `ms_todos`

### Funzionalità da aggiungere
- Liste multiple con nome e colore
- Priorità Alta / Media / Bassa
- Scadenze con badge dinamici
- Sotto-task espandibili
- Task ricorrenti
- Sync Supabase

---

## 💰 MODULO SPESE — MYSPESE (v1)

### Funzionalità completate
- Aggiunta spesa rapida (importo + categoria + nota)
- 6 categorie: Cibo, Sport, Trasporti, Svago, Casa, Altro
- Totale mese corrente + contatore transazioni
- Storico con icona categoria, nota, data
- Eliminazione singola
- Persistenza `ms_expenses`

### Funzionalità da aggiungere
- Budget per categoria
- Grafico torta e grafico barre mensile
- Categorie personalizzabili
- Spese ricorrenti / abbonamenti
- Export CSV mensile
- Obiettivo risparmio mensile

---

## 📓 MODULO NOTE — MYNOTE (v2)

### Sub-nav
`Note · Spesa · Viaggio`

### Sezione Note
- Griglia con anteprima testo
- Editor fullscreen: titolo + corpo
- 6 colori per nota, pin in cima, eliminazione
- Ricerca full-text (titolo + corpo)
- Gruppi (cartelle con colore): crea, elimina, filtra
- Persistenza `ms_notes` + `ms_note_groups`

### Sezione Lista Spesa
- Liste multiple con nome
- Libreria prodotti integrata (9 categorie, ~200 prodotti) + voce libera
- Spunta articoli con percentuale completamento
- Persistenza `ms_shopping`

### Sezione Lista Viaggio
- 5 template: 🏖️ Mare, 🏔️ Montagna, 🌆 City Break, 💼 Business, 🏡 Weekend
- Categorie pre-popolate (Documenti, Abbigliamento, Igiene, ecc.)
- Spunta voci, aggiunta custom, percentuale completamento
- Persistenza `ms_travel`

### Funzionalità da aggiungere
- Markdown semplice (grassetto, liste)

---

## 🗄️ STRUTTURA DATI GLOBALE

### localStorage keys
```
Workout:
├── workouts              ← schede allenamento
├── history               ← storico sessioni
├── weightLog             ← storico pesi per esercizio
├── settings              ← impostazioni (restTime, ecc.)
├── ms_spotify_client_id  ← Spotify: client ID OAuth
├── ms_spotify_token      ← Spotify: access/refresh token
├── ms_cali_progress      ← Calistenia: stati step
└── ms_bodyweight         ← Peso corporeo: log

To-Do:
└── ms_todos

Spese:
└── ms_expenses

Note:
├── ms_notes              ← note libere
├── ms_note_groups        ← gruppi note
├── ms_shopping           ← liste spesa
└── ms_travel             ← liste viaggio

Globale:
├── ms_uid                ← user ID dispositivo
├── ms_supa               ← config Supabase
└── ms_module             ← ultimo modulo aperto
```

### Schema Supabase
Tabella `ironlog_data`: `user_id` (PK), `data` (jsonb), `updated_at`
Il campo `data` contiene: `{ workouts, history, weightLog, settings }`

---

## 🎨 DESIGN SYSTEM

### Stack tecnico
- HTML + React 18 (Babel CDN)
- Chart.js 4.4, Supabase JS v2
- Font: **Jost** (weights 200–600)
- Nessun build step — tutti i file `<script src="">` classici

### CSS Variables globali
| Token | Valore | Uso |
|-------|--------|-----|
| `--bg` | `#0b0c09` | Background principale |
| `--surface` | `#141510` | Card, superfici |
| `--surface2` | `#1a1b16` | Input, secondari |
| `--surface3` | `#1f2019` | Terziari |
| `--border` | `#252620` | Bordi principali |
| `--border2` | `#2e2f28` | Bordi secondari |
| `--text` | `#e8e6df` | Testo principale |
| `--muted` | `#6b6a5e` | Testo secondario |
| `--faint` | `#38382e` | Placeholder / terziano |
| `--font` | `'Jost',sans-serif` | Font globale |
| `--acc` | (override per modulo) | Accent corrente |
| `--acc-bg` | (override per modulo) | Background accent tinted |

### Colori moduli (MODULE_META)
| Modulo | key | Accent | Note |
|--------|-----|--------|------|
| Workout | `gym` | `#d4943a` | Ambra |
| To-Do | `todo` | `#6aadcf` | Azzurro |
| Spese | `expenses` | `#7aba7a` | Verde |
| Note | `notes` | `#d4c9a8` | Crema |

Tutti i moduli condividono la stessa palette di superfici neutra carbone:

```js
MODULE_THEME (tutti i moduli identici):
  '--bg':       '#111110'
  '--surface':  '#161614'
  '--surface2': '#1e1e1b'
  '--border':   '#252521'
  '--border2':  '#2e2e2a'
```

### Skills — palette ambra (CALI_SKILLS)
| Skill | Colore |
|-------|--------|
| Front Lever | `#d4943a` |
| Planche | `#c47c28` |
| Muscle-Up | `#e8a845` |
| Handstand | `#b8722a` |

### WORKOUT_COLORS (selezione colore schede)
`['#d4943a','#c47c28','#e8a845','#b8722a','#dba042','#c88630','#e0b060','#a86820']`

### Componenti standard
- **Card:** `border-radius:16px`, `border:1px solid var(--border)`, `background:var(--surface)`
- **Button primary:** `background:var(--acc)`, `color:#0b0c09`, `border-radius:12px`
- **Input:** `background:var(--surface2)`, `border:1px solid var(--border2)`, `border-radius:8px`
- **Module nav:** 4 tab fissi in basso, `background:var(--surface)`, `border-top:1px solid var(--border)`
- **Sub-nav:** pill buttons orizzontali scrollabili (`.sub-nav` + `.sn-btn`)
- **Icon:** `<Icon name="..." size={N} color="..." sw={N}/>` — SVG inline, tutti i path in `PATHS`

---

## 💬 PROMPT TIPO PER SESSIONI FUTURE

```
Sto lavorando su MySpace, una web app PWA personale e modulare.
Stack: HTML + React 18 (Babel CDN), Chart.js, Supabase — multi-file, no build step.
File: index.html + styles.css + core.js + module-workout.js + module-todo.js +
      module-expenses.js + module-notes.js + app.js
Design: dark theme carbone neutro, font Jost, accent per modulo
(ambra #d4943a Workout, azzurro #6aadcf To-Do, verde #7aba7a Spese, crema #d4c9a8 Note).
Tutti i moduli condividono la stessa palette superfici: #111110 / #161614 / #1e1e1b / #252521 / #2e2e2a.
Dati: localStorage + sync Supabase opzionale.
[Allego il file rilevante per la modifica]

Oggi voglio: [DESCRIZIONE]

Requisiti:
- Mantenere stile visivo e convenzioni CSS invariate
- Mobile first
- Non rompere funzionalità esistenti
- Usare LS.get/LS.set per localStorage con prefisso ms_
- Usare il componente <Icon> per le icone (path in PATHS)
```

---

## 🚀 DEPLOY & SETUP

**Sviluppo locale**
Apri `index.html` nel browser — funziona direttamente, nessun server necessario.

**Netlify**
Trascina l'intera cartella su `app.netlify.com/drop`.
Oppure collega il repo GitHub per deploy automatico ad ogni push.

**PWA:** Safari/Chrome → Condividi → "Aggiungi a schermata Home"

**Supabase:** crea tabella `ironlog_data` → copia URL + anon key → App → Workout → ⚙️ → Sincronizzazione

---

## 🗺️ ROADMAP

### ✅ Completato
- Workout v4 completo (sessione, storico, grafici, PR, timer, RPE, Supabase, Spotify, peso corporeo, heatmap, confronto, 1RM, note esercizi, pesi da ultima sessione)
- Skills calistenia (4 skill, 6 step, unlock cascade)
- To-Do v1
- Spese v1
- Note v2 (note + gruppi + ricerca + lista spesa con libreria + lista viaggio con template)
- Design system v2: palette carbone neutro unificata + accents per modulo
- Refactor multi-file (index.html + styles.css + core.js + 4 module files + app.js)

### 🔄 Prossime priorità
- To-Do v2: liste, priorità, scadenze, sotto-task
- Spese v2: budget, grafici, export CSV
- **Google Calendar sync** (To-Do → eventi calendario, agenda in-app)

### IN PIANO
- Modulo Abitudini (streak, heatmap, check-in)
- Modulo Focus (Pomodoro + To-Do)
- Dashboard Home (widget riassuntivi)
- Backup/restore JSON, tema chiaro/scuro

---

## 📌 REGOLE DI SVILUPPO
1. **Un modulo alla volta** — finire bene prima di iniziare il prossimo
2. **Mobile first** — testare su telefono prima di iterare
3. **Dati mai persi** — ogni modifica mantiene i dati esistenti
4. **Un file per modulo** — ogni componente vive nel suo file, `core.js` per i globals
5. **Offline prima** — funziona senza internet, sync è un bonus
6. **Commit prima di grandi modifiche** — Git come backup
