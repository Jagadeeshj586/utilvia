import type { UserFriendlyErrorCode } from "./types";

export class BackgroundRemovalError extends Error {
  readonly code: UserFriendlyErrorCode;
  readonly cause?: unknown;

  constructor(code: UserFriendlyErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "BackgroundRemovalError";
    this.code = code;
    this.cause = cause;
  }
}

export const USER_MESSAGES: Record<UserFriendlyErrorCode, string> = {
  unsupported: "Please upload a JPG, PNG, WEBP, or HEIC image.",
  corrupt: "This image appears to be damaged and could not be opened.",
  too_large: "This image is too large. Please upload an image smaller than 20 MB.",
  network: "We couldn't reach the background-removal service. Check your connection and try again.",
  timeout: "Background removal took too long. Try a smaller image or Standard quality.",
  unavailable: "The background-removal model is unavailable right now. Please try again shortly.",
  empty: "We couldn't find a clear subject in this image. Try a photo with the subject separated from the background.",
  rate_limit: "Too many requests. Please wait a moment and try again.",
  failed: "We couldn't remove the background from this image. Try using a clearer image with the subject separated from the background.",
};

export function toUserMessage(error: unknown): string {
  if (error instanceof BackgroundRemovalError) return USER_MESSAGES[error.code];
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Background removal was cancelled.";
  }
  return USER_MESSAGES.failed;
}

export function classifyUnknownError(error: unknown): UserFriendlyErrorCode {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  const lower = text.toLowerCase();
  if (lower.includes("timeout") || lower.includes("timed out")) return "timeout";
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("failed to load")) return "network";
  if (lower.includes("429") || lower.includes("rate")) return "rate_limit";
  if (lower.includes("heic") || lower.includes("unsupported") || lower.includes("type")) return "unsupported";
  if (lower.includes("decode") || lower.includes("corrupt")) return "corrupt";
  return "failed";
}
