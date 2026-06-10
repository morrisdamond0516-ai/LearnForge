import { Router, type IRouter, type Request } from "express";
import { clerkClient } from "@clerk/express";
import { stripeStorage } from "../lib/stripeStorage";
import { stripeService } from "../lib/stripeService";
import { schoolStorage } from "../lib/schoolStorage";
import {
  getSchoolQuote,
  isSchoolPlan,
  SCHOOL_PLANS,
  type SchoolPlanKey,
} from "../lib/schoolPricing";

const router: IRouter = Router();

/** Public origin of the incoming request, for building redirect URLs. */
function appOrigin(req: Request): string {
  const headerOrigin = req.headers.origin;
  if (typeof headerOrigin === "string" && headerOrigin.startsWith("http")) {
    return headerOrigin.replace(/\/+$/, "");
  }
  const domain = (process.env.REPLIT_DOMAINS ?? "").split(",")[0]?.trim();
  if (domain) return `https://${domain}`;
  return `${req.protocol}://${req.get("host")}`;
}

async function getClerkEmail(userId: string): Promise<string | null> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const primary = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    );
    return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
  } catch {
    return null;
  }
}

/** Ensure the user has a Stripe customer, creating one on first checkout. */
async function ensureCustomerId(
  userId: string,
  email: string | null,
): Promise<string> {
  await stripeStorage.getOrCreateUser(userId, email);
  const existing = await stripeStorage.getUser(userId);
  if (existing?.stripeCustomerId) return existing.stripeCustomerId;

  const customer = await stripeService.createCustomer(email, userId);
  await stripeStorage.updateUserStripeInfo(userId, {
    stripeCustomerId: customer.id,
  });
  return customer.id;
}

// Start a self-serve bulk seat purchase. The price is computed server-side from
// the plan + quantity (anti-tamper) and charged as a one-time Stripe payment.
router.post("/school/checkout", async (req, res) => {
  const userId = req.userId!;
  const plan = req.body?.plan;
  const quantity = Number(req.body?.quantity);

  if (!isSchoolPlan(plan)) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }
  const quote = getSchoolQuote(plan, quantity);
  if (!quote) {
    res.status(400).json({ error: "Invalid number of seats" });
    return;
  }

  try {
    const email = await getClerkEmail(userId);
    const customerId = await ensureCustomerId(userId, email);
    const origin = appOrigin(req);

    const session = await stripeService.createBulkCheckoutSession({
      customerId,
      perSeatCents: quote.perSeatCents,
      quantity: quote.quantity,
      currency: quote.currency,
      productName: `LearnForge Pro — ${SCHOOL_PLANS[plan].label} (${quote.quantity} student seats)`,
      metadata: {
        kind: "school_bulk",
        plan,
        quantity: String(quote.quantity),
        durationDays: String(quote.durationDays),
      },
      successUrl: `${origin}/school-codes?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/pricing?bulk=cancelled`,
    });

    res.json({ url: session.url });
  } catch (err) {
    req.log.error({ err }, "School bulk checkout failed");
    res.status(500).json({ error: "Could not start checkout" });
  }
});

// Verify a paid bulk-purchase session and return its minted access codes.
// Minting is idempotent (keyed by the session id) so this is safe to re-call.
router.get("/school/order/:sessionId", async (req, res) => {
  const userId = req.userId!;
  const sessionId = req.params.sessionId;

  try {
    const session = await stripeService.retrieveCheckoutSession(sessionId);

    if (session.metadata?.kind !== "school_bulk") {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Only the buyer (the customer the session was created for) may view codes.
    const user = await stripeStorage.getUser(userId);
    const sessionCustomer =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;
    if (!user?.stripeCustomerId || user.stripeCustomerId !== sessionCustomer) {
      res.status(403).json({ error: "This order belongs to another account" });
      return;
    }

    if (session.payment_status !== "paid") {
      res.json({ status: "pending" });
      return;
    }

    const plan = session.metadata?.plan;
    const quantity = Number(session.metadata?.quantity);
    const durationDays = Number(session.metadata?.durationDays);
    if (
      !isSchoolPlan(plan) ||
      !Number.isInteger(quantity) ||
      !Number.isInteger(durationDays)
    ) {
      res.status(400).json({ error: "Order is malformed" });
      return;
    }

    // Defense in depth: the amount actually paid must match the server's
    // authoritative quote for this plan+quantity. Guards against any drift
    // between the session we created and what gets settled.
    const quote = getSchoolQuote(plan, quantity);
    if (!quote || session.amount_total !== quote.totalCents) {
      req.log.error(
        { sessionId, amountTotal: session.amount_total },
        "School order amount mismatch",
      );
      res.status(400).json({ error: "Order amount mismatch" });
      return;
    }

    const result = await schoolStorage.recordOrderAndMint({
      sessionId,
      buyerUserId: userId,
      buyerEmail: session.customer_details?.email ?? null,
      plan: plan as SchoolPlanKey,
      quantity,
      durationDays,
      amountTotalCents: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
    });

    if (result === "forbidden") {
      res.status(403).json({ error: "This order belongs to another account" });
      return;
    }

    res.json({
      status: "ready",
      plan: result.plan,
      planLabel: SCHOOL_PLANS[result.plan].label,
      quantity: result.quantity,
      durationDays: result.durationDays,
      amountTotalCents: result.amountTotalCents,
      currency: result.currency,
      codes: result.codes,
    });
  } catch (err) {
    req.log.error({ err }, "School order verification failed");
    res.status(500).json({ error: "Could not load your order" });
  }
});

export default router;
