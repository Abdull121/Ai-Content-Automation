/* Procedural soundtrack v2 — synthesized sample by sample (no samples, no external audio).
   120 BPM, D minor (Dm9 · Bbmaj7 · Gm9 · A7sus). Each section changes the arrangement and every
   transition has its own sound designed to match its motion. */
import { writeFileSync } from "node:fs";
const SR = 44100, DUR = 58, N = SR * DUR, PI2 = Math.PI * 2;
const bus = () => ({ L: new Float32Array(N), R: new Float32Array(N) });
const MUS = bus(), DRM = bus(), SFX = bus(), VERB = bus();
const duck = new Float32Array(N).fill(1);
let seed = 9; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const put = (B, t, i, v, pan = 0, send = 0) => {
  const k = Math.round(t * SR) + i; if (k < 0 || k >= N) return;
  const l = v * Math.min(1, 1 - pan), r = v * Math.min(1, 1 + pan);
  B.L[k] += l; B.R[k] += r; if (send) { VERB.L[k] += l * send; VERB.R[k] += r * send; }
};
const svf = () => { let lo = 0, bp = 0; return (x, fc, q = .7) => { const f = 2 * Math.sin(Math.PI * Math.min(fc, 7000) / SR); const hi = x - lo - q * bp; bp += f * hi; lo += f * bp; return { lo, bp, hi }; }; };
const note = (m) => 440 * Math.pow(2, (m - 69) / 12);

/* ================= instruments ================= */
function kick(t, g = 1) {
  const len = .38 * SR; let ph = 0;
  for (let i = 0; i < len; i++) { const x = i / SR; ph += PI2 * (46 + 140 * Math.exp(-x * 32)) / SR; const click = i < 90 ? rnd() * (1 - i / 90) * .35 : 0; put(DRM, t, i, (Math.tanh(Math.sin(ph) * 1.6) * Math.exp(-x * 8) + click) * .8 * g); }
  for (let i = 0; i < .32 * SR; i++) { const k = Math.round(t * SR) + i; if (k < N) duck[k] = Math.min(duck[k], 1 - .62 * g * Math.exp(-i / SR * 9)); }
}
function clap(t, g = 1) { const f = svf(); for (const o of [0, .009, .019]) for (let i = 0; i < .16 * SR; i++) { const x = i / SR; const v = f(rnd(), 1400, 1.2).bp; put(DRM, t + o, i, v * Math.exp(-x * (o < .019 ? 90 : 20)) * .8 * g, 0, .25); } }
function shaker(t, g = 1, pan = .25) { const f = svf(); for (let i = 0; i < .06 * SR; i++) { const x = i / SR; const env = Math.min(1, x / .006) * Math.exp(-x * 60); put(DRM, t, i, f(rnd(), 6500, .5).hi * env * .16 * g, pan); } }
function hatO(t, g = 1) { const f = svf(); for (let i = 0; i < .22 * SR; i++) { const x = i / SR; put(DRM, t, i, f(rnd(), 6800, .3).hi * Math.exp(-x * 14) * .13 * g, -.3, .2); } }
function tom(t, f0, g = 1) { let ph = 0; for (let i = 0; i < .35 * SR; i++) { const x = i / SR; ph += PI2 * f0 * (1 + .6 * Math.exp(-x * 20)) / SR; put(DRM, t, i, Math.sin(ph) * Math.exp(-x * 9) * .55 * g, f0 > 120 ? .3 : -.3, .3); } }
function snare(t, g = 1) { const f = svf(); for (let i = 0; i < .14 * SR; i++) { const x = i / SR; put(DRM, t, i, (f(rnd(), 3000, .8).bp * .9 + Math.sin(PI2 * 190 * x) * .4) * Math.exp(-x * 30) * .6 * g, 0, .2); } }

