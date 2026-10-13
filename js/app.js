import { EX, EQ, RANKS, STANDARDS, LEVEL_NAMES, KEY_LIFTS, MAIN_SESSIONS, MAIN_WEEKS, SPEC, LABOURS, LABOUR_XP, MEASURES, MUSCLES } from './data.js';
import { IMAGES } from './images.js';
import { POSES, listPhotos, putPhoto, deletePhoto, shrink, blobToDataUrl, dataUrlToBlob } from './photos.js';
import {
  DEFAULT_SETTINGS, DAY_NAMES, DAY_LONG, iso, parseIso, addDays, mondayOf, weekKey, fmtDate, fmtShort,
  blockAt, workoutFor, extraWorkout, estMinutes, deriveWeights, warmupSets, fmtKg, weightLabel, newSession,
  bwAt, computeXP, rankFor, isTrainingDay, upcomingDates, weekStatus, projectEnd, blockTimeline, seriesFor, totals,
  standardValue, standardLevel, START_W, isMain, mainCount, plusMode, stagnating, dayPlan, figure, targets,
  nutrition, adjustNutrition, updateLabours, noWeight, unitOf, FIG_COMPONENTS, weekVolume,
} from './engine.js';

const KEY = 'agon.v1';
const $ = sel => document.querySelector(sel);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- Zustand ----------
function blank() {
  return {
    v: 2, settings: { ...DEFAULT_SETTINGS }, sessions: [], active: null, bw: [], summary: null, warm: {},
    profile: { wrist: null, height: null }, meas: [], nutri: null, labours: {}, manual: {},
  };
}
function migrate(s) {
  const b = blank();
  const out = { ...b, ...s, settings: { ...DEFAULT_SETTINGS, ...(s.settings || {}) } };
  out.sessions = (s.sessions || []).map((x, j) => ({ ...x, kind: x.kind || 'main', id: x.id || `m${j}_${x.start || j}` }));
  if (!s.profile) out.profile = b.profile;
  if (!s.meas) out.meas = b.meas;
  out.labours = s.labours || {};
  out.manual = s.manual || {};
  if (out.summary && out.summary.i != null && !out.summary.id) out.summary = null;
  if (out.active && !out.active.id) out.active = { ...out.active, id: `s${Date.now()}`, kind: 'main' };
  out.v = 2;
  return out;
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    return migrate(JSON.parse(raw));
  } catch { return blank(); }
}
let state = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { toast('Speichern fehlgeschlagen'); } }

// Nach jeder Änderung: Arbeiten prüfen, Kalorien nachführen
function afterChange() {
  const x = computeXP(state);
  const fresh = updateLabours(state, x);
  adjustNutrition(state);
  save();
  if (fresh.length) setTimeout(() => toast(`Arbeit erfüllt: ${fresh.map(l => l.name).join(', ')} · +${(fresh.length * LABOUR_XP).toLocaleString('de-CH')} XP`), 300);
}

let view = 'today';
let sheet = null;
let statEx = null;
let tickTimer = null;
let wakeLock = null;

// Fotos: aus IndexedDB, mit Objekt-URLs für die Anzeige
let photos = [];
const photoUrls = new Map();
async function loadPhotos() {
  photos = (await listPhotos()).sort((a, b) => a.d.localeCompare(b.d));
  for (const [id, u] of photoUrls) if (!photos.some(p => p.id === id)) { URL.revokeObjectURL(u); photoUrls.delete(id); }
  for (const p of photos) if (!photoUrls.has(p.id)) photoUrls.set(p.id, URL.createObjectURL(p.blob));
}
const photoDates = () => [...new Set(photos.map(p => p.d))].sort();
const photoOf = (d, pose) => photos.find(p => p.d === d && p.pose === pose);
const daysSince = d => Math.floor((parseIso(iso(new Date())) - parseIso(d)) / 86400000);

// ---------- Hilfen ----------
const typeLabel = { rpt: 'Reverse Pyramid', kino: 'Kino Reps', rp: 'Rest-Pause', straight: 'Gerade Sätze' };
// Schwere eines Satzes als Reserve-Wiederholungen
const RIR_LABEL = { 3: 'Leicht', 2: 'Gut', 1: 'Hart', 0: 'Versagen' };
const mmss = sec => { sec = Math.max(0, Math.round(sec)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; };
const range = (lo, hi) => (lo === hi ? `${lo}` : `${lo}–${hi}`);
const unitTxt = exId => (unitOf(exId) === 's' ? 's' : 'Wdh.');
const pct = x => `${Math.round(x * 100)} %`;
const cm = x => `${(Math.round(x * 10) / 10).toLocaleString('de-CH')} cm`;
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}
function setsSummary(t) {
  if (t.type === 'rp') return `${range(...t.sets[0])} + ${t.minis}× ${range(...t.mini)} · Rest-Pause`;
  const all = t.sets.map(s => range(s[0], s[1]));
  const same = all.every(x => x === all[0]);
  const n = t.sets.length;
  return `${n} ${n === 1 ? 'Satz' : 'Sätze'} · ${same ? all[0] : all.join(' / ')} ${unitTxt(t.ex)}`;
}
function lastTop(exId) {
  for (let s = state.sessions.length - 1; s >= 0; s--) for (const e of state.sessions[s].ex) {
    if (e.ex === exId && !e.skipped) { const x = e.sets.find(y => y.done); if (x) return x; }
  }
  return null;
}

const ICONS = {
  today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  body: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.5" r="2"/><path d="M5 9l7-1.5L19 9M12 7.5v6M9 21l3-7.5 3 7.5"/></svg>',
  stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16"/><path d="M5 15l4-4 3 3 6-7"/></svg>',
  ranks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20c-4-2-6.5-5.5-6.5-10M12 20c4-2 6.5-5.5 6.5-10"/><path d="M6.5 13.5c-1.5 0-2.5-1-3-2.5 1.5 0 2.6.6 3 1.6M6 9.5C4.6 9 4 7.8 4 6.5c1.4.4 2.2 1.3 2.3 2.4M17.5 13.5c1.5 0 2.5-1 3-2.5-1.5 0-2.6.6-3 1.6M18 9.5c1.4-.5 2-1.7 2-3-1.4.4-2.2 1.3-2.3 2.4"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5 7h9M18 7h1M5 17h1M10 17h9"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>',
};
const EQ_ICON = {
  bb: '<svg viewBox="0 0 92 56" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="28" x2="84" y2="28"/><rect x="18" y="14" width="6" height="28" rx="2"/><rect x="68" y="14" width="6" height="28" rx="2"/><rect x="12" y="19" width="5" height="18" rx="2"/><rect x="75" y="19" width="5" height="18" rx="2"/></svg>',
  db: '<svg viewBox="0 0 92 56" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="30" y1="28" x2="62" y2="28"/><rect x="22" y="16" width="8" height="24" rx="3"/><rect x="62" y="16" width="8" height="24" rx="3"/></svg>',
  wbw: '<svg viewBox="0 0 92 56" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="8" x2="80" y2="8"/><circle cx="46" cy="18" r="5"/><path d="M38 9v8l8 10 8-10V9"/><line x1="46" y1="27" x2="46" y2="42"/><line x1="46" y1="42" x2="40" y2="52"/><line x1="46" y1="42" x2="52" y2="52"/></svg>',
  bw: '<svg viewBox="0 0 92 56" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="46" cy="10" r="5"/><line x1="46" y1="15" x2="46" y2="34"/><line x1="46" y1="20" x2="34" y2="28"/><line x1="46" y1="20" x2="58" y2="28"/><line x1="46" y1="34" x2="38" y2="50"/><line x1="46" y1="34" x2="54" y2="50"/></svg>',
  none: '<svg viewBox="0 0 92 56" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="46" cy="9" r="5"/><path d="M46 14v16M46 19l-14-6M46 19l14-6M46 30l-12 8 4 12M46 30l12 8-4 12"/></svg>',
  cable: '<svg viewBox="0 0 92 56" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="30" y1="4" x2="30" y2="52"/><circle cx="30" cy="10" r="4"/><path d="M30 14 L58 34"/><path d="M54 30 L62 38 M58 34 L52 40"/><rect x="24" y="36" width="12" height="14" rx="2"/></svg>',
  machine: '<svg viewBox="0 0 92 56" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="20" y="8" width="16" height="40" rx="3"/><line x1="36" y1="18" x2="66" y2="18"/><line x1="66" y1="14" x2="66" y2="22"/><line x1="28" y1="48" x2="70" y2="48"/><rect x="48" y="30" width="16" height="10" rx="2"/></svg>',
  plate: '<svg viewBox="0 0 92 56" fill="none" stroke="currentColor" stroke-width="2"><circle cx="46" cy="28" r="20"/><circle cx="46" cy="28" r="5"/></svg>',
};
// Skizze der Messstellen, Nummern wie im Eingabefenster (H = Handgelenk)
const MEAS_SVG = (() => {
  const L = (x1, y, x2) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" class="ml"/>`;
  const lead = (x1, y, x2) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" class="ld"/>`;
  const tag = (x, y, t) => `<circle cx="${x}" cy="${y}" r="8" class="mc"/><text x="${x}" y="${y + 3.5}" class="mt">${t}</text>`;
  return `<svg class="measfig" viewBox="0 0 200 300" role="img" aria-label="Messstellen am Körper">
    <g class="fig">
      <ellipse cx="100" cy="26" rx="15" ry="19"/>
      <path d="M93 44v12M107 44v12"/>
      <path d="M93 56Q78 60 64 64Q50 68 50 86L44 140L40 196M107 56Q122 60 136 64Q150 68 150 86L156 140L160 196"/>
      <path d="M66 92L60 138L52 196M134 92L140 138L148 196"/>
      <ellipse cx="46" cy="208" rx="7" ry="11"/><ellipse cx="154" cy="208" rx="7" ry="11"/>
      <path d="M66 92Q68 120 77 148Q74 165 72 180L74 230L76 292M134 92Q132 120 123 148Q126 165 128 180L126 230L124 292"/>
      <path d="M100 192L92 240L88 292M100 192L108 240L112 292"/>
    </g>
    ${L(92, 50, 108)}${lead(108, 50, 172)}${tag(180, 50, 6)}
    ${L(48, 80, 152)}${lead(152, 80, 172)}${tag(180, 80, 2)}
    ${L(67, 104, 133)}${lead(133, 104, 172)}${tag(180, 104, 3)}
    ${L(77, 148, 123)}${lead(123, 148, 172)}${tag(180, 148, 1)}
    ${L(106, 226, 126)}${lead(126, 226, 172)}${tag(180, 226, 7)}
    ${L(46, 112, 64)}${lead(30, 112, 46)}${tag(22, 112, 4)}
    ${L(42, 152, 59)}${lead(30, 152, 42)}${tag(22, 152, 5)}
    ${L(39, 194, 53)}${lead(30, 194, 39)}${tag(22, 194, 'H')}
  </svg>`;
})();

function illu(exId, withInfo = true) {
  const def = EX[exId];
  const img = IMAGES.has(exId) ? `<img src="img/ex/${exId}.webp" alt="${esc(def.name)}: Start- und Endposition" loading="lazy">` : `<div class="ph">${EQ_ICON[def.eq] || ''}<span class="small">${esc(EQ[def.eq].label)}</span></div>`;
  return `<button class="illu" data-act="info" data-ex="${exId}" aria-label="Anleitung ${esc(def.name)}">${img}${withInfo ? '<span class="info">Anleitung</span>' : ''}</button>`;
}

