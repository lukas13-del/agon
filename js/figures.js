// Übungsbilder als Piktogramme: Figur aus Gelenkwinkeln, Start und Ende nebeneinander.
// Winkel: 0 = nach unten, 90 = nach vorne (rechts), 180 = nach oben, -90 = nach hinten (links).
const L = { torso: 30, neck: 3, head: 5.5, ua: 17, fa: 15, th: 25, sh: 24, foot: 7 };
const G = 120; // Boden
const SHO_W = 9, HIP_W = 5; // halbe Schulter- und Hüftbreite in der Frontansicht

const rad = a => (a * Math.PI) / 180;
const dir = a => [Math.sin(rad(a)), Math.cos(rad(a))];
const add = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];
const f1 = n => Math.round(n * 10) / 10;

// Zwei-Gelenk-Kette auf ein Ziel ausrichten. b = +1/-1 wählt die Seite des Mittelgelenks.
function ik(root, target, a, b, bend) {
  const dx = target[0] - root[0], dy = target[1] - root[1];
  const d = Math.max(Math.abs(a - b) + 0.01, Math.min(a + b - 0.01, Math.hypot(dx, dy)));
  const base = Math.atan2(dy, dx);
  const A = Math.acos((a * a + d * d - b * b) / (2 * a * d));
  const ang = base + bend * A;
  const joint = [root[0] + a * Math.cos(ang), root[1] + a * Math.sin(ang)];
  const ex = target[0] - joint[0], ey = target[1] - joint[1];
  const el = Math.hypot(ex, ey) || 1;
  return [joint, [joint[0] + (b * ex) / el, joint[1] + (b * ey) / el]];
}
function limb(root, spec, a, b) {
  if (Array.isArray(spec)) {
    const j = add(root, dir(spec[0]), a);
    return { j, e: add(j, dir(spec[1]), b), ft: spec[2] };
  }
  const [j, e] = ik(root, spec.to, a, b, spec.b ?? 1);
  return { j, e, ft: spec.ft };
}
const mirrorSpec = (spec, cx) => {
  if (!spec) return spec;
  if (Array.isArray(spec)) return spec.map(v => (v == null ? v : -v));
  return { ...spec, to: [2 * cx - spec.to[0], spec.to[1]], b: -(spec.b ?? 1), ft: spec.ft == null ? spec.ft : -spec.ft };
};

// Gelenke berechnen
function joints(p, view) {
  const hip = p.hip;
  const t = p.t ?? 180;
  const J = { hip, view };
  if (view === 'f') {
    const sc = add(hip, dir(t), L.torso);
    J.sc = sc;
    J.sR = [sc[0] + SHO_W, sc[1] - (p.shR ?? p.sh ?? 0)];
    J.sL = [sc[0] - SHO_W, sc[1] - (p.shL ?? p.sh ?? 0)];
    J.hipR = [hip[0] + HIP_W, hip[1]];
    J.hipL = [hip[0] - HIP_W, hip[1]];
    const hd = p.hd ?? t;
    J.neck = add(sc, dir(hd), L.neck);
    J.head = add(J.neck, dir(hd), L.head);
    const ar = limb(J.sR, p.ar ?? [6, 4], L.ua, L.fa);
    const al = limb(J.sL, p.al ?? mirrorSpec(p.ar ?? [6, 4], hip[0]), L.ua, L.fa);
    const lrDef = { to: [hip[0] + 6, G - 1], b: -1 };
    const lr = limb(J.hipR, p.lr ?? lrDef, L.th, L.sh);
    const ll = limb(J.hipL, p.ll ?? mirrorSpec(p.lr ?? lrDef, hip[0]), L.th, L.sh);
    Object.assign(J, { eR: ar.j, hR: ar.e, eL: al.j, hL: al.e, kR: lr.j, aR: lr.e, kL: ll.j, aL: ll.e });
    J.tR = add(lr.e, dir(lr.ft ?? 100), 5);
    J.tL = add(ll.e, dir(ll.ft ?? -100), 5);
    return J;
  }
  const sho = add(hip, dir(t), L.torso);
  const hd = p.hd ?? t;
  J.sho = sho;
  J.neck = add(sho, dir(hd), L.neck);
  J.head = add(J.neck, dir(hd), L.head);
  const an = limb(sho, p.an ?? [0, 0], L.ua, L.fa);
  const af = limb(sho, p.af ?? p.an ?? [0, 0], L.ua, L.fa);
  const ln = limb(hip, p.ln ?? { to: [hip[0] + 1, G - 1], b: -1 }, L.th, L.sh);
  const lf = limb(hip, p.lf ?? p.ln ?? { to: [hip[0] + 1, G - 1], b: -1 }, L.th, L.sh);
  Object.assign(J, { eN: an.j, hN: an.e, eF: af.j, hF: af.e, kN: ln.j, aN: ln.e, kF: lf.j, aF: lf.e });
  J.tN = add(ln.e, dir(ln.ft ?? 90), L.foot);
  J.tF = add(lf.e, dir(lf.ft ?? 90), L.foot);
  return J;
}

