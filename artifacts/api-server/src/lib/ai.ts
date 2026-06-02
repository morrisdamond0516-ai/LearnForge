import { openai } from "@workspace/integrations-openai-ai-server";
import type { QuizQuestion } from "@workspace/db";
import type { LearnSectionData } from "@workspace/db";

const MODEL = "gpt-5.4";

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : trimmed;
  return JSON.parse(candidate);
}

export type GenerateQuizArgs = {
  mode: "placement" | "practice" | "exam";
  subjectName?: string;
  topic?: string;
  documentName?: string;
  difficulty: string;
  questionCount: number;
};

export type GeneratedQuiz = {
  title: string;
  questions: QuizQuestion[];
};

export async function generateQuizContent(
  args: GenerateQuizArgs,
): Promise<GeneratedQuiz> {
  const { mode, subjectName, topic, documentName, difficulty, questionCount } =
    args;

  const focus =
    topic ??
    subjectName ??
    documentName ??
    "general knowledge";

  const modeDescription =
    mode === "placement"
      ? "a placement assessment that spans easy to hard questions to gauge the learner's level"
      : mode === "exam"
        ? "a comprehensive exam"
        : "a focused practice quiz";

  const system =
    "You are an expert instructional designer who writes high quality multiple-choice assessment questions. " +
    "Every question has exactly 4 options, exactly one correct answer, and a concise explanation. " +
    "Return ONLY valid JSON, no prose, no markdown fences.";

  const user = `Create ${modeDescription} about "${focus}".
Difficulty: ${difficulty}.
Number of questions: ${questionCount}.
${documentName ? `The material is based on an uploaded document named "${documentName}".` : ""}

Return JSON with this exact shape:
{
  "title": "a short descriptive title for this ${mode}",
  "questions": [
    {
      "prompt": "the question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explanation": "why the correct answer is correct"
    }
  ]
}
Ensure correctIndex is the 0-based index of the correct option. Produce exactly ${questionCount} questions.`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_completion_tokens: 8192,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "";
  const parsed = extractJson(content) as {
    title?: string;
    questions?: Array<{
      prompt?: string;
      options?: string[];
      correctIndex?: number;
      explanation?: string;
    }>;
  };

  const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
  const questions: QuizQuestion[] = rawQuestions
    .filter(
      (q) =>
        typeof q.prompt === "string" &&
        Array.isArray(q.options) &&
        q.options.length >= 2,
    )
    .map((q, index) => {
      const options = (q.options ?? []).map((o) => String(o));
      let correctIndex =
        typeof q.correctIndex === "number" ? q.correctIndex : 0;
      if (correctIndex < 0 || correctIndex >= options.length) correctIndex = 0;
      return {
        id: index + 1,
        prompt: String(q.prompt),
        options,
        correctIndex,
        explanation:
          typeof q.explanation === "string" ? q.explanation : null,
        order: index,
      };
    });

  if (questions.length === 0) {
    throw new Error("AI returned no usable questions");
  }

  const title =
    typeof parsed.title === "string" && parsed.title.trim().length > 0
      ? parsed.title.trim()
      : `${focus} ${mode}`;

  return { title, questions };
}

export type ResearchArgs = {
  topic: string;
  subjectName?: string;
  focus?: string;
};

export type GeneratedStudyGuide = {
  title: string;
  summary: string;
  sections: LearnSectionData[];
  keyPoints: string[];
  nextSteps: string[];
};

export async function generateStudyGuide(
  args: ResearchArgs,
): Promise<GeneratedStudyGuide> {
  const { topic, subjectName, focus } = args;

  const system =
    "You are an expert tutor who creates clear, well-structured study guides for self-learners. " +
    "Write in an encouraging, plain-spoken voice. Do not use emojis. " +
    "Return ONLY valid JSON, no prose, no markdown fences.";

  const user = `Create a study guide about "${topic}".
${subjectName ? `Subject area: ${subjectName}.` : ""}
${focus ? `The learner especially wants to focus on: ${focus}.` : ""}

Return JSON with this exact shape:
{
  "title": "a clear title",
  "summary": "a 2-3 sentence overview of the topic",
  "sections": [
    { "heading": "section heading", "content": "2-4 paragraphs of clear explanation" }
  ],
  "keyPoints": ["concise takeaway", "concise takeaway"],
  "nextSteps": ["suggested next action to keep learning"]
}
Include 4-6 sections, 4-6 keyPoints, and 3-4 nextSteps.`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_completion_tokens: 8192,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "";
  const parsed = extractJson(content) as {
    title?: string;
    summary?: string;
    sections?: Array<{ heading?: string; content?: string }>;
    keyPoints?: string[];
    nextSteps?: string[];
  };

  const sections: LearnSectionData[] = (
    Array.isArray(parsed.sections) ? parsed.sections : []
  )
    .filter((s) => typeof s.content === "string")
    .map((s) => ({
      heading:
        typeof s.heading === "string" && s.heading.trim().length > 0
          ? s.heading.trim()
          : "Overview",
      content: String(s.content),
    }));

  return {
    title:
      typeof parsed.title === "string" && parsed.title.trim().length > 0
        ? parsed.title.trim()
        : topic,
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    sections,
    keyPoints: (Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [])
      .filter((k) => typeof k === "string")
      .map((k) => String(k)),
    nextSteps: (Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [])
      .filter((k) => typeof k === "string")
      .map((k) => String(k)),
  };
}

export function assessLevel(score: number): string {
  if (score >= 80) return "Advanced";
  if (score >= 50) return "Intermediate";
  return "Beginner";
}

export function buildFeedback(score: number, level: string): string {
  if (score >= 80) {
    return `Excellent work. You scored ${Math.round(score)}% and are performing at an ${level} level. Consider tackling harder material to keep growing.`;
  }
  if (score >= 50) {
    return `Solid effort. You scored ${Math.round(score)}%, which places you at an ${level} level. Review the explanations and try again to push higher.`;
  }
  return `Good start. You scored ${Math.round(score)}% and are at a ${level} level. Work through the explanations and study guides, then retake to build confidence.`;
}
