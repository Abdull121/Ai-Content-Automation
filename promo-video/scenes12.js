/* ===================== SCENE 1 — OPENING (0 → 8.15) ===================== */
function letters(host, text, { size, delay, step = .035, color = "var(--ink)", dur = .75 }) {
  const line = add(host, `<span class="mask" style="padding:.03em 0 .05em"><span class="hh" style="font-size:${size}px;color:${color};white-space:nowrap;display:block"></span></span>`);
  const inner = line.firstElementChild;
  [...text].forEach((ch, i) => {
    const s = add(inner, `<span class="ltr">${ch === " " ? "&nbsp;" : ch}</span>`);
    A(s, [{ transform: "translateY(118%) skewY(8deg)" }, { transform: "translateY(0) skewY(0)" }], delay + i * step, dur, "outExpo");
  });
  return line;
}

function build1() {
  const s = $("#s1");
  /* boot: ink halves + terminal text */
  const top = add(s, `<div class="abs" style="left:0;top:0;width:1920px;height:540px;background:var(--ink);z-index:20"></div>`);
  const bot = add(s, `<div class="abs" style="left:0;top:540px;width:1920px;height:540px;background:var(--ink);z-index:20"></div>`);
  const term = add(s, `<div class="abs mono" style="left:130px;top:470px;z-index:21;color:var(--paper);font-size:30px;font-weight:600;letter-spacing:.04em;line-height:1.7"><div><span style="color:var(--acid)">$</span> <span id="tl1"></span></div><div style="color:var(--acid)" id="tl2"></div></div>`);
  typeText($("#tl1"), "content_automation --autopilot", .1, 38, { caret: true });
  typeText($("#tl2"), "● AI · SCHEDULER · PUBLISHER ONLINE", .95, 60);
  A(top, [{ transform: "translateY(0)" }, { transform: "translateY(-101%)" }], 1.25, .75, "inOut");
  A(bot, [{ transform: "translateY(0)" }, { transform: "translateY(101%)" }], 1.25, .75, "inOut");
  A(term, [{ opacity: 1 }, { opacity: 0 }], 1.2, .25, "in");

  const g = add(s, `<div class="abs" style="left:0;top:0;width:1920px;height:1080px;transform-origin:50% 52%"></div>`);
  A(g, [{ transform: "scale(1)" }, { transform: "scale(1.07)" }], 1.4, 6.6, "lin");

  /* corner registration crosses */
  [[64, 64], [1834, 64], [64, 994], [1834, 994]].forEach(([x, y], i) => {
    const c = add(g, `<div class="cross" style="left:${x}px;top:${y}px"></div>`);
    A(c, [{ transform: "scale(0) rotate(90deg)", opacity: 0 }, { transform: "scale(1) rotate(0)", opacity: 1 }], 1.7 + i * .08, .6, "outBack");
  });

  /* logo mark */
  const wrap = add(g, `<div class="abs" style="left:220px;top:370px;width:220px;height:220px"></div>`);
  const mark = add(wrap, `<div style="width:220px;height:220px;background:var(--ink);box-shadow:14px 14px 0 var(--acid);display:flex;align-items:center;justify-content:center;position:relative">
     <svg viewBox="0 0 24 24" width="108" height="108"><path d="M7 4.5L19 12L7 19.5Z" fill="#ccff00"/></svg>
     <div class="abs" style="left:14px;top:12px;font:700 15px var(--mono);color:var(--paper);letter-spacing:.14em">CA</div></div>`);
  A(mark, [
    { transform: "translate(630px,70px) scale(0) rotate(-90deg)", easing: css("outBack") },
    { transform: "translate(630px,70px) scale(1.15) rotate(0deg)", offset: .3, easing: css("inOut") },
    { transform: "translate(630px,70px) scale(1) rotate(0deg)", offset: .42, easing: css("inOut") },
    { transform: "translate(630px,70px) scale(1) rotate(0deg)", offset: .46, easing: css("outExpo") },
    { transform: "translate(0,0) scale(1) rotate(0deg)" },
  ], 1.5, 1.9, "lin");
  /* shock rings from the mark on landing */
  for (let i = 0; i < 2; i++) {
    const ring = add(g, `<div class="abs" style="left:${220 + 110 - 110}px;top:${370}px;width:220px;height:220px;border:3px solid var(--ink)"></div>`);
    A(ring, [{ transform: "scale(1)", opacity: .6 }, { transform: "scale(2.6)", opacity: 0 }], 3.15 + i * .12, .9, "outExpo");
  }

  /* headline */
  const head = add(g, `<div class="abs" style="left:520px;top:326px;width:1200px"></div>`);
  const hl1 = letters(head, "CONTENT", { size: 172, delay: 2.35 });
  const l2wrap = add(head, `<div style="position:relative"></div>`);
  const bar = add(l2wrap, `<div class="abs" style="left:-8px;bottom:12px;height:70px;width:1140px;background:var(--acid);transform-origin:left"></div>`);
  A(bar, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], 3.35, .7, "outExpo");
  letters(l2wrap, "AUTOMATION", { size: 172, delay: 2.6 });
  const rule = add(g, `<div class="abs" style="left:520px;top:662px;width:1090px;height:4px;background:var(--ink);transform-origin:left"></div>`);
  A(rule, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], 3.5, .8, "outExpo");
  const tag = add(g, `<div class="abs mono" style="left:520px;top:690px;font-size:25px;font-weight:700;letter-spacing:.09em;color:var(--ink)" id="tg"></div>`);
  typeText(tag, "BULK UPLOAD  ·  AI METADATA  ·  PEAK-HOUR POSTING", 3.9, 46);
  const chip = add(g, `<div class="chip abs" style="left:520px;top:266px;background:var(--acid)"><span style="width:10px;height:10px;background:var(--ink);display:block"></span>AUTOPILOT FOR SHORT-FORM VIDEO</div>`);
  IN(chip, 2.1, { from: { transform: "translateX(-40px)" }, dur: .7 });

  /* floating platform tiles */
  [["yt", 1585, 118, 4.35, -8], ["ig", 1735, 214, 4.5, 6], ["tt", 1630, 330, 4.65, -4]].forEach(([k, x, y, at, rot], i) => {
    const w = add(g, `<div class="abs" style="left:${x}px;top:${y}px"></div>`);
    const b = add(w, `<div style="width:96px;height:96px;border:4px solid var(--ink);background:var(--${k});color:${k === "ig" ? "#fff" : "#0b0b0b"};box-shadow:8px 8px 0 var(--ink);display:flex;align-items:center;justify-content:center">${GLYPH[k].replace(/width="16" height="16"/, 'width="48" height="48"')}</div>`);
    A(b, [{ transform: `scale(0) rotate(${rot * 6}deg)` }, { transform: `scale(1) rotate(${rot}deg)` }], at, .7, "outBack");
    F((t) => { w.style.transform = `translateY(${Math.sin(t * 1.9 + i * 1.7) * 7}px)`; });
  });

  /* ticker */
  const tk = add(g, `<div class="abs" style="left:-3px;top:930px;width:1926px"><div class="ticker"><div class="tr" id="tk1"></div></div></div>`);
  const unit = ["YOUTUBE 0/5", "INSTAGRAM 3/5", "TIKTOK OFFLINE", "AI METADATA", "PEAK-HOUR SCHEDULING", "AUTO-PUBLISH"].map((x) => `<span>● ${x}</span>`).join("");
  $("#tk1").innerHTML = unit.repeat(4);
  IN(tk, 4.2, { from: { transform: "translateY(90px)" }, dur: .8 });
  const tkEl = $("#tk1"); const tw = () => tkEl.scrollWidth / 4;
  F((t) => { tkEl.style.transform = `translateX(${-((t * 150) % (tw() || 1))}px)`; });
}

