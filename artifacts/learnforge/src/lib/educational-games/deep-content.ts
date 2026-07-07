export type BossQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  subject: string;
};

export const BOSS_ROSTER = [
  {
    id: "slime",
    name: "Confusion Slime",
    tagline: "Science fundamentals",
    theme: "science",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "golem",
    name: "Number Golem",
    tagline: "Math attack patterns",
    theme: "math",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "phantom",
    name: "Vocabulary Phantom",
    tagline: "Words and meanings",
    theme: "vocabulary",
    color: "from-violet-500 to-purple-600",
  },
] as const;

export const BOSS_QUESTIONS: Record<string, BossQuestion[]> = {
  slime: [
    {
      prompt: "What do plants release during photosynthesis?",
      options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Helium"],
      correctIndex: 1,
      subject: "Biology",
    },
    {
      prompt: "Which state of matter has a fixed volume but no fixed shape?",
      options: ["Solid", "Liquid", "Gas", "Plasma only"],
      correctIndex: 1,
      subject: "Physics",
    },
    {
      prompt: "The center of an atom is called the…",
      options: ["Electron", "Nucleus", "Proton cloud", "Ion"],
      correctIndex: 1,
      subject: "Chemistry",
    },
    {
      prompt: "Which planet is closest to the Sun?",
      options: ["Venus", "Mercury", "Mars", "Earth"],
      correctIndex: 1,
      subject: "Space",
    },
    {
      prompt: "What tool measures temperature?",
      options: ["Barometer", "Thermometer", "Ruler", "Compass"],
      correctIndex: 1,
      subject: "Science tools",
    },
    {
      prompt: "Water freezes at 0 degrees on which scale?",
      options: ["Kelvin only", "Celsius", "Fahrenheit only", "Rankine"],
      correctIndex: 1,
      subject: "Chemistry",
    },
  ],
  golem: [
    {
      prompt: "What is 12 × 8?",
      options: ["86", "96", "104", "88"],
      correctIndex: 1,
      subject: "Multiplication",
    },
    {
      prompt: "What is 144 ÷ 12?",
      options: ["11", "12", "14", "10"],
      correctIndex: 1,
      subject: "Division",
    },
    {
      prompt: "A rectangle 5 cm by 4 cm has area…",
      options: ["9 cm²", "18 cm²", "20 cm²", "25 cm²"],
      correctIndex: 2,
      subject: "Geometry",
    },
    {
      prompt: "What is 25% of 80?",
      options: ["15", "20", "25", "32"],
      correctIndex: 1,
      subject: "Percent",
    },
    {
      prompt: "How many sides does a hexagon have?",
      options: ["5", "6", "7", "8"],
      correctIndex: 1,
      subject: "Geometry",
    },
    {
      prompt: "What is 3² + 4²?",
      options: ["12", "25", "49", "7"],
      correctIndex: 1,
      subject: "Exponents",
    },
  ],
  phantom: [
    {
      prompt: "Someone who starts a business is an…",
      options: ["Entrepreneur", "Astronomer", "Librarian", "Geologist"],
      correctIndex: 0,
      subject: "Careers",
    },
    {
      prompt: "A testable prediction in science is a…",
      options: ["Theorem", "Hypothesis", "Metaphor", "Caption"],
      correctIndex: 1,
      subject: "Science language",
    },
    {
      prompt: "The study of past human life through artifacts is…",
      options: ["Astronomy", "Archaeology", "Anatomy", "Algebra"],
      correctIndex: 1,
      subject: "Social studies",
    },
    {
      prompt: "Writing that tells a story is called…",
      options: ["Narrative", "Spreadsheet", "Blueprint", "Invoice"],
      correctIndex: 0,
      subject: "Language arts",
    },
    {
      prompt: "A country's main city where government sits is a…",
      options: ["Capital", "Colony", "Peninsula", "Plateau"],
      correctIndex: 0,
      subject: "Geography",
    },
    {
      prompt: "Step-by-step computer instructions form an…",
      options: ["Algorithm", "Altitude", "Allergen", "Anthem"],
      correctIndex: 0,
      subject: "Technology",
    },
  ],
};

