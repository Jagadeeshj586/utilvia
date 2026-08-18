export { RECORD_TYPES, RECORD_TYPE_IDS, DEFAULT_DNS_NAME, DEFAULT_DNS_TYPE } from "./types";
export type { DnsQueryType, DnsRecord, DnsLookupResult } from "./types";
export { normalizeLookupName, validateLookupDraft, ipv4ToPtr, ipv6ToPtr, expandIpv6 } from "./validate";
export {
  parseDnsJson,
  parseMx,
  parseSrv,
  parseSoa,
  parseCaa,
  parseTxt,
  formatTtl,
  sortRecords,
  resultCopyText,
  isRecordType,
  type SortKey,
} from "./parse";
export { DNS_LOOKUP_API, runLookup, lookupErrorMessage, DnsLookupError } from "./api";

export const DNS_LOOKUP_FAQS = [
  {
    question: "Which DNS record types can I look up?",
    answer:
      "A, AAAA, CNAME, MX, NS, TXT, SOA, PTR, SRV, and CAA. Choose All records to query every supported type in one pass.",
  },
  {
    question: "How does the lookup work?",
    answer:
      "The hostname is sent to a DNS-over-HTTPS resolver (Cloudflare, with Google Public DNS as fallback). The browser never talks to the resolver directly, and no API keys are shipped to the client.",
  },
  {
    question: "Can I reverse-lookup an IP address?",
    answer:
      "Yes. Paste an IPv4 or IPv6 address and choose PTR (or All records). The tool converts it to an in-addr.arpa or ip6.arpa name first.",
  },
  {
    question: "Why are there no records for a type?",
    answer:
      "The name may exist but have no records of that type (NODATA), or the name may not exist (NXDOMAIN). The status line tells you which.",
  },
  {
    question: "Is this the same as dig on my computer?",
    answer:
      "It is a public resolver’s view of the records, not your ISP’s recursive cache. TTLs and answers can differ slightly from a local dig.",
  },
] as const;
