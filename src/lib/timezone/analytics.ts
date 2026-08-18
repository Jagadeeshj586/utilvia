type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackTimezoneEvent(event: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV === "development") {
    console.debug("[timezone-analytics]", event, payload);
  }
  if (typeof window.gtag === "function") {
    window.gtag("event", event, payload);
  }
}