export type QuestStats = {
  stem: number;
  creative: number;
  people: number;
  builder: number;
};

export type QuestChoice = {
  label: string;
  next: string;
  effects: Partial<QuestStats>;
  reaction: string;
};

export type QuestNode = {
  id: string;
  chapter: string;
  scene: string;
  choices: QuestChoice[];
};

export const CAREER_QUEST_NODES: QuestNode[] = [
  {
    id: "start",
    chapter: "Year 9",
    scene:
      "You are starting high school. Clubs are recruiting in the gym. Where do you spend your first month?",
    choices: [
      {
        label: "Robotics & coding club",
        next: "summer",
        effects: { stem: 3, builder: 1 },
        reaction: "You wire a sensor that beeps when someone waves. You love the puzzle.",
      },
      {
        label: "Theater & design crew",
        next: "summer",
        effects: { creative: 3, people: 1 },
        reaction: "You paint sets and learn how lighting changes mood on stage.",
      },
      {
        label: "Peer tutoring & student council",
        next: "summer",
        effects: { people: 3, creative: 1 },
        reaction: "Helping classmates click with algebra feels better than any trophy.",
      },
      {
        label: "Auto shop & woodworking",
        next: "summer",
        effects: { builder: 3, stem: 1 },
        reaction: "You rebuild a carburetor and finally understand how machines cooperate.",
      },
    ],
  },
  {
    id: "summer",
    chapter: "Summer break",
    scene:
      "A counselor offers four summer experiences. You can only pick one. What do you choose?",
    choices: [
      {
        label: "Hospital volunteer shift",
        next: "path",
        effects: { people: 2, stem: 1 },
        reaction: "You watch nurses calm scared patients. Healthcare suddenly feels real.",
      },
      {
        label: "Startup hackathon weekend",
        next: "path",
        effects: { stem: 2, builder: 1, creative: 1 },
        reaction: "Your team pitches an app that helps students find study groups.",
      },
      {
        label: "Documentary filmmaking camp",
        next: "path",
        effects: { creative: 2, people: 1 },
        reaction: "You interview local business owners and stitch a short film.",
      },
      {
        label: "Construction site shadow day",
        next: "path",
        effects: { builder: 3 },
        reaction: "You read blueprints with a foreman and measure twice, cut once.",
      },
    ],
  },
  {
    id: "path",
    chapter: "After graduation",
    scene:
      "College, trade school, or straight to work — everyone pressures you to decide. What path calls to you?",
    choices: [
      {
        label: "Engineering or computer science degree",
        next: "offer",
        effects: { stem: 3 },
        reaction: "You imagine designing bridges, apps, or robots that solve real problems.",
      },
      {
        label: "Nursing or education program",
        next: "offer",
        effects: { people: 3, stem: 1 },
        reaction: "You want a career where every day helps someone grow or heal.",
      },
      {
        label: "Design, media, or arts school",
        next: "offer",
        effects: { creative: 3 },
        reaction: "You picture stories, brands, and experiences that move people.",
      },
      {
        label: "Electrician / HVAC apprenticeship",
        next: "offer",
        effects: { builder: 3, stem: 1 },
        reaction: "Skilled trades pay well and every building in town needs you.",
      },
    ],
  },
  {
    id: "offer",
    chapter: "First big opportunity",
    scene:
      "Two doors open at once. You can only walk through one right now. Which do you choose?",
    choices: [
      {
        label: "Take the internship with the scary-hard project",
        next: "end",
        effects: { stem: 2, builder: 1 },
        reaction: "It will stretch you, but growth lives on the other side of nervous.",
      },
      {
        label: "Join the team that mentors younger students",
        next: "end",
        effects: { people: 2, creative: 1 },
        reaction: "Teaching others cements what you know and builds leadership.",
      },
      {
        label: "Freelance a creative portfolio piece",
        next: "end",
        effects: { creative: 2, builder: 1 },
        reaction: "A real client deadline teaches professionalism fast.",
      },
      {
        label: "Earn a certification exam scholarship",
        next: "end",
        effects: { builder: 2, stem: 1 },
        reaction: "A credential can open doors before you have years of experience.",
      },
    ],
  },
];

