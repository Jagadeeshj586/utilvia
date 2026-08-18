export const TTS_MAX_CHARS = 5000;
export const TTS_CHUNK_CHARS = 180;

export const TTS_FAQS = [
  {
    question: "Why do voices differ by device?",
    answer: "Playback uses voices installed on your browser and operating system, so available voices vary by device.",
  },
  {
    question: "Can I download audio?",
    answer: "Yes. Click Download MP3 to save an audio file. Playback uses your browser voices; the download is generated as an MP3.",
  },
  {
    question: "Does it work offline?",
    answer: "Playback may work offline if your browser has offline voices installed. Download requires a network connection.",
  },
  {
    question: "Can TTS help proofreading?",
    answer: "Yes. Hearing text read aloud helps catch awkward phrasing you might miss when reading silently.",
  },
  {
    question: "Is text to speech free?",
    answer: "Yes. The Utilvia text to speech tool is free with no signup.",
  },
] as const;

/** Web Speech rate (0.5–2) → Edge-style rate string, e.g. 1 → +0%, 0.5 → -50%. */
export function rateToEdgeString(rate: number): string {
  const clamped = Math.min(2, Math.max(0.5, rate));
  const pct = Math.round((clamped - 1) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}

/** Web Speech pitch (0.5–2) → Edge-style pitch string, e.g. 1 → +0Hz. */
export function pitchToEdgeString(pitch: number): string {
  const clamped = Math.min(2, Math.max(0.5, pitch));
  const hz = Math.round((clamped - 1) * 50);
  return `${hz >= 0 ? "+" : ""}${hz}Hz`;
}

const EDGE_VOICE_BY_LANG: Record<string, string> = {
  "en-US": "en-US-JennyNeural",
  "en-GB": "en-GB-SoniaNeural",
  "en-AU": "en-AU-NatashaNeural",
  "en-IN": "en-IN-NeerjaNeural",
  "hi-IN": "hi-IN-SwaraNeural",
  "es-ES": "es-ES-ElviraNeural",
  "es-MX": "es-MX-DaliaNeural",
  "fr-FR": "fr-FR-DeniseNeural",
  "de-DE": "de-DE-KatjaNeural",
  "it-IT": "it-IT-ElsaNeural",
  "pt-BR": "pt-BR-FranciscaNeural",
  "ja-JP": "ja-JP-NanamiNeural",
  "ko-KR": "ko-KR-SunHiNeural",
  "zh-CN": "zh-CN-XiaoxiaoNeural",
};

/** Pick a neural voice label for download based on a Web Speech voice language tag. */
export function pickEdgeVoice(lang: string): string {
  if (EDGE_VOICE_BY_LANG[lang]) return EDGE_VOICE_BY_LANG[lang];
  const prefix = lang.split("-")[0]?.toLowerCase() ?? "en";
  const match = Object.entries(EDGE_VOICE_BY_LANG).find(([key]) => key.toLowerCase().startsWith(prefix));
  if (match) return match[1];
  return "en-US-JennyNeural";
}

/** Split long text into chunks safe for online TTS providers. */
export function splitTextForTts(text: string, maxChars = TTS_CHUNK_CHARS): string[] {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) return [];
  if (normalized.length <= maxChars) return [normalized];

  const chunks: string[] = [];
  let rest = normalized;
  while (rest.length > maxChars) {
    let splitAt = rest.lastIndexOf(" ", maxChars);
    if (splitAt < maxChars * 0.5) splitAt = maxChars;
    chunks.push(rest.slice(0, splitAt).trim());
    rest = rest.slice(splitAt).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

export function langToTranslateCode(lang: string): string {
  const code = lang.split("-")[0]?.toLowerCase();
  return code || "en";
}
