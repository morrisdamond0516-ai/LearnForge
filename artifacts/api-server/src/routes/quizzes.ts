import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import {
  db,
  quizzesTable,
  subjectsTable,
  documentsTable,
  type Quiz,
} from "@workspace/db";
import {
  ListQuizzesQueryParams,
  ListQuizzesResponse,
  GenerateQuizBody,
  GetQuizParams,
  GetQuizResponse,
  DeleteQuizParams,
} from "@workspace/api-zod";
import { generateQuizContent } from "../lib/ai";

const router: IRouter = Router();

async function subjectNameFor(
  subjectId: number | null,
): Promise<string | null> {
  if (subjectId == null) return null;
  const [subject] = await db
    .select()
    .from(subjectsTable)
    .where(eq(subjectsTable.id, subjectId));
  return subject?.name ?? null;
}

function toQuizResponse(quiz: Quiz, subjectName: string | null) {
  return {
    id: quiz.id,
    title: quiz.title,
    mode: quiz.mode,
    subjectId: quiz.subjectId,
    subjectName,
    documentId: quiz.documentId,
    topic: quiz.topic,
    difficulty: quiz.difficulty,
    questionCount: quiz.questionCount,
    createdAt: quiz.createdAt,
    questions: quiz.questions,
  };
}

router.get("/quizzes", async (req, res): Promise<void> => {
  const query = ListQuizzesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];
  if (query.data.mode) conditions.push(eq(quizzesTable.mode, query.data.mode));
  if (query.data.subjectId != null)
    conditions.push(eq(quizzesTable.subjectId, query.data.subjectId));

  const rows = await db
    .select()
    .from(quizzesTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(quizzesTable.createdAt));

  const subjects = await db.select().from(subjectsTable);
  const nameById = new Map(subjects.map((s) => [s.id, s.name]));

  const summaries = rows.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    mode: quiz.mode,
    subjectId: quiz.subjectId,
    subjectName: quiz.subjectId != null ? (nameById.get(quiz.subjectId) ?? null) : null,
    topic: quiz.topic,
    difficulty: quiz.difficulty,
    questionCount: quiz.questionCount,
    createdAt: quiz.createdAt,
  }));

  res.json(ListQuizzesResponse.parse(summaries));
});

router.post("/quizzes/generate", async (req, res): Promise<void> => {
  const parsed = GenerateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { mode, subjectId, documentId, topic, title, difficulty, questionCount } =
    parsed.data;

  if (subjectId == null && documentId == null && (!topic || !topic.trim())) {
    res
      .status(400)
      .json({ error: "Provide a subject, a document, or a topic to generate from" });
    return;
  }

  let subjectName: string | null = null;
  if (subjectId != null) {
    const [subject] = await db
      .select()
      .from(subjectsTable)
      .where(eq(subjectsTable.id, subjectId));
    if (!subject) {
      res.status(404).json({ error: "Subject not found" });
      return;
    }
    subjectName = subject.name;
  }

  let documentName: string | undefined;
  if (documentId != null) {
    const [doc] = await db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.id, documentId));
    if (!doc) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    documentName = doc.name;
  }

  const resolvedDifficulty = difficulty ?? (mode === "placement" ? "mixed" : "medium");
  const resolvedCount = questionCount ?? (mode === "exam" ? 15 : mode === "placement" ? 10 : 8);

  let generated;
  try {
    generated = await generateQuizContent({
      mode,
      subjectName: subjectName ?? undefined,
      topic: topic ?? undefined,
      documentName,
      difficulty: resolvedDifficulty,
      questionCount: resolvedCount,
    });
  } catch (err) {
    req.log.error({ err }, "Quiz generation failed");
    res.status(500).json({ error: "Failed to generate quiz. Please try again." });
    return;
  }

  const [quiz] = await db
    .insert(quizzesTable)
    .values({
      title: title?.trim() || generated.title,
      mode,
      subjectId: subjectId ?? null,
      documentId: documentId ?? null,
      topic: topic ?? null,
      difficulty: resolvedDifficulty,
      questionCount: generated.questions.length,
      questions: generated.questions,
    })
    .returning();

  res.status(201).json(GetQuizResponse.parse(toQuizResponse(quiz, subjectName)));
});

router.get("/quizzes/:id", async (req, res): Promise<void> => {
  const params = GetQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
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

  const subjectName = await subjectNameFor(quiz.subjectId);
  res.json(GetQuizResponse.parse(toQuizResponse(quiz, subjectName)));
});

router.post("/quizzes/:id/refresh", async (req, res): Promise<void> => {
  const params = GetQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
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

  const subjectName = await subjectNameFor(quiz.subjectId);

  let documentName: string | undefined;
  if (quiz.documentId != null) {
    const [doc] = await db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.id, quiz.documentId));
    documentName = doc?.name;
  }

  let generated;
  try {
    generated = await generateQuizContent({
      mode: quiz.mode as "placement" | "practice" | "exam",
      subjectName: subjectName ?? undefined,
      topic: quiz.topic ?? undefined,
      documentName,
      difficulty: quiz.difficulty,
      questionCount: quiz.questionCount || 8,
    });
  } catch (err) {
    req.log.error({ err }, "Quiz refresh failed");
    res
      .status(500)
      .json({ error: "Failed to generate fresh questions. Please try again." });
    return;
  }

  const [updated] = await db
    .update(quizzesTable)
    .set({
      questions: generated.questions,
      questionCount: generated.questions.length,
    })
    .where(eq(quizzesTable.id, quiz.id))
    .returning();

  res.json(GetQuizResponse.parse(toQuizResponse(updated, subjectName)));
});

router.delete("/quizzes/:id", async (req, res): Promise<void> => {
  const params = DeleteQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [quiz] = await db
    .delete(quizzesTable)
    .where(eq(quizzesTable.id, params.data.id))
    .returning();

  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
