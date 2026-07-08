import { CAREER_OPTIONS } from "@/lib/careers";

export type CareerSkillSlug =
  | "family-services"
  | "social-caseworker"
  | "cna"
  | "medical-assistant"
  | "pharmacy-tech"
  | "police-officer"
  | "firefighter-emt"
  | "postal-worker"
  | "office-assistant"
  | "bookkeeper"
  | "bank-teller"
  | "electrician"
  | "hvac-tech"
  | "cdl-driver"
  | "it-support"
  | "project-management"
  | "real-estate"
  | "cosmetology"
  | "teacher-cert";

export type SkillGameType =
  | "code-trace"
  | "typing-drill"
  | "sequence-build"
  | "match-pairs"
  | "math-scenario"
  | "script-choice";

export type CareerSkillEntry = {
  slug: CareerSkillSlug;
  careerName: (typeof CAREER_OPTIONS)[number];
  emoji: string;
  skillTitle: string;
  skillDescription: string;
  gameType: SkillGameType;
  duration: string;
};

/** Maps each LearnForge career to a hands-on skill mini-game. */
export const CAREER_SKILL_GAMES: CareerSkillEntry[] = [
  {
    slug: "family-services",
    careerName: "Family Services Specialist 1 (Nevada State)",
    emoji: "🤝",
    skillTitle: "Client Intake Challenge",
    skillDescription: "Choose professional responses in family support scenarios.",
    gameType: "script-choice",
    duration: "5–8 min",
  },
  {
    slug: "social-caseworker",
    careerName: "Social Services Caseworker",
    emoji: "📋",
    skillTitle: "Case Notes Simulator",
    skillDescription: "Practice ethical decisions when supporting clients in crisis.",
    gameType: "script-choice",
    duration: "5–8 min",
  },
  {
    slug: "cna",
    careerName: "Certified Nursing Assistant (CNA)",
    emoji: "🩺",
    skillTitle: "Vital Signs Match",
    skillDescription: "Match normal vital sign ranges and basic patient-care terms.",
    gameType: "match-pairs",
    duration: "4–6 min",
  },
  {
    slug: "medical-assistant",
    careerName: "Medical Assistant",
    emoji: "🏥",
    skillTitle: "Exam Room Prep",
    skillDescription: "Put clinical prep steps in the correct order before the provider enters.",
    gameType: "sequence-build",
    duration: "4–6 min",
  },
  {
    slug: "pharmacy-tech",
    careerName: "Pharmacy Technician",
    emoji: "💊",
    skillTitle: "Dosage Calc Lab",
    skillDescription: "Solve real pharmacy math — tablets, mL, and label reading.",
    gameType: "math-scenario",
    duration: "5–8 min",
  },
  {
    slug: "police-officer",
    careerName: "Police Officer",
    emoji: "🚔",
    skillTitle: "Call Response Trainer",
    skillDescription: "Pick safe, lawful responses during traffic stops and public calls.",
    gameType: "script-choice",
    duration: "5–8 min",
  },
  {
    slug: "firefighter-emt",
    careerName: "Firefighter / EMT",
    emoji: "🚒",
    skillTitle: "Emergency Steps",
    skillDescription: "Order first-response steps for fire scenes and medical emergencies.",
    gameType: "sequence-build",
    duration: "5–8 min",
  },
  {
    slug: "postal-worker",
    careerName: "Postal Worker",
    emoji: "📬",
    skillTitle: "Mail Sort Typing",
    skillDescription: "Type addresses and ZIP codes quickly and accurately — core postal skill.",
    gameType: "typing-drill",
    duration: "3–5 min",
  },
  {
    slug: "office-assistant",
    careerName: "Administrative / Office Assistant",
    emoji: "⌨️",
    skillTitle: "Office Typing Sprint",
    skillDescription: "Type business letters, emails, and scheduling notes at office speed.",
    gameType: "typing-drill",
    duration: "3–5 min",
  },
  {
    slug: "bookkeeper",
    careerName: "Bookkeeper / Accounting Clerk",
    emoji: "🧮",
    skillTitle: "Ledger Math",
    skillDescription: "Balance accounts, calculate totals, and spot bookkeeping errors.",
    gameType: "math-scenario",
    duration: "5–8 min",
  },
  {
    slug: "bank-teller",
    careerName: "Bank Teller",
    emoji: "🏦",
    skillTitle: "Teller Drawer Math",
    skillDescription: "Make change, count deposits, and catch transaction mistakes.",
    gameType: "math-scenario",
    duration: "5–8 min",
  },
  {
    slug: "electrician",
    careerName: "Electrician (Apprentice / Journeyman)",
    emoji: "⚡",
    skillTitle: "Wire & Tool Match",
    skillDescription: "Match wire colors, tools, and safety terms every apprentice must know.",
    gameType: "match-pairs",
    duration: "4–6 min",
  },
  {
    slug: "hvac-tech",
    careerName: "HVAC Technician",
    emoji: "❄️",
    skillTitle: "HVAC Service Order",
    skillDescription: "Sequence a safe HVAC service call from arrival to sign-off.",
    gameType: "sequence-build",
    duration: "5–8 min",
  },
  {
    slug: "cdl-driver",
    careerName: "Commercial Driver (CDL)",
    emoji: "🚛",
    skillTitle: "Pre-Trip Inspection",
    skillDescription: "Order the steps drivers perform before every legal pre-trip inspection.",
    gameType: "sequence-build",
    duration: "5–8 min",
  },
  {
    slug: "it-support",
    careerName: "IT Support / CompTIA A+",
    emoji: "💻",
    skillTitle: "Code & PC Build Lab",
    skillDescription: "Fix simple scripts and assemble a desktop in the right order — A+ basics.",
    gameType: "code-trace",
    duration: "8–12 min",
  },
  {
    slug: "project-management",
    careerName: "Project Management (PMP / CAPM)",
    emoji: "📊",
    skillTitle: "Project Lifecycle",
    skillDescription: "Order planning, execution, and closing steps like a certified PM.",
    gameType: "sequence-build",
    duration: "5–8 min",
  },
  {
    slug: "real-estate",
    careerName: "Real Estate Agent",
    emoji: "🏠",
    skillTitle: "Showing Script Studio",
    skillDescription: "Choose professional responses during buyer showings and negotiations.",
    gameType: "script-choice",
    duration: "5–8 min",
  },
  {
    slug: "cosmetology",
    careerName: "Cosmetology License",
    emoji: "💇",
    skillTitle: "Sanitation Sequence",
    skillDescription: "Order salon sanitation steps required for licensure and client safety.",
    gameType: "sequence-build",
    duration: "4–6 min",
  },
  {
    slug: "teacher-cert",
    careerName: "Teacher Certification (Praxis)",
    emoji: "📚",
    skillTitle: "Lesson Plan Builder",
    skillDescription: "Sequence effective lesson planning steps and classroom management choices.",
    gameType: "sequence-build",
    duration: "5–8 min",
  },
];

export function getCareerSkillBySlug(slug: string): CareerSkillEntry | undefined {
  return CAREER_SKILL_GAMES.find((g) => g.slug === slug);
}

export function careerSkillGameId(slug: CareerSkillSlug): string {
  return `career-skill-${slug}`;
}
