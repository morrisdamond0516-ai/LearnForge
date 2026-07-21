import type { Request, Response, NextFunction } from "express";
import { getAuth, verifyToken } from "@clerk/express";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Requires an authenticated Clerk session. On success, attaches the Clerk
 * user id to `req.userId` so route handlers can scope data per person.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  if (auth.isAuthenticated && auth.userId) {
    req.userId = auth.userId;
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (token && secretKey) {
      try {
        const payload = await verifyToken(token, {
          secretKey,
          ...(process.env.NODE_ENV === "development"
            ? { authorizedParties: undefined }
            : {}),
        });
        const userId = payload.sub;
        if (userId) {
          req.userId = userId;
          next();
          return;
        }
      } catch (err) {
        req.log?.warn({ err }, "Bearer token verification failed");
      }
    }
  }

  res.status(401).json({ error: "Unauthorized" });
}
