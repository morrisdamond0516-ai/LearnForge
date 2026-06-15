import { Router, type IRouter } from "express";
import { tutorReply, validateLearningInput } from "../lib/ai";
import type { TutorMessage } from "../lib/ai";

const router: IRouter = Router();

const MAX_MESSAGES = 60;
const MAX_LEN = 4000;

function parseMessages(raw: unknown): TutorMessage[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length > MAX_MESSAGES) return null;
  const out: TutorMessage[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) return null;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (role !== "tutor" && role !== "student") return null;
    if (typeof content !== "string" || content.length === 0) return null;
    out.push({ role, content: content.slice(0, MAX_LEN) });
  }
  return out;
}

router.post("/tutor/message", async (req, res): Promise<void> => {
  const body = (req.body ?? {}) as { subject?: unknown; messages?: unknown };
  const messages = parseMessages(body.messages);
  if (messages === null) {
    res.status(400).json({ error: "Invalid conversation payload." });
    return;
  }
  const subject =
    typeof body.subject === "string" ? body.subject.slice(0, 120) : undefined;

  // Validate the topic only when the student first sets it (opening the chat),
  // mirroring the roleplay opening-turn gate.
  if (messages.length === 0 && subject && subject.trim().length > 0) {
    const check = await validateLearningInput(subject);
    if (!check.valid) {
      res.status(400).json({ error: check.reason });
      return;
    }
  }

  try {
    const result = await tutorReply({ subject, messages });
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Tutor reply failed");
    res
      .status(500)
      .json({ error: "The tutor couldn't respond. Please try again." });
  }
});

export default router;