function pad(t, d, freqs, cut, g = 1) {
  for (const fq of freqs) for (const det of [-.006, .006]) {
    const f = svf(); let ph = Math.abs(rnd());
    for (let i = 0; i < d * SR; i++) { const x = i / SR; ph += fq * (1 + det) / SR; const saw = 2 * (ph % 1) - 1; const env = Math.min(1, x / .5) * Math.min(1, (d - x) / .45);
      put(MUS, t, i, f(saw, cut * (1 + .15 * Math.sin(x * 2.1)), .9).lo * env * .07 * g, det * 60, .5); }
  }
}
function epiano(t, freqs, d = .9, g = 1) {
  for (const fq of freqs) for (let i = 0; i < d * SR; i++) {
    const x = i / SR; const I = 1.8 * Math.exp(-x * 5);
    const v = Math.sin(PI2 * fq * x + I * Math.sin(PI2 * fq * x)) + .25 * Math.sin(PI2 * fq * 14 * x) * Math.exp(-x * 40);
    put(MUS, t, i, v * Math.min(1, x / .004) * Math.exp(-x * 3.2) * Math.min(1, (d - x) / .08) * .085 * g, fq > 260 ? .25 : -.25, .45);
  }
}
function bass(t, fq, d, g = 1) { const f = svf(); for (let i = 0; i < d * SR; i++) { const x = i / SR; const s = Math.sin(PI2 * fq * x); const env = Math.min(1, x / .006) * Math.min(1, (d - x) / .03); put(MUS, t, i, (Math.tanh(s * 2.2) * .7 + f(2 * ((fq * x) % 1) - 1, 380, .9).lo * .4) * env * .5 * g); } }
function pluck(t, fq, g = 1, pan = 0) { const f = svf(); for (let i = 0; i < .5 * SR; i++) { const x = i / SR; const tri = 1 - 4 * Math.abs(((fq * x) % 1) - .5); const sq = ((fq * x) % 1) < .5 ? 1 : -1; put(MUS, t, i, f(tri * .7 + sq * .3, 600 + 4200 * Math.exp(-x * 16), .6).lo * Math.exp(-x * 7) * .13 * g, pan, .55); } }
function bell(t, fq, g = 1, pan = 0) { for (let i = 0; i < 1.6 * SR; i++) { const x = i / SR; const v = Math.sin(PI2 * fq * x + 3.2 * Math.exp(-x * 6) * Math.sin(PI2 * fq * 3.5 * x)); put(SFX, t, i, v * Math.min(1, x / .002) * Math.exp(-x * 3.4) * .17 * g, pan, .6); } }

