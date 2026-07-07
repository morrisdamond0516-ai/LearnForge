import type { BuiltInGame, ExternalResource } from "./types";

export const BUILT_IN_GAMES: BuiltInGame[] = [
  {
    id: "boss-battle",
    title: "Knowledge Boss Battle",
    description:
      "Defeat three bosses by answering questions. Combo streaks deal bonus damage. HP bars, battles, and victories — study feels like a video game.",
    subjects: ["mixed", "science", "math", "vocabulary"],
    ages: ["kids", "teens", "adults", "all"],
    duration: "8–15 min",
    skills: ["Recall under pressure", "Multi-subject review", "Motivation"],
    depth: "featured",
    hook: "Fight bosses with your brain",
  },
  {
    id: "career-quest",
    title: "Career Life Quest",
    description:
      "A branching life story from high school to your first big opportunity. Every choice shapes your path — inspired by STEM Career Paths and narrative career games.",
    subjects: ["careers"],
    ages: ["teens", "adults", "all"],
    duration: "10–15 min",
    skills: ["Career exploration", "Decision-making", "Self-reflection"],
    depth: "featured",
    hook: "Your choices shape your future",
  },
  {
    id: "day-on-the-job",
    title: "Day One on the Job",
    description:
      "Simulate a real first day as a nurse, developer, teacher, or electrician. Make professional decisions and see how ready you are — inspired by job simulators like Forage.",
    subjects: ["careers"],
    ages: ["teens", "adults", "all"],
    duration: "8–12 min",
    skills: ["Workplace judgment", "Professional skills", "Career realism"],
    depth: "featured",
    hook: "Test-drive a real job",
  },
  {
    id: "lab-escape",
    title: "Lab Escape",
    description:
      "Locked in after hours! Solve science puzzles room by room to collect clues and escape. Escape-room tension meets classroom content.",
    subjects: ["science"],
    ages: ["kids", "teens", "all"],
    duration: "10–12 min",
    skills: ["Science reasoning", "Problem-solving", "Safety awareness"],
    depth: "featured",
    hook: "Escape the science lab",
  },
  {
    id: "jeopardy-arena",
    title: "Jeopardy Arena",
    description:
      "Classic game-show board across Space, Careers, Math, and Kids Science. Pick dollar values, risk wrong answers, and chase a high score.",
    subjects: ["mixed", "science", "math", "careers"],
    ages: ["kids", "teens", "adults", "all"],
    duration: "10–15 min",
    skills: ["Quick recall", "Strategy", "Friendly competition"],
    depth: "featured",
    hook: "Game show energy",
  },
  {
    id: "math-sprint",
    title: "Math Sprint",
    description:
      "Race the clock with addition, subtraction, multiplication, and division.",
    subjects: ["math"],
    ages: ["kids", "teens", "adults", "all"],
    duration: "1–3 min",
    skills: ["Mental math", "Speed", "Number sense"],
    depth: "quick",
    hook: "60-second math rush",
  },
  {
    id: "word-scramble",
    title: "Word Scramble",
    description:
      "Unscramble academic vocabulary and unlock a quick fact about each word.",
    subjects: ["vocabulary", "mixed"],
    ages: ["kids", "teens", "adults", "all"],
    duration: "2–5 min",
    skills: ["Spelling", "Vocabulary", "Reading"],
    depth: "quick",
    hook: "Unscramble and learn",
  },
  {
    id: "memory-match",
    title: "Memory Match",
    description:
      "Flip cards to pair terms with definitions.",
    subjects: ["mixed", "science", "careers", "math"],
    ages: ["kids", "teens", "adults", "all"],
    duration: "3–6 min",
    skills: ["Memory", "Definitions", "Recall"],
    depth: "quick",
    hook: "Classic concentration",
  },
  {
    id: "career-sorter",
    title: "Career Sorter",
    description:
      "Sort real jobs into Holland RIASEC career types.",
    subjects: ["careers"],
    ages: ["teens", "adults", "all"],
    duration: "4–8 min",
    skills: ["Career exploration", "Self-awareness", "Job families"],
    depth: "quick",
    hook: "Match jobs to types",
  },
  {
    id: "science-trivia",
    title: "Science Trivia",
    description:
      "Multiple-choice science questions with instant explanations.",
    subjects: ["science"],
    ages: ["kids", "teens", "adults", "all"],
    duration: "2–4 min",
    skills: ["Science literacy", "Reasoning", "Curiosity"],
    depth: "quick",
    hook: "Quick science rounds",
  },
  {
    id: "geography-capitals",
    title: "Capital Challenge",
    description:
      "Match world capitals to their countries.",
    subjects: ["geography"],
    ages: ["kids", "teens", "adults", "all"],
    duration: "3–5 min",
    skills: ["Geography", "World knowledge", "Memory"],
    depth: "quick",
    hook: "World capitals quiz",
  },
];

export const EXTERNAL_FREE_RESOURCES: ExternalResource[] = [
  {
    name: "STEM Career Paths (open source)",
    url: "https://stemcareerpaths.org/",
    description:
      "Character-driven browser RPG: high school choices shape your STEM future. Play solo or in groups.",
    subjects: ["careers", "science"],
    ages: ["teens", "all"],
    free: true,
  },
  {
    name: "Maker Mojo (Skillionaire)",
    url: "https://www.skillionairegames.com/makermojo",
    description:
      "Exoplanet adventure with welding, CAD, robotics, and real manufacturing career pathways. Great for middle and high school.",
    subjects: ["careers", "science"],
    ages: ["kids", "teens", "all"],
    free: true,
  },
  {
    name: "Forage Job Simulations",
    url: "https://www.theforage.com/",
    description:
      "Free virtual internships from real employers — law, finance, software, healthcare, and more.",
    subjects: ["careers"],
    ages: ["teens", "adults", "all"],
    free: true,
  },
  {
    name: "ExploreYou Career Sims",
    url: "https://exploreyou.ai/",
    description:
      "AI-powered career test-drives with realistic profession simulations and personalized roadmaps.",
    subjects: ["careers"],
    ages: ["teens", "adults", "all"],
    free: true,
  },
  {
    name: "Amni-Learn",
    url: "https://amni-scient.com/amni-learn.html",
    description:
      "71 browser games from pre-K through college prep: writing, math, music, and brain training.",
    subjects: ["math", "vocabulary", "science", "mixed"],
    ages: ["kids", "teens", "adults", "all"],
    free: true,
  },
  {
    name: "Are We There Yet? (AWTY)",
    url: "https://awty.app/",
    description:
      "Free instant-play games for ages 4–16: math minute, word wizard, memory, geography. No ads.",
    subjects: ["math", "vocabulary", "geography", "logic"],
    ages: ["kids", "teens", "all"],
    free: true,
  },
  {
    name: "Google Career Dreamer",
    url: "https://grow.google/career-dreamer",
    description:
      "Playful AI career exploration that surfaces skills from your experience.",
    subjects: ["careers"],
    ages: ["teens", "adults", "all"],
    free: true,
  },
  {
    name: "ExoTrex (Science Adventure)",
    url: "https://dig-itgames.com/portfolio/exotrex-game-science-space-grade8/",
    description:
      "Free STEM space adventure for grades 8–10: chemistry, planetary science, puzzles.",
    subjects: ["science"],
    ages: ["teens", "all"],
    free: true,
  },
];

export function getGameById(id: string): BuiltInGame | undefined {
  return BUILT_IN_GAMES.find((g) => g.id === id);
}