export function resolveCareerEnding(stats: QuestStats): {
  title: string;
  career: string;
  blurb: string;
} {
  const entries: { key: keyof QuestStats; title: string; career: string; blurb: string }[] = [
    {
      key: "stem",
      title: "Innovation path",
      career: "Software engineer, data analyst, or biomedical researcher",
      blurb: "You chase puzzles, build systems, and improve how the world works.",
    },
    {
      key: "creative",
      title: "Creator path",
      career: "UX designer, filmmaker, or marketing strategist",
      blurb: "You translate ideas into experiences people remember.",
    },
    {
      key: "people",
      title: "Guide path",
      career: "Teacher, nurse, counselor, or social entrepreneur",
      blurb: "You lift others up and make communities stronger.",
    },
    {
      key: "builder",
      title: "Maker path",
      career: "Electrician, mechanic, civil tech, or manufacturing specialist",
      blurb: "You master real tools and keep the physical world running.",
    },
  ];
  const best = entries.reduce((a, b) => (stats[b.key] > stats[a.key] ? b : a));
  return { title: best.title, career: best.career, blurb: best.blurb };
}

export type LabRoom = {
  id: string;
  name: string;
  story: string;
  question: string;
  options: string[];
  correctIndex: number;
  clue: string;
};

export const LAB_ROOMS: LabRoom[] = [
  {
    id: "chemistry",
    name: "Chemistry closet",
    story: "A spilled beaker blocks the door. The safety poster hints at the unlock code.",
    question: "Which lab rule prevents chemical burns?",
    options: [
      "Eat snacks at the bench",
      "Wear goggles and gloves",
      "Smell chemicals directly",
      "Pour unknown liquids in the sink",
    ],
    correctIndex: 1,
    clue: "Letter C",
  },
  {
    id: "physics",
    name: "Physics hallway",
    story: "The lights flicker. A circuit diagram glows on the wall.",
    question: "What unit measures electric current?",
    options: ["Volts", "Amps", "Meters", "Joules"],
    correctIndex: 1,
    clue: "Letter I",
  },
  {
    id: "biology",
    name: "Biology greenhouse",
    story: "Plants have overgrown the keypad. A field guide lies open.",
    question: "Which organelle do plants use to capture sunlight?",
    options: ["Ribosome", "Chloroplast", "Nucleus", "Vacuole"],
    correctIndex: 1,
    clue: "Letter E",
  },
  {
    id: "exit",
    name: "Exit bay",
    story: "One final panel asks you to prove you learned something tonight.",
    question: "Science is strongest when we…",
    options: [
      "Ignore data we dislike",
      "Test ideas with evidence",
      "Copy answers from friends",
      "Skip safety steps to go faster",
    ],
    correctIndex: 1,
    clue: "Letter!",
  },
];

export type JeopardyCell = {
  category: string;
  value: number;
  question: string;
  answer: string;
  options: string[];
  correctIndex: number;
};