/* ================= sound effects ================= */
function noiseSweep(B, t, d, f0, f1, g = 1, { q = .6, shape = (x) => Math.sin(Math.PI * x), pan0 = 0, pan1 = 0, send = .3, mode = "bp" } = {}) {
  const f = svf();
  for (let i = 0; i < d * SR; i++) { const x = i / (d * SR); const fc = f0 * Math.pow(f1 / f0, x); put(B, t, i, f(rnd(), fc, q)[mode] * shape(x) * .55 * g, lerp(pan0, pan1, x), send); }
}
const lerp = (a, b, p) => a + (b - a) * p;
function boom(t, g = 1, len = 1.4, f0 = 40) { for (let i = 0; i < len * SR; i++) { const x = i / SR; put(SFX, t, i, Math.tanh(Math.sin(PI2 * (f0 + 50 * Math.exp(-x * 7)) * x) * 1.5) * Math.exp(-x * 2.6) * .7 * g, 0, .35); } }
function impact(t, g = 1) { boom(t, g, 2.2, 36); noiseSweep(SFX, t, 1.4, 5000, 600, .9 * g, { shape: (x) => Math.exp(-x * 5), mode: "lo", send: .8 }); }
function riser(t, d, g = 1) { noiseSweep(SFX, t, d, 300, 6500, .9 * g, { shape: (x) => Math.pow(x, 2.2), q: .4, send: .5 }); let ph = 0; for (let i = 0; i < d * SR; i++) { const x = i / (d * SR); ph += (110 * Math.pow(8, x)) / SR; put(SFX, t, i, (2 * (ph % 1) - 1) * Math.pow(x, 3) * .06 * g, 0, .4); } }
function revCymbal(t, d, g = 1) { noiseSweep(SFX, t, d, 2500, 9000, g, { shape: (x) => Math.pow(x, 3.5), mode: "hi", send: .7 }); }
function pop(t, f0 = 500, g = 1, pan = 0) { let ph = 0; for (let i = 0; i < .12 * SR; i++) { const x = i / SR; ph += f0 * (1 + 2.2 * Math.min(1, x * 40)) / SR; put(SFX, t, i, Math.sin(PI2 * ph) * Math.exp(-x * 34) * .32 * g, pan, .3); } }
function thud(t, g = 1) { for (let i = 0; i < .25 * SR; i++) { const x = i / SR; put(SFX, t, i, Math.sin(PI2 * (70 + 90 * Math.exp(-x * 25)) * x) * Math.exp(-x * 16) * .7 * g, 0, .15); } noiseSweep(SFX, t, .08, 900, 300, .5 * g, { shape: (x) => 1 - x, mode: "lo", send: 0 }); }
function click(t, g = 1, f0 = 2400, pan = 0) { const f = svf(); for (let i = 0; i < .018 * SR; i++) { const x = i / SR; put(SFX, t, i, (f(rnd(), f0, 1.6).bp + Math.sin(PI2 * f0 * .5 * x) * .3) * Math.exp(-x * 260) * .5 * g, pan); } }
function key(t, g = 1) { click(t, .55 * g, 1800 + Math.abs(rnd()) * 1600, rnd() * .3); click(t + .012, .2 * g, 900, 0); }
function tick(t, g = 1, f0 = 3200) { for (let i = 0; i < .012 * SR; i++) { const x = i / SR; put(SFX, t, i, Math.sin(PI2 * f0 * x) * Math.exp(-x * 500) * .35 * g, .2); } }
function pip(t, fq, g = 1, pan = 0) { for (let i = 0; i < .05 * SR; i++) { const x = i / SR; put(SFX, t, i, Math.sin(PI2 * fq * x) * Math.exp(-x * 70) * .2 * g, pan, .2); } }
function chatter(t, d, g = 1) { for (let k = 0; k < d / .028; k++) if (Math.abs(rnd()) > .3) pip(t + k * .028, 1400 + Math.abs(rnd()) * 2600, .45 * g, rnd() * .6); }
function buzz(t, g = 1) { for (let i = 0; i < .32 * SR; i++) { const x = i / SR; const sq = ((110 * x) % 1) < .5 ? 1 : -1; put(SFX, t, i, sq * (.6 + .4 * Math.sin(PI2 * 28 * x)) * Math.min(1, (.32 - x) / .04) * .11 * g, 0, .1); } }
function glitch(t, d, g = 1) {
  let k = 0;
  while (k < d) { const seg = .018 + Math.abs(rnd()) * .05, kind = Math.floor(Math.abs(rnd()) * 3), fq = 120 + Math.abs(rnd()) * 1800, hold = 4 + Math.floor(Math.abs(rnd()) * 30); let held = 0;
    for (let i = 0; i < seg * SR; i++) { const x = i / SR; if (i % hold === 0) held = rnd(); const v = kind === 0 ? (((fq * x) % 1) < .5 ? 1 : -1) * .5 : kind === 1 ? held : Math.round(Math.sin(PI2 * fq * x) * 3) / 3; put(SFX, t + k, i, v * .32 * g, (kind - 1) * .5); }
    k += seg + (Math.abs(rnd()) > .7 ? .02 : 0); }
}
function shutter(t, g = 1) { for (let k = 0; k < 6; k++) click(t + k * .055, .9 * g, 1200 + k * 200, k % 2 ? .4 : -.4); noiseSweep(SFX, t + .05, .5, 4000, 500, .9 * g, { shape: (x) => Math.sin(Math.PI * Math.pow(x, .6)), send: .3 }); }
function swipe(t, d, g = 1, pan0 = .8, pan1 = -.8) { noiseSweep(SFX, t, d, 700, 3800, g, { pan0, pan1, q: .5, shape: (x) => Math.pow(Math.sin(Math.PI * x), 1.5) }); }
function sparkle(t, d, g = 1) { const ns = [86, 89, 93, 96, 98, 101]; for (let k = 0; k < d / .045; k++) pip(t + k * .045 + Math.abs(rnd()) * .02, note(ns[Math.floor(Math.abs(rnd()) * ns.length)]), .5 * g * (1 - k * .045 / d), rnd()); }
function typeClicks(at, text, cps, g = 1) { [...text].forEach((ch, i) => { if (ch !== " ") key(at + (i + 1) / cps, g); }); }
function counterTicks(at, dur, to, g = 1) { let last = 0, lt = -1; for (let ms = 0; ms <= dur * 1000; ms++) { const p = ms / (dur * 1000); const v = Math.round(to * (1 - Math.pow(1 - p, 4))); if (v !== last && at + ms / 1000 - lt > .016) { tick(at + ms / 1000, g, 2600 + v * 30); lt = at + ms / 1000; last = v; } } }