// ---------- Kopfzeilen ----------
function rankLine(xpData) {
  const r = rankFor(xpData.total, state);
  const p = Math.round(r.progress * 100);
  const right = r.next ? `${xpData.total.toLocaleString('de-CH')} / ${r.next.xp.toLocaleString('de-CH')}` : `${xpData.total.toLocaleString('de-CH')} XP`;
  return `<button class="rankline" data-act="go" data-view="ranks" aria-label="Rang anzeigen"><span class="rk">${r.rank.name}</span><span class="xpbar"><i style="width:${p}%"></i></span><span class="xpn">${right}</span></button>`;
}
function figLine(fig) {
  if (fig.score == null) return `<button class="figline" data-act="go" data-view="body"><span class="fl">Griechische Figur</span><span class="figbar"><i style="width:0%"></i></span><span class="xpn">messen</span></button>`;
  return `<button class="figline" data-act="go" data-view="body" aria-label="Griechische Figur anzeigen"><span class="fl">Griechische Figur</span><span class="figbar"><i style="width:${Math.round(fig.score * 100)}%"></i></span><span class="xpn">${pct(fig.score)}</span></button>`;
}
function kcalCard() {
  const n = nutrition(state);
  if (!n) return `<div class="kcal"><span class="muted small">Trag dein Körpergewicht ein, dann zeigt Agon deine Kalorien für heute.</span></div>`;
  return `<button class="kcal" data-act="go" data-view="body"><span class="eyebrow">Kalorien heute</span><span class="kv num">${n.kcal.toLocaleString('de-CH')} kcal</span><span class="chipx">${n.phase === 'diaet' ? 'Diät' : 'Aufbau'}</span></button>`;
}

// ---------- Heute ----------
function weekDots(today) {
  const ws = weekStatus(state, today);
  const mon = mondayOf(today);
  const doneDates = new Set(state.sessions.filter(isMain).map(s => s.date));
  const days = ws.days.map(dw => addDays(mon, (dw + 6) % 7));
  let credit = ws.done - days.filter(d => doneDates.has(iso(d))).length;
  return `<div class="dots">${days.map(d => {
    const isToday = iso(d) === iso(today);
    let cls = '';
    if (doneDates.has(iso(d))) cls = 'f';
    else if (d < today && !isToday) { if (credit > 0) { credit--; cls = 'f'; } else cls = 'm'; }
    return `<span class="dot ${cls} ${isToday ? 't' : ''}"><i></i>${DAY_NAMES[d.getDay()]}</span>`;
  }).join('')}<span style="margin-left:auto">${ws.done} / 3 diese Woche</span></div>`;
}

function workoutPreview(w) {
  return `<div class="exlist">${w.list.map(t => {
    const lt = lastTop(t.ex);
    const right = noWeight(t.ex) ? '' : lt ? weightLabel(t.ex, lt.w) : 'neu';
    const cls = t.bonus ? 'bonus' : t.plus ? 'plus' : '';
    return `<div class="${cls}"><span class="n">${esc(EX[t.ex].name)}${t.optional ? ' <span class="muted small">(optional)</span>' : ''}</span><span class="s">${setsSummary(t)}</span><span class="w">${right}</span></div>`;
  }).join('')}</div>`;
}

function specPicker() {
  const a = Object.entries(SPEC.A).map(([k, v]) => `<option value="${k}" ${state.settings.specA === k ? 'selected' : ''}>${v.label}</option>`).join('');
  const b = Object.entries(SPEC.B).map(([k, v]) => `<option value="${k}" ${state.settings.specB === k ? 'selected' : ''}>${v.label}</option>`).join('');
  return `<div class="card wood"><span class="eyebrow">Spezialisierung wählen</span><p style="margin:0" class="small">Für die nächsten 6 Wochen bekommt je eine Muskelgruppe zusätzliche Sätze.</p>
    <div class="setting"><div class="t">Tag A</div><select class="sel" id="specA" data-change="specA">${a}</select></div>
    <div class="setting"><div class="t">Tag B</div><select class="sel" id="specB" data-change="specB">${b}</select></div></div>`;
}

function bwCard(today) {
  const last = state.bw[state.bw.length - 1];
  const todayDone = last && last.d === iso(today);
  const thisWeek = state.bw.some(b => weekKey(b.d) === weekKey(iso(today)));
  return `<div class="card soft"><div class="row between"><span class="eyebrow">Körpergewicht</span><span class="small muted">${last ? `${todayDone ? 'heute' : 'zuletzt'} ${fmtKg(last.kg)} kg${todayDone ? '' : ` am ${fmtShort(parseIso(last.d))}`}` : 'noch kein Eintrag'}</span></div>
    <div class="bwrow"><input id="bwIn" inputmode="decimal" placeholder="${last ? fmtKg(last.kg) : 'kg'}" aria-label="Körpergewicht in kg"><button class="btn sm" data-act="bw">${thisWeek ? 'Eintragen' : 'Eintragen +10 XP'}</button></div>
    <span class="small muted">Am besten täglich morgens, nüchtern. Agon rechnet mit dem Wochenschnitt.</span></div>`;
}

function mainMeta(w) {
  return `<span class="muted small">Woche ${w.week} von ${MAIN_WEEKS} · ${esc(w.block)} · ${esc(w.phase)}</span>`;
}

function renderToday(xpData, fig) {
  const today = new Date();
  const ti = iso(today);
  const plan = dayPlan(state, today);
  const nextI = mainCount(state);
  const w = workoutFor(nextI, state.settings, { plusMode: plusMode(state, nextI) });
  const ws = weekStatus(state, today);
  const blk = blockAt(nextI);
  const specFirst = blk.b.spec && blk.k < 2;
  const first = !state.sessions.length;
  let h = rankLine(xpData) + figLine(fig);
  const lastMeas = (state.meas || []).map(m => m.d).sort().pop();
  const lastPhoto = photoDates().pop();
  const due = [];
  if (!state.profile || !state.profile.wrist || !state.profile.height) due.push('Grunddaten');
  if (!lastMeas || daysSince(lastMeas) >= 14) due.push('Messung');
  if (!lastPhoto || daysSince(lastPhoto) >= 28) due.push('Fotos');
  if (due.length) h += `<button class="due" data-act="go" data-view="body"><span>${due.join(', ').replace(/, ([^,]*)$/, ' und $1')} fällig</span><span class="muted">Körper ›</span></button>`;
  h += `<div class="stack"><span class="muted small">${DAY_LONG[today.getDay()]}, ${fmtDate(today)}</span>`;

  const mainBlock = (label, heading = true) => {
    let x = '';
    if (heading) x += `<div class="stack"><h2 class="display">${esc(w.title)}</h2><span class="muted">${esc(w.focus)}</span>${mainMeta(w)}</div>`;
    if (specFirst) x += specPicker();
    const st = stagnating(state);
    if (w.plusN && nextI < 12) x += `<p class="hint" style="margin:0">Wiedereinstieg: Die Plus-Übungen am Schluss haben in den ersten 4 Wochen nur je einen Satz. Wähle die Startgewichte eher vorsichtig, etwa 70 % von früher.</p>`;
    else if (w.plusN && st.stuck) x += `<p class="hint" style="margin:0">Die Kraft stagniert bei ${esc(st.names.slice(0, 2).join(' und '))}. Der Plus-Block ist deshalb halbiert, bis es wieder vorwärts geht.</p>`;
    if (w.deload) x += `<p class="hint" style="margin:0">Entlastungswoche: halbe Satzzahl, etwa 10 % weniger Gewicht. Danach geht die Steigerung meist schneller.</p>`;
    x += `<div class="row between small muted"><span>≈ ${estMinutes(w)} min</span><span>${w.neck ? 'mit Nacken &amp; Trapez · ' : ''}${w.plusN ? 'mit Plus-Block' : ''}</span></div>`;
    x += workoutPreview(w);
    x += `<button class="btn" data-act="start" data-kind="main">${label}</button>`;
    return x;
  };
  const extraBlock = (kind, note) => {
    const x = extraWorkout(kind);
    return `<div class="stack"><h2 class="display">${x.title}</h2><span class="muted">${esc(x.focus)}</span>${note ? `<span class="muted small">${note}</span>` : ''}</div>
      <div class="row between small muted"><span>≈ ${estMinutes(x)} min</span><span>${kind === 'mob' ? '+30 XP' : 'kurzes Training'}</span></div>
      ${workoutPreview(x)}<button class="btn ${kind === 'mob' ? 'ghost' : ''}" data-act="start" data-kind="${kind}">${kind === 'mob' ? 'Mobilität starten' : 'Feinschliff starten'}</button>`;
  };

  if (plan.type === 'main') {
    h += `<h1 class="display">${first ? 'Los geht’s' : 'Trainingstag'}</h1></div>`;
    h += kcalCard();
    if (!first) h += weekDots(today);
    if (first) h += `<div class="card moss small"><b>So funktioniert es</b><span>Di, Do und Sa sind die drei Haupttrainings, am Montag folgt ein kurzer Feinschliff (sonst am Freitag) und an den freien Tagen 10 Minuten Mobilität. Beim ersten Training fragt Agon bei jeder Übung nach dem Gewicht.</span></div>`;
    h += mainBlock(first ? 'Erstes Training starten' : 'Training starten');
  } else if (plan.type === 'done') {
    const todays = state.sessions.filter(s => s.date === ti);
    h += `<h1 class="display">Heute erledigt</h1></div>`;
    h += kcalCard();
    h += todays.map(s => `<div class="card moss"><div class="row between"><b>${esc(s.title)}</b><span class="num small">${s.end ? Math.round((s.end - s.start) / 60000) : 0} min · +${(xpData.per[s.id]?.xp || 0).toLocaleString('de-CH')} XP</span></div><button class="link" data-act="summary" data-id="${s.id}" style="text-align:left">Zusammenfassung ansehen</button></div>`).join('');
    h += weekDots(today);
    const nd = upcomingDates(today, 1, state.settings, false)[0];
    h += `<div class="stack"><span class="eyebrow">Nächstes Training · ${DAY_LONG[nd.getDay()]}, ${fmtDate(nd)}</span></div>`;
    h += `<div class="stack"><h2 class="display">${esc(w.title)}</h2><span class="muted">${esc(w.focus)}</span>${mainMeta(w)}</div>`;
    h += workoutPreview(w);
    h += `<div class="row wrap" style="gap:16px"><button class="link" data-act="start" data-kind="main">Trotzdem noch trainieren</button>${todays.some(s => s.kind === 'mob') ? '' : '<button class="link" data-act="start" data-kind="mob">Mobilität machen</button>'}</div>`;
  } else {
    h += `<h1 class="display">${plan.type === 'fein' ? 'Feinschliff' : 'Ruhetag'}</h1></div>`;
    h += kcalCard();
    if (!first) h += weekDots(today);
    if (ws.missed > 0) h += `<div class="card wood"><b>${ws.missed === 1 ? 'Ein Training' : `${ws.missed} Trainings`} diese Woche verpasst</b><span class="small">Hol es heute nach, der Plan geht danach normal weiter.</span><button class="btn" data-act="start" data-kind="main">${esc(w.title)} nachholen</button></div>`;
    if (plan.type === 'fein') h += extraBlock('fein', plan.fallback ? 'Am Montag ausgelassen, deshalb heute.' : 'Kurz und leicht, ohne Beine. Fällt er heute aus, geht er am Freitag.');
    else h += extraBlock('mob', '10 Minuten für Schultern, Hüfte und Haltung.');
    const nd = upcomingDates(today, 1, state.settings, false)[0];
    h += `<div class="stack" style="margin-top:8px"><span class="eyebrow">Nächstes Training · ${DAY_LONG[nd.getDay()]}, ${fmtDate(nd)}</span><h2 class="display">${esc(w.title)}</h2><span class="muted">${esc(w.focus)}</span>${mainMeta(w)}</div>`;
    h += workoutPreview(w);
    if (ws.missed === 0) h += `<button class="link" data-act="start" data-kind="main" style="align-self:flex-start">Trotzdem heute trainieren</button>`;
  }
  h += bwCard(today);
  return h;
}

