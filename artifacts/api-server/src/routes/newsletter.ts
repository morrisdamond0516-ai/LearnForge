import { Router, type IRouter, type Request, type Response } from "express";
import { subscribeNewsletter } from "../lib/resend";

export const newsletterPublicRouter: IRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RL_WINDOW_MS = 60 * 60 * 1000;
const RL_MAX_PER_WINDOW = 5;
const rlHits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rlHits.get(ip);
  if (!entry || now >= entry.resetAt) {
    rlHits.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RL_MAX_PER_WINDOW;
}

function clientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() || "unknown";
  return req.socket.remoteAddress ?? "unknown";
}

newsletterPublicRouter.post("/newsletter/subscribe", async (req: Request, res: Response) => {
  if (rateLimited(clientIp(req))) {
    res.status(429).json({ error: "Too many signup attempts. Try again later." });
    return;
  }

  const body = req.body as { email?: unknown; source?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const source =
    typeof body.source === "string" && body.source.trim()
      ? body.source.trim().slice(0, 80)
      : "learnforge";

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    res.status(400).json({ error: "Please enter a valid email address." });
    return;
  }

  const result = await subscribeNewsletter(email, source);

  if (!result.ok) {
    if (result.reason === "not_configured") {
      res.status(503).json({ error: result.message });
      return;
    }
    res.status(502).json({ error: result.message });
    return;
  }

  res.json({
    ok: true,
    message: "You're subscribed. Check your inbox for a welcome email.",
  });
});

newsletterPublicRouter.get("/newsletter/status", (_req, res) => {
  const configured = Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      (process.env.RESEND_FROM?.trim() || process.env.RESEND_FROM_EMAIL?.trim()),
  );
  res.json({ configured });
});

export default newsletterPublicRouter;