/* ================= arrangement ================= */
const CH = [
  { root: 38, pad: [62, 65, 69, 72, 76], keys: [65, 69, 72, 76], arp: [74, 77, 81, 84, 81, 77] },     // Dm9
  { root: 34, pad: [58, 62, 65, 69, 74], keys: [62, 65, 69, 74], arp: [70, 74, 77, 81, 77, 74] },     // Bbmaj7
  { root: 31, pad: [58, 62, 65, 67, 69], keys: [58, 62, 65, 69], arp: [67, 70, 74, 77, 74, 70] },     // Gm9
  { root: 33, pad: [57, 62, 64, 67, 73], keys: [61, 64, 67, 69], arp: [69, 73, 76, 79, 76, 73] },     // A7sus→A7
];
const chordAt = (t) => CH[Math.floor(t / 2) % 4];
const inAny = (t, rs) => rs.some(([a, b]) => t >= a && t < b);
const GROOVE = [[16.0, 29.7], [30.5, 37.0], [40.0, 45.5], [46.5, 51.5]];

for (let b = 0; b < 29; b++) {
  const t = b * 2, c = chordAt(t);
  /* pad: opens up over the film, gap before the drop */
  if (!(t >= 51.5 && t < 52)) {
    const cut = t < 8 ? 380 + t * 140 : t < 16 ? 1300 : t < 30 ? 1900 : t < 37 ? 2300 : t < 40 ? 3200 : t < 46 ? 2400 : t < 52 ? 1800 + (t - 46) * 450 : 2600;
    pad(t, t === 50 ? 1.55 : 2.08, c.pad.map(note), cut, t < 4 ? .6 : t >= 37 && t < 40 ? 1.25 : 1);
  }
  /* bass */
  if (t >= 8 && t < 16) for (let k = 0; k < 8; k++) bass(t + k * .25, note(c.root), .1, .55);
  [0, .75, 1.0, 1.5, 1.75].forEach((o, k) => { if (inAny(t + o, GROOVE)) bass(t + o, note(c.root + (k === 3 ? 12 : 0)), k === 0 ? .55 : .2, 1); });
  /* electric piano stabs (how-it-works + platforms) */
  if ((t >= 16 && t < 30) || (t >= 40 && t < 46)) [.25, .75, 1.5].forEach((o, k) => epiano(t + o, c.keys.map(note), k === 2 ? .45 : .3, k === 2 ? .8 : 1));
  /* arp (features + build) */
  if ((t >= 30 && t < 40) || (t >= 46 && t < 51.5)) for (let k = 0; k < 16; k++) { const tt = t + k * .125; if (tt < 30.5 || (tt >= 51.5)) continue; pluck(tt, note(c.arp[k % 6] + (t >= 37 && t < 40 && k % 4 === 0 ? 12 : 0)), t >= 37 && t < 40 ? 1.2 : .85, k % 2 ? .4 : -.4); }
}
/* intro bells + finale */
[[.6, 81], [1.9, 76], [4.4, 84], [5.6, 81], [6.6, 77]].forEach(([t, m]) => bell(t, note(m), .55, rnd() * .4));
epiano(53.05, [50, 57, 62, 65, 69, 72, 76].map(note), 4.2, 1.4);
bass(53.05, note(38), 2.8, 1.1);
epiano(55.05, [46, 53, 58, 62, 65, 69, 74].map(note), 2.9, 1.2);
bass(55.05, note(34), 2.6, 1);
[[54.0, 81], [54.5, 84], [55.5, 86], [56.2, 89]].forEach(([t, m]) => bell(t, note(m), .7, rnd() * .5));

