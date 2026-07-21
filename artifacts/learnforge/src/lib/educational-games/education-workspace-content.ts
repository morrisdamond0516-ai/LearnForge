import type { EducationLevelSlug } from "./education-levels-catalog";
import type { SkillGameContent } from "./skill-game-types";

const G = 9.8;

/** Grade-level simulation workspace content (manipulatives, sim canvas, lab bench, spreadsheet, jobsite). */
export const EDUCATION_WORKSPACE_CONTENT: Partial<Record<EducationLevelSlug, SkillGameContent>> = {
  kindergarten: {
    manipulative: {
      title: "Count the Apples",
      brief: "Build number sense — add apples to the basket until you have the right count.",
      items: [
        { id: "apple", emoji: "🍎", label: "apples" },
        { id: "star", emoji: "⭐", label: "stars" },
      ],
      tasks: [
        { prompt: "Put 3 apples in the basket.", itemId: "apple", targetCount: 3 },
        { prompt: "Now put 5 stars on the board.", itemId: "star", targetCount: 5 },
      ],
    },
  },
  "grade-1": {
    manipulative: {
      title: "Sight Word Groups",
      brief: "Count letter blocks to match each sight-word group size.",
      items: [{ id: "block", emoji: "🧱", label: "blocks" }],
      tasks: [
        { prompt: "The word CAT has 3 letters. Add 3 blocks.", itemId: "block", targetCount: 3 },
        { prompt: "The word RUN has 3 letters. Add 3 blocks.", itemId: "block", targetCount: 3 },
        { prompt: "The word STOP has 4 letters. Add 4 blocks.", itemId: "block", targetCount: 4 },
      ],
    },
  },
  "grade-2": {
    manipulative: {
      title: "Add With Counters",
      brief: "Use counters to model addition before you calculate.",
      items: [{ id: "counter", emoji: "🔵", label: "counters" }],
      tasks: [
        { prompt: "Show 7 + 2 — place 9 counters.", itemId: "counter", targetCount: 9 },
        { prompt: "Show 12 − 5 — place 7 counters left.", itemId: "counter", targetCount: 7 },
      ],
    },
  },
  "grade-3": {
    manipulative: {
      title: "Equal Groups",
      brief: "Model multiplication as equal groups of objects.",
      items: [{ id: "dot", emoji: "🟢", label: "dots per group" }],
      tasks: [
        { prompt: "4 groups of 3 — show 12 dots total.", itemId: "dot", targetCount: 12 },
        { prompt: "5 groups of 2 — show 10 dots total.", itemId: "dot", targetCount: 10 },
      ],
    },
  },
  "grade-4": {
    intakeForm: {
      title: "Paragraph Writing Planner",
      brief: "Plan a strong paragraph before you draft — topic sentence through revision.",
      scenario: "Expository paragraph on how plants make food.",
      fields: [
        { id: "topic", label: "Topic sentence drafted?", type: "select", options: ["Yes", "No"], expected: "Yes" },
        { id: "details", label: "Supporting details listed (min 3)?", type: "select", options: ["Yes", "No"], expected: "Yes" },
        { id: "closing", label: "Closing sentence planned?", type: "select", options: ["Yes", "No"], expected: "Yes" },
        { id: "revise", label: "Revision pass scheduled?", type: "select", options: ["Yes", "No"], expected: "Yes" },
      ],
    },
  },
  "grade-5": {
    simCanvas: {
      title: "Fraction Visualizer",
      brief: "Adjust the numerator and denominator — watch the bar model update, then answer.",
      visual: "fraction",
      variables: [
        { id: "numerator", label: "Numerator", min: 1, max: 8, step: 1, default: 2 },
        { id: "denominator", label: "Denominator", min: 2, max: 8, step: 1, default: 4 },
      ],
      questions: [
        {
          prompt: "What percent is the shaded portion? (Use current slider values)",
          evaluate: (v) => Math.round(((v.numerator ?? 2) / (v.denominator ?? 4)) * 100),
          tolerance: 0,
          unit: "%",
          explanation: "Percent = (numerator ÷ denominator) × 100.",
        },
      ],
    },
  },
  "grade-6": {
    simCanvas: {
      title: "Weather Variables Lab",
      brief: "Change temperature and humidity — predict heat index effects (simplified model).",
      visual: "graph",
      variables: [
        { id: "x", label: "Temperature (°F)", min: 70, max: 100, step: 1, default: 85, unit: "°F" },
        { id: "slope", label: "Humidity factor", min: 0.5, max: 2, step: 0.1, default: 1.2 },
        { id: "intercept", label: "Base offset", min: -10, max: 10, step: 1, default: 5 },
      ],
      questions: [
        {
          prompt: "Using y = humidity×temp + offset, what is y at the current sliders?",
          evaluate: (v) => Math.round(((v.slope ?? 1.2) * (v.x ?? 85) + (v.intercept ?? 5)) * 10) / 10,
          tolerance: 1,
          explanation: "Substitute current temperature and humidity factor into the linear model.",
        },
      ],
    },
  },
  "grade-7": {
    simCanvas: {
      title: "Ratio & Graph Lab",
      brief: "Explore unit rate as a line — change slope and read the value at x.",
      visual: "graph",
      variables: [
        { id: "x", label: "Quantity (x)", min: 0, max: 10, step: 1, default: 4 },
        { id: "slope", label: "Unit rate (y per x)", min: 1, max: 6, step: 0.5, default: 2.5 },
        { id: "intercept", label: "Starting value", min: 0, max: 5, step: 1, default: 0 },
      ],
      questions: [
        {
          prompt: "At the current x, what is y on the line y = rate·x + start?",
          evaluate: (v) => Math.round(((v.slope ?? 2.5) * (v.x ?? 4) + (v.intercept ?? 0)) * 10) / 10,
          tolerance: 0.5,
          explanation: "Multiply unit rate by quantity, then add the starting value.",
        },
      ],
    },
  },
  "grade-8": {
    labBench: {
      title: "Microscope Slide Prep",
      brief: "Follow proper lab procedure from hypothesis to focused observation.",
      steps: [
        {
          instruction: "Before placing the slide on the stage, you should:",
          choices: [
            { label: "Start at highest objective power", correct: false, feedback: "Always begin with low power to locate the specimen." },
            { label: "Clean slide and label with sample ID", correct: true, feedback: "Correct — labeled, clean slides prevent cross-contamination." },
            { label: "Skip the coverslip to save time", correct: false, feedback: "Coverslip protects lens and preserves sample." },
          ],
        },
        {
          instruction: "First focus pass:",
          choices: [
            { label: "Use coarse adjustment only at 40×", correct: false, feedback: "Coarse focus at high power risks cracking slide." },
            { label: "Low power, coarse then fine focus", correct: true, feedback: "Standard procedure — locate, center, then increase power." },
            { label: "Close one eye and guess distance", correct: false, feedback: "Always use both eyes with proper interpupillary distance." },
          ],
        },
        {
          instruction: "Record your observation:",
          choices: [
            { label: "Sketch cell structures with scale note", correct: true, feedback: "Correct — labeled sketches are valid lab data." },
            { label: "Write 'looks cool'", correct: false, feedback: "Observations must be specific and measurable." },
            { label: "Erase data that doesn't match hypothesis", correct: false, feedback: "Never discard data — science requires honesty." },
          ],
        },
      ],
    },
  },
  "grade-9": {
    simCanvas: {
      title: "Linear Equation Grapher",
      brief: "Adjust slope and intercept — read coordinates from the live graph.",
      visual: "graph",
      variables: [
        { id: "x", label: "x value", min: -5, max: 10, step: 1, default: 3 },
        { id: "slope", label: "Slope (m)", min: -3, max: 3, step: 0.5, default: 2 },
        { id: "intercept", label: "y-intercept (b)", min: -5, max: 5, step: 1, default: 1 },
      ],
      questions: [
        {
          prompt: "For y = mx + b at current sliders, compute y.",
          evaluate: (v) => Math.round(((v.slope ?? 2) * (v.x ?? 3) + (v.intercept ?? 1)) * 10) / 10,
          tolerance: 0.5,
          explanation: "Substitute x into the linear equation.",
        },
      ],
    },
  },
  "grade-10": {
    intakeForm: {
      title: "Research Project Intake",
      brief: "Plan a credible research assignment before you write — source quality checklist.",
      scenario:
        "Assignment: 1200-word argumentative essay on renewable energy policy. Due in 3 weeks. Must use 5+ scholarly sources.",
      fields: [
        { id: "thesis", label: "Working thesis (one sentence)", type: "textarea", expected: "renewable energy", hint: "Mention renewable energy policy" },
        { id: "sources", label: "Minimum scholarly sources", type: "text", expected: "5", hint: "Requirement from assignment" },
        { id: "database", label: "Primary database to search first", type: "select", options: [".gov only", "Google Images", "Academic Search / JSTOR", "Social media"], expected: "Academic Search / JSTOR", hint: "Use a peer-reviewed database" },
        { id: "citation", label: "Citation style", type: "text", expected: "MLA", hint: "Common for English 10" },
      ],
    },
  },
  "grade-11": {
    simCanvas: {
      title: "Quadratic Motion Preview",
      brief: "Projectile motion connects to quadratics — adjust launch parameters.",
      visual: "projectile",
      variables: [
        { id: "velocity", label: "Launch speed", min: 10, max: 40, step: 1, default: 25, unit: "m/s" },
        { id: "angle", label: "Launch angle", min: 15, max: 75, step: 1, default: 45, unit: "°" },
      ],
      questions: [
        {
          prompt: "Approximate range in meters (R = v²·sin(2θ)/g, g=9.8). Round to nearest whole.",
          evaluate: (v) => {
            const vel = v.velocity ?? 25;
            const ang = ((v.angle ?? 45) * Math.PI) / 180;
            return Math.round((vel * vel * Math.sin(2 * ang)) / G);
          },
          tolerance: 2,
          unit: "m",
          explanation: "Range formula for level ground without air resistance.",
        },
      ],
    },
  },
  "grade-12": {
    intakeForm: {
      title: "College Application Tracker",
      brief: "Track senior-year deadlines and requirements before you submit.",
      scenario: "Applying to 4 schools — FAFSA and recommendations due this month.",
      fields: [
        { id: "fafsa", label: "FAFSA submitted?", type: "select", options: ["Yes", "No", "In progress"], expected: "In progress" },
        { id: "transcript", label: "Transcript requests sent?", type: "select", options: ["Yes", "No"], expected: "Yes" },
        { id: "recs", label: "Recommendation letters requested?", type: "select", options: ["Yes", "No"], expected: "Yes" },
        { id: "essay", label: "Personal statement draft complete?", type: "select", options: ["Yes", "No"], expected: "No" },
      ],
    },
  },
  college: {
    spreadsheet: {
      title: "Research Data Sheet",
      brief: "Track survey responses and compute summary statistics in a spreadsheet.",
      headers: ["", "A", "B", "C"],
      rows: [
        ["1", "Response", "Score", "Weight"],
        ["2", "A", "85", "1"],
        ["3", "B", "92", "1"],
        ["4", "C", "78", "1"],
        ["5", "Average", "", ""],
      ],
      tasks: [
        { instruction: "Average score in B5 (B2:B4).", targetCell: "B5", expectedValue: "85", formulaHint: "=AVERAGE(B2:B4)" },
        { instruction: "Count responses in C5.", targetCell: "C5", expectedValue: "3", formulaHint: "=COUNT(B2:B4)" },
      ],
    },
  },
  "trade-school": {
    jobsite: {
      title: "Tape Measure & Cut List",
      brief: "Calculate cut lengths and stud counts like on a framing jobsite.",
      tasks: [
        {
          prompt: "Wall length 14 ft 6 in. Studs every 16 in on center. How many studs (round up)?",
          answer: "12",
          unit: "studs",
          explanation: "174 in ÷ 16 ≈ 10.9 → 11 spaces + end stud ≈ 12 studs.",
        },
        {
          prompt: "Three boards cut at 3 ft 4 in each. Total inches of lumber used?",
          answer: "120",
          unit: "in",
          explanation: "3 × 40 in = 120 in.",
        },
      ],
    },
  },
  "trade-school-vocabulary": {
    manipulative: {
      title: "Shop Tool Groups",
      brief: "Group trade tools on the board — learn shop vocabulary hands-on.",
      items: [
        { id: "tape", emoji: "📏", label: "tape measures" },
        { id: "helmet", emoji: "⛑️", label: "hard hats" },
        { id: "wrench", emoji: "🔧", label: "wrenches" },
      ],
      tasks: [
        { prompt: "Place 2 tape measures on the board.", itemId: "tape", targetCount: 2 },
        { prompt: "Place 3 hard hats for the crew.", itemId: "helmet", targetCount: 3 },
        { prompt: "Place 4 wrenches in the tool area.", itemId: "wrench", targetCount: 4 },
      ],
    },
  },
};

export function mergeEducationSkillContent(
  slug: EducationLevelSlug,
  base: SkillGameContent,
): SkillGameContent {
  const workspace = EDUCATION_WORKSPACE_CONTENT[slug];
  if (!workspace) return base;
  return { ...base, ...workspace };
}
