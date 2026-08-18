export type IpLookupMode = "mine" | "any";

export type IpGeoResult = {
  ip: string;
  country: string;
  region: string;
  city: string;
  isp: string;
  org: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  coordinates: string;
  provider: string;
};

export const IP_LOOKUP_API = {
  ipifyUrl: "https://api.ipify.org?format=json",
  timeoutMs: 8_000,
  examples: ["8.8.8.8", "1.1.1.1", "9.9.9.9"],
} as const;

const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

function octet(ip: string, index: number) {
  return Number(ip.split(".")[index]);
}

export function isIpv4(raw: string) {
  return IPV4.test(raw.trim());
}

export function isPrivateOrReservedIpv4(ip: string) {
  if (!isIpv4(ip)) return false;
  const a = octet(ip, 0);
  const b = octet(ip, 1);
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true;
  return false;
}

export function normalizeIpv4(raw: string): { ok: true; ip: string } | { ok: false; error: string } {
  const value = raw.trim();
  if (!value) return { ok: false, error: "Enter an IPv4 address, such as 8.8.8.8." };
  if (value.includes(":")) return { ok: false, error: "This tool looks up IPv4 addresses only." };
  if (!isIpv4(value)) return { ok: false, error: "Enter a valid IPv4 address, such as 8.8.8.8." };
  if (isPrivateOrReservedIpv4(value)) {
    return { ok: false, error: "This is a private or reserved address. Enter a public IPv4 address." };
  }
  return { ok: true, ip: value };
}

export function formatCoordinates(lat: number | null, lon: number | null) {
  if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) return "—";
  const trim = (value: number) => value.toFixed(4).replace(/\.?0+$/, "");
  return `${trim(lat)}, ${trim(lon)}`;
}

function str(value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim();
  return "";
}

function num(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function dash(value: string) {
  return value || "—";
}

export function parseIpApi(json: unknown): IpGeoResult | null {
  if (!json || typeof json !== "object") return null;
  const data = json as Record<string, unknown>;
  if (data.status !== "success") return null;
  const ip = str(data.query);
  if (!ip) return null;
  const latitude = num(data.lat);
  const longitude = num(data.lon);
  return {
    ip,
    country: dash(str(data.country)),
    region: dash(str(data.regionName)),
    city: dash(str(data.city)),
    isp: dash(str(data.isp)),
    org: dash(str(data.org)),
    timezone: dash(str(data.timezone)),
    latitude,
    longitude,
    coordinates: formatCoordinates(latitude, longitude),
    provider: "ip-api",
  };
}

export function parseIpWho(json: unknown): IpGeoResult | null {
  if (!json || typeof json !== "object") return null;
  const data = json as Record<string, unknown>;
  if (data.success === false) return null;
  const ip = str(data.ip);
  if (!ip) return null;
  const connection = data.connection && typeof data.connection === "object" ? (data.connection as Record<string, unknown>) : {};
  const timezone =
    data.timezone && typeof data.timezone === "object" ? (data.timezone as Record<string, unknown>) : {};
  const latitude = num(data.latitude);
  const longitude = num(data.longitude);
  return {
    ip,
    country: dash(str(data.country)),
    region: dash(str(data.region)),
    city: dash(str(data.city)),
    isp: dash(str(connection.isp)),
    org: dash(str(connection.org)),
    timezone: dash(str(timezone.id)),
    latitude,
    longitude,
    coordinates: formatCoordinates(latitude, longitude),
    provider: "ipwho.is",
  };
}

export function ipLookupCopyText(result: IpGeoResult) {
  return [
    `IP address: ${result.ip}`,
    `Country: ${result.country}`,
    `Region / State: ${result.region}`,
    `City: ${result.city}`,
    `ISP: ${result.isp}`,
    `Organization: ${result.org}`,
    `Timezone: ${result.timezone}`,
    `Coordinates: ${result.coordinates}`,
  ].join("\n");
}

export class IpLookupError extends Error {
  status: number;
  timedOut: boolean;

  constructor(message: string, status = 502, timedOut = false) {
    super(message);
    this.name = "IpLookupError";
    this.status = status;
    this.timedOut = timedOut;
  }
}

function isAbortError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

async function fetchJson(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<unknown>;
}

export async function lookupIpGeo(ip: string, signal: AbortSignal): Promise<IpGeoResult> {
  const parsed = normalizeIpv4(ip);
  if (!parsed.ok) throw new IpLookupError(parsed.error, 400);

  const started = Date.now();
  try {
    const who = await fetchJson(`https://ipwho.is/${encodeURIComponent(parsed.ip)}`, signal);
    const result = parseIpWho(who);
    if (result) return result;
  } catch (error) {
    if (isAbortError(error) || Date.now() - started > IP_LOOKUP_API.timeoutMs) {
      throw new IpLookupError("The lookup timed out. Try again.", 504, true);
    }
  }

  try {
    const api = await fetchJson(
      `http://ip-api.com/json/${encodeURIComponent(parsed.ip)}?fields=status,message,query,country,regionName,city,isp,org,timezone,lat,lon`,
      signal,
    );
    const result = parseIpApi(api);
    if (result) return result;
  } catch (error) {
    if (isAbortError(error)) throw new IpLookupError("The lookup timed out. Try again.", 504, true);
  }

  throw new IpLookupError("Could not geolocate that IP address.", 502);
}

export function ipLookupErrorMessage(error: unknown) {
  if (error instanceof IpLookupError) return error.message;
  if (isAbortError(error)) return null;
  if (error instanceof Error && error.message) return error.message;
  return "Could not complete the IP lookup.";
}

export const IP_LOOKUP_FAQS = [
  {
    question: "How accurate is IP geolocation?",
    answer:
      "IP geolocation is approximate — typically accurate to country level and often to city level, but not to exact street address. The location shown is based on where your ISP registered the IP block, which may differ from your actual physical location.",
  },
  {
    question: "Why does my IP show a different city than where I am?",
    answer:
      "IP addresses are assigned in blocks to ISPs, and the registered location of that block may be a different city than where you're physically located — especially if your ISP routes traffic through a regional hub.",
  },
  {
    question: "What's the difference between a public and private IP address?",
    answer:
      "Your public IP is visible to the internet and assigned by your ISP. Private IP addresses (like 192.168.x.x) are used within your local network and not visible externally — this tool shows public IPs only.",
  },
  {
    question: "Can I look up my phone's IP address?",
    answer:
      "Yes — visiting this tool on your phone will show your phone's current public IP (assigned by your mobile carrier or WiFi network).",
  },
  {
    question: "Is IP address lookup free?",
    answer: "Yes. It runs in your browser with no signup. Only the IP you look up is sent to the geolocation provider.",
  },
];