/* drums */
for (let b = 0; b < DUR * 4; b++) {
  const t = b * .25, beat = b % 4 === 0, bi = Math.floor(b / 4);
  if (beat) {
    if (t >= 4 && t < 8 && bi % 2 === 0) kick(t, .45);
    if (t >= 8 && t < 12 && bi % 2 === 0) kick(t, .55);
    if (t >= 12.5 && t < 16) kick(t, .7);
    if (inAny(t, GROOVE)) kick(t, 1);
    if (t >= 54 && t < 57 && bi % 2 === 0) kick(t, .6);
    if (inAny(t, [[16, 29.7], [30.5, 37], [40, 45.5], [46.5, 49.5]]) && bi % 2 === 1) clap(t, .9);
  }
  if (inAny(t, [[8.15, 29.7], [30.5, 51.5], [53.5, 56.5]])) shaker(t, (t < 16 ? .6 : 1) * (b % 4 === 2 ? 1.3 : .8), b % 2 ? .3 : -.1);
  if (b % 4 === 2 && inAny(t, [[16, 29.7], [40, 45.5]])) hatO(t, 1);
}
[[44.25, 160], [44.375, 130], [44.5, 100], [44.625, 82]].forEach(([t, f]) => tom(t, f, .8));
/* snare roll build 49.5 → 51.5 */
for (let t = 49.5, s = .25; t < 51.45; t += s, s = Math.max(.0625, s * .9)) snare(t, .35 + (t - 49.5) * .35);

/* ================= transition sound design (one per cut) ================= */
// T1 · zoom through the play mark → acid peel
riser(6.9, 1.25, .8); noiseSweep(SFX, 7.45, .7, 200, 5000, 1, { shape: (x) => Math.pow(x, 1.5), q: .3 }); impact(8.15, .75); swipe(8.18, .58, .7, 0, 0); pop(8.15, 300, 1.2);
// T2 · dropzone morph → lands in the dashboard
noiseSweep(SFX, 15.4, .8, 400, 2600, .8, { q: .25, shape: (x) => Math.sin(Math.PI * x * .9), pan0: .4, pan1: -.2 }); boom(16.15, .55, .9, 52); [16.66, 16.72].forEach((t, i) => click(t, 1.1, 1500 + i * 700));
// T3 · vertical page push (falling whoosh, sub)
noiseSweep(SFX, 29.7, .8, 3400, 260, 1.1, { mode: "lo", q: .3, shape: (x) => Math.sin(Math.PI * Math.pow(x, .7)) }); boom(30.45, .7, 1.1, 34);
// T4 · banner letters fly out
noiseSweep(SFX, 30.72, .32, 2000, 8000, .7, { q: .5, mode: "hi" }); [0, 1, 2, 3, 4].forEach((k) => tick(30.74 + k * .045, .8, 3000 + k * 300));
// T5 · carousel slide (pans right → left)
swipe(33.6, .7, 1.1, .9, -.9); thud(34.28, .5);
// T6 · mosaic flip (pips rise in, fall out)
for (let k = 0; k < 18; k++) { pip(36.42 + k * .02, note(72 + k), .9, (k / 17) * 1.6 - .8); pip(37.02 + k * .02, note(89 - k), .7, .8 - (k / 17) * 1.6); }
// T7 · zoom-through (reverse cymbal → soft hit)
revCymbal(39.2, .82, .9); boom(40.0, .5, 1.0, 60); noiseSweep(SFX, 40.0, .6, 6000, 900, .4, { mode: "lo", shape: (x) => Math.exp(-x * 4) });
// T8 · glitch
glitch(42.72, .54, 1);
// T9 · iris closes into the clock
shutter(45.58, 1); boom(46.22, .7, 1.2, 44);
// T10 · diamond ink flood → silence → finale
riser(50.6, 1.55, 1.1); impact(52.15, 1.0);

