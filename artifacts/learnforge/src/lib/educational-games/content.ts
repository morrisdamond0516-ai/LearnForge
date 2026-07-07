export type TriviaItem = {
  question: string;
  options: string[];
  correctIndex: number;
  fact: string;
};

export type WordItem = {
  word: string;
  hint: string;
  fact: string;
  category: string;
};

export type MatchPair = { term: string; definition: string };

export type CapitalItem = {
  country: string;
  capital: string;
  region: string;
};

export type CareerCategory =
  | "Realistic"
  | "Investigative"
  | "Artistic"
  | "Social"
  | "Enterprising"
  | "Conventional";

export const CAREER_CATEGORY_HINTS: Record<CareerCategory, string> = {
  Realistic: "Hands-on work with tools, machines, or the outdoors",
  Investigative: "Research, analysis, science, and problem-solving",
  Artistic: "Creative expression, design, and original ideas",
  Social: "Teaching, helping, counseling, and community care",
  Enterprising: "Leading, persuading, selling, and building ventures",
  Conventional: "Organizing data, records, and dependable routines",
};

export const CAREERS_TO_SORT: { career: string; category: CareerCategory }[] = [
  { career: "Electrician", category: "Realistic" },
  { career: "Civil engineer", category: "Investigative" },
  { career: "Graphic designer", category: "Artistic" },
  { career: "School counselor", category: "Social" },
  { career: "Sales manager", category: "Enterprising" },
  { career: "Payroll specialist", category: "Conventional" },
  { career: "Veterinary technician", category: "Realistic" },
  { career: "Data scientist", category: "Investigative" },
  { career: "Film editor", category: "Artistic" },
  { career: "Registered nurse", category: "Social" },
  { career: "Startup founder", category: "Enterprising" },
  { career: "Bookkeeper", category: "Conventional" },
  { career: "Welder", category: "Realistic" },
  { career: "Biologist", category: "Investigative" },
  { career: "Musician", category: "Artistic" },
  { career: "Social worker", category: "Social" },
  { career: "Real estate agent", category: "Enterprising" },
  { career: "Office administrator", category: "Conventional" },
];

export const SCIENCE_TRIVIA: TriviaItem[] = [
  {
    question: "What gas do plants absorb from the air for photosynthesis?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
    correctIndex: 1,
    fact: "Plants use sunlight to turn carbon dioxide and water into sugar and oxygen.",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Mercury"],
    correctIndex: 1,
    fact: "Mars looks red because iron minerals on its surface have rusted.",
  },
  {
    question: "What is the chemical symbol for water?",
    options: ["O2", "H2O", "CO2", "NaCl"],
    correctIndex: 1,
    fact: "Every water molecule has two hydrogen atoms and one oxygen atom.",
  },
  {
    question: "What force keeps planets in orbit around the Sun?",
    options: ["Magnetism", "Friction", "Gravity", "Electricity"],
    correctIndex: 2,
    fact: "Gravity is the same force that pulls you toward Earth when you jump.",
  },
  {
    question: "Which organ pumps blood through the body?",
    options: ["Lungs", "Brain", "Heart", "Liver"],
    correctIndex: 2,
    fact: "A healthy adult heart beats about 60–100 times per minute at rest.",
  },
  {
    question: "What part of the cell holds genetic instructions?",
    options: ["Nucleus", "Cell wall", "Ribosome", "Vacuole"],
    correctIndex: 0,
    fact: "DNA in the nucleus tells cells how to grow and function.",
  },
  {
    question: "Sound travels fastest through which material?",
    options: ["Air", "Water", "Steel", "Vacuum"],
    correctIndex: 2,
    fact: "Sound needs particles to travel, so it cannot move through a vacuum.",
  },
  {
    question: "What type of rock forms from cooled lava or magma?",
    options: ["Sedimentary", "Metamorphic", "Igneous", "Fossil"],
    correctIndex: 2,
    fact: "Basalt and granite are common igneous rocks.",
  },
];

