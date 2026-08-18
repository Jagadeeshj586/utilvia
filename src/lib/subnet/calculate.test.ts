import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hostCounts,
  intToBinary,
  ipInSubnet,
  maskToPrefix,
  parseCidr,
  parseIpv4,
} from "./calculate";

describe("parseCidr", () => {
  it("computes a /24 LAN block", () => {
    const result = parseCidr("192.168.1.0/24");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.network, "192.168.1.0");
    assert.equal(result.value.broadcast, "192.168.1.255");
    assert.equal(result.value.subnetMask, "255.255.255.0");
    assert.equal(result.value.wildcardMask, "0.0.0.255");
    assert.equal(result.value.totalHosts, 256);
    assert.equal(result.value.usableHosts, 254);
    assert.equal(result.value.firstUsable, "192.168.1.1");
    assert.equal(result.value.lastUsable, "192.168.1.254");
    assert.equal(result.value.networkBinary, "11000000.10101000.00000001.00000000");
    assert.equal(result.value.maskBinary, "11111111.11111111.11111111.00000000");
  });

  it("normalizes a host address to the network", () => {
    const result = parseCidr("10.0.0.55/16");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.value.network, "10.0.0.0");
    assert.equal(result.value.cidr, "10.0.0.0/16");
  });

  it("handles /31 and /32", () => {
    const ptp = parseCidr("10.0.0.0/31");
    assert.equal(ptp.ok, true);
    if (ptp.ok) {
      assert.equal(ptp.value.totalHosts, 2);
      assert.equal(ptp.value.usableHosts, 2);
      assert.equal(ptp.value.firstUsable, "10.0.0.0");
      assert.equal(ptp.value.lastUsable, "10.0.0.1");
    }
    const host = parseCidr("10.0.0.8/32");
    assert.equal(host.ok, true);
    if (host.ok) {
      assert.equal(host.value.usableHosts, 1);
      assert.equal(host.value.firstUsable, "10.0.0.8");
      assert.equal(host.value.lastUsable, "10.0.0.8");
    }
  });

  it("rejects invalid input", () => {
    assert.equal(parseCidr("192.168.1.0").ok, false);
    assert.equal(parseCidr("192.168.1.0/33").ok, false);
    assert.equal(parseCidr("999.1.1.1/24").ok, false);
  });
});

describe("maskToPrefix", () => {
  it("converts a dotted mask to CIDR", () => {
    const result = maskToPrefix("255.255.255.0");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.prefix, 24);
  });

  it("rejects non-contiguous masks", () => {
    const result = maskToPrefix("255.0.255.0");
    assert.equal(result.ok, false);
  });
});

describe("helpers", () => {
  it("parses IPv4 and binary", () => {
    assert.equal(parseIpv4("192.168.1.1"), ((192 << 24) | (168 << 16) | (1 << 8) | 1) >>> 0);
    assert.equal(intToBinary(0xff000000), "11111111.00000000.00000000.00000000");
  });

  it("counts hosts by prefix", () => {
    assert.deepEqual(hostCounts(24), { total: 256, usable: 254 });
    assert.deepEqual(hostCounts(30), { total: 4, usable: 2 });
  });

  it("checks whether an IP is in a subnet", () => {
    const inside = ipInSubnet("192.168.1.50", "192.168.1.0/24");
    const outside = ipInSubnet("192.168.2.1", "192.168.1.0/24");
    assert.equal(inside.ok && inside.inside, true);
    assert.equal(outside.ok && outside.inside, false);
  });
});
