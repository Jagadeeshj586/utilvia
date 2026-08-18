export const RECORD_TYPE_IDS = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA", "PTR", "SRV", "CAA"] as const;

export type DnsRecordType = (typeof RECORD_TYPE_IDS)[number];
export type DnsQueryType = DnsRecordType | "ALL";

export const RECORD_TYPES: Array<{ id: DnsQueryType; typeNumber: number; label: string; hint: string }> = [
  { id: "A", typeNumber: 1, label: "A", hint: "IPv4 address" },
  { id: "AAAA", typeNumber: 28, label: "AAAA", hint: "IPv6 address" },
  { id: "CNAME", typeNumber: 5, label: "CNAME", hint: "Canonical name" },
  { id: "MX", typeNumber: 15, label: "MX", hint: "Mail exchanger" },
  { id: "NS", typeNumber: 2, label: "NS", hint: "Name server" },
  { id: "TXT", typeNumber: 16, label: "TXT", hint: "Text record" },
  { id: "SOA", typeNumber: 6, label: "SOA", hint: "Start of authority" },
  { id: "PTR", typeNumber: 12, label: "PTR", hint: "Reverse lookup" },
  { id: "SRV", typeNumber: 33, label: "SRV", hint: "Service locator" },
  { id: "CAA", typeNumber: 257, label: "CAA", hint: "Certification authority" },
  { id: "ALL", typeNumber: 0, label: "All records", hint: "Every supported type" },
];

export const TYPE_NUMBER_TO_NAME: Record<number, DnsRecordType> = {
  1: "A",
  2: "NS",
  5: "CNAME",
  6: "SOA",
  12: "PTR",
  15: "MX",
  16: "TXT",
  28: "AAAA",
  33: "SRV",
  257: "CAA",
};

export const RCODE_LABEL: Record<number, { id: string; label: string }> = {
  0: { id: "NOERROR", label: "Success" },
  1: { id: "FORMERR", label: "The resolver rejected this query." },
  2: { id: "SERVFAIL", label: "The resolver failed to answer." },
  3: { id: "NXDOMAIN", label: "This name does not exist." },
  4: { id: "NOTIMP", label: "This record type is not implemented." },
  5: { id: "REFUSED", label: "The resolver refused this query." },
};

export type DnsRecord = {
  name: string;
  type: string;
  ttl: number;
  value: string;
  priority: number | null;
  extra: string | null;
};

export type DnsLookupResult = {
  name: string;
  queryType: DnsQueryType;
  status: string;
  statusLabel: string;
  rcode: number;
  durationMs: number;
  provider: string;
  records: DnsRecord[];
  timedOut?: boolean;
  error?: string;
};

export const DEFAULT_DNS_NAME = "example.com";
export const DEFAULT_DNS_TYPE: DnsQueryType = "A";
