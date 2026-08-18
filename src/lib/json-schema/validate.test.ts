import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SCHEMA_EXAMPLES,
  formatJsonText,
  validateJsonSchema,
} from "./validate";

describe("JSON Schema validator", () => {
  it("marks the WorkUtilities Person example as valid", () => {
    const result = validateJsonSchema(SCHEMA_EXAMPLES.person.schema, SCHEMA_EXAMPLES.person.data);
    assert.equal(result.status, "valid");
    if (result.status === "valid") {
      assert.equal(result.headline, "Valid — JSON data matches the schema");
    }
  });

  it("validates product, API, and registration examples", () => {
    for (const id of ["product", "api", "registration"] as const) {
      const example = SCHEMA_EXAMPLES[id];
      const result = validateJsonSchema(example.schema, example.data);
      assert.equal(result.status, "valid", id);
    }
  });

  it("returns human-readable errors with copyable paths", () => {
    const result = validateJsonSchema(SCHEMA_EXAMPLES.registration.schema, `{
  "username": "ab",
  "email": "not-an-email",
  "age": 12
}`);
    assert.equal(result.status, "invalid");
    if (result.status !== "invalid") return;
    assert.equal(result.headline, "4 validation errors found");
    const byPath = Object.fromEntries(result.errors.map((error) => [error.path, error]));
    assert.equal(byPath["data.password"]?.message, "The 'password' field is required but missing.");
    assert.match(byPath["data.password"]?.raw ?? "", /required property 'password'/);
    assert.equal(byPath["data.username"]?.message, "This text must have at least 3 characters.");
    assert.equal(byPath["data.email"]?.message, "The value must be a valid email address.");
    assert.equal(byPath["data.age"]?.message, "The value must be at least 18.");
  });

  it("reports invalid schema and data JSON", () => {
    const schema = validateJsonSchema("{", SCHEMA_EXAMPLES.person.data);
    assert.equal(schema.status, "schema-parse");
    const data = validateJsonSchema(SCHEMA_EXAMPLES.person.schema, "{");
    assert.equal(data.status, "data-parse");
  });

  it("formats JSON and still validates on Draft 2020-12", () => {
    const formatted = formatJsonText('{"name":"Arjun","age":28}');
    assert.equal(formatted.ok, true);
    if (!formatted.ok) return;
    const result = validateJsonSchema(SCHEMA_EXAMPLES.person.schema, formatted.value, "draft-2020-12");
    assert.equal(result.status, "valid");
  });
});
