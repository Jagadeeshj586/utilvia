import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  expandIpv6,
  formatTtl,
  ipv4ToPtr,
  ipv6ToPtr,
  isRecordType,
  normalizeLookupName,
  parseCaa,
  parseDnsJson,
  parseMx,
  parseSoa,
  parseSrv,
  parseTxt,
  resultCopyText,
  sortRecords,
  validateLookupDraft,
} from "./index";

describe("normalizeLookupName", () => {
  it("accepts domains and strips URLs", () => {
    assert.equal(normalizeLookupName("Example.COM.").ok && (normalizeLookupName("Example.COM.") as { name: string }).name, "example.com");
    const url = normalizeLookupName("https://www.example.com/path?q=1");
    assert.equal(url.ok && url.name, "www.example.com");
    assert.equal(validateLookupDraft(""), "Enter a domain name or hostname.");
    assert.ok(validateLookupDraft("not a domain"));
  });

  it("converts IPv4 and IPv6 to PTR names", () => {
    assert.equal(ipv4ToPtr("8.8.8.8"), "8.8.8.8.in-addr.arpa");
    const ptr = normalizeLookupName("1.1.1.1");
    assert.equal(ptr.ok && ptr.name, "1.1.1.1.in-addr.arpa");
    assert.equal(expandIpv6("::1"), "00000000000000000000000000000001");
    assert.ok(ipv6ToPtr("2001:db8::1")?.endsWith(".ip6.arpa"));
  });

  it("allows SRV-style underscore labels", () => {
    const parsed = normalizeLookupName("_sip._tcp.example.com");
    assert.equal(parsed.ok && parsed.name, "_sip._tcp.example.com");
  });
});

describe("rdata parsers", () => {
  it("parses MX, SRV, SOA, CAA, and TXT", () => {
    assert.deepEqual(parseMx("10 mail.example.com."), { value: "mail.example.com", priority: 10, extra: "Priority 10" });
    const srv = parseSrv("10 20 443 sip.example.com.");
    assert.equal(srv.value, "sip.example.com");
    assert.equal(srv.priority, 10);
    assert.match(srv.extra ?? "", /port 443/);
    const soa = parseSoa("ns.example.com. admin.example.com. 2026010101 7200 3600 1209600 3600");
    assert.equal(soa.value, "ns.example.com");
    assert.match(soa.extra ?? "", /serial 2026010101/);
    const caa = parseCaa('0 issue "letsencrypt.org"');
    assert.equal(caa.value, "letsencrypt.org");
    assert.equal(caa.extra, "Tag issue");
    assert.equal(parseTxt('"hello" " world"').value, "hello world");
  });
});

describe("parseDnsJson", () => {
  it("maps Cloudflare-style answers", () => {
    const result = parseDnsJson(
      {
        Status: 0,
        Answer: [{ name: "example.com.", type: 1, TTL: 300, data: "93.184.216.34" }],
      },
      "example.com",
      "A",
      "Cloudflare",
      12,
    );
    assert.ok(result);
    assert.equal(result?.status, "NOERROR");
    assert.equal(result?.records[0]?.value, "93.184.216.34");
    assert.equal(result?.records[0]?.ttl, 300);
  });

  it("labels NXDOMAIN", () => {
    const result = parseDnsJson({ Status: 3, Answer: [] }, "missing.test", "A", "Cloudflare", 8);
    assert.equal(result?.status, "NXDOMAIN");
    assert.equal(result?.records.length, 0);
  });
});

describe("formatting", () => {
  it("formats TTL, sorts, and copies", () => {
    assert.equal(formatTtl(45), "45s");
    assert.match(formatTtl(300), /5m/);
    assert.ok(isRecordType("MX"));
    assert.ok(isRecordType("ALL"));
    assert.equal(isRecordType("FOO"), false);
    const sorted = sortRecords(
      [
        { name: "b.example", type: "A", ttl: 30, value: "2", priority: null, extra: null },
        { name: "a.example", type: "A", ttl: 10, value: "1", priority: null, extra: null },
      ],
      "name",
      "asc",
    );
    assert.equal(sorted[0]?.name, "a.example");
    const text = resultCopyText({
      name: "example.com",
      queryType: "A",
      status: "NOERROR",
      durationMs: 12,
      provider: "Cloudflare",
      records: [{ name: "example.com", type: "A", ttl: 300, value: "1.2.3.4", priority: null, extra: null }],
    });
    assert.match(text, /example.com A via Cloudflare/);
    assert.match(text, /1\.2\.3\.4/);
  });
});
