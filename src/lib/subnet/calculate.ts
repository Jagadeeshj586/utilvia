export type SubnetResult = {
  cidr: string;
  ip: string;
  prefix: number;
  network: string;
  broadcast: string;
  subnetMask: string;
  wildcardMask: string;
  totalHosts: number;
  usableHosts: number;
  firstUsable: string;
  lastUsable: string;
  networkBinary: string;
  maskBinary: string;
};

export type SubnetParseResult = { ok: true; value: SubnetResult } | { ok: false; error: string };

export type MaskParseResult = { ok: true; prefix: number; mask: string } | { ok: false; error: string };

export const DEFAULT_CIDR = "192.168.1.0/24";

export const CIDR_PRESETS = [
  { label: "192.168.1.0/24", value: "192.168.1.0/24" },
  { label: "10.0.0.0/8", value: "10.0.0.0/8" },
  { label: "172.16.0.0/12", value: "172.16.0.0/12" },
  { label: "192.168.0.0/16", value: "192.168.0.0/16" },
] as const;

export const QUICK_REFERENCE_PREFIXES = [24, 25, 26, 27, 28, 30] as const;

export const SUBNET_FAQS = [
  {
    question: "What does /24 mean in an IP address like 192.168.1.0/24?",
    answer:
      "The /24 is the CIDR prefix: the first 24 bits are the network, and the remaining 8 bits are hosts. That is a 255.255.255.0 mask with 256 addresses and 254 usable hosts.",
  },
  {
    question: "Why are 2 addresses subtracted from the total to get usable hosts?",
    answer:
      "In typical IPv4 subnets the first address is the network and the last is the broadcast. /31 (point-to-point) and /32 (single host) do not reserve those two addresses the same way.",
  },
  {
    question: "What's the difference between a subnet mask and a CIDR prefix?",
    answer:
      "They describe the same split. A prefix like /24 is the count of network bits. The dotted mask 255.255.255.0 is the same bits written as four octets.",
  },
  {
    question: "Which CIDR prefix should I use for a small office network?",
    answer:
      "A /24 (254 usable hosts) is a common default. Use /25–/28 for smaller LAN segments, or /30 for a point-to-point link.",
  },
  {
    question: "Is this calculator free?",
    answer: "Yes. It runs in your browser with no signup. Nothing is uploaded.",
  },
] as const;

export function intToIp(value: number) {
  const n = value >>> 0;
  return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

export function intToBinary(value: number) {
  const n = value >>> 0;
  return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]
    .map((octet) => octet.toString(2).padStart(8, "0"))
    .join(".");
}

export function parseIpv4(input: string): number | null {
  const parts = input.trim().split(".");
  if (parts.length !== 4) return null;
  const octets = parts.map(Number);
  if (octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return null;
  return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

export function prefixToMask(prefix: number) {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null;
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

export function isContiguousMask(mask: number) {
  const bits = (mask >>> 0).toString(2).padStart(32, "0");
  return /^1*0*$/.test(bits);
}

export function maskToPrefix(mask: string): MaskParseResult {
  const value = parseIpv4(mask);
  if (value == null) return { ok: false, error: "Enter a dotted mask like 255.255.255.0." };
  if (!isContiguousMask(value)) {
    return { ok: false, error: "Mask bits must be contiguous ones followed by zeros." };
  }
  const bits = (value >>> 0).toString(2).padStart(32, "0");
  const prefix = bits.replace(/0+$/, "").length;
  return { ok: true, prefix, mask: intToIp(value) };
}

export function hostCounts(prefix: number) {
  const total = 2 ** (32 - prefix);
  if (prefix === 32) return { total: 1, usable: 1 };
  if (prefix === 31) return { total: 2, usable: 2 };
  return { total, usable: total - 2 };
}

export function parseCidr(input: string): SubnetParseResult {
  const trimmed = input.trim().replace(/\s+/g, "");
  const slash = trimmed.indexOf("/");
  if (slash === -1) return { ok: false, error: "Use CIDR notation like 192.168.1.0/24." };
  const ipText = trimmed.slice(0, slash);
  const prefixRaw = trimmed.slice(slash + 1);
  const ip = parseIpv4(ipText);
  const prefix = Number(prefixRaw);
  if (ip == null) return { ok: false, error: "Enter a valid IPv4 address before the slash." };
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return { ok: false, error: "Prefix must be an integer from 0 to 32." };
  }

  const mask = prefixToMask(prefix)!;
  const wildcard = ~mask >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const { total, usable } = hostCounts(prefix);
  const first = prefix >= 31 ? network : (network + 1) >>> 0;
  const last = prefix >= 31 ? broadcast : (broadcast - 1) >>> 0;

  return {
    ok: true,
    value: {
      cidr: `${intToIp(network)}/${prefix}`,
      ip: intToIp(ip),
      prefix,
      network: intToIp(network),
      broadcast: intToIp(broadcast),
      subnetMask: intToIp(mask),
      wildcardMask: intToIp(wildcard),
      totalHosts: total,
      usableHosts: usable,
      firstUsable: intToIp(first),
      lastUsable: intToIp(last),
      networkBinary: intToBinary(network),
      maskBinary: intToBinary(mask),
    },
  };
}

export function ipInSubnet(ipText: string, cidr: string): { ok: true; inside: boolean } | { ok: false; error: string } {
  const parsed = parseCidr(cidr);
  if (!parsed.ok) return { ok: false, error: "Enter a valid CIDR first." };
  const ip = parseIpv4(ipText);
  if (ip == null) return { ok: false, error: "Enter a valid IPv4 address." };
  const mask = prefixToMask(parsed.value.prefix)!;
  const network = parseIpv4(parsed.value.network)!;
  return { ok: true, inside: ((ip & mask) >>> 0) === network };
}

export function applyPrefix(ipOrCidr: string, prefix: number) {
  const trimmed = ipOrCidr.trim();
  const ipText = trimmed.includes("/") ? trimmed.split("/")[0] : trimmed;
  return `${ipText}/${prefix}`;
}

export function referenceRow(prefix: number) {
  const mask = prefixToMask(prefix);
  const { total, usable } = hostCounts(prefix);
  return {
    prefix,
    subnetMask: mask == null ? "—" : intToIp(mask),
    totalHosts: total,
    usableHosts: usable,
  };
}

export function formatHostCount(value: number) {
  return value.toLocaleString("en-US");
}
