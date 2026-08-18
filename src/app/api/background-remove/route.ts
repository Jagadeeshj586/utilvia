import { MAX_FILE_BYTES } from "@/lib/image/background-removal/config";

export const runtime = "nodejs";
export const maxDuration = 60;

type CloudProvider = "clipdrop" | "removebg";

function configuredProvider(): CloudProvider | null {
  const explicit = (process.env.BACKGROUND_REMOVAL_PROVIDER ?? "").toLowerCase();
  if (explicit === "clipdrop" || explicit === "removebg") return explicit;
  if (!process.env.BACKGROUND_REMOVAL_API_KEY) return null;
  if (explicit === "auto" || explicit === "imgly" || !explicit) return "clipdrop";
  return null;
}

function json(status: number, body: unknown) {
  return Response.json(body, { status });
}

export async function GET() {
  const provider = configuredProvider();
  return json(200, {
    available: Boolean(provider && process.env.BACKGROUND_REMOVAL_API_KEY),
    provider: provider && process.env.BACKGROUND_REMOVAL_API_KEY ? provider : null,
  });
}

export async function POST(request: Request) {
  const provider = configuredProvider();
  const apiKey = process.env.BACKGROUND_REMOVAL_API_KEY;
  if (!provider || !apiKey) {
    return json(501, { error: "Cloud background removal is not configured." });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, { error: "Invalid upload." });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return json(400, { error: "Missing image file." });
  }
  if (file.size > MAX_FILE_BYTES) {
    return json(413, { error: "Image exceeds 20 MB." });
  }

  try {
    const result =
      provider === "removebg" ? await removeWithRemoveBg(file, apiKey) : await removeWithClipdrop(file, apiKey);
    return new Response(result, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
        "X-Bg-Provider": provider,
      },
    });
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? Number((error as { status: number }).status) : 502;
    if (status === 429) return json(429, { error: "Rate limited." });
    return json(status >= 400 && status < 600 ? status : 502, { error: "Background removal failed." });
  }
}

async function removeWithClipdrop(file: File, apiKey: string) {
  const body = new FormData();
  body.set("image_file", file, file.name || "image.png");
  const response = await fetch("https://clipdrop-api.co/remove-background/v1", {
    method: "POST",
    headers: { "x-api-key": apiKey },
    body,
  });
  if (!response.ok) {
    const err = new Error("Clipdrop failed") as Error & { status: number };
    err.status = response.status;
    throw err;
  }
  return response.arrayBuffer();
}

async function removeWithRemoveBg(file: File, apiKey: string) {
  const body = new FormData();
  body.set("image_file", file, file.name || "image.png");
  body.set("size", "auto");
  body.set("format", "png");
  body.set("type", "auto");
  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": apiKey },
    body,
  });
  if (!response.ok) {
    const err = new Error("remove.bg failed") as Error & { status: number };
    err.status = response.status;
    throw err;
  }
  return response.arrayBuffer();
}
