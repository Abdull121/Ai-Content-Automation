/* Deterministic, seekable motion engine.
   Every animation is a paused Web Animation; seek(t) sets currentTime on all of
   them plus runs per-frame functions (typing, counters, camera, particles).
   The same timeline therefore renders identically for any frame, in any order. */
const T_END = 58;
const anims = [];
const fns = [];

function bez(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (t) => ((ax * t + bx) * t + cx) * t;
  const Y = (t) => ((ay * t + by) * t + cy) * t;
  const dX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) { const e = X(t) - x; if (Math.abs(e) < 1e-5) break; const d = dX(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
    let lo = 0, hi = 1; if (t < 0 || t > 1) { t = x; for (let i = 0; i < 24; i++) { const v = X(t); if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; } }
    return Y(t);
  };
}
const EASE = {
  outExpo: [.16, 1, .3, 1], outQuart: [.25, 1, .5, 1], outBack: [.34, 1.56, .64, 1], outBack2: [.2, 2.1, .4, 1],
  inOut: [.65, 0, .35, 1], inOutSoft: [.45, 0, .2, 1], in: [.7, 0, .84, 0], out: [.22, 1, .36, 1], lin: [0, 0, 1, 1], press: [.2, .8, .2, 1],
};
const css = (n) => (EASE[n] ? `cubic-bezier(${EASE[n].join(",")})` : n);
const efn = {}; for (const k in EASE) efn[k] = bez(...EASE[k]);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const prog = (t, at, dur, e = "lin") => efn[e](clamp((t - at) / dur));

function A(el, kf, at, dur, ease = "outExpo", extra = {}) {
  const a = el.animate(kf, { delay: at * 1000, duration: Math.max(1, dur * 1000), easing: css(ease), fill: "both", ...extra });
  a.pause(); anims.push(a); return a;
}
/* enter: from -> to, shorthand */
function IN(el, at, { from = {}, to = {}, dur = .6, ease = "outExpo" } = {}) {
  return A(el, [{ opacity: 0, ...from }, { opacity: 1, transform: "none", ...to }], at, dur, ease);
}
function OUT(el, at, { to = {}, dur = .3, ease = "in" } = {}) {
  return A(el, [{ opacity: 1 }, { opacity: 0, ...to }], at, dur, ease);
}
function F(fn) { fns.push(fn); }

/* visibility windows: [[a,b],...] seconds */
function vis(el, ranges) {
  const kf = [{ visibility: "hidden", offset: 0 }];
  for (const [a, b] of ranges) {
    kf.push({ visibility: "hidden", offset: a / T_END }, { visibility: "visible", offset: a / T_END },
      { visibility: "visible", offset: Math.min(1, b / T_END) }, { visibility: "hidden", offset: Math.min(1, b / T_END) });
  }
  kf.push({ visibility: "hidden", offset: 1 });
  const a = el.animate(kf, { duration: T_END * 1000, fill: "both", easing: "linear" });
  a.pause(); anims.push(a);
}

function h(html) { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; }
function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return [...root.querySelectorAll(sel)]; }
function add(parent, html) { const e = typeof html === "string" ? h(html) : html; parent.appendChild(e); return e; }

/* position of el relative to ancestor `root`, ignoring transforms */
function wpos(el, root) {
  let x = 0, y = 0, e = el;
  while (e && e !== root) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight, cx: x + el.offsetWidth / 2, cy: y + el.offsetHeight / 2 };
}

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* typewriter */
function typeText(el, text, at, cps = 40, { caret = false } = {}) {
  F((t) => {
    const n = clamp(Math.floor((t - at) * cps), 0, text.length);
    el.textContent = t < at ? "" : text.slice(0, n) + (caret && n < text.length && t >= at ? "▌" : "");
  });
}
/* counter */
function countTo(el, from, to, at, dur, fmt = (v) => String(Math.round(v)), ease = "outQuart") {
  F((t) => { el.textContent = fmt(lerp(from, to, prog(t, at, dur, ease))); });
}

/* camera: keys {t, wx, wy, s, sx, sy, rx, ry, ease} (ease governs the segment ending at that key) */
function makeCamera(world, tilt, keys) {
  F((t) => {
    let k0 = keys[0], k1 = keys[0], p = 0;
    if (t >= keys[keys.length - 1].t) { k0 = k1 = keys[keys.length - 1]; }
    else if (t > keys[0].t) {
      for (let i = 0; i < keys.length - 1; i++) {
        if (t >= keys[i].t && t < keys[i + 1].t) { k0 = keys[i]; k1 = keys[i + 1]; p = efn[k1.ease || "inOut"]((t - k0.t) / (k1.t - k0.t)); break; }
      }
    }
    const g = (n, d) => lerp(k0[n] ?? d, k1[n] ?? d, p);
    const s = g("s", 1), wx = g("wx", 0), wy = g("wy", 0), sx = g("sx", 960), sy = g("sy", 540), rx = g("rx", 0), ry = g("ry", 0);
    world.style.transform = `translate(${sx - wx * s}px,${sy - wy * s}px) scale(${s})`;
    tilt.style.transform = `perspective(2600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    tilt.style.transformOrigin = `${sx}px ${sy}px`;
    camState.wx = wx; camState.wy = wy; camState.s = s; camState.sx = sx; camState.sy = sy;
  });
}
const camState = { wx: 0, wy: 0, s: 1, sx: 960, sy: 540 };

/* transition wipe: bars sweep in, cover, sweep out. returns the swap time */
function wipe(at, { D = 1.1, n = 5, st = .05, colors = ["#0b0b0b", "#ccff00", "#1b4dff", "#0b0b0b", "#ccff00"], orient = "v", dir = 1, parent } = {}) {
  const host = parent || $("#wipes");
  for (let i = 0; i < n; i++) {
    const b = add(host, `<div class="abs" style="background:${colors[i % colors.length]}"></div>`);
    if (orient === "v") { b.style.cssText += `left:${(i * 1920) / n - 1}px;width:${1920 / n + 2}px;top:0;height:1080px`; }
    else { b.style.cssText += `top:${(i * 1080) / n - 1}px;height:${1080 / n + 2}px;left:0;width:1920px`; }
    const ax = orient === "v" ? "Y" : "X";
    const d = (i * st) * (dir > 0 ? 1 : 1);
    A(b, [
      { transform: `translate${ax}(${-101 * dir}%)`, easing: css("inOut") },
      { transform: `translate${ax}(0%)`, offset: .27 },
      { transform: `translate${ax}(0%)`, offset: .73, easing: css("inOut") },
      { transform: `translate${ax}(${101 * dir}%)` },
    ], at + d, D, "lin");
  }
  return at + ((st * (n - 1) + .27 * D) + .73 * D) / 2;
}

/* run to time t */
function seek(t) {
  for (const a of anims) a.currentTime = t * 1000;
  for (const f of fns) f(t);
}