export const WORD_BANK: WordItem[] = [
  {
    word: "photosynthesis",
    hint: "How plants make food using sunlight",
    fact: "This process produces most of the oxygen we breathe.",
    category: "Science",
  },
  {
    word: "democracy",
    hint: "Government by the people",
    fact: "Citizens vote to choose leaders and policies.",
    category: "Civics",
  },
  {
    word: "hypothesis",
    hint: "A testable prediction in science",
    fact: "Scientists design experiments to support or reject it.",
    category: "Science",
  },
  {
    word: "entrepreneur",
    hint: "Someone who starts a business",
    fact: "Entrepreneurs take risks to solve problems for customers.",
    category: "Careers",
  },
  {
    word: "equator",
    hint: "Imaginary line around Earth's middle",
    fact: "Countries on the equator stay warm year-round.",
    category: "Geography",
  },
  {
    word: "algorithm",
    hint: "Step-by-step instructions for a task",
    fact: "Recipes and computer programs both use algorithms.",
    category: "Technology",
  },
  {
    word: "metaphor",
    hint: "A comparison without using like or as",
    fact: "Time is money is a famous metaphor.",
    category: "Language",
  },
  {
    word: "inflation",
    hint: "When prices rise over time",
    fact: "Central banks try to keep inflation steady for stable economies.",
    category: "Economics",
  },
];

export const MEMORY_PACKS: Record<string, MatchPair[]> = {
  "Math basics": [
    { term: "Numerator", definition: "Top number in a fraction" },
    { term: "Denominator", definition: "Bottom number in a fraction" },
    { term: "Perimeter", definition: "Distance around a shape" },
    { term: "Area", definition: "Space inside a flat shape" },
    { term: "Quotient", definition: "Answer to a division problem" },
    { term: "Product", definition: "Answer to a multiplication problem" },
  ],
  "Career skills": [
    { term: "Resume", definition: "Document summarizing work and education" },
    { term: "Networking", definition: "Building professional relationships" },
    { term: "Internship", definition: "Short job to learn a field" },
    { term: "Certification", definition: "Proof you met a skill standard" },
    { term: "Soft skills", definition: "Communication and teamwork abilities" },
    { term: "Portfolio", definition: "Samples that show your best work" },
  ],
  "Science lab": [
    { term: "Hypothesis", definition: "Educated guess to test" },
    { term: "Variable", definition: "Factor that can change in an experiment" },
    { term: "Control", definition: "Unchanged comparison group" },
    { term: "Microscope", definition: "Tool to see tiny objects" },
    { term: "Molecule", definition: "Two or more atoms bonded together" },
    { term: "Catalyst", definition: "Speeds a reaction without being used up" },
  ],
};

export const CAPITALS: CapitalItem[] = [
  { country: "Japan", capital: "Tokyo", region: "Asia" },
  { country: "Brazil", capital: "Brasília", region: "South America" },
  { country: "Egypt", capital: "Cairo", region: "Africa" },
  { country: "Canada", capital: "Ottawa", region: "North America" },
  { country: "Australia", capital: "Canberra", region: "Oceania" },
  { country: "Germany", capital: "Berlin", region: "Europe" },
  { country: "India", capital: "New Delhi", region: "Asia" },
  { country: "Kenya", capital: "Nairobi", region: "Africa" },
  { country: "Mexico", capital: "Mexico City", region: "North America" },
  { country: "France", capital: "Paris", region: "Europe" },
  { country: "South Korea", capital: "Seoul", region: "Asia" },
  { country: "Nigeria", capital: "Abuja", region: "Africa" },
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function scrambleWord(word: string): string {
  const letters = word.split("");
  if (letters.length < 3) return shuffle(letters).join("");
  let attempt = shuffle(letters).join("");
  let tries = 0;
  while (attempt.toLowerCase() === word.toLowerCase() && tries < 10) {
    attempt = shuffle(letters).join("");
    tries++;
  }
  return attempt;
}
