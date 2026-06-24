import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Owner-only revenue/payments snapshot for the Site Stats dashboard.
 *
 * Pulls from every channel money can arrive through:
 * - Stripe charges (covers BOTH Pro subscriptions and school bulk-seat
 *   one-time payments — both flow through Stripe Checkout, so the charges
 *   table is the single source of truth for Stripe revenue and we never
 *   double-count bulk orders separately),
 * - PayPal one-time purchases (`paypal_purchases`),
 * and reports supporting context (active subscriptions by plan, redeemed
 * access codes, school bulk orders).
 *
 * Every Stripe query is wrapped defensively: if Stripe is disconnected the
 * `stripe.*` synced schema may not exist, so failures degrade to zeros with
 * `stripeAvailable = false` rather than breaking the whole dashboard.
 */

export interface RecentPayment {
  source: "stripe" | "paypal";
  who: string | null;
  description: string;
  amountCents: number;
  currency: string;
  date: string;
}

export interface PaymentsSummary {
  stripeAvailable: boolean;
  currency: string;
  totalRevenueCents: number;
  netRevenueCents: number;
  refundedCents: number;
  byMethod: { stripe: number; paypal: number };
  paidOrders: number;
  activeSubscriptions: number;
  subscriptionsByPlan: { plan: string; count: number }[];
  redeemedCodes: number;
  bulkOrders: number;
  recent: RecentPayment[];
}

const n = (v: unknown): number => {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
};

export async function getPaymentsSummary(): Promise<PaymentsSummary> {
  let stripeAvailable = true;
  let stripeGrossCents = 0;
  let stripeRefundedCents = 0;
  let stripeOrders = 0;
  let currency = "usd";
  let activeSubscriptions = 0;
  let subscriptionsByPlan: { plan: string; count: number }[] = [];
  const recent: RecentPayment[] = [];

  // --- Stripe charges (subscriptions + bulk school orders) ---
  try {
    const charges = await db.execute(sql`
      SELECT
        COUNT(*)::int AS n,
        COALESCE(SUM(amount), 0)::bigint AS gross,
        COALESCE(SUM(amount_refunded), 0)::bigint AS refunded,
        COALESCE(MODE() WITHIN GROUP (ORDER BY currency), 'usd') AS currency
      FROM stripe.charges
      WHERE status = 'succeeded'
    `);
    const row = charges.rows[0] as
      | { n?: number; gross?: number; refunded?: number; currency?: string }
      | undefined;
    stripeOrders = n(row?.n);
    stripeGrossCents = n(row?.gross);
    stripeRefundedCents = n(row?.refunded);
    if (row?.currency) currency = row.currency;
  } catch {
    stripeAvailable = false;
  }

  // --- Active subscriptions + plan breakdown ---
  if (stripeAvailable) {
    try {
      const subs = await db.execute(sql`
        SELECT
          COALESCE(pr.metadata->>'plan', prod.name, 'Subscription') AS plan,
          COUNT(DISTINCT s.id)::int AS n
        FROM stripe.subscriptions s
        LEFT JOIN stripe.subscription_items si ON si.subscription = s.id
        LEFT JOIN stripe.prices pr ON pr.id = si.price
        LEFT JOIN stripe.products prod ON prod.id = pr.product
        WHERE s.status IN ('active', 'trialing', 'past_due')
        GROUP BY 1
        ORDER BY n DESC
      `);
      subscriptionsByPlan = (
        subs.rows as { plan?: string; n?: number }[]
      ).map((r) => ({ plan: r.plan ?? "Subscription", count: n(r.n) }));
      activeSubscriptions = subscriptionsByPlan.reduce(
        (sum, r) => sum + r.count,
        0,
      );
    } catch {
      // best-effort; leave defaults
    }

    // --- Recent Stripe charges ---
    try {
      const rc = await db.execute(sql`
        SELECT
          c.amount::bigint AS cents,
          c.currency,
          c.description,
          cust.email AS email,
          to_char(to_timestamp(c.created), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created
        FROM stripe.charges c
        LEFT JOIN stripe.customers cust ON cust.id = c.customer
        WHERE c.status = 'succeeded'
        ORDER BY c.created DESC NULLS LAST
        LIMIT 15
      `);
      for (const r of rc.rows as {
        cents?: number;
        currency?: string;
        description?: string | null;
        email?: string | null;
        created?: string | null;
      }[]) {
        recent.push({
          source: "stripe",
          who: r.email ?? null,
          description: r.description?.trim() || "Stripe payment",
          amountCents: n(r.cents),
          currency: r.currency ?? currency,
          date: r.created ?? new Date().toISOString(),
        });
      }
    } catch {
      // best-effort
    }
  }

  // --- PayPal one-time purchases ---
  let paypalCents = 0;
  let paypalOrders = 0;
  try {
    const pp = await db.execute(sql`
      SELECT
        COUNT(*)::int AS n,
        COALESCE(SUM(amount::numeric), 0) AS dollars
      FROM paypal_purchases
    `);
    const row = pp.rows[0] as { n?: number; dollars?: number } | undefined;
    paypalOrders = n(row?.n);
    paypalCents = Math.round(n(row?.dollars) * 100);

    const rpp = await db.execute(sql`
      SELECT
        (p.amount::numeric * 100)::bigint AS cents,
        p.currency,
        p.plan,
        u.email AS email,
        to_char(p.captured_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created
      FROM paypal_purchases p
      LEFT JOIN users u ON u.id = p.user_id
      ORDER BY p.captured_at DESC
      LIMIT 15
    `);
    for (const r of rpp.rows as {
      cents?: number;
      currency?: string;
      plan?: string | null;
      email?: string | null;
      created?: string | null;
    }[]) {
      recent.push({
        source: "paypal",
        who: r.email ?? null,
        description: r.plan ? `PayPal: ${r.plan}` : "PayPal payment",
        amountCents: n(r.cents),
        currency: r.currency ?? currency,
        date: r.created ?? new Date().toISOString(),
      });
    }
  } catch {
    // paypal table always exists in our schema; ignore if it somehow fails
  }

  // --- Redeemed access codes + school bulk orders (context) ---
  let redeemedCodes = 0;
  let bulkOrders = 0;
  try {
    const codes = await db.execute(sql`
      SELECT COUNT(*)::int AS n FROM access_codes WHERE status = 'redeemed'
    `);
    redeemedCodes = n((codes.rows[0] as { n?: number } | undefined)?.n);
  } catch {
    // ignore
  }
  try {
    const orders = await db.execute(sql`SELECT COUNT(*)::int AS n FROM bulk_orders`);
    bulkOrders = n((orders.rows[0] as { n?: number } | undefined)?.n);
  } catch {
    // ignore
  }

  // Sort the combined recent list newest-first, cap at 20.
  recent.sort((a, b) => b.date.localeCompare(a.date));
  const recentCapped = recent.slice(0, 20);

  const totalRevenueCents = stripeGrossCents + paypalCents;
  const netRevenueCents = totalRevenueCents - stripeRefundedCents;

  return {
    stripeAvailable,
    currency,
    totalRevenueCents,
    netRevenueCents,
    refundedCents: stripeRefundedCents,
    byMethod: { stripe: stripeGrossCents, paypal: paypalCents },
    paidOrders: stripeOrders + paypalOrders,
    activeSubscriptions,
    subscriptionsByPlan,
    redeemedCodes,
    bulkOrders,
    recent: recentCapped,
  };
}
