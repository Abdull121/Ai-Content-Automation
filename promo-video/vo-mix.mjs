/* Cut the voice-over into lines, tighten pauses, place each on its scene, and mix it over the
   soundtrack with the music ducked underneath. Output: audio-vo.wav (48 kHz stereo). */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
const here = (p) => new URL(p, import.meta.url).pathname.replace(/%20/g, " ");

function readWav(path) {
  const b = readFileSync(path); let o = 12, sr = 24000, data = null;
  while (o < b.length) { const id = b.toString("ascii", o, o + 4), sz = b.readUInt32LE(o + 4); if (id === "fmt ") sr = b.readUInt32LE(o + 12); if (id === "data") data = b.subarray(o + 8, o + 8 + sz); o += 8 + sz + (sz & 1); }
  const s = new Float32Array(data.length / 2); for (let i = 0; i < s.length; i++) s[i] = data.readInt16LE(i * 2) / 32768; return { s, sr };
}
function writeWav(path, s, sr) {
  const b = Buffer.alloc(44 + s.length * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + s.length * 2, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(s.length * 2, 40);
  for (let i = 0; i < s.length; i++) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(s[i] * 32767))), 44 + i * 2);
  writeFileSync(path, b);
}
/* trim edges and shrink any internal pause longer than maxGap */
function tidy(s, sr, maxGap = .34, pad = .06) {
  const win = Math.round(sr * .01), thr = .012, loud = [];
  for (let i = 0; i < s.length; i += win) { let m = 0; for (let k = i; k < Math.min(s.length, i + win); k++) m = Math.max(m, Math.abs(s[k])); loud.push(m > thr); }
  const first = loud.indexOf(true), last = loud.lastIndexOf(true);
  const out = []; let gap = 0;
  for (let w = Math.max(0, first - Math.round(pad * 100)); w <= Math.min(loud.length - 1, last + Math.round(pad * 100 * 2)); w++) {
    gap = loud[w] ? 0 : gap + 1;
    if (!loud[w] && gap > maxGap * 100) continue;
    for (let k = w * win; k < Math.min(s.length, (w + 1) * win); k++) out.push(s[k]);
  }
  const f = new Float32Array(out), fd = Math.round(sr * .012);
  for (let i = 0; i < fd; i++) { f[i] *= i / fd; f[f.length - 1 - i] *= i / fd; }
  return f;
}

