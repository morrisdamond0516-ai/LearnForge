import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "stream";
import { db, usersTable, attemptsTable, quizzesTable, type User } from "@workspace/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { getClerkEmail } from "../lib/clerkUser";
import { getEntitlement } from "../lib/entitlement";
import { isOwnerEmail } from "../lib/ownership";
import { computeAge, isMinor, juniorWindowEnd } from "../lib/age";
import {
  ObjectStorageService,
  ObjectNotFoundError,
  ObjectAccessDeniedError,
} from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

/**
 * Ensure a `users` row exists for the signed-in person and that we have their
 * email on file (needed for owner detection and Stripe). Lazily backfills the
 * email for rows created before email sync existed.
 */
async function ensureUserRow(userId: string): Promise<User> {
  let [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) {
    const email = await getClerkEmail(userId);
    await db
      .insert(usersTable)
      .values({ id: userId, email })
      .onConflictDoNothing({ target: usersTable.id });
    [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));
  } else if (!user.email) {
    const email = await getClerkEmail(userId);
    if (email) {
      await db
        .update(usersTable)
        .set({ email })
        .where(eq(usersTable.id, userId));
      user = { ...user, email };
    }
  }

  return user!;
}

// Account + onboarding status for the signed-in user.
router.get("/me", async (req, res) => {
  const userId = req.userId!;
  try {
    const user = await ensureUserRow(userId);
    const entitlement = await getEntitlement(userId);
    const minor = isMinor(user.birthDate);
    const windowEnd = juniorWindowEnd(user.createdAt);
    const juniorWindowActive = minor && Date.now() < windowEnd.getTime();

    // A minor whose 9 free months have ended must upload an official document
    // (name + date of birth) for owner review, unless already approved.
    const needsAgeVerification =
      minor &&
      !juniorWindowActive &&
      user.ageVerificationStatus !== "approved";

    res.json({
      email: user.email,
      birthDate: user.birthDate ?? null,
      age: computeAge(user.birthDate),
      needsBirthDate: !user.birthDate,
      isMinor: minor,
      isOwner: isOwnerEmail(user.email),
      juniorWindowUntil: windowEnd.toISOString(),
      juniorWindowActive,
      ageVerificationStatus: user.ageVerificationStatus,
      needsAgeVerification,
      createdAt: user.createdAt.toISOString(),
      entitlement,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to load account status");
    res.status(500).json({ error: "Could not load your account" });
  }
});

// Set date of birth once during onboarding. Immutable after the first set so
// it can't be changed to game the under-18 pricing.
router.post("/me/birthdate", async (req, res) => {
  const userId = req.userId!;
  const raw = req.body?.birthDate;

  if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    res.status(400).json({ error: "Enter a valid date of birth." });
    return;
  }
  const parsed = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    res.status(400).json({ error: "Enter a valid date of birth." });
    return;
  }
  if (parsed.getTime() > Date.now()) {
    res.status(400).json({ error: "Date of birth can't be in the future." });
    return;
  }
  const age = computeAge(raw);
  if (age === null || age > 120) {
    res.status(400).json({ error: "Enter a valid date of birth." });
    return;
  }

  try {
    await ensureUserRow(userId);
    // Atomic immutable set: only write when no birthdate exists yet, so two
    // concurrent requests can't race to set different values (last-write-wins).
    const updated = await db
      .update(usersTable)
      .set({ birthDate: raw })
      .where(and(eq(usersTable.id, userId), isNull(usersTable.birthDate)))
      .returning({ id: usersTable.id });
    if (updated.length === 0) {
      res.status(409).json({ error: "Date of birth is already set." });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to save birthdate");
    res.status(500).json({ error: "Could not save your date of birth" });
  }
});

// Download my results: a CSV of scores, levels, and dates only. We never
// export the questions, answer choices, or which option was selected.
router.get("/me/results/export", async (req, res) => {
  const userId = req.userId!;
  try {
    const rows = await db
      .select({
        title: quizzesTable.title,
        score: attemptsTable.score,
        level: attemptsTable.level,
        correctCount: attemptsTable.correctCount,
        totalQuestions: attemptsTable.totalQuestions,
        completedAt: attemptsTable.completedAt,
      })
      .from(attemptsTable)
      .leftJoin(quizzesTable, eq(attemptsTable.quizId, quizzesTable.id))
      .where(eq(attemptsTable.userId, userId))
      .orderBy(desc(attemptsTable.completedAt));

    const esc = (v: string | number): string => {
      let s = String(v);
      // Neutralize CSV formula injection: a cell beginning with one of these
      // characters can be executed as a formula by spreadsheet software.
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ["Test", "Score (%)", "Level", "Correct", "Total", "Date"];
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [
          esc(r.title ?? "Quiz"),
          esc(Math.round(r.score)),
          esc(r.level),
          esc(r.correctCount),
          esc(r.totalQuestions),
          esc(new Date(r.completedAt).toISOString().slice(0, 10)),
        ].join(","),
      );
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="learnforge-results.csv"',
    );
    res.send(lines.join("\r\n"));
  } catch (err) {
    req.log.error({ err }, "Failed to export results");
    res.status(500).json({ error: "Could not export your results" });
  }
});