// ---------- Zeichnen ----------
const pl = (pts, cls) => `<polyline class="${cls}" points="${pts.map(p => `${f1(p[0])},${f1(p[1])}`).join(' ')}"/>`;
const ln2 = (a, b, cls) => `<line class="${cls}" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}"/>`;
const circ = (c, r, cls) => `<circle class="${cls}" cx="${f1(c[0])}" cy="${f1(c[1])}" r="${r}"/>`;

function drawFigure(J, far = true) {
  let s = '';
  if (J.view === 'f') {
    s += pl([J.aL, J.kL, J.hipL], 'fx-b') + ln2(J.aL, J.tL, 'fx-b fx-ft');
    s += pl([J.aR, J.kR, J.hipR], 'fx-b') + ln2(J.aR, J.tR, 'fx-b fx-ft');
    s += ln2(J.hipL, J.hipR, 'fx-b');
    s += ln2(J.hip, J.sc, 'fx-b fx-t');
    s += ln2(J.sL, J.sR, 'fx-b');
    s += pl([J.sL, J.eL, J.hL], 'fx-b') + pl([J.sR, J.eR, J.hR], 'fx-b');
    s += ln2(J.sc, J.neck, 'fx-b');
    s += circ(J.head, L.head, 'fx-hd');
    return s;
  }
  const sh = p => [p[0] - 2.5, p[1] - 0.5];
  if (far) {
    s += `<g class="fx-far">${pl([J.hip, J.kF, J.aF].map(sh), 'fx-b')}${ln2(sh(J.aF), sh(J.tF), 'fx-b fx-ft')}${pl([J.sho, J.eF, J.hF].map(sh), 'fx-b')}</g>`;
  }
  s += pl([J.hip, J.kN, J.aN], 'fx-b') + ln2(J.aN, J.tN, 'fx-b fx-ft');
  s += ln2(J.hip, J.sho, 'fx-b fx-t');
  s += ln2(J.sho, J.neck, 'fx-b');
  s += circ(J.head, L.head, 'fx-hd');
  s += pl([J.sho, J.eN, J.hN], 'fx-b');
  return s;
}

// Geräte und Einrichtung, die in beiden Bildern gleich bleiben
function drawProps(props, floorless) {
  let s = floorless ? '' : `<line class="fx-gr" x1="4" y1="${G + 1.5}" x2="116" y2="${G + 1.5}"/>`;
  for (const p of props || []) {
    if (p.k === 'pad') s += pl(p.p, 'fx-fur');
    else if (p.k === 'post') s += ln2([p.x, p.y], [p.x, p.y2 ?? G], 'fx-fur fx-thin');
    else if (p.k === 'box') s += `<rect class="fx-fur fx-thin" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="2"/>`;
    else if (p.k === 'wall') s += ln2([p.x, p.y ?? 20], [p.x, G], 'fx-fur');
    else if (p.k === 'tower') s += ln2([p.x, 4], [p.x, G], 'fx-fur fx-thin') + circ([p.x, p.y], 3, 'fx-pul');
    else if (p.k === 'beam') s += ln2([p.x1, p.y], [p.x2, p.y], 'fx-fur fx-thin');
    else if (p.k === 'barSide') s += ln2([p.x, p.y], [8, p.y], 'fx-fur fx-thin') + ln2([8, p.y], [8, G], 'fx-fur fx-thin') + circ([p.x, p.y], 2.4, 'fx-pul');
    else if (p.k === 'barFront') s += ln2([p.x1, p.y], [p.x2, p.y], 'fx-fur') + ln2([p.x1, p.y], [p.x1, G], 'fx-fur fx-thin') + ln2([p.x2, p.y], [p.x2, G], 'fx-fur fx-thin');
    else if (p.k === 'pulley') s += circ([p.x, p.y], 3, 'fx-pul');
  }
  return s;
}

