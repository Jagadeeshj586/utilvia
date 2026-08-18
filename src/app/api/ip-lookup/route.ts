import { IpLookupError, lookupIpGeo, normalizeIpv4 } from "@/lib/ip-lookup/lookup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get("ip") ?? "";
  const parsed = normalizeIpv4(ip);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  const onAbort = () => controller.abort();
  request.signal.addEventListener("abort", onAbort);

  try {
    const result = await lookupIpGeo(parsed.ip, controller.signal);
    return Response.json(result);
  } catch (error) {
    if (error instanceof IpLookupError) {
      return Response.json(
        { error: error.message, timedOut: error.timedOut },
        { status: error.timedOut ? 504 : error.status },
      );
    }
    return Response.json({ error: "Could not complete the IP lookup." }, { status: 502 });
  } finally {
    clearTimeout(timer);
    request.signal.removeEventListener("abort", onAbort);
  }
}
