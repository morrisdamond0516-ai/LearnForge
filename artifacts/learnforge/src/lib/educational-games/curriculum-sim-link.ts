import {
  getCareerSkillByCareerName,
  type CareerSkillEntry,
} from "./career-skills-catalog";
import {
  EDUCATION_LEVEL_GAMES,
  getEducationLevelBySlug,
  type EducationLevelEntry,
} from "./education-levels-catalog";
import {
  getSubjectSimBySlug,
  SUBJECT_SIMULATIONS,
  type SubjectSimEntry,
} from "./subject-sims-catalog";
import {
  getCareerLabTrack,
  type CareerLabModule,
} from "./career-lab-tracks";
import {
  SKILL_GAME_TYPE_LABELS,
  isWorkspaceLab,
  type SkillGameType,
} from "./skill-game-types";
import type { BuiltInGameId } from "./types";

/** Workspace engines that count as real hands-on labs (not quiz-style drills). */
const LAB_ENGINE_TYPES = new Set<SkillGameType>([
  "spreadsheet-workspace",
  "terminal-workspace",
  "patient-chart-workspace",
  "jobsite-workspace",
  "sim-canvas-workspace",
  "lab-bench-workspace",
  "manipulative-board",
  "intake-form-workspace",
  "helpdesk-ticket-queue",
]);

export type CurriculumSimLink = {
  href: string;
  emoji: string;
  title: string;
  description: string;
  formatLabel: string;
  gameType: SkillGameType;
  kind: "career" | "subject" | "school";
  cta: string;
  careerSlug?: string;
};

export type CurriculumTrackLabLink = {
  id: string;
  title: string;
  description: string;
  domain: string;
  duration: string;
  formatLabel: string;
  gameType: SkillGameType;
  isWorkspace: boolean;
  href: string;
};

function ctaFor(gameType: SkillGameType): string {
  if (gameType === "spreadsheet-workspace") return "Open spreadsheet lab";
  if (gameType === "terminal-workspace") return "Open terminal lab";
  if (gameType === "lab-bench-workspace") return "Open lab bench";
  if (gameType === "sim-canvas-workspace") return "Open simulation";
  if (gameType === "patient-chart-workspace") return "Open patient chart";
  if (gameType === "jobsite-workspace") return "Open jobsite lab";
  if (gameType === "intake-form-workspace") return "Open intake form";
  if (gameType === "manipulative-board") return "Open hands-on board";
  if (gameType === "helpdesk-ticket-queue") return "Open ticket queue";
  return "Open lab";
}

function careerModuleHref(slug: string, moduleId?: string, fromSubject?: string): string {
  const base = `/games?game=career-skills-lab&career=${encodeURIComponent(slug)}`;
  const withModule = moduleId ? `${base}&module=${encodeURIComponent(moduleId)}` : base;
  return fromSubject ? `${withModule}&from=${encodeURIComponent(fromSubject)}` : withModule;
}

function careerLink(entry: CareerSkillEntry): CurriculumSimLink | null {
  if (!LAB_ENGINE_TYPES.has(entry.gameType)) return null;
  return {
    kind: "career",
    href: careerModuleHref(entry.slug),
    emoji: entry.emoji,
    title: entry.skillTitle,
    description: entry.skillDescription,
    formatLabel: SKILL_GAME_TYPE_LABELS[entry.gameType],
    gameType: entry.gameType,
    cta: ctaFor(entry.gameType),
    careerSlug: entry.slug,
  };
}

/** Multi-lab careers always get a curriculum link even if the catalog primary type is a drill. */
function careerTrackLink(
  entry: CareerSkillEntry,
  firstLab: CareerLabModule,
): CurriculumSimLink {
  const gameType = LAB_ENGINE_TYPES.has(entry.gameType)
    ? entry.gameType
    : firstLab.gameType;
  return {
    kind: "career",
    href: careerModuleHref(entry.slug),
    emoji: entry.emoji,
    title: entry.skillTitle,
    description: entry.skillDescription,
    formatLabel: SKILL_GAME_TYPE_LABELS[gameType],
    gameType,
    cta: ctaFor(gameType),
    careerSlug: entry.slug,
  };
}

function subjectLink(entry: SubjectSimEntry): CurriculumSimLink {
  return {
    kind: "subject",
    href: `/games?game=subject-simulations-lab&subject=${encodeURIComponent(entry.slug)}`,
    emoji: entry.emoji,
    title: entry.title,
    description: entry.description,
    formatLabel: SKILL_GAME_TYPE_LABELS[entry.gameType],
    gameType: entry.gameType,
    cta: ctaFor(entry.gameType),
  };
}

function schoolLink(entry: EducationLevelEntry): CurriculumSimLink | null {
  if (!LAB_ENGINE_TYPES.has(entry.gameType)) return null;
  return {
    kind: "school",
    href: `/games?game=education-skills-lab&level=${encodeURIComponent(entry.slug)}`,
    emoji: entry.emoji,
    title: entry.skillTitle,
    description: entry.skillDescription,
    formatLabel: SKILL_GAME_TYPE_LABELS[entry.gameType],
    gameType: entry.gameType,
    cta: ctaFor(entry.gameType),
  };
}

