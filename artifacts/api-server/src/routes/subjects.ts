import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, subjectsTable } from "@workspace/db";
import {
  ListSubjectsResponse,
  CreateSubjectBody,
  GetSubjectParams,
  GetSubjectResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

router.get("/subjects", async (_req, res): Promise<void> => {
  const subjects = await db
    .select()
    .from(subjectsTable)
    .orderBy(subjectsTable.name);
  res.json(ListSubjectsResponse.parse(subjects));
});

router.post("/subjects", async (req, res): Promise<void> => {
  const parsed = CreateSubjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const baseSlug = slugify(parsed.data.name) || "subject";
  let slug = baseSlug;
  let suffix = 1;
  while (true) {
    const [existing] = await db
      .select()
      .from(subjectsTable)
      .where(eq(subjectsTable.slug, slug));
    if (!existing) break;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const [subject] = await db
    .insert(subjectsTable)
    .values({
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? null,
      category: parsed.data.category ?? "General",
      isCustom: true,
    })
    .returning();

  res.status(201).json(GetSubjectResponse.parse(subject));
});

router.get("/subjects/:id", async (req, res): Promise<void> => {
  const params = GetSubjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [subject] = await db
    .select()
    .from(subjectsTable)
    .where(eq(subjectsTable.id, params.data.id));

  if (!subject) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }

  res.json(GetSubjectResponse.parse(subject));
});

export default router;
