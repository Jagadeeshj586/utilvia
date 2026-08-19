export const DEMO_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vLXVzZXItMTIzIiwibmFtZSI6IlV0aWx2aWEgRGVtbyIsImlzcyI6InV0aWx2aWEubmV0IiwiaWF0IjoxNzgyMDIzNTkxLCJleHAiOjE3ODQ2MTU1OTF9.EfnPR8mpLnYy4kg2eZ_kXUbodYMiEcssTJpm72-yvAg";

export const DEMO_JWT_SECRET = "demo-secret-key";

export const JWT_CLAIM_LABELS: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expiration Time",
  nbf: "Not Before",
  iat: "Issued At",
  jti: "JWT ID",
  azp: "Authorized Party",
  scope: "Scope",
  name: "Name",
  email: "Email",
};

export const JWT_FAQS = [
  {
    question: "Does this verify JWT signatures?",
    answer:
      "Yes — for HMAC (HS256/384/512), RSA (RS256/384/512, PS256), and ECDSA (ES256/384/512) algorithms. Verification runs entirely in your browser using the Web Crypto API.",
  },
  {
    question: "Is it safe to paste JWT tokens and secrets?",
    answer:
      "Yes. Decoding and verification happen locally in your browser. Tokens and secrets are never sent to Utilvia servers.",
  },
  {
    question: "What do the JWT claim abbreviations mean?",
    answer:
      "Common claims include sub (Subject), iss (Issuer), aud (Audience), exp (Expiration Time), iat (Issued At), and nbf (Not Before). The payload table shows expanded labels beside each claim.",
  },
  {
    question: "How do I know if a token expired?",
    answer:
      "Check the payload badge. Valid tokens show time remaining; expired tokens show an expired badge with the expiration date.",
  },
  {
    question: "Is JWT decoder free?",
    answer: "Yes. The Utilvia JWT Decoder is free with no signup required.",
  },
] as const;

export type JwtSegment = "header" | "payload" | "signature";

export type JwtParseResult =
  | { ok: false; error: string }
  | {
      ok: true;
      raw: string;
      headerPart: string;
      payloadPart: string;
      signaturePart: string;
      header: Record<string, unknown>;
      payload: Record<string, unknown>;
      algorithm: string | null;
    };

export type JwtExpiryStatus =
  | { state: "none" }
  | { state: "valid"; expiresAt: Date; relativeLabel: string; absoluteLabel: string }
  | { state: "expired"; expiredAt: Date; relativeLabel: string; absoluteLabel: string };

export type JwtVerificationResult =
  | { status: "idle" }
  | { status: "unsupported"; algorithm: string }
  | { status: "needs-key"; algorithm: string }
  | { status: "verified"; algorithm: string }
  | { status: "invalid"; algorithm: string }
  | { status: "error"; message: string };

const TIME_CLAIMS = new Set(["exp", "nbf", "iat"]);

export function decodeBase64Url(part: string) {
  const padded = part.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (part.length % 4)) % 4);
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

