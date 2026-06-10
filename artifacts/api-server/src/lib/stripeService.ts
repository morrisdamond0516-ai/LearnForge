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

  /**
   * One-time (mode: payment) checkout for a school bulk seat purchase. Uses
   * inline `price_data` so the per-seat amount comes straight from the server's
   * authoritative quote; quantity is the number of student seats. As with the
   * subscription checkout, `payment_method_types` is omitted so all eligible
   * methods are offered. `metadata` is echoed back on the session for fulfilment.
   */
  async createBulkCheckoutSession(opts: {
    customerId: string;
    perSeatCents: number;
    quantity: number;
    currency: string;
    productName: string;
    metadata: Record<string, string>;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    const stripe = await getUncachableStripeClient();
    return stripe.checkout.sessions.create({
      customer: opts.customerId,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: opts.currency,
            unit_amount: opts.perSeatCents,
            product_data: { name: opts.productName },
          },
          quantity: opts.quantity,
        },
      ],
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: opts.metadata,
      success_url: opts.successUrl,
      cancel_url: opts.cancelUrl,
    });
  },

  /** Retrieve a checkout session (used to verify payment before fulfilment). */
  async retrieveCheckoutSession(
    sessionId: string,
  ): Promise<Stripe.Checkout.Session> {
    const stripe = await getUncachableStripeClient();
    return stripe.checkout.sessions.retrieve(sessionId);
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
