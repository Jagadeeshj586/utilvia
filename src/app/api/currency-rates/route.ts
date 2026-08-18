import { fetchRates } from "@/lib/currency/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = (searchParams.get("base") ?? "USD").toUpperCase();
  if (!/^[A-Z]{3}$/.test(base)) {
    return Response.json({ error: "Invalid currency code." }, { status: 400 });
  }

  try {
    const quote = await fetchRates(base, request.signal, searchParams.get("refresh") === "1");
    return Response.json({
      base: quote.base,
      rates: quote.rates,
      updatedAt: quote.updatedAt?.toISOString() ?? null,
      provider: quote.provider,
    });
  } catch {
    return Response.json({ error: "Could not load exchange rates." }, { status: 502 });
  }
}
