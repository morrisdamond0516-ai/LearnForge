import type { CareerCategory } from "./content";

export type RiasecCode = "R" | "I" | "A" | "S" | "E" | "C";

export const RIASEC_LABELS: Record<RiasecCode, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

export const RIASEC_STATIONS: {
  code: RiasecCode;
  title: string;
  vibe: string;
  activities: { label: string; detail: string }[];
}[] = [
  {
    code: "R",
    title: "The Workshop",
    vibe: "Build, fix, and work with your hands",
    activities: [
      { label: "Repair a bicycle", detail: "Tools, grease, and a satisfying click when it rolls smooth." },
      { label: "Plant a garden bed", detail: "Soil, seeds, and watching something grow week by week." },
      { label: "Assemble furniture from a kit", detail: "Following steps until a flat box becomes something useful." },
      { label: "Operate a 3D printer", detail: "Turning a digital design into a real object layer by layer." },
    ],
  },
  {
    code: "I",
    title: "The Research Lab",
    vibe: "Ask why, test ideas, and solve puzzles",
    activities: [
      { label: "Run a science experiment", detail: "Hypothesis, data, and discovering what actually happens." },
      { label: "Debug broken code", detail: "Tracing errors until the program finally works." },
      { label: "Analyze survey results", detail: "Finding patterns hidden in numbers and charts." },
      { label: "Read deep on a topic you choose", detail: "Following curiosity until you understand the whole system." },
    ],
  },
  {
    code: "A",
    title: "The Studio",
    vibe: "Create, design, and express ideas",
    activities: [
      { label: "Design a poster or logo", detail: "Colors, layout, and making a message visually pop." },
      { label: "Write a short story or poem", detail: "Building worlds and emotions with words." },
      { label: "Perform music or drama", detail: "Sharing feeling and story with an audience." },
      { label: "Redesign a room or outfit", detail: "Imagining how space and style can feel completely new." },
    ],
  },
  {
    code: "S",
    title: "The Community Center",
    vibe: "Help people learn, heal, and grow",
    activities: [
      { label: "Tutor a younger student", detail: "Explaining ideas until someone else's face lights up." },
      { label: "Volunteer at a food drive", detail: "Organizing help so neighbors get what they need." },
      { label: "Coach a team or club", detail: "Encouraging others to improve together." },
      { label: "Listen and support a friend", detail: "Being the calm person someone trusts in a hard moment." },
    ],
  },
  {
    code: "E",
    title: "The Launch Pad",
    vibe: "Lead, persuade, and build ventures",
    activities: [
      { label: "Pitch a business idea", detail: "Convincing others your plan is worth trying." },
      { label: "Run a fundraiser", detail: "Setting goals, motivating people, and hitting the target." },
      { label: "Lead a group project", detail: "Assigning roles and keeping everyone moving forward." },
      { label: "Negotiate a deal", detail: "Finding terms both sides feel good about." },
    ],
  },
  {
    code: "C",
    title: "The Command Desk",
    vibe: "Organize, track, and keep systems running",
    activities: [
      { label: "Build a budget spreadsheet", detail: "Categories, totals, and knowing exactly where money goes." },
      { label: "File and label records", detail: "Order that lets anyone find what they need fast." },
      { label: "Schedule a complex event", detail: "Calendars, reminders, and nothing falling through the cracks." },
      { label: "Audit a checklist for quality", detail: "Spotting small errors before they become big problems." },
    ],
  },
];

export const CAREERS_BY_RIASEC: Record<RiasecCode, string[]> = {
  R: ["Electrician", "Civil engineer", "Veterinary technician", "Welder", "Chef", "Pilot"],
  I: ["Data scientist", "Biologist", "Software developer", "Pharmacist", "Economist", "Architect"],
  A: ["Graphic designer", "Film editor", "Musician", "Interior designer", "Writer", "Animator"],
  S: ["Registered nurse", "School counselor", "Social worker", "Teacher", "Therapist", "Coach"],
  E: ["Startup founder", "Sales manager", "Real estate agent", "Marketing director", "Lawyer", "Event planner"],
  C: ["Bookkeeper", "Payroll specialist", "Office administrator", "Paralegal", "Logistics coordinator", "Bank teller"],
};

