// Logik: Programmablauf, Gewichtsvorschläge, Punkte, Figur, Kalorien, Statistik
import {
  EX, EQ, KINO_STEP, BLOCKS, LOOP, SPEC, NECK_SAT, PLUS, FEIN, MOB, MAIN_SESSIONS, RANKS, STANDARDS, LEVEL_XP,
  KEY_LIFTS, LABOURS, LABOUR_XP, EX_MUSCLES,
} from './data.js';

export const DEFAULT_SETTINGS = { neckSat: true, deadliftAlt: true, specA: 'brust', specB: 'ruecken', days: [2, 4, 6], plus: true, fein: true };
export const DAY_NAMES = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
export const DAY_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
export const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

// ---------- Datum ----------
export const pad = n => String(n).padStart(2, '0');
export const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const mondayOf = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const wd = (x.getDay() + 6) % 7; return addDays(x, -wd); };
export const weekKey = s => iso(mondayOf(typeof s === 'string' ? parseIso(s) : s));
export const fmtDate = d => `${d.getDate()}. ${MONTHS[d.getMonth()]}`;
export const fmtShort = d => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)}`;

// ---------- Sitzungsarten ----------
export const isMain = s => !s.kind || s.kind === 'main';
export const mainSessions = state => state.sessions.filter(isMain);
export const mainCount = state => mainSessions(state).length;

// ---------- Programmablauf ----------
export function blockAt(i) {
  let start = 0;
  for (const b of BLOCKS) {
    const n = b.weeks * 3;
    if (i < start + n) return { b, k: i - start, start, n, round: 1 };
    start += n;
  }
  let round = 2;
  for (;;) {
    for (const b of LOOP) {
      const n = b.weeks * 3;
      if (i < start + n) return { b, k: i - start, start, n, round };
      start += n;
    }
    round++;
  }
}

export function workoutKey(i, settings) {
  const { b, k } = blockAt(i);
  if (b.split === 'ABC') return 'ABC'[k % 3];
  const key = k % 2 === 0 ? 'A' : 'B';
  if (key === 'B' && b.deadlift && settings.deadliftAlt && Math.floor(k / 2) % 2 === 1) return 'BD';
  return key;
}

// opts.plusMode: 'full' | 'ramp' (1 Satz) | 'half'
export function workoutFor(i, settings, opts = {}) {
  const { b, k, n } = blockAt(i);
  const key = workoutKey(i, settings);
  let title, focus, list;
  if (b.spec) {
    const side = key === 'A' ? 'A' : 'B';
    const choice = side === 'A' ? SPEC.A[settings.specA] || SPEC.A.brust : SPEC.B[settings.specB] || SPEC.B.ruecken;
    title = `Workout ${side} · ${choice.label}`;
    focus = side === 'A' ? 'Brust, Schultern, Trizeps' : 'Rücken, Bizeps, Beine';
    list = choice.list;
  } else {
    const w = b.w[key];
    title = w.title; focus = w.focus; list = w.list;
  }
  list = list.map(x => ({ ...x }));
  if (b.deload) title = `${title} · Entlastung`;
  const neck = settings.neckSat && !b.noNeckSat && i % 3 === 2;
  if (neck) list = list.concat(NECK_SAT.map(x => ({ ...x, bonus: true })));
  let plusN = 0;
  if (settings.plus && b.plus && PLUS[b.plus] && PLUS[b.plus][key]) {
    const mode = opts.plusMode || (i < 12 ? 'ramp' : 'full');
    const pl = PLUS[b.plus][key].map(x => {
      const nSets = mode === 'ramp' ? 1 : mode === 'half' ? Math.max(1, Math.floor(x.sets.length / 2)) : x.sets.length;
      return { ...x, sets: x.sets.slice(0, nSets), plus: true };
    });
    plusN = pl.length;
    list = list.concat(pl);
  }
  return {
    i, key, title, focus, list, neck, plusN,
    blockId: b.id, block: b.block, phase: b.phase, deload: !!b.deload,
    week: Math.floor(i / 3) + 1, weekInBlock: Math.floor(k / 3) + 1, blockWeeks: b.weeks,
    lastOfBlock: k === n - 1,
  };
}

export function extraWorkout(kind) {
  const w = kind === 'fein' ? FEIN : MOB;
  return { title: w.title, focus: w.focus, list: w.list.map(x => ({ ...x })), kind };
}

export function estMinutes(w) {
  let sec = 0;
  for (const t of w.list) {
    const n = t.type === 'rp' ? 1 : t.sets.length;
    const work = EX[t.ex].unit === 's' ? t.sets[0][1] : 40;
    sec += n * (work + (t.rest ?? 90)) + (t.type === 'rp' ? 3 * 30 : 0) + (t.warmup ? 180 : 0) + (w.kind === 'mob' ? 10 : 60);
  }
  return Math.max(5, Math.round(sec / 300) * 5);
}

// ---------- Gewichte ----------
export const roundTo = (x, step) => Math.max(0, Math.round(x / step) * step);
const r2 = x => Math.round(x * 100) / 100;
export const START_W = { bb: 20, db: 8, cable: 15, machine: 20, plate: 5, wbw: 0, bw: 0, none: 0 };
export const fmtKg = w => (w == null ? '–' : (Math.round(w * 100) / 100).toLocaleString('de-CH', { maximumFractionDigits: 2 }));
export const noWeight = exId => EX[exId].eq === 'none';
export const unitOf = exId => (EX[exId].unit === 's' ? 's' : 'r');

function findLast(state, exId, type, nSets) {
  let fallback = null;
  for (let s = state.sessions.length - 1; s >= 0; s--) {
    const ses = state.sessions[s];
    if (ses.deload || ses.kind === 'mob') continue;
    for (const e of ses.ex) {
      if (e.ex !== exId || e.skipped) continue;
      if (!e.sets.some(x => x.done && x.w != null)) continue;
      if (e.type === type && e.sets.length === nSets) return e;
      if (!fallback) fallback = e;
    }
  }
  return fallback;
}

export function planExercise(t, state, mods = {}) {
  const def = EX[t.ex], eq = EQ[def.eq];
  const sets = [];
  if (t.type === 'rp') {
    sets.push({ kind: 'act', lo: t.sets[0][0], hi: t.sets[0][1], w: null });
    const minis = mods.deload ? 1 : t.minis;
    for (let m = 0; m < minis; m++) sets.push({ kind: 'mini', lo: t.mini[0], hi: t.mini[1], w: null });
  } else {
    let src = t.sets;
    if (mods.deload) src = src.slice(0, Math.max(1, Math.ceil(src.length / 2)));
    for (const [lo, hi] of src) sets.push({ kind: 'work', lo, hi, w: null });
  }
  if (def.eq === 'none') {
    sets.forEach(s => { s.w = 0; });
    return { ex: t.ex, type: t.type, rest: t.rest, restAfter: t.restAfter, sets, plus: !!t.plus, bonus: !!t.bonus, skipped: false };
  }
  const last = findLast(state, t.ex, t.type, t.type === 'rp' ? 1 + t.minis : t.sets.length);
  const canUp = def.eq !== 'bw' && !mods.deload;
  if (last) {
    const ls = last.sets.filter(x => x.done && x.w != null);
    const allTop = last.sets.every(x => x.done && x.r >= x.hi);
    sets.forEach((s, j) => {
      const src = last.sets[j] && last.sets[j].done ? last.sets[j] : ls[Math.min(j, ls.length - 1)];
      let w = src.w;
      let up = false;
      if (canUp) {
        if (t.type === 'rpt') up = !!(last.sets[j] && last.sets[j].done && last.sets[j].r >= last.sets[j].hi);
        else up = allTop;
      }
      if (up) w = r2(w + eq.inc);
      // Ziel klar verfehlt: etwas leichter, damit die Wiederholungen wieder in den Bereich kommen
      let down = false;
      const ls_j = last.sets[j];
      if (canUp && !up && ls_j && ls_j.done && ls_j.r < ls_j.lo && w > 0) { w = roundTo(w * 0.95, eq.round); down = true; }
      if (mods.deload) w = roundTo(w * 0.9, eq.round);
      s.w = w; s.up = up; s.down = down; s.prev = ls_j && ls_j.done ? { w: ls_j.w, r: ls_j.r, rir: ls_j.rir } : null;
    });
  } else if (def.eq === 'bw') {
    sets.forEach(s => { s.w = 0; });
  } else if (def.eq === 'wbw') {
    sets.forEach(s => { s.w = null; s.auto = true; });
  } else {
    sets.forEach((s, j) => { if (j > 0) s.auto = true; });
  }
  return { ex: t.ex, type: t.type, rest: t.rest, restAfter: t.restAfter, warmup: t.warmup, drop: t.drop, bonus: !!t.bonus, plus: !!t.plus, optional: !!t.optional, sets, skipped: false };
}

// Fehlende Gewichte aus dem vorherigen Satz ableiten (erstes Training)
export function deriveWeights(pe) {
  const def = EX[pe.ex], eq = EQ[def.eq];
  const first = pe.sets[0];
  if (first.w == null) return;
  pe.sets.forEach((s, j) => {
    if (j === 0 || !s.auto || s.done) return;
    const prevW = pe.sets[j - 1].w;
    if (prevW == null) return;
    if (pe.type === 'rpt') {
      if (pe.drop && pe.drop.kg) s.w = Math.max(0, roundTo(prevW - (pe.drop.kg[j] || 0), eq.round));
      else s.w = roundTo(prevW * (1 - ((pe.drop && pe.drop.pct[j]) || 0)), eq.round);
    } else if (pe.type === 'kino') {
      s.w = r2(prevW + (KINO_STEP[def.eq] || 0));
    } else {
      s.w = first.w;
    }
  });
}

export function warmupSets(pe) {
  if (!pe.warmup) return [];
  const def = EX[pe.ex], eq = EQ[def.eq];
  const w = pe.sets[0].w;
  if (pe.warmup === 'bw') {
    const half = w ? roundTo(w / 2, eq.round) : 0;
    return [{ label: 'Körpergewicht', r: 5 }, half > 0 ? { label: `+${fmtKg(half)} kg`, r: 3 } : { label: 'Körpergewicht', r: 3 }];
  }
  if (w == null || w <= 0) return [{ label: '50 %', r: 6 }, { label: '70 %', r: 5 }, { label: '80 %', r: 3 }];
  return [[0.5, 6], [0.7, 5], [0.8, 3]].map(([p, r]) => ({ label: `${fmtKg(roundTo(w * p, eq.round))} kg`, r }));
}

export function weightLabel(exId, w) {
  const eq = EX[exId].eq;
  if (eq === 'none') return '';
  if (eq === 'wbw' || eq === 'bw') return w ? `+${fmtKg(w)} kg` : 'Körpergewicht';
  return `${fmtKg(w)} kg`;
}

export function newSession(state, kind = 'main') {
  const id = `s${Date.now()}`;
  const base = { id, kind, date: iso(new Date()), start: Date.now(), end: null, cur: { e: 0, s: 0 }, phase: 'ready', setStart: null, restEnd: null, restTotal: null };
  if (kind !== 'main') {
    const w = extraWorkout(kind);
    return { ...base, title: w.title, focus: w.focus, ex: w.list.map(t => planExercise(t, state)) };
  }
  const i = mainCount(state);
  const w = workoutFor(i, state.settings, { plusMode: plusMode(state, i) });
  return {
    ...base, i, key: w.key, title: w.title, focus: w.focus, blockId: w.blockId, block: w.block, phaseName: w.phase,
    week: w.week, lastOfBlock: w.lastOfBlock, deload: w.deload,
    ex: w.list.map(t => planExercise(t, state, { deload: w.deload })),
  };
}

// ---------- Körpergewicht ----------
export function bwAt(state, dateIso) {
  let v = null;
  for (const b of state.bw) { if (b.d <= dateIso) v = b.kg; }
  if (v == null && state.bw.length) v = state.bw[0].kg;
  return v;
}
export function bwAvg(state, days = 7) {
  if (!state.bw.length) return null;
  const last = parseIso(state.bw[state.bw.length - 1].d);
  const from = iso(addDays(last, -days + 1));
  const xs = state.bw.filter(b => b.d >= from).map(b => b.kg);
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function e1rm(exId, w, r, bw) {
  if (!r || w == null || unitOf(exId) === 's' || noWeight(exId)) return 0;
  const eq = EX[exId].eq;
  const load = eq === 'wbw' || eq === 'bw' ? (bw || 0) + w : w;
  return load * (1 + r / 30);
}

function sessionBest(e, bw) {
  let m = 0;
  for (const s of e.sets) if (s.done && s.kind !== 'mini') m = Math.max(m, e1rm(e.ex, s.w, s.r, bw));
  return m;
}

export function standardValue(std, e1, bw) {
  if (!bw || !e1) return 0;
  const atReps = e1 / (1 + std.reps / 30);
  return std.mode === 'ratio' ? atReps / bw : (atReps - bw) / bw;
}
export function standardLevel(std, val) {
  let lv = -1;
  std.lv.forEach((t, j) => { if (val >= t) lv = j; });
  return lv;
}

// ---------- Plus-Block an Fortschritt anpassen ----------
export function stagnating(state) {
  const main = mainSessions(state).filter(s => !s.deload);
  let n = 0;
  const names = [];
  for (const ex of KEY_LIFTS) {
    const vals = [];
    for (const s of main) {
      const bw = bwAt(state, s.date);
      let m = 0;
      for (const e of s.ex) if (e.ex === ex && !e.skipped) m = Math.max(m, sessionBest(e, bw));
      if (m) vals.push(m);
    }
    if (vals.length >= 3) {
      const before = Math.max(...vals.slice(0, -2));
      if (vals[vals.length - 1] <= before + 0.01 && vals[vals.length - 2] <= before + 0.01) { n++; names.push(EX[ex].name); }
    }
  }
  return { stuck: n >= 2, names };
}
export function plusMode(state, i) {
  if (i < 12) return 'ramp';
  return stagnating(state).stuck ? 'half' : 'full';
}

// ---------- Figur ----------
export function targets(profile) {
  const W = profile && profile.wrist;
  if (!W) return null;
  const chest = 6.5 * W;
  const waist = 0.7 * chest;
  return { chest, waist, shoulders: 1.618 * waist, arm: 0.36 * chest, forearm: 0.29 * chest, neck: 0.37 * chest, thigh: 0.53 * chest, waistH: profile.height ? 0.45 * profile.height : null };
}

export function snapshot(state, dateIso) {
  const snap = {};
  const ms = (state.meas || []).slice().sort((a, b) => a.d.localeCompare(b.d));
  for (const m of ms) {
    if (dateIso && m.d > dateIso) continue;
    for (const [k, v] of Object.entries(m)) if (k !== 'd' && v) snap[k] = v;
  }
  return snap;
}

export function navyBF(snap, height) {
  if (!snap.waist || !snap.neck || !height || snap.waist <= snap.neck) return null;
  const bf = 495 / (1.0324 - 0.19077 * Math.log10(snap.waist - snap.neck) + 0.15456 * Math.log10(height)) - 450;
  return Math.max(3, Math.min(50, bf));
}

const clamp01 = x => Math.max(0, Math.min(1, x));
const COMP = [
  { k: 'waist', label: 'Taille', w: 30, dir: 'down' },
  { k: 'ratio', label: 'Schulter/Taille', w: 25, dir: 'ratio' },
  { k: 'chest', label: 'Brust', w: 10, dir: 'up' },
  { k: 'arm', label: 'Oberarm', w: 10, dir: 'up' },
  { k: 'neck', label: 'Nacken', w: 5, dir: 'up' },
  { k: 'forearm', label: 'Unterarm', w: 5, dir: 'up' },
  { k: 'thigh', label: 'Oberschenkel', w: 5, dir: 'near' },
];
export const FIG_COMPONENTS = COMP.length + 1;

// Teilwerte 0..1 pro Mass. strength: 0..1 oder null
export function figureParts(snap, profile, strength) {
  const t = targets(profile);
  const parts = [];
  if (!t) return parts;
  for (const c of COMP) {
    if (c.k === 'ratio') {
      if (!snap.shoulders || !snap.waist) continue;
      const cur = snap.shoulders / snap.waist;
      parts.push({ ...c, cur, target: 1.618, score: clamp01((cur - 1.25) / (1.618 - 1.25)) });
      continue;
    }
    const cur = snap[c.k];
    if (!cur) continue;
    const tg = t[c.k];
    let score;
    if (c.dir === 'down') score = clamp01((tg * 1.25 - cur) / (tg * 0.25));
    else if (c.dir === 'up') score = clamp01((cur - tg * 0.8) / (tg * 0.2));
    else score = clamp01(1 - Math.abs(cur - tg) / (tg * 0.2));
    parts.push({ ...c, cur, target: tg, score });
  }
  if (strength != null) parts.push({ k: 'strength', label: 'Kraft', w: 10, dir: 'up', cur: strength, target: 1, score: clamp01(strength) });
  return parts;
}
export function scoreOf(parts, keys) {
  const ps = keys ? parts.filter(p => keys.includes(p.k)) : parts;
  const tw = ps.reduce((a, p) => a + p.w, 0);
  if (!tw) return null;
  return ps.reduce((a, p) => a + p.w * p.score, 0) / tw;
}

export function strengthScore(state, best) {
  const bw = bwAt(state, iso(new Date()));
  if (!bw) return null;
  const vals = [];
  for (const std of STANDARDS) {
    if (!best[std.ex]) continue;
    vals.push(clamp01(standardValue(std, best[std.ex], bw) / std.lv[2]));
  }
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function figure(state, best) {
  const snap = snapshot(state);
  const parts = figureParts(snap, state.profile, strengthScore(state, best || {}));
  const score = scoreOf(parts);
  return { snap, parts, score, have: parts.length, bf: navyBF(snap, state.profile && state.profile.height), t: targets(state.profile) };
}

// Veränderungen der Körperwerte von Messung zu Messung (nur Werte, die in beiden Messungen vorkommen)
export function figureDeltas(state) {
  const dates = [...new Set((state.meas || []).map(m => m.d))].sort();
  const out = [];
  let prev = null;
  for (const d of dates) {
    const parts = figureParts(snapshot(state, d), state.profile, null);
    if (prev) {
      const keys = parts.map(p => p.k).filter(k => prev.some(p => p.k === k));
      const a = scoreOf(prev, keys), b = scoreOf(parts, keys);
      if (a != null && b != null) {
        const pp = Math.round((b - a) * 1000) / 10;
        out.push({ d, pp, xp: Math.round(pp * 50) });
      }
    }
    prev = parts;
  }
  return out;
}

// ---------- Kalorien ----------
export function nutrition(state, today = new Date()) {
  const w = bwAvg(state) || bwAt(state, iso(today));
  if (!w) return null;
  const fig = figure(state);
  const bf = fig.bf;
  const t = fig.t;
  let ind = null;
  if (bf != null) ind = bf > 15 ? 'diaet' : bf <= 12 ? 'aufbau' : null;
  else if (t && fig.snap.waist) { const r = fig.snap.waist / t.waist; ind = r > 1.08 ? 'diaet' : r <= 1.03 ? 'aufbau' : null; }
  const nut = state.nutri || {};
  const phase = ind || nut.phase || 'diaet';
  let maint = bf != null ? (370 + 21.6 * w * (1 - bf / 100)) * 1.55 : w * 32;
  maint += nut.adj || 0;
  const base = phase === 'diaet' ? Math.max(1700, maint - 500) : maint + 250;
  const plan = dayPlan(state, today);
  const trainDay = plan.type === 'main' || state.sessions.some(s => isMain(s) && s.date === iso(today));
  const kcal = Math.round((base + (trainDay ? 150 : -100)) / 50) * 50;
  return { kcal, phase, base: Math.round(base / 50) * 50, maint: Math.round(maint / 50) * 50, trainDay, bf };
}

// Alle 14 Tage aus dem Gewichtsverlauf nachjustieren. Gibt true zurück, wenn sich etwas geändert hat.
export function adjustNutrition(state, today = new Date()) {
  const nut = state.nutri || (state.nutri = { adj: 0, last: null, phase: null });
  const n = nutrition(state, today);
  if (!n) return false;
  let changed = false;
  if (nut.phase !== n.phase) { nut.phase = n.phase; changed = true; }
  const ti = iso(today);
  if (!nut.last) { nut.last = ti; return true; }
  if ((parseIso(ti) - parseIso(nut.last)) / 86400000 < 14) return changed;
  const from = iso(addDays(today, -21));
  const pts = state.bw.filter(b => b.d >= from);
  if (pts.length < 5) return changed;
  const xs = pts.map(p => (parseIso(p.d) - parseIso(pts[0].d)) / 86400000 / 7);
  const ys = pts.map(p => p.kg);
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = ys.reduce((a, b) => a + b, 0) / ys.length;
  const slope = xs.reduce((a, x, j) => a + (x - mx) * (ys[j] - my), 0) / (xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1);
  const pct = slope / my * 100;
  let d = 0;
  if (n.phase === 'diaet') { if (pct > -0.25) d = -150; else if (pct < -1.2) d = 150; }
  else { if (pct < 0) d = 150; else if (pct > 0.3) d = -150; }
  nut.adj = Math.max(-600, Math.min(600, (nut.adj || 0) + d));
  nut.last = ti;
  return true;
}

// ---------- Kalender / Tagesplan ----------
export function isTrainingDay(d, settings) { return settings.days.includes(d.getDay()); }

export function dayPlan(state, today = new Date()) {
  const ti = iso(today);
  const todays = state.sessions.filter(s => s.date === ti);
  const wk = weekKey(ti);
  const st = state.settings;
  if (isTrainingDay(today, st) && !todays.some(isMain)) return { type: 'main' };
  if (todays.length) return { type: 'done' };
  const feinThisWeek = state.sessions.some(s => s.kind === 'fein' && weekKey(s.date) === wk);
  const dow = today.getDay();
  if (st.fein && !feinThisWeek && (dow === 1 || dow === 5) && !isTrainingDay(today, st)) return { type: 'fein', fallback: dow === 5 };
  if (!isTrainingDay(today, st)) return { type: 'mob' };
  return { type: 'done' };
}

export function upcomingDates(from, count, settings, includeFrom = true) {
  const out = [];
  let d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  if (!includeFrom) d = addDays(d, 1);
  while (out.length < count) {
    if (isTrainingDay(d, settings)) out.push(new Date(d));
    d = addDays(d, 1);
  }
  return out;
}

export function weekStatus(state, today = new Date()) {
  const mon = mondayOf(today);
  const wk = iso(mon);
  const done = mainSessions(state).filter(s => weekKey(s.date) === wk).length;
  let expected = 0;
  for (let j = 0; j < 7; j++) {
    const d = addDays(mon, j);
    if (d > today) break;
    if (isTrainingDay(d, state.settings) && iso(d) !== iso(today)) expected++;
  }
  const days = state.settings.days.slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  return { done, expected, missed: Math.max(0, expected - done), days };
}

export function projectEnd(state, today = new Date()) {
  const remaining = Math.max(0, MAIN_SESSIONS - mainCount(state));
  if (remaining === 0) return null;
  const trainedToday = mainSessions(state).some(s => s.date === iso(today));
  const dates = upcomingDates(today, remaining, state.settings, !trainedToday);
  return dates[dates.length - 1];
}

export function blockTimeline() {
  let start = 0;
  return BLOCKS.map(b => { const o = { ...b, from: start, to: start + b.weeks * 3 - 1 }; start += b.weeks * 3; return o; });
}

// ---------- Arbeiten des Herakles ----------
// Prüft, was neu erfüllt ist, und speichert es mit Datum. Gibt die neu erfüllten zurück.
export function updateLabours(state, xpData) {
  state.labours = state.labours || {};
  const done = state.labours;
  const today = iso(new Date());
  const bw = bwAt(state, today);
  const best = xpData.best;
  const std = id => STANDARDS.find(s => s.ex === id);
  const ok = {};
  if (bw && best.inc_bb_press) ok.lion = standardValue(std('inc_bb_press'), best.inc_bb_press, bw) >= 1.0;
  ok.hydra = xpData.maxStreak >= 12;
  if (bw && best.sumo_dl) ok.boar = (best.sumo_dl / (1 + 5 / 30)) / bw >= 1.75;
  ok.augeas = state.sessions.filter(s => s.kind === 'mob').length >= 30;
  ok.birds = state.sessions.some(s => s.ex.some(e => ['weighted_chinup', 'weighted_pullup', 'weighted_cg_chinup'].includes(e.ex) && e.sets.some(x => x.done && !x.w && x.r >= 15)));
  if (bw && best.weighted_chinup) ok.bull = standardValue(std('weighted_chinup'), best.weighted_chinup, bw) >= 0.5;
  if (bw && best.weighted_dip) ok.mares = standardValue(std('weighted_dip'), best.weighted_dip, bw) >= 0.5;
  const h = state.profile && state.profile.height;
  for (const m of [...new Set((state.meas || []).map(x => x.d))]) {
    const sn = snapshot(state, m);
    if (h && sn.waist && sn.waist <= 0.45 * h) ok.girdle = true;
    if (sn.shoulders && sn.waist && sn.shoulders / sn.waist >= 1.618) ok.cattle = true;
    const bf = navyBF(sn, h);
    if (bf != null && bf <= 12) ok.apples = true;
  }
  ok.cerberus = mainCount(state) >= MAIN_SESSIONS;
  const fresh = [];
  for (const l of LABOURS) {
    if (done[l.id]) continue;
    if (ok[l.id]) { done[l.id] = today; fresh.push(l); }
  }
  return fresh;
}

// ---------- Punkte ----------
export function computeXP(state) {
  const best = {};
  const weekCount = {};
  const full = new Set();
  const stdLv = {};
  const per = {};
  let total = 0;
  const sessions = state.sessions.slice().sort((a, b) => (a.start || 0) - (b.start || 0));

  const streakBefore = wk => {
    let n = 0; let d = addDays(parseIso(wk), -7);
    while (full.has(iso(d))) { n++; d = addDays(d, -7); }
    return n;
  };

  for (const s of sessions) {
    const bw = bwAt(state, s.date) || s.bw || null;
    const parts = [];
    let base = 0;
    let nSets = 0;
    for (const e of s.ex) for (const x of e.sets) if (x.done) { if (x.kind === 'work') nSets += 1; if (x.kind === 'act') nSets += 2; }
    const wk = weekKey(s.date);
    if (s.kind === 'mob') {
      per[s.id] = { xp: nSets ? 30 : 0, parts: nSets ? [['Mobilitätsblock', 30]] : [], prs: [] };
      total += per[s.id].xp;
      continue;
    }
    if (nSets) { base += nSets * 10; parts.push([`${nSets} Arbeitssätze`, nSets * 10]); }
    if (nSets) { const c = s.kind === 'fein' ? 50 : 100; base += c; parts.push([s.kind === 'fein' ? 'Feinschliff abgeschlossen' : 'Training abgeschlossen', c]); }
    const prs = [];
    let ups = 0;
    const seen = new Set();
    for (const e of s.ex) {
      if (e.skipped) continue;
      const m = sessionBest(e, bw);
      if (m > 0) {
        if (best[e.ex] && m > best[e.ex] + 0.01 && !seen.has(e.ex)) { prs.push(e.ex); seen.add(e.ex); }
        best[e.ex] = Math.max(best[e.ex] || 0, m);
      }
      if (e.sets.some(x => x.up && x.done && x.r >= x.lo)) ups++;
    }
    if (prs.length) { base += prs.length * 50; parts.push([prs.length === 1 ? 'Neuer Rekord' : `${prs.length} neue Rekorde`, prs.length * 50]); }
    if (ups) { base += ups * 20; parts.push([ups === 1 ? 'Steigerung umgesetzt' : `${ups} Steigerungen umgesetzt`, ups * 20]); }
    const st = streakBefore(wk);
    const mult = 1 + Math.min(0.5, 0.1 * st);
    let xp = Math.round(base * mult);
    if (mult > 1) parts.push([`Serie ${st} ${st === 1 ? 'Woche' : 'Wochen'}, +${Math.round((mult - 1) * 100)} %`, xp - base]);
    if (isMain(s) && nSets) {
      weekCount[wk] = (weekCount[wk] || 0) + 1;
      if (weekCount[wk] === 3) { xp += 100; parts.push(['Volle Woche', 100]); full.add(wk); }
      if (s.lastOfBlock && !s.deload) { xp += 500; parts.push(['Phase abgeschlossen', 500]); }
    }
    for (const sd of STANDARDS) {
      const lv = standardLevel(sd, standardValue(sd, best[sd.ex], bw));
      const had = stdLv[sd.ex] ?? -1;
      if (lv > had) {
        for (let j = had + 1; j <= lv; j++) { xp += LEVEL_XP[j]; parts.push([`Kraftprüfung ${sd.label}: ${['Gut', 'Stark', 'Göttlich'][j]}`, LEVEL_XP[j]]); }
        stdLv[sd.ex] = lv;
      }
    }
    per[s.id] = { xp, parts, prs };
    total += xp;
  }
  const bwWeeks = new Set(state.bw.map(b => weekKey(b.d)));
  total += bwWeeks.size * 10;
  const deltas = figureDeltas(state);
  const figXP = deltas.reduce((a, d) => a + d.xp, 0);
  total += figXP;
  const labourXP = Object.keys(state.labours || {}).length * LABOUR_XP;
  total += labourXP;
  total = Math.max(0, total);

  const now = mondayOf(new Date());
  let streak = 0;
  let d = full.has(iso(now)) ? now : addDays(now, -7);
  while (full.has(iso(d))) { streak++; d = addDays(d, -7); }
  let maxStreak = 0, run = 0;
  const weeks = [...full].sort();
  weeks.forEach((w, j) => { run = j && (parseIso(w) - parseIso(weeks[j - 1])) / 86400000 === 7 ? run + 1 : 1; maxStreak = Math.max(maxStreak, run); });

  return { total, per, best, stdLv, streak, maxStreak, bwXP: bwWeeks.size * 10, deltas, figXP, labourXP };
}

export function rankFor(xp, state) {
  let r = 0;
  RANKS.forEach((k, j) => { if (xp >= k.xp) r = j; });
  const allLabours = Object.keys(state.labours || {}).length >= LABOURS.length;
  const complete = mainCount(state) >= MAIN_SESSIONS;
  const gated = r === RANKS.length - 1 && !(allLabours && complete);
  if (gated) r = RANKS.length - 2;
  const next = RANKS[r + 1] || null;
  return { idx: r, rank: RANKS[r], next, gated, progress: next ? Math.min(1, (xp - RANKS[r].xp) / (next.xp - RANKS[r].xp)) : 1 };
}

// ---------- Statistik ----------
export function seriesFor(state, exId) {
  const out = [];
  for (const s of state.sessions) {
    const bw = bwAt(state, s.date) || null;
    let m = 0;
    for (const e of s.ex) if (e.ex === exId && !e.skipped) m = Math.max(m, sessionBest(e, bw));
    if (m > 0) out.push({ d: s.date, v: m });
  }
  return out;
}

// Harte Sätze pro Muskel in der Woche ab Montag mondayIso. Rest-Pause zählt wie zwei Sätze.
export function weekVolume(state, mondayIso, includeActive = true) {
  const vol = {};
  const add = ses => {
    if (ses.kind === 'mob' || weekKey(ses.date) !== mondayIso) return;
    for (const e of ses.ex) {
      const m = EX_MUSCLES[e.ex];
      if (!m || e.skipped) continue;
      let n = 0;
      for (const x of e.sets) if (x.done) n += x.kind === 'act' ? 2 : x.kind === 'work' ? 1 : 0;
      for (const [k, f] of Object.entries(m)) vol[k] = (vol[k] || 0) + n * f;
    }
  };
  state.sessions.forEach(add);
  if (includeActive && state.active) add(state.active);
  return vol;
}

export function totals(state) {
  let sets = 0, vol = 0, minutes = 0;
  for (const s of state.sessions) {
    if (s.end && s.start) minutes += (s.end - s.start) / 60000;
    if (s.kind === 'mob') continue;
    for (const e of s.ex) for (const x of e.sets) if (x.done) {
      sets++;
      if (unitOf(e.ex) === 's') continue;
      const mult = EX[e.ex].eq === 'db' ? 2 : 1;
      vol += (x.w || 0) * (x.r || 0) * mult;
    }
  }
  return { sessions: mainCount(state), extra: state.sessions.length - mainCount(state), sets, vol, minutes };
}
