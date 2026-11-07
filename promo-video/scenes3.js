/* ===================== DASHBOARD LAYER (shared by Scene 3 + Scene 5) ===================== */
let D = null;
const PUB_TIMES = [27.55, 27.9, 28.25, 47.1, 47.45]; // when row i becomes PUBLISHED

function path(el, pts, { base = "translate" } = {}) {
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t, dur = t1 - t0;
  const kf = pts.map((p, i) => ({ transform: `translate(${p.x}px,${p.y}px) scale(${p.s ?? 1})`, offset: (p.t - t0) / dur, opacity: p.o ?? 1, easing: css(p.e || "inOut") }));
  return A(el, kf, t0, dur, "lin");
}
function ripple(parent, x, y, at, color = "var(--volt)") {
  const r = add(parent, `<div class="abs" style="left:${x - 18}px;top:${y - 18}px;width:36px;height:36px;border:4px solid ${color};z-index:60"></div>`);
  A(r, [{ transform: "scale(.3)", opacity: .95 }, { transform: "scale(2.2)", opacity: 0 }], at, .5, "outExpo");
}

function badgeSeq(row, seq) {
  /* seq: [[state, time], ...] — each badge shows from its time until the next begins */
  seq.forEach(([st, at], i) => {
    const el = $(`[data-b="${st}"]`, row);
    const end = i < seq.length - 1 ? seq[i + 1][1] : 999;
    vis(el, [[at, end]]);
    const tilt = st === "pub" ? "rotate(-1.4deg)" : "none";
    A(el, [{ opacity: 0, transform: "scale(1.45) rotate(-4deg)" }, { opacity: 1, transform: tilt }], at, .28, "outBack");
    if (st === "gen") { const dot = $("svg", el); A(dot, [{ opacity: 1 }, { opacity: .25 }, { opacity: 1 }], at, .5, "lin", { iterations: 8 }); }
  });
}

