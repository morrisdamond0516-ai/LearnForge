import { Router, type IRouter } from "express";
import { and, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import {
  db,
  curriculaTable,
  subjectsTable,
  quizzesTable,
  attemptsTable,
} from "@workspace/db";
import {
  GenerateCurriculumBody,
  ListCurriculaResponse,
  GetCurriculumParams,
  GetCurriculumResponse,
  PracticeCurriculumModuleParams,
  PracticeCurriculumModuleResponse,
  GetCurriculumProgressParams,
  GetCurriculumProgressResponse,
} from "@workspace/api-zod";
import { generateCurriculum, generateQuizContent } from "../lib/ai";

const router: IRouter = Router();

// A learner is considered to have "mastered" a module once a practice attempt
// scores at or above this percentage.
const MASTERY_THRESHOLD = 80;

function difficultyForLevel(level: string): string {
  const l = level.toLowerCase();
  if (l.includes("advanced")) return "hard";
  if (l.includes("beginner")) return "easy";
  return "medium";
}

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
      .where(
        and(
          eq(subjectsTable.id, subjectId),
          or(
            isNull(subjectsTable.userId),
            eq(subjectsTable.userId, req.userId!),
          ),
        ),
      );
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
      userId: req.userId!,
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

router.get("/curriculum", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(curriculaTable)
    .where(eq(curriculaTable.userId, req.userId!))
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
    .where(
      and(
        eq(curriculaTable.id, params.data.id),
        eq(curriculaTable.userId, req.userId!),
      ),
    );

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

router.post(
  "/curriculum/:id/modules/:index/practice",
  async (req, res): Promise<void> => {
    const params = PracticeCurriculumModuleParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const { id, index } = params.data;

    const [c] = await db
      .select()
      .from(curriculaTable)
      .where(
        and(
          eq(curriculaTable.id, id),
          eq(curriculaTable.userId, req.userId!),
        ),
      );
    if (!c) {
      res.status(404).json({ error: "Curriculum not found" });
      return;
    }

    const modules = Array.isArray(c.modules) ? c.modules : [];
    if (!Number.isInteger(index) || index < 0 || index >= modules.length) {
      res.status(404).json({ error: "Module not found" });
      return;
    }
    const mod = modules[index];
    if (!mod) {
      res.status(404).json({ error: "Module not found" });
      return;
    }

    // Reuse the module's existing practice quiz so retakes aggregate into one
    // progress record; taking it regenerates fresh questions each time.
    const [existing] = await db
      .select()
      .from(quizzesTable)
      .where(
        and(
          eq(quizzesTable.userId, req.userId!),
          eq(quizzesTable.curriculumId, id),
          eq(quizzesTable.moduleIndex, index),
        ),
      );
    if (existing) {
      res.json(PracticeCurriculumModuleResponse.parse({ quizId: existing.id }));
      return;
    }

    let subjectName: string | null = null;
    if (c.subjectId != null) {
      const [s] = await db
        .select()
        .from(subjectsTable)
        .where(eq(subjectsTable.id, c.subjectId));
      subjectName = s?.name ?? null;
    }

    const skills = Array.isArray(mod.skills)
      ? mod.skills
          .filter((s): s is string => typeof s === "string")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];
    const topicParts = [mod.title];
    if (mod.objective) topicParts.push(mod.objective);
    if (skills.length > 0)
      topicParts.push(`Focus on these skills: ${skills.join("; ")}`);
    const topic = topicParts.join(". ");
    const difficulty = difficultyForLevel(c.level);

    let generated;
    try {
      generated = await generateQuizContent({
        mode: "practice",
        subjectName: subjectName ?? undefined,
        topic,
        difficulty,
        questionCount: 8,
      });
    } catch (err) {
      req.log.error({ err }, "Module practice quiz generation failed");
      res.status(500).json({
        error: "Failed to generate a practice quiz. Please try again.",
      });
      return;
    }

    const [quiz] = await db
      .insert(quizzesTable)
      .values({
        userId: req.userId!,
        title: `${mod.title} - Practice`,
        mode: "practice",
        subjectId: c.subjectId ?? null,
        curriculumId: id,
        moduleIndex: index,
        topic,
        difficulty,
        questionCount: 8,
        questions: generated.questions,
      })
      .onConflictDoNothing({
        target: [
          quizzesTable.userId,
          quizzesTable.curriculumId,
          quizzesTable.moduleIndex,
        ],
        where: sql`${quizzesTable.userId} IS NOT NULL AND ${quizzesTable.curriculumId} IS NOT NULL AND ${quizzesTable.moduleIndex} IS NOT NULL`,
      })
      .returning();

    // A concurrent request won the race and created the row first; reuse it
    // instead of returning a second (now-discarded) quiz.
    if (!quiz) {
      const [winner] = await db
        .select()
        .from(quizzesTable)
        .where(
          and(
            eq(quizzesTable.userId, req.userId!),
            eq(quizzesTable.curriculumId, id),
            eq(quizzesTable.moduleIndex, index),
          ),
        );
      res.json(
        PracticeCurriculumModuleResponse.parse({ quizId: winner!.id }),
      );
      return;
    }

    res.json(PracticeCurriculumModuleResponse.parse({ quizId: quiz.id }));
  },
);

router.get(
  "/curriculum/:id/progress",
  async (req, res): Promise<void> => {
    const params = GetCurriculumProgressParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const { id } = params.data;

    const [c] = await db
      .select()
      .from(curriculaTable)
      .where(
        and(
          eq(curriculaTable.id, id),
          eq(curriculaTable.userId, req.userId!),
        ),
      );
    if (!c) {
      res.status(404).json({ error: "Curriculum not found" });
      return;
    }

    const modules = Array.isArray(c.modules) ? c.modules : [];

    const quizzes = await db
      .select()
      .from(quizzesTable)
      .where(
        and(
          eq(quizzesTable.userId, req.userId!),
          eq(quizzesTable.curriculumId, id),
        ),
      );

    const quizByModule = new Map<number, number>();
    for (const q of quizzes) {
      if (q.moduleIndex != null) quizByModule.set(q.moduleIndex, q.id);
    }

    const quizIds = quizzes.map((q) => q.id);
    const byQuiz = new Map<
      number,
      { best: number; last: number; count: number }
    >();
    if (quizIds.length > 0) {
      const attempts = await db
        .select()
        .from(attemptsTable)
        .where(
          and(
            eq(attemptsTable.userId, req.userId!),
            inArray(attemptsTable.quizId, quizIds),
          ),
        )
        .orderBy(desc(attemptsTable.completedAt));
      // Ordered newest-first, so the first attempt seen per quiz is the latest.
      for (const a of attempts) {
        const cur = byQuiz.get(a.quizId);
        if (!cur) {
          byQuiz.set(a.quizId, { best: a.score, last: a.score, count: 1 });
        } else {
          cur.best = Math.max(cur.best, a.score);
          cur.count += 1;
        }
      }
    }

    const progress = modules.map((_, idx) => {
      const quizId = quizByModule.get(idx) ?? null;
      const agg = quizId != null ? byQuiz.get(quizId) : undefined;
      const bestScore = agg ? agg.best : null;
      return {
        moduleIndex: idx,
        quizId,
        attempts: agg ? agg.count : 0,
        bestScore,
        lastScore: agg ? agg.last : null,
        mastered: bestScore != null && bestScore >= MASTERY_THRESHOLD,
      };
    });

    res.json(GetCurriculumProgressResponse.parse(progress));
  },
);

export default router;