/** Map curriculum subject strings → math/science (and related) sims. */
function resolveSubjectSim(subject: string): SubjectSimEntry | undefined {
  const s = subject.trim().toLowerCase();
  if (!s) return undefined;

  const aliases: Array<{ match: RegExp; slug: string }> = [
    { match: /\bphysics\b|projectile|mechanics/, slug: "physics-projectile" },
    { match: /\baerospace\b|astronaut|orbit|rocket/, slug: "aerospace-orbit" },
    { match: /\bbiolog|anatomy|cell\b|life science/, slug: "biology-microscopy" },
    { match: /\bchemistr|titration|stoichiometr/, slug: "chemistry-titration" },
    {
      match:
        /\balgebra\b|\bmath(?:ematics)?\b|geometry|pre-?calc|calculus|trigonometry|functions?/,
      slug: "algebra-graphing",
    },
    {
      match: /\bearth science\b|climate|geology|meteorology|environmental/,
      slug: "earth-science-climate",
    },
  ];

  for (const { match, slug } of aliases) {
    if (match.test(s)) {
      const hit = getSubjectSimBySlug(slug);
      if (hit) return hit;
    }
  }

  return SUBJECT_SIMULATIONS.find((e) => e.subject.toLowerCase() === s);
}

function resolveSchoolLevel(subject: string): EducationLevelEntry | undefined {
  const s = subject.trim().toLowerCase();
  if (!s) return undefined;

  const exact = EDUCATION_LEVEL_GAMES.find((e) => e.label.toLowerCase() === s);
  if (exact) return exact;

  const grade = s.match(/\b(?:grade|yr|year)\s*(\d{1,2})\b/) ?? s.match(/^(\d{1,2})(?:st|nd|rd|th)?$/);
  if (grade) {
    const n = Number(grade[1]);
    if (n >= 1 && n <= 12) return getEducationLevelBySlug(`grade-${n}`);
  }
  if (/\bkindergarten\b|\bk\b/.test(s)) return getEducationLevelBySlug("kindergarten");
  if (/\bcollege\b|university|undergrad/.test(s)) return getEducationLevelBySlug("college");
  if (/\btrade\b|vocational|shop math/.test(s)) return getEducationLevelBySlug("trade-school");

  return undefined;
}

/**
 * Resolve a curriculum subject to a real in-app lab when one exists.
 * Priority: career workspace → math/science subject sim → school level lab.
 * Skips typing/flashcard-only careers.
 */
export function resolveCurriculumSim(
  subject: string,
): CurriculumSimLink | null {
  const career = getCareerSkillByCareerName(subject);
  if (career) {
    const track = getCareerLabTrack(career.slug);
    if (track && track.length > 0) {
      return careerTrackLink(career, track[0]);
    }
    const link = careerLink(career);
    if (link) return link;
  }

  const subjectSim = resolveSubjectSim(subject);
  if (subjectSim) return subjectLink(subjectSim);

  const school = resolveSchoolLevel(subject);
  if (school) return schoolLink(school);

  return null;
}

/** Every lab in a career multi-lab track, each with its own deep link. */
export function resolveCurriculumLabTrack(
  subject: string,
): CurriculumTrackLabLink[] {
  const career = getCareerSkillByCareerName(subject);
  if (!career) return [];
  const track = getCareerLabTrack(career.slug);
  if (!track || track.length === 0) return [];
  return track.map((mod: CareerLabModule) => ({
    id: mod.id,
    title: mod.title,
    description: mod.description,
    domain: mod.domain,
    duration: mod.duration,
    formatLabel: SKILL_GAME_TYPE_LABELS[mod.gameType],
    gameType: mod.gameType,
    isWorkspace: isWorkspaceLab(mod.gameType),
    href: careerModuleHref(career.slug, mod.id, subject),
  }));
}

/** Prefer hands-on workspace labs for curriculum module links (not quiz-style drills). */
export function labForCurriculumModule(
  subject: string,
  moduleIndex: number,
): CurriculumTrackLabLink | null {
  const all = resolveCurriculumLabTrack(subject);
  if (all.length === 0) return null;
  const workspace = all.filter((l) => l.isWorkspace);
  const pool = workspace.length > 0 ? workspace : all;
  return pool[moduleIndex % pool.length] ?? null;
}

export type GamesDeepLink = {
  game: BuiltInGameId | null;
  career: string | null;
  subject: string | null;
  level: string | null;
  module: string | null;
  /** Subject name from the curriculum plan that opened this lab */
  from: string | null;
};

export function parseGamesDeepLink(search: string): GamesDeepLink {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const gameParam = params.get("game");
  return {
    game: (gameParam as BuiltInGameId) || null,
    career: params.get("career"),
    subject: params.get("subject"),
    level: params.get("level"),
    module: params.get("module"),
    from: params.get("from"),
  };
}
