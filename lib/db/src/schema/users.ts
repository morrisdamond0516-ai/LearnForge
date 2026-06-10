import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Application users keyed by their Clerk user id. Stores the link to the
 * customer's Stripe records. Stripe-owned data (products, prices, customers,
 * subscriptions) lives in the auto-managed `stripe` schema and is never
 * duplicated here — we only keep the foreign-key references.
 */
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
