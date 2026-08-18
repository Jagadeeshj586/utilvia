export const SITE = {
  name: "Utilvia",
  tagline: "All your everyday tools, in one place.",
  positioning: "Every tool you need. One simple workspace.",
  privacyNote: "Your file is automatically deleted after processing and never stored.",
  description:
    "Free browser-based PDF, image, calculator, text, and developer tools. No signup. Your file is automatically deleted after processing and never stored.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://utilvia.net",
  email: "utilvia@outlook.com",
} as const;
