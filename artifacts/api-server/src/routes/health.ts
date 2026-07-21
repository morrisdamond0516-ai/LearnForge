import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

/** Dev helper — confirms whether Clerk sees your session (no auth required). */
router.get("/auth/check", (req, res) => {
  const auth = getAuth(req);
  res.json({
    isAuthenticated: auth.isAuthenticated,
    userId: auth.userId ?? null,
    hasBearer: Boolean(req.headers.authorization?.startsWith("Bearer ")),
  });
});

export default router;
