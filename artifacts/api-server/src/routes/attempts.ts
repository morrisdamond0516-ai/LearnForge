import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import {
  db,
  quizzesTable,
  attemptsTable,
  subjectsTable,
  certificatesTable,
  type AttemptQuestionResult,
} from "@workspace/db";
import { EXAM_PASS_SCORE, CERT_VALID_DAYS } from "../lib/examCatalog";
import { recordActivity } from "../lib/gamification";
import {
  SubmitAttemptParams,
  SubmitAttemptBody,
  ListAttemptsResponse,
  GetAttemptParams,
  GetAttemptResponse,
  DeleteAttemptParams,
} from "@workspace/api-zod";
import { assessLevel, buildFeedback } from "../lib/ai";

const router: IRouter = Router();

router.post("/quizzes/:id/attempts", async (req, res): Promise<void> => {
  const params = SubmitAttemptParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = SubmitAttemptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [quiz] = await db
    .select()
    .from(quizzesTable)
    .where(
      and(
        eq(quizzesTable.id, params.data.id),
        eq(quizzesTable.userId, req.userId!),
      ),
    );

  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  const answers = parsed.data.answers;
  const questions = quiz.questions;

  const results: AttemptQuestionResult[] = questions.map((q, index) => {
    const selectedIndex =
      typeof answers[index] === "number" ? answers[index] : -1;
    return {
      questionId: q.id,
      prompt: q.prompt,
      options: q.options,
      selectedIndex,
      correctIndex: q.correctIndex,
      correct: selectedIndex === q.correctIndex,
      explanation: q.explanation,
    };
  });

  const totalQuestions = questions.length;
  const correctCount = results.filter((r) => r.correct).length;
  const score =
    totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const level = assessLevel(score);
  const feedback = buildFeedback(score, level);

  const [attempt] = await db
    .insert(attemptsTable)
    .values({
      userId: req.userId!,
      quizId: quiz.id,
      score,
      correctCount,
      totalQuestions,
      level,
      feedback,
      results,
    })
    .returning();

  // Certified exam passed? Issue (or renew) a 90-day certificate. Best-effort:
  // a failure here must never break recording the attempt itself.
  if (quiz.examSlug && score >= EXAM_PASS_SCORE) {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + CERT_VALID_DAYS * 86400000);
      await db
        .insert(certificatesTable)
        .values({
          userId: req.userId!,
          examSlug: quiz.examSlug,
          examName: quiz.title,
          attemptId: attempt.id,
          score,
          level,
          expiresAt,
        })
        .onConflictDoUpdate({
          target: [certificatesTable.userId, certificatesTable.examSlug],
          set: {
            examName: quiz.title,
            attemptId: attempt.id,
            score,
            level,
            issuedAt: now,
            expiresAt,
          },
        });
    } catch (err) {
      req.log.error({ err }, "Certificate issuance failed");
    }
  }

  // Award XP / update streak / grant badges. Best-effort: gamification must
  // never block recording the attempt itself.
  try {
    await recordActivity(req.userId!, {
      correctCount,
      totalQuestions,
      score,
    });
  } catch (err) {
    req.log.error({ err }, "Gamification update failed");
  }

  let subjectName: string | null = null;
  if (quiz.subjectId != null) {
    const [subject] = await db
      .select()
      .from(subjectsTable)
      .where(eq(subjectsTable.id, quiz.subjectId));
    subjectName = subject?.name ?? null;
  }

  res.status(201).json(
    GetAttemptResponse.parse({
      id: attempt.id,
      quizId: attempt.quizId,
      quizTitle: quiz.title,
      mode: quiz.mode,
      subjectId: quiz.subjectId,
      subjectName,
      score: attempt.score,
      correctCount: attempt.correctCount,
      totalQuestions: attempt.totalQuestions,
      level: attempt.level,
      feedback: attempt.feedback,
      completedAt: attempt.completedAt,
      results: attempt.results,
    }),
  );
});

router.get("/attempts", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(attemptsTable)
    .where(eq(attemptsTable.userId, req.userId!))
    .orderBy(desc(attemptsTable.completedAt));

  const quizzes = await db.select().from(quizzesTable);
  const quizById = new Map(quizzes.map((q) => [q.id, q]));
  const subjects = await db.select().from(subjectsTable);
  const subjectNameById = new Map(subjects.map((s) => [s.id, s.name]));

  const summaries = rows.map((attempt) => {
    const quiz = quizById.get(attempt.quizId);
    const subjectName =
      quiz?.subjectId != null
        ? (subjectNameById.get(quiz.subjectId) ?? null)
        : null;
    return {
      id: attempt.id,
      quizId: attempt.quizId,
      quizTitle: quiz?.title ?? null,
      mode: quiz?.mode ?? null,
      subjectName,
      score: attempt.score,
      correctCount: attempt.correctCount,
      totalQuestions: attempt.totalQuestions,
      level: attempt.level,
      completedAt: attempt.completedAt,
    };
  });

  res.json(ListAttemptsResponse.parse(summaries));
});

router.get("/attempts/:id", async (req, res): Promise<void> => {
  const params = GetAttemptParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [attempt] = await db
    .select()
    .from(attemptsTable)
    .where(
      and(
        eq(attemptsTable.id, params.data.id),
        eq(attemptsTable.userId, req.userId!),
      ),
    );

  if (!attempt) {
    res.status(404).json({ error: "Attempt not found" });
    return;
  }

  const [quiz] = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.id, attempt.quizId));

  let subjectName: string | null = null;
  if (quiz?.subjectId != null) {
    const [subject] = await db
      .select()
      .from(subjectsTable)
      .where(eq(subjectsTable.id, quiz.subjectId));
    subjectName = subject?.name ?? null;
  }

  res.json(
    GetAttemptResponse.parse({
      id: attempt.id,
      quizId: attempt.quizId,
      quizTitle: quiz?.title ?? null,
      mode: quiz?.mode ?? null,
      subjectId: quiz?.subjectId ?? null,
      subjectName,
      score: attempt.score,
      correctCount: attempt.correctCount,
      totalQuestions: attempt.totalQuestions,
      level: attempt.level,
      feedback: attempt.feedback,
      completedAt: attempt.completedAt,
      results: attempt.results,
    }),
  );
});

router.delete("/attempts/:id", async (req, res): Promise<void> => {
  const params = DeleteAttemptParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [attempt] = await db
    .delete(attemptsTable)
    .where(
      and(
        eq(attemptsTable.id, params.data.id),
        eq(attemptsTable.userId, req.userId!),
      ),
    )
    .returning();

  if (!attempt) {
    res.status(404).json({ error: "Attempt not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
