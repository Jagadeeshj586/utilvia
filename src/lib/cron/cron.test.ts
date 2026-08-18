import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildExpression,
  defaultConfig,
  describeCron,
  parseExpression,
  parseField,
  FIELD_SPECS,
} from "./cron";

describe("parseExpression", () => {
  it("parses a 5-field weekday schedule", () => {
    const result = parseExpression("0 9 * * 1-5");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.expression, "0 9 * * 1-5");
    assert.equal(result.config.includeSeconds, false);
    assert.equal(result.config.minute.mode, "specific");
    assert.deepEqual(result.config.minute.values, [0]);
    assert.equal(result.config.dayOfWeek.mode, "range");
    assert.equal(result.config.dayOfWeek.from, 1);
    assert.equal(result.config.dayOfWeek.to, 5);
  });

  it("parses 6-field seconds and names", () => {
    const result = parseExpression("*/30 0 9 * JAN MON");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.config.includeSeconds, true);
    assert.equal(result.config.second.mode, "interval");
    assert.equal(result.config.second.step, 30);
    assert.deepEqual(result.config.month.values, [1]);
    assert.deepEqual(result.config.dayOfWeek.values, [1]);
  });

  it("treats Sunday 7 as 0", () => {
    const result = parseExpression("0 0 * * 7");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.config.dayOfWeek.values, [0]);
    assert.equal(result.expression, "0 0 * * 0");
  });

  it("rejects the wrong number of fields", () => {
    const result = parseExpression("* * *");
    assert.equal(result.ok, false);
  });

  it("rejects Quartz tokens", () => {
    const result = parseExpression("0 0 L * *");
    assert.equal(result.ok, false);
  });
});

describe("parseField", () => {
  it("parses weekday names", () => {
    const parsed = parseField("MON-FRI", FIELD_SPECS.dayOfWeek);
    assert.ok(!("error" in parsed));
    if ("error" in parsed) return;
    assert.equal(parsed.mode, "range");
    assert.equal(parsed.from, 1);
    assert.equal(parsed.to, 5);
  });

  it("expands mixed lists into specific values", () => {
    const parsed = parseField("1,5-7", FIELD_SPECS.minute);
    assert.ok(!("error" in parsed));
    if ("error" in parsed) return;
    assert.equal(parsed.mode, "specific");
    assert.deepEqual(parsed.values, [1, 5, 6, 7]);
  });

  it("maps a full-span stepped range to an interval", () => {
    const parsed = parseField("0-59/15", FIELD_SPECS.minute);
    assert.ok(!("error" in parsed));
    if ("error" in parsed) return;
    assert.equal(parsed.mode, "interval");
    assert.equal(parsed.step, 15);
  });
});

describe("buildExpression", () => {
  it("builds the default 9:00 daily schedule", () => {
    const result = buildExpression(defaultConfig());
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.expression, "0 9 * * *");
  });

  it("round-trips common presets", () => {
    for (const expression of ["* * * * *", "*/5 * * * *", "0 9 * * 1-5", "0 10 * * 0,6", "*/30 * * * * *"]) {
      const parsed = parseExpression(expression);
      assert.equal(parsed.ok, true);
      if (!parsed.ok) continue;
      const built = buildExpression(parsed.config);
      assert.equal(built.ok, true);
      if (!built.ok) continue;
      assert.equal(built.expression, parsed.expression);
    }
  });
});

describe("describeCron", () => {
  it("describes weekdays at 09:00", () => {
    const parsed = parseExpression("0 9 * * 1-5");
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.match(describeCron(parsed.config), /09:00/);
    assert.match(describeCron(parsed.config), /weekday/i);
  });

  it("describes every 5 minutes", () => {
    const parsed = parseExpression("*/5 * * * *");
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(describeCron(parsed.config), "Every 5 minutes, every day, every month.");
  });
});
