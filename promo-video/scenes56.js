/* ===================== SCENE 5 — COMPLETE EXPERIENCE (46.0 → 52.15) ===================== */
function build5() {
  const s = $("#s5");
  const top = add(s, `<div class="abs" style="left:0;top:0;width:1920px;height:84px;background:var(--ink);z-index:30;overflow:hidden"></div>`);
  A(top, [{ transform: "translateY(-100%)" }, { transform: "translateY(0)" }], 46.7, .6, "outExpo");
  add(top, `<div class="abs mono" style="left:40px;top:28px;font-size:16px;font-weight:700;letter-spacing:.14em;color:var(--paper)">THE COMPLETE EXPERIENCE <span style="color:var(--acid)">//</span> DROP ONCE</div>`);
  const tl = add(top, `<div class="abs hh" style="right:40px;top:14px;font-size:50px;color:var(--acid);letter-spacing:-.03em;white-space:nowrap">EVERYTHING ELSE RUNS ITSELF.</div>`);
  A(tl, [{ transform: "translateX(60px)", opacity: 0 }, { transform: "none", opacity: 1 }], 47.0, .7, "outExpo");

  const card = (x, label, big, sub, at, bg, rot) => {
    const c = add(s, `<div class="frame abs" style="left:${x}px;top:330px;width:360px;height:250px;z-index:25;padding:20px 24px;box-shadow:10px 10px 0 var(--ink);background:${bg}"><div class="lbl">${label}</div><div class="mono" data-v style="font-size:128px;font-weight:700;letter-spacing:-.06em;line-height:1;margin-top:10px">${big}</div><div class="mono" style="font-size:14px;font-weight:600;letter-spacing:.08em;margin-top:6px">${sub}</div></div>`);
    A(c, [{ opacity: 0, transform: `translateY(60px) rotate(${rot * 3}deg)` }, { opacity: 1, transform: `rotate(${rot}deg)` }], at, .7, "outBack");
    return c;
  };
  card(60, "UPLOADED", "05", "ONE DROP · 2 PLATFORMS", 47.0, "#fff", -2);
  const pc = card(1500, "PUBLISHED", "03", "ON THEIR PEAK HOURS", 47.15, "var(--acid)", 2);
  F((t) => { const n = PUB_TIMES.filter((x) => t >= x).length; $("[data-v]", pc).textContent = String(n).padStart(2, "0"); });

  const stamp = add(s, `<div class="abs" style="left:0;top:0;width:1920px;height:1080px;z-index:35"></div>`);
  const st = add(stamp, `<div class="abs hh" style="left:430px;top:792px;padding:14px 38px 8px;background:var(--ink);color:var(--acid);font-size:84px;border:5px solid var(--acid);box-shadow:12px 12px 0 var(--volt);white-space:nowrap">ZERO MANUAL STEPS.</div>`);
  A(st, [{ opacity: 0, transform: "scale(2.6) rotate(-10deg)" }, { opacity: 1, transform: "scale(1) rotate(-2.4deg)" }], 49.3, .35, "outBack2");
  const shock = add(stamp, `<div class="abs" style="left:430px;top:792px;width:1060px;height:118px;border:4px solid var(--acid)"></div>`);
  A(shock, [{ opacity: .9, transform: "scale(1)" }, { opacity: 0, transform: "scale(1.3)" }], 49.6, .5, "outExpo");

  const tk = add(s, `<div class="abs" style="left:-3px;top:978px;width:1926px;z-index:30"><div class="ticker"><div class="tr" id="tk5"></div></div></div>`);
  $("#tk5").innerHTML = ["UPLOAD", "AI METADATA", "PEAK-HOUR SCHEDULE", "DAILY CAPS", "AUTO-PUBLISH", "STORAGE CLEANUP"].map((x) => `<span>● ${x}</span>`).join("").repeat(4);
  A(tk, [{ transform: "translateY(160px)" }, { transform: "none" }], 47.3, .7, "outExpo");
  const tke = $("#tk5"); F((t) => { tke.style.transform = `translateX(${-((t * 170) % ((tke.scrollWidth / 4) || 1))}px)`; });
}

