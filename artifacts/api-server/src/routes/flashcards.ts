import { Router, type IRouter } from "express";
import {
  db,
  flashcardDecksTable,
  subjectsTable,
} from "@workspace/db";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { generateFlashcards, validateLearningInput } from "../lib/ai";

const router: IRouter = Router();

/** List the signed-in user's flashcard decks (newest first). */
router.get("/flashcards", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const decks = await db
    .select()
    .from(flashcardDecksTable)
    .where(eq(flashcardDecksTable.userId, userId))
    .orderBy(desc(flashcardDecksTable.createdAt));
  res.json({ decks });
});

/** Fetch a single deck (must be owned by the user). */
router.get("/flashcards/:id", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const id = Number(String(req.params.id));
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid deck id." });
    return;
  }
  const [deck] = await db
    .select()
    .from(flashcardDecksTable)
    .where(
      and(
        eq(flashcardDecksTable.id, id),
        eq(flashcardDecksTable.userId, userId),
      ),
    );
  if (!deck) {
    res.status(404).json({ error: "Deck not found." });
    return;
  }
  res.json(deck);
});

/** Generate and save a new flashcard deck. */
router.post("/flashcards", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const body = (req.body ?? {}) as {
    topic?: unknown;
    subjectId?: unknown;
    count?: unknown;
  };
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  if (topic.length === 0 || topic.length > 120) {
    res.status(400).json({ error: "Enter a topic (up to 120 characters)." });
    return;
  }

  const check = await validateLearningInput(topic);
  if (!check.valid) {
    res.status(400).json({ error: check.reason });
    return;
  }

  let subjectId: number | null = null;
  let subjectName: string | undefined;
  if (body.subjectId != null) {
    const sid = Number(body.subjectId);
    if (!Number.isInteger(sid)) {
      res.status(400).json({ error: "Invalid subject." });
      return;
    }
    const [subject] = await db
      .select()
      .from(subjectsTable)
      .where(
        and(
          eq(subjectsTable.id, sid),
          or(isNull(subjectsTable.userId), eq(subjectsTable.userId, userId)),
        ),
      );
    if (!subject) {
      res.status(404).json({ error: "Subject not found." });
      return;
    }
    subjectId = subject.id;
    subjectName = subject.name;
  }

  const count =
    typeof body.count === "number" ? Math.trunc(body.count) : undefined;

  try {
    const generated = await generateFlashcards({
      topic,
      subjectName,
      count,
    });
    if (generated.cards.length === 0) {
      res.status(500).json({ error: "Couldn't generate cards. Try again." });
      return;
    }
    const [deck] = await db
      .insert(flashcardDecksTable)
      .values({
        userId,
        subjectId,
        topic,
        title: generated.title,
        cards: generated.cards,
      })
      .returning();
    res.status(201).json(deck);
  } catch (err) {
    req.log.error({ err }, "Flashcard generation failed");
    res.status(500).json({ error: "Couldn't generate cards. Try again." });
  }
});

/** Delete a deck owned by the user. */
router.delete("/flashcards/:id", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const id = Number(String(req.params.id));
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid deck id." });
    return;
  }
  const deleted = await db
    .delete(flashcardDecksTable)
    .where(
      and(
        eq(flashcardDecksTable.id, id),
        eq(flashcardDecksTable.userId, userId),
      ),
    )
    .returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Deck not found." });
    return;
  }
  res.json({ ok: true });
});

export default router;
