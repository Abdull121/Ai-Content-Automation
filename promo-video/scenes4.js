/* ===================== SCENE 4 — KEY FEATURES (30.15 → 46.0) ===================== */
function featureShell(host, t0, { n, accent, accentInk = "var(--ink)", l1, l2, desc, tag }) {
  const root = add(host, `<div class="scene"></div>`);
  FEAT.push(root);
  const b = t0 + .12;
  /* big numeral square */
  const sq = add(root, `<div class="abs" style="left:100px;top:130px;width:150px;height:150px;background:${accent};color:${accentInk};border:5px solid var(--ink);box-shadow:10px 10px 0 var(--ink);display:flex;align-items:center;justify-content:center;font:700 82px var(--mono);letter-spacing:-.05em">${n}</div>`);
  A(sq, [{ transform: "scale(0) rotate(-40deg)" }, { transform: "scale(1) rotate(0)" }], b, .65, "outBack");
  const tg = add(root, `<div class="chip abs" style="left:286px;top:172px">${tag}</div>`);
  IN(tg, b + .12, { from: { transform: "translateX(-30px)" }, dur: .5 });
  /* title */
  const ttl = add(root, `<div class="abs" style="left:96px;top:320px;display:flex;flex-direction:column;gap:2px"></div>`);
  [l1, l2].forEach((tx, i) => {
    const m = add(ttl, `<span class="mask" style="padding:.04em 0"><span class="hh" style="display:block;font-size:84px;white-space:nowrap">${tx}</span></span>`);
    A(m.firstElementChild, [{ transform: "translateY(112%)" }, { transform: "translateY(0)" }], b + .1 + i * .09, .7, "outExpo");
  });
  const hl = add(root, `<div class="abs" style="left:92px;top:530px;height:8px;width:0;background:var(--ink)"></div>`);
  A(hl, [{ width: "0px" }, { width: "560px" }], b + .4, .6, "outExpo");
  const ds = add(root, `<div class="abs mono" style="left:100px;top:566px;width:720px;font-size:23px;line-height:1.5;font-weight:500;color:var(--muted)"></div>`);
  typeText(ds, desc, b + .45, 85);
  /* stage frame */
  const st = add(root, `<div class="frame abs" style="left:900px;top:110px;width:920px;height:760px;box-shadow:12px 12px 0 var(--ink)"><div class="band" style="height:44px"><h2>Feature ${n}</h2><span class="meta">${tag}</span></div><div data-c style="position:relative;height:710px;overflow:hidden"></div></div>`);
  A(st, [{ opacity: 0, transform: "translateX(120px) rotate(1.5deg)" }, { opacity: 1, transform: "none" }], b, .8, "outExpo");
  return { root, c: $("[data-c]", st), b };
}

