import { Router, type IRouter } from "express";
import { RoleplayMessageBody, EvaluateRoleplayBody } from "@workspace/api-zod";
import {
  conductInterviewTurn,
  evaluateInterview,
  validateLearningInput,
} from "../lib/ai";
import type { InterviewMessage } from "../lib/ai";

const router: IRouter = Router();

router.post("/roleplay/message", async (req, res): Promise<void> => {
  const parsed = RoleplayMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { career, focus, messages } = parsed.data;

  if (messages.length === 0) {
    const check = await validateLearningInput(career);
    if (!check.valid) {
      res.status(400).json({ error: check.reason });
      return;
    }
  }

  try {
    const result = await conductInterviewTurn({
      career,
      focus: focus ?? undefined,
      messages: messages as InterviewMessage[],
    });
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Interview roleplay turn failed");
    res
      .status(500)
      .json({ error: "Failed to continue the interview. Please try again." });
  }
});

router.post("/roleplay/evaluate", async (req, res): Promise<void> => {
  const parsed = EvaluateRoleplayBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { career, focus, messages } = parsed.data;

  const check = await validateLearningInput(career);
  if (!check.valid) {
    res.status(400).json({ error: check.reason });
    return;
  }

  try {
    const result = await evaluateInterview({
      career,
      focus: focus ?? undefined,
      messages: messages as InterviewMessage[],
    });
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Interview roleplay evaluation failed");
    res
      .status(500)
      .json({ error: "Failed to evaluate the interview. Please try again." });
  }
});

export default router;
