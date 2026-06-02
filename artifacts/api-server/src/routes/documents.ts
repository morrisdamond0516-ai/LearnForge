import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, documentsTable, subjectsTable } from "@workspace/db";
import {
  ListDocumentsResponse,
  CreateDocumentBody,
  GetDocumentParams,
  GetDocumentResponse,
  DeleteDocumentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/documents", async (_req, res): Promise<void> => {
  const documents = await db
    .select()
    .from(documentsTable)
    .orderBy(desc(documentsTable.createdAt));
  res.json(ListDocumentsResponse.parse(documents));
});

router.post("/documents", async (req, res): Promise<void> => {
  const parsed = CreateDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.subjectId != null) {
    const [subject] = await db
      .select()
      .from(subjectsTable)
      .where(eq(subjectsTable.id, parsed.data.subjectId));
    if (!subject) {
      res.status(404).json({ error: "Subject not found" });
      return;
    }
  }

  const [document] = await db
    .insert(documentsTable)
    .values({
      name: parsed.data.name,
      objectPath: parsed.data.objectPath,
      contentType: parsed.data.contentType ?? null,
      size: parsed.data.size ?? null,
      subjectId: parsed.data.subjectId ?? null,
      status: "ready",
    })
    .returning();

  res.status(201).json(GetDocumentResponse.parse(document));
});

router.get("/documents/:id", async (req, res): Promise<void> => {
  const params = GetDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [document] = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.id, params.data.id));

  if (!document) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  res.json(GetDocumentResponse.parse(document));
});

router.delete("/documents/:id", async (req, res): Promise<void> => {
  const params = DeleteDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [document] = await db
    .delete(documentsTable)
    .where(eq(documentsTable.id, params.data.id))
    .returning();

  if (!document) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
