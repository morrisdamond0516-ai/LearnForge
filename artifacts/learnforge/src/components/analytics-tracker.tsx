import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trackEvent } from "@/lib/analytics";

/**
 * Records a "pageview" event whenever the route changes (and once on first
 * load). Renders nothing. Mounted once near the app root, inside the wouter
 * Router so `useLocation` resolves the base-stripped path.
 */
export function AnalyticsTracker() {
  const [location] = useLocation();
  const lastRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastRef.current === location) return;
    lastRef.current = location;
    trackEvent("pageview", location);
  }, [location]);

  return null;
}