export type MissionTrack = {
  id: string;
  title: string;
  emoji: string;
  intro: string;
  missions: {
    title: string;
    scenario: string;
    options: { text: string; feedback: string; points: number }[];
  }[];
};

export const MISSION_TRACKS: MissionTrack[] = [
  {
    id: "healthcare",
    title: "Healthcare Hero",
    emoji: "🏥",
    intro: "Complete three real-world healthcare missions. No medical license required — just judgment and care.",
    missions: [
      {
        title: "Morning handoff",
        scenario: "A nurse reports a patient feels dizzy after a new medication. What do you do first?",
        options: [
          { text: "Check vitals and notify the care team", feedback: "Strong start — safety first, then escalate.", points: 3 },
          { text: "Tell them to drink water and wait", feedback: "Hydration helps sometimes, but dizziness after new meds needs a professional check.", points: 1 },
          { text: "Ignore it unless they faint", feedback: "Waiting for a crisis is never the right call in healthcare.", points: 0 },
        ],
      },
      {
        title: "Calm a worried visitor",
        scenario: "A family member is shouting in the waiting area because results are delayed.",
        options: [
          { text: "Listen, acknowledge feelings, and get a clear update", feedback: "Empathy plus information defuses most situations.", points: 3 },
          { text: "Tell them to lower their voice or leave", feedback: "Rules matter, but leading with empathy works better.", points: 1 },
          { text: "Walk away — not your problem", feedback: "Healthcare teams share responsibility for the whole environment.", points: 0 },
        ],
      },
      {
        title: "Infection control",
        scenario: "You enter a room where gloves weren't disposed of properly.",
        options: [
          { text: "Dispose safely, sanitize, and remind the team", feedback: "You protected patients and reinforced standards.", points: 3 },
          { text: "Mention it at the end of shift", feedback: "Delays increase risk — act when you see it.", points: 1 },
          { text: "Skip it if the patient looks fine", feedback: "Infection control isn't optional.", points: 0 },
        ],
      },
    ],
  },
  {
    id: "technology",
    title: "Tech Builder",
    emoji: "💻",
    intro: "Three missions from the world of software and IT. Think like a builder who ships reliable products.",
    missions: [
      {
        title: "Bug report lands",
        scenario: "Users can't log in after an update. The team chat is blowing up.",
        options: [
          { text: "Reproduce the bug, check recent changes, roll back if needed", feedback: "Classic triage — reproduce, isolate, fix fast.", points: 3 },
          { text: "Tell users to clear cache and hope", feedback: "Sometimes helps, but you need root-cause analysis first.", points: 1 },
          { text: "Wait until more reports come in", feedback: "Outages need immediate ownership.", points: 0 },
        ],
      },
      {
        title: "Feature deadline",
        scenario: "A feature is 80% done but untested. Launch is tomorrow.",
        options: [
          { text: "Ship a smaller tested slice and communicate the plan", feedback: "Reliable beats flashy — stakeholders respect honesty.", points: 3 },
          { text: "Push untested code to hit the date", feedback: "Technical debt and angry users cost more than a delay.", points: 0 },
          { text: "Cancel silently", feedback: "Communication is part of the job.", points: 1 },
        ],
      },
      {
        title: "Security alert",
        scenario: "A dependency has a known security vulnerability.",
        options: [
          { text: "Patch, test, deploy, and document", feedback: "Security work is unglamorous and essential.", points: 3 },
          { text: "Add it to next month's backlog", feedback: "Known vulnerabilities shouldn't wait.", points: 0 },
          { text: "Disable the feature entirely without telling anyone", feedback: "Fix or communicate — don't hide.", points: 1 },
        ],
      },
    ],
  },
  {
    id: "trades",
    title: "Skilled Trades Pro",
    emoji: "🔧",
    intro: "Electricians, welders, and builders solve physical problems under pressure. Try three job-site decisions.",
    missions: [
      {
        title: "Safety first",
        scenario: "You're asked to skip grounding on a panel to save time.",
        options: [
          { text: "Refuse — grounding is non-negotiable", feedback: "Codes exist because shortcuts kill.", points: 3 },
          { text: "Do it but plan to fix it later", feedback: "Later never comes fast enough on live systems.", points: 0 },
          { text: "Ask a senior tech to sign off", feedback: "Better than silent compliance, but the right answer is still no.", points: 1 },
        ],
      },
      {
        title: "Wrong part delivered",
        scenario: "The client is on-site but your main material is the wrong size.",
        options: [
          { text: "Explain delay, reorder, and propose a safe interim plan", feedback: "Pros manage expectations and keep sites safe.", points: 3 },
          { text: "Force-fit the wrong part", feedback: "Fit-for-purpose beats fast-and-wrong.", points: 0 },
          { text: "Blame the supplier and leave", feedback: "Ownership builds reputation.", points: 0 },
        ],
      },
      {
        title: "Apprentice question",
        scenario: "A new apprentice asks why we measure twice.",
        options: [
          { text: "Explain waste, safety, and pride in craft", feedback: "Teaching culture is how trades stay excellent.", points: 3 },
          { text: "Say 'because I said so'", feedback: "Works once, doesn't build thinkers.", points: 1 },
          { text: "Ignore them — busy day", feedback: "Every master was once an apprentice.", points: 0 },
        ],
      },
    ],
  },
  {
    id: "business",
    title: "Business Leader",
    emoji: "📈",
    intro: "Lead teams, serve customers, and grow ideas. Three decisions every entrepreneur faces.",
    missions: [
      {
        title: "Unhappy customer",
        scenario: "A loyal customer says your product missed expectations.",
        options: [
          { text: "Listen, apologize, fix it, and follow up", feedback: "Recovery can deepen loyalty more than a perfect first try.", points: 3 },
          { text: "Offer a discount and move on", feedback: "Money without understanding feels hollow.", points: 1 },
          { text: "Blame their misunderstanding", feedback: "Markets don't reward defensiveness.", points: 0 },
        ],
      },
      {
        title: "Team conflict",
        scenario: "Two teammates disagree loudly about project direction.",
        options: [
          { text: "Facilitate: goals, facts, then decide together", feedback: "Leaders align people before tasks.", points: 3 },
          { text: "Pick a side to end the argument", feedback: "Speedy, but someone disengages.", points: 1 },
          { text: "Let them fight it out", feedback: "Conflict left alone becomes culture.", points: 0 },
        ],
      },
      {
        title: "Cash is tight",
        scenario: "Payroll is due and sales dipped this month.",
        options: [
          { text: "Cut optional spend, chase receivables, communicate early", feedback: "Transparency and discipline beat panic.", points: 3 },
          { text: "Delay paying vendors without notice", feedback: "Trust is harder to rebuild than revenue.", points: 0 },
          { text: "Borrow without a repayment plan", feedback: "Debt without a plan is a trap.", points: 1 },
        ],
      },
    ],
  },
];

