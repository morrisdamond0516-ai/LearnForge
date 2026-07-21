/**
 * Clerk Frontend API Proxy Middleware
 *
 * Proxies Clerk Frontend API requests through your domain, enabling Clerk
 * authentication on custom domains and .replit.app deployments without
 * requiring CNAME DNS configuration.
 *
 * AUTH CONFIGURATION: To manage users, enable/disable login providers
 * (Google, GitHub, etc.), change app branding, or configure OAuth credentials,
 * use the Auth pane in the workspace toolbar. There is no external Clerk
 * dashboard — all auth configuration is done through the Auth pane.
 *
 * IMPORTANT:
 * - Only active in production (Clerk proxying doesn't work for dev instances)
 * - Must be mounted BEFORE express.json() middleware
 *
 * Usage in app.ts:
 *   import { CLERK_PROXY_PATH, clerkProxyMiddleware } from "./middlewares/clerkProxyMiddleware";
 *   app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
 */

import { createProxyMiddleware } from "http-proxy-middleware";
import type { RequestHandler } from "express";
import type { IncomingHttpHeaders } from "http";
import { publishableKeyFromHost } from "@clerk/shared/keys";

const CLERK_FAPI = "https://frontend-api.clerk.dev";
export const CLERK_PROXY_PATH = "/api/__clerk";

/**
 * Returns the first effective public hostname for the given request,
 * preferring x-forwarded-host over the Host header so callers behind a
 * proxy see the original client-facing host.
 *
 * x-forwarded-host can take three shapes:
 *   - undefined (no proxy involved)
 *   - a single string (one proxy hop)
 *   - a comma-delimited string when an upstream appended rather than
 *     replaced the header (Node folds duplicate headers this way), or a
 *     string[] in some Express typings
 * In the multi-value case, the leftmost value is the original client-
 * facing host. Take that one in all forms. Exported so that app.ts
 * (clerkMiddleware callback) and this proxy middleware agree on which
 * hostname is canonical — otherwise multi-domain/custom-domain flows
 * break.
 */
export function getClerkProxyHost(req: {
  headers: IncomingHttpHeaders;
}): string | undefined {
  const forwarded = req.headers["x-forwarded-host"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const firstHop = raw?.split(",")[0]?.trim();
  return firstHop || req.headers.host?.trim() || undefined;
}

/** Match frontend App.tsx — localhost must use env key, not publishableKeyFromHost. */
export function resolveClerkPublishableKey(
  req: { headers: IncomingHttpHeaders },
  fallback?: string,
): string {
  const host = getClerkProxyHost(req) ?? "";
  const isLocalHost =
    !host ||
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("[::1]");

  if (isLocalHost || process.env.NODE_ENV === "development") {
    const key = process.env.CLERK_PUBLISHABLE_KEY ?? fallback;
    if (!key) {
      throw new Error("CLERK_PUBLISHABLE_KEY is required for local development");
    }
    return key;
  }

  return publishableKeyFromHost(host, fallback);
}

/** Origins allowed in session token `azp` — required for local dev bearer auth. */
export function buildAuthorizedParties(): string[] | undefined {
  // Local dev: skip azp allowlist so LAN IPs (192.168.x.x) and localhost all work.
  if (process.env.NODE_ENV === "development") {
    return undefined;
  }

  const parties = new Set<string>();
  if (process.env.REPLIT_DEV_DOMAIN) {
    parties.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  }
  for (const domain of (process.env.REPLIT_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean)) {
    parties.add(`https://${domain}`);
  }

  return parties.size > 0 ? [...parties] : undefined;
}

export type ClerkMiddlewareConfig = {
  publishableKey: string;
  secretKey?: string;
  authorizedParties?: string[];
  clockSkewInMs?: number;
};

export function buildClerkMiddlewareConfig(req?: {
  headers: IncomingHttpHeaders;
}): ClerkMiddlewareConfig {
  const authorizedParties = buildAuthorizedParties();
  const secretKey = process.env.CLERK_SECRET_KEY;
  const isDev = process.env.NODE_ENV === "development";

  const publishableKey = isDev
    ? (process.env.CLERK_PUBLISHABLE_KEY ?? "")
    : resolveClerkPublishableKey(
        req ?? { headers: {} },
        process.env.CLERK_PUBLISHABLE_KEY,
      );

  if (!publishableKey) {
    throw new Error("CLERK_PUBLISHABLE_KEY is required");
  }

  return {
    publishableKey,
    secretKey,
    authorizedParties,
    clockSkewInMs: isDev ? 60_000 : 5_000,
  };
}

export function clerkProxyMiddleware(): RequestHandler {
  // Only run proxy in production — Clerk proxying doesn't work for dev instances
  if (process.env.NODE_ENV !== "production") {
    return (_req, _res, next) => next();
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    return (_req, _res, next) => next();
  }

  return createProxyMiddleware({
    target: CLERK_FAPI,
    changeOrigin: true,
    pathRewrite: (path: string) =>
      path.replace(new RegExp(`^${CLERK_PROXY_PATH}`), ""),
    on: {
      proxyReq: (proxyReq, req) => {
        const protocol = req.headers["x-forwarded-proto"] || "https";
        const host = getClerkProxyHost(req) || "";
        const proxyUrl = `${protocol}://${host}${CLERK_PROXY_PATH}`;

        proxyReq.setHeader("Clerk-Proxy-Url", proxyUrl);
        proxyReq.setHeader("Clerk-Secret-Key", secretKey);

        const xff = req.headers["x-forwarded-for"];
        const clientIp =
          (Array.isArray(xff) ? xff[0] : xff)?.split(",")[0]?.trim() ||
          req.socket?.remoteAddress ||
          "";
        if (clientIp) {
          proxyReq.setHeader("X-Forwarded-For", clientIp);
        }
      },
    },
  }) as RequestHandler;
}
