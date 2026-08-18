import { langToTranslateCode, splitTextForTts, TTS_MAX_CHARS } from "@/lib/text-to-speech/speech";

export const runtime = "nodejs";
export const maxDuration = 60;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchTtsChunk(text: string, lang: string): Promise<ArrayBuffer> {
  const tl = langToTranslateCode(lang);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(text)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Referer: "https://translate.google.com/",
    },
  });
  if (!response.ok) {
    throw new Error(`TTS provider returned ${response.status}`);
  }
  return response.arrayBuffer();
}

export async function POST(request: Request) {
  let body: { text?: string; lang?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) {
    return Response.json({ error: "Enter some text to convert." }, { status: 400 });
  }
  if (text.length > TTS_MAX_CHARS) {
    return Response.json({ error: `Text must be ${TTS_MAX_CHARS} characters or fewer.` }, { status: 400 });
  }

  const lang = body.lang ?? "en-US";

  try {
    const chunks = splitTextForTts(text);
    const parts: Uint8Array[] = [];
    for (const chunk of chunks) {
      const buffer = await fetchTtsChunk(chunk, lang);
      parts.push(new Uint8Array(buffer));
    }

    const total = parts.reduce((sum, part) => sum + part.length, 0);
    const merged = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
      merged.set(part, offset);
      offset += part.length;
    }

    return new Response(merged, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="speech.mp3"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ error: "Could not generate audio. Try again shortly." }, { status: 502 });
  }
}
