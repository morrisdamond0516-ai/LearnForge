import { CAREER_OPTIONS } from "@/lib/careers";
import type { SkillGameType } from "./skill-game-types";

export type CareerSkillSlug =
  | "family-services"
  | "social-caseworker"
  | "cna"
  | "medical-assistant"
  | "patient-care-tech"
  | "pharmacy-tech"
  | "medical-billing-coding"
  | "phlebotomy-tech"
  | "dental-assistant"
  | "lpn-lvn"
  | "registered-nurse"
  | "surgical-tech"
  | "vet-tech"
  | "police-officer"
  | "firefighter-emt"
  | "postal-worker"
  | "office-assistant"
  | "bookkeeper"
  | "bank-teller"
  | "paralegal"
  | "human-resources"
  | "insurance-agent"
  | "electrician"
  | "plumber"
  | "welder"
  | "auto-mechanic"
  | "hvac-tech"
  | "cdl-driver"
  | "software-developer"
  | "data-analyst"
  | "information-technology"
  | "it-support"
  | "cybersecurity"
  | "cloud-computing"
  | "project-management"
  | "real-estate"
  | "cosmetology"
  | "teacher-cert"
  | "teaching-assistant"
  | "childcare-cda";

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
    skillTitle: "Family Services Lab Track",
    skillDescription: "Multi-lab path: safety assessment, service plan, and client intake — structured decision-making casework.",
    gameType: "intake-form-workspace",
    duration: "25–35 min",
  },
  {
    slug: "social-caseworker",
    careerName: "Social Services Caseworker",
    emoji: "📋",
    skillTitle: "Caseworker Lab Track",
    skillDescription: "Multi-lab path: resource referrals, SOAP case notes, and crisis intake — clinical documentation skills.",
    gameType: "intake-form-workspace",
    duration: "25–35 min",
  },
  {
    slug: "cna",
    careerName: "Certified Nursing Assistant (CNA)",
    emoji: "🩺",
    skillTitle: "CNA Lab Track",
    skillDescription:
      "Hands-on CNA labs: ADL intake, I/O charting, vital signs, and hygiene documentation — scenario drills folded into warm-up/recall.",
    gameType: "patient-chart-workspace",
    duration: "25–35 min",
  },
  {
    slug: "medical-assistant",
    careerName: "Medical Assistant",
    emoji: "🏥",
    skillTitle: "Medical Assistant Lab Track",
    skillDescription: "Multi-lab path: referral intake, med reconciliation, and pre-provider charting — clinic workflow skills.",
    gameType: "intake-form-workspace",
    duration: "25–35 min",
  },
  {
    slug: "patient-care-tech",
    careerName: "Patient Care Technician (PCT)",
    emoji: "🏥",
    skillTitle: "PCT Lab Track",
    skillDescription:
      "Multi-lab path: shift handoff, I&O charting, vitals intake, and escalation judgment — hospital floor skills.",
    gameType: "intake-form-workspace",
    duration: "30–40 min",
  },
  {
    slug: "pharmacy-tech",
    careerName: "Pharmacy Technician",
    emoji: "💊",
    skillTitle: "Pharmacy Tech Lab Track",
    skillDescription: "Multi-lab path: label verification, controlled substance counts, and dosage math — PTCB/ExCPT skills.",
    gameType: "intake-form-workspace",
    duration: "25–35 min",
  },
  {
    slug: "medical-billing-coding",
    careerName: "Medical Billing & Coding (CPC / CCS)",
    emoji: "🩻",
    skillTitle: "Billing & Coding Lab Track",
    skillDescription:
      "Multi-lab path: claim intake, ERA reconciliation, denial appeals, ICD-10/CPT judgment — AAPC/AHIMA entry skills with warm-up/recall drills.",
    gameType: "intake-form-workspace",
    duration: "40–55 min",
  },
  {
    slug: "phlebotomy-tech",
    careerName: "Phlebotomy Technician (CPT / NHA)",
    emoji: "🩸",
    skillTitle: "Phlebotomy Lab Track",
    skillDescription:
      "Multi-lab path: specimen labeling, difficult draw documentation, lab orders, and safety judgment.",
    gameType: "intake-form-workspace",
    duration: "28–40 min",
  },
  {
    slug: "dental-assistant",
    careerName: "Dental Assistant (RDA / CDA)",
    emoji: "🦷",
    skillTitle: "Dental Assistant Lab Track",
    skillDescription:
      "Multi-lab path: treatment charting, tray setup, patient intake, and infection control.",
    gameType: "intake-form-workspace",
    duration: "28–40 min",
  },
  {
    slug: "lpn-lvn",
    careerName: "Licensed Practical Nurse (LPN / LVN)",
    emoji: "💉",
    skillTitle: "LPN / LVN Lab Track",
    skillDescription:
      "Multi-lab path: wound assessment, MAR documentation, vitals charting, and scope/clinical judgment.",
    gameType: "patient-chart-workspace",
    duration: "30–42 min",
  },
  {
    slug: "registered-nurse",
    careerName: "Registered Nurse (NCLEX-RN)",
    emoji: "👩‍⚕️",
    skillTitle: "Registered Nurse Lab Track",
    skillDescription:
      "Multi-lab path: MAR intake, post-op charting, admission assessment, dosage math, and NCLEX priority judgment — drills in warm-up/recall.",
    gameType: "intake-form-workspace",
    duration: "45–60 min",
  },
  {
    slug: "surgical-tech",
    careerName: "Surgical Technologist (CST)",
    emoji: "🩺",
    skillTitle: "Surgical Tech Lab Track",
    skillDescription:
      "Hands-on OR labs: tray prep, sterile bench, and count logging — judgment drills merged into warm-up/recall.",
    gameType: "intake-form-workspace",
    duration: "28–38 min",
  },
  {
    slug: "vet-tech",
    careerName: "Veterinary Technician",
    emoji: "🐾",
    skillTitle: "Vet Tech Lab Track",
    skillDescription:
      "Multi-lab path: triage vitals, patient intake, dosage math, and safety/restraint judgment.",
    gameType: "patient-chart-workspace",
    duration: "28–38 min",
  },
  {
    slug: "police-officer",
    careerName: "Police Officer",
    emoji: "🚔",
    skillTitle: "Law Enforcement Lab Track",
    skillDescription: "Multi-lab path: evidence logging, use-of-force documentation, and incident reports.",
    gameType: "intake-form-workspace",
    duration: "25–35 min",
  },
  {
    slug: "firefighter-emt",
    careerName: "Firefighter / EMT",
    emoji: "🚒",
    skillTitle: "Fire/EMS Lab Track",
    skillDescription: "Multi-lab path: patient care reports, apparatus check-offs, and field dose math.",
    gameType: "intake-form-workspace",
    duration: "25–35 min",
  },
  {
    slug: "postal-worker",
    careerName: "Postal Worker",
    emoji: "📬",
    skillTitle: "Postal Clerk Lab Track",
    skillDescription:
      "Multi-lab path: window transactions, carrier route prep, and parcel manifest intake.",
    gameType: "intake-form-workspace",
    duration: "22–32 min",
  },
  {
    slug: "office-assistant",
    careerName: "Administrative / Office Assistant",
    emoji: "⌨️",
    skillTitle: "Office Admin Lab Track",
    skillDescription:
      "Multi-lab path: visitor intake, schedule budget sheet, business typing, and AI tools at the front desk.",
    gameType: "intake-form-workspace",
    duration: "25–35 min",
  },
  {
    slug: "bookkeeper",
    careerName: "Bookkeeper / Accounting Clerk",
    emoji: "🧮",
    skillTitle: "Bookkeeping Lab Track",
    skillDescription:
      "Multi-lab path: expense ledger, bank reconciliation, debit/credit controls, and AI automation judgment.",
    gameType: "spreadsheet-workspace",
    duration: "30–40 min",
  },
  {
    slug: "bank-teller",
    careerName: "Bank Teller",
    emoji: "🏦",
    skillTitle: "Bank Teller Lab Track",
    skillDescription: "Multi-lab path: CTR compliance, end-of-day balancing, and drawer reconciliation.",
    gameType: "intake-form-workspace",
    duration: "28–38 min",
  },
  {
    slug: "paralegal",
    careerName: "Paralegal / Legal Assistant",
    emoji: "⚖️",
    skillTitle: "Paralegal Lab Track",
    skillDescription:
      "Multi-lab path: each module is warm-up → hands-on workspace → recall check (client intake, privilege log, billing, production).",
    gameType: "intake-form-workspace",
    duration: "40–60 min",
  },
  {
    slug: "human-resources",
    careerName: "Human Resources (SHRM-CP / PHR)",
    emoji: "👥",
    skillTitle: "Human Resources Lab Track",
    skillDescription:
      "Multi-lab path: leave intake, ER complaint logging, onboarding, and compliance judgment.",
    gameType: "intake-form-workspace",
    duration: "28–38 min",
  },
  {
    slug: "insurance-agent",
    careerName: "Insurance Agent",
    emoji: "📋",
    skillTitle: "Insurance Producer Lab Track",
    skillDescription:
      "Multi-lab path: FNOL intake, premium comparison sheet, policy applications, and producer ethics.",
    gameType: "intake-form-workspace",
    duration: "32–45 min",
  },
  {
    slug: "electrician",
    careerName: "Electrician (Apprentice / Journeyman)",
    emoji: "⚡",
    skillTitle: "Electrician Lab Track",
    skillDescription: "Multi-lab path: panel schedule intake, service call work orders, and jobsite math.",
    gameType: "intake-form-workspace",
    duration: "25–35 min",
  },
  {
    slug: "plumber",
    careerName: "Plumber (Apprentice / Journeyman)",
    emoji: "🔧",
    skillTitle: "Plumber Lab Track",
    skillDescription:
      "Multi-lab path: service call work orders, permit applications, pipe math, and safety judgment.",
    gameType: "intake-form-workspace",
    duration: "28–40 min",
  },
  {
    slug: "welder",
    careerName: "Welder (Certified Welder)",
    emoji: "🔥",
    skillTitle: "Welder Lab Track",
    skillDescription:
      "Multi-lab path: WPS setup, visual inspection reports, material math, and quality judgment.",
    gameType: "intake-form-workspace",
    duration: "28–40 min",
  },
  {
    slug: "auto-mechanic",
    careerName: "Auto Mechanic (ASE)",
    emoji: "🚗",
    skillTitle: "Auto Mechanic Lab Track",
    skillDescription:
      "Hands-on shop labs: repair order intake, fluid inspection, and brake math — safety drills in warm-up/recall.",
    gameType: "intake-form-workspace",
    duration: "28–38 min",
  },
  {
    slug: "hvac-tech",
    careerName: "HVAC Technician",
    emoji: "❄️",
    skillTitle: "HVAC Lab Track",
    skillDescription: "Multi-lab path: service call work orders, EPA refrigerant logs, and cooling load math.",
    gameType: "intake-form-workspace",
    duration: "25–35 min",
  },
  {
    slug: "cdl-driver",
    careerName: "Commercial Driver (CDL)",
    emoji: "🚛",
    skillTitle: "CDL Lab Track",
    skillDescription: "Multi-lab path: DVIR pre-trip forms, HOS log entries, and weight/bridge math.",
    gameType: "intake-form-workspace",
    duration: "25–35 min",
  },
  {
    slug: "software-developer",
    careerName: "Software Developer / Coding",
    emoji: "👨‍💻",
    skillTitle: "Software Developer Lab Track",
    skillDescription:
      "Hands-on dev labs: ticket intake, CI terminal, Git/debug workspaces — code review drills merged into warm-up/recall.",
    gameType: "intake-form-workspace",
    duration: "50–70 min",
  },
  {
    slug: "data-analyst",
    careerName: "Data Analyst",
    emoji: "📊",
    skillTitle: "Analytics Lab Track",
    skillDescription:
      "Multi-lab path: stakeholder intake, cohort retention sheets, sales formulas, and data-quality work — junior analyst daily tasks.",
    gameType: "spreadsheet-workspace",
    duration: "40–55 min",
  },
  {
    slug: "information-technology",
    careerName: "Information Technology",
    emoji: "🖥️",
    skillTitle: "IT Professional Lab Track",
    skillDescription:
      "Full multi-lab path: network triage, DNS, identity, hardware build, security choices, subnet math, and incident process.",
    gameType: "terminal-workspace",
    duration: "45–70 min",
  },
  {
    slug: "it-support",
    careerName: "IT Support / CompTIA A+",
    emoji: "💻",
    skillTitle: "Help Desk Lab Track (A+ aligned)",
    skillDescription:
      "Multi-lab path: ticket queue, asset/security intake, CLI triage, and printer terminals — TestOut-style hands-on practice.",
    gameType: "intake-form-workspace",
    duration: "55–80 min",
  },
  {
    slug: "cybersecurity",
    careerName: "Cybersecurity Analyst (Security+)",
    emoji: "🛡️",
    skillTitle: "Cybersecurity Lab Track",
    skillDescription:
      "Multi-lab path: incident reports, vulnerability triage, log triage terminal, and AI threat judgment.",
    gameType: "intake-form-workspace",
    duration: "35–50 min",
  },
  {
    slug: "cloud-computing",
    careerName: "Cloud Computing (AWS / Azure)",
    emoji: "☁️",
    skillTitle: "Cloud Practitioner Lab Track",
    skillDescription:
      "Hands-on cloud labs: IAM CLI audit and incident intake — concept drills merged into warm-up/recall.",
    gameType: "terminal-workspace",
    duration: "25–40 min",
  },
  {
    slug: "project-management",
    careerName: "Project Management (PMP / CAPM)",
    emoji: "📊",
    skillTitle: "PM Lab Track",
    skillDescription: "Multi-lab path: risk register, status reports, and sprint budget sheets.",
    gameType: "intake-form-workspace",
    duration: "28–38 min",
  },
  {
    slug: "real-estate",
    careerName: "Real Estate Agent",
    emoji: "🏠",
    skillTitle: "Real Estate Lab Track",
    skillDescription: "Multi-lab path: closing cost estimates, open house checklists, and listing intake.",
    gameType: "intake-form-workspace",
    duration: "25–35 min",
  },
  {
    slug: "cosmetology",
    careerName: "Cosmetology License",
    emoji: "💇",
    skillTitle: "Cosmetology Lab Track",
    skillDescription: "Multi-lab path: client consultation, chemical service records, and sanitation bench.",
    gameType: "intake-form-workspace",
    duration: "25–35 min",
  },
  {
    slug: "teacher-cert",
    careerName: "Teacher Certification (Praxis)",
    emoji: "📚",
    skillTitle: "Teacher Lab Track",
    skillDescription:
      "Multi-lab path: gradebook entry, sub plans, lesson plan intake, and AI classroom policy.",
    gameType: "intake-form-workspace",
    duration: "28–40 min",
  },
  {
    slug: "teaching-assistant",
    careerName: "Teaching Assistant / Paraprofessional",
    emoji: "📒",
    skillTitle: "Teaching Assistant Lab Track",
    skillDescription:
      "Multi-lab path: attendance logs, IEP accommodation checks, behavior documentation, and classroom support.",
    gameType: "intake-form-workspace",
    duration: "28–38 min",
  },
  {
    slug: "childcare-cda",
    careerName: "Childcare Provider (CDA)",
    emoji: "🧒",
    skillTitle: "Childcare / CDA Lab Track",
    skillDescription:
      "Multi-lab path: incident reports, health screens, enrollment intake, and mandated reporting judgment.",
    gameType: "intake-form-workspace",
    duration: "28–38 min",
  },
];

