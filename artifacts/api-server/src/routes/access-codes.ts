import { Router, type IRouter } from "express";
import { clerkClient } from "@clerk/express";
import { accessCodeStorage } from "../lib/accessCodeStorage";
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

// Redeem an access code, granting the signed-in user a Pro entitlement period.
router.post("/access-codes/redeem", async (req, res) => {
  const userId = req.userId!;
  const raw = req.body?.code;

  if (typeof raw !== "string" || raw.trim().length === 0) {
    res.status(400).json({ error: "Enter a code" });
    return;
  }

  try {
    // Inspect first so we can return a precise reason when the claim fails.
    const existing = await accessCodeStorage.findByCode(raw);
    if (!existing) {
      res.status(404).json({ error: "That code is not valid" });
      return;
    }
    if (existing.status === "redeemed") {
      res.status(409).json({ error: "That code has already been used" });
      return;
    }
    if (existing.status === "revoked") {
      res.status(409).json({ error: "That code is no longer active" });
      return;
    }
    if (existing.expiresAt && existing.expiresAt.getTime() <= Date.now()) {
      res.status(409).json({ error: "That code has expired" });
      return;
    }

    // Atomic claim + grant in one transaction (guards races / double-redeem
    // and ensures a claimed code is never left without its Pro grant).
    const email = await getClerkEmail(userId);
    const redeemed = await accessCodeStorage.redeem(raw, userId, email);
    if (!redeemed) {
      res.status(409).json({ error: "That code could not be redeemed" });
      return;
    }

    const entitlement = await getEntitlement(userId);
    res.json({
      ok: true,
      grantedDays: redeemed.durationDays,
      entitlement,
    });
  } catch (err) {
    req.log.error({ err }, "Access code redemption failed");
    res.status(500).json({ error: "Could not redeem code" });
  }
});

// Current Pro entitlement for the signed-in user (any source).
router.get("/entitlement", async (req, res) => {
  const userId = req.userId!;
  try {
    const entitlement = await getEntitlement(userId);
    res.json(entitlement);
  } catch (err) {
    req.log.error({ err }, "Entitlement lookup failed");
    res.status(500).json({ error: "Could not load entitlement" });
  }
});

export default router;