// ---------- Training ----------
function curEx() { const a = state.active; return a.ex[a.cur.e]; }
function nextOpenSet(pe) { return pe.sets.findIndex(s => !s.done); }

function setRow(pe, s, j, a) {
  const isCur = a.cur.e === a.ex.indexOf(pe) && a.cur.s === j && !s.done;
  const k = s.kind === 'act' ? 'AKTIV' : s.kind === 'mini' ? `MINI ${j}` : `SATZ ${j + 1}`;
  const target = `${range(s.lo, s.hi)} <small>${unitTxt(pe.ex)}</small>`;
  const nw = noWeight(pe.ex);
  const mark = s.done ? '' : s.up ? ' <span class="up">↑</span>' : s.down ? ' <span class="down">↓</span>' : '';
  const wt = nw ? '' : s.w == null ? ' · <small>Gewicht wählen</small>' : ` · ${weightLabel(pe.ex, s.w)}${mark}`;
  const doneTxt = `${s.r}${unitOf(pe.ex) === 's' ? ' s' : ''}${nw ? '' : ` × ${weightLabel(pe.ex, s.w)}`}`;
  const st = s.done ? doneTxt : isCur ? 'jetzt' : '';
  return `<button class="set ${s.kind === 'mini' ? 'mini' : ''} ${s.done ? 'done' : ''} ${isCur ? 'cur' : ''}" data-act="setTap" data-j="${j}"><span class="k">${k}</span><span class="v">${s.done ? target : `${target}${wt}`}</span><span class="st">${st}</span></button>`;
}

function renderSession() {
  const a = state.active;
  const pe = curEx();
  const def = EX[pe.ex];
  let h = `<div class="sessbar"><div class="stack" style="gap:0"><span class="eyebrow">${esc(a.title)}</span><span class="num small muted" data-tick="elapsed">${mmss((Date.now() - a.start) / 1000)}</span></div><button class="btn ghost sm" data-act="endAsk">Beenden</button></div>`;
  h += `<div class="pager">${a.ex.map((x, j) => {
    const done = x.sets.every(s => s.done);
    return `<button class="${done ? 'done' : ''} ${j === a.cur.e ? 'cur' : ''} ${x.skipped ? 'skip' : ''} ${x.plus ? 'pl' : ''}" data-act="goEx" data-j="${j}">${j + 1}</button>`;
  }).join('')}</div>`;
  const tagTxt = pe.plus ? ' · Plus' : pe.bonus ? ' · Bonus Nacken &amp; Trapez' : '';
  h += `<div class="stack" style="gap:2px"><h1 class="display" style="font-size:26px">${esc(def.name)}</h1><span class="muted small">${a.kind === 'mob' ? 'Mobilität' : esc(typeLabel[pe.type])} · ${esc(def.muscles)}${tagTxt}</span></div>`;
  h += illu(pe.ex);
  const ws = warmupSets(pe);
  if (ws.length && !a.deload) {
    const wkey = `${a.id}-${a.cur.e}`;
    const on = state.warm[wkey] || [];
    h += `<div class="warm"><span class="lbl">Aufwärmen</span>${ws.map((x, j) => `<button class="${on.includes(j) ? 'on' : ''}" data-act="warm" data-j="${j}">${esc(x.label)} × ${x.r}</button>`).join('')}</div>`;
  }
  h += `<div class="sets">${pe.sets.map((s, j) => setRow(pe, s, j, a)).join('')}</div>`;
  const prev = pe.sets.filter(s => s.prev).map(s => `${weightLabel(pe.ex, s.prev.w).replace(' kg', '')} × ${s.prev.r}${s.prev.rir != null ? ` (${RIR_LABEL[s.prev.rir].toLowerCase()})` : ''}`);
  if (prev.length) {
    const why = [];
    if (pe.sets.some(s => s.up)) why.push('<span class="up">↑</span> = mehr Gewicht, weil du das Ziel erreicht hast');
    if (pe.sets.some(s => s.down)) why.push('<span class="down">↓</span> = etwas leichter, weil die Wiederholungen unter dem Ziel lagen');
    h += `<p class="hint" style="margin:0">Letztes Mal: <b>${prev.join(' · ')}</b>${why.length ? ` · ${why.join(' · ')}.` : ''}</p>`;
  }
  else if (!noWeight(pe.ex) && pe.sets[0].w == null) h += `<p class="hint" style="margin:0">Erstes Mal bei dieser Übung: Wähle ein Gewicht, mit dem du knapp das obere Ende schaffst. ${pe.type === 'rpt' ? 'Die weiteren Sätze rechnet Agon aus.' : pe.type === 'kino' ? 'Beginne leicht und steigere jeden Satz.' : ''}</p>`;
  if (pe.plus) h += `<p class="hint" style="margin:0">Plus-Übung: 1–2 Wiederholungen Reserve lassen, nicht bis zum Versagen.</p>`;
  if (EX[pe.ex].eq === 'bw' && unitOf(pe.ex) !== 's') h += `<p class="hint" style="margin:0">Schaffst du alle Sätze am oberen Ende, nimm beim nächsten Mal etwas Gewicht dazu.</p>`;

  const open = nextOpenSet(pe);
  const last = a.cur.e === a.ex.length - 1;
  h += `<div class="spacer"></div>`;
  if (open >= 0) {
    if (a.cur.s !== open) a.cur.s = open;
    h += `<button class="btn" data-act="setStart">${unitOf(pe.ex) === 's' ? 'Zeit starten' : 'Satz starten'}</button>`;
    h += `<div class="row between"><button class="link" data-act="skipEx">Übung überspringen</button><button class="link" data-act="info" data-ex="${pe.ex}">Anleitung</button></div>`;
  } else {
    h += last ? `<button class="btn wood" data-act="finish">${a.kind === 'main' ? 'Training abschliessen' : 'Abschliessen'}</button>` : `<button class="btn" data-act="nextEx">Nächste Übung</button>`;
  }
  return h;
}

function renderLayer() {
  const a = state.active;
  if (!a) return '';
  const pe = curEx();
  const def = EX[pe.ex];
  if (a.phase === 'running') {
    const s = pe.sets[a.cur.s];
    const lbl = s.kind === 'act' ? 'Aktivierungssatz' : s.kind === 'mini' ? `Mini-Satz ${a.cur.s} von ${pe.sets.length - 1}` : `Satz ${a.cur.s + 1} von ${pe.sets.length}`;
    const timed = unitOf(pe.ex) === 's';
    const big = timed ? `<span class="huge" data-tick="count">${s.hi}</span><span class="muted">Sekunden halten</span>` : `<span class="huge">${range(s.lo, s.hi)}</span><span class="muted">Wiederholungen</span>`;
    const wt = noWeight(pe.ex) ? '' : `<span class="display" style="font-size:30px;margin-top:14px">${s.w == null ? 'Gewicht wählen' : weightLabel(pe.ex, s.w)}</span>`;
    return `<div class="layer"><div class="inner"><span class="eyebrow">${esc(def.name)}</span><span class="muted">${lbl}</span>
      <div class="spacer"></div>
      <div class="center">${big}${wt}</div>
      <div class="center">${timed ? '' : '<span class="num muted" data-tick="setTime">0:00</span>'}</div>
      <div class="spacer"></div>
      <button class="btn" data-act="setDone">${timed ? 'Fertig' : 'Satz fertig'}</button>
      <button class="link" data-act="setCancel" style="align-self:center">Zurück</button></div></div>`;
  }
  if (a.phase === 'rest') {
    const nxt = a.ex[a.cur.e];
    const oi = nextOpenSet(nxt);
    const ns = nxt.sets[oi];
    const nl = s => `${range(s.lo, s.hi)} ${unitTxt(nxt.ex)}${noWeight(nxt.ex) ? '' : ` · ${s.w == null ? 'Gewicht wählen' : weightLabel(nxt.ex, s.w)}`}`;
    const nextTxt = a.restNewEx
      ? `<span class="muted small">Nächste Übung</span><b>${esc(EX[nxt.ex].name)}</b><span class="muted small">${ns ? nl(ns) : ''}</span>`
      : `<span class="muted small">Als Nächstes</span><b>${ns.kind === 'mini' ? 'Mini-Satz' : `Satz ${oi + 1}`} · ${nl(ns)}</b>`;
    const C = 2 * Math.PI * 88;
    return `<div class="layer"><div class="inner"><div class="center"><span class="eyebrow">Pause</span><span class="muted small">${esc(a.restInfo || '')}</span></div>
      <div class="ring" data-tick="ring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="88" fill="none" stroke="var(--line)" stroke-width="6"/><circle class="fg" cx="100" cy="100" r="88" fill="none" stroke="var(--moss)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="0"/></svg>
      <div class="lbl"><span class="big" data-tick="rest">${mmss((a.restEnd - Date.now()) / 1000)}</span><span class="num small muted">von ${mmss(a.restTotal)}</span></div></div>
      <div class="next">${nextTxt}</div>
      <div class="spacer"></div>
      <div class="btnrow"><button class="btn ghost" data-act="restAdd">+30 s</button><button class="btn" data-act="${a.restNewEx ? 'restSkip' : 'setStartRest'}">${a.restNewEx ? 'Weiter' : 'Satz starten'}</button></div></div></div>`;
  }
  return '';
}

