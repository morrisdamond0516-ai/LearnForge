import { Router, type IRouter, type Request } from "express";
import { clerkClient } from "@clerk/express";
import { stripeStorage } from "../lib/stripeStorage";
import { stripeService } from "../lib/stripeService";

const router: IRouter = Router();

const PLAN_KEYS = ["pro_monthly", "pro_annual"] as const;
type PlanKey = (typeof PLAN_KEYS)[number];

// Adults get 6 months free before the first charge (matches the pricing page).
const TRIAL_DAYS = 180;

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
    return (
      primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null
    );
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

// Create a subscription checkout session for a plan.
router.post("/stripe/checkout", async (req, res) => {
  const userId = req.userId!;
  const plan = req.body?.plan as string | undefined;

  if (!plan || !PLAN_KEYS.includes(plan as PlanKey)) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  try {
    const priceId =
      (await stripeStorage.getPriceIdByPlan(plan)) ??
      (await stripeService.findPriceIdByLookupKey(plan));

    if (!priceId) {
      res.status(503).json({
        error:
          "Plans are not set up yet. Please run the product seed script first.",
      });
      return;
    }

    const email = await getClerkEmail(userId);
    const customerId = await ensureCustomerId(userId, email);
    const origin = appOrigin(req);

    const session = await stripeService.createCheckoutSession({
      customerId,
      priceId,
      trialDays: TRIAL_DAYS,
      successUrl: `${origin}/?checkout=success`,
      cancelUrl: `${origin}/pricing?checkout=cancelled`,
    });

    res.json({ url: session.url });
  } catch (err) {
    req.log.error({ err }, "Stripe checkout failed");
    res.status(500).json({ error: "Could not start checkout" });
  }
});

// Open the Stripe customer billing portal (manage / cancel subscription).
router.post("/stripe/portal", async (req, res) => {
  const userId = req.userId!;
  try {
    const user = await stripeStorage.getUser(userId);
    if (!user?.stripeCustomerId) {
      res.status(400).json({ error: "No billing account yet" });
      return;
    }
    const origin = appOrigin(req);
    const session = await stripeService.createBillingPortalSession(
      user.stripeCustomerId,
      `${origin}/pricing`,
    );
    res.json({ url: session.url });
  } catch (err) {
    req.log.error({ err }, "Stripe portal failed");
    res.status(500).json({ error: "Could not open billing portal" });
  }
});

// Current subscription status for the signed-in user.
router.get("/stripe/subscription", async (req, res) => {
  const userId = req.userId!;
  try {
    const user = await stripeStorage.getUser(userId);
    if (!user?.stripeCustomerId) {
      res.json({ subscription: null });
      return;
    }
    const subscription = await stripeStorage.getActiveSubscriptionForCustomer(
      user.stripeCustomerId,
    );
    res.json({ subscription });
  } catch (err) {
    req.log.error({ err }, "Stripe subscription lookup failed");
    res.status(500).json({ error: "Could not load subscription" });
  }
});

// Active products with their prices (synced from Stripe).
router.get("/stripe/products-with-prices", async (req, res) => {
  try {
    const data = await stripeStorage.listProductsWithPrices();
    res.json({ data });
  } catch (err) {
    req.log.error({ err }, "Stripe product listing failed");
    res.status(500).json({ error: "Could not load products" });
  }
});

export default router;
