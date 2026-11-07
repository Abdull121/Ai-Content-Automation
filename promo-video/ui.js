/* Icons + product data + the dashboard "world" (the real UI, rebuilt 1:1 in markup) */
const SVG = (inner, w = 12, vb = "0 0 12 12", extra = "") =>
  `<svg viewBox="${vb}" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" ${extra}>${inner}</svg>`;
const ICON = {
  square: SVG('<rect x="1.5" y="1.5" width="9" height="9"/>'),
  ellipsis: SVG('<rect x="1" y="5" width="2" height="2" fill="currentColor" stroke="none"/><rect x="5" y="5" width="2" height="2" fill="currentColor" stroke="none"/><rect x="9" y="5" width="2" height="2" fill="currentColor" stroke="none"/>'),
  clock: SVG('<rect x="1.5" y="1.5" width="9" height="9"/><path d="M6 3.5V6.2L8 7.4"/>'),
  check: SVG('<path d="M1.8 6.4L4.8 9.2L10.4 2.6"/>'),
  cross: SVG('<path d="M2 2L10 10M10 2L2 10"/>'),
  dot: SVG('<rect x="3" y="3" width="6" height="6" fill="currentColor" stroke="none"/>'),
  warn: SVG('<path d="M6 1.4L11.2 10.6H0.8Z"/><path d="M6 5V7.2"/>'),
  upload: SVG('<path d="M16 22V6M8 14L16 6L24 14M6 26H26"/>', 32, "0 0 32 32", 'stroke-width="3"'),
  play: `<svg viewBox="0 0 24 24" width="20" height="20"><path d="M7 4.5L19 12L7 19.5Z" fill="currentColor"/></svg>`,
};
const GLYPH = {
  yt: `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="1.4" y="3.4" width="13.2" height="9.2"/><path d="M6.6 6.1L10.6 8L6.6 9.9Z" fill="currentColor" stroke="none"/></svg>`,
  ig: `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="1.4" y="1.4" width="13.2" height="13.2"/><circle cx="8" cy="8" r="3.1"/><rect x="10.9" y="3.4" width="1.9" height="1.9" fill="currentColor" stroke="none"/></svg>`,
  tt: `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 11.2V2.4H8.7C8.7 4.8 10.3 6 12.6 6"/><rect x="2.6" y="8.8" width="4.4" height="4.4" fill="currentColor" stroke="none"/></svg>`,
};
const BADGE = {
  queued: `<span class="badge b-queued">${ICON.square}QUEUED</span>`,
  gen: `<span class="badge b-gen">${ICON.ellipsis}GENERATING METADATA</span>`,
  sched: `<span class="badge b-sched">${ICON.clock}SCHEDULED</span>`,
  pend: `<span class="badge b-pend">${ICON.dot}PUBLISHING</span>`,
  pub: `<span class="badge b-pub">${ICON.check}PUBLISHED</span>`,
  conn: `<span class="badge b-pub">${ICON.check}CONNECTED</span>`,
  off: `<span class="badge b-off">${ICON.square}NOT CONNECTED</span>`,
  fail: `<span class="badge b-fail">${ICON.cross}FAILED</span>`,
};

const VIDEOS = [
  { fn: "cdl-1.mp4", title: "Air Brake Quiz: 3 PSI vs 4 PSI – Pass the Test!", tags: ["#CDL", "#AirBrakes", "#Truckers", "#CDLPrep"], when: "Thu 8:12 AM ET" },
  { fn: "cdl-2.mp4", title: "Triangle Placement: 10-ft, 100-ft, 200-ft in 3 Seconds!", tags: ["#CDL", "#RoadSafety", "#TruckDriving", "#SafetyTips"], when: "Thu 11:34 AM ET" },
  { fn: "cdl-3.mp4", title: "Zero Gap on Fifth Wheel? CDL Test Trick You Must Know!", tags: ["#CDL", "#TruckDriving", "#FifthWheel", "#DrivingTest"], when: "Thu 2:41 PM ET" },
  { fn: "cdl-4.mp4", title: "CDL Safety: Correct Distance for Your First Warning Triangle", tags: ["#CDL", "#TruckSafety", "#CommercialDriving", "#RoadSafety"], when: "Thu 5:23 PM ET" },
  { fn: "cdl-5.mp4", title: "Can Dual Tires Touch While Driving? The Quick CDL Answer", tags: ["#CDL", "#TruckDriving", "#DualTires", "#RoadSafety"], when: "Thu 8:19 PM ET" },
];