export const JEOPARDY_BOARD: JeopardyCell[] = [
  {
    category: "Space",
    value: 100,
    question: "This red planet is named after the Roman god of war.",
    answer: "Mars",
    options: ["Mars", "Jupiter", "Venus", "Saturn"],
    correctIndex: 0,
  },
  {
    category: "Space",
    value: 200,
    question: "Earth's natural satellite.",
    answer: "The Moon",
    options: ["Titan", "The Moon", "Io", "Europa"],
    correctIndex: 1,
  },
  {
    category: "Space",
    value: 300,
    question: "Force that keeps planets in orbit.",
    answer: "Gravity",
    options: ["Friction", "Magnetism", "Gravity", "Lift"],
    correctIndex: 2,
  },
  {
    category: "Careers",
    value: 100,
    question: "This professional designs buildings and structures.",
    answer: "Architect",
    options: ["Architect", "Archivist", "Astronomer", "Athlete"],
    correctIndex: 0,
  },
  {
    category: "Careers",
    value: 200,
    question: "They write code that powers apps and websites.",
    answer: "Software developer",
    options: ["Chef", "Software developer", "Pilot", "Plumber"],
    correctIndex: 1,
  },
  {
    category: "Careers",
    value: 300,
    question: "This role studies markets and helps companies reach customers.",
    answer: "Marketing manager",
    options: ["Lifeguard", "Librarian", "Marketing manager", "Machinist"],
    correctIndex: 2,
  },
  {
    category: "Math",
    value: 100,
    question: "How many degrees in a right angle?",
    answer: "90",
    options: ["45", "90", "180", "360"],
    correctIndex: 1,
  },
  {
    category: "Math",
    value: 200,
    question: "Pi is approximately…",
    answer: "3.14",
    options: ["2.71", "3.14", "4.20", "1.62"],
    correctIndex: 1,
  },
  {
    category: "Math",
    value: 300,
    question: "The distance around a circle is called…",
    answer: "Circumference",
    options: ["Radius", "Diameter", "Circumference", "Area"],
    correctIndex: 2,
  },
  {
    category: "Kids science",
    value: 100,
    question: "Bees carry pollen between these plant parts.",
    answer: "Flowers",
    options: ["Rocks", "Flowers", "Clouds", "Rivers"],
    correctIndex: 1,
  },
  {
    category: "Kids science",
    value: 200,
    question: "Rain falls when water in clouds becomes…",
    answer: "Heavy enough to drop",
    options: [
      "Frozen metal",
      "Heavy enough to drop",
      "Invisible ink",
      "Solid rock",
    ],
    correctIndex: 1,
  },
  {
    category: "Kids science",
    value: 300,
    question: "Dinosaurs lived in this geologic era long ago.",
    answer: "Mesozoic",
    options: ["Mesozoic", "Digital", "Modern", "Lunar"],
    correctIndex: 0,
  },
];

export type JobRole = {
  id: string;
  title: string;
  emoji: string;
  intro: string;
};

export type JobScenario = {
  prompt: string;
  options: { text: string; score: number; feedback: string }[];
};

export const JOB_ROLES: JobRole[] = [
  {
    id: "nurse",
    title: "Student nurse",
    emoji: "🩺",
    intro: "Your first clinical day on a busy hospital floor.",
  },
  {
    id: "developer",
    title: "Junior developer",
    emoji: "💻",
    intro: "Your team shipped a feature — now users are reporting bugs.",
  },
  {
    id: "teacher",
    title: "Student teacher",
    emoji: "📚",
    intro: "You are leading your first lesson with a restless class.",
  },
  {
    id: "electrician",
    title: "Apprentice electrician",
    emoji: "⚡",
    intro: "You are on site helping wire a community center renovation.",
  },
];