// --- Age verification (official document review) ---------------------------

/** Resolve the signed-in user and assert they are the app owner. */
async function requireOwner(
  req: Request,
  res: Response,
): Promise<User | null> {
  const user = await ensureUserRow(req.userId!);
  if (!isOwnerEmail(user.email)) {
    res.status(403).json({ error: "Owner access only" });
    return null;
  }
  return user;
}

// A minor (after their 9 free months) uploads an official document showing
// their name and date of birth. We claim ownership of the uploaded object
// (private, immutable claim) and mark the account pending owner review.
router.post("/me/verification", async (req, res) => {
  const userId = req.userId!;
  const objectPath = req.body?.objectPath;
  if (typeof objectPath !== "string" || !objectPath) {
    res.status(400).json({ error: "Missing uploaded document." });
    return;
  }

  // Only minors whose free window has ended (and who aren't already approved)
  // may submit a verification document — enforce policy server-side, not just
  // via UI hints.
  const submitter = await ensureUserRow(userId);
  const eligible =
    isMinor(submitter.birthDate) &&
    Date.now() >= juniorWindowEnd(submitter.createdAt).getTime() &&
    submitter.ageVerificationStatus !== "approved";
  if (!eligible) {
    res.status(400).json({ error: "Age verification isn't needed right now." });
    return;
  }

  let normalizedPath: string;
  try {
    normalizedPath = await objectStorageService.claimObjectEntityOwnership(
      objectPath,
      userId,
    );
  } catch (err) {
    if (err instanceof ObjectNotFoundError) {
      res.status(400).json({ error: "Uploaded file not found" });
      return;
    }
    if (err instanceof ObjectAccessDeniedError) {
      res.status(403).json({ error: "You do not have access to this file" });
      return;
    }
    req.log.error({ err }, "Failed to claim verification document");
    res.status(500).json({ error: "Could not register your document" });
    return;
  }

  try {
    await db
      .update(usersTable)
      .set({
        ageVerificationDocPath: normalizedPath,
        ageVerificationStatus: "pending",
      })
      .where(eq(usersTable.id, userId));
    res.json({ ok: true, status: "pending" });
  } catch (err) {
    req.log.error({ err }, "Failed to save verification status");
    res.status(500).json({ error: "Could not submit your document" });
  }
});

// Owner: list accounts awaiting age verification.
router.get("/me/verifications", async (req, res) => {
  const owner = await requireOwner(req, res);
  if (!owner) return;

  try {
    const pending = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.ageVerificationStatus, "pending"));

    res.json(
      pending.map((u) => ({
        userId: u.id,
        email: u.email,
        birthDate: u.birthDate ?? null,
        age: computeAge(u.birthDate),
        hasDocument: !!u.ageVerificationDocPath,
        createdAt: u.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list verifications");
    res.status(500).json({ error: "Could not load verifications" });
  }
});

// Owner: stream a pending account's uploaded document for review. Reads the
// object server-side (bypassing the per-user HTTP ACL) after the owner check.
router.get("/me/verifications/:userId/document", async (req, res) => {
  const owner = await requireOwner(req, res);
  if (!owner) return;

  try {
    const [target] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.params.userId));
    if (!target?.ageVerificationDocPath) {
      res.status(404).json({ error: "No document on file" });
      return;
    }

    const objectFile = await objectStorageService.getObjectEntityFile(
      target.ageVerificationDocPath,
    );
    const response = await objectStorageService.downloadObject(objectFile);
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (response.body) {
      Readable.fromWeb(response.body as ReadableStream<Uint8Array>).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    if (err instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    req.log.error({ err }, "Failed to serve verification document");
    res.status(500).json({ error: "Could not load document" });
  }
});

// Owner: approve or reject a pending verification.
router.post("/me/verifications/:userId/review", async (req, res) => {
  const owner = await requireOwner(req, res);
  if (!owner) return;

  const decision = req.body?.decision;
  if (decision !== "approve" && decision !== "reject") {
    res.status(400).json({ error: "decision must be 'approve' or 'reject'" });
    return;
  }

  try {
    await db
      .update(usersTable)
      .set({
        ageVerificationStatus: decision === "approve" ? "approved" : "rejected",
        ageVerifiedAt: decision === "approve" ? new Date() : null,
      })
      .where(eq(usersTable.id, req.params.userId));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to record verification review");
    res.status(500).json({ error: "Could not save your decision" });
  }
});

export default router;