export type PathQuestion = {
  prompt: string;
  options: { label: string; weights: Partial<Record<CareerCategory, number>> }[];
};

export const PATH_QUESTIONS: PathQuestion[] = [
  {
    prompt: "Which school subject do you look forward to most?",
    options: [
      { label: "Shop, PE, or anything hands-on", weights: { Realistic: 3 } },
      { label: "Science or math puzzles", weights: { Investigative: 3 } },
      { label: "Art, music, or creative writing", weights: { Artistic: 3 } },
      { label: "Helping classmates or group projects", weights: { Social: 3 } },
    ],
  },
  {
    prompt: "Your ideal Saturday looks like…",
    options: [
      { label: "Building or fixing something", weights: { Realistic: 2, Investigative: 1 } },
      { label: "Reading or learning something new online", weights: { Investigative: 3 } },
      { label: "Creating content or performing", weights: { Artistic: 3 } },
      { label: "Hanging out and supporting friends", weights: { Social: 3 } },
    ],
  },
  {
    prompt: "In a group project you usually…",
    options: [
      { label: "Handle the practical build or demo", weights: { Realistic: 3 } },
      { label: "Research and check the facts", weights: { Investigative: 3 } },
      { label: "Design slides, video, or the pitch story", weights: { Artistic: 2, Enterprising: 1 } },
      { label: "Make sure everyone feels included", weights: { Social: 3 } },
    ],
  },
  {
    prompt: "Which reward motivates you most?",
    options: [
      { label: "Seeing a finished physical result", weights: { Realistic: 3 } },
      { label: "Cracking a hard problem", weights: { Investigative: 3 } },
      { label: "Hearing 'that was amazing'", weights: { Artistic: 2, Enterprising: 1 } },
      { label: "Knowing you helped someone succeed", weights: { Social: 3 } },
    ],
  },
  {
    prompt: "Would you rather work…",
    options: [
      { label: "Outdoors or in the field", weights: { Realistic: 3 } },
      { label: "In a lab or with data", weights: { Investigative: 3 } },
      { label: "In a creative studio", weights: { Artistic: 3 } },
      { label: "With people all day", weights: { Social: 2, Enterprising: 1 } },
    ],
  },
  {
    prompt: "Pick a superpower for your career:",
    options: [
      { label: "Perfect hand-eye skill", weights: { Realistic: 3 } },
      { label: "Instant deep understanding", weights: { Investigative: 3 } },
      { label: "Endless creative ideas", weights: { Artistic: 3 } },
      { label: "Inspiring any crowd", weights: { Enterprising: 3 } },
    ],
  },
  {
    prompt: "Which task sounds fun?",
    options: [
      { label: "Organizing files and schedules", weights: { Conventional: 3 } },
      { label: "Selling an idea you believe in", weights: { Enterprising: 3 } },
      { label: "Teaching a skill step-by-step", weights: { Social: 2, Conventional: 1 } },
      { label: "Optimizing a process to save time", weights: { Conventional: 2, Investigative: 1 } },
    ],
  },
  {
    prompt: "After high school you're most curious about…",
    options: [
      { label: "Trade school or apprenticeships", weights: { Realistic: 3 } },
      { label: "STEM degree or research", weights: { Investigative: 3 } },
      { label: "Portfolio-based creative fields", weights: { Artistic: 3 } },
      { label: "Business, leadership, or entrepreneurship", weights: { Enterprising: 3 } },
    ],
  },
];