// ---------- Sheets ----------
function stepper(id, value, unitLabel, f, placeholder = '') {
  return `<div class="stepper"><button data-act="step" data-f="${f}" data-d="-1" aria-label="weniger">−</button><div class="val"><input id="${id}" inputmode="decimal" value="${value}" placeholder="${placeholder}" aria-label="${unitLabel}"></div><button data-act="step" data-f="${f}" data-d="1" aria-label="mehr">+</button></div>`;
}
function renderSheet() {
  if (!sheet) return '';
  let body = '';
  if (sheet.type === 'log') {
    const pe = state.active.ex[sheet.e];
    const s = pe.sets[sheet.j];
    const eqk = EX[pe.ex].eq;
    const isBw = eqk === 'wbw' || eqk === 'bw';
    const timed = unitOf(pe.ex) === 's';
    body = `<div class="stack"><span class="eyebrow">${esc(EX[pe.ex].name)}</span><h2 class="display">Wie lief der Satz?</h2><span class="muted small">Ziel: ${range(s.lo, s.hi)} ${timed ? 'Sekunden' : 'Wiederholungen'}</span></div>
      <div class="stack"><span class="small muted">${timed ? 'Sekunden' : 'Wiederholungen'}</span>${stepper('inR', sheet.r, 'Wiederholungen', 'r')}</div>
      ${noWeight(pe.ex) ? '' : `<div class="stack"><span class="small muted">${isBw ? 'Zusatzgewicht in kg (0 = Körpergewicht)' : `Gewicht in kg${eqk === 'db' ? ' pro Hand' : ''}`}</span>${stepper('inW', sheet.w == null ? '' : fmtKg(sheet.w), 'Gewicht', 'w', 'kg')}<span class="small muted" style="text-align:center">Schritt ${fmtKg(EQ[eqk].inc)} kg</span></div>`}
      <div class="stack"><span class="small muted">Wie schwer war es? (freiwillig)</span><div class="rir">${[3, 2, 1, 0].map(v => `<button class="${sheet.rir === v ? 'on' : ''}" data-act="rir" data-v="${v}">${RIR_LABEL[v]}</button>`).join('')}</div>
      <span class="small muted">Leicht: 3 oder mehr Wiederholungen wären noch gegangen. Gut: 2. Hart: 1. Versagen: keine mehr.</span></div>
      <button class="btn" data-act="logSave">Speichern</button>`;
  } else if (sheet.type === 'weight') {
    const pe = state.active.ex[sheet.e];
    const s = pe.sets[sheet.j];
    const eqk = EX[pe.ex].eq;
    const isBw = eqk === 'wbw' || eqk === 'bw';
    body = `<div class="stack"><span class="eyebrow">${esc(EX[pe.ex].name)}</span><h2 class="display">Mit welchem Gewicht?</h2><span class="muted small">Ziel: ${range(s.lo, s.hi)} ${unitTxt(pe.ex)}. Wähle ein Gewicht, mit dem du knapp das obere Ende schaffst.${pe.type === 'kino' ? ' Bei Kino Reps beginnst du leicht und steigerst jeden Satz.' : ''}</span></div>
      <div class="stack"><span class="small muted">${isBw ? 'Zusatzgewicht in kg (0 = Körpergewicht)' : `Gewicht in kg${eqk === 'db' ? ' pro Hand' : ''}`}</span>${stepper('inW', fmtKg(sheet.w), 'Gewicht', 'w')}<span class="small muted" style="text-align:center">Schritt ${fmtKg(EQ[eqk].inc)} kg${eqk === 'bb' ? ' · leere Stange = 20 kg' : ''}</span></div>
      <button class="btn" data-act="weightSave">Satz starten</button>`;
  } else if (sheet.type === 'info') {
    const d = EX[sheet.ex];
    body = `<div class="stack"><span class="eyebrow">Anleitung</span><h2 class="display">${esc(d.name)}</h2><span class="muted small">${esc(d.muscles)} · ${esc(EQ[d.eq].label)}</span></div>
      ${illu(sheet.ex, false)}
      <ol class="steps">${d.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
      <div class="stack"><span class="eyebrow">Darauf achten</span><ul class="tips">${d.tips.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <button class="btn ghost" data-act="closeSheet">Schliessen</button>`;
  } else if (sheet.type === 'end') {
    const n = state.active.ex.reduce((s, e) => s + e.sets.filter(x => x.done).length, 0);
    body = `<div class="stack"><h2 class="display">Beenden?</h2><span class="muted small">${n} Sätze erledigt. Beim Abschliessen werden sie gespeichert${state.active.kind === 'main' ? ' und zählen fürs Programm' : ''}.</span></div>
      ${n ? '<button class="btn wood" data-act="finish">Jetzt abschliessen</button>' : ''}
      ${sheet.confirmDiscard ? '<button class="btn danger" data-act="discard">Wirklich verwerfen</button>' : '<button class="btn ghost" data-act="discardAsk">Verwerfen</button>'}
      <button class="btn ghost" data-act="closeSheet">Weitermachen</button>`;
  } else if (sheet.type === 'meas') {
    const snap = figure(state).snap;
    const p = state.profile || {};
    const base = [];
    if (!p.height) base.push(['height', 'Körpergrösse', 'Ohne Schuhe, an der Wand gemessen.']);
    if (!p.wrist) base.push(['wrist', 'Handgelenk', 'Dünnste Stelle zwischen Hand und dem vorstehenden Handgelenkknochen.']);
    body = `<div class="stack"><span class="eyebrow">Massband</span><h2 class="display">Messung eintragen</h2><span class="muted small">Leere Felder bleiben beim letzten Wert. Alle 2 Wochen reicht.</span></div>
      <div class="measguide">${MEAS_SVG}<ul class="tips">
        <li>Morgens vor dem Essen und vor dem Training, der Pump verfälscht die Werte.</li>
        <li>Band straff, ohne einzuschneiden, und waagrecht rundherum. Vor dem Spiegel kontrollieren.</li>
        <li>Arme und Beine immer auf der gleichen Seite messen.</li>
        <li>Jeden Wert zweimal messen und den Mittelwert eintragen.</li>
      </ul></div>
      ${base.length ? `<div class="measgrid"><span class="eyebrow">Grundlage, einmalig</span>${base.map(([k, l, hnt]) => `<label class="mfield" for="m_${k}"><span><b>${l}</b><small>${hnt}</small></span><input id="m_${k}" inputmode="decimal" placeholder="cm"></label>`).join('')}</div>` : ''}
      <div class="measgrid">${MEASURES.map((m, j) => `<label class="mfield" for="m_${m.k}"><span><b><span class="mno">${j + 1}</span>${m.label}</b><small>${m.hint}</small></span><input id="m_${m.k}" inputmode="decimal" placeholder="${snap[m.k] ? fmtKg(snap[m.k]) : 'cm'}"></label>`).join('')}</div>
      <button class="btn" data-act="measSave">Speichern</button><button class="btn ghost" data-act="closeSheet">Abbrechen</button>`;
  } else if (sheet.type === 'photos') {
    const d = iso(new Date());
    body = `<div class="stack"><span class="eyebrow">Fortschrittsfotos · ${fmtShort(new Date())}</span><h2 class="display">Fotos aufnehmen</h2></div>
      <ul class="tips"><li>Gleicher Ort, gleiches Licht, morgens vor dem Essen.</li><li>Handy auf Brusthöhe, etwa 2 m Abstand, Selbstauslöser oder Spiegel.</li><li>Entspannt stehen, Arme locker, nicht anspannen. So sieht man die echte Veränderung.</li></ul>
      <div class="pshoot">${POSES.map(([k, l]) => {
        const pp = photoOf(d, k);
        return `<div class="pslot">${pp ? `<img src="${photoUrls.get(pp.id)}" alt="${l}">` : `<div class="pempty">${l}</div>`}
          <label class="btn ${pp ? 'ghost' : ''} sm" for="ph_${k}">${pp ? 'Ersetzen' : l}</label>
          <input type="file" id="ph_${k}" accept="image/*" data-change="photo" data-pose="${k}" hidden></div>`;
      }).join('')}</div>
      <button class="btn ghost" data-act="closeSheet">Fertig</button>`;
  } else if (sheet.type === 'photo') {
    const pp = photos.find(x => x.id === sheet.id);
    if (!pp) { sheet = null; return ''; }
    const pose = (POSES.find(x => x[0] === pp.pose) || [])[1] || '';
    body = `<div class="stack"><span class="eyebrow">${pose} · ${fmtShort(parseIso(pp.d))}</span></div>
      <img class="pbig" src="${photoUrls.get(pp.id)}" alt="${pose}, ${fmtShort(parseIso(pp.d))}">
      ${sheet.confirm ? '<button class="btn danger" data-act="photoDel">Foto wirklich löschen</button>' : '<button class="btn ghost" data-act="photoDelAsk">Foto löschen</button>'}
      <button class="btn ghost" data-act="closeSheet">Schliessen</button>`;
  } else if (sheet.type === 'compare') {
    const pd = photoDates();
    const from = sheet.from || pd[0], to = sheet.to || pd[pd.length - 1];
    const opt = sel => pd.map(d => `<option value="${d}" ${d === sel ? 'selected' : ''}>${fmtShort(parseIso(d))}</option>`).join('');
    body = `<div class="stack"><span class="eyebrow">Vergleich</span><h2 class="display">Vorher und nachher</h2></div>
      <div class="row between"><select class="sel" id="cmpFrom" data-change="cmpFrom">${opt(from)}</select><span class="muted">→</span><select class="sel" id="cmpTo" data-change="cmpTo">${opt(to)}</select></div>
      ${POSES.map(([k, l]) => {
        const a = photoOf(from, k), b = photoOf(to, k);
        if (!a && !b) return '';
        const im = (x, d) => (x ? `<img src="${photoUrls.get(x.id)}" alt="${l}, ${fmtShort(parseIso(d))}">` : '<div class="pempty">kein Foto</div>');
        return `<div class="stack"><span class="small muted">${l}</span><div class="pcmp">${im(a, from)}${im(b, to)}</div></div>`;
      }).join('')}
      <button class="btn ghost" data-act="closeSheet">Schliessen</button>`;
  } else if (sheet.type === 'reset') {
    body = `<div class="stack"><h2 class="display">Alle Daten löschen?</h2><span class="muted small">Alle Trainings, Messungen, Punkte und Gewichte werden gelöscht. Sichere vorher eine Kopie.</span></div>
      <button class="btn danger" data-act="resetDo">Endgültig löschen</button><button class="btn ghost" data-act="closeSheet">Abbrechen</button>`;
  }
  return `<div class="sheet-bg" data-act="closeSheet"></div><div class="sheet" role="dialog">${body}</div>`;
}

// ---------- Abschluss ----------
function renderSummary(xpData, fig) {
  const s = state.sessions.find(x => x.id === state.summary.id);
  if (!s) { state.summary = null; return renderToday(xpData, fig); }
  const px = xpData.per[s.id] || { xp: 0, parts: [], prs: [] };
  const mins = s.end ? Math.round((s.end - s.start) / 60000) : 0;
  const before = rankFor(xpData.total - px.xp, state);
  const after = rankFor(xpData.total, state);
  const up = state.summary.fresh && after.idx > before.idx;
  let h = '';
  if (up) h += `<div class="card wood center" style="padding:26px 16px"><span class="eyebrow">Neuer Rang</span><span class="display" style="font-size:40px;color:var(--wood)">${after.rank.name}</span><span class="muted small">${after.rank.gr}</span></div>`;
  h += `<div class="stack"><span class="muted small">${esc(s.title)} · ${mins} min</span><h1 class="display">${s.kind === 'mob' ? 'Mobilität erledigt' : s.kind === 'fein' ? 'Feinschliff erledigt' : 'Training abgeschlossen'}</h1></div>`;
  for (const exId of px.prs) {
    const e = s.ex.find(x => x.ex === exId);
    const top = e.sets.filter(x => x.done && x.kind !== 'mini').sort((a, b) => b.w - a.w || b.r - a.r)[0];
    h += `<div class="card wood" style="gap:2px"><span class="muted small">Neuer Rekord</span><b class="display" style="font-size:18px">${esc(EX[exId].name)} ${weightLabel(exId, top.w)} × ${top.r}</b></div>`;
  }
  const ups = s.ex.filter(e => !e.skipped && !noWeight(e.ex) && EX[e.ex].eq !== 'bw' && e.sets.some(x => x.done && x.r >= x.hi));
  if (ups.length && state.summary.fresh && s.kind !== 'mob' && !s.deload) h += `<p class="hint" style="margin:0">Nächstes Mal mehr Gewicht bei: <b>${ups.map(e => esc(EX[e.ex].name)).join(', ')}</b></p>`;
  h += `<div class="parts">${px.parts.map(([l, p]) => `<div><span>${esc(l)}</span><span class="p">+${p.toLocaleString('de-CH')}</span></div>`).join('')}<div class="tot"><span>Total</span><span class="p">+${px.xp.toLocaleString('de-CH')} XP</span></div></div>`;
  h += rankLine(xpData);
  h += `<button class="btn" data-act="summaryClose">Fertig</button>`;
  return h;
}

