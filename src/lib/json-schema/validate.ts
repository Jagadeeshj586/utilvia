import Ajv, { type ErrorObject } from "ajv";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";

export type SchemaDraft = "draft-7" | "draft-2020-12";
export type ExampleId = "person" | "product" | "api" | "registration";

export type SchemaIssue = {
  path: string;
  message: string;
  raw: string;
};

export type SchemaValidateResult =
  | { status: "empty"; headline: string }
  | { status: "schema-parse"; headline: string; detail: string }
  | { status: "data-parse"; headline: string; detail: string }
  | { status: "schema-compile"; headline: string; detail: string }
  | { status: "valid"; headline: string }
  | { status: "invalid"; headline: string; errors: SchemaIssue[] };

const ajvOptions = {
  allErrors: true,
  strict: false,
  validateFormats: true,
} as const;

const draft7 = addFormats(new Ajv(ajvOptions));
const draft2020 = addFormats(new Ajv2020(ajvOptions));

function engine(draft: SchemaDraft) {
  return draft === "draft-2020-12" ? draft2020 : draft7;
}

export const SCHEMA_DRAFTS: { id: SchemaDraft; label: string }[] = [
  { id: "draft-7", label: "JSON Schema Draft 7" },
  { id: "draft-2020-12", label: "Draft 2020-12" },
];

function pretty(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export const SCHEMA_EXAMPLES: Record<
  ExampleId,
  { label: string; schema: string; data: string }
> = {
  person: {
    label: "Person object",
    schema: pretty({
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer", minimum: 0 },
        email: { type: "string", format: "email" },
      },
      required: ["name", "age"],
    }),
    data: pretty({
      name: "Arjun",
      age: 28,
      email: "arjun@example.com",
    }),
  },
  product: {
    label: "Product schema",
    schema: pretty({
      type: "object",
      properties: {
        sku: { type: "string" },
        name: { type: "string" },
        price: { type: "number", minimum: 0 },
        inStock: { type: "boolean" },
      },
      required: ["sku", "name", "price"],
    }),
    data: pretty({
      sku: "WU-001",
      name: "Widget Pro",
      price: 999,
      inStock: true,
    }),
  },
  api: {
    label: "API response",
    schema: pretty({
      type: "object",
      properties: {
        status: { type: "integer", enum: [200, 201, 400, 404, 500] },
        message: { type: "string" },
        data: { type: "object" },
      },
      required: ["status", "message"],
    }),
    data: pretty({
      status: 200,
      message: "Success",
      data: { id: 42 },
    }),
  },
  registration: {
    label: "User registration",
    schema: pretty({
      type: "object",
      properties: {
        username: { type: "string", minLength: 3 },
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 8 },
        age: { type: "integer", minimum: 18 },
      },
      required: ["username", "email", "password"],
    }),
    data: pretty({
      username: "arjun_dev",
      email: "arjun@example.com",
      password: "securepass123",
      age: 28,
    }),
  },
};

export const EXAMPLE_OPTIONS = (Object.keys(SCHEMA_EXAMPLES) as ExampleId[]).map((id) => ({
  id,
  label: SCHEMA_EXAMPLES[id].label,
}));

export const DEFAULT_EXAMPLE: ExampleId = "person";

function parseJson(text: string, label: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected token";
    return { ok: false, error: `Invalid ${label}: ${message}` };
  }
}

export function formatJsonText(text: string) {
  const parsed = parseJson(text, "JSON");
  if (!parsed.ok) return parsed;
  return { ok: true as const, value: pretty(parsed.value).trimEnd() };
}

