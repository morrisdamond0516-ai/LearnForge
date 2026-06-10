import { getPayPalContext } from "./paypalClient";

/**
 * PayPal one-time purchases used as a fallback for learners in countries Stripe
 * does not fully cover. A purchase grants a fixed Pro period (it does NOT
 * auto-renew like Stripe). The granted duration and price are server-defined
 * here and verified on capture, so the client cannot tamper with what it pays
 * for or what it receives.
 */

export type PayPalPlanKey = "pro_monthly" | "pro_annual";

interface PayPalPlanDef {
  /** Decimal price string PayPal expects, e.g. "12.99". */
  amount: string;
  currency: string;
  /** Days of Pro granted by this one-time purchase. */
  durationDays: number;
  label: string;
}

export const PAYPAL_PLANS: Record<PayPalPlanKey, PayPalPlanDef> = {
  pro_monthly: {
    amount: "12.99",
    currency: "USD",
    durationDays: 30,
    label: "LearnForge Pro — 1 month",
  },
  pro_annual: {
    amount: "89.99",
    currency: "USD",
    durationDays: 365,
    label: "LearnForge Pro — 1 year",
  },
};

export function isPayPalPlan(value: unknown): value is PayPalPlanKey {
  return value === "pro_monthly" || value === "pro_annual";
}

export interface CreatedOrder {
  orderId: string;
}

export interface CapturedOrder {
  status: string;
  plan: PayPalPlanKey;
  durationDays: number;
  /** The amount actually captured (verified against the plan price). */
  amount: string;
  currency: string;
}

interface PayPalOrderResponse {
  status?: string;
  purchase_units?: Array<{
    reference_id?: string;
    custom_id?: string;
    payments?: {
      captures?: Array<{
        status?: string;
        amount?: { currency_code?: string; value?: string };
      }>;
    };
  }>;
}

/**
 * Validate a completed PayPal order response server-side: status COMPLETED, a
 * recognized plan stamped on the order, a completed capture, and a captured
 * amount/currency that matches the plan price (anti-tamper). Returns the
 * resolved plan + duration + captured amount.
 */
function validateCompletedOrder(json: PayPalOrderResponse): CapturedOrder {
  if (json.status !== "COMPLETED") {
    throw new Error(`PayPal order not completed (status: ${json.status})`);
  }

  const unit = json.purchase_units?.[0];
  const planKey = unit?.custom_id ?? unit?.reference_id;
  if (!isPayPalPlan(planKey)) {
    throw new Error("PayPal order is missing a recognized plan reference");
  }
  const def = PAYPAL_PLANS[planKey];

  const capture = unit?.payments?.captures?.[0];
  if (!capture || capture.status !== "COMPLETED") {
    throw new Error("PayPal capture was not completed");
  }
  // Anti-tamper: the money actually captured must match the plan price.
  if (
    capture.amount?.value !== def.amount ||
    capture.amount?.currency_code !== def.currency
  ) {
    throw new Error("PayPal captured amount does not match the plan price");
  }

  return {
    status: json.status,
    plan: planKey,
    durationDays: def.durationDays,
    amount: def.amount,
    currency: def.currency,
  };
}

export const paypalService = {
  /** Create a one-time CAPTURE order for a plan. Plan is stamped on the order. */
  async createOrder(plan: PayPalPlanKey): Promise<CreatedOrder> {
    const def = PAYPAL_PLANS[plan];
    const { accessToken, apiBase } = await getPayPalContext();

    const resp = await fetch(`${apiBase}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: plan,
            custom_id: plan,
            description: def.label,
            amount: {
              currency_code: def.currency,
              value: def.amount,
            },
          },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`PayPal create order failed: ${resp.status} ${text}`);
    }
    const json = (await resp.json()) as { id?: string };
    if (!json.id) throw new Error("PayPal create order returned no id");
    return { orderId: json.id };
  },

  /** Fetch an order's current state (used to recover already-captured orders). */
  async getOrder(orderId: string): Promise<CapturedOrder> {
    const { accessToken, apiBase } = await getPayPalContext();
    const resp = await fetch(
      `${apiBase}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`PayPal get order failed: ${resp.status} ${text}`);
    }
    return validateCompletedOrder((await resp.json()) as PayPalOrderResponse);
  },

  /**
   * Capture an approved order and validate it server-side: status COMPLETED,
   * and the captured amount/currency matches the plan stamped on the order.
   * Returns the resolved plan + duration + amount so the caller can grant
   * entitlement. If the order was already captured (a retry after a transient
   * failure), it falls back to reading the existing order so the grant can
   * still be reconciled idempotently rather than failing.
   */
  async captureOrder(orderId: string): Promise<CapturedOrder> {
    const { accessToken, apiBase } = await getPayPalContext();

    const resp = await fetch(
      `${apiBase}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      // Already captured (e.g. a retried capture): recover via GET so the
      // caller can still grant/reconcile entitlement idempotently.
      if (/ORDER_ALREADY_CAPTURED/.test(text)) {
        return this.getOrder(orderId);
      }
      throw new Error(`PayPal capture failed: ${resp.status} ${text}`);
    }

    return validateCompletedOrder((await resp.json()) as PayPalOrderResponse);
  },
};
