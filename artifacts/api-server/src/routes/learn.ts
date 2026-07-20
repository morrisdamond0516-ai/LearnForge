import { Router, type IRouter } from "express";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { db, learnSessionsTable, lessonsTable, subjectsTable } from "@workspace/db";
import {
  ResearchTopicBody,
  ListLearnSessionsResponse,
  GetLearnSessionParams,
  GetLearnSessionResponse,
  DeleteLearnSessionParams,
  GenerateLessonBody,
  ListLessonsResponse,
  GetLessonByIdParams,
  GetLessonByIdResponse,
  DeleteLessonByIdParams,
} from "@workspace/api-zod";
import { generateStudyGuide, generateLesson, validateLearningInput } from "../lib/ai";

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

router.post("/learn/research", async (req, res): Promise<void> => {
  const parsed = ResearchTopicBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { topic, subjectId, focus } = parsed.data;

  if (topic && topic.trim().length > 0) {
    const topicCheck = await validateLearningInput(topic);
    if (!topicCheck.valid) {
      res.status(400).json({ error: topicCheck.reason });
      return;
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

  let guide;
  try {
    guide = await generateStudyGuide({
      topic,
      subjectName: subjectName ?? undefined,
      focus: focus ?? undefined,
    });
  } catch (err) {
    req.log.error({ err }, "Study guide generation failed");
    res
      .status(500)
      .json({ error: "Failed to generate study guide. Please try again." });
    return;
  }

  const [session] = await db
    .insert(learnSessionsTable)
    .values({
      userId: req.userId!,
      subjectId: subjectId ?? null,
      topic,
      title: guide.title,
      summary: guide.summary,
      sections: guide.sections,
      keyPoints: guide.keyPoints,
      nextSteps: guide.nextSteps,
    })
    .returning();

  res.status(201).json(
    GetLearnSessionResponse.parse({
      id: session.id,
      subjectId: session.subjectId,
      subjectName,
      topic: session.topic,
      title: session.title,
      summary: session.summary,
      sections: session.sections,
      keyPoints: session.keyPoints,
      nextSteps: session.nextSteps,
      createdAt: session.createdAt,
    }),
  );
});

router.get("/learn/sessions", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(learnSessionsTable)
    .where(eq(learnSessionsTable.userId, req.userId!))
    .orderBy(desc(learnSessionsTable.createdAt));

  const subjects = await db.select().from(subjectsTable);
  const nameById = new Map(subjects.map((s) => [s.id, s.name]));

  const summaries = rows.map((session) => ({
    id: session.id,
    subjectId: session.subjectId,
    subjectName:
      session.subjectId != null
        ? (nameById.get(session.subjectId) ?? null)
        : null,
    topic: session.topic,
    title: session.title,
    summary: session.summary,
    createdAt: session.createdAt,
  }));

  res.json(ListLearnSessionsResponse.parse(summaries));
});

router.get("/learn/sessions/:id", async (req, res): Promise<void> => {
  const params = GetLearnSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [session] = await db
    .select()
    .from(learnSessionsTable)
    .where(
      and(
        eq(learnSessionsTable.id, params.data.id),
        eq(learnSessionsTable.userId, req.userId!),
      ),
    );

  if (!session) {
    res.status(404).json({ error: "Study guide not found" });
    return;
  }

  const subjectName = await subjectNameFor(session.subjectId);

  res.json(
    GetLearnSessionResponse.parse({
      id: session.id,
      subjectId: session.subjectId,
      subjectName,
      topic: session.topic,
      title: session.title,
      summary: session.summary,
      sections: session.sections,
      keyPoints: session.keyPoints,
      nextSteps: session.nextSteps,
      createdAt: session.createdAt,
    }),
  );
});

router.delete("/learn/sessions/:id", async (req, res): Promise<void> => {
  const params = DeleteLearnSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [session] = await db
    .delete(learnSessionsTable)
    .where(
      and(
        eq(learnSessionsTable.id, params.data.id),
        eq(learnSessionsTable.userId, req.userId!),
      ),
    )
    .returning();

  if (!session) {
    res.status(404).json({ error: "Study guide not found" });
    return;
  }

  res.sendStatus(204);
});

// ── Interactive Lessons ──────────────────────────────────────────────────────

router.post("/learn/lesson", async (req, res): Promise<void> => {
  const parsed = GenerateLessonBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { topic, level, subjectId, focusAreas } = parsed.data;

  const topicCheck = await validateLearningInput(topic);
  if (!topicCheck.valid) {
    res.status(400).json({ error: topicCheck.reason });
    return;
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

  let lesson;
  try {
    lesson = await generateLesson({
      topic,
      subjectName: subjectName ?? undefined,
      level: level as "Beginner" | "Intermediate" | "Advanced",
      focusAreas: focusAreas ?? [],
    });
  } catch (err) {
    req.log.error({ err }, "Lesson generation failed");
    res.status(500).json({ error: "Failed to generate lesson. Please try again." });
    return;
  }

  const [row] = await db
    .insert(lessonsTable)
    .values({
      userId: req.userId!,
      subjectId: subjectId ?? null,
      topic,
      level,
      title: lesson.title,
      summary: lesson.summary,
      sections: lesson.sections,
      keyTerms: lesson.keyTerms,
    })
    .returning();

  res.status(201).json(
    GetLessonByIdResponse.parse({
      id: row.id,
      subjectId: row.subjectId,
      subjectName,
      topic: row.topic,
      level: row.level,
      title: row.title,
      summary: row.summary,
      sections: row.sections,
      keyTerms: row.keyTerms,
      createdAt: row.createdAt,
    }),
  );
});

router.get("/learn/lessons", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.userId, req.userId!))
    .orderBy(desc(lessonsTable.createdAt));

  const subjects = await db.select().from(subjectsTable);
  const nameById = new Map(subjects.map((s) => [s.id, s.name]));

  const summaries = rows.map((r) => ({
    id: r.id,
    subjectId: r.subjectId,
    subjectName: r.subjectId != null ? (nameById.get(r.subjectId) ?? null) : null,
    topic: r.topic,
    level: r.level,
    title: r.title,
    createdAt: r.createdAt,
  }));

  res.json(ListLessonsResponse.parse(summaries));
});

router.get("/learn/lessons/:id", async (req, res): Promise<void> => {
  const params = GetLessonByIdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(lessonsTable)
    .where(
      and(
        eq(lessonsTable.id, params.data.id),
        eq(lessonsTable.userId, req.userId!),
      ),
    );

  if (!row) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  const subjectName = row.subjectId
    ? (await db.select().from(subjectsTable).where(eq(subjectsTable.id, row.subjectId)))[0]?.name ?? null
    : null;

  res.json(
    GetLessonByIdResponse.parse({
      id: row.id,
      subjectId: row.subjectId,
      subjectName,
      topic: row.topic,
      level: row.level,
      title: row.title,
      summary: row.summary,
      sections: row.sections,
      keyTerms: row.keyTerms,
      createdAt: row.createdAt,
    }),
  );
});

router.delete("/learn/lessons/:id", async (req, res): Promise<void> => {
  const params = DeleteLessonByIdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(lessonsTable)
    .where(
      and(
        eq(lessonsTable.id, params.data.id),
        eq(lessonsTable.userId, req.userId!),
      ),
    )
    .returning();

  if (!row) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
