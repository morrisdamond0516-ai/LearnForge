import { CAREER_SKILL_GAMES } from "../src/lib/educational-games/career-skills-catalog.ts";
import { EDUCATION_LEVEL_GAMES } from "../src/lib/educational-games/education-levels-catalog.ts";
import { SUBJECT_SIMULATIONS } from "../src/lib/educational-games/subject-sims-catalog.ts";
import {
  getCareerLabTrack,
  getCareerLabTrackRaw,
  getCareerAbsorbedDrills,
} from "../src/lib/educational-games/career-lab-tracks.ts";
import { isWorkspaceLab } from "../src/lib/educational-games/skill-game-types.ts";
import {
  resolveLabPhases,
  careerModuleScopeKey,
  educationScopeKey,
  subjectScopeKey,
} from "../src/lib/educational-games/lab-phase-resolver.ts";

let careerLabs = 0;
let careerAbsorbed = 0;
let careersWithoutWorkspace = 0;
const phaseProblems: string[] = [];

for (const c of CAREER_SKILL_GAMES) {
  const labs = getCareerLabTrack(c.slug);
  const raw = getCareerLabTrackRaw(c.slug);
  const absorbed = getCareerAbsorbedDrills(c.slug);
  careerAbsorbed += absorbed.length;

  if (labs) {
    careerLabs += labs.length;
    for (const m of labs) {
      if (!isWorkspaceLab(m.gameType)) {
        careersWithoutWorkspace++;
        phaseProblems.push(`non-workspace lab: ${c.slug}/${m.id}`);
      }
      const phases = resolveLabPhases(
        {
          scopeKey: careerModuleScopeKey(c.slug, m.id),
          title: m.title,
          description: m.description,
          domain: m.domain,
          gameType: m.gameType,
        },
        { prep: m.prep, recall: m.recall },
      );
      if (phases.prep.length < 2 || phases.recall.length < 2) {
        phaseProblems.push(`thin phases: ${c.slug}/${m.id}`);
      }
    }
  } else if (raw && raw.length > 0) {
    careersWithoutWorkspace++;
    phaseProblems.push(`no workspace labs after rebalance: ${c.slug}`);
  }
}

let eduModules = 0;
for (const e of EDUCATION_LEVEL_GAMES) {
  eduModules++;
  if (!isWorkspaceLab(e.gameType)) {
    phaseProblems.push(`education drill practice step: ${e.slug}`);
  }
}

let subjectModules = 0;
for (const s of SUBJECT_SIMULATIONS) {
  subjectModules++;
  if (!isWorkspaceLab(s.gameType)) {
    phaseProblems.push(`subject drill practice step: ${s.slug}`);
  }
}

console.log(
  JSON.stringify(
    {
      careerHandsOnLabs: careerLabs,
      scenarioDrillsAbsorbed: careerAbsorbed,
      eduModules,
      subjectModules,
      careersMissingWorkspace: careersWithoutWorkspace,
      phaseProblems: phaseProblems.length,
      details: phaseProblems.slice(0, 20),
    },
    null,
    2,
  ),
);

if (phaseProblems.length) process.exit(1);
