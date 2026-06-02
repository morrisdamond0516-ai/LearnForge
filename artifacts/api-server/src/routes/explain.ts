import { Router, type IRouter } from "express";
import { ExplainQuestionBody } from "@workspace/api-zod";
import { generateExplanation } from "../lib/ai";

const router: IRouter = Router();

router.post("/explain", async (req, res): Promise<void> => {
  const parsed = ExplainQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { prompt, options, correctIndex, selectedIndex, subject } = parsed.data;

  const result = await generateExplanation({
    prompt,
    options,
    correctIndex,
    selectedIndex,
    subject,
  });

  res.json(result);
});

export default router;
