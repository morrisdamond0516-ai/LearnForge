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
  career?: string;
  difficulty: string;
  questionCount: number;
};

export type GeneratedQuiz = {
  title: string;
  questions: QuizQuestion[];
};

const QUIZ_BATCH_SIZE = 15;
export const MAX_QUIZ_QUESTIONS = 60;

async function generateQuizBatch(
  args: GenerateQuizArgs,
  batchCount: number,
  batchHint: string,
): Promise<GeneratedQuiz> {
  const { mode, subjectName, topic, documentName, career, difficulty } =
    args;

  const variationKey = `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;

  const careerName = career?.trim();

  const focus =
    careerName ??
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

  const system = careerName
    ? "You are an expert exam-prep author who builds realistic practice tests that mirror the official hiring, qualifying, civil-service, and professional certification exams used for specific jobs. " +
      "Base every question on the real competencies and section content those exams actually assess; do not invent fictional test formats. " +
      "Every question has exactly 4 options, exactly one correct answer, and a concise explanation that teaches the underlying concept. " +
      "Return ONLY valid JSON, no prose, no markdown fences."
    : "You are an expert instructional designer who writes high quality multiple-choice assessment questions. " +
      "Every question has exactly 4 options, exactly one correct answer, and a concise explanation. " +
      "Return ONLY valid JSON, no prose, no markdown fences.";

  const careerInstructions = careerName
    ? `This is a job-readiness / certification practice test for the role: "${careerName}".
First determine which official test(s) a candidate for this role must pass (e.g. civil-service exams, licensing or professional certification exams, employer screening tests) and which sections/competencies those exams assess.
${topic ? `Focus this test specifically on the "${topic}" section/competency of that exam (for example, if the focus is "Math", write the kind of quantitative questions that exam asks: arithmetic, fractions, decimals, percentages, ratios and proportions, basic algebra, unit conversions, reading tables/charts, and real-world word problems framed around the job's daily tasks).` : `Cover the core sections of that exam proportionally (for example, quantitative/math reasoning, reading comprehension, vocabulary, and situational-judgment where applicable), weighting the sections the way the real exam does.`}
Match the realistic style, framing, and difficulty of the actual exam so this serves as genuine preparation.
`
    : "";

  const user = `Create ${modeDescription} about "${focus}".
${careerInstructions}Difficulty: ${difficulty}.
Number of questions: ${batchCount}.
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
Ensure correctIndex is the 0-based index of the correct option. Produce exactly ${batchCount} questions.
Generate a fresh, original set of questions that differs from any previous run: vary the specific sub-topics, scenarios, examples, numbers, and wording so the learner cannot memorize the answers. Distribute the correct option across different positions. ${batchHint} (variation key: ${variationKey})`;

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

  const title =
    typeof parsed.title === "string" && parsed.title.trim().length > 0
      ? parsed.title.trim()
      : `${focus} ${mode}`;

  return { title, questions };
}

export async function generateQuizContent(
  args: GenerateQuizArgs,
): Promise<GeneratedQuiz> {
  const total = Math.min(MAX_QUIZ_QUESTIONS, Math.max(1, args.questionCount));

  if (total <= QUIZ_BATCH_SIZE) {
    const batch = await generateQuizBatch(args, total, "");
    if (batch.questions.length === 0) {
      throw new Error("AI returned no usable questions");
    }
    return { title: batch.title, questions: batch.questions.slice(0, total) };
  }

  let title = "";
  const merged: QuizQuestion[] = [];
  const MAX_FILL_ROUNDS = 3;

  for (let round = 0; round < MAX_FILL_ROUNDS && merged.length < total; round++) {
    const need = total - merged.length;
    const batchCounts: number[] = [];
    let remaining = need;
    while (remaining > 0) {
      const next = Math.min(QUIZ_BATCH_SIZE, remaining);
      batchCounts.push(next);
      remaining -= next;
    }

    const results = await Promise.all(
      batchCounts.map((count, i) =>
        generateQuizBatch(
          args,
          count,
          `This is one part of a longer ${total}-question test (round ${round + 1}, part ${i + 1}); cover different sub-topics, scenarios, and numbers than the other parts so there is no overlap.`,
        ).catch(() => ({ title: "", questions: [] as QuizQuestion[] })),
      ),
    );

    let producedThisRound = 0;
    for (const r of results) {
      if (!title && r.title) title = r.title;
      for (const q of r.questions) merged.push(q);
      producedThisRound += r.questions.length;
    }

    if (producedThisRound === 0) break;
  }

  if (merged.length === 0) {
    throw new Error("AI returned no usable questions");
  }

  const questions = merged
    .slice(0, total)
    .map((q, index) => ({ ...q, id: index + 1, order: index }));

  const fallbackFocus =
    args.career?.trim() ?? args.topic ?? args.subjectName ?? "Practice";
  return { title: title || `${fallbackFocus} ${args.mode}`, questions };
}

export type CareerExamInfo = {
  examName: string | null;
  questionCount: number;
  note: string | null;
};

export async function getCareerExamInfo(
  career: string,
  section?: string,
): Promise<CareerExamInfo> {
  const system =
    "You are an expert on hiring, civil-service, licensing, and professional certification exams. " +
    "Return ONLY valid JSON, no prose, no markdown fences.";
  const user = `For the role "${career}", identify the main official exam a candidate must pass${section ? ` and specifically its "${section}" section` : ""}.
Return JSON: {"examName": "name of the real exam, or null if there is none", "questionCount": <typical total number of questions on ${section ? "that section" : "the full exam"}, as an integer>, "note": "one short sentence about the exam"}.
Base questionCount on the real exam; if you are unsure, give your best realistic estimate. Never return 0.`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_completion_tokens: 400,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "";
  const parsed = extractJson(content) as {
    examName?: string;
    questionCount?: number;
    note?: string;
  };

  const questionCount =
    typeof parsed.questionCount === "number" && parsed.questionCount > 0
      ? Math.round(parsed.questionCount)
      : 25;

  return {
    examName:
      typeof parsed.examName === "string" && parsed.examName.trim()
        ? parsed.examName.trim()
        : null,
    questionCount,
    note:
      typeof parsed.note === "string" && parsed.note.trim()
        ? parsed.note.trim()
        : null,
  };
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

export type CareerPreferences = {
  degreeLevel?: string;
  studyMode?: string;
  location?: string;
  budget?: string;
  timeline?: string;
};

export type SchoolRecommendation = {
  schoolName: string;
  programName: string;
  degreeLevel: string;
  modality: string;
  location: string;
  estimatedCost: string;
  duration: string;
  whyFit: string;
  highlights: string[];
};

export type CareerArgs = {
  careerGoal: string;
  currentEducation?: string;
  transcriptText?: string;
  preferences?: CareerPreferences;
};

export type GeneratedCareerPlan = {
  title: string;
  summary: string;
  recommendations: SchoolRecommendation[];
  skillGaps: string[];
  nextSteps: string[];
};

export async function generateCareerRecommendations(
  args: CareerArgs,
): Promise<GeneratedCareerPlan> {
  const { careerGoal, currentEducation, transcriptText, preferences } = args;
  const prefs = preferences ?? {};

  const prefLines: string[] = [];
  if (prefs.degreeLevel)
    prefLines.push(`Desired degree level: ${prefs.degreeLevel}.`);
  if (prefs.studyMode)
    prefLines.push(`Preferred study mode: ${prefs.studyMode}.`);
  if (prefs.location)
    prefLines.push(`Preferred location: ${prefs.location}.`);
  if (prefs.budget) prefLines.push(`Budget preference: ${prefs.budget}.`);
  if (prefs.timeline) prefLines.push(`Timeline: ${prefs.timeline}.`);

  const system =
    "You are an experienced academic and career advisor. You help learners find the right schools and programs to reach their career goals. " +
    "Be realistic, specific, and encouraging. Recommend a diverse, well-known set of real, plausible schools/programs that fit the stated constraints. " +
    "Do not use emojis. Return ONLY valid JSON, no prose, no markdown fences.";

  const user = `The learner's career goal is: "${careerGoal}".
${currentEducation ? `Their current education / background: ${currentEducation}.` : ""}
${transcriptText ? `Here is information from their uploaded transcript or background document (use it to judge their starting point):\n${transcriptText.slice(0, 4000)}` : ""}
${prefLines.length > 0 ? `Preferences and filters:\n${prefLines.join("\n")}` : ""}

Recommend schools and programs that would help this person reach their goal, honoring the preferences above when given.

Return JSON with this exact shape:
{
  "title": "a short title for this career plan",
  "summary": "a 2-3 sentence overview of the recommended path and how these options fit the learner",
  "recommendations": [
    {
      "schoolName": "name of the institution",
      "programName": "name of the specific program or degree",
      "degreeLevel": "e.g. Certificate, Associate, Bachelor's, Master's, Doctorate",
      "modality": "Online, In-person, or Hybrid",
      "location": "city/region or 'Online'",
      "estimatedCost": "a realistic cost range or note",
      "duration": "typical time to complete",
      "whyFit": "1-2 sentences on why this fits the learner's goal and preferences",
      "highlights": ["notable strength", "notable strength"]
    }
  ],
  "skillGaps": ["a skill or prerequisite the learner should build for this career"],
  "nextSteps": ["a concrete next action toward enrolling or preparing"]
}
Include 4-6 recommendations, 3-5 skillGaps, and 3-5 nextSteps.`;

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
    recommendations?: Array<Record<string, unknown>>;
    skillGaps?: string[];
    nextSteps?: string[];
  };

  const str = (v: unknown): string => (typeof v === "string" ? v : "");
  const recommendations: SchoolRecommendation[] = (
    Array.isArray(parsed.recommendations) ? parsed.recommendations : []
  )
    .filter((r) => r && typeof r === "object")
    .map((r) => ({
      schoolName: str(r["schoolName"]).trim() || "School",
      programName: str(r["programName"]).trim() || "Program",
      degreeLevel: str(r["degreeLevel"]).trim() || "Program",
      modality: str(r["modality"]).trim() || "Not specified",
      location: str(r["location"]).trim(),
      estimatedCost: str(r["estimatedCost"]).trim(),
      duration: str(r["duration"]).trim(),
      whyFit: str(r["whyFit"]).trim(),
      highlights: (Array.isArray(r["highlights"]) ? r["highlights"] : [])
        .filter((h): h is string => typeof h === "string")
        .map((h) => h),
    }));

  const strArray = (v: unknown): string[] =>
    (Array.isArray(v) ? v : [])
      .filter((k): k is string => typeof k === "string")
      .map((k) => k);

  return {
    title:
      typeof parsed.title === "string" && parsed.title.trim().length > 0
        ? parsed.title.trim()
        : `Career plan: ${careerGoal}`,
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    recommendations,
    skillGaps: strArray(parsed.skillGaps),
    nextSteps: strArray(parsed.nextSteps),
  };
}

export async function generateExplanation(params: {
  prompt: string;
  options: string[];
  correctIndex: number;
  selectedIndex: number;
  subject?: string | null;
}): Promise<{ steps: string[]; example: string; tip: string }> {
  const { prompt, options, correctIndex, selectedIndex, subject } = params;
  const label = (i: number) => String.fromCharCode(65 + i);
  const optionLines = options
    .map((o, i) => `${label(i)}) ${o}`)
    .join("\n");

  const system =
    "You are a patient, expert tutor helping a student understand why they got a question wrong. " +
    "Give a clear, friendly, step-by-step breakdown of the correct answer with a worked example. " +
    "Do not use emojis. Return ONLY valid JSON, no prose, no markdown fences.";

  const user = `The student answered a multiple-choice question incorrectly.

