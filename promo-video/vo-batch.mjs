/* One-shot TTS of the whole script (consistent voice), later split on the long pauses. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { LINES } from "./vo.mjs";
const KEY = readFileSync(new URL("./.env", import.meta.url), "utf8").match(/GEMINI_API_KEY=(.*)/)[1].trim();
const model = process.env.TTS_MODEL || "gemini-3.1-flash-tts-preview", voice = process.env.VOICE || "Charon";
const text = (process.env.TONE || "Read the following script as the narrator of a premium product introduction video. Calm, confident, warm and modern; clear and crisp, not salesy.") + " Leave a long two-second silence between each numbered line, and do not read the numbers.\n\n" + LINES.map(([id, t]) => `${Number(id)}. ${t}`).join("\n\n");
const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "x-goog-api-key": KEY, "content-type": "application/json" },
  body: JSON.stringify({ contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } } }) });
const j = await r.json(); const p = j?.candidates?.[0]?.content?.parts?.find((x) => x.inlineData);
if (!p) { console.error(r.status, JSON.stringify(j).slice(0, 300)); process.exit(1); }
const pcm = Buffer.from(p.inlineData.data, "base64"), sr = Number((p.inlineData.mimeType.match(/rate=(\d+)/) || [])[1] || 24000);
const h = Buffer.alloc(44); h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(sr, 24); h.writeUInt32LE(sr * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
mkdirSync(new URL("./vo/", import.meta.url), { recursive: true });
writeFileSync(new URL("./vo/full.wav", import.meta.url), Buffer.concat([h, pcm]));
console.log(model, voice, (pcm.length / 2 / sr).toFixed(2) + "s");
