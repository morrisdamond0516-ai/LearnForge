import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { stripeStorage } from "./stripeStorage";
import { isOwnerEmail } from "./ownership";
import { isMinor, juniorWindowEnd } from "./age";

export type EntitlementSource =
  | "owner"
  | "stripe"
  | "code"
  | "junior_trial"
  | "none";

export interface Entitlement {
  pro: boolean;
  source: EntitlementSource;
  /** ISO timestamp the Pro access runs until, when known. */
  until: string | null;
}

/** Stripe subscription statuses that count as currently entitled. */
const ACTIVE_STRIPE_STATUSES = new Set(["active", "trialing", "past_due"]);

/**
 * Resolve whether a user currently has Pro access, from any source:
 * - the web app owner (free forever),
 * - an active Stripe subscription,
 * - a non-Stripe grant (`users.pro_until`) from an access code or PayPal,
 * - an under-18 learner still inside their 9-month free window.
 *
 * Owner > Stripe > grant > junior free window in reporting precedence.
 */
export async function getEntitlement(userId: string): Promise<Entitlement> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  // Owner account: everything free, always.
  if (isOwnerEmail(user?.email)) {
    return { pro: true, source: "owner", until: null };
  }

  // Active Stripe subscription?
  if (user?.stripeCustomerId) {
    try {
      const sub = (await stripeStorage.getActiveSubscriptionForCustomer(
        user.stripeCustomerId,
      )) as { status?: string } | null;
      if (sub?.status && ACTIVE_STRIPE_STATUSES.has(sub.status)) {
        return { pro: true, source: "stripe", until: null };
      }
    } catch {
      // Stripe schema may be unavailable if disconnected; fall through.
    }
  }

  // Non-Stripe grant (access code / PayPal one-time).
  if (user?.proUntil && user.proUntil.getTime() > Date.now()) {
    return { pro: true, source: "code", until: user.proUntil.toISOString() };
  }

  // Under-18 learners get 9 free months from signup before any charge.
  if (user && isMinor(user.birthDate)) {
    const windowEnd = juniorWindowEnd(user.createdAt);
    if (Date.now() < windowEnd.getTime()) {
      return {
        pro: true,
        source: "junior_trial",
        until: windowEnd.toISOString(),
      };
    }
  }

  return { pro: false, source: "none", until: null };
}