// Gehaltene Gewichte, Kabel und Griffe (bewegen sich mit)
function drawHeld(J, p) {
  let s = '';
  for (const c of p.cable || []) s += ln2(J[c[0]], c[1], 'fx-cab');
  for (const h of [].concat(p.hold || [])) {
    if (h === 'bb') s += circ(J.hN, 8, 'fx-pl') + circ(J.hN, 1.6, 'fx-dot');
    else if (h === 'bbBig') s += circ(J.hN, 10, 'fx-pl') + circ(J.hN, 1.8, 'fx-dot');
    else if (h === 'bbBack') { const c = add(J.sho, [-4, -2]); s += circ(c, 8, 'fx-pl') + circ(c, 1.6, 'fx-dot'); }
    else if (h === 'bbFront') { const c = add(J.sho, [6, -3]); s += circ(c, 8, 'fx-pl') + circ(c, 1.6, 'fx-dot'); }
    else if (h === 'bbHip') { const c = add(J.hip, [0, -8]); s += circ(c, 9, 'fx-pl') + circ(c, 1.7, 'fx-dot'); }
    else if (h === 'db') s += `<g class="fx-far">${circ([J.hF[0] - 2.5, J.hF[1] - 0.5], 4.2, 'fx-db')}</g>` + circ(J.hN, 4.2, 'fx-db');
    else if (h === 'db1') s += circ(J.hN, 4.2, 'fx-db');
    else if (h === 'dbF') s += circ(J.hR, 4, 'fx-db') + circ(J.hL, 4, 'fx-db');
    else if (h === 'dbF1') s += circ(J.hR, 4, 'fx-db');
    else if (h === 'dbH') for (const k of ['hR', 'hL']) s += ln2(add(J[k], [-6, 0]), add(J[k], [6, 0]), 'fx-eq') + ln2(add(J[k], [-6, -3]), add(J[k], [-6, 3]), 'fx-eq fx-w') + ln2(add(J[k], [6, -3]), add(J[k], [6, 3]), 'fx-eq fx-w');
    else if (h === 'barF') s += ln2(add(J.hL, [-5, 0]), add(J.hR, [5, 0]), 'fx-eq fx-w');
    else if (h === 'rope') for (const k of ['hN']) s += ln2(J[k], add(J[k], [-2, 4]), 'fx-eq') + ln2(J[k], add(J[k], [2, 4]), 'fx-eq');
    else if (h === 'grip') s += ln2(add(J.hN, [0, -4.5]), add(J.hN, [0, 4.5]), 'fx-eq fx-w');
    else if (h === 'belt') { const c = add(J.hip, [3, 14]); s += ln2(J.hip, c, 'fx-cab') + circ(c, 5, 'fx-db'); }
    else if (h === 'plate') { const c = add(J.head, p.plate || [0, -7]); s += `<rect class="fx-db" x="${f1(c[0] - 6)}" y="${f1(c[1] - 2)}" width="12" height="4" rx="1.5"/>`; }
  }
  return s;
}

function arrow(a, b, hip) {
  const vx = b[0] - a[0], vy = b[1] - a[1];
  const d = Math.hypot(vx, vy);
  if (d < 6) return '';
  const ux = vx / d, uy = vy / d;
  const off = 7;
  const c1 = [a[0] - uy * off, a[1] + ux * off], c2 = [a[0] + uy * off, a[1] - ux * off];
  const side = Math.hypot(c1[0] - hip[0], c1[1] - hip[1]) > Math.hypot(c2[0] - hip[0], c2[1] - hip[1]) ? c1 : c2;
  const len = Math.min(d * 0.7, 22);
  const st = add(side, [ux, uy], 2);
  const en = add(side, [ux, uy], 2 + len);
  const hd = [add(en, [-ux * 4 - uy * 2.6, -uy * 4 + ux * 2.6]), en, add(en, [-ux * 4 + uy * 2.6, -uy * 4 - ux * 2.6])];
  return ln2(st, en, 'fx-ar') + pl(hd, 'fx-ar');
}

function panel(def, pose, label, other, lx = 6) {
  const J = joints(pose, def.v);
  let s = drawProps(def.props, def.floorless) + drawProps(pose.props, true);
  s += drawFigure(J, def.v !== 'f');
  s += drawHeld(J, { hold: def.hold, ...pose });
  if (other) {
    const K = joints(other, def.v);
    const key = def.mv || (def.v === 'f' ? 'hR' : 'hN');
    s += arrow(J[key], K[key], J.hip);
  }
  return `<text class="fx-lbl" x="${lx}" y="11">${label}</text>${s}`;
}

