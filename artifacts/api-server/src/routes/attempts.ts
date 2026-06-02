import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import {
  db,
  quizzesTable,
  attemptsTable,
  subjectsTable,
  type AttemptQuestionResult,
} from "@workspace/db";
import {
  SubmitAttemptParams,
  SubmitAttemptBody,
  ListAttemptsResponse,
  GetAttemptParams,
  GetAttemptResponse,
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
    .where(eq(quizzesTable.id, params.data.id));

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
      quizId: quiz.id,
      score,
      correctCount,
      totalQuestions,
      level,
      feedback,
      results,
    })
    .returning();

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

router.get("/attempts", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(attemptsTable)
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
    .where(eq(attemptsTable.id, params.data.id));

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

export default router;