export const JOB_SCENARIOS: Record<string, JobScenario[]> = {
  nurse: [
    {
      prompt: "A patient looks anxious before a procedure. What do you do first?",
      options: [
        { text: "Explain the steps calmly and ask what worries them", score: 3, feedback: "Empathy builds trust — core nursing skill." },
        { text: "Tell them not to worry and walk away", score: 0, feedback: "Dismissing feelings can increase anxiety." },
        { text: "Rush them so the schedule stays on time", score: 1, feedback: "Safety and dignity come before speed." },
      ],
    },
    {
      prompt: "You notice a medication label that looks different than usual.",
      options: [
        { text: "Double-check with the nurse in charge before giving it", score: 3, feedback: "Sharp attention prevents serious errors." },
        { text: "Assume it's fine and proceed", score: 0, feedback: "Never skip verification on meds." },
        { text: "Ask the patient what they think", score: 1, feedback: "Patients matter, but protocols exist for safety." },
      ],
    },
    {
      prompt: "End of shift: a family asks many questions. You are tired.",
      options: [
        { text: "Listen, answer clearly, and hand off to the next nurse", score: 3, feedback: "Communication is part of care." },
        { text: "Snap that you are off the clock", score: 0, feedback: "Professionalism matters even when tired." },
        { text: "Ignore them and leave", score: 0, feedback: "Handoffs protect patients and families." },
      ],
    },
  ],
  developer: [
    {
      prompt: "Production is down. Where do you start?",
      options: [
        { text: "Read logs, reproduce the bug, then patch", score: 3, feedback: "Systematic debugging saves the day." },
        { text: "Push a random fix and hope", score: 0, feedback: "Guessing can make outages worse." },
        { text: "Blame another team publicly", score: 0, feedback: "Collaboration beats blame in real workplaces." },
      ],
    },
    {
      prompt: "A teammate asks for a code review before lunch.",
      options: [
        { text: "Review for clarity, tests, and security", score: 3, feedback: "Good reviews prevent future bugs." },
        { text: "Approve without reading", score: 0, feedback: "Rubber-stamping risks users and the team." },
        { text: "Refuse because it is not your code", score: 1, feedback: "Teams share ownership of quality." },
      ],
    },
    {
      prompt: "Users want a feature that could expose private data.",
      options: [
        { text: "Flag privacy risks and propose a safer design", score: 3, feedback: "Ethics are part of engineering." },
        { text: "Ship it fast to please managers", score: 0, feedback: "Shortcuts on privacy can destroy trust." },
        { text: "Quit without explaining", score: 1, feedback: "Speaking up protects users and your career." },
      ],
    },
  ],
  teacher: [
    {
      prompt: "Half the class did not do the reading.",
      options: [
        { text: "Adjust with a quick recap and pair activity", score: 3, feedback: "Flexible teaching meets students where they are." },
        { text: "Yell and cancel the lesson", score: 0, feedback: "Shame rarely improves learning." },
        { text: "Pretend nothing happened", score: 1, feedback: "Students need scaffolding to catch up." },
      ],
    },
    {
      prompt: "One student keeps interrupting with good questions.",
      options: [
        { text: "Channel their curiosity while keeping the class on track", score: 3, feedback: "Great teachers balance energy and structure." },
        { text: "Send them out every time", score: 0, feedback: "Curiosity is an asset when guided well." },
        { text: "Let them take over the whole lesson", score: 1, feedback: "Everyone deserves airtime." },
      ],
    },
    {
      prompt: "A parent emails worried their child is behind.",
      options: [
        { text: "Reply with specific strengths, gaps, and a plan", score: 3, feedback: "Clear communication builds parent partnerships." },
        { text: "Ignore the email", score: 0, feedback: "Families need transparency to support learning." },
        { text: "Forward without reading", score: 0, feedback: "Ownership matters in education." },
      ],
    },
  ],
  electrician: [
    {
      prompt: "You arrive and the panel is still live.",
      options: [
        { text: "Lock out / tag out power before touching wires", score: 3, feedback: "Safety first — always." },
        { text: "Work fast with gloves only", score: 0, feedback: "Shortcuts cause injuries and fires." },
        { text: "Ask an untrained helper to hold wires", score: 0, feedback: "Only qualified people handle live work." },
      ],
    },
    {
      prompt: "The blueprint conflicts with what you see on site.",
      options: [
        { text: "Stop and confirm with the foreman", score: 3, feedback: "Reading plans accurately prevents costly rework." },
        { text: "Guess and keep drilling", score: 0, feedback: "Assumptions are expensive on a job site." },
        { text: "Hide the mistake", score: 0, feedback: "Integrity protects crews and buildings." },
      ],
    },
    {
      prompt: "A homeowner asks you to skip grounding to save time.",
      options: [
        { text: "Explain why grounding prevents shocks and fires", score: 3, feedback: "Educating clients is part of the trade." },
        { text: "Skip it for cash under the table", score: 0, feedback: "Code exists to keep people alive." },
        { text: "Walk off the job without a word", score: 1, feedback: "Professional explanation matters." },
      ],
    },
  ],
};
