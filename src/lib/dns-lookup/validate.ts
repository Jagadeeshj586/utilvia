import { DEFAULT_DNS_NAME } from "./types";

const LABEL = /^(?:[\p{L}0-9_](?:[\p{L}0-9_-]{0,61}[\p{L}0-9_])?|\*)$/u;

export function trimDot(value: string) {
  return value.replace(/\.+$/, "");
}

export function stripQuotes(value: string) {
  return value.replace(/^"+|"+$/g, "").replace(/\\" /g, '"');
}

export function ipv4ToPtr(ip: string) {
  const parts = ip.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d+$/.test(part) || Number(part) > 255)) return null;
  return `${parts.reverse().join(".")}.in-addr.arpa`;
}

export function expandIpv6(ip: string) {
  const lower = ip.trim().toLowerCase();
  if (!lower.includes(":")) return null;
  const halves = lower.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":").filter(Boolean) : [];
  const right = halves[1] ? halves[1].split(":").filter(Boolean) : [];
  if (left.concat(right).some((block) => !/^[0-9a-f]{1,4}$/.test(block))) return null;
  const missing = 8 - left.length - right.length;
  if (missing < 0 || (halves.length === 1 && missing !== 0)) return null;
  const full = [...left, ...Array.from({ length: missing }, () => "0"), ...right];
  if (full.length !== 8) return null;
  return full.map((block) => block.padStart(4, "0")).join("");
}

export function ipv6ToPtr(ip: string) {
  const hex = expandIpv6(ip);
  if (!hex) return null;
  return `${hex.split("").reverse().join(".")}.ip6.arpa`;
}

function stripUrlish(raw: string) {
  let value = raw.trim();
  if (!value) return "";
  value = value.replace(/^\s*https?:\/\//i, "");
  const slash = value.search(/[/?#]/);
  if (slash >= 0) value = value.slice(0, slash);
  const colon = value.lastIndexOf(":");
  if (colon > -1 && /^\d+$/.test(value.slice(colon + 1))) value = value.slice(0, colon);
  return trimDot(value).toLowerCase();
}

export function normalizeLookupName(raw: string): { ok: true; name: string } | { ok: false; error: string } {
  const stripped = stripUrlish(raw);
  if (!stripped) return { ok: false, error: "Enter a domain name or hostname." };
  if (stripped.length > 253) return { ok: false, error: "This name is too long." };
  if (/[\s,;]/.test(stripped)) return { ok: false, error: "Remove spaces and commas from the name." };

  const v4 = ipv4ToPtr(stripped);
  if (v4) return { ok: true, name: v4 };
  const v6 = ipv6ToPtr(stripped);
  if (v6) return { ok: true, name: v6 };

  const labels = stripped.split(".");
  if (!labels.length || labels.some((label) => !label)) {
    return { ok: false, error: "Enter a valid domain, such as example.com." };
  }
  if (labels.some((label) => label.length > 63 || !LABEL.test(label))) {
    return { ok: false, error: "Each label must use letters, numbers, hyphens, or underscores." };
  }
  return { ok: true, name: stripped };
}

export function validateLookupDraft(raw: string) {
  if (!raw.trim()) return "Enter a domain name or hostname.";
  const parsed = normalizeLookupName(raw);
  return parsed.ok ? null : parsed.error;
}

export function defaultLookupName() {
  return DEFAULT_DNS_NAME;
}
