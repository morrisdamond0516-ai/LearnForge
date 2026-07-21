import type { SubjectSimSlug } from "./subject-sims-catalog";
import type { SkillGameContent } from "./skill-game-types";

const G = 9.8;
const EARTH_MU = 398600;

export const SUBJECT_SIM_CONTENT: Record<SubjectSimSlug, SkillGameContent> = {
  "physics-projectile": {
    simCanvas: {
      title: "Projectile Motion — Range & Height",
      brief: "Inspired by PhET projectile simulators. Adjust v₀ and θ, then compute range.",
      visual: "projectile",
      variables: [
        { id: "velocity", label: "Initial speed v₀", min: 5, max: 50, step: 1, default: 30, unit: "m/s" },
        { id: "angle", label: "Launch angle θ", min: 5, max: 85, step: 1, default: 40, unit: "°" },
      ],
      questions: [
        {
          prompt: "Range in meters (R = v²·sin(2θ)/g). Round to nearest whole.",
          evaluate: (v) => {
            const vel = v.velocity ?? 30;
            const ang = ((v.angle ?? 40) * Math.PI) / 180;
            return Math.round((vel * vel * Math.sin(2 * ang)) / G);
          },
          tolerance: 2,
          unit: "m",
          explanation: "Classic range formula on level ground, no air drag.",
        },
        {
          prompt: "Max height in meters (H = (v·sin θ)² / 2g). Round to nearest whole.",
          evaluate: (v) => {
            const vel = v.velocity ?? 30;
            const ang = ((v.angle ?? 40) * Math.PI) / 180;
            return Math.round(((vel * Math.sin(ang)) ** 2) / (2 * G));
          },
          tolerance: 1,
          unit: "m",
          explanation: "Vertical component determines peak height.",
        },
      ],
    },
  },
  "aerospace-orbit": {
    simCanvas: {
      title: "Low Earth Orbit Period",
      brief: "Change altitude above Earth — estimate orbital period (simplified two-body model).",
      visual: "orbit",
      variables: [
        { id: "altitude", label: "Altitude above surface", min: 200, max: 2000, step: 50, default: 400, unit: "km" },
      ],
      questions: [
        {
          prompt: "Orbital period in minutes (T = 2π√(r³/μ), r in km, μ=398600). Round to nearest whole.",
          evaluate: (v) => {
            const alt = v.altitude ?? 400;
            const r = 6371 + alt;
            return Math.round((2 * Math.PI * Math.sqrt(r ** 3 / EARTH_MU)) * 10) / 10;
          },
          tolerance: 2,
          unit: "min",
          explanation: "Kepler's third law for circular orbits around Earth.",
        },
      ],
    },
  },
  "biology-microscopy": {
    labBench: {
      title: "Onion Cell Wet Mount",
      brief: "Labster-style procedural lab — prepare and observe plant cells.",
      steps: [
        {
          instruction: "Prepare the wet mount sample:",
          choices: [
            { label: "Place onion tissue on slide, add iodine stain, coverslip at angle", correct: true, feedback: "Correct — stain improves contrast; angled coverslip prevents bubbles." },
            { label: "Crush tissue dry without liquid", correct: false, feedback: "Wet mount requires saline or water to preserve cells." },
            { label: "Use oil immersion immediately", correct: false, feedback: "Oil is only for 100× objective after focusing at low power." },
          ],
        },
        {
          instruction: "Microscope focusing sequence:",
          choices: [
            { label: "10× objective, coarse focus, then 40× fine focus", correct: true, feedback: "Standard biology lab procedure." },
            { label: "100× first to see detail quickly", correct: false, feedback: "Start low power to locate specimen and avoid lens damage." },
            { label: "Leave stage clips off the slide", correct: false, feedback: "Always secure the slide before focusing." },
          ],
        },
        {
          instruction: "Identify plant cell structures:",
          choices: [
            { label: "Cell wall + nucleus visible in stained cells", correct: true, feedback: "Correct — plant cells have rigid walls; iodine highlights nucleus." },
            { label: "Centrioles are the main feature in onion cells", correct: false, feedback: "Centrioles are not prominent in typical plant cell prep." },
            { label: "No membrane-bound organelles in eukaryotes", correct: false, feedback: "Onion cells are eukaryotic with nucleus and organelles." },
          ],
        },
      ],
    },
  },
  "chemistry-titration": {
    labBench: {
      title: "Strong Acid–Strong Base Titration",
      brief: "Follow titration procedure — indicator choice through equivalence point.",
      steps: [
        {
          instruction: "Select indicator for HCl titrated with NaOH:",
          choices: [
            { label: "Phenolphthalein (colorless → pink at pH ~8.3)", correct: true, feedback: "Correct — sharp endpoint in strong acid–strong base titration." },
            { label: "Methyl orange only for entire curve", correct: false, feedback: "Methyl orange endpoint is acidic; strong base titrations need higher pH indicator." },
            { label: "No indicator — guess when neutral", correct: false, feedback: "Indicators (or pH meter) are required to detect equivalence." },
          ],
        },
        {
          instruction: "During titration, add NaOH:",
          choices: [
            { label: "Slowly near endpoint; swirl flask continuously", correct: true, feedback: "Correct — avoids overshooting equivalence point." },
            { label: "Pour entire buret volume at once", correct: false, feedback: "Would overshoot endpoint and ruin trial." },
            { label: "Stop when solution turns permanently cloudy", correct: false, feedback: "Endpoint is color change at equivalence, not cloudiness." },
          ],
        },
        {
          instruction: "At equivalence point for HCl + NaOH:",
          choices: [
            { label: "Moles acid = moles base; pH ≈ 7 for strong–strong", correct: true, feedback: "Correct — salt water formed; phenolphthalein pink indicates slight excess base." },
            { label: "pH always 1 regardless of volume added", correct: false, feedback: "pH rises as base neutralizes acid." },
            { label: "Discard data if endpoint overshot slightly", correct: false, feedback: "Record volume and repeat trial — overshoot is a learning moment." },
          ],
        },
      ],
    },
  },
  "algebra-graphing": {
    simCanvas: {
      title: "Linear Function Explorer",
      brief: "Gizmos-style graph — change m and b, read y at any x.",
      visual: "graph",
      variables: [
        { id: "x", label: "Input x", min: -8, max: 8, step: 1, default: 2 },
        { id: "slope", label: "Slope m", min: -4, max: 4, step: 0.5, default: 1.5 },
        { id: "intercept", label: "y-intercept b", min: -6, max: 6, step: 1, default: -1 },
      ],
      questions: [
        {
          prompt: "Compute y = mx + b for current slider values.",
          evaluate: (v) => Math.round(((v.slope ?? 1.5) * (v.x ?? 2) + (v.intercept ?? -1)) * 10) / 10,
          tolerance: 0.5,
          explanation: "Substitute x, m, and b into the slope-intercept form.",
        },
      ],
    },
  },
  "earth-science-climate": {
    simCanvas: {
      title: "Climate Response Model",
      brief: "Simplified earth-system model — adjust forcing variables and read temperature response.",
      visual: "graph",
      variables: [
        { id: "x", label: "Baseline temp anomaly (°C)", min: 0, max: 3, step: 0.1, default: 1.2, unit: "°C" },
        { id: "slope", label: "CO₂ forcing factor", min: 0.5, max: 3, step: 0.1, default: 1.5 },
        { id: "intercept", label: "Ocean uptake offset", min: -2, max: 0, step: 0.1, default: -0.5 },
      ],
      questions: [
        {
          prompt: "Model output: response = forcing×anomaly + ocean offset. Current value?",
          evaluate: (v) => Math.round(((v.slope ?? 1.5) * (v.x ?? 1.2) + (v.intercept ?? -0.5)) * 10) / 10,
          tolerance: 0.3,
          unit: "°C",
          explanation: "Simplified linear climate sensitivity model for inquiry learning.",
        },
      ],
    },
  },
};
