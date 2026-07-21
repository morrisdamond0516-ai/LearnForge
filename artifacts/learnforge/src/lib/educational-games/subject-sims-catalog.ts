import type { SkillGameType } from "./skill-game-types";

export type SubjectSimSlug =
  | "physics-projectile"
  | "aerospace-orbit"
  | "biology-microscopy"
  | "chemistry-titration"
  | "algebra-graphing"
  | "earth-science-climate";

export type SubjectSimEntry = {
  slug: SubjectSimSlug;
  emoji: string;
  title: string;
  description: string;
  subject: string;
  gameType: SkillGameType;
  duration: string;
};

/** Interactive subject simulations — PhET/Labster-inspired, in-app only. */
export const SUBJECT_SIMULATIONS: SubjectSimEntry[] = [
  {
    slug: "physics-projectile",
    emoji: "🎯",
    title: "Projectile Motion Lab",
    description: "Adjust launch speed and angle — predict range and max height like a physics lab.",
    subject: "Physics",
    gameType: "sim-canvas-workspace",
    duration: "6–10 min",
  },
  {
    slug: "aerospace-orbit",
    emoji: "🛰️",
    title: "Orbital Mechanics Explorer",
    description: "Change orbital altitude and estimate period — introductory aerospace engineering.",
    subject: "Aerospace",
    gameType: "sim-canvas-workspace",
    duration: "6–10 min",
  },
  {
    slug: "biology-microscopy",
    emoji: "🦠",
    title: "Cell Biology Lab Bench",
    description: "Prepare a slide and follow microscopy procedure — biology lab skills.",
    subject: "Biology",
    gameType: "lab-bench-workspace",
    duration: "6–10 min",
  },
  {
    slug: "chemistry-titration",
    emoji: "⚗️",
    title: "Acid-Base Titration",
    description: "Select indicators, add titrant, and identify the equivalence point step by step.",
    subject: "Chemistry",
    gameType: "lab-bench-workspace",
    duration: "8–12 min",
  },
  {
    slug: "algebra-graphing",
    emoji: "📐",
    title: "Function Graph Explorer",
    description: "Manipulate slope and intercept — read coordinates from a live graph.",
    subject: "Algebra",
    gameType: "sim-canvas-workspace",
    duration: "5–8 min",
  },
  {
    slug: "earth-science-climate",
    emoji: "🌡️",
    title: "Climate Variables Model",
    description: "Change temperature and CO₂ factor — explore a simplified climate response graph.",
    subject: "Earth Science",
    gameType: "sim-canvas-workspace",
    duration: "6–10 min",
  },
];

export function getSubjectSimBySlug(slug: string): SubjectSimEntry | undefined {
  return SUBJECT_SIMULATIONS.find((s) => s.slug === slug);
}

/** Match a curriculum subject name to a STEM simulation. */
export function getSubjectSimBySubjectName(
  name: string,
): SubjectSimEntry | undefined {
  const needle = name.trim().toLowerCase();
  if (!needle) return undefined;
  return SUBJECT_SIMULATIONS.find((s) => s.subject.toLowerCase() === needle);
}

export function subjectSimGameId(slug: SubjectSimSlug): string {
  return `subject-sim-${slug}`;
}
