import { SCIENCE_TRIVIA, shuffle } from "./content";
import { LIGHTNING_QUESTIONS } from "./extended-content";

export type QuizPoolQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  subject: string;
  explanation: string;
};

const EXTRA_CAREER_QUESTIONS: QuizPoolQuestion[] = [
  {
    prompt: "Which Holland type fits hands-on work with tools?",
    options: ["Realistic", "Artistic", "Social", "Enterprising"],
    correctIndex: 0,
    subject: "Careers",
    explanation: "Realistic (R) careers involve building, fixing, and working outdoors.",
  },
  {
    prompt: "Before a job interview, you should…",
    options: [
      "Research the company and role",
      "Wing it with no preparation",
      "Arrive 30 minutes late",
      "Avoid asking any questions",
    ],
    correctIndex: 0,
    subject: "Careers",
    explanation: "Preparation shows professionalism and helps you answer confidently.",
  },
  {
    prompt: "A résumé should highlight…",
    options: [
      "Skills and relevant experience",
      "Every hobby since childhood",
      "Reasons you disliked past jobs",
      "Only your home address",
    ],
    correctIndex: 0,
    subject: "Careers",
    explanation: "Employers scan for skills and experience that match the job.",
  },
  {
    prompt: "OSHA rules exist mainly to…",
    options: [
      "Keep workers safe on the job",
      "Slow down production",
      "Replace all training",
      "Eliminate tools from worksites",
    ],
    correctIndex: 0,
    subject: "Careers",
    explanation: "Workplace safety standards protect employees from hazards.",
  },
  {
    prompt: "Trade school is best for someone who wants to…",
    options: [
      "Learn a skilled trade quickly and work hands-on",
      "Avoid learning any practical skills",
      "Skip all certifications forever",
      "Only study abstract theory",
    ],
    correctIndex: 0,
    subject: "Careers",
    explanation: "Trade programs focus on job-ready skills for fields like electrical, HVAC, and welding.",
  },
  {
    prompt: "Soft skills include…",
    options: [
      "Communication and teamwork",
      "Only typing speed",
      "Memorizing random facts",
      "Ignoring feedback",
    ],
    correctIndex: 0,
    subject: "Careers",
    explanation: "Employers value teamwork, communication, and adaptability across every field.",
  },
];

const GEO_QUESTIONS: QuizPoolQuestion[] = [
  {
    prompt: "Capital of Canada?",
    options: ["Toronto", "Ottawa", "Vancouver", "Montreal"],
    correctIndex: 1,
    subject: "Geography",
    explanation: "Ottawa is Canada's capital.",
  },
  {
    prompt: "Capital of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correctIndex: 2,
    subject: "Geography",
    explanation: "Canberra is the capital; Sydney and Melbourne are larger cities.",
  },
  {
    prompt: "Capital of Brazil?",
    options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"],
    correctIndex: 2,
    subject: "Geography",
    explanation: "Brasília has been the capital since 1960.",
  },
];

export function getMasterQuizPool(): QuizPoolQuestion[] {
  const fromLightning: QuizPoolQuestion[] = LIGHTNING_QUESTIONS.map((q) => ({
    ...q,
    explanation: `The answer is "${q.options[q.correctIndex]}".`,
  }));
  const fromScience: QuizPoolQuestion[] = SCIENCE_TRIVIA.map((q) => ({
    prompt: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    subject: "Science",
    explanation: q.fact,
  }));
  return [
    ...fromLightning,
    ...fromScience,
    ...GEO_QUESTIONS,
    ...EXTRA_CAREER_QUESTIONS,
  ];
}

export function pickQuizDeck(
  count: number,
  filter?: (q: QuizPoolQuestion) => boolean,
): QuizPoolQuestion[] {
  const pool = filter ? getMasterQuizPool().filter(filter) : getMasterQuizPool();
  return shuffle(pool).slice(0, count);
}

export function pickCareerDeck(count: number): QuizPoolQuestion[] {
  const career = getMasterQuizPool().filter((q) => q.subject === "Careers");
  return shuffle(career).slice(0, Math.min(count, career.length));
}
