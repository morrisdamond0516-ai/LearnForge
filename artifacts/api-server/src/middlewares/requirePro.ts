import type { Request, Response, NextFunction } from "express";
import { getEntitlement } from "../lib/entitlement";

/**
 * Gate a route behind an active Pro entitlement (owner / Stripe / grant /
 * junior free window). Must run AFTER `requireAuth` so `req.userId` is set.
 */
export async function requirePro(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const ent = await getEntitlement(req.userId!);
    if (!ent.pro) {
      res.status(403).json({
        error:
          "Certified exams are a Pro feature. Upgrade your plan to take them.",
        code: "pro_required",
      });
      return;
    }
    next();
  } catch (err) {
    req.log.error({ err }, "Pro entitlement check failed");
    res.status(500).json({ error: "Could not verify your plan. Please try again." });
  }
}
