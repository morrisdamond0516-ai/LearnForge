import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

/**
 * Reads Stripe data from the auto-synced `stripe` schema (managed by
 * stripe-replit-sync) and manages the application `users` table that links a
 * Clerk user to their Stripe customer/subscription.
 *
 * NEVER write to the `stripe` schema here -- it is kept up to date by webhooks.
 */
export const stripeStorage = {
  async getUser(id: string) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user ?? null;
  },

  /** Ensure a users row exists for this Clerk user, keeping email fresh. */
  async getOrCreateUser(id: string, email: string | null) {
    const [user] = await db
      .insert(usersTable)
      .values({ id, email })
      .onConflictDoUpdate({
        target: usersTable.id,
        set: { email: email ?? sql`${usersTable.email}` },
      })
      .returning();
    return user;
  },

  async updateUserStripeInfo(
    userId: string,
    info: { stripeCustomerId?: string; stripeSubscriptionId?: string },
  ) {
    const [user] = await db
      .update(usersTable)
      .set(info)
      .where(eq(usersTable.id, userId))
      .returning();
    return user;
  },

  /** Resolve a real Stripe price id from the plan key stored in price metadata. */
  async getPriceIdByPlan(plan: string): Promise<string | null> {
    const result = await db.execute(
      sql`SELECT id FROM stripe.prices
          WHERE active = true AND metadata->>'plan' = ${plan}
          ORDER BY created DESC NULLS LAST
          LIMIT 1`,
    );
    const row = result.rows[0] as { id?: string } | undefined;
    return row?.id ?? null;
  },

  /** Most recent non-canceled subscription for a customer, if any. */
  async getActiveSubscriptionForCustomer(customerId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions
          WHERE customer = ${customerId}
          ORDER BY created DESC NULLS LAST
          LIMIT 1`,
    );
    return result.rows[0] ?? null;
  },

  /** Active products joined with their active prices, grouped per product. */
  async listProductsWithPrices() {
    const result = await db.execute(
      sql`
        SELECT
          p.id AS product_id,
          p.name AS product_name,
          p.description AS product_description,
          p.metadata AS product_metadata,
          pr.id AS price_id,
          pr.unit_amount,
          pr.currency,
          pr.recurring,
          pr.metadata AS price_metadata
        FROM stripe.products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.active = true
        ORDER BY p.id, pr.unit_amount
      `,
    );

    type Row = {
      product_id: string;
      product_name: string | null;
      product_description: string | null;
      product_metadata: Record<string, unknown> | null;
      price_id: string | null;
      unit_amount: number | null;
      currency: string | null;
      recurring: unknown;
      price_metadata: Record<string, unknown> | null;
    };

    const byProduct = new Map<
      string,
      {
        id: string;
        name: string | null;
        description: string | null;
        metadata: Record<string, unknown> | null;
        prices: Array<{
          id: string;
          unitAmount: number | null;
          currency: string | null;
          recurring: unknown;
          metadata: Record<string, unknown> | null;
        }>;
      }
    >();

    for (const raw of result.rows as Row[]) {
      if (!byProduct.has(raw.product_id)) {
        byProduct.set(raw.product_id, {
          id: raw.product_id,
          name: raw.product_name,
          description: raw.product_description,
          metadata: raw.product_metadata,
          prices: [],
        });
      }
      if (raw.price_id) {
        byProduct.get(raw.product_id)!.prices.push({
          id: raw.price_id,
          unitAmount: raw.unit_amount,
          currency: raw.currency,
          recurring: raw.recurring,
          metadata: raw.price_metadata,
        });
      }
    }

    return Array.from(byProduct.values());
  },
};
