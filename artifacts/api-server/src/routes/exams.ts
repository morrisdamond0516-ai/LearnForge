import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, quizzesTable, certificatesTable, type Certificate } from "@workspace/db";
import { generateQuizContent } from "../lib/ai";
import { getEntitlement } from "../lib/entitlement";
import { requirePro } from "../middlewares/requirePro";
import {
  getExam,
  listExamsByCategory,
  CATEGORY_LABELS,
} from "../lib/examCatalog";

const router: IRouter = Router();

function toCertDto(c: Certificate) {
  const exam = getExam(c.examSlug);
  return {
    id: c.id,
    examSlug: c.examSlug,
    examName: c.examName,
    category: exam ? CATEGORY_LABELS[exam.category] : null,
    score: c.score,
    level: c.level,
    issuedAt: c.issuedAt.toISOString(),
    expiresAt: c.expiresAt.toISOString(),
    expired: c.expiresAt.getTime() < Date.now(),
  };
}

// Browse the catalog. Surfaces the viewer's Pro status so the UI can show
// locks without a second round-trip. (Parent router already requires auth.)
router.get("/exams/catalog", async (req, res): Promise<void> => {
  let pro = false;
  try {
    pro = (await getEntitlement(req.userId!)).pro;
  } catch (err) {
    req.log.error({ err }, "Catalog entitlement lookup failed");
  }
  res.json({ pro, categories: listExamsByCategory() });
});

// Start a certified exam: generate a full-length quiz and return its id so the
// client can use the existing quiz-taking flow. Pro-gated (owner is free).
router.post("/exams/:slug/start", requirePro, async (req, res): Promise<void> => {
  const exam = getExam(String(req.params.slug));
  if (!exam) {
    res.status(404).json({ error: "Exam not found" });
    return;
  }

  let generated;
  try {
    generated = await generateQuizContent({
      mode: "exam",
      career: exam.careerContext,
      topic: exam.focus,
      difficulty: exam.difficulty,
      questionCount: exam.questionCount,
    });
  } catch (err) {
    req.log.error({ err }, "Certified exam generation failed");
    res
      .status(500)
      .json({ error: "Could not build this exam right now. Please try again." });
    return;
  }

  const [quiz] = await db
    .insert(quizzesTable)
    .values({
      userId: req.userId!,
      title: exam.name,
      mode: "exam",
      topic: exam.focus ?? null,
      career: exam.careerContext,
      examSlug: exam.slug,
      difficulty: exam.difficulty,
      questionCount: exam.questionCount,
      questions: generated.questions,
    })
    .returning();

  res.status(201).json({ quizId: quiz.id });
});

router.get("/exams/certificates", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(certificatesTable)
    .where(eq(certificatesTable.userId, req.userId!))
    .orderBy(desc(certificatesTable.issuedAt));
  res.json(rows.map(toCertDto));
});

router.get("/exams/certificates/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid certificate id" });
    return;
  }
  const [cert] = await db
    .select()
    .from(certificatesTable)
    .where(
      and(
        eq(certificatesTable.id, id),
        eq(certificatesTable.userId, req.userId!),
      ),
    );
  if (!cert) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }
  res.json(toCertDto(cert));
});

export default router;
