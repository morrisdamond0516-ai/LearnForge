import { CAREER_SKILL_GAMES } from "../src/lib/educational-games/career-skills-catalog.ts";
import { getCareerLabTrack, getCareerAbsorbedDrills } from "../src/lib/educational-games/career-lab-tracks.ts";

const thin: { career: string; labs: number; absorbed: number }[] = [];
for (const c of CAREER_SKILL_GAMES) {
  const labs = getCareerLabTrack(c.slug) ?? [];
  const absorbed = getCareerAbsorbedDrills(c.slug);
  if (labs.length <= 1) {
    thin.push({ career: c.careerName, labs: labs.length, absorbed });
  }
}
thin.sort((a, b) => b.absorbed - a.absorbed);
console.log(JSON.stringify({ singleLabCareers: thin.length, thin: thin.slice(0, 15) }, null, 2));