export function drawExercise(id) {
  const def = FIG[id];
  if (!def) return null;
  const body = def.single
    ? `<g transform="translate(60,0)">${panel(def, def.s, 'POSITION', null, -54)}</g>`
    : `<g>${panel(def, def.s, 'START', def.e)}</g><line class="fx-sep" x1="120" y1="6" x2="120" y2="124"/><g transform="translate(120,0)">${panel(def, def.e, 'ENDE')}</g>`;
  return `<svg class="fx" viewBox="0 0 240 130" role="img" aria-label="Start- und Endposition">${body}</svg>`;
}
export const hasFigure = id => !!FIG[id];

// ---------- Bausteine ----------
const legs = (x, y = G - 1, b = -1, ft) => ({ to: [x, y], b, ft });
const stand = (o = {}) => ({ hip: [60, 71], t: 180, ln: legs(61), ...o });
const benchFlat = [{ k: 'pad', p: [[18, 96.5], [80, 96.5]] }, { k: 'post', x: 28, y: 97 }, { k: 'post', x: 72, y: 97 }];
const benchIncline = (hip, t, len = 38) => {
  const off = dir(t + 90).map(v => v * 4.5);
  const p0 = add(hip, off);
  const p1 = add(add(hip, dir(t), len), off);
  return [{ k: 'pad', p: [p1, p0, [hip[0] + 15, p0[1]]] }, { k: 'post', x: hip[0] - 12, y: p0[1] - 8 }, { k: 'post', x: hip[0] + 12, y: p0[1] }];
};
const seatBox = (x, y, w) => ({ k: 'box', x, y, w, h: G - y });
const pullBar = { k: 'barSide', x: 60, y: 10 };
const chinS = { hip: [60, 72], t: 180, an: [180, 180], ln: [6, -72, -30] };
const chinE = { hip: [54.9, 43.9], t: 176, an: { to: [60, 10], b: 1 }, ln: [8, -75, -30] };
const curlS = stand({ an: [5, 5] });
const curlE = stand({ an: [5, 168] });