// ---------- Körper ----------
function renderBody(xpData, fig) {
  const t = fig.t;
  const n = nutrition(state);
  let h = `<div class="stack"><span class="eyebrow">Körper</span><h1 class="display">Griechische Figur</h1></div>`;
  h += `<div class="card"><div class="row between"><span class="display" style="font-size:44px">${fig.score == null ? '–' : pct(fig.score)}</span><span class="small muted" style="text-align:right">${fig.have} von ${FIG_COMPONENTS} Werten<br>erfasst</span></div>
    <div class="figbar big"><i style="width:${fig.score == null ? 0 : Math.round(fig.score * 100)}%"></i></div>
    ${t ? '' : '<span class="small"><b>Zuerst Grösse und Handgelenk eintragen.</b> Daraus berechnet Agon deine Zielmasse. Beides kannst du direkt bei «Messung eintragen» erfassen.</span>'}
    <span class="small muted">100 % entspricht den klassischen Proportionen aus deinem Handgelenk: schmale Taille, breite Schultern im goldenen Schnitt, passende Arme, Brust und Nacken, dazu Kraft. Wirst du besser, gibt es Punkte, entfernst du dich davon, gibt es Abzüge (50 XP pro Prozentpunkt).</span>
    <button class="btn" data-act="measOpen">Messung eintragen</button></div>`;
  h += `<div class="card"><span class="eyebrow">Kalorien</span>${n ? `<div class="row between"><span class="display" style="font-size:30px">${n.kcal.toLocaleString('de-CH')} kcal</span><span class="chipx">${n.phase === 'diaet' ? 'Diät' : 'Aufbau'}</span></div>
    <span class="small muted">Heute ${n.trainDay ? 'Trainingstag (+150)' : 'Ruhetag (−100)'}. Wochenschnitt ${n.base.toLocaleString('de-CH')} kcal. Agon passt die Zahl alle 2 Wochen an deinen Gewichtsverlauf an.</span>` : '<span class="small muted">Trag auf dem Heute-Screen dein Körpergewicht ein.</span>'}</div>`;
  const parts = new Map(fig.parts.map(p => [p.k, p]));
  const rows = [
    ['waist', 'Taille', t && t.waist, 'cm'], ['ratio', 'Schulter/Taille', 1.618, 'x'], ['chest', 'Brust', t && t.chest, 'cm'],
    ['arm', 'Oberarm', t && t.arm, 'cm'], ['neck', 'Nacken', t && t.neck, 'cm'], ['forearm', 'Unterarm', t && t.forearm, 'cm'],
    ['thigh', 'Oberschenkel', t && t.thigh, 'cm'], ['strength', 'Kraft', 1, '%'],
  ];
  h += `<div class="card"><span class="eyebrow">Dein Stand und dein Ziel</span><div class="comps">${rows.map(([k, l, tg, u]) => {
    const p = parts.get(k);
    const fmt = v => (u === 'cm' ? cm(v) : u === 'x' ? v.toFixed(2) : pct(v));
    const cur = p ? fmt(p.cur) : k === 'ratio' ? 'Schulter + Taille messen' : k === 'strength' ? 'nach dem Training' : 'noch nicht gemessen';
    return `<div class="comp"><div class="row between"><b>${l}</b><span class="num small">${cur}${tg ? ` <span class="muted">→ ${fmt(tg)}</span>` : ''}</span></div><span class="figbar"><i style="width:${p ? Math.round(p.score * 100) : 0}%"></i></span></div>`;
  }).join('')}</div>
    ${fig.bf != null ? `<span class="small">Körperfett nach Navy-Formel: <b>${fig.bf.toFixed(1)} %</b> (Ziel 10–12 %)</span>` : '<span class="small muted">Mit Grösse und Nacken schätzt Agon auch dein Körperfett.</span>'}</div>`;
  // Fortschrittsfotos
  const pd = photoDates();
  const lastD = pd[pd.length - 1];
  let ph = `<div class="card"><div class="row between"><span class="eyebrow">Fortschrittsfotos</span><span class="small muted">${lastD ? `zuletzt ${fmtShort(parseIso(lastD))}` : 'noch keine'}</span></div>`;
  if (lastD) {
    ph += `<div class="pgrid">${POSES.map(([k, l]) => {
      const pp = photoOf(lastD, k);
      return pp ? `<button class="pthumb" data-act="photoView" data-id="${pp.id}"><img src="${photoUrls.get(pp.id)}" alt="${l}, ${fmtShort(parseIso(lastD))}"><span>${l}</span></button>` : `<div class="pthumb empty"><span>${l}</span></div>`;
    }).join('')}</div>`;
    if (pd.length > 1) ph += `<button class="btn ghost" data-act="compareOpen">Vorher und nachher vergleichen</button>`;
  }
  const phDue = !lastD || daysSince(lastD) >= 28;
  ph += `<span class="small muted">${phDue ? 'Alle 4 Wochen vorne, seitlich und hinten.' : `Nächste Fotos ab ${fmtShort(addDays(parseIso(lastD), 28))}.`} Die Fotos bleiben nur auf diesem iPhone und kommen nur mit der Sicherung mit.</span>
    <button class="btn ${phDue ? '' : 'ghost'}" data-act="photosOpen">${lastD === iso(new Date()) ? 'Fotos von heute ergänzen' : 'Fotos aufnehmen'}</button></div>`;
  h += ph;

  const p = state.profile || {};
  h += `<div class="card"><span class="eyebrow">Grundlage</span>
    <div class="setting"><div class="t">Körpergrösse<span>für Taillenziel und Körperfett</span></div><div class="bwrow" style="width:130px"><input id="pHeight" inputmode="decimal" value="${p.height || ''}" placeholder="cm"></div></div>
    <div class="setting"><div class="t">Handgelenk<span>dünnste Stelle, bestimmt alle Zielmasse</span></div><div class="bwrow" style="width:130px"><input id="pWrist" inputmode="decimal" value="${p.wrist || ''}" placeholder="cm"></div></div>
    <button class="btn ghost" data-act="profileSave">Grundlage speichern</button>
    ${t && t.waistH ? `<span class="small muted">Taillenziel aus der Grösse (45 %): ${cm(t.waistH)}</span>` : ''}</div>`;
  if (xpData.deltas.length || (state.meas || []).length) {
    const ds = new Map(xpData.deltas.map(d => [d.d, d]));
    const ms = (state.meas || []).slice().sort((a, b) => b.d.localeCompare(a.d)).slice(0, 8);
    h += `<div class="card"><span class="eyebrow">Messungen</span><div class="parts">${ms.map(m => {
      const d = ds.get(m.d);
      const vals = MEASURES.filter(x => m[x.k]).map(x => `${x.label} ${fmtKg(m[x.k])}`).join(' · ');
      return `<div><span><b>${fmtShort(parseIso(m.d))}</b> <span class="muted small">${vals}</span></span><span class="p ${d && d.xp < 0 ? 'neg' : ''}">${d ? `${d.xp >= 0 ? '+' : ''}${d.xp} XP` : 'Start'}</span></div>`;
    }).join('')}</div></div>`;
  }
  return h;
}

