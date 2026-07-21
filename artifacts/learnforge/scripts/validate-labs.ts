import { CAREER_SKILL_GAMES } from "../src/lib/educational-games/career-skills-catalog.ts";
import { CAREER_SKILL_CONTENT } from "../src/lib/educational-games/career-skills-content.ts";
import { mergeCareerSkillContent } from "../src/lib/educational-games/career-workspace-content.ts";
import {
  getCareerLabTrack,
  CAREER_LAB_TRACKS,
} from "../src/lib/educational-games/career-lab-tracks.ts";
import { EDUCATION_LEVEL_GAMES } from "../src/lib/educational-games/education-levels-catalog.ts";
import { EDUCATION_LEVEL_CONTENT } from "../src/lib/educational-games/education-levels-content.ts";
import { mergeEducationSkillContent } from "../src/lib/educational-games/education-workspace-content.ts";
import { SUBJECT_SIMULATIONS } from "../src/lib/educational-games/subject-sims-catalog.ts";
import { SUBJECT_SIM_CONTENT } from "../src/lib/educational-games/subject-sims-content.ts";
import { BUILT_IN_GAMES } from "../src/lib/educational-games/catalog.ts";
import {
  resolveCurriculumSim,
  resolveCurriculumLabTrack,
} from "../src/lib/educational-games/curriculum-sim-link.ts";
import type { SkillGameContent, SkillGameType } from "../src/lib/educational-games/skill-game-types.ts";

const CONTENT_KEY: Record<SkillGameType, keyof SkillGameContent> = {
  "script-choice": "script",
  "math-scenario": "math",
  "match-pairs": "pairs",
  "sequence-build": "sequence",
  "typing-drill": "typing",
  "code-trace": "code",
  "spreadsheet-workspace": "spreadsheet",
  "terminal-workspace": "terminal",
  "patient-chart-workspace": "patientChart",
  "jobsite-workspace": "jobsite",
  "sim-canvas-workspace": "simCanvas",
  "lab-bench-workspace": "labBench",
  "manipulative-board": "manipulative",
  "intake-form-workspace": "intakeForm",
  "helpdesk-ticket-queue": "helpdeskQueue",
};

const problems: string[] = [];

function checkContent(
  label: string,
  gameType: SkillGameType,
  content: SkillGameContent | undefined,
) {
  const key = CONTENT_KEY[gameType];
  if (!key) {
    problems.push(`${label}: unknown gameType ${gameType}`);
    return;
  }
  if (!content || !(content as Record<string, unknown>)[key as string]) {
    problems.push(`${label}: missing content.${String(key)} for ${gameType}`);
    return;
  }
  const payload = (content as Record<string, unknown>)[key as string] as
    | unknown[]
    | { tickets?: unknown[]; steps?: unknown[] };
  if (Array.isArray(payload) && payload.length === 0) {
    problems.push(`${label}: empty ${String(key)}`);
  }
  if (
    gameType === "helpdesk-ticket-queue" &&
    (!("tickets" in payload) || !payload.tickets?.length)
  ) {
    problems.push(`${label}: empty helpdesk tickets`);
  }
  if (
    gameType === "terminal-workspace" &&
    (!("steps" in payload) || !payload.steps?.length)
  ) {
    problems.push(`${label}: empty terminal steps`);
  }
}

for (const c of CAREER_SKILL_GAMES) {
  const base = CAREER_SKILL_CONTENT[c.slug];
  if (!base) problems.push(`career ${c.slug}: missing CAREER_SKILL_CONTENT`);
  else
    checkContent(
      `career ${c.slug}`,
      c.gameType,
      mergeCareerSkillContent(c.slug, base),
    );
  const track = getCareerLabTrack(c.slug);
  if (track) {
    for (const m of track) {
      checkContent(`track ${c.slug}/${m.id}`, m.gameType, m.content);
    }
  }
}

for (const e of EDUCATION_LEVEL_GAMES) {
  const base = EDUCATION_LEVEL_CONTENT[e.slug];
  if (!base) problems.push(`edu ${e.slug}: missing content`);
  else
    checkContent(
      `edu ${e.slug}`,
      e.gameType,
      mergeEducationSkillContent(e.slug, base),
    );
}

for (const s of SUBJECT_SIMULATIONS) {
  const content = SUBJECT_SIM_CONTENT[s.slug];
  if (!content) problems.push(`subject ${s.slug}: missing content`);
  else checkContent(`subject ${s.slug}`, s.gameType, content);
}

const catalogIds = new Set(BUILT_IN_GAMES.map((g) => g.id));
for (const id of [
  "career-skills-lab",
  "education-skills-lab",
  "subject-simulations-lab",
] as const) {
  if (!catalogIds.has(id)) problems.push(`catalog missing ${id}`);
}

  const subjects = [
    "IT Support",
    "Information Technology",
    "Data Analyst",
    "Software Developer",
    "Medical Billing & Coding",
    "Phlebotomy Technician",
    "Surgical Technologist",
    "Patient Care Technician",
    "Paralegal",
    "Human Resources",
    "Bookkeeper",
  "Algebra",
  "Chemistry",
  "Physics",
  "Biology",
  "Grade 5",
  "Kindergarten",
];
for (const sub of subjects) {
  const sim = resolveCurriculumSim(sub);
  if (!sim) problems.push(`curriculum resolve miss: ${sub}`);
  const track = resolveCurriculumLabTrack(sub);
  if (
      [
        "IT Support",
        "Information Technology",
        "Data Analyst",
        "Software Developer",
        "Medical Billing & Coding",
        "Registered Nurse",
        "Cybersecurity Analyst",
        "Cloud Computing",
        "Phlebotomy Technician",
        "Surgical Technologist",
        "Patient Care Technician",
        "Paralegal",
        "Human Resources",
        "Insurance Agent",
        "Auto Mechanic",
        "Teaching Assistant",
        "Childcare Provider",
      ].includes(sub) &&
    track.length < 1
  ) {
    problems.push(`expected at least one hands-on lab for ${sub} got ${track.length}`);
  }
}

const report = {
  careers: CAREER_SKILL_GAMES.length,
  tracks: Object.keys(CAREER_LAB_TRACKS).length,
  edu: EDUCATION_LEVEL_GAMES.length,
  subjects: SUBJECT_SIMULATIONS.length,
  problems: problems.length,
  details: problems,
};
console.log(JSON.stringify(report, null, 2));
if (problems.length) process.exit(1);
