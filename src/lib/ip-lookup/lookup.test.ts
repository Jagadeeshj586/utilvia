import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatCoordinates,
  ipLookupCopyText,
  isPrivateOrReservedIpv4,
  normalizeIpv4,
  parseIpApi,
  parseIpWho,
} from "./lookup";

describe("IP lookup", () => {
  it("accepts public IPv4 and rejects private, reserved, and IPv6", () => {
    assert.equal(normalizeIpv4("8.8.8.8").ok && (normalizeIpv4("8.8.8.8") as { ip: string }).ip, "8.8.8.8");
    assert.equal(normalizeIpv4("").ok, false);
    assert.equal(normalizeIpv4("999.1.1.1").ok, false);
    assert.equal(normalizeIpv4("192.168.1.1").ok, false);
    assert.equal(normalizeIpv4("10.0.0.1").ok, false);
    assert.equal(normalizeIpv4("127.0.0.1").ok, false);
    assert.equal(normalizeIpv4("2001:4860:4860::8888").ok, false);
    assert.equal(isPrivateOrReservedIpv4("172.16.0.1"), true);
    assert.equal(isPrivateOrReservedIpv4("1.1.1.1"), false);
  });

  it("parses ip-api and ipwho.is payloads into the WorkUtilities fields", () => {
    const api = parseIpApi({
      status: "success",
      query: "8.8.8.8",
      country: "United States",
      regionName: "Virginia",
      city: "Ashburn",
      isp: "Google LLC",
      org: "Google Public DNS",
      timezone: "America/New_York",
      lat: 39.03,
      lon: -77.5,
    });
    assert.ok(api);
    assert.equal(api.ip, "8.8.8.8");
    assert.equal(api.country, "United States");
    assert.equal(api.region, "Virginia");
    assert.equal(api.city, "Ashburn");
    assert.equal(api.isp, "Google LLC");
    assert.equal(api.org, "Google Public DNS");
    assert.equal(api.timezone, "America/New_York");
    assert.equal(api.coordinates, "39.03, -77.5");
    assert.match(ipLookupCopyText(api), /IP address: 8\.8\.8\.8/);

    const who = parseIpWho({
      success: true,
      ip: "1.1.1.1",
      country: "Australia",
      region: "Queensland",
      city: "South Brisbane",
      latitude: -27.4766,
      longitude: 153.0166,
      connection: { isp: "Cloudflare", org: "APNIC" },
      timezone: { id: "Australia/Brisbane" },
    });
    assert.ok(who);
    assert.equal(who.isp, "Cloudflare");
    assert.equal(who.org, "APNIC");
    assert.equal(who.timezone, "Australia/Brisbane");
  });

  it("formats coordinates without trailing zeros", () => {
    assert.equal(formatCoordinates(39.03, -77.5), "39.03, -77.5");
    assert.equal(formatCoordinates(null, 1), "—");
  });
});