// ---------- Statistik ----------
function lineChart(pts, unit, opts = {}) {
  if (!pts.length) return `<p class="muted small" style="margin:0">${opts.empty || 'Noch keine Daten.'}</p>`;
  const W = 320, H = 150, L = 36, R = 10, T = 12, B = 22;
  const vals = pts.map(p => p.v);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const padv = Math.max(1, (hi - lo) * 0.12); lo = Math.floor(lo - padv); hi = Math.ceil(hi + padv);
  const t0 = parseIso(pts[0].d).getTime(), t1 = parseIso(pts[pts.length - 1].d).getTime();
  const x = d => (pts.length === 1 || t1 === t0 ? L + (W - L - R) / 2 : L + (parseIso(d).getTime() - t0) / (t1 - t0) * (W - L - R));
  const y = v => T + (1 - (v - lo) / (hi - lo || 1)) * (H - T - B);
  const ticks = [lo, (lo + hi) / 2, hi];
  const g = ticks.map(v => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/><text x="${L - 6}" y="${y(v) + 3}" text-anchor="end">${Math.round(v)}</text>`).join('');
  const path = pts.map((p, j) => `${j ? 'L' : 'M'}${x(p.d).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ');
  const area = pts.length > 1 ? `<path d="${path} L${x(pts[pts.length - 1].d).toFixed(1)} ${H - B} L${x(pts[0].d).toFixed(1)} ${H - B} Z" fill="var(--moss-soft)"/>` : '';
  const lp = pts[pts.length - 1];
  const xl = `<text x="${L}" y="${H - 6}">${fmtShort(parseIso(pts[0].d))}</text>${pts.length > 1 ? `<text x="${W - R}" y="${H - 6}" text-anchor="end">${fmtShort(parseIso(lp.d))}</text>` : ''}`;
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Verlauf in ${unit}">${g}${area}<path d="${path}" fill="none" stroke="var(--moss)" stroke-width="2" stroke-linejoin="round"/>${pts.map(p => `<circle cx="${x(p.d)}" cy="${y(p.v)}" r="${p === lp ? 4 : 2}" fill="var(--moss)"/>`).join('')}${xl}</svg></div>`;
}

function calendar() {
  const today = new Date();
  const mon = mondayOf(today);
  const first = state.sessions.length ? mondayOf(parseIso(state.sessions.map(s => s.date).sort()[0])) : mon;
  const mainBy = {}, extraBy = {};
  state.sessions.forEach(s => { (isMain(s) ? mainBy : extraBy)[s.date] = true; });
  let rows = '';
  for (let w = 0; w < 10; w++) {
    const wm = addDays(mon, -7 * w);
    if (wm < first) break;
    let cells = '';
    for (let d = 0; d < 7; d++) {
      const day = addDays(wm, d);
      const k = iso(day);
      const planned = isTrainingDay(day, state.settings);
      let cls = '';
      if (mainBy[k]) cls = planned ? 'f' : 'e';
      else if (planned && day < today && k !== iso(today)) cls = 'x';
      else if (planned) cls = 't';
      else if (extraBy[k]) cls = 'o';
      cells += `<i class="${cls}" title="${fmtShort(day)}"></i>`;
    }
    rows += `<span class="wk">${fmtShort(wm).slice(0, 5)}</span>${cells}`;
  }
  return `<div class="cal"><span></span>${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => `<span class="h">${d}</span>`).join('')}${rows}</div>
    <div class="legend"><span>● Training</span><span>◐ nachgeholt</span><span>○ Feinschliff, Mobilität</span><span>◌ verpasst</span></div>`;
}

function renderStats(xpData) {
  const n = mainCount(state);
  const tl = blockTimeline();
  const end = projectEnd(state);
  const tot = totals(state);
  let h = `<div class="stack"><span class="eyebrow">Statistik</span><h1 class="display">Fortschritt</h1></div>`;
  const cur = workoutFor(n, state.settings);
  h += `<div class="card"><div class="row between"><b>Woche ${Math.min(MAIN_WEEKS, cur.week)} von ${MAIN_WEEKS}</b><span class="num small muted">${n} / ${MAIN_SESSIONS} Trainings</span></div>
    <div class="prog">${tl.map(b => { const len = b.to - b.from + 1; const done = Math.max(0, Math.min(len, n - b.from)); return `<i class="${b.deload ? 'dl' : ''}" style="flex:${len}"><b style="width:${(done / len) * 100}%"></b></i>`; }).join('')}</div>
    <div class="legend"><span>S&amp;D 24 Wo.</span><span>MEGA 12</span><span>Spez. 6</span><span>3er-Split 12</span><span>Entlastung 7</span></div>
    <span class="small">${esc(cur.block)} · ${esc(cur.phase)}, Woche ${cur.weekInBlock} von ${cur.blockWeeks}</span>
    ${end ? `<span class="small muted">Voraussichtlich fertig am ${fmtShort(end)}, wenn du alle Trainings machst.</span>` : '<span class="small">Programm abgeschlossen.</span>'}</div>`;
  h += `<div class="tiles"><div><b>${tot.sessions}</b><span>Haupttrainings</span></div><div><b>${tot.extra}</b><span>Feinschliff, Mobilität</span></div><div><b>${Math.round(tot.minutes / 60 * 10) / 10}</b><span>Stunden</span></div><div><b>${(tot.vol / 1000).toLocaleString('de-CH', { maximumFractionDigits: 1 })}</b><span>Tonnen bewegt</span></div></div>`;

  // Wochenvolumen pro Muskel
  const monIso = iso(mondayOf(new Date()));
  const vol = weekVolume(state, monIso);
  const prevVol = weekVolume(state, iso(addDays(mondayOf(new Date()), -7)), false);
  const fmtN = v => (Math.round(v * 2) / 2).toLocaleString('de-CH');
  h += `<div class="card"><div class="row between"><span class="eyebrow">Wochenvolumen</span><span class="small muted">harte Sätze, diese Woche</span></div><div class="vols">${MUSCLES.map(m => {
    const v = vol[m.k] || 0;
    const max = Math.max(m.hi * 1.3, v);
    const state_ = v >= m.lo ? (v > m.hi * 1.25 ? 'hi' : 'ok') : 'lo';
    return `<div class="vol ${state_}"><div class="row between"><span>${m.label}</span><span class="num small">${fmtN(v)} <span class="muted">/ ${m.lo}–${m.hi}</span></span></div>
      <span class="vbar"><em style="left:${(m.lo / max) * 100}%;width:${((m.hi - m.lo) / max) * 100}%"></em><i style="width:${Math.min(100, (v / max) * 100)}%"></i></span>
      <span class="small muted">letzte Woche ${fmtN(prevVol[m.k] || 0)}</span></div>`;
  }).join('')}</div><span class="small muted">Der helle Bereich ist das Ziel. Direkte Sätze zählen ganz, mittrainierte Muskeln halb. Die Woche füllt sich bis Samstag.</span></div>`;

  const withData = [...new Set(state.sessions.flatMap(s => s.ex.filter(e => e.sets.some(x => x.done) && !noWeight(e.ex) && unitOf(e.ex) !== 's').map(e => e.ex)))];
  const keys = KEY_LIFTS.filter(k => withData.includes(k));
  const others = withData.filter(k => !KEY_LIFTS.includes(k));
  if (!statEx || !withData.includes(statEx)) statEx = keys[0] || withData[0] || 'inc_bb_press';
  const ser = seriesFor(state, statEx);
  const bestV = ser.length ? Math.max(...ser.map(p => p.v)) : 0;
  const isAdd = EX[statEx].eq === 'wbw';
  h += `<div class="card"><div class="row between"><span class="eyebrow">Kraftverlauf</span><span class="num small" style="color:var(--moss)">${bestV ? `${fmtKg(Math.round(bestV * 2) / 2)} kg` : ''}</span></div>
    <div class="chips">${keys.map(k => `<button class="chip ${k === statEx ? 'on' : ''}" data-act="statEx" data-ex="${k}">${esc(EX[k].name.replace(' Langhantel', '').replace(' + Gewicht', ''))}</button>`).join('') || '<span class="small muted">Schlüsselübungen erscheinen nach dem ersten Training.</span>'}</div>
    ${others.length ? `<select class="sel" id="statSel" data-change="statSel"><option value="">Weitere Übungen …</option>${others.map(k => `<option value="${k}" ${k === statEx ? 'selected' : ''}>${esc(EX[k].name)}</option>`).join('')}</select>` : ''}
    ${lineChart(ser, 'kg', { empty: 'Noch keine Daten für diese Übung.' })}
    <span class="small muted">Geschätztes Maximum für eine Wiederholung${isAdd ? ', inklusive Körpergewicht' : ''}, aus dem besten Satz pro Training.</span></div>`;

  h += `<div class="card"><span class="eyebrow">Körpergewicht</span>${lineChart(state.bw.map(b => ({ d: b.d, v: b.kg })), 'kg', { empty: 'Trag dein Gewicht auf dem Heute-Screen ein.' })}</div>`;
  const waist = (state.meas || []).filter(m => m.waist).sort((a, b) => a.d.localeCompare(b.d)).map(m => ({ d: m.d, v: m.waist }));
  h += `<div class="card"><span class="eyebrow">Taille</span>${lineChart(waist, 'cm', { empty: 'Noch keine Messung.' })}</div>`;

  const bw = bwAt(state, iso(new Date()));
  h += `<div class="card"><span class="eyebrow">Relative Kraft · Kraftprüfungen</span>`;
  if (!bw) h += `<p class="small muted" style="margin:0">Dafür braucht Agon dein Körpergewicht.</p>`;
  for (const std of STANDARDS) {
    const val = standardValue(std, xpData.best[std.ex], bw);
    const lv = standardLevel(std, val);
    const max = std.lv[2] * 1.15;
    const w = Math.min(100, (val / max) * 100);
    const unit = std.mode === 'ratio' ? '× KG' : '% KG Zusatz';
    const shown = std.mode === 'ratio' ? val.toFixed(2) : Math.round(val * 100);
    h += `<div class="std"><span>${std.label}</span><span class="track"><i style="width:${w}%"></i>${std.lv.map(x => `<b style="left:${(x / max) * 100}%"></b>`).join('')}</span>
      <span class="lv">${val > 0 ? `${shown} ${unit} · ${lv >= 0 ? LEVEL_NAMES[lv] : 'unter Gut'}` : 'noch keine Daten'} · Ziel ${std.mode === 'ratio' ? std.lv.map(x => x.toFixed(2)).join(' / ') : std.lv.map(x => `${x * 100} %`).join(' / ')}</span></div>`;
  }
  h += `<span class="small muted">Die Striche markieren Gut, Stark und Göttlich aus dem Buch, gemessen an deinem Körpergewicht.</span></div>`;
  h += `<div class="card"><span class="eyebrow">Trainingskalender</span>${calendar()}</div>`;
  return h;
}

// ---------- Ränge ----------
function renderRanks(xpData, fig) {
  const r = rankFor(xpData.total, state);
  const done = state.labours || {};
  let h = `<div class="stack"><span class="eyebrow">Dein Rang</span><h1 class="display" style="color:var(--wood);font-size:40px">${r.rank.name}</h1><span class="muted">${r.rank.gr} · ${xpData.total.toLocaleString('de-CH')} XP</span></div>`;
  if (r.next) h += `<div class="stack"><div class="xpbar" style="height:6px"><i style="width:${Math.round(r.progress * 100)}%"></i></div><span class="small muted">${r.gated ? 'Für «Gott» brauchst du zusätzlich alle zwölf Arbeiten und das ganze Programm.' : `Noch ${(r.next.xp - xpData.total).toLocaleString('de-CH')} XP bis ${r.next.name}`}</span></div>`;
  h += figLine(fig);
  h += `<div class="card"><div class="row between"><span class="eyebrow">Wochenserie</span><span class="num small">${xpData.streak} ${xpData.streak === 1 ? 'Woche' : 'Wochen'}</span></div><span class="small muted">Jede volle Woche (3 von 3 Haupttrainings) in Folge gibt +10 % auf alle Punkte der nächsten Woche, maximal +50 %.</span></div>`;
  h += `<div class="ladder">${RANKS.map((k, j) => ({ k, j })).reverse().map(({ k, j }) => `<div class="${j === r.idx ? 'cur' : j < r.idx ? 'reached' : 'locked'}"><span class="i">${j + 1}</span><span class="nm">${k.name}<span class="gr">${k.gr}</span></span><span class="x">${k.xp.toLocaleString('de-CH')}${j === RANKS.length - 1 ? ' + alles' : ''}</span></div>`).join('')}</div>`;
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  h += `<div class="card"><div class="row between"><span class="eyebrow">Die zwölf Arbeiten des Herakles</span><span class="num small">${Object.keys(done).length} / 12</span></div><div class="labs">${LABOURS.map((l, j) => `<div class="lab ${done[l.id] ? 'ok' : ''}"><span class="no">${roman[j]}</span><span class="tx"><b>${l.name}</b><small>${l.text}</small>${done[l.id] ? `<small class="okd">erfüllt am ${fmtShort(parseIso(done[l.id]))} · +${LABOUR_XP.toLocaleString('de-CH')} XP</small>` : l.manual ? `<button class="link" data-act="labour" data-id="${l.id}">Geschafft, eintragen</button>` : ''}</span></div>`).join('')}</div></div>`;
  h += `<div class="card"><span class="eyebrow">Kraftprüfungen</span>${STANDARDS.map(std => {
    const lv = xpData.stdLv[std.ex] ?? -1;
    return `<div class="setting"><div class="t">${std.label}<span>${std.reps} Wdh. · ${std.mode === 'ratio' ? `${std.lv.map(t => `${t}×`).join(' / ')} KG` : `${std.lv.map(t => `+${t * 100} %`).join(' / ')} KG`}</span></div><span class="small" style="color:${lv >= 0 ? 'var(--wood)' : 'var(--stone)'}">${lv >= 0 ? LEVEL_NAMES[lv] : 'offen'}</span></div>`;
  }).join('')}<span class="small muted">Gut +300, Stark +600, Göttlich +1000 XP.</span></div>`;
  h += `<div class="card soft"><span class="eyebrow">Punkte</span><div class="parts">
    <div><span>Arbeitssatz</span><span class="p">10</span></div><div><span>Haupttraining abgeschlossen</span><span class="p">100</span></div>
    <div><span>Feinschliff abgeschlossen</span><span class="p">50</span></div><div><span>Mobilitätsblock</span><span class="p">30</span></div>
    <div><span>Neuer Rekord pro Übung</span><span class="p">50</span></div><div><span>Steigerung umgesetzt</span><span class="p">20</span></div>
    <div><span>Volle Woche</span><span class="p">100</span></div><div><span>Phase abgeschlossen</span><span class="p">500</span></div>
    <div><span>Körpergewicht pro Woche</span><span class="p">10</span></div><div><span>Figur, pro Prozentpunkt besser oder schlechter</span><span class="p">±50</span></div>
    <div><span>Arbeit des Herakles</span><span class="p">2 000</span></div></div></div>`;
  return h;
}

// ---------- Einstellungen ----------
function renderSettings() {
  const st = state.settings;
  const a = Object.entries(SPEC.A).map(([k, v]) => `<option value="${k}" ${st.specA === k ? 'selected' : ''}>${v.label}</option>`).join('');
  const b = Object.entries(SPEC.B).map(([k, v]) => `<option value="${k}" ${st.specB === k ? 'selected' : ''}>${v.label}</option>`).join('');
  const order = [1, 2, 3, 4, 5, 6, 0];
  const sw = (id, on, title, sub) => `<div class="setting"><div class="t">${title}<span>${sub}</span></div><label class="switch"><input type="checkbox" id="${id}" data-change="${id}" ${on ? 'checked' : ''}><span></span></label></div>`;
  return `<div class="stack"><span class="eyebrow">Einstellungen</span><h1 class="display">Agon</h1></div>
  <div class="card"><span class="eyebrow">Plan</span>
    <div class="setting"><div class="t">Haupttrainings<span>Genau 3 Tage mit Pause dazwischen</span></div></div>
    <div class="days">${order.map(d => `<button class="${st.days.includes(d) ? 'on' : ''}" data-act="day" data-d="${d}">${DAY_NAMES[d]}</button>`).join('')}</div>
    ${sw('plus', st.plus, 'Plus-Blöcke', 'Zusatzsätze für Schultern, obere Brust, Rücken, Arme und Bauch')}
    ${sw('fein', st.fein, 'Feinschliff am Montag', 'Kurzes viertes Training, sonst am Freitag')}
    ${sw('neckSat', st.neckSat, 'Nacken &amp; Trapez', 'Jedes dritte Haupttraining der Woche, am Schluss')}
    ${sw('deadliftAlt', st.deadliftAlt, 'Kreuzheben im Wechsel', 'Jedes zweite Workout B mit Sumo-Kreuzheben statt der normalen Beinübungen')}
    <div class="setting"><div class="t">Spezialisierung Tag A</div><select class="sel" id="specA2" data-change="specA">${a}</select></div>
    <div class="setting"><div class="t">Spezialisierung Tag B</div><select class="sel" id="specB2" data-change="specB">${b}</select></div>
  </div>
  <div class="card"><span class="eyebrow">Daten</span>
    <span class="small muted">Deine Daten liegen nur auf diesem iPhone. Sichere regelmässig eine Kopie in iCloud Drive.</span>
    <button class="btn ghost" data-act="export">Sicherung speichern</button>
    <label class="btn ghost" for="importIn">Sicherung oder Startwerte laden</label><input type="file" id="importIn" accept="application/json,.json" data-change="import" hidden>
    <button class="link" data-act="resetAsk" style="align-self:flex-start;color:var(--danger)">Alle Daten löschen</button>
  </div>
  <div class="card soft small muted"><span>Trainingsplan nach dem Greek God Program 2.0 von Greg O'Gallagher (Kinobody), erweitert mit Agon Plus. Agon ist eine private App ohne Verbindung zu Kinobody.</span><span class="num">Version ${window.AGON_VERSION || ''}</span></div>`;
}

// ---------- Render ----------
function render() {
  const xpData = computeXP(state);
  const fig = figure(state, xpData.best);
  let main = '';
  if (view === 'today') {
    if (state.summary) main = renderSummary(xpData, fig);
    else if (state.active) main = renderSession();
    else main = renderToday(xpData, fig);
  } else if (view === 'body') main = renderBody(xpData, fig);
  else if (view === 'stats') main = renderStats(xpData);
  else if (view === 'ranks') main = renderRanks(xpData, fig);
  else main = renderSettings();
  const tabs = [['today', 'Heute'], ['body', 'Körper'], ['stats', 'Statistik'], ['ranks', 'Ränge'], ['settings', 'Mehr']];
  const inSession = state.active && view === 'today' && !state.summary;
  const nav = inSession ? '' : `<nav class="tabs">${tabs.map(([k, l]) => `<button class="${view === k ? 'on' : ''}" data-act="go" data-view="${k}">${ICONS[k]}<span>${l}</span></button>`).join('')}</nav>`;
  const scroll = window.scrollY;
  $('#app').innerHTML = `<main class="${inSession ? 'session' : ''}">${main}</main>${view === 'today' ? renderLayer() : ''}${renderSheet()}${nav}`;
  window.scrollTo(0, scroll);
  tick();
  manageTimers();
}

function tick() {
  const a = state.active;
  if (!a) return;
  const el = document.querySelector('[data-tick="elapsed"]');
  if (el) el.textContent = mmss((Date.now() - a.start) / 1000);
  if (a.phase === 'running') {
    const t = document.querySelector('[data-tick="setTime"]');
    if (t) t.textContent = mmss((Date.now() - a.setStart) / 1000);
    const c = document.querySelector('[data-tick="count"]');
    if (c) {
      const s = curEx().sets[a.cur.s];
      const left = s.hi - (Date.now() - a.setStart) / 1000;
      c.textContent = left > 0 ? String(Math.ceil(left)) : 'Zeit';
      c.classList.toggle('over', left <= 0);
    }
  }
  if (a.phase === 'rest') {
    const left = (a.restEnd - Date.now()) / 1000;
    const t = document.querySelector('[data-tick="rest"]');
    const ring = document.querySelector('[data-tick="ring"]');
    if (t) t.textContent = left > 0 ? mmss(left) : 'Los';
    if (ring) {
      const fg = ring.querySelector('circle.fg');
      const C = 2 * Math.PI * 88;
      const frac = Math.max(0, Math.min(1, left / a.restTotal));
      fg.setAttribute('stroke-dashoffset', String(C * (1 - frac)));
      ring.classList.toggle('over', left <= 0);
    }
  }
}
function manageTimers() {
  const need = state.active && view === 'today';
  if (need && !tickTimer) tickTimer = setInterval(tick, 250);
  if (!need && tickTimer) { clearInterval(tickTimer); tickTimer = null; }
  if (state.active) requestWake(); else releaseWake();
}
async function requestWake() {
  try { if ('wakeLock' in navigator && !wakeLock && document.visibilityState === 'visible') { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); } } catch { /* nicht verfügbar */ }
}
function releaseWake() { try { if (wakeLock) { wakeLock.release(); wakeLock = null; } } catch { /* egal */ } }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { if (state.active) requestWake(); render(); } });