Subject: ${subject ?? "General"}
Question: ${prompt}
Options:
${optionLines}
Correct answer: ${label(correctIndex)}) ${options[correctIndex]}
Student chose: ${label(selectedIndex)}) ${options[selectedIndex]}

Return JSON:
{
  "steps": [
    "Step 1: ...",
    "Step 2: ..."
  ],
  "example": "A fully worked similar example with concrete numbers or details the student can follow",
  "tip": "A short memorable rule, trick, or pattern to remember this concept"
}

Steps should number 3–5. Speak directly to the student. For math, show the arithmetic explicitly.`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_completion_tokens: 2048,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "";
  const parsed = extractJson(content) as {
    steps?: unknown;
    example?: unknown;
    tip?: unknown;
  };

  const strArray = (v: unknown): string[] =>
    (Array.isArray(v) ? v : []).filter((s): s is string => typeof s === "string");

  return {
    steps: strArray(parsed.steps),
    example: typeof parsed.example === "string" ? parsed.example : "",
    tip: typeof parsed.tip === "string" ? parsed.tip : "",
  };
}

export type CurriculumMaterial = {
  type: string;
  name: string;
  author: string;
  description: string;
  whereToFind: string;
};

export type CurriculumModule = {
  title: string;
  objective: string;
  materials: CurriculumMaterial[];
};

export type CurriculumArgs = {
  subject: string;
  level: string;
  focusAreas?: string[];
};

export type GeneratedCurriculum = {
  title: string;
  summary: string;
  modules: CurriculumModule[];
  nextSteps: string[];
};

export async function generateCurriculum(
  args: CurriculumArgs,
): Promise<GeneratedCurriculum> {
  const { subject, level, focusAreas } = args;
  const focus = (focusAreas ?? [])
    .map((f) => f.trim().slice(0, 300))
    .filter((f) => f.length > 0)
    .slice(0, 12);

  const system =
    "You are an expert curriculum designer and tutor. You build practical, sequenced learning plans using the best real-world learning materials. " +
    "Recommend specific, well-known, real resources across a mix of types (Book, Video, Course, Worksheet, Tool, Article, Practice). " +
    "Prefer widely available, reputable resources and name the author/creator/provider and where to find it (e.g. publisher, platform, library, or website name). " +
    "Do not invent fake titles or URLs; if unsure of an exact link, describe where to find it instead. " +
    "Do not use emojis. Return ONLY valid JSON, no prose, no markdown fences.";

  const user = `Design a learning curriculum for the subject "${subject}".
