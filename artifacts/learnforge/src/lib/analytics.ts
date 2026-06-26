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

export function trackEvent(
  type: string,
  path?: string,
  properties?: Record<string, unknown>,
): void {
  try {
    const body = JSON.stringify({
      type,
      path: path ?? window.location.pathname,
      referrer: document.referrer || undefined,
      sessionId: getSessionId(),
      ...(properties ? { properties } : {}),
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

/**
 * Patches window.fetch once so any response from /api/ that is 4xx or 5xx
 * is automatically tracked as an `api_error` event. Call once at app startup.
 * Transparent to callers — the original response is returned unchanged.
 */
export function installFetchInterceptor(): () => void {
  const orig = window.fetch.bind(window);
  let active = true;

  window.fetch = async function patchedFetch(...args) {
    const res = await orig(...args);
    try {
      if (!active) return res;
      const url =
        typeof args[0] === "string"
          ? args[0]
          : args[0] instanceof Request
            ? args[0].url
            : "";
      // Track errors from our own API but skip the analytics endpoint itself
      // (would cause an infinite loop) and skip auth redirects.
      if (
        url.includes("/api/") &&
        !url.includes("/api/analytics/track") &&
        !res.ok &&
        res.status >= 400
      ) {
        const method =
          (args[1] as RequestInit | undefined)?.method?.toUpperCase() ?? "GET";
        const endpoint = url
          .replace(window.location.origin, "")
          .split("?")[0]
          .slice(0, 120);
        trackEvent("api_error", window.location.pathname, {
          endpoint,
          status: res.status,
          method,
        });
      }
    } catch {
      // never break the actual fetch
    }
    return res;
  };

  return () => {
    active = false;
    window.fetch = orig;
  };
}
