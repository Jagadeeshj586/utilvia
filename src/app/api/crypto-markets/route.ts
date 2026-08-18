import { MarketLookupError, fetchMarkets, serializeSnapshot } from "@/lib/crypto-markets/api";
import { isFiatCode } from "@/lib/crypto-markets/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vs = (searchParams.get("vs") ?? "usd").toLowerCase();
  if (!isFiatCode(vs)) {
    return Response.json({ error: "Unsupported quote currency." }, { status: 400 });
  }

  try {
    const snapshot = await fetchMarkets(vs, request.signal, searchParams.get("refresh") === "1");
    const body = serializeSnapshot(snapshot);
    return Response.json(body, snapshot.stale ? { headers: { "X-Market-Stale": "1" } } : undefined);
  } catch (error) {
    const status = error instanceof MarketLookupError ? error.status : 502;
    const headers: HeadersInit = {};
    if (error instanceof MarketLookupError && error.status === 429 && error.retryAfterMs) {
      headers["Retry-After"] = String(Math.ceil(error.retryAfterMs / 1000));
    }
    return Response.json(
      { error: status === 429 ? "Market data is rate-limited right now." : "Could not load market data." },
      { status: status === 429 ? 429 : 502, headers },
    );
  }
}
