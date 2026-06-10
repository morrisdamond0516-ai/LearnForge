import { Router, type IRouter } from "express";
import { and, desc, eq, isNull, or } from "drizzle-orm";
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
import {
  generateQuizContent,
  getCareerExamInfo,
  MAX_QUIZ_QUESTIONS,
  validateLearningInput,
} from "../lib/ai";
import { extractDocumentText } from "../lib/documentText";

// Quizzes can pull more source text than the career transcript path, so more of
// the uploaded study material informs the questions.
const QUIZ_SOURCE_MAX_CHARS = 12000;

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
    career: quiz.career,
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

  const conditions = [eq(quizzesTable.userId, req.userId!)];
  if (query.data.mode) conditions.push(eq(quizzesTable.mode, query.data.mode));
  if (query.data.subjectId != null)
    conditions.push(eq(quizzesTable.subjectId, query.data.subjectId));

  const rows = await db
    .select()
    .from(quizzesTable)
    .where(and(...conditions))
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
    career: quiz.career,
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

  const { mode, subjectId, documentId, topic, career, title, difficulty, questionCount, autoLength } =
    parsed.data;

  const careerName = career?.trim() || null;

  if (
    subjectId == null &&
    documentId == null &&
    !careerName &&
    (!topic || !topic.trim())
  ) {
    res
      .status(400)
      .json({ error: "Provide a career, subject, document, or topic to generate from" });
    return;
  }

  for (const freeText of [careerName, topic?.trim() || null]) {
    if (freeText) {
      const check = await validateLearningInput(freeText);
      if (!check.valid) {
        res.status(400).json({ error: check.reason });
        return;
      }
    }
  }

  let subjectName: string | null = null;
  if (subjectId != null) {
    const [subject] = await db
      .select()
      .from(subjectsTable)
      .where(
        and(
          eq(subjectsTable.id, subjectId),
          or(
            isNull(subjectsTable.userId),
            eq(subjectsTable.userId, req.userId!),
          ),
        ),
      );
    if (!subject) {
      res.status(404).json({ error: "Subject not found" });
      return;
    }
    subjectName = subject.name;
  }

  let documentName: string | undefined;
  let documentText: string | undefined;
  if (documentId != null) {
    const [doc] = await db
      .select()
      .from(documentsTable)
      .where(
        and(
          eq(documentsTable.id, documentId),
          eq(documentsTable.userId, req.userId!),
        ),
      );
    if (!doc) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    documentName = doc.name;
    const extracted = await extractDocumentText(
      doc.objectPath,
      doc.contentType,
      QUIZ_SOURCE_MAX_CHARS,
    );
    documentText = extracted ?? undefined;
  }

  const resolvedDifficulty = difficulty ?? (mode === "placement" ? "mixed" : "medium");

  let resolvedCount: number;
  if (autoLength && careerName) {
    try {
      const info = await getCareerExamInfo(careerName, topic?.trim() || undefined);
      resolvedCount = Math.min(MAX_QUIZ_QUESTIONS, Math.max(3, info.questionCount));
    } catch (err) {
      req.log.error({ err }, "Career exam length lookup failed");
      resolvedCount = mode === "exam" ? 15 : 10;
    }
  } else {
    resolvedCount = Math.min(
      MAX_QUIZ_QUESTIONS,
      questionCount ?? (mode === "exam" ? 15 : mode === "placement" ? 10 : 8),
    );
  }

  let generated;
  try {
    generated = await generateQuizContent({
      mode,
      subjectName: subjectName ?? undefined,
      topic: topic ?? undefined,
      documentName,
      documentText,
      career: careerName ?? undefined,
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
      userId: req.userId!,
      title: title?.trim() || generated.title,
      mode,
      subjectId: subjectId ?? null,
      documentId: documentId ?? null,
      topic: topic ?? null,
      career: careerName,
      difficulty: resolvedDifficulty,
      questionCount: resolvedCount,
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

  for (const freeText of [quiz.career, quiz.topic]) {
    if (freeText && freeText.trim().length > 0) {
      const check = await validateLearningInput(freeText);
      if (!check.valid) {
        res.status(400).json({ error: check.reason });
        return;
      }
    }
  }

  const subjectName = await subjectNameFor(quiz.subjectId);

  let documentName: string | undefined;
  let documentText: string | undefined;
  if (quiz.documentId != null) {
    const [doc] = await db
      .select()
      .from(documentsTable)
      .where(
        and(
          eq(documentsTable.id, quiz.documentId),
          eq(documentsTable.userId, req.userId!),
        ),
      );
    documentName = doc?.name;
    if (doc) {
      const extracted = await extractDocumentText(
        doc.objectPath,
        doc.contentType,
        QUIZ_SOURCE_MAX_CHARS,
      );
      documentText = extracted ?? undefined;
    }
  }

  let generated;
  try {
    generated = await generateQuizContent({
      mode: quiz.mode as "placement" | "practice" | "exam",
      subjectName: subjectName ?? undefined,
      topic: quiz.topic ?? undefined,
      documentName,
      documentText,
      career: quiz.career ?? undefined,
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
      questionCount: quiz.questionCount,
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
    .where(
      and(
        eq(quizzesTable.id, params.data.id),
        eq(quizzesTable.userId, req.userId!),
      ),
    )
    .returning();

  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
