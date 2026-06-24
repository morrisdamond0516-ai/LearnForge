/**
 * Lightweight, privacy-respecting site analytics. A random per-browser id is
 * stored in localStorage so we can count unique visitors without any third
 * party. Every call is fire-and-forget: tracking must never block or break the
 * UI, so all failures are swallowed.
 */
const SESSION_KEY = "learnforge:analytics-session";

function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // Storage blocked (private mode, etc.) — fall back to a volatile id so we
    // still record the event, just without cross-page de-duplication.
    return "anon";
  }
}

export function trackEvent(type: string, path?: string): void {
  try {
    const body = JSON.stringify({
      type,
      path: path ?? window.location.pathname,
      referrer: document.referrer || undefined,
      sessionId: getSessionId(),
    });
    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      keepalive: true,
      body,
    }).catch(() => {});
  } catch {
    // Never let analytics throw into the app.
  }
}