// ---------- Aktionen ----------
function startSession(kind) {
  if (state.active) { view = 'today'; render(); return; }
  state.active = newSession(state, kind);
  state.summary = null;
  view = 'today';
  save(); render();
  window.scrollTo(0, 0);
}

function startSet() {
  const a = state.active;
  const pe = curEx();
  a.cur.s = nextOpenSet(pe);
  if (pe.sets[a.cur.s].w == null) {
    sheet = { type: 'weight', e: a.cur.e, j: a.cur.s, w: START_W[EX[pe.ex].eq] ?? 0 };
    render(); return;
  }
  a.phase = 'running'; a.setStart = Date.now();
  save(); render();
}
function saveWeight() {
  const a = state.active;
  const pe = a.ex[sheet.e];
  const w = parseFloat(String($('#inW').value).replace(',', '.'));
  if (!(w >= 0)) { toast('Bitte Gewicht eingeben'); return; }
  pe.sets[sheet.j].w = w; pe.sets[sheet.j].auto = false;
  if (pe.type === 'rp') pe.sets.forEach(x => { if (!x.done) x.w = w; });
  else deriveWeights(pe);
  sheet = null;
  a.phase = 'running'; a.setStart = Date.now();
  save(); render();
}

function openLog(e, j) {
  const a = state.active;
  const pe = a.ex[e];
  const s = pe.sets[j];
  // Mobilität: ohne Eintrag direkt erledigt
  if (a.kind === 'mob' && !s.done) { commitSet(pe, s, s.hi, 0); return; }
  let w = s.w;
  if (w == null) w = START_W[EX[pe.ex].eq] ?? 0;
  let r = s.done ? s.r : s.hi;
  if (!s.done && unitOf(pe.ex) === 's' && a.setStart) r = Math.max(1, Math.round((Date.now() - a.setStart) / 1000));
  sheet = { type: 'log', e, j, r, w, rir: s.done ? s.rir ?? null : null };
  render();
}

function saveLog() {
  const a = state.active;
  const pe = a.ex[sheet.e];
  const s = pe.sets[sheet.j];
  const r = parseInt($('#inR').value, 10);
  const wIn = $('#inW');
  const w = wIn ? parseFloat(String(wIn.value).replace(',', '.')) : 0;
  if (!(r >= 0)) { toast('Bitte einen Wert eingeben'); return; }
  if (!(w >= 0)) { toast('Bitte Gewicht eingeben'); return; }
  const rir = sheet.rir;
  sheet = null;
  if (pe.plus && rir === 0) setTimeout(() => toast('Plus-Sätze besser mit 1–2 Wiederholungen Reserve'), 400);
  if (s.done) { s.r = r; s.w = w; s.rir = rir; if (pe.type !== 'rp') deriveWeights(pe); save(); render(); return; }
  commitSet(pe, s, r, w, rir);
}

function commitSet(pe, s, r, w, rir = null) {
  const a = state.active;
  s.r = r; s.w = w; s.rir = rir; s.done = true; s.auto = false;
  if (a.setStart) s.t = Math.round((Date.now() - a.setStart) / 1000);
  if (pe.type === 'rp' && s.kind === 'act') pe.sets.forEach(x => { if (!x.done) x.w = w; });
  if (pe.type !== 'rp') deriveWeights(pe);
  const open = nextOpenSet(pe);
  const info = `${s.kind === 'mini' ? 'Mini-Satz' : 'Satz'} erledigt · ${r}${unitOf(pe.ex) === 's' ? ' s' : ''}${noWeight(pe.ex) ? '' : ` × ${weightLabel(pe.ex, w)}`}`;
  if (open >= 0) {
    const sec = pe.type === 'rp' ? 15 : pe.rest ?? 90;
    a.cur.s = open; a.restNewEx = false; a.restInfo = info;
    if (sec <= 0) { a.phase = 'ready'; save(); render(); return; }
    beginRest(sec);
  } else {
    const nxt = a.ex.findIndex((x, j) => j > a.cur.e && !x.skipped && x.sets.some(y => !y.done));
    if (nxt >= 0) {
      a.cur.e = nxt; a.cur.s = nextOpenSet(a.ex[nxt]); a.restNewEx = true;
      a.restInfo = `${EX[pe.ex].name} erledigt`;
      const sec = a.kind === 'mob' ? 15 : pe.restAfter || 120;
      beginRest(sec);
    } else {
      a.phase = 'ready'; save(); render();
    }
  }
}
function beginRest(sec) {
  const a = state.active;
  a.phase = 'rest'; a.restTotal = sec; a.restEnd = Date.now() + sec * 1000; a.setStart = null;
  save(); render();
}

function finishSession() {
  const a = state.active;
  if (!a) return;
  const done = a.ex.reduce((s, e) => s + e.sets.filter(x => x.done).length, 0);
  if (!done) { state.active = null; sheet = null; save(); render(); return; }
  const rec = {
    id: a.id, kind: a.kind || 'main', title: a.title, focus: a.focus, date: a.date, start: a.start, end: Date.now(), bw: bwAt(state, a.date),
    ex: a.ex.map(e => ({ ex: e.ex, type: e.type, plus: !!e.plus, skipped: e.skipped || !e.sets.some(x => x.done), sets: e.sets.map(x => ({ kind: x.kind, lo: x.lo, hi: x.hi, w: x.w, r: x.r, rir: x.rir ?? null, done: !!x.done, up: !!x.up, t: x.t })) })),
  };
  if (rec.kind === 'main') Object.assign(rec, { i: a.i, key: a.key, blockId: a.blockId, block: a.block, phase: a.phaseName, week: a.week, lastOfBlock: a.lastOfBlock, deload: !!a.deload });
  state.sessions.push(rec);
  state.active = null;
  state.summary = { id: rec.id, fresh: true };
  Object.keys(state.warm).forEach(k => { if (k.startsWith(`${a.id}-`)) delete state.warm[k]; });
  sheet = null;
  afterChange(); render(); window.scrollTo(0, 0);
}