function buildDashLayer() {
  const layer = h(`<div id="dashLayer" class="scene" style="background:var(--paper)"></div>`);
  $("#stage").insertBefore(layer, $("#s3"));
  const par = add(layer, `<div id="par" class="abs" style="inset:-80px;background-image:radial-gradient(rgba(11,11,11,.22) 2px,transparent 2.5px);background-size:48px 48px"></div>`);
  const tilt = add(layer, `<div id="tilt" class="abs" style="left:0;top:0;width:1920px;height:1080px"></div>`);
  D = buildDash(tilt);
  D.layer = layer; D.tilt = tilt; D.par = par;
  /* visibility windows are owned by transitions.js */
  F(() => { par.style.backgroundPosition = `${-camState.wx * camState.s * .22}px ${-camState.wy * camState.s * .22}px`; });

  const W = D.world;
  const up = wpos(D.up, W), sch = wpos(D.sch, W), acc = wpos(D.acc, W), qw = wpos(D.qwell, W), fr = wpos(D.frame, W);
  D.geo = { up, sch, acc, qw, fr };
  const pillY = wpos($("#pills", W), W), dz = wpos($("#dz", W), W);
  const B = 3; // frame border

  /* ---- Step 1 · pills + cursor + drop ---- */
  const pill = (k) => $(`[data-pill="${k}"]`, W);
  const pc = (k) => { const p = wpos(pill(k), W); return { x: p.cx + B, y: p.cy + B }; };
  const press = (k, at) => {
    const on = $(".on", pill(k));
    A(on, [{ opacity: 0, transform: "translate(4px,4px) scale(.96)", boxShadow: "0 0 0 0 #0b0b0b" }, { opacity: 1, transform: "translate(0,0) scale(1)", boxShadow: "4px 4px 0 #0b0b0b" }], at, .35, "outBack");
    ripple(W, pc(k).x, pc(k).y, at);
  };
  press("yt", 17.0); press("ig", 17.3);

  const cur = add(W, `<div class="abs" style="left:0;top:0;z-index:70"><svg width="44" height="44" viewBox="0 0 24 24"><path d="M5 3L5 19.5L9.6 15.2L12.6 21.6L15.6 20.2L12.7 13.9L19 13.9Z" fill="#fff" stroke="#0b0b0b" stroke-width="1.8" stroke-linejoin="miter"/></svg></div>`);
  const dzc = { x: dz.cx + B, y: dz.cy + B };
  const yt = pc("yt"), ig = pc("ig");
  path(cur, [
    { t: 16.3, x: ig.x + 500, y: yt.y - 90, o: 0, e: "outExpo" },
    { t: 16.75, x: yt.x + 6, y: yt.y + 4, o: 1, e: "inOut" },
    { t: 17.0, x: yt.x + 6, y: yt.y + 4, e: "inOut" },
    { t: 17.3, x: ig.x + 6, y: ig.y + 4, e: "inOut" },
    { t: 17.55, x: ig.x + 330, y: ig.y + 110, e: "inOut" },
    { t: 17.85, x: ig.x + 330, y: ig.y + 110, e: "inOut" },
    { t: 18.4, x: dzc.x + 40, y: dzc.y - 10, e: "outExpo" },
    { t: 18.7, x: dzc.x + 60, y: dzc.y + 40, e: "inOut" },
    { t: 19.3, x: dzc.x + 520, y: dzc.y + 260, o: 0, e: "in" },
  ]);
  /* dragged file stack */
  const stk = add(W, `<div class="abs" style="left:0;top:0;z-index:65"></div>`);
  [0, 1, 2].forEach((i) => add(stk, `<div class="filecard" style="left:${-i * 12}px;top:${-i * 12}px;width:210px;height:62px;box-shadow:4px 4px 0 var(--ink);font-size:13px"><span class="ic" style="width:28px;height:28px">${ICON.play.replace('width="20" height="20"', 'width="14" height="14"')}</span><span>${i === 0 ? "cdl-1…5.mp4" : ""}<small>5 files</small></span></div>`));
  path(stk, [
    { t: 17.3, x: ig.x + 330 + 8, y: ig.y + 110 + 6, o: 0, s: .3, e: "outBack" },
    { t: 17.6, x: ig.x + 330 + 8, y: ig.y + 110 + 6, o: 1, s: 1, e: "inOut" },
    { t: 17.85, x: ig.x + 330 + 8, y: ig.y + 110 + 6, e: "inOut" },
    { t: 18.4, x: dzc.x + 48, y: dzc.y - 4, e: "outExpo" },
    { t: 18.55, x: dzc.x + 48, y: dzc.y - 4, e: "in" },
    { t: 18.8, x: dzc.x - 30, y: dzc.y + 10, o: 0, s: .35, e: "in" },
  ]);
  /* dropzone drag state */
  const dzon = $(".dz-on", W);
  A(dzon, [{ opacity: 0 }, { opacity: 1 }], 18.0, .25, "outExpo");
  A(dzon, [{ opacity: 1 }, { opacity: 0 }], 18.6, .3, "outExpo", { fill: "forwards" });
  ripple(W, dzc.x, dzc.y, 18.55, "var(--acid)");

  /* ---- queue rows ---- */
  const items = $("[data-role=items]", W), qcount = $("[data-role=qcount]", W);
  D.rows.forEach((row, i) => {
    const v = VIDEOS[i];
    const tq = 18.6 + i * .15, tg = 19.95 + i * .33, ts = 24.0 + i * .22, tp = PUB_TIMES[i] - .5, tpub = PUB_TIMES[i];
    A(row, [{ opacity: 0, transform: "scale(1.1) translateY(-14px)" }, { opacity: 1, transform: "scale(1)" }], tq, .4, "outBack");
    badgeSeq(row, [["queued", tq], ["gen", tg], ["sched", ts], ["pend", tp], ["pub", tpub]]);
    /* scan bar while generating */
    const scan = $(".scan", row);
    vis(scan, [[tg, ts]]);
    F((t) => { scan.style.opacity = t >= tg && t < ts ? 1 : 0; scan.style.transform = `scaleX(${((t - tg) * 1.6) % 1})`; });
    /* title + hashtags */
    const tt = tg + .32;
    typeText($("[data-role=ttl]", row), v.title, tt, 52);
    $$(".hs span", row).forEach((s, k) => A(s, [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], tt + 1.1 + k * .09, .3, "outBack"));
    /* schedule line */
    const sl = $("[data-role=sch]", row);
    typeText(sl, "Goes out " + v.when, ts + .1, 55);
    /* row-3.. published rows get paper bg */
    A(row, [{ backgroundColor: "#ffffff" }, { backgroundColor: "#efeae0" }], tpub, .3, "lin", { fill: "forwards" });
  });
  F((t) => { const n = D.rows.reduce((a, _, i) => a + (t >= 18.6 + i * .15 ? 1 : 0), 0); items.textContent = n + " ITEMS"; qcount.textContent = n + " items"; });

  /* ---- Step 3 · schedule panel ---- */
  const cells = $$("#hour i b", W);
  cells.forEach((b, k) => { if (k >= 8 && k < 21) A(b, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], 24.35 + (k - 8) * .045, .3, "outQuart"); });
  const hs = $("#hs", W), he = $("#he", W);
  A(hs, [{ left: "0%" }, { left: "31%" }], 24.1, .8, "outExpo");
  A(he, [{ left: "92%" }, { left: "84%" }], 24.3, .8, "outExpo");
  $$("[data-peak]", W).forEach((p, k) => A(p, [{ transform: "translateX(-50%) scaleY(0)", transformOrigin: "bottom" }, { transform: "translateX(-50%) scaleY(1)", transformOrigin: "bottom" }], 25.15 + k * .12, .4, "outBack"));
  $$("[data-peaklbl]", W).forEach((p, k) => A(p, [{ opacity: 0 }, { opacity: 1 }], 25.3 + k * .12, .3, "outExpo"));
  const tzf = $("#tzf", W);
  A(tzf, [{ backgroundColor: "#ffffff" }, { backgroundColor: "#ccff00" }, { backgroundColor: "#ffffff" }], 23.5, .8, "inOut");
  ["yt", "ig", "tt"].forEach((k, i) => { const e = $(`[data-role=max-${k}]`, W); countTo(e, 0, [5, 5, 10][i], 25.4 + i * .1, .5); });

  /* ---- accounts · counters ---- */
  ["yt", "ig"].forEach((k) => {
    const meterCells = $$(`[data-role=meter-${k}] i b`, W);
    const cnt = $(`[data-role=cnt-${k}]`, W), left = $(`[data-role=left-${k}]`, W);
    PUB_TIMES.forEach((pt, n) => A(meterCells[n], [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], pt, .3, "outBack"));
    F((t) => {
      const c = PUB_TIMES.filter((pt) => t >= pt).length;
      cnt.textContent = String(c).padStart(2, "0");
      left.textContent = `${String(5 - c).padStart(2, "0")} left · ${c * 20}% of cap used`;
    });
    const big = $(`[data-role=cnt-${k}]`, W).parentElement;
    const cap = add(big, `<span class="badge b-fail" style="margin-left:auto;font-size:11px">AT CAP</span>`);
    A(cap, [{ opacity: 0, transform: "scale(1.6)" }, { opacity: 1, transform: "none" }], PUB_TIMES[4], .3, "outBack");
  });
  const live = $("[data-role=live]", W);

  /* ================= SCENE 3 OVERLAYS (screen space) ================= */
  const s = $("#s3");
  const top = add(s, `<div class="abs" style="left:0;top:0;width:1920px;height:76px;background:var(--ink);z-index:30;border-bottom:3px solid var(--ink)"></div>`);
  const bar = add(s, `<div class="abs" style="left:0;top:956px;width:1920px;height:124px;background:var(--ink);z-index:30;overflow:hidden"></div>`);
  A(top, [{ transform: "translateY(-100%)" }, { transform: "translateY(0)" }], 16.3, .6, "outExpo");
  A(bar, [{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], 16.3, .6, "outExpo");
  add(top, `<div class="abs mono" style="left:40px;top:26px;font-size:15px;font-weight:700;letter-spacing:.14em;color:var(--paper)">HOW IT WORKS <span style="color:var(--acid)">//</span> 4 STEPS</div>`);
  const steps = [["01", "UPLOAD", 16.15], ["02", "AI METADATA", 19.65], ["03", "SCHEDULE", 23.15], ["04", "PUBLISH", 26.65]];
  steps.forEach(([n, lb, at], i) => {
    const x = 760 + i * 280;
    const chipH = (on) => `<div class="abs mono" style="left:${x}px;top:14px;width:260px;height:48px;border:2px solid ${on ? "var(--acid)" : "#555"};display:flex;align-items:center;gap:12px;padding:0 14px;font-size:15px;font-weight:700;letter-spacing:.1em;${on ? "background:var(--acid);color:var(--ink);" : "color:#9a9a9a;"}"><span style="font-size:20px">${n}</span>${lb}</div>`;
    add(top, chipH(false));
    const on = add(top, chipH(true));
    const next = steps[i + 1] ? steps[i + 1][2] : 30.3;
    A(on, [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }], at + (i === 0 ? .2 : 0), .45, "outExpo");
    A(on, [{ clipPath: "inset(0 0% 0 0)" }, { clipPath: "inset(0 0 0 100%)" }], next, .35, "inOut", { fill: "forwards" });
  });
  const caps = [
    ["01", "Drop your videos. Pick your platforms.", 16.15],
    ["02", "AI listens to each video and writes the metadata.", 19.65],
    ["03", "A smart scheduler picks real peak hours.", 23.15],
    ["04", "Autopilot posts — inside your daily caps.", 26.65],
  ];
  caps.forEach(([n, tx, at], i) => {
    const c = add(bar, `<div class="abs" style="left:60px;top:0;width:1800px;height:124px;display:flex;align-items:center;gap:36px"><span class="mono" style="font-size:78px;font-weight:700;color:var(--acid);letter-spacing:-.04em">${n}</span><span class="hh" style="font-size:54px;color:#fff;letter-spacing:-.03em;text-transform:none;font-weight:700;line-height:1">${tx}</span></div>`);
    const next = caps[i + 1] ? caps[i + 1][2] : 30.3;
    A(c, [{ transform: "translateY(100%)", opacity: 1 }, { transform: "translateY(0)", opacity: 1 }], at + (i === 0 ? .35 : .05), .6, "outExpo");
    A(c, [{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], next, .4, "in", { fill: "forwards" });
  });

  /* pipeline overlay (step 2) */
  const pip = add(s, `<div class="abs" style="left:1180px;top:122px;width:690px;z-index:20"></div>`);
  const blocks = [
    ["VIDEO", "cdl-2.mp4 · 0:42", "wave"],
    ["WHISPER · SPEECH → TEXT", "“…triangles go ten feet, one hundred, two hundred behind the truck…”", "text"],
    ["LLM · WRITES THE METADATA", "title · description · hashtags", "llm"],
  ];
  const nodes = blocks.map(([t1, t2, kind], i) => {
    const b = add(pip, `<div class="frame" style="height:128px;padding:16px 20px;margin-bottom:${i < 3 ? 46 : 0}px;box-shadow:8px 8px 0 var(--ink)">
      <div class="mono" style="font-size:13px;font-weight:700;letter-spacing:.12em;color:var(--muted)">${String(i + 1).padStart(2, "0")} · ${t1}</div>
      <div data-k style="margin-top:10px"></div></div>`);
    const k = $("[data-k]", b);
    if (kind === "wave") { k.innerHTML = `<div class="mono" style="font-size:15px;font-weight:600;margin-bottom:8px">${t2}</div><div data-bars style="display:flex;align-items:center;gap:4px;height:44px">${Array.from({ length: 52 }, () => '<i style="display:block;width:8px;background:var(--ink)"></i>').join("")}</div>`; const bars = $$("[data-bars] i", b); F((t) => bars.forEach((el, j) => { el.style.height = (8 + Math.abs(Math.sin(t * 7 + j * .7) * Math.cos(t * 3.1 + j * .31)) * 36) + "px"; el.style.background = j % 7 === Math.floor(t * 9) % 7 ? "var(--volt)" : "var(--ink)"; })); }
    if (kind === "text") { k.innerHTML = `<div class="mono" style="font-size:17px;font-weight:500;line-height:1.5;white-space:nowrap;overflow:hidden" data-tx></div>`; typeText($("[data-tx]", b), t2, 20.6, 46); }
    if (kind === "llm") { k.innerHTML = `<div style="display:flex;gap:10px;flex-wrap:wrap"><span class="chip" style="background:var(--volt);color:#fff;box-shadow:3px 3px 0 var(--ink)">TITLE</span><span class="chip" style="box-shadow:3px 3px 0 var(--ink)">DESCRIPTION</span><span class="chip" style="background:var(--acid);box-shadow:3px 3px 0 var(--ink)">#HASHTAGS</span></div>`; }
    A(b, [{ opacity: 0, transform: "translateX(80px)" }, { opacity: 1, transform: "none" }], 19.9 + i * .28, .7, "outExpo");
    A(b, [{ opacity: 1 }, { opacity: 0, transform: "translateX(60px)" }], 22.9, .4, "in", { fill: "forwards" });
    return b;
  });
  /* arrows with traveling pulse */
  [0, 1].forEach((i) => {
    const a = add(pip, `<div class="abs" style="left:330px;top:${128 + i * 174 + 4}px;width:6px;height:46px;background:var(--ink)"></div>`);
    const dot = add(pip, `<div class="abs" style="left:322px;top:${128 + i * 174 + 4}px;width:22px;height:22px;background:var(--acid);border:3px solid var(--ink)"></div>`);
    A(a, [{ transform: "scaleY(0)", transformOrigin: "top" }, { transform: "scaleY(1)", transformOrigin: "top" }], 20.2 + i * .28, .4, "outExpo");
    A(dot, [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(26px)", opacity: 1 }], 20.5 + i * .28, .45, "in", { iterations: 5 });
    A(a, [{ opacity: 1 }, { opacity: 0 }], 22.9, .3, "in", { fill: "forwards" });
    A(dot, [{ opacity: 1 }, { opacity: 0 }], 22.9, .3, "in", { fill: "forwards" });
  });
  vis(pip, [[19.6, 23.4]]);
  /* step 4: cron ring */
  const ring = add(s, `<div class="abs" style="left:1330px;top:190px;width:420px;height:560px;z-index:20"></div>`);
  ring.innerHTML = `<div class="frame" style="width:420px;height:420px;border-radius:0;position:relative;box-shadow:10px 10px 0 var(--ink)">
      <svg viewBox="0 0 400 400" width="414" height="414" style="position:absolute;left:0;top:0">
        ${Array.from({ length: 60 }, (_, k) => { const a = (k / 60) * Math.PI * 2; const r1 = k % 5 === 0 ? 150 : 164, r2 = 176; return `<line x1="${200 + Math.sin(a) * r1}" y1="${200 - Math.cos(a) * r1}" x2="${200 + Math.sin(a) * r2}" y2="${200 - Math.cos(a) * r2}" stroke="#0b0b0b" stroke-width="${k % 5 === 0 ? 5 : 2.5}"/>`; }).join("")}
        <g data-hand style="transform-origin:200px 200px"><line x1="200" y1="200" x2="200" y2="40" stroke="#1b4dff" stroke-width="8"/><rect x="190" y="30" width="20" height="20" fill="#ccff00" stroke="#0b0b0b" stroke-width="4"/></g>
        <circle cx="200" cy="200" r="14" fill="#0b0b0b"/></svg>
      <div class="abs mono" style="left:0;right:0;top:268px;text-align:center;font-weight:700;font-size:26px;letter-spacing:.1em">EVERY 5 MIN</div>
      <div class="abs mono" style="left:0;right:0;top:312px;text-align:center;font-weight:600;font-size:14px;letter-spacing:.14em;color:var(--muted)">APPWRITE FUNCTION · CRON</div></div>
    <div class="mono" style="margin-top:22px;font-size:17px;font-weight:700;line-height:1.7;letter-spacing:.04em;background:var(--ink);color:var(--paper);padding:10px 18px;box-shadow:6px 6px 0 var(--acid)"><div data-l1></div><div data-l2 style="color:var(--acid)"></div></div>`;
  const hand = $("[data-hand]", ring);
  F((t) => { hand.style.transform = `rotate(${clamp((t - 26.8) / 1.3) * 360 * 1 + (t > 28.1 ? 0 : 0)}deg)`; });
  typeText($("[data-l1]", ring), "▶ PUBLISH CYCLE · 3 DUE", 27.0, 40);
  typeText($("[data-l2]", ring), "✓ 3 PUBLISHED · CAP 3/5", 27.9, 40);
  A(ring, [{ opacity: 0, transform: "translateX(90px) rotate(3deg)" }, { opacity: 1, transform: "none" }], 26.8, .7, "outExpo");
  A(ring, [{ opacity: 1 }, { opacity: 0, transform: "translateX(70px)" }], 28.4, .4, "in", { fill: "forwards" });
  vis(ring, [[26.7, 28.9]]);

  /* ---- camera ---- */
  const rowsC = { x: qw.cx, y: qw.cy };
  const cam = [
    { t: 16.15, wx: fr.cx, wy: fr.cy, s: .72, ease: "inOut" },
    { t: 16.9, wx: up.cx, wy: up.y + 300, s: 1.14, sx: 600, ease: "inOut" },
    { t: 19.4, wx: up.cx, wy: up.y + 300, s: 1.18, sx: 604, ease: "inOut" },
    { t: 20.3, wx: up.cx, wy: rowsC.y - 30, s: 1.3, sx: 590, sy: 516, ease: "inOut" },
    { t: 23.0, wx: up.cx, wy: rowsC.y - 30, s: 1.34, sx: 590, ease: "inOut" },
    { t: 24.0, wx: sch.cx - 40, wy: sch.y + 330, s: 1.28, sx: 1180, rx: 0, ry: -4, ease: "inOut" },
    { t: 26.5, wx: sch.cx - 40, wy: sch.y + 330, s: 1.32, sx: 1210, ry: -4, ease: "inOut" },
    { t: 27.2, wx: up.cx, wy: rowsC.y - 30, s: 1.3, sx: 600, ry: 0, ease: "inOut" },
    { t: 28.35, wx: up.cx, wy: rowsC.y - 30, s: 1.32, sx: 600, ease: "inOut" },
    { t: 29.15, wx: acc.cx, wy: acc.cy, s: 1.34, sx: 960, ease: "inOut" },
    { t: 30.4, wx: acc.cx, wy: acc.cy + 40, s: 1.38, ease: "lin" },
    { t: 46.0, wx: acc.cx, wy: acc.cy + 40, s: 1.38, ease: "lin" },
    { t: 46.1, wx: acc.cx, wy: acc.cy + 40, s: 1.38, ease: "lin" },
    { t: 47.6, wx: fr.cx, wy: fr.cy, s: .86, sx: 960, sy: 540, rx: 5, ry: -9, ease: "inOutSoft" },
    { t: 52.1, wx: fr.cx + 40, wy: fr.cy, s: .92, sx: 960, sy: 540, rx: 3, ry: -4, ease: "lin" },
  ];
  makeCamera(D.world, D.tilt, cam);
  D.cam = cam;
}
