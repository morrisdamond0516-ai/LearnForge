import { pgTable, text, timestamp, date } from "drizzle-orm/pg-core";

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
  // Pro entitlement granted by non-Stripe means (redeemed access codes,
  // one-time PayPal purchases). A user is Pro if they have an active Stripe
  // subscription OR `proUntil` is in the future. Stripe-recurring access is
  // derived from the synced `stripe` schema and is NOT mirrored here.
  proUntil: timestamp("pro_until", { withTimezone: true }),
  // Self-reported date of birth (YYYY-MM-DD), captured during onboarding.
  // Used to identify under-18 learners (who get 9 free months, then the
  // low-cost Junior plan) and is immutable once set.
  birthDate: date("birth_date"),
  // Official-document age verification (required once a minor's 9 free months
  // end). Lifecycle: "none" -> "pending" (doc uploaded, awaiting owner review)
  // -> "approved" | "rejected".
  ageVerificationStatus: text("age_verification_status")
    .notNull()
    .default("none"),
  // Private object-storage path of the uploaded verification document
  // (name + date of birth). Locked to owner review; never publicly served.
  ageVerificationDocPath: text("age_verification_doc_path"),
  ageVerifiedAt: timestamp("age_verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
