import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, curriculaTable, subjectsTable } from "@workspace/db";
import {
  GenerateCurriculumBody,
  ListCurriculaResponse,
  GetCurriculumParams,
  GetCurriculumResponse,
} from "@workspace/api-zod";
import { generateCurriculum } from "../lib/ai";

const router: IRouter = Router();

router.post("/curriculum/generate", async (req, res): Promise<void> => {
  const parsed = GenerateCurriculumBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { subjectId, focusAreas } = parsed.data;
  const subject = parsed.data.subject.trim();
  if (subject.length === 0) {
    res.status(400).json({ error: "Subject is required" });
    return;
  }
  const level = parsed.data.level?.trim() || "Beginner";

  if (subjectId != null) {
    const [subjectRow] = await db
      .select()
      .from(subjectsTable)
      .where(eq(subjectsTable.id, subjectId));
    if (!subjectRow) {
      res.status(404).json({ error: "Subject not found" });
      return;
    }
  }

  let result;
  try {
    result = await generateCurriculum({ subject, level, focusAreas });
  } catch (err) {
    req.log.error({ err }, "Curriculum generation failed");
    res.status(500).json({
      error: "Failed to generate curriculum. Please try again.",
    });
    return;
  }

  if (result.modules.length === 0 || result.summary.trim().length === 0) {
    req.log.error({ subject, level }, "Curriculum produced no usable results");
    res.status(500).json({
      error: "Could not produce a curriculum. Please try again.",
    });
    return;
  }

  const [saved] = await db
    .insert(curriculaTable)
    .values({
      subjectId: subjectId ?? null,
      subject,
      level,
      title: result.title,
      summary: result.summary,
      modules: result.modules,
      nextSteps: result.nextSteps,
    })
    .returning();

  res.status(201).json(
    GetCurriculumResponse.parse({
      id: saved.id,
      subjectId: saved.subjectId,
      subject: saved.subject,
      level: saved.level,
      title: saved.title,
      summary: saved.summary,
      modules: saved.modules,
      nextSteps: saved.nextSteps,
      createdAt: saved.createdAt,
    }),
  );
});

router.get("/curriculum", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(curriculaTable)
    .orderBy(desc(curriculaTable.createdAt));

  const summaries = rows.map((c) => ({
    id: c.id,
    subject: c.subject,
    level: c.level,
    title: c.title,
    summary: c.summary,
    moduleCount: Array.isArray(c.modules) ? c.modules.length : 0,
    createdAt: c.createdAt,
  }));

  res.json(ListCurriculaResponse.parse(summaries));
});

router.get("/curriculum/:id", async (req, res): Promise<void> => {
  const params = GetCurriculumParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [c] = await db
    .select()
    .from(curriculaTable)
    .where(eq(curriculaTable.id, params.data.id));

  if (!c) {
    res.status(404).json({ error: "Curriculum not found" });
    return;
  }

  res.json(
    GetCurriculumResponse.parse({
      id: c.id,
      subjectId: c.subjectId,
      subject: c.subject,
      level: c.level,
      title: c.title,
      summary: c.summary,
      modules: c.modules,
      nextSteps: c.nextSteps,
      createdAt: c.createdAt,
    }),
  );
});

export default router;
