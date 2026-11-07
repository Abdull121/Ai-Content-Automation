/* ===================== TRANSITIONS — every cut is its own move =====================
   Scene visibility windows live here too, because a transition needs both scenes on
   screen at once for its overlap. All effects draw in #wipes (z 50, above every scene). */
const FEAT = [];
let BANNER = null;
const KF_STEP = "steps(1, end)";

function buildTransitions() {
  const FX = $("#wipes");
  const dash = D.layer, s1 = $("#s1"), s2 = $("#s2"), s3 = $("#s3"), s4 = $("#s4"), s5 = $("#s5"), s6 = $("#s6");
  const [f1, f2, f3, f4, f5] = FEAT;

  vis(s1, [[0, 8.15]]);
  vis(s2, [[8.15, 16.15]]);
  vis(dash, [[16.15, 30.45], [45.6, 52.15]]);
  vis(s3, [[16.15, 30.45]]);
  vis(s4, [[29.75, 46.25]]);
  vis(s5, [[46.0, 52.15]]);
  vis(s6, [[52.15, 58]]);
  vis(f1, [[31.0, 34.3]]);
  vis(f2, [[33.65, 37.0]]);
  vis(f3, [[37.0, 40.1]]);
  vis(f4, [[39.95, 43.0]]);
  vis(f5, [[43.0, 46.25]]);

  /* ---- T1 · 8.15 · zoom through the play mark → acid flood peels up ---- */
  {
    const cx = 286, cy = 474; // logo mark centre on screen at the end of scene 1 (group is scaled 1.064)
    const sq = add(FX, `<div class="abs" style="left:${cx - 110}px;top:${cy - 110}px;width:220px;height:220px;background:var(--ink)"></div>`);
    const tri = add(FX, `<div class="abs" style="left:${cx - 110}px;top:${cy - 110}px;width:220px;height:220px;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="108" height="108" style="overflow:visible"><path d="M7 4.5L19 12L7 19.5Z" fill="#ccff00"/></svg></div>`);
    vis(sq, [[7.45, 8.16]]); vis(tri, [[7.45, 8.16]]);
    A(sq, [{ transform: "scale(1.064)" }, { transform: "scale(.94)", offset: .18 }, { transform: "scale(24)" }], 7.45, .62, "in");
    A(tri, [{ transform: "scale(1.064) translateX(0)" }, { transform: "scale(.9) translateX(0)", offset: .2 }, { transform: "scale(110) translateX(-3px)" }], 7.5, .66, "in");
    const cov = add(FX, `<div class="abs" style="inset:0;background:var(--acid)"></div>`);
    const edge = add(FX, `<div class="abs" style="left:0;top:0;width:1920px;height:12px;background:var(--ink)"></div>`);
    vis(cov, [[8.15, 8.8]]); vis(edge, [[8.15, 8.8]]);
    A(cov, [{ clipPath: "inset(0 0 0% 0)" }, { clipPath: "inset(0 0 100% 0)" }], 8.18, .58, "inOutSoft");
    A(edge, [{ transform: "translateY(1080px)" }, { transform: "translateY(-12px)" }], 8.18, .58, "inOutSoft");
  }

  /* ---- T2 · 16.15 · scene-2 dropzone grows to full frame, then lands in the real dashboard dropzone ---- */
  {
    const from = { x: 1120, y: 320, w: 460, h: 300 }, full = { x: 0, y: 0, w: 1920, h: 1080 };
    const dzW = wpos($("#dz", D.world), D.world);
    const pn = add(FX, `<div class="abs" style="left:0;top:0;border:6px solid var(--volt);background:#e8edff;box-shadow:10px 10px 0 var(--ink);overflow:hidden;display:flex;align-items:center;justify-content:center"><div data-in class="mono" style="font-size:64px;font-weight:700;display:flex;flex-direction:column;align-items:center;gap:8px">${ICON.upload.replace('width="32" height="32"', 'width="56" height="56"')}<span>50<span style="font-size:24px;color:var(--muted)"> FILES</span></span></div></div>`);
    const inner = $("[data-in]", pn);
    F((t) => {
      if (t < 15.45 || t > 16.75) { pn.style.display = "none"; return; }
      pn.style.display = "flex";
      let r;
      if (t < 16.15) {
        const p = prog(t, 15.45, .62, "inOut");
        r = { x: lerp(from.x, full.x - 8, p), y: lerp(from.y, full.y - 8, p), w: lerp(from.w, full.w + 16, p), h: lerp(from.h, full.h + 16, p) };
        inner.style.opacity = 1 - clamp(p * 2.2); inner.style.transform = `scale(${1 + p * 1.6})`;
        pn.style.opacity = 1;
      } else {
        const p = prog(t, 16.15, .58, "inOut"), s = camState.s;
        const to = { x: camState.sx - camState.wx * s + (dzW.x + 3) * s, y: camState.sy - camState.wy * s + (dzW.y + 3) * s, w: dzW.w * s, h: dzW.h * s };
        r = { x: lerp(full.x - 8, to.x, p), y: lerp(full.y - 8, to.y, p), w: lerp(full.w + 16, to.w, p), h: lerp(full.h + 16, to.h, p) };
        inner.style.opacity = 0;
        pn.style.opacity = 1 - clamp((p - .55) / .45);
      }
      Object.assign(pn.style, { left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px" });
    });
  }

  /* ---- T3 · 30.15 · vertical page push: dashboard up, features rise from below ---- */
  {
    const t0 = 29.75, d = .7;
    [dash, s3].forEach((e) => A(e, [{ transform: "translateY(0)" }, { transform: "translateY(-1080px)" }], t0, d, "inOut", { fill: "forwards" }));
    A(dash, [{ transform: "translateY(-1080px)" }, { transform: "translateY(0)" }], 45.5, .01, "lin", { fill: "forwards" });
    A(s4, [{ transform: "translateY(1080px)" }, { transform: "translateY(0)" }], t0, d, "inOut");
    const seam = add(FX, `<div class="abs" style="left:0;top:0;width:1920px;height:16px;background:var(--acid);border-top:4px solid var(--ink);border-bottom:4px solid var(--ink)"></div>`);
    vis(seam, [[t0, t0 + d + .02]]);
    A(seam, [{ transform: "translateY(1080px)" }, { transform: "translateY(-16px)" }], t0, d, "inOut");
  }

  /* ---- T4 · 31.0 · banner letters fly out upward ---- */
  {
    $$(".ltr", BANNER).forEach((l, i) => A(l, [{ transform: "translateY(0)" }, { transform: "translateY(-125%) skewY(-8deg)" }], 30.74 + i * .016, .26, "in", { fill: "forwards" }));
    const ub = $("[data-ub]", BANNER);
    A(ub, [{ transform: "scaleX(1)", transformOrigin: "right" }, { transform: "scaleX(0)", transformOrigin: "right" }], 30.72, .3, "in", { fill: "forwards" });
  }

  /* ---- T5 · 34.0 · horizontal carousel ---- */
  A(f1, [{ transform: "translateX(0)" }, { transform: "translateX(-1920px)" }], 33.65, .65, "inOut", { fill: "forwards" });
  A(f2, [{ transform: "translateX(1920px)" }, { transform: "translateX(0)" }], 33.65, .65, "inOut");

  /* ---- T6 · 37.0 · mosaic tile flip ---- */
  {
    const R = rng(37);
    for (let r = 0; r < 7; r++) for (let c = 0; c < 12; c++) {
      const k = R(), col = k < .07 ? "var(--volt)" : k < .22 ? "var(--acid)" : "var(--ink)";
      const tl = add(FX, `<div class="abs" style="left:${c * 160}px;top:${r * 160 - 10}px;width:161px;height:161px;background:${col}"></div>`);
      const dg = c + r;
      vis(tl, [[36.4, 37.5]]);
      A(tl, [{ transform: "scale(0) rotate(45deg)" }, { transform: "scale(1.02) rotate(0deg)" }], 36.42 + dg * .02, .22, "outQuart");
      A(tl, [{ transform: "scale(1.02) rotate(0deg)" }, { transform: "scale(0) rotate(-45deg)" }], 37.02 + dg * .02, .22, "in", { fill: "forwards" });
    }
  }

  /* ---- T7 · 40.0 · zoom-through with blur ---- */
  A(f3, [{ transform: "scale(1)", opacity: 1, filter: "blur(0px)" }, { transform: "scale(1.7)", opacity: 0, filter: "blur(10px)" }], 39.62, .46, "in", { fill: "forwards" });
  A(f4, [{ transform: "scale(.78)", opacity: 0, filter: "blur(8px)" }, { transform: "scale(1)", opacity: 1, filter: "blur(0px)" }], 39.95, .6, "outExpo");

  /* ---- T8 · 43.0 · digital glitch ---- */
  {
    const jit = (pts) => pts.map(([o, tx, fl]) => ({ offset: o, transform: tx, filter: fl, easing: KF_STEP }));
    A(f4, jit([[0, "translate(0,0)", "none"], [.18, "translate(-34px,0) skewX(-7deg)", "invert(1)"], [.36, "translate(42px,6px)", "none"], [.55, "translate(-18px,-4px) skewX(9deg)", "hue-rotate(110deg) saturate(3)"], [.75, "translate(26px,0)", "invert(1)"], [1, "translate(0,0)", "none"]]), 42.72, .28, "lin", { fill: "forwards" });
    A(f5, jit([[0, "translate(30px,0) skewX(6deg)", "invert(1)"], [.3, "translate(-22px,3px)", "hue-rotate(-90deg) saturate(3)"], [.6, "translate(10px,0)", "none"], [1, "translate(0,0)", "none"]]), 43.0, .22, "lin");
    const cols = ["var(--acid)", "var(--volt)", "var(--ink)", "var(--paper)", "var(--alarm)", "var(--tt)"];
    const bars = Array.from({ length: 11 }, () => add(FX, `<div class="abs" style="left:0;top:0;width:2200px;display:none"></div>`));
    F((t) => {
      const on = t >= 42.72 && t < 43.26;
      const R = rng(Math.floor(t * 30) * 7919 + 3);
      bars.forEach((b, i) => {
        if (!on || R() > .62) { b.style.display = "none"; R(); R(); R(); R(); return; }
        b.style.display = "block";
        b.style.top = Math.floor(R() * 1080) + "px";
        b.style.height = Math.floor(4 + R() * 72) + "px";
        b.style.transform = `translateX(${Math.floor((R() - .5) * 360) - 140}px)`;
        b.style.background = cols[Math.floor(R() * cols.length)];
        b.style.opacity = i % 3 === 0 ? .55 : 1;
      });
    });
  }

  /* ---- T9 · 46.0 · square iris closes into the cron clock ---- */
  {
    const cx = 1113, cy = 365, t0 = 45.6, d = .62;
    const ring = add(FX, `<div class="abs" style="left:0;top:0;border:8px solid var(--acid);outline:4px solid var(--ink);display:none"></div>`);
    F((t) => {
      if (t < t0) { s4.style.clipPath = ""; ring.style.display = "none"; return; }
      const p = prog(t, t0, d, "inOut");
      const x0 = cx * p, y0 = cy * p, x1 = 1920 - (1920 - cx) * p, y1 = 1080 - (1080 - cy) * p;
      s4.style.clipPath = `inset(${y0}px ${1920 - x1}px ${1080 - y1}px ${x0}px)`;
      const show = t < t0 + d + .02 && p > .02;
      ring.style.display = show ? "block" : "none";
      Object.assign(ring.style, { left: x0 - 8 + "px", top: y0 - 8 + "px", width: x1 - x0 + 16 + "px", height: y1 - y0 + 16 + "px" });
    });
  }

  /* ---- T10 · 52.15 · diamond ink flood ---- */
  {
    const mk = (col, at, dur) => {
      const e = add(FX, `<div class="abs" style="left:910px;top:490px;width:100px;height:100px;background:${col}"></div>`);
      vis(e, [[at, 52.2]]);
      A(e, [{ transform: "rotate(45deg) scale(0)" }, { transform: "rotate(45deg) scale(.6)", offset: .25 }, { transform: "rotate(135deg) scale(26)" }], at, dur, "in");
      return e;
    };
    mk("var(--acid)", 51.5, .58); mk("var(--volt)", 51.58, .55); mk("var(--ink)", 51.66, .5);
  }
}
