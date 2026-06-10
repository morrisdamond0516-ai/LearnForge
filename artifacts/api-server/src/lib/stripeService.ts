import type Stripe from "stripe";
import { getUncachableStripeClient } from "./stripeClient";

/**
 * Thin wrapper around direct Stripe API write operations. Reads come from the
 * synced `stripe` schema via stripeStorage; writes go through the API here.
 */
export const stripeService = {
  async createCustomer(email: string | null, userId: string) {
    const stripe = await getUncachableStripeClient();
    return stripe.customers.create({
      email: email ?? undefined,
      metadata: { userId },
    });
  },

  /**
   * Subscription checkout with ALL eligible payment methods enabled.
   * We deliberately omit `payment_method_types` so Stripe Checkout shows every
   * payment method enabled in the Dashboard (cards, Apple Pay, Google Pay, Link,
   * Klarna, Afterpay/Cash App, bank debits, etc.) for the customer's locale.
   */
  async createCheckoutSession(opts: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
  }): Promise<Stripe.Checkout.Session> {
    const stripe = await getUncachableStripeClient();
    return stripe.checkout.sessions.create({
      customer: opts.customerId,
      mode: "subscription",
      line_items: [{ price: opts.priceId, quantity: 1 }],
      // No payment_method_types => Stripe enables all eligible methods.
      automatic_tax: { enabled: false },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      subscription_data: opts.trialDays
        ? { trial_period_days: opts.trialDays }
        : undefined,
      success_url: opts.successUrl,
      cancel_url: opts.cancelUrl,
    });
  },

  async createBillingPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  },

  /** Fallback price resolution straight from Stripe by lookup key. */
  async findPriceIdByLookupKey(plan: string): Promise<string | null> {
    const stripe = await getUncachableStripeClient();
    const prices = await stripe.prices.list({
      lookup_keys: [plan],
      active: true,
      limit: 1,
    });
    return prices.data[0]?.id ?? null;
  },
};