export const PATH_CAREER_PROFILES: Record<
  CareerCategory,
  { careers: string[]; study: string; blurb: string }
> = {
  Realistic: {
    careers: ["Electrician", "Welder", "Civil engineer", "Chef", "Pilot"],
    study: "Trade certifications, apprenticeships, or engineering tech programs",
    blurb: "You thrive when work has tangible results and clear craftsmanship.",
  },
  Investigative: {
    careers: ["Data scientist", "Biologist", "Pharmacist", "Software developer", "Economist"],
    study: "STEM degrees, research labs, or self-driven technical certifications",
    blurb: "You're energized by questions, evidence, and solving complex puzzles.",
  },
  Artistic: {
    careers: ["Graphic designer", "Musician", "Writer", "Film editor", "Interior designer"],
    study: "Portfolio programs, fine arts, media production, or design schools",
    blurb: "You need room to invent, express, and make ideas visible.",
  },
  Social: {
    careers: ["Teacher", "Registered nurse", "Counselor", "Social worker", "Coach"],
    study: "Education, nursing, psychology, or human services pathways",
    blurb: "People growth and community impact drive your best work.",
  },
  Enterprising: {
    careers: ["Entrepreneur", "Sales manager", "Lawyer", "Marketing director", "Event planner"],
    study: "Business, communications, law, or leadership programs",
    blurb: "You light up when persuading, leading, and building opportunities.",
  },
  Conventional: {
    careers: ["Accountant", "Paralegal", "Logistics coordinator", "Office administrator", "Bank teller"],
    study: "Business admin, finance certificates, or structured vocational programs",
    blurb: "Reliable systems, accuracy, and order make you indispensable.",
  },
};

export type FactItem = {
  statement: string;
  isFact: boolean;
  explanation: string;
  subject: string;
};