The learner's current assessed level is: ${level}.
Tailor the difficulty and starting point to a ${level} learner.
${focus.length > 0 ? `Give extra attention to these areas the learner struggled with or wants to strengthen:\n${focus.map((f) => `- ${f}`).join("\n")}` : ""}

Organize the plan as an ordered set of modules, from foundational to advanced. Each module groups the best materials to learn that part.

Return JSON with this exact shape:
{
  "title": "a short, motivating title for this curriculum",
  "summary": "a 2-3 sentence overview of the plan and how it fits a ${level} learner",
  "modules": [
    {
      "title": "module title",
      "objective": "what the learner will be able to do after this module",
      "materials": [
        {
          "type": "Book | Video | Course | Worksheet | Tool | Article | Practice",
          "name": "the exact title/name of the resource",
          "author": "author, creator, channel, or provider",
          "description": "1-2 sentences on what it is and why it helps here",
          "whereToFind": "where to access it, e.g. publisher, platform (YouTube, Coursera, Khan Academy), website, or library"
        }
      ]
    }
  ],
  "nextSteps": ["a concrete action the learner should take to start"]
}
Include 4-6 modules. Each module should have 2-4 materials with a mix of types across the whole plan. Include 3-5 nextSteps.`;

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
    modules?: Array<{
      title?: unknown;
      objective?: unknown;
      materials?: Array<Record<string, unknown>>;
    }>;
    nextSteps?: unknown;
  };

  const str = (v: unknown): string => (typeof v === "string" ? v : "");

  const modules: CurriculumModule[] = (
    Array.isArray(parsed.modules) ? parsed.modules : []
  )
    .filter((m) => m && typeof m === "object")
    .map((m) => ({
      title: str(m.title).trim() || "Module",
      objective: str(m.objective).trim(),
      materials: (Array.isArray(m.materials) ? m.materials : [])
        .filter((mat) => mat && typeof mat === "object")
        .map((mat) => ({
          type: str(mat["type"]).trim() || "Resource",
          name: str(mat["name"]).trim() || "Resource",
          author: str(mat["author"]).trim(),
          description: str(mat["description"]).trim(),
          whereToFind: str(mat["whereToFind"]).trim(),
        }))
        .filter((mat) => mat.name.length > 0),
    }))
    .filter((m) => m.materials.length > 0);

  const nextSteps = (Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [])
    .filter((s): s is string => typeof s === "string")
    .map((s) => s);

  return {
    title:
      typeof parsed.title === "string" && parsed.title.trim().length > 0
        ? parsed.title.trim()
        : `${subject} learning plan`,
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    modules,
    nextSteps,
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
