import { RCODE_LABEL, RECORD_TYPE_IDS, TYPE_NUMBER_TO_NAME, type DnsQueryType, type DnsRecord } from "./types";
import { stripQuotes, trimDot } from "./validate";

export function parseMx(data: string) {
  const match = data.trim().match(/^(\d+)\s+(\S+)/);
  if (!match) return { value: trimDot(data), priority: null as number | null, extra: null as string | null };
  return { value: trimDot(match[2]!), priority: Number(match[1]), extra: `Priority ${match[1]}` };
}

export function parseSrv(data: string) {
  const match = data.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(\S+)/);
  if (!match) return { value: trimDot(data), priority: null as number | null, extra: null as string | null };
  return {
    value: trimDot(match[4]!),
    priority: Number(match[1]),
    extra: `Weight ${match[2]} · port ${match[3]}`,
  };
}

export function parseSoa(data: string) {
  const parts = data.trim().split(/\s+/);
  if (parts.length < 7) return { value: trimDot(parts[0] ?? data), priority: null, extra: null as string | null };
  const [mname, rname, serial, refresh, retry, expire, minimum] = parts;
  return {
    value: trimDot(mname!),
    priority: null as number | null,
    extra: `Hostmaster ${trimDot(rname!)} · serial ${serial} · refresh ${refresh} · retry ${retry} · expire ${expire} · minimum ${minimum}`,
  };
}

export function parseCaa(data: string) {
  const match = data.trim().match(/^(\d+)\s+(\S+)\s+(.+)$/);
  if (!match) return { value: stripQuotes(data), priority: Number.isFinite(Number(data.split(/\s+/)[0])) ? Number(data.split(/\s+/)[0]) : null, extra: null as string | null };
  return {
    value: stripQuotes(match[3]!),
    priority: Number(match[1]),
    extra: `Tag ${match[2]}`,
  };
}

export function parseTxt(data: string) {
  const chunks = [...data.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((match) => match[1]!.replace(/\\"/g, '"'));
  const value = chunks.length ? chunks.join("") : stripQuotes(data);
  return { value, priority: null as number | null, extra: chunks.length > 1 ? `${chunks.length} chunks` : null };
}

export function decodeRdata(typeName: string, data: string) {
  switch (typeName) {
    case "MX":
      return parseMx(data);
    case "SRV":
      return parseSrv(data);
    case "SOA":
      return parseSoa(data);
    case "CAA":
      return parseCaa(data);
    case "TXT":
      return parseTxt(data);
    default:
      return { value: trimDot(data), priority: null as number | null, extra: null as string | null };
  }
}

export function formatTtl(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const minutes = Math.round(seconds / 60);
    return `${seconds}s (${minutes}m)`;
  }
  const hours = seconds / 3600;
  return `${seconds}s (${hours >= 10 ? Math.round(hours) : hours.toFixed(1)}h)`;
}

export function rcodeInfo(status: unknown) {
  const code = typeof status === "number" ? status : Number(status);
  const known = Number.isFinite(code) ? RCODE_LABEL[code] : undefined;
  return {
    rcode: Number.isFinite(code) ? code : -1,
    status: known?.id ?? "UNKNOWN",
    statusLabel: known?.label ?? "The resolver returned an unexpected status.",
  };
}

function asRecord(row: unknown): DnsRecord | null {
  if (!row || typeof row !== "object") return null;
  const item = row as Record<string, unknown>;
  const typeNumber = typeof item.type === "number" ? item.type : Number(item.type);
  const typeName = TYPE_NUMBER_TO_NAME[typeNumber] ?? (typeof item.type === "string" ? item.type : `TYPE${typeNumber}`);
  const data = typeof item.data === "string" ? item.data : "";
  if (!data) return null;
  const decoded = decodeRdata(typeName, data);
  const ttl = typeof item.TTL === "number" ? item.TTL : Number(item.ttl);
  return {
    name: trimDot(typeof item.name === "string" ? item.name : ""),
    type: typeName,
    ttl: Number.isFinite(ttl) ? ttl : 0,
    value: decoded.value,
    priority: decoded.priority,
    extra: decoded.extra,
  };
}

export function parseDnsJson(json: unknown, name: string, queryType: DnsQueryType, provider: string, durationMs: number) {
  if (!json || typeof json !== "object") return null;
  const data = json as Record<string, unknown>;
  const info = rcodeInfo(data.Status ?? data.rcode);
  const answers = Array.isArray(data.Answer) ? data.Answer : [];
  const records = answers.map(asRecord).filter((row): row is DnsRecord => Boolean(row));
  return {
    name,
    queryType,
    ...info,
    durationMs,
    provider,
    records,
  };
}

export type SortKey = "name" | "type" | "value" | "priority" | "ttl";

export function sortRecords(records: DnsRecord[], key: SortKey, dir: "asc" | "desc") {
  const sign = dir === "asc" ? 1 : -1;
  return [...records].sort((a, b) => {
    const av = key === "priority" || key === "ttl" ? (a[key] ?? -1) : a[key];
    const bv = key === "priority" || key === "ttl" ? (b[key] ?? -1) : b[key];
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * sign;
    return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" }) * sign;
  });
}

export function resultCopyText(input: {
  name: string;
  queryType: string;
  status: string;
  durationMs: number;
  provider: string;
  records: DnsRecord[];
}) {
  const header = `; ${input.name} ${input.queryType} via ${input.provider} (${input.durationMs} ms) ${input.status}`;
  if (!input.records.length) return `${header}\n; no records`;
  const rows = input.records.map((record) => {
    const bits = [record.name, String(record.ttl), "IN", record.type];
    if (record.priority != null && (record.type === "MX" || record.type === "SRV" || record.type === "CAA")) {
      bits.push(String(record.priority));
    }
    bits.push(record.value);
    if (record.extra) bits.push(`; ${record.extra}`);
    return bits.join("\t");
  });
  return [header, ...rows].join("\n");
}

export function isRecordType(value: string): value is DnsQueryType {
  return value === "ALL" || (RECORD_TYPE_IDS as readonly string[]).includes(value);
}
