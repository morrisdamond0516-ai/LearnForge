import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isOwnerEmail } from "../lib/ownership";
import { getResendConfig, sendOwnerDigestEmail } from "../lib/resend";

export const ownerOutreachRouter: IRouter = Router();

async function requireOwner(req: Request, res: Response): Promise<boolean> {
  const [user] = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!));
  if (!isOwnerEmail(user?.email)) {
    res.status(403).json({ error: "Owner access only" });
    return false;
  }
  return true;
}

ownerOutreachRouter.post(
  "/owner/outreach/weekly-digest",
  async (req: Request, res: Response): Promise<void> => {
    if (!(await requireOwner(req, res))) return;

    const config = getResendConfig();
    if (!config) {
      res.status(503).json({
        ok: false,
        error: "Resend is not configured (RESEND_API_KEY, RESEND_FROM).",
      });
      return;
    }

    const result = await sendOwnerDigestEmail(config);
    if (!result.ok) {
      res.status(502).json({ ok: false, error: result.error });
      return;
    }

    const to =
      process.env.OWNER_NOTIFY_EMAIL?.trim() ||
      process.env.RESEND_REPLY_TO?.trim() ||
      "ebookgames@yahoo.com";

    res.json({
      ok: true,
      message: `Weekly digest sent to ${to}`,
    });
  },
);

export default ownerOutreachRouter;
