/* Voice-over via Gemini TTS. One request per line so each line can be placed on its scene.
   Key is read from .env (GEMINI_API_KEY) — never hard-code it. Output: vo/<id>.wav (24 kHz mono PCM). */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const KEY = readFileSync(new URL("./.env", import.meta.url), "utf8").match(/GEMINI_API_KEY=(.*)/)[1].trim();
const MODELS = [process.env.TTS_MODEL || "gemini-2.5-flash-preview-tts"];
const VOICE = process.env.VOICE || "Charon";
const STYLE = "Say in a calm, confident, warm and modern narrator tone for a premium product introduction video, clear and crisp, not salesy:";

export const LINES = [
  ["01", "Meet Content Automation. Autopilot for your short-form videos."],
  ["02", "Fifty videos. Three platforms. Zero spare time."],
  ["03", "Now, it's just one drop. Everything else runs on autopilot."],
  ["04", "Drop your videos, and pick your platforms."],
  ["05", "AI writes every title, description and hashtag."],
  ["06", "Then it schedules each post at real peak hours."],
  ["07", "Then it publishes on its own, inside your daily limits."],
  ["08", "Metadata, written from the video's own audio."],
  ["09", "Posts that land at their peak, from anywhere."],
  ["10", "Safe daily caps keep every account healthy."],
  ["11", "One upload. Every platform."],
  ["12", "And it's always on. No server to babysit."],
  ["13", "Upload once. Everything else runs itself."],
  ["14", "Content Automation. One drop. Every platform. On autopilot."],
];

const wav = (pcm, sr = 24000) => {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(sr, 24); h.writeUInt32LE(sr * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
};

async function tts(text) {
  let last;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 6; attempt++) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST", headers: { "x-goog-api-key": KEY, "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: `${STYLE}\n${text}` }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } } }),
      });
      const j = await r.json().catch(() => ({}));
      const part = j?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (r.ok && part) { const rate = Number((part.inlineData.mimeType.match(/rate=(\d+)/) || [])[1] || 24000); return { pcm: Buffer.from(part.inlineData.data, "base64"), rate, model }; }
      last = `${model} ${r.status} ${JSON.stringify(j).slice(0, 300)}`;
      if (r.status === 404 || r.status === 400) break;
      console.error("  retry", r.status, "in", 22 * (attempt + 1), "s"); await new Promise((res) => setTimeout(res, 22000 * (attempt + 1)));
    }
  }
  throw new Error(last);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  mkdirSync(new URL("./vo/", import.meta.url), { recursive: true });
  const only = process.argv.slice(2);
  for (const [id, text] of LINES) {
    if (only.length && !only.includes(id)) continue;
    const out = new URL(`./vo/${id}.wav`, import.meta.url);
    if (!only.length && existsSync(out)) { console.log(id, "cached"); continue; }
    const { pcm, rate, model } = await tts(text);
    writeFileSync(out, wav(pcm, rate));
    console.log(id, model, (pcm.length / 2 / rate).toFixed(2) + "s", text);
  }
}
