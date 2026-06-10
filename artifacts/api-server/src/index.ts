import { runMigrations } from "stripe-replit-sync";
import app from "./app";
import { logger } from "./lib/logger";
import { getStripeSync } from "./lib/stripeClient";

/**
 * Initialize the Stripe schema, managed webhook, and data sync on startup.
 * Best-effort: if Stripe is not connected yet, log and continue so the rest of
 * the app still serves (billing endpoints will return a clear error instead).
 */
async function initStripe(): Promise<void> {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    logger.warn("DATABASE_URL missing; skipping Stripe init");
    return;
  }

  try {
    await runMigrations({ databaseUrl });

    const stripeSync = await getStripeSync();

    const webhookBaseUrl = `https://${process.env["REPLIT_DOMAINS"]?.split(",")[0]}`;
    const webhook = await stripeSync.findOrCreateManagedWebhook(
      `${webhookBaseUrl}/api/stripe/webhook`,
    );
    logger.info({ url: webhook?.url }, "Stripe managed webhook ready");

    stripeSync
      .syncBackfill()
      .then(() => logger.info("Stripe data synced"))
      .catch((err) => logger.error({ err }, "Stripe backfill failed"));
  } catch (err) {
    logger.warn(
      { err: err instanceof Error ? err.message : err },
      "Stripe not initialized (integration may not be connected yet)",
    );
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

await initStripe();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
