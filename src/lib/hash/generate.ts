import { md5, md5Bytes } from "@/lib/crypto/md5";

export type HashAlgorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-512";

export const HASH_ALGORITHMS: HashAlgorithm[] = ["MD5", "SHA-1", "SHA-256", "SHA-512"];

export type HashResults = Record<HashAlgorithm, string>;

export const EMPTY_HASH_RESULTS: HashResults = {
  MD5: "",
  "SHA-1": "",
  "SHA-256": "",
  "SHA-512": "",
};

const WEB_CRYPTO_ALGORITHMS: Record<Exclude<HashAlgorithm, "MD5">, AlgorithmIdentifier> = {
  "SHA-1": "SHA-1",
  "SHA-256": "SHA-256",
  "SHA-512": "SHA-512",
};

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function digestBytes(algorithm: Exclude<HashAlgorithm, "MD5">, data: ArrayBuffer | Uint8Array) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const hash = await crypto.subtle.digest(WEB_CRYPTO_ALGORITHMS[algorithm], copy);
  return bufferToHex(hash);
}

export async function hashText(text: string): Promise<HashResults> {
  if (!text) return { ...EMPTY_HASH_RESULTS };
  const bytes = new TextEncoder().encode(text);
  const [sha1, sha256, sha512] = await Promise.all([
    digestBytes("SHA-1", bytes),
    digestBytes("SHA-256", bytes),
    digestBytes("SHA-512", bytes),
  ]);
  return {
    MD5: md5(text),
    "SHA-1": sha1,
    "SHA-256": sha256,
    "SHA-512": sha512,
  };
}

export async function hashFileBytes(bytes: Uint8Array): Promise<HashResults> {
  if (!bytes.length) return { ...EMPTY_HASH_RESULTS };
  const [sha1, sha256, sha512] = await Promise.all([
    digestBytes("SHA-1", bytes),
    digestBytes("SHA-256", bytes),
    digestBytes("SHA-512", bytes),
  ]);
  return {
    MD5: md5Bytes(bytes),
    "SHA-1": sha1,
    "SHA-256": sha256,
    "SHA-512": sha512,
  };
}

export const HASH_GENERATOR_FAQS = [
  {
    question: "How to generate SHA-256 hash online?",
    answer: "Enter text in the input box or upload a file. SHA-256 and other hashes appear instantly in your browser.",
  },
  {
    question: "How to hash a file?",
    answer: "Click Or hash a file, choose a file, and the tool computes MD5, SHA-1, SHA-256, and SHA-512 locally.",
  },
  {
    question: "Is MD5 safe for passwords?",
    answer: "No. MD5 and SHA-1 are not recommended for password storage. Use dedicated password hashing such as bcrypt or Argon2.",
  },
  {
    question: "Are hashes reversible?",
    answer: "No. Hash functions are one-way. You cannot recover the original input from a hash value.",
  },
  {
    question: "Is hash generation private?",
    answer: "Yes. All hashing runs locally in your browser. Your text and files are never uploaded to a server.",
  },
] as const;
