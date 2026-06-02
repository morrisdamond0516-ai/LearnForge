import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, learnSessionsTable, subjectsTable } from "@workspace/db";
import {
  ResearchTopicBody,
  ListLearnSessionsResponse,
  GetLearnSessionParams,
  GetLearnSessionResponse,
} from "@workspace/api-zod";
import { generateStudyGuide } from "../lib/ai";

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

router.get("/learn/sessions", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(learnSessionsTable)
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
    .where(eq(learnSessionsTable.id, params.data.id));

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

export default router;
