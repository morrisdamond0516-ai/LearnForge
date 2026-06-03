import { Router, type IRouter } from "express";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import {
  db,
  quizzesTable,
  attemptsTable,
  documentsTable,
  learnSessionsTable,
  subjectsTable,
} from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetRecentActivityResponse,
  GetSubjectProgressResponse,
} from "@workspace/api-zod";
import { assessLevel } from "../lib/ai";

const router: IRouter = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const me = req.userId!;
  const [quizzes, attempts, documents, learnSessions] = await Promise.all([
    db.select().from(quizzesTable).where(eq(quizzesTable.userId, me)),
    db.select().from(attemptsTable).where(eq(attemptsTable.userId, me)),
    db.select().from(documentsTable).where(eq(documentsTable.userId, me)),
    db.select().from(learnSessionsTable).where(eq(learnSessionsTable.userId, me)),
  ]);

  const averageScore =
    attempts.length > 0
      ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
      : 0;

  const subjectsStudied = new Set(
    quizzes.map((q) => q.subjectId).filter((id): id is number => id != null),
  ).size;

  res.json(
    GetDashboardSummaryResponse.parse({
      totalQuizzes: quizzes.length,
      totalAttempts: attempts.length,
      averageScore: Math.round(averageScore * 10) / 10,
      documentsUploaded: documents.length,
      subjectsStudied,
      studyGuides: learnSessions.length,
    }),
  );
});

router.get("/dashboard/recent-activity", async (req, res): Promise<void> => {
  const me = req.userId!;
  const [attempts, quizzes, documents, learnSessions] = await Promise.all([
    db
      .select()
      .from(attemptsTable)
      .where(eq(attemptsTable.userId, me))
      .orderBy(desc(attemptsTable.completedAt))
      .limit(10),
    db
      .select()
      .from(quizzesTable)
      .where(eq(quizzesTable.userId, me))
      .orderBy(desc(quizzesTable.createdAt))
      .limit(10),
    db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.userId, me))
      .orderBy(desc(documentsTable.createdAt))
      .limit(10),
    db
      .select()
      .from(learnSessionsTable)
      .where(eq(learnSessionsTable.userId, me))
      .orderBy(desc(learnSessionsTable.createdAt))
      .limit(10),
  ]);

  const quizById = new Map(quizzes.map((q) => [q.id, q]));

  const items = [
    ...attempts.map((a) => ({
      id: `attempt-${a.id}`,
      type: "attempt" as const,
      title: quizById.get(a.quizId)?.title ?? "Quiz attempt",
      detail: `Scored ${Math.round(a.score)}% — ${a.level}`,
      timestamp: a.completedAt,
    })),
    ...quizzes.map((q) => ({
      id: `quiz-${q.id}`,
      type: "quiz" as const,
      title: q.title,
      detail: `${q.mode} • ${q.questionCount} questions`,
      timestamp: q.createdAt,
    })),
    ...documents.map((d) => ({
      id: `document-${d.id}`,
      type: "document" as const,
      title: d.name,
      detail: "Uploaded study material",
      timestamp: d.createdAt,
    })),
    ...learnSessions.map((l) => ({
      id: `learn-${l.id}`,
      type: "learn" as const,
      title: l.title,
      detail: "Study guide",
      timestamp: l.createdAt,
    })),
  ];

  items.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  res.json(GetRecentActivityResponse.parse(items.slice(0, 12)));
});

router.get("/dashboard/subject-progress", async (req, res): Promise<void> => {
  const me = req.userId!;
  const [subjects, quizzes, attempts] = await Promise.all([
    db
      .select()
      .from(subjectsTable)
      .where(or(isNull(subjectsTable.userId), eq(subjectsTable.userId, me))),
    db.select().from(quizzesTable).where(eq(quizzesTable.userId, me)),
    db.select().from(attemptsTable).where(eq(attemptsTable.userId, me)),
  ]);

  const quizById = new Map(quizzes.map((q) => [q.id, q]));

  const bySubject = new Map<
    number,
    { scores: number[]; attempts: number }
  >();

  for (const attempt of attempts) {
    const quiz = quizById.get(attempt.quizId);
    if (!quiz || quiz.subjectId == null) continue;
    const entry = bySubject.get(quiz.subjectId) ?? { scores: [], attempts: 0 };
    entry.scores.push(attempt.score);
    entry.attempts += 1;
    bySubject.set(quiz.subjectId, entry);
  }

  const progress = subjects
    .map((subject) => {
      const entry = bySubject.get(subject.id);
      const attemptsCount = entry?.attempts ?? 0;
      const averageScore =
        entry && entry.scores.length > 0
          ? entry.scores.reduce((sum, s) => sum + s, 0) / entry.scores.length
          : 0;
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        category: subject.category,
        attempts: attemptsCount,
        averageScore: Math.round(averageScore * 10) / 10,
        level: attemptsCount > 0 ? assessLevel(averageScore) : "Not started",
      };
    })
    .filter((p) => p.attempts > 0)
    .sort((a, b) => b.averageScore - a.averageScore);

  res.json(GetSubjectProgressResponse.parse(progress));
});

export default router;