export const FACT_OR_FICTION: FactItem[] = [
  {
    statement: "Lightning never strikes the same place twice.",
    isFact: false,
    explanation: "Tall structures can be hit many times — the Empire State Building is struck often.",
    subject: "Science",
  },
  {
    statement: "Octopuses have three hearts.",
    isFact: true,
    explanation: "Two pump blood to the gills; one pumps it to the rest of the body.",
    subject: "Biology",
  },
  {
    statement: "The Great Wall of China is visible from the Moon with the naked eye.",
    isFact: false,
    explanation: "Astronauts confirm it's not visible from lunar distance without aid.",
    subject: "Geography",
  },
  {
    statement: "Practice interviews improve real job performance.",
    isFact: true,
    explanation: "Rehearsal reduces anxiety and helps you tell clearer stories about your skills.",
    subject: "Careers",
  },
  {
    statement: "All squares are rectangles.",
    isFact: true,
    explanation: "A square has four right angles and parallel sides — that meets the rectangle definition.",
    subject: "Math",
  },
  {
    statement: "Humans use only 10% of their brain.",
    isFact: false,
    explanation: "Brain scans show we use virtually all regions, just not all at once.",
    subject: "Science",
  },
  {
    statement: "Apprenticeships can lead to six-figure skilled trade careers.",
    isFact: true,
    explanation: "Many electricians, welders, and technicians earn strong wages without a four-year degree.",
    subject: "Careers",
  },
  {
    statement: "Water boils at 100°C at every altitude.",
    isFact: false,
    explanation: "Lower air pressure on mountains lowers the boiling point.",
    subject: "Physics",
  },
  {
    statement: "Reading aloud helps younger children build vocabulary.",
    isFact: true,
    explanation: "Hearing rich language speeds word learning and comprehension.",
    subject: "Learning",
  },
  {
    statement: "Bats are blind.",
    isFact: false,
    explanation: "Most bats see fine; many also use echolocation to navigate.",
    subject: "Biology",
  },
];

export type StepPuzzle = {
  title: string;
  subject: string;
  steps: string[];
};

export const STEP_PUZZLES: StepPuzzle[] = [
  {
    title: "Photosynthesis",
    subject: "Science",
    steps: [
      "Plants absorb sunlight in their leaves",
      "Chlorophyll converts light energy",
      "Carbon dioxide enters through stomata",
      "Water splits and releases oxygen",
      "Sugar is produced for the plant to use",
    ],
  },
  {
    title: "Landing your first job",
    subject: "Careers",
    steps: [
      "Identify roles that match your skills",
      "Tailor your resume to each posting",
      "Apply and track your submissions",
      "Prepare stories for common interview questions",
      "Follow up professionally after interviews",
    ],
  },
  {
    title: "Scientific method",
    subject: "Science",
    steps: [
      "Observe something interesting",
      "Ask a clear question",
      "Form a testable hypothesis",
      "Run a controlled experiment",
      "Analyze data and draw conclusions",
    ],
  },
  {
    title: "Starting a small business",
    subject: "Careers",
    steps: [
      "Validate that people want your idea",
      "Calculate basic costs and pricing",
      "Register and meet legal requirements",
      "Launch a simple version to real customers",
      "Improve based on feedback and sales",
    ],
  },
];

export type LightningQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  subject: string;
};

export const LIGHTNING_QUESTIONS: LightningQuestion[] = [
  { prompt: "7 × 9 = ?", options: ["56", "63", "72", "54"], correctIndex: 1, subject: "Math" },
  { prompt: "Capital of Japan?", options: ["Seoul", "Beijing", "Tokyo", "Bangkok"], correctIndex: 2, subject: "Geography" },
  { prompt: "H₂O is…", options: ["Salt", "Water", "Oxygen", "Hydrogen"], correctIndex: 1, subject: "Science" },
  { prompt: "RIASEC helps match…", options: ["Sports teams", "Career interests", "Movie genres", "Food recipes"], correctIndex: 1, subject: "Careers" },
  { prompt: "Synonym for 'happy'?", options: ["Gloomy", "Joyful", "Angry", "Tired"], correctIndex: 1, subject: "Vocabulary" },
  { prompt: "How many continents?", options: ["5", "6", "7", "8"], correctIndex: 2, subject: "Geography" },
  { prompt: "15 + 28 = ?", options: ["41", "43", "42", "44"], correctIndex: 1, subject: "Math" },
  { prompt: "Largest organ in the human body?", options: ["Heart", "Liver", "Skin", "Brain"], correctIndex: 2, subject: "Science" },
  { prompt: "A person who starts a company is a(n)…", options: ["Entrepreneur", "Librarian", "Geologist", "Historian"], correctIndex: 0, subject: "Careers" },
  { prompt: "144 ÷ 12 = ?", options: ["11", "12", "14", "10"], correctIndex: 1, subject: "Math" },
  { prompt: "Which is a renewable energy source?", options: ["Coal", "Solar", "Oil", "Natural gas"], correctIndex: 1, subject: "Science" },
  { prompt: "Capital of France?", options: ["Rome", "Paris", "Madrid", "Berlin"], correctIndex: 1, subject: "Geography" },
];
