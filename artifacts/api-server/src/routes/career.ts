import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, careerPlansTable, documentsTable } from "@workspace/db";
import {
  RecommendSchoolsBody,
  ListCareerPlansResponse,
  GetCareerPlanParams,
  GetCareerPlanResponse,
} from "@workspace/api-zod";
import { generateCareerRecommendations } from "../lib/ai";
import { extractDocumentText } from "../lib/documentText";

const router: IRouter = Router();

async function documentNameFor(
  documentId: number | null,
): Promise<string | null> {
  if (documentId == null) return null;
  const [doc] = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.id, documentId));
  return doc?.name ?? null;
}

router.post("/career/recommend", async (req, res): Promise<void> => {
  const parsed = RecommendSchoolsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { currentEducation, documentId, preferences } = parsed.data;
  const careerGoal = parsed.data.careerGoal.trim();
  if (careerGoal.length === 0) {
    res.status(400).json({ error: "Career goal is required" });
    return;
  }

  let documentName: string | null = null;
  let transcriptText: string | undefined;
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

    const extracted = await extractDocumentText(doc.objectPath, doc.contentType);
    transcriptText = extracted
      ? `Content from the learner's uploaded document "${doc.name}":\n${extracted}`
      : `The learner uploaded a document named "${doc.name}", but its text could not be read.`;
  }

  let plan;
  try {
    plan = await generateCareerRecommendations({
      careerGoal,
      currentEducation: currentEducation ?? undefined,
      transcriptText,
      preferences: preferences ?? undefined,
    });
  } catch (err) {
    req.log.error({ err }, "Career recommendation failed");
    res.status(500).json({
      error: "Failed to generate recommendations. Please try again.",
    });
    return;
  }

  if (plan.recommendations.length === 0 || plan.summary.trim().length === 0) {
    req.log.error({ careerGoal }, "Career recommendation produced no usable results");
    res.status(500).json({
      error: "Could not produce recommendations. Please try again.",
    });
    return;
  }

  const [saved] = await db
    .insert(careerPlansTable)
    .values({
      careerGoal,
      currentEducation: currentEducation ?? null,
      documentId: documentId ?? null,
      title: plan.title,
      summary: plan.summary,
      preferences: preferences ?? {},
      recommendations: plan.recommendations,
      skillGaps: plan.skillGaps,
      nextSteps: plan.nextSteps,
    })
    .returning();

  res.status(201).json(
    GetCareerPlanResponse.parse({
      id: saved.id,
      careerGoal: saved.careerGoal,
      currentEducation: saved.currentEducation,
      documentId: saved.documentId,
      documentName,
      title: saved.title,
      summary: saved.summary,
      preferences: saved.preferences,
      recommendations: saved.recommendations,
      skillGaps: saved.skillGaps,
      nextSteps: saved.nextSteps,
      createdAt: saved.createdAt,
    }),
  );
});

router.get("/career/plans", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(careerPlansTable)
    .orderBy(desc(careerPlansTable.createdAt));

  const summaries = rows.map((plan) => ({
    id: plan.id,
    careerGoal: plan.careerGoal,
    title: plan.title,
    summary: plan.summary,
    recommendationCount: plan.recommendations.length,
    createdAt: plan.createdAt,
  }));

  res.json(ListCareerPlansResponse.parse(summaries));
});

router.get("/career/plans/:id", async (req, res): Promise<void> => {
  const params = GetCareerPlanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [plan] = await db
    .select()
    .from(careerPlansTable)
    .where(eq(careerPlansTable.id, params.data.id));

  if (!plan) {
    res.status(404).json({ error: "Career plan not found" });
    return;
  }

  const documentName = await documentNameFor(plan.documentId);

  res.json(
    GetCareerPlanResponse.parse({
      id: plan.id,
      careerGoal: plan.careerGoal,
      currentEducation: plan.currentEducation,
      documentId: plan.documentId,
      documentName,
      title: plan.title,
      summary: plan.summary,
      preferences: plan.preferences,
      recommendations: plan.recommendations,
      skillGaps: plan.skillGaps,
      nextSteps: plan.nextSteps,
      createdAt: plan.createdAt,
    }),
  );
});

export default router;