/* source segments (from vo/full.wav — Zephyr; boundaries from silencedetect, verified with a Whisper transcript) */
const full = readWav(here("./vo/full.wav"));
const cut = (a, b) => full.s.subarray(Math.round(a * full.sr), Math.round(b * full.sr));
const SRC = {
  "01": cut(0, 4.6), "02": cut(5.2, 9.15), "03": cut(10.05, 12.0), "04": cut(15.4, 18.05), "05": cut(19.25, 22.9), "06": cut(24.0, 27.45),
  "07": cut(28.6, 32.4), "08": cut(33.6, 36.5), "09": cut(37.6, 40.35), "10": cut(41.38, 44.1), "11": cut(45.3, 47.4), "12": cut(48.5, 51.6),
  "13": cut(52.7, 55.55), "14": cut(56.65, 61.8),
};
/* [line, start, latest end] — each line sits inside its scene window; tempo is raised only if it must be */
const WIN = [
  ["01", 2.3, 7.4], ["02", 8.45, 12.4], ["03", 13.25, 15.6], ["04", 16.5, 19.5], ["05", 19.75, 23.2], ["06", 23.3, 26.95], ["07", 27.05, 30.3],
  ["08", 30.62, 33.75], ["09", 33.95, 37.0], ["10", 37.12, 40.15], ["11", 40.25, 42.9], ["12", 43.1, 46.0], ["13", 47.2, 51.0], ["14", 52.75, 57.3],
];
const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: ["ignore", "inherit", "inherit"] });
const lufs = (path) => Number(execFileSync("ffmpeg", ["-hide_banner", "-i", path, "-af", "ebur128=framelog=quiet", "-f", "null", "-"], { stdio: ["ignore", "pipe", "pipe"] }).toString() || 0) || Number((execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${path}" -af ebur128=framelog=quiet -f null - 2>&1 | grep -E "^ +I:" | tail -1`]).toString().match(/-?[\d.]+/) || [0])[0]);

mkdirSync(here("./vo/lines"), { recursive: true });
const SRO = 48000, dry = new Float32Array(58 * SRO), placed = [];
WIN.forEach(([id, at, end]) => {
  const f = tidy(SRC[id], full.sr, id === "14" ? .26 : .32);
  const p = here(`./vo/lines/${id}.wav`), p48 = here(`./vo/lines/${id}-48.wav`); writeWav(p, f, full.sr);
  const raw = f.length / full.sr, tempo = Math.min(1.15, Math.max(1, raw / (end - at)));
  ff(["-i", p, "-af", `aresample=${SRO},atempo=${tempo.toFixed(3)}`, "-ac", "1", p48]);
  const { s: x } = readWav(p48), o = Math.round(at * SRO);
  for (let i = 0; i < x.length && o + i < dry.length; i++) dry[o + i] += x[i];
  const len = x.length / SRO; placed.push([id, at, at + len]);
  console.log(id, `at ${at.toFixed(2)}s`, `len ${len.toFixed(2)}s`, `ends ${(at + len).toFixed(2)}s`, tempo > 1 ? `tempo ${tempo.toFixed(2)}` : "", at + len > end + .01 ? "⚠ over window" : "");
});
const stemDry = here("./vo/stem-vo-dry.wav"); writeWav(stemDry, dry, SRO);

/* 1 · voice stem: clean, compress, then normalise to -15 LUFS */
const stemRaw = here("./vo/stem-vo-raw.wav"), stemVo = here("./vo/stem-vo.wav");
ff(["-i", stemDry, "-af", "highpass=f=90,equalizer=f=250:t=q:w=1:g=-3,equalizer=f=4200:t=q:w=1.2:g=3,equalizer=f=10000:t=q:w=1:g=2,acompressor=threshold=-24dB:ratio=4:attack=3:release=120:makeup=4dB,pan=stereo|c0=c0|c1=c0", "-ar", "48000", stemRaw]);
const gain = -15 - lufs(stemRaw);
ff(["-i", stemRaw, "-af", `volume=${gain.toFixed(2)}dB`, stemVo]);

/* 2 · music ducked hard under the voice */
const stemMus = here("./vo/stem-music-ducked.wav");
ff(["-i", here("./audio.wav"), "-i", stemVo, "-filter_complex", `[0:a]aresample=48000,volume=0.78[m];[m][1:a]sidechaincompress=threshold=0.008:ratio=14:attack=12:release=380:knee=4[o]`, "-map", "[o]", "-t", "58", stemMus]);

/* 3 · final mix */
ff(["-i", stemMus, "-i", stemVo, "-filter_complex", `[0:a][1:a]amix=inputs=2:normalize=0,alimiter=limit=0.93:level=false,atrim=0:58[o]`, "-map", "[o]", "-ar", "48000", here("./audio-vo.wav")]);

/* report: voice vs ducked-music level inside each line */
const rd = (p) => { const b = readFileSync(p); let o = 12, d; while (o < b.length) { const id = b.toString("ascii", o, o + 4), sz = b.readUInt32LE(o + 4); if (id === "data") d = b.subarray(o + 8, o + 8 + sz); o += 8 + sz + (sz & 1); } return d; };
const V = rd(stemVo), M = rd(stemMus), rms = (buf, a, b) => { let s = 0, n = 0; for (let i = Math.floor(a * 48000); i < Math.floor(b * 48000); i++) { const v = buf.readInt16LE(i * 4) / 32768; s += v * v; n++; } return 10 * Math.log10(s / n + 1e-12); };
console.log("voice stem", gain >= 0 ? "+" : "", gain.toFixed(1), "dB → -15 LUFS");
placed.forEach(([id, a, b]) => console.log(id, "voice over music:", (rms(V, a, b) - rms(M, a, b)).toFixed(1), "dB"));
console.log("final:", lufs(here("./audio-vo.wav")).toFixed(1), "LUFS");
