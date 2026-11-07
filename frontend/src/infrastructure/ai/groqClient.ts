import "server-only";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const WHISPER_MODEL = "whisper-large-v3-turbo";
const CHAT_MODEL = "openai/gpt-oss-120b";

function apiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("Missing GROQ_API_KEY");
  return key;
}

/** Transcribes an audio file via Groq's hosted Whisper. Returns "" for silent/non-speech audio (e.g. ASMR, music-only clips) rather than throwing. */
export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(audioBuffer)]), filename);
  form.append("model", WHISPER_MODEL);
  form.append("response_format", "text");

  const res = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq transcription failed (${res.status}): ${body}`);
  }
  return (await res.text()).trim();
}

export interface GeneratedMetadata {
  title: string;
  description: string;
  hashtags: string[];
}

const SYSTEM_PROMPT = `You write trending, high-CTR social media metadata for short-form video creators (YouTube Shorts, Instagram Reels, TikTok).
Given a filename and (if available) a spoken transcript from the video, produce:
- "title": under 100 characters, punchy, curiosity-driven, no clickbait lies
- "description": 1-3 sentences, natural language, may include 2-3 inline hashtags
- "hashtags": 6-10 relevant hashtags as an array of strings, each starting with "#", mix of broad and niche tags, no spaces inside a tag

If the transcript is empty (silent, ambient, or music/ASMR-only content), infer the topic from the filename instead — do not mention that there was no transcript.
Respond with ONLY a JSON object: {"title": string, "description": string, "hashtags": string[]}`;

export async function generateMetadata(filename: string, transcript: string): Promise<GeneratedMetadata> {
  const userContent = transcript
    ? `Filename: ${filename}\nTranscript: ${transcript.slice(0, 6000)}`
    : `Filename: ${filename}\nTranscript: (none — silent or non-speech audio)`;

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq metadata generation failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned no content");

  const parsed = JSON.parse(content);
  return {
    title: String(parsed.title ?? "").slice(0, 100),
    description: String(parsed.description ?? ""),
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.map(String) : [],
  };
}