function build4() {
  const s = $("#s4");
  /* section banner */
  const ban = add(s, `<div class="scene"></div>`);
  BANNER = ban;
  vis(ban, [[29.75, 31.05]]);
  const bl = add(ban, `<div class="abs" style="left:0;top:330px;width:1920px;text-align:center"></div>`);
  const l = letters(bl, "KEY FEATURES", { size: 200, delay: 30.2, step: .028, dur: .6 });
  l.style.display = "block";
  const ub = add(ban, `<div class="abs" data-ub style="left:240px;top:600px;width:0;height:30px;background:var(--acid)"></div>`);
  A(ub, [{ width: "0px" }, { width: "1440px" }], 30.35, .5, "outExpo");

  /* ---------- F1 · AI METADATA ---------- */
  {
    const { c, b } = featureShell(s, 31.0, { n: "01", accent: "var(--acid)", l1: "AI WRITES", l2: "THE METADATA", tag: "WHISPER + LLM", desc: "Whisper transcribes the audio. An LLM turns it into a title, description and hashtags." });
    const wave = add(c, `<div class="abs" style="left:30px;top:26px;width:860px;height:100px;background:var(--ink);display:flex;align-items:center;gap:9px;padding:0 22px"><span class="mono" style="color:var(--paper);font-weight:700;font-size:15px;width:120px;letter-spacing:.06em">cdl-2.mp4</span><div data-w style="flex:1;display:flex;align-items:center;gap:5px;height:80px">${Array.from({ length: 50 }, () => '<i style="display:block;width:8px;background:var(--acid)"></i>').join("")}</div></div>`);
    IN(wave, b + .1, { from: { transform: "translateY(-30px)" }, dur: .6 });
    const bars = $$("[data-w] i", wave);
    F((t) => bars.forEach((e, j) => { e.style.height = (10 + Math.abs(Math.sin(t * 8 + j * .6) * Math.cos(t * 2.7 + j * .27)) * 60) + "px"; }));
    const tr = add(c, `<div class="abs mono" style="left:30px;top:150px;width:860px;font-size:19px;font-weight:600;color:var(--muted);height:52px;line-height:1.35" data-tr></div>`);
    typeText($("[data-tr]", c), "“…triangles go ten feet, one hundred feet, two hundred feet behind the truck…”", b + .3, 80);
    const llm = add(c, `<div class="chip abs" style="left:30px;top:226px;background:var(--volt);color:#fff">LLM ▸ GENERATING</div>`);
    IN(llm, b + .75, { from: { transform: "scale(.7)" }, dur: .5, ease: "outBack" });
    const card = add(c, `<div class="frame abs" style="left:30px;top:290px;width:860px;height:350px;padding:22px 26px;box-shadow:8px 8px 0 var(--ink)">
        <div class="lbl" style="color:var(--muted)">TITLE</div><div style="font:700 29px/1.2 var(--sans);margin-top:6px;height:72px" data-t1></div>
        <div class="lbl" style="color:var(--muted);margin-top:12px">DESCRIPTION</div><div style="font:450 19px/1.45 var(--sans);margin-top:4px;height:56px" data-t2></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px" data-hs></div></div>`);
    IN(card, b + .85, { from: { transform: "translateY(40px)" }, dur: .6 });
    typeText($("[data-t1]", card), "Triangle Placement: 10-ft, 100-ft, 200-ft in 3 Seconds!", b + 1.0, 70);
    typeText($("[data-t2]", card), "The exact distances for placing three safety triangles — nail this and pass the CDL test. #CDL #RoadSafety", b + 1.5, 100);
    ["#CDL", "#RoadSafety", "#TruckDriving", "#SafetyTips", "#CDLPrep", "#DrivingTest"].forEach((x, k) => {
      const ch = add($("[data-hs]", card), `<span class="chip" style="background:${k % 2 ? "#fff" : "var(--acid)"};font-size:15px;box-shadow:3px 3px 0 var(--ink)">${x}</span>`);
      A(ch, [{ opacity: 0, transform: "scale(.4) translateY(14px)" }, { opacity: 1, transform: "none" }], b + 1.9 + k * .09, .35, "outBack");
    });
  }

  /* ---------- F2 · PEAK-HOUR SCHEDULING ---------- */
  {
    const { c, b } = featureShell(s, 33.72, { n: "02", accent: "var(--volt)", accentInk: "#fff", l1: "PEAK-HOUR", l2: "SCHEDULING", tag: "TIMEZONE-AWARE", desc: "Pick a timezone. Posts land on real engagement peaks, with natural jitter — never all at once." });
    const clocks = add(c, `<div class="abs" style="left:30px;top:26px;width:860px;display:flex;gap:30px"></div>`);
    const mk = (lb, big, ac) => add(clocks, `<div class="frame" style="flex:1;height:176px;padding:16px 22px;box-shadow:6px 6px 0 var(--ink);background:${ac ? "var(--acid)" : "#fff"}"><div class="lbl">${lb}</div><div class="mono" style="font-size:78px;font-weight:700;letter-spacing:-.04em;margin-top:10px;line-height:1" data-tm>${big}</div></div>`);
    const c1 = mk("NEW YORK · TARGET AUDIENCE", "5:41 PM", true), c2 = mk("KARACHI · YOU, ASLEEP", "2:41 AM", false);
    [c1, c2].forEach((e, i) => A(e, [{ opacity: 0, transform: "translateY(-40px) rotate(-2deg)" }, { opacity: 1, transform: "none" }], b + .1 + i * .12, .6, "outBack"));
    F((t) => { const k = clamp((t - b - .5) * 3, 0, 1); const m = Math.floor(lerp(5, 41, k)); $("[data-tm]", c1).textContent = `5:${String(m).padStart(2, "0")} PM`; $("[data-tm]", c2).textContent = `2:${String(m).padStart(2, "0")} AM`; });
    const strip = add(c, `<div class="abs" style="left:30px;top:290px;width:860px"><div class="hour" style="grid-template-columns:repeat(24,1fr)">${Array.from({ length: 24 }, () => '<i style="height:96px"><b></b></i>').join("")}</div><div class="abs" data-pk style="left:0;right:0;top:-64px"></div>
      <div style="display:flex;justify-content:space-between;font:600 15px var(--mono);margin-top:8px"><span>12A</span><span>6A</span><span>12P</span><span>6P</span><span>12A</span></div></div>`);
    $$("b", strip).forEach((e, k) => { if (k >= 8 && k < 21) A(e, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], b + .55 + (k - 8) * .04, .3, "outQuart"); });
    [[8, "8A"], [11, "11A"], [14, "2P"], [17, "5P"], [20, "8P"]].forEach(([hr, lb], k) => {
      const m = add($("[data-pk]", strip), `<div class="abs" style="left:${(hr + .5) / 24 * 100}%;top:0;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center"><div class="chip" style="background:var(--volt);color:#fff;padding:3px 9px;font-size:14px;box-shadow:3px 3px 0 var(--ink)">${lb}</div><div style="width:6px;height:46px;background:var(--volt)"></div></div>`);
      A(m, [{ opacity: 0, transform: "translateX(-50%) translateY(-50px)" }, { opacity: 1, transform: "translateX(-50%)" }], b + 1.15 + k * .13, .5, "outBack");
    });
    const note = add(c, `<div class="abs mono" style="left:30px;top:520px;width:860px;font-size:21px;font-weight:700;line-height:1.55;letter-spacing:.03em"></div>`);
    typeText(note, "POST AT THEIR PEAK — FROM ANYWHERE.", b + 1.5, 36);
    const jit = add(c, `<div class="abs" style="left:30px;top:590px;display:flex;gap:12px"></div>`);
    ["±15 MIN JITTER", "WITHIN YOUR WINDOW", "SPREAD, NOT BURSTS"].forEach((x, k) => { const ch = add(jit, `<span class="chip" style="font-size:14px">${x}</span>`); A(ch, [{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }], b + 1.8 + k * .12, .4, "outBack"); });
  }

  /* ---------- F3 · SAFE DAILY LIMITS ---------- */
  {
    const { c, b } = featureShell(s, 37.0, { n: "03", accent: "var(--amber)", l1: "SAFE DAILY", l2: "LIMITS", tag: "PER-PLATFORM CAPS", desc: "Caps spread your posts and keep accounts healthy. Overflow rolls to tomorrow automatically." });
    const cnt = add(c, `<div class="abs mono" style="left:30px;top:20px;font-size:170px;font-weight:700;letter-spacing:-.06em;line-height:1"><span data-n>00</span><span style="font-size:68px;color:var(--muted)">/05</span></div>`);
    IN(cnt, b + .05, { from: { transform: "translateX(-40px)" }, dur: .6 });
    const bs = [b + .45, b + .75, b + 1.05, b + 1.35, b + 1.65];
    F((t) => { $("[data-n]", c).textContent = String(bs.filter((x) => t >= x).length).padStart(2, "0"); });
    const meter = add(c, `<div class="abs" style="left:30px;top:226px;width:860px"><div class="meter" style="height:92px;box-shadow:8px 8px 0 var(--ink)">${Array.from({ length: 5 }, () => "<i><b></b></i>").join("")}</div></div>`);
    $$("i b", meter).forEach((e, k) => A(e, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], bs[k], .3, "outBack"));
    const cap = add(c, `<div class="abs" style="left:560px;top:68px"><span class="badge b-fail" style="font-size:30px;padding:10px 22px;box-shadow:6px 6px 0 var(--ink)">${ICON.warn.replace('width="12" height="12"', 'width="30" height="30"')}AT CAP</span></div>`);
    A(cap, [{ opacity: 0, transform: "scale(2.4) rotate(-14deg)" }, { opacity: 1, transform: "scale(1) rotate(-4deg)" }], bs[4] + .18, .35, "outBack2");
    A(meter, [{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(7px)" }, { transform: "translateX(0)" }], bs[4] + .18, .3, "lin");
    /* overflow rolls to tomorrow */
    const f6 = add(c, `<div class="filecard" style="left:30px;top:430px;width:380px;box-shadow:6px 6px 0 var(--ink)"><span class="ic" style="background:var(--amber)">${ICON.play.replace('width="20" height="20"', 'width="18" height="18"')}</span><span>cdl-6.mp4<small>6th video · over today's cap</small></span></div>`);
    IN(f6, b + 1.9, { from: { transform: "translateX(-60px)" }, dur: .6 });
    const ar = add(c, `<div class="abs mono" style="left:430px;top:442px;font-size:48px;font-weight:700">→</div>`);
    IN(ar, b + 2.1, { from: { transform: "translateX(-20px)" }, dur: .4 });
    const tm = add(c, `<div class="frame abs" style="left:520px;top:424px;width:370px;height:86px;padding:12px 18px;box-shadow:6px 6px 0 var(--ink);background:var(--acid)"><div class="lbl">ROLLS TO TOMORROW</div><div class="mono" style="font-size:30px;font-weight:700;margin-top:4px">FRI 8:12 AM ET</div></div>`);
    A(tm, [{ opacity: 0, transform: "translateX(70px) rotate(2deg)" }, { opacity: 1, transform: "none" }], b + 2.2, .6, "outBack");
    const note = add(c, `<div class="abs mono" style="left:30px;top:590px;font-size:20px;font-weight:600;color:var(--muted);line-height:1.6;width:860px">YOUTUBE 5/DAY · INSTAGRAM 5/DAY · TIKTOK 10/DAY<br>YOU SET THE NUMBERS. THE ENGINE ENFORCES THEM.</div>`);
    IN(note, b + 1.2, { from: { transform: "translateY(20px)" }, dur: .6 });
  }

  /* ---------- F4 · ONE DROP, EVERY PLATFORM ---------- */
  {
    const { c, b } = featureShell(s, 39.82, { n: "04", accent: "var(--tt)", l1: "ONE DROP,", l2: "EVERY PLATFORM", tag: "YT · IG · TIKTOK", desc: "Pick the platforms once. YouTube and Instagram publish today — TikTok slots in after its audit." });
    const f = add(c, `<div class="filecard" style="left:24px;top:270px;width:280px;height:96px;box-shadow:8px 8px 0 var(--ink);font-size:18px"><span class="ic" style="background:var(--acid);width:44px;height:44px">${ICON.play.replace('width="20" height="20"', 'width="22" height="22"')}</span><span>cdl-3.mp4<small>one file</small></span></div>`);
    A(f, [{ opacity: 0, transform: "translateX(-70px) rotate(-4deg)" }, { opacity: 1, transform: "none" }], b + .1, .65, "outBack");
    const svg = add(c, `<svg class="abs" style="left:0;top:0" width="920" height="710" viewBox="0 0 920 710" fill="none" stroke="#0b0b0b" stroke-width="6"></svg>`);
    const ys = [100, 328, 556], ks = ["yt", "ig", "tt"];
    ys.forEach((y, i) => {
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", `M304 318 C 420 318, 400 ${y + 70}, 500 ${y + 70}`);
      p.setAttribute("stroke-dasharray", i === 2 ? "10 10" : "none");
      svg.appendChild(p);
      const L = 330; if (i < 2) { p.style.strokeDasharray = L; A(p, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], b + .5 + i * .1, .6, "outExpo"); } else A(p, [{ opacity: 0 }, { opacity: 1 }], b + .7, .5, "outExpo");
      const nm = ["YouTube", "Instagram", "TikTok"][i], hd = ["@EchoScape ASMR", "@speedbuildgarage", "pending platform audit"][i];
      const tile = add(c, `<div class="frame abs" style="left:500px;top:${y}px;width:390px;height:144px;box-shadow:7px 7px 0 var(--ink);display:flex;${i === 2 ? "border-style:dashed;" : ""}"><div style="width:12px;background:var(--${ks[i]});border-right:3px solid var(--ink)"></div><div style="flex:1;padding:14px 16px;display:flex;flex-direction:column;gap:6px"><div style="display:flex;align-items:center;gap:10px"><span class="plate" style="background:var(--${ks[i]});color:${i === 1 ? "#fff" : "#0b0b0b"}">${GLYPH[ks[i]]}</span><span style="font:700 18px var(--sans)">${nm}</span></div><div class="mono" style="font-size:13px;color:var(--muted)">${hd}</div><div style="margin-top:auto;position:relative;height:28px" data-st></div></div></div>`);
      A(tile, [{ opacity: 0, transform: "translateX(90px)" }, { opacity: 1, transform: "none" }], b + .55 + i * .14, .6, "outExpo");
      const st = $("[data-st]", tile);
      if (i < 2) {
        add(st, `<span style="position:absolute;left:0;top:0" data-a>${BADGE.sched}</span>`); add(st, `<span style="position:absolute;left:0;top:0" data-b>${BADGE.pub}</span>`);
        vis($("[data-a]", st), [[b + .9, b + 1.9]]); vis($("[data-b]", st), [[b + 1.9 + i * .22, 42.95]]);
        A($("[data-b]", st), [{ opacity: 0, transform: "scale(1.5) rotate(-4deg)" }, { opacity: 1, transform: "rotate(-1.4deg)" }], b + 1.9 + i * .22, .3, "outBack");
        const dot = add(c, `<div class="abs" style="left:0;top:0;width:18px;height:18px;background:var(--acid);border:3px solid var(--ink)"></div>`);
        path(dot, [{ t: b + .6 + i * .1, x: 296, y: 310, o: 0, e: "inOut" }, { t: b + .75 + i * .1, x: 300, y: 312, o: 1, e: "inOut" }, { t: b + 1.4 + i * .1, x: 490, y: y + 62, o: 1, e: "inOut" }, { t: b + 1.5 + i * .1, x: 490, y: y + 62, o: 0 }]);
      } else {
        add(st, `<span class="badge" style="background:#fff;border-style:dashed;box-shadow:none;color:var(--muted)">${ICON.square}PENDING APPROVAL</span>`);
      }
    });
  }

  /* ---------- F5 · ALWAYS ON ---------- */
  {
    const { c, b } = featureShell(s, 43.0, { n: "05", accent: "var(--ink)", accentInk: "var(--acid)", l1: "ALWAYS ON,", l2: "ZERO BABYSITTING", tag: "SERVERLESS CRON", desc: "Appwrite Functions publish on a 5-minute cron and clean up storage. Laptop closed? Still posting." });
    const clock = add(c, `<div class="frame abs" style="left:30px;top:28px;width:360px;height:360px;box-shadow:8px 8px 0 var(--ink)"><svg viewBox="0 0 400 400" width="354" height="354" style="position:absolute;left:0;top:0">
        ${Array.from({ length: 60 }, (_, k) => { const a = (k / 60) * Math.PI * 2; const r1 = k % 5 === 0 ? 150 : 164, r2 = 178; return `<line x1="${200 + Math.sin(a) * r1}" y1="${200 - Math.cos(a) * r1}" x2="${200 + Math.sin(a) * r2}" y2="${200 - Math.cos(a) * r2}" stroke="#0b0b0b" stroke-width="${k % 5 === 0 ? 5 : 2.5}"/>`; }).join("")}
        <g data-h2 style="transform-origin:200px 200px"><line x1="200" y1="200" x2="200" y2="48" stroke="#1b4dff" stroke-width="9"/><rect x="189" y="38" width="22" height="22" fill="#ccff00" stroke="#0b0b0b" stroke-width="4"/></g><circle cx="200" cy="200" r="15" fill="#0b0b0b"/></svg>
        <div class="abs mono" style="left:0;right:0;top:238px;text-align:center;font-weight:700;font-size:26px;letter-spacing:.08em">EVERY 5 MIN</div></div>`);
    A(clock, [{ opacity: 0, transform: "scale(.6) rotate(-20deg)" }, { opacity: 1, transform: "none" }], b + .1, .7, "outBack");
    const hand = $("[data-h2]", clock);
    F((t) => { hand.style.transform = `rotate(${((t - b) / 1.7) * 360}deg)`; });
    const term = add(c, `<div class="frame abs mono" style="left:420px;top:28px;width:470px;height:360px;background:var(--ink);box-shadow:8px 8px 0 var(--acid);padding:18px 20px;color:var(--paper);font-size:16px;font-weight:600;line-height:2;overflow:hidden"></div>`);
    const lines = [["21:05", "CYCLE · 0 DUE", "var(--paper)"], ["21:10", "CYCLE · 1 DUE", "var(--paper)"], ["", "  ✓ PUBLISHED → INSTAGRAM", "var(--acid)"], ["21:13", "CLEANUP · FILE FREED", "var(--acid)"], ["21:15", "CYCLE · 0 DUE", "var(--paper)"], ["21:20", "CYCLE · 0 DUE", "var(--paper)"]];
    lines.forEach(([ts, tx, col], k) => { const l = add(term, `<div style="white-space:nowrap;color:${col}"><span style="color:#8a8a8a">${ts}</span> ${tx}</div>`); A(l, [{ opacity: 0, transform: "translateX(-16px)" }, { opacity: 1, transform: "none" }], b + .5 + k * .24, .3, "outExpo"); });
    const stor = add(c, `<div class="abs" style="left:30px;top:430px;width:860px"><div style="display:flex;align-items:baseline;gap:14px"><span class="lbl">STORAGE</span><span class="mono" data-sp style="font-weight:700;font-size:16px">82%</span><span class="mono" style="margin-left:auto;font-size:13px;color:var(--muted);letter-spacing:.08em">AUTO-CLEANUP AFTER PUBLISH</span></div>
        <div style="margin-top:10px;height:44px;border:3px solid var(--ink);background:#fff;position:relative;box-shadow:6px 6px 0 var(--ink)"><div data-sb style="position:absolute;left:0;top:0;bottom:0;background:var(--amber)"></div></div></div>`);
    IN(stor, b + .3, { from: { transform: "translateY(30px)" }, dur: .6 });
    F((t) => { const p = lerp(82, 14, prog(t, b + 1.3, .6, "inOut")); $("[data-sb]", c).style.width = p + "%"; $("[data-sp]", c).textContent = Math.round(p) + "%"; });
    const badges = add(c, `<div class="abs" style="left:30px;top:560px;display:flex;gap:14px"></div>`);
    ["NO SERVER TO BABYSIT", "RETRIES TRANSIENT ERRORS", "FILES FREED AFTER POSTING"].forEach((x, k) => { const ch = add(badges, `<span class="chip" style="font-size:13px;background:${k === 0 ? "var(--acid)" : "#fff"}">${x}</span>`); A(ch, [{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }], b + 1.7 + k * .12, .4, "outBack"); });
  }
}