function tileHTML(kind, name, handle, connected, count, limit, desc) {
  const col = kind;
  const meter = connected ? `<div class="meter" data-role="meter-${kind}">${Array.from({ length: limit }, () => "<i><b></b></i>").join("")}</div>` : "";
  const stat = connected
    ? `<div class="big"><span data-role="cnt-${kind}">${String(count).padStart(2, "0")}</span><small>/${String(limit).padStart(2, "0")}</small><em>posts today</em></div>${meter}
       <div class="small11" data-role="left-${kind}">${String(limit - count).padStart(2, "0")} left · ${Math.round((count / limit) * 100)}% of cap used</div>`
    : `<div class="hint" style="margin-top:6px">TikTok isn't approved for publishing yet — pending platform audit.</div><div class="btn dis" style="margin-top:auto">Pending approval</div>`;
  return `<article class="tile" data-tile="${kind}"><div class="rail" style="background:var(--${col})"></div><div class="tb">
    <div class="r1"><span class="plate" style="background:var(--${col});color:${kind === "ig" ? "#fff" : "#0b0b0b"}">${GLYPH[kind]}</span><span class="nm">${name}</span><span style="margin-left:auto" data-role="badge-${kind}">${connected ? BADGE.conn : BADGE.off}</span></div>
    <div class="hd">@${handle}</div>${stat}</div></article>`;
}