function saveMeasurement() {
  const m = { d: iso(new Date()) };
  const num = id => { const el = $(id); return el ? parseFloat(String(el.value).replace(',', '.')) : NaN; };
  const before = computeXP(state).total;
  // Grundlage (nur angezeigt, solange sie fehlt)
  const hgt = num('#m_height'), wr = num('#m_wrist');
  let base = 0;
  if (hgt > 120 && hgt < 230) { state.profile = { ...(state.profile || {}), height: hgt }; base++; }
  if (wr > 10 && wr < 30) { state.profile = { ...(state.profile || {}), wrist: wr }; base++; }
  let n = 0;
  for (const x of MEASURES) {
    const v = num(`#m_${x.k}`);
    if (v > 10 && v < 250) { m[x.k] = v; n++; }
  }
  if (!n && !base) { toast('Bitte mindestens einen Wert eingeben'); return; }
  if (!n) { sheet = null; afterChange(); render(); toast('Grundlage gespeichert'); return; }
  const same = (state.meas || []).find(x => x.d === m.d);
  if (same) Object.assign(same, m); else state.meas = (state.meas || []).concat([m]);
  sheet = null;
  afterChange();
  const diff = computeXP(state).total - before;
  render();
  toast(diff ? `Messung gespeichert · ${diff > 0 ? '+' : ''}${diff} XP` : 'Messung gespeichert');
}

async function exportData() {
  toast('Sicherung wird erstellt …');
  const pics = [];
  for (const p of photos) { try { pics.push({ id: p.id, d: p.d, pose: p.pose, data: await blobToDataUrl(p.blob) }); } catch { /* Foto überspringen */ } }
  const data = JSON.stringify({ app: 'agon', exported: new Date().toISOString(), state: { ...state, active: null, summary: null }, photos: pics });
  const name = `agon-sicherung-${iso(new Date())}.json`;
  const blob = new Blob([data], { type: 'application/json' });
  try {
    const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: 'Agon Sicherung' }).catch(() => {}); return; }
  } catch { /* weiter mit Download */ }
  const u = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = u; link.download = name; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(u), 2000);
}
function importData(file) {
  const fr = new FileReader();
  fr.onload = async () => {
    let obj;
    try { obj = JSON.parse(fr.result); } catch { toast('Die Datei ist keine Agon-Datei'); return; }
    if (!obj || obj.app !== 'agon') { toast('Die Datei ist keine Agon-Datei'); return; }
    if (obj.kind === 'profil') {
      // Startwerte ergänzen, nichts überschreiben ausser gleiche Tage
      const pr = obj.profile || {};
      state.profile = { ...(state.profile || {}), ...(pr.height ? { height: pr.height } : {}), ...(pr.wrist ? { wrist: pr.wrist } : {}) };
      for (const m of obj.meas || []) {
        const same = (state.meas || []).find(x => x.d === m.d);
        if (same) Object.assign(same, m); else state.meas = (state.meas || []).concat([{ ...m }]);
      }
      for (const b of obj.bw || []) state.bw = state.bw.filter(x => x.d !== b.d).concat([{ d: b.d, kg: b.kg }]);
      state.bw.sort((x, y) => x.d.localeCompare(y.d));
      afterChange(); render(); toast('Startwerte übernommen');
      return;
    }
    const s = obj.state || obj;
    if (!Array.isArray(s.sessions)) { toast('Die Datei ist keine Agon-Sicherung'); return; }
    state = migrate({ ...s, active: null, summary: null });
    save();
    for (const p of obj.photos || []) { try { await putPhoto({ id: p.id, d: p.d, pose: p.pose, blob: await dataUrlToBlob(p.data) }); } catch { /* Foto überspringen */ } }
    await loadPhotos();
    render(); toast(`${mainCount(state)} Trainings geladen`);
  };
  fr.readAsText(file);
}

document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  const a = state.active;
  switch (act) {
    case 'go': view = el.dataset.view; sheet = null; render(); window.scrollTo(0, 0); break;
    case 'start': startSession(el.dataset.kind || 'main'); break;
    case 'setStart': case 'setStartRest': startSet(); break;
    case 'setCancel': a.phase = 'ready'; a.setStart = null; save(); render(); break;
    case 'setDone': openLog(a.cur.e, a.cur.s); break;
    case 'setTap': {
      const j = +el.dataset.j; const pe = curEx();
      if (pe.sets[j].done) { if (a.kind !== 'mob') openLog(a.cur.e, j); }
      else if (j === nextOpenSet(pe)) startSet();
      break;
    }
    case 'logSave': saveLog(); break;
    case 'weightSave': saveWeight(); break;
    case 'step': {
      const f = el.dataset.f, d = +el.dataset.d;
      if (f === 'r') { const i = $('#inR'); const v = Math.max(0, (parseInt(i.value, 10) || 0) + d); i.value = v; if (sheet) sheet.r = v; }
      else {
        const pe = a.ex[sheet.e]; const eq = EQ[EX[pe.ex].eq];
        const i = $('#inW'); const cur = parseFloat(String(i.value).replace(',', '.')) || 0;
        const v = Math.max(0, Math.round((cur + d * eq.inc) * 100) / 100); i.value = fmtKg(v); sheet.w = v;
      }
      break;
    }
    case 'restAdd': a.restEnd += 30000; a.restTotal += 30; save(); tick(); break;
    case 'restSkip': a.phase = 'ready'; a.restEnd = null; save(); render(); window.scrollTo(0, 0); break;
    case 'goEx': a.cur.e = +el.dataset.j; a.cur.s = Math.max(0, nextOpenSet(curEx())); a.phase = 'ready'; save(); render(); window.scrollTo(0, 0); break;
    case 'nextEx': {
      const nxt = a.ex.findIndex((x, j) => j > a.cur.e && x.sets.some(y => !y.done) && !x.skipped);
      const any = nxt >= 0 ? nxt : a.ex.findIndex(x => x.sets.some(y => !y.done) && !x.skipped);
      if (any >= 0) { a.cur.e = any; a.cur.s = nextOpenSet(a.ex[any]); save(); render(); window.scrollTo(0, 0); } else finishSession();
      break;
    }
    case 'skipEx': {
      curEx().skipped = true;
      const nxt = a.ex.findIndex((x, j) => j > a.cur.e && !x.skipped && x.sets.some(y => !y.done));
      if (nxt >= 0) { a.cur.e = nxt; a.cur.s = nextOpenSet(a.ex[nxt]); }
      save(); render(); window.scrollTo(0, 0);
      break;
    }
    case 'warm': {
      const key = `${a.id}-${a.cur.e}`; const j = +el.dataset.j;
      const on = state.warm[key] || []; state.warm[key] = on.includes(j) ? on.filter(x => x !== j) : [...on, j];
      save(); render(); break;
    }
    case 'finish': finishSession(); break;
    case 'endAsk': sheet = { type: 'end' }; render(); break;
    case 'discardAsk': sheet = { type: 'end', confirmDiscard: true }; render(); break;
    case 'discard': state.active = null; sheet = null; save(); render(); break;
    case 'info': sheet = { type: 'info', ex: el.dataset.ex }; render(); break;
    case 'closeSheet': sheet = null; render(); break;
    case 'summary': state.summary = { id: el.dataset.id, fresh: false }; render(); window.scrollTo(0, 0); break;
    case 'summaryClose': state.summary = null; save(); render(); window.scrollTo(0, 0); break;
    case 'bw': {
      const v = parseFloat(String($('#bwIn').value).replace(',', '.'));
      if (!(v > 30 && v < 250)) { toast('Bitte Gewicht in kg eingeben, z. B. 80.5'); return; }
      const d = iso(new Date());
      state.bw = state.bw.filter(b => b.d !== d).concat([{ d, kg: v }]).sort((x, y) => x.d.localeCompare(y.d));
      afterChange(); render(); toast(`${fmtKg(v)} kg gespeichert`);
      break;
    }
    case 'measOpen': sheet = { type: 'meas' }; render(); break;
    case 'measSave': saveMeasurement(); break;
    case 'profileSave': {
      const hgt = parseFloat(String($('#pHeight').value).replace(',', '.'));
      const wr = parseFloat(String($('#pWrist').value).replace(',', '.'));
      state.profile = { height: hgt > 120 && hgt < 230 ? hgt : null, wrist: wr > 10 && wr < 30 ? wr : (state.profile || {}).wrist };
      afterChange(); render(); toast('Grundlage gespeichert');
      break;
    }
    case 'labour': {
      state.labours = state.labours || {};
      state.labours[el.dataset.id] = iso(new Date());
      afterChange(); render(); toast(`Arbeit erfüllt · +${LABOUR_XP.toLocaleString('de-CH')} XP`);
      break;
    }
    case 'statEx': statEx = el.dataset.ex; render(); break;
    case 'day': {
      const d = +el.dataset.d; let days = state.settings.days.slice();
      days = days.includes(d) ? days.filter(x => x !== d) : [...days, d];
      if (days.length > 3) { toast('Genau 3 Trainingstage wählen'); return; }
      state.settings.days = days; save(); render();
      if (days.length < 3) toast('Wähle 3 Tage');
      break;
    }
    case 'export': exportData(); break;
    case 'resetAsk': sheet = { type: 'reset' }; render(); break;
    case 'resetDo': {
      state = blank(); sheet = null; save(); view = 'today';
      Promise.all(photos.map(p => deletePhoto(p.id))).then(loadPhotos).then(render);
      render(); toast('Alle Daten gelöscht');
      break;
    }
    case 'rir': {
      const v = +el.dataset.v;
      sheet.rir = sheet.rir === v ? null : v;
      el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.dataset.v === sheet.rir));
      break;
    }
    case 'photosOpen': sheet = { type: 'photos' }; render(); break;
    case 'photoView': sheet = { type: 'photo', id: el.dataset.id }; render(); break;
    case 'photoDelAsk': sheet.confirm = true; render(); break;
    case 'photoDel': deletePhoto(sheet.id).then(loadPhotos).then(() => { sheet = null; render(); toast('Foto gelöscht'); }); break;
    case 'compareOpen': sheet = { type: 'compare' }; render(); break;
    default: break;
  }
});

async function savePhoto(pose, file) {
  try {
    toast('Foto wird gespeichert …');
    const blob = await shrink(file);
    const d = iso(new Date());
    await putPhoto({ id: `${d}-${pose}`, d, pose, blob });
    await loadPhotos();
    render();
  } catch { toast('Das Foto konnte nicht gespeichert werden'); }
}

document.addEventListener('change', ev => {
  const el = ev.target.closest('[data-change]');
  if (!el) return;
  const k = el.dataset.change;
  if (k === 'specA' || k === 'specB') { state.settings[k] = el.value; save(); render(); }
  else if (['neckSat', 'deadliftAlt', 'plus', 'fein'].includes(k)) { state.settings[k] = el.checked; save(); render(); }
  else if (k === 'statSel') { if (el.value) { statEx = el.value; render(); } }
  else if (k === 'import') { if (el.files[0]) importData(el.files[0]); el.value = ''; }
  else if (k === 'photo') { if (el.files[0]) savePhoto(el.dataset.pose, el.files[0]); el.value = ''; }
  else if ((k === 'cmpFrom' || k === 'cmpTo') && sheet && sheet.type === 'compare') { sheet[k === 'cmpFrom' ? 'from' : 'to'] = el.value; render(); }
});

// Tageswechsel
setInterval(() => { if (!state.active && view === 'today' && !sheet) render(); }, 60000);

if (state.settings.days.length !== 3) state.settings.days = DEFAULT_SETTINGS.days.slice();
afterChange();
render();
loadPhotos().then(() => { if (photos.length) render(); });

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Für Tests
window.__agon = { get state() { return state; }, set state(v) { state = migrate(v); save(); render(); }, render };
