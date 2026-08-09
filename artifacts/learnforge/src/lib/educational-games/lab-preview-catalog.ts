import {
  CAREER_SKILL_GAMES,
  type CareerSkillSlug,
} from "./career-skills-catalog";
import { LEARNING_PATHS } from "./learning-paths-catalog";
import { getCareerLabTrack } from "./career-lab-tracks";
import {
  EDUCATION_LEVEL_GAMES,
  type EducationLevelSlug,
} from "./education-levels-catalog";
import { EDUCATION_LEVEL_CONTENT } from "./education-levels-content";
import { mergeEducationSkillContent } from "./education-workspace-content";
import {
  SUBJECT_SIMULATIONS,
  type SubjectSimSlug,
} from "./subject-sims-catalog";
import { SUBJECT_SIM_CONTENT } from "./subject-sims-content";
import {
  SKILL_GAME_TYPE_LABELS,
  type SkillGameContent,
  type SkillGameType,
} from "./skill-game-types";

export type LabPreviewCluster =
  | "healthcare"
  | "public-safety"
  | "trades"
  | "business"
  | "technology"
  | "education-social"
  | "school"
  | "subject";

export type LabPreviewKind = "career" | "school" | "subject";

export type LabPreviewEntry = {
  id: string;
  kind: LabPreviewKind;
  cluster: LabPreviewCluster;
  emoji: string;
  trackName: string;
  moduleTitle: string;
  description: string;
  domain?: string;
  duration: string;
  gameType: SkillGameType;
  formatLabel: string;
  labIndex: number;
  labCount: number;
  /** Deep link into the live lab */
  href: string;
  content?: SkillGameContent;
  /** Cover image path, e.g. /lab-images/its-network-triage.png */
  image?: string;
};

const CAREER_CLUSTER: Record<CareerSkillSlug, LabPreviewCluster> = {
  "family-services": "education-social",
  "social-caseworker": "education-social",
  cna: "healthcare",
  "medical-assistant": "healthcare",
  "patient-care-tech": "healthcare",
  "pharmacy-tech": "healthcare",
  "medical-billing-coding": "healthcare",
  "phlebotomy-tech": "healthcare",
  "dental-assistant": "healthcare",
  "lpn-lvn": "healthcare",
  "registered-nurse": "healthcare",
  "surgical-tech": "healthcare",
  "vet-tech": "healthcare",
  "police-officer": "public-safety",
  "firefighter-emt": "public-safety",
  "postal-worker": "public-safety",
  "office-assistant": "business",
  bookkeeper: "business",
  "bank-teller": "business",
  paralegal: "business",
  "human-resources": "business",
  "insurance-agent": "business",
  electrician: "trades",
  plumber: "trades",
  welder: "trades",
  "auto-mechanic": "trades",
  "hvac-tech": "trades",
  "cdl-driver": "trades",
  "software-developer": "technology",
  "javascript-developer": "technology",
  "ai-specialist": "technology",
  "data-analyst": "technology",
  "information-technology": "technology",
  "it-support": "technology",
  cybersecurity: "technology",
  "cloud-computing": "technology",
  "project-management": "business",
  "real-estate": "business",
  cosmetology: "business",
  "teacher-cert": "education-social",
  "teaching-assistant": "education-social",
  "childcare-cda": "education-social",
};

export const LAB_CLUSTER_LABELS: Record<LabPreviewCluster, string> = {
  healthcare: "Healthcare",
  "public-safety": "Public safety & service",
  trades: "Trades & skilled labor",
  business: "Business & office",
  technology: "Technology & IT",
  "education-social": "Education & social services",
  school: "School skills",
  subject: "Subject simulations",
};

const SCHOOL_IMAGES: Partial<Record<EducationLevelSlug, string>> = {
  kindergarten: "/lab-images/school-kindergarten.jpg",
  "trade-school-vocabulary": "/lab-images/school-trade-school-vocabulary.jpg",
};