export function getCareerSkillBySlug(slug: string): CareerSkillEntry | undefined {
  return CAREER_SKILL_GAMES.find((g) => g.slug === slug);
}

/** Match a curriculum subject name to a Career Skills Lab entry. */
export function getCareerSkillByCareerName(
  name: string,
): CareerSkillEntry | undefined {
  const needle = name.trim().toLowerCase();
  if (!needle) return undefined;
  return CAREER_SKILL_GAMES.find((g) => {
    const career = g.careerName.toLowerCase();
    return (
      career === needle ||
      career.includes(needle) ||
      needle.includes(career) ||
      (needle.includes("data analyst") && g.slug === "data-analyst") ||
      ((needle.includes("medical billing") ||
        needle.includes("medical coder") ||
        needle.includes("medical coding") ||
        needle.includes("billing and coding") ||
        needle.includes("billing & coding") ||
        needle.includes("health information")) &&
        g.slug === "medical-billing-coding") ||
      (needle.includes("phlebotom") && g.slug === "phlebotomy-tech") ||
      ((needle.includes("dental assist") || needle.includes("rda") || (needle.includes("cda") && needle.includes("dental"))) &&
        g.slug === "dental-assistant") ||
      ((needle.includes("patient care tech") || needle.includes("pct")) &&
        g.slug === "patient-care-tech") ||
      ((needle.includes("surgical tech") || needle.includes("cst") || needle.includes("surgical technologist")) &&
        g.slug === "surgical-tech") ||
      ((needle.includes("vet tech") || needle.includes("veterinary")) &&
        g.slug === "vet-tech") ||
      ((needle.includes("lpn") || needle.includes("lvn") || needle.includes("practical nurse")) &&
        g.slug === "lpn-lvn") ||
      ((needle.includes("registered nurse") ||
        needle.includes("nclex") ||
        needle === "rn") &&
        g.slug === "registered-nurse") ||
      ((needle.includes("cyber") || needle.includes("security+") || needle.includes("security +")) &&
        g.slug === "cybersecurity") ||
      ((needle.includes("cloud") ||
        needle.includes("aws") ||
        needle.includes("azure") ||
        needle.includes("cloud practitioner")) &&
        g.slug === "cloud-computing") ||
      ((needle.includes("plumb") && !needle.includes("template")) &&
        g.slug === "plumber") ||
      (needle.includes("weld") && g.slug === "welder") ||
      ((needle.includes("auto mechanic") || needle.includes("ase") || needle.includes("automotive")) &&
        g.slug === "auto-mechanic") ||
      ((needle.includes("paralegal") || needle.includes("legal assistant")) &&
        g.slug === "paralegal") ||
      ((needle.includes("human resource") || needle.includes("shrm") || needle.includes("phr") || needle === "hr") &&
        g.slug === "human-resources") ||
      ((needle.includes("insurance agent") || needle.includes("insurance producer")) &&
        g.slug === "insurance-agent") ||
      ((needle.includes("teaching assistant") || needle.includes("paraprofessional") || needle.includes("paraeducator")) &&
        g.slug === "teaching-assistant") ||
      ((needle.includes("childcare") || needle.includes("early childhood") || (needle.includes("cda") && !needle.includes("dental"))) &&
        g.slug === "childcare-cda") ||
      (needle.includes("information technology") &&
        g.slug === "information-technology") ||
      ((needle === "it" || needle.includes("it support")) &&
        g.slug === "it-support") ||
      ((needle.includes("software") ||
        needle.includes("programming") ||
        needle.includes("developer") ||
        needle.includes("web develop") ||
        (needle.includes("coding") && !needle.includes("medical"))) &&
        g.slug === "software-developer")
    );
  });
}

export function careerSkillGameId(slug: CareerSkillSlug): string {
  return `career-skill-${slug}`;
}
