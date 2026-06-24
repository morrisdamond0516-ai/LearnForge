import { Router, type IRouter, type Request, type Response } from "express";
import { getAuth } from "@clerk/express";
import { db, analyticsEventsTable, usersTable } from "@workspace/db";
import {
  and,
  gte,
  eq,
  ne,
  isNotNull,
  desc,
  count,
  countDistinct,
  sql,
} from "drizzle-orm";
import { isOwnerEmail } from "../lib/ownership";

/**
 * Public, unauthenticated endpoint that records site activity. Mounted BEFORE
 * `requireAuth` so anonymous visitors (landing page, pricing, etc.) are counted.
 * Signed-in visitors are tagged with their Clerk id when a session is present.
 */
export const analyticsPublicRouter: IRouter = Router();

// Free-form, but bounded: clamp incoming strings so the table stays tidy and
// abuse-resistant. Returns null when the value is missing/blank/not a string.
function clampStr(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

// Lightweight in-memory, per-IP fixed-window rate limit. Since /analytics/track
// is public and writes to the DB, this caps spam/poisoning and insert-flood
// abuse without a dependency. Over-limit requests are dropped silently (204) so
// the client UI never sees an error. Bounded memory: the map is swept each
// window and capped, so a flood of distinct IPs can't grow it without bound.
const RL_WINDOW_MS = 60_000;
const RL_MAX_PER_WINDOW = 120;
const RL_MAX_KEYS = 20_000;
const rlHits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rlHits.get(ip);
  if (!entry || now >= entry.resetAt) {
    if (rlHits.size > RL_MAX_KEYS) {
      for (const [key, val] of rlHits) {
        if (now >= val.resetAt) rlHits.delete(key);
      }
      // Still oversized (sustained distinct-IP flood): drop the oldest-style
      // reset by clearing everything rather than growing unbounded.
      if (rlHits.size > RL_MAX_KEYS) rlHits.clear();
    }
    rlHits.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RL_MAX_PER_WINDOW;
}

analyticsPublicRouter.post(
  "/analytics/track",
  async (req: Request, res: Response): Promise<void> => {
    if (rateLimited(req.ip ?? "unknown")) {
      res.status(204).end();
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const type = clampStr(body.type, 64);
    const sessionId = clampStr(body.sessionId, 128);
    // Tracking is best-effort: never surface a hard error to the client UI.
    if (!type || !sessionId) {
      res.status(204).end();
      return;
    }
    const path = clampStr(body.path, 512);
    const referrer = clampStr(body.referrer, 512);
    const userId = getAuth(req)?.userId ?? null;

    try {
      await db.insert(analyticsEventsTable).values({
        eventType: type,
        path: path ?? null,
        referrer: referrer ?? null,
        sessionId,
        userId,
      });
    } catch (err) {
      req.log.warn({ err }, "analytics track insert failed");
    }
    res.status(204).end();
  },
);

/**
 * Owner-only Site Stats. Mounted AFTER `requireAuth`; each handler additionally
 * checks the caller is the app owner so visitor data is never exposed to
 * regular users.
 */
export const analyticsRouter: IRouter = Router();

async function requireOwner(
  req: Request,
  res: Response,
): Promise<boolean> {
  const [user] = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!));
  if (!isOwnerEmail(user?.email)) {
    res.status(403).json({ error: "Owner access only" });
    return false;
  }
  return true;
}

const num = (v: unknown): number => Number(v ?? 0);

analyticsRouter.get(
  "/analytics/summary",
  async (req: Request, res: Response): Promise<void> => {
    if (!(await requireOwner(req, res))) return;

    const days = Math.min(
      Math.max(parseInt(String(req.query.days ?? "30"), 10) || 30, 1),
      365,
    );
    const since = new Date(Date.now() - days * 86400000);
    const inRange = gte(analyticsEventsTable.createdAt, since);

    try {
      const [totals] = await db
        .select({
          pageviews: sql<number>`count(*) filter (where ${analyticsEventsTable.eventType} = 'pageview')`,
          events: count(),
          uniqueVisitors: countDistinct(analyticsEventsTable.sessionId),
          signedInVisitors: countDistinct(analyticsEventsTable.userId),
        })
        .from(analyticsEventsTable)
        .where(inRange);

      const daily = await db
        .select({
          day: sql<string>`to_char(date_trunc('day', ${analyticsEventsTable.createdAt}), 'YYYY-MM-DD')`,
          pageviews: sql<number>`count(*) filter (where ${analyticsEventsTable.eventType} = 'pageview')`,
          visitors: sql<number>`count(distinct ${analyticsEventsTable.sessionId})`,
        })
        .from(analyticsEventsTable)
        .where(inRange)
        .groupBy(sql`1`)
        .orderBy(sql`1`);

      const topPaths = await db
        .select({
          path: analyticsEventsTable.path,
          views: count(),
        })
        .from(analyticsEventsTable)
        .where(
          and(
            inRange,
            eq(analyticsEventsTable.eventType, "pageview"),
            isNotNull(analyticsEventsTable.path),
          ),
        )
        .groupBy(analyticsEventsTable.path)
        .orderBy(desc(count()))
        .limit(12);

      const topEvents = await db
        .select({
          type: analyticsEventsTable.eventType,
          count: count(),
        })
        .from(analyticsEventsTable)
        .where(and(inRange, ne(analyticsEventsTable.eventType, "pageview")))
        .groupBy(analyticsEventsTable.eventType)
        .orderBy(desc(count()))
        .limit(20);

      const recent = await db
        .select({
          eventType: analyticsEventsTable.eventType,
          path: analyticsEventsTable.path,
          userId: analyticsEventsTable.userId,
          createdAt: analyticsEventsTable.createdAt,
        })
        .from(analyticsEventsTable)
        .where(inRange)
        .orderBy(desc(analyticsEventsTable.createdAt))
        .limit(25);

      res.json({
        days,
        since: since.toISOString(),
        totals: {
          pageviews: num(totals?.pageviews),
          events: num(totals?.events),
          uniqueVisitors: num(totals?.uniqueVisitors),
          signedInVisitors: num(totals?.signedInVisitors),
        },
        daily: daily.map((d) => ({
          day: d.day,
          pageviews: num(d.pageviews),
          visitors: num(d.visitors),
        })),
        topPaths: topPaths.map((p) => ({
          path: p.path ?? "(unknown)",
          views: num(p.views),
        })),
        topEvents: topEvents.map((e) => ({
          type: e.type,
          count: num(e.count),
        })),
        recent: recent.map((r) => ({
          eventType: r.eventType,
          path: r.path,
          signedIn: !!r.userId,
          createdAt: r.createdAt.toISOString(),
        })),
      });
    } catch (err) {
      req.log.error({ err }, "analytics summary failed");
      res.status(500).json({ error: "Failed to load analytics" });
    }
  },
);