const SUBJECT_IMAGES: Partial<Record<SubjectSimSlug, string>> = {
  "physics-projectile": "/lab-images/physics-projectile.jpg",
  "aerospace-orbit": "/lab-images/aerospace-orbit.jpg",
  "biology-microscopy": "/lab-images/biology-microscopy.jpg",
  "chemistry-titration": "/lab-images/chemistry-titration.jpg",
  "algebra-graphing": "/lab-images/algebra-graphing.jpg",
  "earth-science-climate": "/lab-images/earth-science-climate.jpg",
};

function careerHref(slug: CareerSkillSlug, moduleId: string): string {
  return `/games?game=career-skills-lab&career=${encodeURIComponent(slug)}&module=${encodeURIComponent(moduleId)}`;
}

function schoolHref(slug: EducationLevelSlug): string {
  return `/games?game=education-skills-lab&level=${encodeURIComponent(slug)}`;
}

function subjectHref(slug: SubjectSimSlug): string {
  return `/games?game=subject-sims-lab&subject=${encodeURIComponent(slug)}`;
}

export function buildLabPreviewCatalog(): LabPreviewEntry[] {
  const entries: LabPreviewEntry[] = [];

  // Full learning-path careers (JS / AI) — no workspace track modules
  for (const path of LEARNING_PATHS) {
    entries.push({
      id: `learning-path:${path.id}`,
      kind: "career",
      cluster: "technology",
      emoji: path.emoji,
      trackName: path.careerName,
      moduleTitle: path.title,
      description: path.description,
      domain: "Learning path",
      duration: path.id === "ai" ? "3–8 hrs path" : "2–6 hrs path",
      gameType: path.id === "javascript" ? "code-trace" : "script-choice",
      formatLabel: "Progressive learning path",
      labIndex: 1,
      labCount: 1,
      href: path.href,
    });
  }

  for (const career of CAREER_SKILL_GAMES) {
    if (career.learningPathGameId) continue;
    const track = getCareerLabTrack(career.slug);
    if (!track || track.length === 0) continue;
    track.forEach((mod, idx) => {
      entries.push({
        id: `career:${career.slug}:${mod.id}`,
        kind: "career",
        cluster: CAREER_CLUSTER[career.slug],
        emoji: career.emoji,
        trackName: career.careerName,
        moduleTitle: mod.title,
        description: mod.description,
        domain: mod.domain,
        duration: mod.duration,
        gameType: mod.gameType,
        formatLabel: SKILL_GAME_TYPE_LABELS[mod.gameType],
        labIndex: idx + 1,
        labCount: track.length,
        href: careerHref(career.slug, mod.id),
        content: mod.content,
        image: mod.image,
      });
    });
  }

  for (const level of EDUCATION_LEVEL_GAMES) {
    entries.push({
      id: `school:${level.slug}`,
      kind: "school",
      cluster: "school",
      emoji: level.emoji,
      trackName: level.label,
      moduleTitle: level.skillTitle,
      description: level.skillDescription,
      domain: level.band,
      duration: level.duration,
      gameType: level.gameType,
      formatLabel: SKILL_GAME_TYPE_LABELS[level.gameType],
      labIndex: 1,
      labCount: 1,
      href: schoolHref(level.slug),
      content: mergeEducationSkillContent(
        level.slug,
        EDUCATION_LEVEL_CONTENT[level.slug],
      ),
      image: SCHOOL_IMAGES[level.slug],
    });
  }

  for (const sim of SUBJECT_SIMULATIONS) {
    entries.push({
      id: `subject:${sim.slug}`,
      kind: "subject",
      cluster: "subject",
      emoji: sim.emoji,
      trackName: sim.subject,
      moduleTitle: sim.title,
      description: sim.description,
      domain: sim.subject,
      duration: sim.duration,
      gameType: sim.gameType,
      formatLabel: SKILL_GAME_TYPE_LABELS[sim.gameType],
      labIndex: 1,
      labCount: 1,
      href: subjectHref(sim.slug),
      content: SUBJECT_SIM_CONTENT[sim.slug],
      image: SUBJECT_IMAGES[sim.slug],
    });
  }

  return entries;
}

export const LAB_PREVIEW_CATALOG = buildLabPreviewCatalog();
