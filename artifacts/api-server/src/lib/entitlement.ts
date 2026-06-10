import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { stripeStorage } from "./stripeStorage";

export type EntitlementSource = "stripe" | "code" | "none";

export interface Entitlement {
  pro: boolean;
  source: EntitlementSource;
  /** ISO timestamp the Pro access runs until, when known (code/PayPal grants). */
  until: string | null;
}

/** Stripe subscription statuses that count as currently entitled. */
const ACTIVE_STRIPE_STATUSES = new Set(["active", "trialing", "past_due"]);

/**
 * Resolve whether a user currently has Pro access, from any source:
 * an active Stripe subscription, or a non-Stripe grant (`users.pro_until`)
 * from a redeemed access code or a one-time PayPal purchase.
 *
 * Stripe takes precedence in reporting since it is auto-renewing.
 */
export async function getEntitlement(userId: string): Promise<Entitlement> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

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

  return { pro: false, source: "none", until: null };
}