// ---------- Übungen ----------
const FIG = {
  // Drücken
  inc_bb_press: { v: 's', props: benchIncline([66, 90], 235), hold: 'bb',
    s: { hip: [66, 90], t: 235, ln: legs(92), an: { to: [47, 66], b: 1 } },
    e: { hip: [66, 90], t: 235, ln: legs(92), an: { to: [42, 42], b: 1 } } },
  inc_db_press: { v: 's', props: benchIncline([66, 90], 235), hold: 'db',
    s: { hip: [66, 90], t: 235, ln: legs(92), an: { to: [48, 68], b: 1 } },
    e: { hip: [66, 90], t: 235, ln: legs(92), an: { to: [42, 42], b: 1 } } },
  flat_bb_bench: { v: 's', props: benchFlat, hold: 'bb',
    s: { hip: [72, 92], t: 270, ln: legs(94), an: { to: [47, 84], b: 1 } },
    e: { hip: [72, 92], t: 270, ln: legs(94), an: { to: [42, 61], b: 1 } } },
  flat_db_press: { v: 's', props: benchFlat, hold: 'db',
    s: { hip: [72, 92], t: 270, ln: legs(94), an: { to: [47, 86], b: 1 } },
    e: { hip: [72, 92], t: 270, ln: legs(94), an: { to: [42, 61], b: 1 } } },
  close_grip_bench: { v: 's', props: benchFlat, hold: 'bb',
    s: { hip: [72, 92], t: 270, ln: legs(94), an: { to: [49, 85], b: 1 } },
    e: { hip: [72, 92], t: 270, ln: legs(94), an: { to: [43, 61], b: 1 } } },
  skull_crusher: { v: 's', props: benchFlat, hold: 'bb',
    s: { hip: [72, 92], t: 270, ln: legs(94), an: [195, -45] },
    e: { hip: [72, 92], t: 270, ln: legs(94), an: [195, 195] } },
  standing_press: { v: 's', hold: 'bb',
    s: stand({ an: { to: [68, 41], b: 1 } }),
    e: stand({ an: { to: [61, 10], b: 1 } }) },
  arnold: { v: 's', hold: 'db', props: [{ k: 'pad', p: [[38, 96.5], [66, 96.5]] }, { k: 'post', x: 52, y: 97 }, { k: 'pad', p: [[45.5, 96], [45.5, 58]] }],
    s: { hip: [52, 92], t: 180, ln: legs(78), an: { to: [60, 58], b: 1 } },
    e: { hip: [52, 92], t: 180, ln: legs(78), an: { to: [53, 31], b: 1 } } },
  machine_press: { v: 's', hold: 'grip', props: [{ k: 'pad', p: [[34, 96.5], [64, 96.5]] }, { k: 'post', x: 46, y: 97 }, { k: 'pad', p: [[40.5, 96], [40.5, 54]] }],
    s: { hip: [46, 92], t: 180, ln: legs(74), an: { to: [57, 60], b: 1 } },
    e: { hip: [46, 92], t: 180, ln: legs(74), an: { to: [77, 60], b: 1 } } },
  weighted_dip: { v: 's', hold: 'belt', mv: 'sho', props: [{ k: 'barFront', x1: 38, x2: 86, y: 68 }],
    s: { hip: [56.9, 64.8], t: 174, an: { to: [60, 67], b: 1 }, ln: [8, -75, -30] },
    e: { hip: [57.7, 80.2], t: 160, an: { to: [60, 67], b: 1 }, ln: [10, -80, -30] } },
  cable_crossover: { v: 'f', props: [{ k: 'tower', x: 6, y: 16 }, { k: 'tower', x: 114, y: 16 }],
    s: { hip: [60, 71], ar: { to: [96, 36], b: 1 }, al: { to: [24, 36], b: -1 }, cable: [['hR', [114, 16]], ['hL', [6, 16]]] },
    e: { hip: [60, 71], ar: { to: [63, 64], b: -1 }, al: { to: [57, 64], b: 1 }, cable: [['hR', [114, 16]], ['hL', [6, 16]]] } },
  cable_fly_low: { v: 'f', props: [{ k: 'tower', x: 6, y: 112 }, { k: 'tower', x: 114, y: 112 }],
    s: { hip: [60, 71], ar: { to: [92, 86], b: -1 }, al: { to: [28, 86], b: 1 }, cable: [['hR', [114, 112]], ['hL', [6, 112]]] },
    e: { hip: [60, 71], ar: { to: [64, 47], b: -1 }, al: { to: [56, 47], b: 1 }, cable: [['hR', [114, 112]], ['hL', [6, 112]]] } },

  // Schultern
  lateral_raise: { v: 'f', hold: 'dbF', s: { hip: [60, 71], ar: [6, 4] }, e: { hip: [60, 71], ar: [88, 93] } },
  cable_lateral: { v: 'f', mv: 'hL', props: [{ k: 'tower', x: 108, y: 112 }],
    s: { hip: [60, 71], al: { to: [62, 76], b: -1 }, ar: [6, 4], cable: [['hL', [108, 112]]] },
    e: { hip: [60, 71], al: { to: [21, 40], b: -1 }, ar: [6, 4], cable: [['hL', [108, 112]]] } },
  db_upright_row: { v: 'f', hold: 'dbH', s: { hip: [60, 71], ar: [-6, -4] }, e: { hip: [60, 71], ar: { to: [72, 45], b: -1 } } },
  face_pull: { v: 's', hold: 'rope', props: [{ k: 'tower', x: 106, y: 36 }],
    s: stand({ hip: [56, 71], t: 183, ln: legs(58), an: { to: [84, 38], b: 1 }, cable: [['hN', [106, 36]]] }),
    e: stand({ hip: [56, 71], t: 183, ln: legs(58), an: { to: [64, 32], b: -1 }, cable: [['hN', [106, 36]]] }) },
  seated_rev_fly: { v: 's', hold: 'db', props: [seatBox(30, 98, 26)],
    s: { hip: [44, 95], t: 112, hd: 100, ln: legs(78), an: [0, 0] },
    e: { hip: [44, 95], t: 112, hd: 100, ln: legs(78), an: [150, 150] } },
  machine_rear_delt: { v: 's', hold: 'grip', props: [seatBox(36, 98, 28), { k: 'pad', p: [[58, 58], [58, 84]] }, { k: 'post', x: 62, y: 84 }],
    s: { hip: [50, 94], t: 180, ln: legs(76), an: [92, 92] },
    e: { hip: [50, 94], t: 180, ln: legs(76), an: [-88, -88] } },
  shrug: { v: 'f', hold: 'dbF', mv: 'sR', s: { hip: [60, 71], ar: [4, 2] }, e: { hip: [60, 71], ar: [4, 2], sh: 5 } },
  cable_shrug: { v: 'f', hold: 'barF', mv: 'sR', props: [{ k: 'pulley', x: 60, y: 116 }],
    s: { hip: [60, 71], ar: [-5, -4], cable: [['hR', [60, 116]]] }, e: { hip: [60, 71], ar: [-5, -4], sh: 5, cable: [['hR', [60, 116]]] } },
  lean_shrug: { v: 'f', hold: 'dbF1', mv: 'sR', props: [{ k: 'wall', x: 30, y: 14 }],
    s: { hip: [62, 71], t: 186, ar: [8, 4], al: { to: [31, 52], b: 1 } }, e: { hip: [62, 71], t: 186, ar: [8, 4], al: { to: [31, 52], b: 1 }, shR: 5 } },

  // Rücken
  weighted_chinup: { v: 's', floorless: true, props: [pullBar], hold: 'belt', mv: 'head', s: chinS, e: chinE },
  weighted_pullup: { v: 's', floorless: true, props: [pullBar], hold: 'belt', mv: 'head', s: chinS, e: chinE },
  weighted_cg_chinup: { v: 's', floorless: true, props: [pullBar], hold: 'belt', mv: 'head', s: chinS, e: chinE },
  lat_pulldown: { v: 's', props: [seatBox(36, 98, 30), { k: 'box', x: 64, y: 86, w: 10, h: 5 }, { k: 'beam', x1: 60, x2: 104, y: 4 }, { k: 'tower', x: 104, y: 4 }, { k: 'pulley', x: 60, y: 6 }],
    s: { hip: [52, 94], t: 182, ln: legs(80), an: { to: [60, 16], b: 1 }, cable: [['hN', [60, 6]]], hold: 'grip' },
    e: { hip: [52, 94], t: 182, ln: legs(80), an: { to: [57, 58], b: 1 }, cable: [['hN', [60, 6]]], hold: 'grip' } },
  cable_row: { v: 's', props: [seatBox(30, 100, 26), { k: 'pad', p: [[97, 96], [97, 118]] }, { k: 'tower', x: 108, y: 104 }],
    s: { hip: [46, 96], t: 160, ln: legs(94, 108), an: { to: [84, 90], b: 1 }, cable: [['hN', [108, 104]]], hold: 'grip' },
    e: { hip: [46, 96], t: 184, ln: legs(94, 108), an: { to: [56, 84], b: 1 }, cable: [['hN', [108, 104]]], hold: 'grip' } },
  machine_row: { v: 's', hold: 'grip', props: [seatBox(38, 98, 26), { k: 'pad', p: [[58, 58], [58, 82]] }, { k: 'post', x: 62, y: 82 }],
    s: { hip: [50, 94], t: 180, ln: legs(76), an: { to: [82, 60], b: 1 } },
    e: { hip: [50, 94], t: 180, ln: legs(76), an: { to: [55, 66], b: 1 } } },

  // Arme
  rope_pushdown: { v: 's', hold: 'rope', props: [{ k: 'tower', x: 100, y: 14 }],
    s: stand({ hip: [56, 71], t: 172, ln: legs(59), an: { to: [70, 52], b: 1 }, cable: [['hN', [100, 14]]] }),
    e: stand({ hip: [56, 71], t: 172, ln: legs(59), an: { to: [66, 72], b: 1 }, cable: [['hN', [100, 14]]] }) },
  rope_oh_ext: { v: 's', hold: 'rope', props: [{ k: 'tower', x: 10, y: 30 }],
    s: { hip: [58, 71], t: 160, ln: legs(70), lf: legs(46), an: [160, -20], cable: [['hN', [10, 30]]] },
    e: { hip: [58, 71], t: 160, ln: legs(70), lf: legs(46), an: [160, 150], cable: [['hN', [10, 30]]] } },
  oh_tri_ext_1arm: { v: 's', hold: 'db1', s: stand({ an: [180, -25], af: [0, 0] }), e: stand({ an: [180, 180], af: [0, 0] }) },
  db_oh_tri_ext: { v: 's', hold: 'db1', s: stand({ an: [175, -30] }), e: stand({ an: [178, 180] }) },
  bb_curl: { v: 's', hold: 'bb', s: curlS, e: curlE },
  standing_hammer: { v: 's', hold: 'db', s: curlS, e: curlE },
  cable_rope_curl: { v: 's', hold: 'rope', props: [{ k: 'tower', x: 104, y: 112 }],
    s: stand({ an: [4, 8], cable: [['hN', [104, 112]]] }), e: stand({ an: [4, 165], cable: [['hN', [104, 112]]] }) },
  inc_hammer_curl: { v: 's', hold: 'db', props: benchIncline([64, 88], 225),
    s: { hip: [64, 88], t: 225, ln: legs(92), an: [0, 0] }, e: { hip: [64, 88], t: 225, ln: legs(92), an: [0, 165] } },
  inc_db_curl: { v: 's', hold: 'db', props: benchIncline([64, 88], 225),
    s: { hip: [64, 88], t: 225, ln: legs(92), an: [0, 0] }, e: { hip: [64, 88], t: 225, ln: legs(92), an: [0, 165] } },
  seated_hammer: { v: 's', hold: 'db', props: [seatBox(36, 98, 36)],
    s: { hip: [54, 94], t: 180, ln: legs(78), an: [3, 3] }, e: { hip: [54, 94], t: 180, ln: legs(78), an: [3, 168] } },
  machine_curl: { v: 's', hold: 'grip', props: [seatBox(34, 96, 28), { k: 'pad', p: [[48, 71], [62, 81]] }, { k: 'post', x: 56, y: 77, y2: 96 }],
    s: { hip: [46, 92], t: 178, ln: legs(70), an: [55, 80] }, e: { hip: [46, 92], t: 178, ln: legs(70), an: [55, 190] } },

  // Beine
  squat: { v: 's', hold: 'bbBack', mv: 'hip',
    s: stand({ an: { to: [57, 40], b: -1 } }),
    e: { hip: [44, 98], t: 150, ln: legs(62), an: { to: [56, 71], b: -1 } } },
  box_squat: { v: 's', hold: 'bbBack', mv: 'hip', props: [{ k: 'box', x: 22, y: 100, w: 24, h: 20 }],
    s: stand({ an: { to: [57, 40], b: -1 } }),
    e: { hip: [42, 96], t: 158, ln: legs(62), an: { to: [51, 69], b: -1 } } },
  front_squat: { v: 's', hold: 'bbFront', mv: 'hip',
    s: stand({ an: { to: [65, 36], b: 1 } }),
    e: { hip: [48, 100], t: 165, ln: legs(62), an: { to: [61, 66], b: 1 } } },
  bulgarian: { v: 's', hold: 'db', mv: 'hip', props: [{ k: 'pad', p: [[14, 98.5], [44, 98.5]] }, { k: 'post', x: 20, y: 99 }, { k: 'post', x: 38, y: 99 }],
    s: { hip: [62, 73], t: 178, ln: legs(72), lf: { to: [36, 95], b: -1, ft: -90 }, an: [0, 0] },
    e: { hip: [52, 94], t: 175, ln: legs(72), lf: { to: [36, 95], b: -1, ft: -90 }, an: [0, 0] } },
  walking_lunge: { v: 's', hold: 'bbBack', mv: 'hip',
    s: stand({ an: { to: [57, 40], b: -1 } }),
    e: { hip: [56, 94], t: 180, ln: legs(80), lf: { to: [32, 118], b: -1, ft: 120 }, an: { to: [53, 63], b: -1 } } },
  pistol: { v: 's', mv: 'hip',
    s: stand({ lf: [30, 10, 90], an: [90, 90] }),
    e: { hip: [54, 104], t: 150, ln: legs(62), lf: [85, 88, 90], an: [95, 92] } },
  sumo_dl: { v: 's', hold: 'bbBig',
    s: { hip: [46, 102], t: 145, ln: legs(60), an: { to: [63, 110], b: 1 } },
    e: stand({ an: [0, 0] }) },
  db_rdl: { v: 's', hold: 'db',
    s: stand({ an: [0, 0] }),
    e: { hip: [44, 74], t: 115, hd: 105, ln: legs(60), an: [0, 0] } },
  sl_rdl: { v: 's', hold: 'db1',
    s: stand({ lf: legs(54), an: [0, 0] }),
    e: { hip: [54, 72], t: 105, hd: 100, ln: legs(62), lf: [-95, -95, -170], an: [0, 0] } },
  hip_thrust: { v: 's', hold: 'bbHip', mv: 'hip', props: [{ k: 'pad', p: [[4, 93.5], [40, 93.5]] }, { k: 'post', x: 12, y: 94 }, { k: 'post', x: 34, y: 94 }],
    s: { hip: [60, 106], t: 235, ln: legs(84), an: { to: [60, 98], b: 1 } },
    e: { hip: [66, 88], t: 272, ln: legs(84), an: { to: [66, 80], b: 1 } } },

  // Rumpf
  hanging_knee_raise: { v: 's', floorless: true, props: [pullBar], mv: 'kN',
    s: { hip: [60, 72], t: 180, an: [180, 180], ln: [4, 2, 30] },
    e: { hip: [63.1, 71.8], t: 186, an: [180, 180], ln: [125, 15, 60] } },
  side_knee_up: { v: 'f', floorless: true, props: [{ k: 'barFront', x1: 34, x2: 86, y: 10 }], mv: 'kR',
    s: { hip: [60, 72], ar: [178, 180], lr: [2, 1], ll: [-2, -1] },
    e: { hip: [60, 72], ar: [178, 180], lr: [118, 30], ll: [100, 20] } },
  cable_crunch: { v: 's', hold: 'rope', mv: 'sho', props: [{ k: 'tower', x: 106, y: 12 }],
    s: { hip: [56, 93], t: 165, ln: [8, -90, -90], an: { to: [70, 52], b: 1 }, cable: [['hN', [106, 12]]] },
    e: { hip: [56, 93], t: 110, hd: 80, ln: [8, -90, -90], an: { to: [92, 76], b: 1 }, cable: [['hN', [106, 12]]] } },
  pallof: { v: 's', props: [{ k: 'tower', x: 14, y: 52 }],
    s: stand({ an: { to: [66, 54], b: 1 }, cable: [['hN', [14, 52]]], hold: 'grip' }),
    e: stand({ an: { to: [91, 53], b: 1 }, cable: [['hN', [14, 52]]], hold: 'grip' }) },
  side_plank: { v: 's', mv: 'hip',
    s: { hip: [52, 114], t: 246, ln: legs(99, 118.5), an: [0, -90], af: { to: [52, 110], b: 1 } },
    e: { hip: [51.4, 107.5], t: 257, ln: legs(99, 118.5), an: [0, -90], af: { to: [51, 104], b: 1 } } },
  farmer_walk: { v: 's', hold: 'db', mv: 'hip',
    s: { hip: [60, 73], t: 180, ln: legs(74), lf: legs(46), an: [0, 0] },
    e: { hip: [66, 73], t: 180, ln: legs(52), lf: legs(80), an: [0, 0] } },

  // Nacken
  neck_ext: { v: 's', hold: 'plate', mv: 'head', props: [{ k: 'pad', p: [[6, 96.5], [76, 96.5]] }, { k: 'post', x: 14, y: 97 }, { k: 'post', x: 68, y: 97 }],
    s: { hip: [50, 91], t: 90, hd: 20, ln: [-90, -90, 0], an: { to: [86, 93], b: 1 }, plate: [3, -6] },
    e: { hip: [50, 91], t: 90, hd: 120, ln: [-90, -90, 0], an: { to: [83, 81], b: 1 }, plate: [-4, -6] } },
  neck_curl: { v: 's', hold: 'plate', mv: 'head', props: [{ k: 'pad', p: [[6, 96.5], [76, 96.5]] }, { k: 'post', x: 14, y: 97 }, { k: 'post', x: 68, y: 97 }],
    s: { hip: [50, 91], t: 90, hd: 40, ln: [-90, -90, 180], an: { to: [89, 93], b: -1 }, plate: [4, -4] },
    e: { hip: [50, 91], t: 90, hd: 140, ln: [-90, -90, 180], an: { to: [88, 79], b: -1 }, plate: [3, -6] } },

  // Mobilität
  dead_hang: { v: 's', floorless: true, single: true, props: [pullBar], s: { hip: [60, 72], t: 180, an: [180, 180], ln: [3, 2, 30] } },
  thoracic_rot: { v: 's', floorless: true, mv: 'hN',
    s: { hip: [74, 56], t: 270, ln: [25, -60, -60], an: [5, 5] },
    e: { hip: [74, 56], t: 270, hd: 250, ln: [25, -60, -60], an: [175, 175], af: [5, 5] } },
  couch_stretch: { v: 's', single: true, props: [{ k: 'wall', x: 20, y: 70 }],
    s: { hip: [44, 90], t: 182, ln: legs(70), lf: { to: [23, 94], b: -1, ft: 180 }, an: { to: [64, 98], b: 1 } } },
  hip_9090: { v: 'f', mv: 'kR',
    s: { hip: [60, 108], ar: [20, 10], lr: [100, 0], ll: [40, 90] },
    e: { hip: [60, 108], ar: [20, 10], lr: [-40, -90], ll: [-100, 0] } },
  wall_slide: { v: 'f', s: { hip: [60, 71], ar: [90, 180] }, e: { hip: [60, 71], ar: [155, 175] } },
  deep_squat: { v: 's', single: true, s: { hip: [52, 104], t: 160, ln: legs(62), an: { to: [74, 74], b: 1 } } },
};
