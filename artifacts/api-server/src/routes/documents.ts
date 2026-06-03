import { Router, type IRouter } from "express";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { db, documentsTable, subjectsTable } from "@workspace/db";
import {
  ListDocumentsResponse,
  CreateDocumentBody,
  GetDocumentParams,
  GetDocumentResponse,
  DeleteDocumentParams,
} from "@workspace/api-zod";
import {
  ObjectStorageService,
  ObjectNotFoundError,
  ObjectAccessDeniedError,
} from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

router.get("/documents", async (req, res): Promise<void> => {
  const documents = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.userId, req.userId!))
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
      .where(
        and(
          eq(subjectsTable.id, parsed.data.subjectId),
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
  }

  // Claim ownership of the uploaded object so only this user can read it back
  // through GET /storage/objects. Fails closed if the object isn't there, and
  // refuses to hijack an object already owned by someone else.
  try {
    await objectStorageService.claimObjectEntityOwnership(
      parsed.data.objectPath,
      req.userId!,
    );
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(400).json({ error: "Uploaded file not found" });
      return;
    }
    if (error instanceof ObjectAccessDeniedError) {
      res.status(403).json({ error: "You do not have access to this file" });
      return;
    }
    req.log.error({ err: error }, "Failed to set object ACL");
    res.status(500).json({ error: "Failed to register uploaded file" });
    return;
  }

  const [document] = await db
    .insert(documentsTable)
    .values({
      userId: req.userId!,
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
    .where(
      and(
        eq(documentsTable.id, params.data.id),
        eq(documentsTable.userId, req.userId!),
      ),
    );

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
    .where(
      and(
        eq(documentsTable.id, params.data.id),
        eq(documentsTable.userId, req.userId!),
      ),
    )
    .returning();

  if (!document) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