/* ================= on-screen events ================= */
/* S1 */
typeClicks(.1, "content_automation --autopilot", 38, .9); typeClicks(.95, "● AI · SCHEDULER · PUBLISHER ONLINE", 60, .5);
noiseSweep(SFX, 1.2, .8, 600, 3000, .7, { q: .4 }); pop(1.5, 220, 1.2); swipe(2.25, .65, .6, -.6, .4);
impact(3.15, .7); [2.35, 2.6].forEach((t) => { for (let k = 0; k < 7; k++) click(t + k * .035, .5, 900, 0); });
noiseSweep(SFX, 3.35, .5, 1500, 5000, .4, { q: .5 }); typeClicks(3.9, "BULK UPLOAD  ·  AI METADATA  ·  PEAK-HOUR POSTING", 46, .35);
[[4.35, 520], [4.5, 660], [4.65, 780]].forEach(([t, f], i) => pop(t, f, 1, i - 1));
/* S2 */
[8.55, 9.15, 9.75].forEach((t, i) => { thud(t + .08, .9); click(t + .08, .8, 3000); });
for (let i = 0; i < 18; i++) noiseSweep(SFX, 8.5 + i * .11, .07, 3000, 1500, .25, { mode: "hi", send: 0, pan0: rnd() * .7, pan1: rnd() * .7 });
for (let i = 0; i < 7; i++) { pip(9.35 + i * .26, note(76), .5, rnd() * .6); pip(9.42 + i * .26, note(81), .4, rnd() * .6); }
noiseSweep(SFX, 10.7, .35, 1200, 4000, .5, { q: .3 });
pop(12.2, 260, 1); noiseSweep(SFX, 12.4, .9, 250, 3000, .8, { mode: "lo", shape: (x) => Math.pow(x, 1.4) * (1 - x) * 4, q: .5 });
counterTicks(12.75, .75, 50, .55); thud(13.25, .8);
for (let k = 0; k < 9; k++) click(13.15 + k * .04, .45, 1100, 0); noiseSweep(SFX, 13.7, .4, 1000, 4000, .45, { q: .4 });
typeClicks(14.05, "EVERYTHING ELSE RUNS ON AUTOPILOT.", 42, .45);
[14.45, 14.8, 15.15].forEach((t, i) => { thud(t + .1, .45); pip(t + .12, note(69 + i * 5), .7); });
/* S3 · how it works */
[17.0, 17.3].forEach((t, i) => { click(t, 1.2, 2200); pip(t + .01, note(81 + i * 3), .7, i ? .3 : -.3); });
noiseSweep(SFX, 17.85, .55, 900, 2000, .35, { q: .5, pan0: .3, pan1: -.1 }); thud(18.55, 1); noiseSweep(SFX, 18.55, .25, 3000, 600, .5, { mode: "lo" });
[62, 65, 67, 69, 72].forEach((m, i) => pluck(18.6 + i * .15, note(m + 12), 1.1, (i - 2) * .25));
for (let i = 0; i < 5; i++) chatter(19.95 + i * .33, .55, .55);
for (let i = 0; i < 5; i++) { click(24.0 + i * .22, .8, 1300); pip(24.02 + i * .22, note(74 + i * 2), .5); }
for (let k = 0; k < 13; k++) tick(24.35 + k * .045, .7, 1800 + k * 160);
for (let k = 0; k < 5; k++) pip(25.15 + k * .12, note(86 + [0, 2, 3, 5, 7][k]), .55, (k - 2) * .3);
for (let k = 0; k < 14; k++) tick(26.8 + k * .093, k % 4 === 0 ? 1 : .55, 2400);
[[27.55, 86], [27.9, 89], [28.25, 93]].forEach(([t, m], i) => bell(t, note(m), 1, (i - 1) * .4));
/* S4 · features */
for (let k = 0; k < 12; k++) click(30.2 + k * .028, .6, 800 + k * 40, 0); thud(30.55, .6);
[31.12, 33.84, 37.12, 39.94, 43.12].forEach((t, i) => { pop(t, 180 + i * 30, 1.2); noiseSweep(SFX, t + .1, .35, 1500, 5000, .35, { q: .5, pan0: -.5, pan1: .5 }); });
chatter(31.5, .6, .4); for (let k = 0; k < 6; k++) pop(33.02 + k * .09, 700 + k * 90, .55, (k - 2.5) * .25);
for (let k = 0; k < 9; k++) tick(34.34 + k * .037, .6, 2000);
for (let k = 0; k < 5; k++) { thud(34.99 + k * .13, .35); pip(34.99 + k * .13, note(74 + [0, 3, 5, 7, 10][k]), .6); }
[37.57, 37.87, 38.17, 38.47, 38.77].forEach((t, k) => { click(t, 1, 1600); pip(t, note(69 + k * 2), .6); });
buzz(38.95, 1); thud(38.95, .7); swipe(39.02, .4, .5, -.7, .2); pop(39.32, 600, .8);
for (let i = 0; i < 2; i++) noiseSweep(SFX, 40.54 + i * .1, .9, 500, 3500, .45, { q: .9, pan0: -.5, pan1: i ? .5 : .2 });
[[41.84, 86], [42.06, 89]].forEach(([t, m]) => bell(t, note(m), .9, .3));
for (let k = 0; k < 20; k++) tick(43.15 + k * .142, .4, 2800);
for (let k = 0; k < 6; k++) typeClicks(43.62 + k * .24, "▪▪▪▪", 60, .4);
noiseSweep(SFX, 44.42, .65, 3000, 300, .5, { mode: "lo", q: .8 });
/* S5 · complete experience */
[47.0, 47.15].forEach((t) => thud(t + .1, .5)); [[47.1, 89], [47.45, 93]].forEach(([t, m]) => bell(t, note(m), 1, .2)); buzz(47.5, .6);
noiseSweep(SFX, 47.0, .6, 1200, 3500, .4, { q: .4 });
impact(49.3, .8); noiseSweep(SFX, 49.3, .5, 6000, 1500, .5, { mode: "hi" }); noiseSweep(SFX, 49.6, .4, 400, 2000, .3, { q: .3 });
/* S6 · ending */
swipe(52.35, .55, .9, .9, 0); impact(53.05, 1.15); sparkle(53.1, 1.6, 1.1);
for (let k = 0; k < 10; k++) click(53.0 + k * .035, .45, 700, 0); noiseSweep(SFX, 53.55, .5, 900, 4500, .5, { q: .4 });
typeClicks(54.1, "ONE DROP. EVERY PLATFORM. ON AUTOPILOT.", 40, .45);
[0, 1, 2].forEach((i) => pop(54.8 + i * .12, 520 + i * 130, .9, i - 1));

