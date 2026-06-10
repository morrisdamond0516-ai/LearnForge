import { Router, type IRouter } from "express";
import { clerkClient } from "@clerk/express";
import { paypalService, isPayPalPlan, PAYPAL_PLANS } from "../lib/paypalService";
import { getPayPalPublicConfig } from "../lib/paypalClient";
import { paypalStorage } from "../lib/paypalStorage";
import { getEntitlement } from "../lib/entitlement";

const router: IRouter = Router();

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

// Public-safe config for loading the PayPal JS SDK in the browser, plus the
// plan amounts so the UI can show what each one-time purchase costs/grants.
router.get("/paypal/config", async (req, res) => {
  try {
    const { clientId, environment } = await getPayPalPublicConfig();
    res.json({
      enabled: true,
      clientId,
      environment,
      currency: PAYPAL_PLANS.pro_monthly.currency,
      plans: Object.entries(PAYPAL_PLANS).map(([key, def]) => ({
        plan: key,
        amount: def.amount,
        currency: def.currency,
        durationDays: def.durationDays,
        label: def.label,
      })),
    });
  } catch (err) {
    req.log.warn({ err }, "PayPal config unavailable");
    // Not an error to the client: PayPal is simply not enabled yet.
    res.json({ enabled: false, plans: [] });
  }
});

// Create a one-time PayPal order for a plan; returns the order id to approve.
router.post("/paypal/create-order", async (req, res) => {
  const plan = req.body?.plan;
  if (!isPayPalPlan(plan)) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }
  try {
    const order = await paypalService.createOrder(plan);
    res.json(order);
  } catch (err) {
    req.log.error({ err }, "PayPal create order failed");
    res.status(500).json({ error: "Could not start PayPal checkout" });
  }
});

// Capture an approved order and grant the Pro entitlement period.
router.post("/paypal/capture", async (req, res) => {
  const userId = req.userId!;
  const orderId = req.body?.orderId;
  if (typeof orderId !== "string" || orderId.length === 0) {
    res.status(400).json({ error: "Missing order id" });
    return;
  }
  try {
    const captured = await paypalService.captureOrder(orderId);
    const email = await getClerkEmail(userId);
    // Record the purchase + grant entitlement atomically and idempotently
    // (keyed by PayPal order id, so a retried capture never grants twice).
    const { granted } = await paypalStorage.recordPurchaseAndGrant({
      orderId,
      userId,
      plan: captured.plan,
      durationDays: captured.durationDays,
      amount: captured.amount,
      currency: captured.currency,
      email,
    });
    const entitlement = await getEntitlement(userId);
    res.json({
      ok: true,
      grantedDays: captured.durationDays,
      alreadyProcessed: !granted,
      entitlement,
    });
  } catch (err) {
    req.log.error({ err }, "PayPal capture failed");
    res.status(500).json({ error: "Could not complete PayPal payment" });
  }
});

export default router;