/* ===================== SCENE 2 — WHAT IS IT / THE PROBLEM (8.15 → 16.15) ===================== */
function build2() {
  const s = $("#s2");
  const r = rng(7);
  const tk0 = 8.35;
  /* eyebrow */
  const eye = add(s, `<div class="chip abs" style="left:100px;top:84px;background:#fff">WHAT IS IT?</div>`);
  IN(eye, tk0, { from: { transform: "translateY(-24px)" }, dur: .6 });

  /* chaos cards (behind) */
  const names = ["IMG_4021.mp4", "cdl-1.mp4", "draft_final_v3.mp4", "cdl-2.mp4", "clip-0087.mp4", "cdl-3.mp4", "reel_new.mp4", "cdl-4.mp4", "export (2).mp4", "cdl-5.mp4", "test.mp4", "b-roll-12.mp4", "intro.mp4", "final_FINAL.mp4", "short-19.mp4", "cut-03.mp4", "ep12.mp4", "promo.mp4"];
  const cards = names.map((n, i) => {
    const el = add(s, `<div class="filecard" style="z-index:${2 + (i % 3)}"><span class="ic">${ICON.play.replace('width="20" height="20"', 'width="18" height="18"')}</span><span>${n}<small>${(r() * 40 + 3).toFixed(1)} MB · 0:${String(Math.floor(r() * 50 + 8)).padStart(2, "0")}</small></span></div>`);
    const bx = 760 + r() * 1020, by = 130 + r() * 780, rot = (r() - .5) * 34, vx = (r() - .5) * 60, vy = (r() - .5) * 50;
    return { el, bx, by, rot, vx, vy, at: tk0 + .15 + i * .11, dl: 12.55 + i * .028 };
  });
  /* question annotations */
  const qs = ["#TAGS?", "TITLE?", "WHEN TO POST?", "TIMEZONE?", "DAILY LIMIT?", "DESCRIPTION?", "PEAK HOURS?"];
  const qEls = qs.map((q, i) => {
    const el = add(s, `<div class="chip" style="position:absolute;z-index:6;background:var(--amber)">${q}</div>`);
    const bx = 700 + r() * 1000, by = 110 + r() * 800, rot = (r() - .5) * 20;
    return { el, bx, by, rot, at: tk0 + 1.0 + i * .26 };
  });
  const dropC = { x: 1350, y: 470 };
  F((t) => {
    for (const c of cards) {
      const p = prog(t, c.at, .55, "outBack");
      const dft = clamp(t - c.at, 0, 4.4);
      let x = c.bx + c.vx * dft, y = c.by + c.vy * dft + Math.sin(t * 1.6 + c.bx) * 6, rot = c.rot + dft * c.vx * .08, sc = p;
      const q = prog(t, c.dl, .75, "inOut");
      x = lerp(x, dropC.x - 125, q); y = lerp(y, dropC.y - 37, q); rot = lerp(rot, 0, q); sc = sc * lerp(1, .15, q);
      c.el.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg) scale(${sc})`;
      c.el.style.opacity = t < c.at ? 0 : t > c.dl + .75 ? 0 : 1;
    }
    for (const c of qEls) {
      const p = prog(t, c.at, .5, "outBack"), q = prog(t, 12.35, .5, "in");
      c.el.style.transform = `translate(${c.bx + Math.sin(t * 1.3 + c.bx) * 10}px,${c.by + Math.cos(t * 1.1 + c.by) * 8}px) rotate(${c.rot}deg) scale(${p * (1 - q)})`;
      c.el.style.opacity = t < c.at || q >= 1 ? 0 : 1;
    }
  });

  /* problem statements */
  const stmts = [["50 VIDEOS.", 8.55], ["3 PLATFORMS.", 9.15], ["ZERO SPARE TIME.", 9.75]];
  const col = add(s, `<div class="abs" style="left:96px;top:190px;z-index:8;display:flex;flex-direction:column;gap:10px"></div>`);
  const stEls = stmts.map(([tx, at], i) => {
    const m = add(col, `<span class="mask" style="padding:.04em 0"><span class="hh" style="display:block;font-size:${i === 2 ? 108 : 138}px;white-space:nowrap;${i === 2 ? "background:var(--paper);padding-right:20px" : ""}">${tx}</span></span>`);
    A(m.firstElementChild, [{ transform: "translateY(110%)" }, { transform: "translateX(0) translateY(0)" }], at, .8, "outExpo");
    return m;
  });
  stEls.forEach((m, i) => A(m, [{ transform: "translateX(0)" }, { transform: "translateX(-110%)" }], 12.3 + i * .08, .55, "inOut", { fill: "forwards" }));
  const strike = add(s, `<div class="abs" style="left:96px;top:372px;width:0;height:12px;background:var(--amber);z-index:9;transform-origin:left"></div>`);
  A(strike, [{ width: "0px" }, { width: "980px" }], 10.7, .5, "outExpo");
  A(strike, [{ opacity: 1 }, { opacity: 0 }], 12.3, .3, "in", { fill: "forwards" });

  /* dropzone absorber */
  const dz = add(s, `<div class="abs" style="left:${dropC.x - 230}px;top:${dropC.y - 150}px;width:460px;height:300px;z-index:5;border:5px dashed var(--ink);background:#fff;box-shadow:10px 10px 0 var(--ink);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px">
     <div class="abs" id="dzon" style="inset:-5px;border:5px solid var(--volt);background:#e8edff;opacity:0"></div>
     <div style="position:relative">${ICON.upload.replace('width="32" height="32"', 'width="56" height="56"')}</div>
     <div class="mono" style="position:relative;font-size:64px;font-weight:700;line-height:1"><span id="dzn">0</span><span style="font-size:24px;color:var(--muted)"> FILES</span></div>
     <div class="mono" style="position:relative;font-size:14px;letter-spacing:.12em;font-weight:600;color:var(--muted)">DROP THEM ALL AT ONCE</div></div>`);
  A(dz, [{ transform: "scale(0) rotate(-6deg)", opacity: 0 }, { transform: "scale(1) rotate(0)", opacity: 1 }], 12.2, .7, "outBack");
  A($("#dzon"), [{ opacity: 0 }, { opacity: 1 }], 12.75, .35, "outExpo");
  A(dz, [{ transform: "scale(1)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }], 13.25, .45, "outBack", { fill: "forwards" });
  countTo($("#dzn"), 0, 50, 12.75, .75, (v) => String(Math.round(v)), "outQuart");

  /* ONE DROP headline */
  const od = add(s, `<div class="abs" style="left:96px;top:176px;z-index:8"></div>`);
  const odl = letters(od, "ONE DROP.", { size: 190, delay: 13.15, step: .04 });
  const odbar = add(od, `<div class="abs" style="left:-6px;top:112px;width:0;height:78px;background:var(--acid);z-index:-1"></div>`);
  A(odbar, [{ width: "0px" }, { width: "880px" }], 13.7, .6, "outExpo");
  const sub = add(s, `<div class="abs mono" style="left:100px;top:420px;font-size:27px;font-weight:700;letter-spacing:.07em;z-index:8;line-height:1.5" id="sub2"></div>`);
  typeText(sub, "EVERYTHING ELSE RUNS ON AUTOPILOT.", 14.05, 42);

  /* three-step result cards */
  const cardsDef = [
    ["01", "AI WRITES THE METADATA", "Title · description · hashtags from the video's own audio", 14.45],
    ["02", "SCHEDULER PICKS PEAK HOURS", "Spread across the day, inside your posting window", 14.8],
    ["03", "AUTOPILOT PUBLISHES", "YouTube + Instagram, under each platform's daily cap", 15.15],
  ];
  const row = add(s, `<div class="abs" style="left:70px;top:760px;width:1780px;display:flex;gap:60px;z-index:8"></div>`);
  cardsDef.forEach(([n, t1, t2, at], i) => {
    const c = add(row, `<div class="frame" style="width:540px;height:190px;padding:18px 22px;box-shadow:8px 8px 0 var(--ink)">
      <div style="display:flex;align-items:center;gap:12px"><span class="mono" style="background:var(--ink);color:var(--acid);font-weight:700;font-size:20px;padding:4px 10px">${n}</span><span class="mono" style="font-weight:700;font-size:20px;letter-spacing:.05em">${t1}</span></div>
      <div class="hint" style="margin-top:12px;font-size:17px">${t2}</div>
      <div style="position:absolute;left:22px;right:22px;bottom:18px" data-mini="${i}"></div></div>`);
    IN(c, at, { from: { transform: "translateY(70px) rotate(2deg)" }, dur: .75, ease: "outBack" });
    const mini = $(`[data-mini="${i}"]`, c);
    if (i === 0) { add(mini, `<div class="mono" style="font-size:14px;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden" data-t></div>`); typeText($("[data-t]", mini), "Air Brake Quiz: 3 PSI vs 4 PSI – Pass the Test!", at + .25, 40, { caret: true }); }
    if (i === 1) { mini.innerHTML = `<div class="hour" style="height:24px">${Array.from({ length: 24 }, () => '<i style="height:20px"><b></b></i>').join("")}</div>`; $$("b", mini).forEach((b, k) => { if (k >= 8 && k < 21) A(b, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], at + .3 + (k - 8) * .03, .3, "outQuart"); }); }
    if (i === 2) { mini.innerHTML = `<div style="display:flex;gap:8px;align-items:center"><span class="tag yt">YT</span><span class="tag ig">IG</span><span style="margin-left:auto">${BADGE.pub}</span></div>`; }
    if (i < 2) {
      const ar = add(s, `<div class="abs mono" style="left:${70 + 540 + 60 * i + 540 * i + 10}px;top:830px;font-size:44px;font-weight:700;z-index:9">→</div>`);
      IN(ar, at + .25, { from: { transform: "translateX(-20px)" }, dur: .5 });
    }
  });
}