export function encodeBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64UrlToBytes(part: string) {
  const padded = part.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (part.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function splitJwtToken(token: string) {
  const trimmed = token.trim();
  const parts = trimmed.split(".");
  return {
    headerPart: parts[0] ?? "",
    payloadPart: parts[1] ?? "",
    signaturePart: parts[2] ?? "",
    partCount: parts.length,
  };
}

export function parseJwt(token: string): JwtParseResult {
  const { headerPart, payloadPart, signaturePart, partCount } = splitJwtToken(token);
  if (!headerPart || !payloadPart) {
    return { ok: false, error: "JWT needs at least header.payload segments." };
  }
  if (partCount > 3) {
    return { ok: false, error: "JWT has too many dot-separated segments." };
  }
  try {
    const header = JSON.parse(decodeBase64Url(headerPart)) as Record<string, unknown>;
    const payload = JSON.parse(decodeBase64Url(payloadPart)) as Record<string, unknown>;
    const algorithm = typeof header.alg === "string" ? header.alg : null;
    return {
      ok: true,
      raw: token.trim(),
      headerPart,
      payloadPart,
      signaturePart,
      header,
      payload,
      algorithm,
    };
  } catch {
    return { ok: false, error: "Could not base64url-decode header or payload." };
  }
}

export function formatJwtDate(unixSeconds: number) {
  const date = new Date(unixSeconds * 1000);
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatRelativeDuration(ms: number, future: boolean) {
  const absMs = Math.abs(ms);
  const minutes = Math.round(absMs / 60_000);
  const hours = Math.round(absMs / 3_600_000);
  const days = Math.round(absMs / 86_400_000);
  if (days >= 2) return future ? `expires in ${days} days` : `expired ${days} days ago`;
  if (days === 1) return future ? "expires in 1 day" : "expired 1 day ago";
  if (hours >= 2) return future ? `expires in ${hours} hours` : `expired ${hours} hours ago`;
  if (hours === 1) return future ? "expires in 1 hour" : "expired 1 hour ago";
  if (minutes >= 2) return future ? `expires in ${minutes} minutes` : `expired ${minutes} minutes ago`;
  return future ? "expires soon" : "expired just now";
}

export function getJwtExpiryStatus(payload: Record<string, unknown>, now = Date.now()): JwtExpiryStatus {
  const exp = payload.exp;
  if (typeof exp !== "number") return { state: "none" };
  const expiresAt = new Date(exp * 1000);
  const absoluteLabel = formatJwtDate(exp);
  const delta = expiresAt.getTime() - now;
  if (delta >= 0) {
    return {
      state: "valid",
      expiresAt,
      absoluteLabel,
      relativeLabel: formatRelativeDuration(delta, true),
    };
  }
  return {
    state: "expired",
    expiredAt: expiresAt,
    absoluteLabel,
    relativeLabel: formatRelativeDuration(delta, false),
  };
}

export function formatClaimValue(key: string, value: unknown) {
  if (TIME_CLAIMS.has(key) && typeof value === "number") {
    return `${value} (${formatJwtDate(value)})`;
  }
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

export function claimRows(record: Record<string, unknown>) {
  return Object.entries(record).map(([key, value]) => ({
    key,
    label: JWT_CLAIM_LABELS[key] ?? null,
    value: formatClaimValue(key, value),
  }));
}

function hmacHashName(algorithm: string) {
  if (algorithm === "HS256") return "SHA-256";
  if (algorithm === "HS384") return "SHA-384";
  if (algorithm === "HS512") return "SHA-512";
  return null;
}

function rsaHashName(algorithm: string) {
  if (algorithm.startsWith("RS") || algorithm.startsWith("PS")) {
    if (algorithm.endsWith("256")) return "SHA-256";
    if (algorithm.endsWith("384")) return "SHA-384";
    if (algorithm.endsWith("512")) return "SHA-512";
  }
  return null;
}

function ecdsaHashName(algorithm: string) {
  if (algorithm === "ES256") return "SHA-256";
  if (algorithm === "ES384") return "SHA-384";
  if (algorithm === "ES512") return "SHA-512";
  return null;
}

function pemToArrayBuffer(pem: string) {
  const body = pem
    .replace(/-----BEGIN[^-]+-----/g, "")
    .replace(/-----END[^-]+-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(body);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function decodeSecret(secret: string, base64Encoded: boolean) {
  if (!base64Encoded) return new TextEncoder().encode(secret);
  try {
    return decodeBase64UrlToBytes(secret.trim());
  } catch {
    throw new Error("Secret is not valid base64.");
  }
}

async function verifyHmac(
  algorithm: string,
  signingInput: string,
  signaturePart: string,
  secret: string,
  secretIsBase64: boolean,
) {
  const hash = hmacHashName(algorithm);
  if (!hash) return false;
  const keyBytes = decodeSecret(secret, secretIsBase64);
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput));
  return encodeBase64Url(signed) === signaturePart;
}

async function importPublicKey(algorithm: string, pem: string) {
  const spki = pemToArrayBuffer(pem);
  if (algorithm.startsWith("RS")) {
    const hash = rsaHashName(algorithm);
    if (!hash) throw new Error(`Unsupported RSA algorithm ${algorithm}.`);
    return crypto.subtle.importKey("spki", spki, { name: "RSASSA-PKCS1-v1_5", hash }, false, ["verify"]);
  }
  if (algorithm.startsWith("PS")) {
    const hash = rsaHashName(algorithm);
    if (!hash) throw new Error(`Unsupported RSA-PSS algorithm ${algorithm}.`);
    return crypto.subtle.importKey("spki", spki, { name: "RSA-PSS", hash }, false, ["verify"]);
  }
  if (algorithm.startsWith("ES")) {
    const hash = ecdsaHashName(algorithm);
    if (!hash) throw new Error(`Unsupported ECDSA algorithm ${algorithm}.`);
    const namedCurve = algorithm === "ES256" ? "P-256" : algorithm === "ES384" ? "P-384" : "P-521";
    return crypto.subtle.importKey("spki", spki, { name: "ECDSA", namedCurve }, false, ["verify"]);
  }
  throw new Error(`Unsupported algorithm ${algorithm}.`);
}

async function verifyAsymmetric(
  algorithm: string,
  signingInput: string,
  signaturePart: string,
  publicKeyPem: string,
) {
  const key = await importPublicKey(algorithm, publicKeyPem);
  const signature = decodeBase64UrlToBytes(signaturePart);
  const data = new TextEncoder().encode(signingInput);
  if (algorithm.startsWith("PS")) {
    const hash = rsaHashName(algorithm)!;
    return crypto.subtle.verify({ name: "RSA-PSS", saltLength: hash === "SHA-256" ? 32 : hash === "SHA-384" ? 48 : 64 }, key, signature, data);
  }
  if (algorithm.startsWith("RS")) {
    const hash = rsaHashName(algorithm)!;
    return crypto.subtle.verify({ name: "RSASSA-PKCS1-v1_5", hash }, key, signature, data);
  }
  const hash = ecdsaHashName(algorithm)!;
  return crypto.subtle.verify({ name: "ECDSA", hash }, key, signature, data);
}

export function isHmacAlgorithm(algorithm: string | null) {
  return algorithm != null && /^HS(256|384|512)$/.test(algorithm);
}

export function isAsymmetricAlgorithm(algorithm: string | null) {
  return algorithm != null && /^(RS|PS|ES)(256|384|512)$/.test(algorithm);
}

export async function verifyJwtSignature(
  parsed: Extract<JwtParseResult, { ok: true }>,
  secretOrKey: string,
  options: { secretIsBase64?: boolean } = {},
): Promise<JwtVerificationResult> {
  const algorithm = parsed.algorithm;
  if (!algorithm || algorithm === "none") {
    return { status: "unsupported", algorithm: algorithm ?? "unknown" };
  }
  if (!parsed.signaturePart) {
    return { status: "needs-key", algorithm };
  }
  if (!secretOrKey.trim()) {
    return { status: "needs-key", algorithm };
  }

  const signingInput = `${parsed.headerPart}.${parsed.payloadPart}`;

  try {
    if (isHmacAlgorithm(algorithm)) {
      const valid = await verifyHmac(
        algorithm,
        signingInput,
        parsed.signaturePart,
        secretOrKey,
        options.secretIsBase64 ?? false,
      );
      return valid ? { status: "verified", algorithm } : { status: "invalid", algorithm };
    }
    if (isAsymmetricAlgorithm(algorithm)) {
      const valid = await verifyAsymmetric(algorithm, signingInput, parsed.signaturePart, secretOrKey.trim());
      return valid ? { status: "verified", algorithm } : { status: "invalid", algorithm };
    }
    return { status: "unsupported", algorithm };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Could not verify signature.",
    };
  }
}
