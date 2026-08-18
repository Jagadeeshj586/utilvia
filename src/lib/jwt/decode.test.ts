import assert from "node:assert/strict";
import test from "node:test";
import {
  DEMO_JWT,
  DEMO_JWT_SECRET,
  claimRows,
  formatClaimValue,
  getJwtExpiryStatus,
  parseJwt,
  splitJwtToken,
  verifyJwtSignature,
} from "./decode";

test("parseJwt decodes WorkUtilities demo token", () => {
  const parsed = parseJwt(DEMO_JWT);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.header.alg, "HS256");
  assert.equal(parsed.header.typ, "JWT");
  assert.equal(parsed.payload.sub, "demo-user-123");
  assert.equal(parsed.payload.name, "WorkUtilities Demo");
  assert.equal(parsed.payload.iss, "workutilities.com");
  assert.equal(parsed.signaturePart, "lqHZ-_lMyTV36yZ4p8u4-4DOwAnBv5PmcGzkmHXTIqU");
});

test("splitJwtToken separates header payload signature", () => {
  const parts = splitJwtToken(DEMO_JWT);
  assert.equal(parts.partCount, 3);
  assert.match(parts.headerPart, /^eyJ/);
  assert.ok(parts.payloadPart.length > 10);
  assert.ok(parts.signaturePart.length > 10);
});

test("claimRows include standard labels", () => {
  const parsed = parseJwt(DEMO_JWT);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const rows = claimRows(parsed.payload);
  assert.deepEqual(
    rows.find((row) => row.key === "sub"),
    { key: "sub", label: "Subject", value: "demo-user-123" },
  );
  assert.match(rows.find((row) => row.key === "exp")?.value ?? "", /1784615591/);
});

test("formatClaimValue formats unix timestamps", () => {
  assert.match(formatClaimValue("iat", 1782023591), /^1782023591 \(/);
});

test("getJwtExpiryStatus marks demo token expired after July 2026", () => {
  const parsed = parseJwt(DEMO_JWT);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const status = getJwtExpiryStatus(parsed.payload, Date.parse("2026-08-12T06:00:00Z"));
  assert.equal(status.state, "expired");
});

test("verifyJwtSignature validates WorkUtilities demo secret", async () => {
  const parsed = parseJwt(DEMO_JWT);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const result = await verifyJwtSignature(parsed, DEMO_JWT_SECRET);
  assert.equal(result.status, "verified");
});

test("verifyJwtSignature rejects wrong secret", async () => {
  const parsed = parseJwt(DEMO_JWT);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const result = await verifyJwtSignature(parsed, "wrong-secret");
  assert.equal(result.status, "invalid");
});

test("parseJwt rejects malformed token", () => {
  assert.equal(parseJwt("not-a-jwt").ok, false);
});
