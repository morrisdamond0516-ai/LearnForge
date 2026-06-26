import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trackEvent, installFetchInterceptor } from "@/lib/analytics";

/**
 * Records a "pageview" event whenever the route changes (and once on first
 * load). Also installs a transparent fetch interceptor that auto-tracks any
 * 4xx/5xx response from the app's own API as an `api_error` event, giving
 * the owner dashboard a full picture of what went wrong for each visitor.
 *
 * Renders nothing. Mounted once near the app root, inside the wouter Router
 * so `useLocation` resolves the base-stripped path.
 */
export function AnalyticsTracker() {
  const [location] = useLocation();
  const lastRef = useRef<string | null>(null);

  // Install the fetch interceptor exactly once.
  useEffect(() => {
    const uninstall = installFetchInterceptor();
    return uninstall;
  }, []);

  useEffect(() => {
    if (lastRef.current === location) return;
    lastRef.current = location;
    trackEvent("pageview", location);
  }, [location]);

  return null;
}