/* ===================== SCENE 6 — ENDING (52.15 → 58) ===================== */
function build6() {
  const s = $("#s6");
  const bg = add(s, `<div class="abs" style="inset:0;background:var(--ink)"></div>`);
  const grid = add(s, `<div class="abs" style="inset:-60px;background-image:radial-gradient(rgba(204,255,0,.2) 2px,transparent 2.5px);background-size:48px 48px"></div>`);
  F((t) => { grid.style.backgroundPosition = `${-t * 14}px ${-t * 8}px`; });
  [[64, 64], [1834, 64], [64, 994], [1834, 994]].forEach(([x, y], i) => {
    const c = add(s, `<div class="abs" style="left:${x}px;top:${y}px;width:22px;height:22px"><div class="abs" style="left:9px;top:0;width:4px;height:22px;background:var(--paper)"></div><div class="abs" style="left:0;top:9px;width:22px;height:4px;background:var(--paper)"></div></div>`);
    A(c, [{ transform: "scale(0) rotate(90deg)" }, { transform: "scale(1) rotate(0)" }], 52.6 + i * .08, .6, "outBack");
  });
  const g = add(s, `<div class="abs" style="left:0;top:0;width:1920px;height:1080px;transform-origin:50% 50%"></div>`);
  A(g, [{ transform: "scale(1)" }, { transform: "scale(1.04)" }], 52.4, 5.6, "lin");

  /* logo mark returns */
  const mk = add(g, `<div class="abs" style="left:850px;top:96px;width:220px;height:220px"></div>`);
  const mark = add(mk, `<div style="width:220px;height:220px;background:var(--acid);box-shadow:14px 14px 0 var(--paper);display:flex;align-items:center;justify-content:center;position:relative">
     <svg viewBox="0 0 24 24" width="108" height="108"><path d="M7 4.5L19 12L7 19.5Z" fill="#0b0b0b"/></svg>
     <div class="abs" style="left:14px;top:12px;font:700 15px var(--mono);color:var(--ink);letter-spacing:.14em">CA</div></div>`);
  A(mark, [
    { transform: "translate(900px,-120px) scale(0) rotate(120deg)", easing: css("outBack") },
    { transform: "translate(0,0) scale(1.2) rotate(0deg)", offset: .5, easing: css("inOut") },
    { transform: "translate(0,0) scale(1) rotate(0deg)" },
  ], 52.35, 1.0, "lin");
  for (let i = 0; i < 2; i++) {
    const r = add(g, `<div class="abs" style="left:850px;top:96px;width:220px;height:220px;border:3px solid var(--acid)"></div>`);
    A(r, [{ transform: "scale(1)", opacity: .7 }, { transform: "scale(3)", opacity: 0 }], 53.05 + i * .14, 1.0, "outExpo");
  }
  /* confetti burst */
  const R = rng(7), conf = [];
  for (let i = 0; i < 44; i++) {
    const a = R() * Math.PI * 2, v = 380 + R() * 760, sz = 8 + R() * 16;
    const e = add(g, `<div class="abs" style="left:0;top:0;width:${sz}px;height:${sz}px;background:${["#ccff00", "#efeae0", "#1b4dff", "#ff9500"][i % 4]};opacity:0"></div>`);
    conf.push({ e, a, v, r0: R() * 360, rs: (R() - .5) * 720 });
  }
  F((t) => { const k = t - 53.05; conf.forEach((c) => { if (k < 0 || k > 1.7) { c.e.style.opacity = 0; return; } const d = 1 - Math.pow(1 - clamp(k / 1.4), 3); c.e.style.opacity = 1 - clamp((k - .9) / .8); c.e.style.transform = `translate(${960 + Math.cos(c.a) * c.v * d * .9}px,${206 + Math.sin(c.a) * c.v * d * .7 + 260 * k * k}px) rotate(${c.r0 + c.rs * k}deg)`; }); });

  /* wordmark */
  const head = add(g, `<div class="abs" style="left:0;top:372px;width:1920px;text-align:center"></div>`);
  letters(head, "CONTENT", { size: 168, delay: 53.0, color: "var(--paper)" });
  const w2 = add(head, `<div style="position:relative;margin-top:-4px"></div>`);
  const bar = add(w2, `<div class="abs" style="left:268px;top:0;bottom:0;width:1384px;background:var(--acid);transform-origin:left"></div>`);
  A(bar, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], 53.55, .7, "outExpo");
  letters(w2, "AUTOMATION", { size: 168, delay: 53.2, color: "var(--ink)" });
  const tg = add(g, `<div class="abs mono" style="left:0;top:742px;width:1920px;text-align:center;font-size:30px;font-weight:700;letter-spacing:.1em;color:var(--paper)"></div>`);
  typeText(tg, "ONE DROP. EVERY PLATFORM. ON AUTOPILOT.", 54.1, 40);
  const row = add(g, `<div class="abs" style="left:0;top:818px;width:1920px;display:flex;justify-content:center;gap:22px"></div>`);
  [["yt", "YOUTUBE"], ["ig", "INSTAGRAM"], ["tt", "TIKTOK · SOON"]].forEach(([k, n], i) => {
    const c = add(row, `<span class="chip" style="box-shadow:5px 5px 0 var(--acid);font-size:17px;padding:10px 18px"><span class="plate" style="background:var(--${k});color:${k === "ig" ? "#fff" : "#0b0b0b"}">${GLYPH[k]}</span>${n}</span>`);
    A(c, [{ opacity: 0, transform: "translateY(30px) scale(.8)" }, { opacity: 1, transform: "none" }], 54.8 + i * .12, .5, "outBack");
  });
  const tk = add(g, `<div class="abs" style="left:-3px;top:930px;width:1926px"><div class="ticker"><div class="tr" id="tk6"></div></div></div>`);
  $("#tk6").innerHTML = ["BULK UPLOAD", "AI METADATA", "PEAK-HOUR POSTING", "DAILY CAPS", "ALWAYS ON"].map((x) => `<span>● ${x}</span>`).join("").repeat(4);
  A(tk, [{ transform: "translateY(160px)" }, { transform: "none" }], 54.6, .7, "outExpo");
  const t6 = $("#tk6"); F((t) => { t6.style.transform = `translateX(${-((t * 130) % ((t6.scrollWidth / 4) || 1))}px)`; });
}

/* ===================== WIRING ===================== */
function buildAll() {
  /* opaque grounds so nothing from the dashboard layer (which owns its own visibility windows) bleeds through */
  const s4 = $("#s4");
  add(s4, `<div class="abs" style="inset:0;background:var(--paper)"></div>`);
  const dots = add(s4, `<div class="abs" style="inset:-60px;background-image:radial-gradient(rgba(11,11,11,.2) 2px,transparent 2.5px);background-size:48px 48px"></div>`);
  F((t) => { dots.style.backgroundPosition = `${-t * 22}px ${-t * 11}px`; });

  build1(); build2(); buildDashLayer(); build4(); build5(); build6();
  buildTransitions();
}
