import { DnsLookupError, lookupDns } from "@/lib/dns-lookup/api";
import { isRecordType } from "@/lib/dns-lookup/parse";
import { normalizeLookupName } from "@/lib/dns-lookup/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") ?? "";
  const type = (searchParams.get("type") ?? "A").toUpperCase();

  const parsed = normalizeLookupName(name);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }
  if (!isRecordType(type)) {
    return Response.json({ error: "Unsupported DNS record type." }, { status: 400 });
  }

  try {
    const result = await lookupDns(parsed.name, type, request.signal);
    return Response.json(result);
  } catch (error) {
    if (error instanceof DnsLookupError) {
      return Response.json(
        { error: error.message, timedOut: error.timedOut },
        { status: error.timedOut ? 504 : error.status === 400 ? 400 : 502 },
      );
    }
    return Response.json({ error: "Could not complete the DNS lookup." }, { status: 502 });
  }
}
