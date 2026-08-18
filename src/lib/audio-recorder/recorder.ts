export type RecorderStatus = "idle" | "requesting" | "recording" | "paused";

export const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
] as const;

export const AUDIO_RECORDER_FAQS = [
  {
    question: "Do I need to install anything to record audio in the browser?",
    answer:
      "No. The recorder uses the browser MediaRecorder API. Allow microphone access when prompted and you can start immediately.",
  },
  {
    question: "Is my recorded audio uploaded anywhere?",
    answer:
      "No. Capture, playback, and download all stay on your device. Sessions are kept in memory and are lost if you close the page.",
  },
  {
    question: "What format does the recording download in?",
    answer:
      "WebM (Opus) in browsers that support it. Safari may download M4A instead. Convert later if you need MP3 or WAV.",
  },
  {
    question: "Why is the browser asking for microphone permission?",
    answer:
      "The page cannot hear your mic until you allow it. Permission stays in the browser; Utilvia never receives the stream.",
  },
  {
    question: "Is audio recorder free?",
    answer: "Yes. It runs in your browser with no signup. Recordings stay on your device until you download them.",
  },
] as const;

export const STATUS_COPY: Record<RecorderStatus, string> = {
  idle: "Ready to record",
  requesting: "Waiting for microphone access…",
  recording: "Recording",
  paused: "Paused",
};

export function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

export function pickRecorderMime(isSupported: (type: string) => boolean) {
  return MIME_CANDIDATES.find((type) => isSupported(type)) ?? "";
}

export function extensionFromMime(mime: string) {
  const type = mime.toLowerCase();
  if (type.includes("mp4") || type.includes("mpeg") || type.includes("m4a") || type.includes("aac")) return "m4a";
  if (type.includes("ogg")) return "ogg";
  if (type.includes("wav")) return "wav";
  return "webm";
}

export function recordingFilename(index: number, mime: string) {
  return `recording-${index}.${extensionFromMime(mime)}`;
}

export function isWebmMime(mime: string) {
  return mime.toLowerCase().includes("webm");
}

export function supportError() {
  if (typeof window === "undefined") return "Audio recording needs a browser.";
  if (!window.isSecureContext) {
    return "Microphone access needs HTTPS (or localhost).";
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return "This browser cannot access the microphone.";
  }
  if (typeof MediaRecorder === "undefined") {
    return "This browser does not support audio recording.";
  }
  return null;
}

function errorName(error: unknown) {
  if (error instanceof Error) return error.name;
  if (typeof error === "object" && error && "name" in error) return String((error as { name: unknown }).name);
  return "";
}

export function permissionErrorMessage(error: unknown) {
  const name = errorName(error);
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Microphone permission was denied. Allow access in the browser and try again.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No microphone was found. Plug one in and try again.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The microphone is in use by another app.";
  }
  return "Could not start the microphone.";
}