function buildDash(host) {
  const world = add(host, `<div id="world" class="abs" style="left:0;top:0;width:1280px;transform-origin:0 0"></div>`);
  const frame = add(world, `<div class="frame" id="frame" style="width:1280px"></div>`);
  /* registration crosses */
  [[-34, -34], [1292, -34], [-34, 1155], [1292, 1155]].forEach(([x, y]) => add(frame, `<div class="cross" style="left:${x}px;top:${y}px"></div>`));

  /* 01 accounts */
  const acc = add(frame, `<div id="acc"><div class="band"><h2>Accounts</h2><span class="meta" data-role="live">2/3 LIVE</span><span class="idx">01</span></div>
    <div style="padding:20px"><div style="border:2px solid var(--ink);background:var(--paper);padding:12px"><div style="display:grid;grid-template-columns:repeat(3,1fr);border:2px solid var(--ink);background:#fff;height:214px">
    ${tileHTML("yt", "YouTube", "EchoScape ASMR", true, 0, 5)}${tileHTML("ig", "Instagram", "speedbuildgarage", true, 0, 5)}${tileHTML("tt", "TikTok", "", false, 0, 0)}
    </div></div></div></div>`);
  add(frame, `<div style="height:3px;background:var(--ink)"></div>`);

  const rowB = add(frame, `<div style="display:grid;grid-template-columns:880px 3px 1fr"></div>`);
  /* 02 upload */
  const up = add(rowB, `<div id="up"><div class="band"><h2>Upload</h2><span class="meta" data-role="items">0 ITEMS</span><span class="idx">02</span></div>
    <div style="padding:20px;display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;gap:12px" id="pills">
        <span class="pill yt" data-pill="yt"><i></i>YouTube<span class="on"><i></i>YouTube</span></span>
        <span class="pill ig" data-pill="ig"><i></i>Instagram<span class="on"><i></i>Instagram</span></span>
        <span class="pill" data-pill="tt"><i></i>TikTok</span>
      </div>
      <div class="dropzone" id="dz"><div class="dz-on"></div>${ICON.upload}<p>Drag &amp; drop videos here, or click to select (50-100 files supported)</p></div>
      <div><div style="display:flex;align-items:baseline;margin-bottom:8px"><span class="lbl">Queue</span><span class="mono" style="margin-left:auto;font-size:12px;color:var(--muted)" data-role="qcount">0 items</span></div>
      <div class="qwell" id="qwell"></div></div>
    </div></div>`);
  add(rowB, `<div style="background:var(--ink)"></div>`);
  /* 03 schedule */
  const sch = add(rowB, `<div id="sch"><div class="band"><h2>Schedule</h2><span class="meta">8:00 AM–9:00 PM</span><span class="idx">03</span></div>
    <div style="padding:20px;display:flex;flex-direction:column;gap:26px">
      <div><div class="lbl" style="margin-bottom:8px">Timezone</div><div class="field" id="tzf"><span>America/New_York</span><span>▾</span></div>
        <div class="hint" style="margin-top:10px">Posting window auto-fills to typical high-engagement hours for the selected timezone — adjust it manually if needed.</div></div>
      <div><div style="display:flex;gap:10px;align-items:baseline;margin-bottom:8px"><span class="lbl">Posting window</span><span class="mono" style="font-weight:700;font-size:15px" data-role="win">8:00 AM – 9:00 PM</span></div>
        <div class="hour" id="hour">${Array.from({ length: 24 }, () => "<i><b></b></i>").join("")}</div>
        <div style="position:relative;height:22px;font:500 11px var(--mono);color:var(--ink);margin-top:3px"><span class="abs" style="left:0">12A</span><span class="abs" style="left:25%">6A</span><span class="abs" style="left:50%">12P</span><span class="abs" style="left:75%">6P</span>
          <div id="peaks" class="abs" style="left:0;right:0;top:0;height:22px"></div></div>
        <div style="display:flex;gap:18px;margin-top:6px;font:500 11px var(--mono);text-transform:uppercase;letter-spacing:.06em"><span style="display:flex;align-items:center;gap:6px"><span style="width:16px;height:10px;border:2px solid var(--ink);background:var(--acid)"></span>Selected</span><span style="display:flex;align-items:center;gap:6px"><span style="width:16px;height:4px;background:var(--volt)"></span>Recommended</span></div>
        <div style="margin-top:12px"><div class="lbl" style="margin-bottom:6px">Start · 8:00 AM</div><div class="slider"><b id="hs" style="left:30%;background:var(--acid)"></b></div></div>
        <div style="margin-top:12px"><div class="lbl" style="margin-bottom:6px">End · 9:00 PM</div><div class="slider"><b id="he" style="left:84%;background:var(--volt)"></b></div></div></div>
      <div><div class="lbl" style="margin-bottom:12px">Max posts per day (per platform)</div>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${[["yt", "YouTube", 5], ["ig", "Instagram", 5], ["tt", "TikTok", 10]].map(([k, n, v]) => `<div style="display:flex;align-items:center;gap:12px"><span class="tag ${k}">${k.toUpperCase()}</span><span style="flex:1;font:600 14px var(--sans)">${n}</span><span class="num" data-role="max-${k}">${v}</span></div>`).join("")}
        </div></div>
      <div class="btn acid" id="save">Save settings</div>
    </div></div>`);

  /* queue rows */
  const qwell = $("#qwell", world);
  VIDEOS.forEach((v, i) => {
    add(qwell, `<article class="row" data-i="${i}"><div class="rail"><i class="yt"></i><i class="ig"></i></div>
      <div class="body"><div class="fn">${v.fn}</div><div class="ttl" data-role="ttl"></div>
      <div class="meta"><span class="tag yt">YT</span><span class="tag ig">IG</span><span class="hs">${v.tags.map((x) => `<span>${x}</span>`).join("")}</span></div>
      <div class="sch" data-role="sch"></div></div>
      <div class="bdg">${["queued", "gen", "sched", "pend", "pub"].map((k) => `<span data-b="${k}" style="position:absolute;right:0;top:0">${BADGE[k]}</span>`).join("")}</div>
      <span class="scan"></span></article>`);
  });
  /* peak markers */
  const peaks = $("#peaks", world);
  [[8, "8A"], [11, "11A"], [14, "2P"], [17, "5P"], [20, "8P"]].forEach(([hr, lb]) => {
    add(peaks, `<div class="abs" style="left:${(hr / 24) * 100}%;top:-26px;width:0"><div data-peak style="position:absolute;left:0;top:0;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center"><div style="height:26px;width:4px;background:var(--volt)"></div></div><span class="abs" data-peaklbl style="left:0;top:2px;transform:translateX(-50%);color:var(--volt);font-weight:700;opacity:0">${lb}</span></div>`);
  });
  return { world, frame, acc: $("#acc", world), up, sch, qwell, rows: $$(".row", world), hour: $("#hour", world) };
}