/* ================= reverb (Freeverb-style) ================= */
function reverb(inp, sr, off) {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422, 1277, 1356].map((d) => ({ b: new Float32Array(d + off), i: 0, s: 0 }));
  const aps = [556, 441, 341].map((d) => ({ b: new Float32Array(d + off), i: 0 }));
  for (let n = 0; n < N; n++) {
    const x = inp[n] * .3; let y = 0;
    for (const c of combs) { const o = c.b[c.i]; c.s = o * .78 + c.s * .22; c.b[c.i] = x + c.s * .86; c.i = (c.i + 1) % c.b.length; y += o; }
    for (const a of aps) { const o = a.b[a.i]; const v = -y + o; a.b[a.i] = y + o * .5; a.i = (a.i + 1) % a.b.length; y = v; }
    out[n] = y;
  }
  return out;
}
const VL = reverb(VERB.L, SR, 0), VR = reverb(VERB.R, SR, 23);

/* ================= master ================= */
const L = new Float32Array(N), R = new Float32Array(N);
let peak = 0;
for (let i = 0; i < N; i++) {
  const x = i / SR, fade = Math.min(1, x / .03) * Math.min(1, (DUR - x) / 1.6);
  const d = duck[i];
  let l = MUS.L[i] * d * .9 + DRM.L[i] * .85 + SFX.L[i] * 1.0 + VL[i] * .32;
  let r = MUS.R[i] * d * .9 + DRM.R[i] * .85 + SFX.R[i] * 1.0 + VR[i] * .32;
  L[i] = Math.tanh(l * 1.1) * fade; R[i] = Math.tanh(r * 1.1) * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const g = .89 / peak, buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(L[i] * g * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(R[i] * g * 32767), 46 + i * 4); }
writeFileSync(new URL("./audio.wav", import.meta.url), buf);
console.log("audio.wav written · peak", peak.toFixed(2));