function pointerToDot(instancePath: string) {
  if (!instancePath || instancePath === "/") return "";
  return instancePath
    .replace(/^\//, "")
    .split("/")
    .map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"))
    .join(".");
}

export function errorPath(error: ErrorObject) {
  const nested = pointerToDot(error.instancePath);
  const missing = (error.params as { missingProperty?: string }).missingProperty;
  if (error.keyword === "required" && typeof missing === "string") {
    return nested ? `data.${nested}.${missing}` : `data.${missing}`;
  }
  const additional = (error.params as { additionalProperty?: string }).additionalProperty;
  if (error.keyword === "additionalProperties" && typeof additional === "string") {
    return nested ? `data.${nested}.${additional}` : `data.${additional}`;
  }
  return nested ? `data.${nested}` : "data";
}

export function humanizeError(error: ErrorObject) {
  const params = error.params as Record<string, unknown>;
  switch (error.keyword) {
    case "required":
      return `The '${String(params.missingProperty)}' field is required but missing.`;
    case "minLength":
      return `This text must have at least ${String(params.limit)} characters.`;
    case "maxLength":
      return `This text must have at most ${String(params.limit)} characters.`;
    case "minimum":
      return `The value must be at least ${String(params.limit)}.`;
    case "maximum":
      return `The value must be at most ${String(params.limit)}.`;
    case "exclusiveMinimum":
      return `The value must be greater than ${String(params.limit)}.`;
    case "exclusiveMaximum":
      return `The value must be less than ${String(params.limit)}.`;
    case "format":
      if (params.format === "email") return "The value must be a valid email address.";
      if (params.format === "uri" || params.format === "url") return "The value must be a valid URL.";
      if (params.format === "date") return "The value must be a valid date (YYYY-MM-DD).";
      if (params.format === "date-time") return "The value must be a valid date-time.";
      if (params.format === "uuid") return "The value must be a valid UUID.";
      return `The value must match format "${String(params.format)}".`;
    case "type": {
      const type = Array.isArray(params.type) ? params.type.join(" or ") : String(params.type);
      return `The value must be of type ${type}.`;
    }
    case "enum": {
      const allowed = Array.isArray(params.allowedValues) ? params.allowedValues.map(String).join(", ") : "";
      return allowed ? `The value must be one of: ${allowed}.` : "The value is not in the allowed list.";
    }
    case "additionalProperties":
      return `The '${String(params.additionalProperty)}' field is not allowed.`;
    case "pattern":
      return "The value must match the required pattern.";
    case "minItems":
      return `The array must have at least ${String(params.limit)} items.`;
    case "maxItems":
      return `The array must have at most ${String(params.limit)} items.`;
    case "uniqueItems":
      return "Array items must be unique.";
    case "const":
      return `The value must be ${JSON.stringify(params.allowedValue)}.`;
    case "minProperties":
      return `The object must have at least ${String(params.limit)} properties.`;
    case "maxProperties":
      return `The object must have at most ${String(params.limit)} properties.`;
    case "multipleOf":
      return `The value must be a multiple of ${String(params.multipleOf)}.`;
    default:
      return error.message ? `${error.message.charAt(0).toUpperCase()}${error.message.slice(1)}.` : "This value does not match the schema.";
  }
}

export function validateJsonSchema(
  schemaText: string,
  dataText: string,
  draft: SchemaDraft = "draft-7",
): SchemaValidateResult {
  if (!schemaText.trim() && !dataText.trim()) {
    return { status: "empty", headline: "Enter a JSON Schema and JSON data to validate." };
  }
  if (!schemaText.trim()) {
    return { status: "empty", headline: "Paste a JSON Schema to start validating." };
  }
  if (!dataText.trim()) {
    return { status: "empty", headline: "Paste JSON data to validate against the schema." };
  }

  const schemaParsed = parseJson(schemaText, "JSON Schema");
  if (!schemaParsed.ok) {
    return { status: "schema-parse", headline: "Invalid JSON Schema", detail: schemaParsed.error };
  }
  const dataParsed = parseJson(dataText, "JSON data");
  if (!dataParsed.ok) {
    return { status: "data-parse", headline: "Invalid JSON data", detail: dataParsed.error };
  }

  const ajv = engine(draft);
  let validate;
  try {
    validate = ajv.compile(schemaParsed.value as object);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The schema could not be compiled.";
    return { status: "schema-compile", headline: "Invalid JSON Schema", detail: message };
  }

  const ok = validate(dataParsed.value);
  if (ok) {
    return { status: "valid", headline: "Valid — JSON data matches the schema" };
  }

  const errors = (validate.errors ?? []).map((error) => ({
    path: errorPath(error),
    message: humanizeError(error),
    raw: error.message ?? "must match schema",
  }));
  const count = errors.length;
  return {
    status: "invalid",
    headline: `${count} validation error${count === 1 ? "" : "s"} found`,
    errors,
  };
}

export function schemaErrorsCopyText(result: Extract<SchemaValidateResult, { status: "invalid" }>) {
  return result.errors.map((error) => `${error.path}\n${error.message}\n${error.raw}`).join("\n\n");
}

export const JSON_SCHEMA_FAQS = [
  {
    question: "What is JSON Schema used for?",
    answer:
      "JSON Schema describes and validates the structure of JSON data — used in REST APIs, configuration files, and OpenAPI documentation.",
  },
  {
    question: "What is the difference between Draft 7 and Draft 2020-12?",
    answer:
      "Draft 7 is most widely used and compatible with OpenAPI 3.0. Draft 2020-12 adds $dynamicRef for complex recursive schemas.",
  },
  {
    question: "Why does valid JSON fail schema validation?",
    answer:
      "Syntax-valid JSON can fail if types don't match, required fields are missing, or values are outside allowed ranges.",
  },
  {
    question: "How do I mark a field as required?",
    answer: 'Use the required array at the same level as properties: { "properties": {...}, "required": ["name"] }.',
  },
  {
    question: "Is this validator free?",
    answer: "Yes. It runs in your browser with no signup. Your JSON stays on your device.",
  },
];
