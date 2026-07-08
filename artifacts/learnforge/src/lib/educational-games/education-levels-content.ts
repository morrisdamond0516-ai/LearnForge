import type { EducationLevelSlug } from "./education-levels-catalog";
import type { SkillGameContent } from "./skill-game-types";

export const EDUCATION_LEVEL_CONTENT: Record<EducationLevelSlug, SkillGameContent> = {
  kindergarten: {
    pairs: [
      { term: "A", definition: "Apple 🍎" },
      { term: "B", definition: "Ball ⚽" },
      { term: "Red", definition: "Color of a stop sign" },
      { term: "Blue", definition: "Color of the sky" },
      { term: "1", definition: "One finger" },
      { term: "2", definition: "Two eyes" },
    ],
  },
  "grade-1": {
    pairs: [
      { term: "the", definition: "A common small word in sentences" },
      { term: "and", definition: "Joins two things together" },
      { term: "cat", definition: "A furry pet that meows" },
      { term: "run", definition: "Move fast on your feet" },
      { term: "big", definition: "Opposite of small" },
      { term: "sun", definition: "Bright star in our sky" },
    ],
  },
  "grade-2": {
    math: [
      {
        prompt: "23 + 15 = ?",
        options: ["37", "38", "39", "28"],
        correctIndex: 1,
        explanation: "23 + 15 = 38.",
      },
      {
        prompt: "50 − 18 = ?",
        options: ["32", "42", "28", "31"],
        correctIndex: 0,
        explanation: "50 − 18 = 32.",
      },
      {
        prompt: "Maria has 14 stickers. She gets 9 more. Total?",
        options: ["21", "23", "24", "25"],
        correctIndex: 1,
        explanation: "14 + 9 = 23 stickers.",
      },
      {
        prompt: "A rope is 40 cm. You cut off 12 cm. Left?",
        options: ["28 cm", "32 cm", "52 cm", "26 cm"],
        correctIndex: 0,
        explanation: "40 − 12 = 28 cm.",
      },
    ],
  },
  "grade-3": {
    math: [
      {
        prompt: "7 × 8 = ?",
        options: ["54", "56", "58", "48"],
        correctIndex: 1,
        explanation: "7 × 8 = 56.",
      },
      {
        prompt: "48 ÷ 6 = ?",
        options: ["6", "7", "8", "9"],
        correctIndex: 2,
        explanation: "48 ÷ 6 = 8.",
      },
      {
        prompt: "4 bags with 6 apples each. Total apples?",
        options: ["10", "20", "24", "26"],
        correctIndex: 2,
        explanation: "4 × 6 = 24 apples.",
      },
      {
        prompt: "35 students split into 5 equal teams. Each team?",
        options: ["5", "6", "7", "8"],
        correctIndex: 2,
        explanation: "35 ÷ 5 = 7 students per team.",
      },
    ],
  },
  "grade-4": {
    sequence: [
      "Pick one main idea",
      "Write a topic sentence",
      "Add supporting details",
      "Use a closing sentence",
      "Revise for spelling and clarity",
    ],
  },
  "grade-5": {
    math: [
      {
        prompt: "1/2 + 1/4 = ?",
        options: ["1/6", "2/6", "3/4", "2/4"],
        correctIndex: 2,
        explanation: "1/2 = 2/4, so 2/4 + 1/4 = 3/4.",
      },
      {
        prompt: "Which is larger: 0.7 or 0.65?",
        options: ["0.7", "0.65", "They are equal", "Cannot tell"],
        correctIndex: 0,
        explanation: "0.7 = 0.70, which is greater than 0.65.",
      },
      {
        prompt: "A pizza has 8 slices. You eat 3. What fraction is left?",
        options: ["3/8", "5/8", "1/2", "3/5"],
        correctIndex: 1,
        explanation: "8 − 3 = 5 slices left → 5/8.",
      },
      {
        prompt: "Convert 3/4 to a decimal.",
        options: ["0.34", "0.75", "0.43", "1.33"],
        correctIndex: 1,
        explanation: "3 ÷ 4 = 0.75.",
      },
    ],
  },
  "grade-6": {
    pairs: [
      { term: "Plate tectonics", definition: "Earth's crust moves in large slabs" },
      { term: "Photosynthesis", definition: "Plants make sugar using sunlight" },
      { term: "Water cycle", definition: "Evaporation, condensation, precipitation" },
      { term: "Ecosystem", definition: "Living and nonliving things interacting" },
      { term: "Weather", definition: "Short-term atmosphere conditions" },
      { term: "Climate", definition: "Long-term weather patterns in a region" },
    ],
  },
  "grade-7": {
    math: [
      {
        prompt: "A map scale is 1 inch = 5 miles. 3 inches = ? miles",
        options: ["8", "15", "10", "20"],
        correctIndex: 1,
        explanation: "3 × 5 = 15 miles.",
      },
      {
        prompt: "Store price: 40% off $50. Sale price?",
        options: ["$20", "$25", "$30", "$35"],
        correctIndex: 2,
        explanation: "40% of 50 = 20 off → $30.",
      },
      {
        prompt: "Recipe ratio 2 cups flour : 3 cups sugar. For 6 cups flour, sugar?",
        options: ["6", "7", "8", "9"],
        correctIndex: 3,
        explanation: "Flour tripled (×3), so sugar 3×3 = 9.",
      },
      {
        prompt: "Unit rate: 240 miles in 4 hours. Miles per hour?",
        options: ["50", "55", "60", "65"],
        correctIndex: 2,
        explanation: "240 ÷ 4 = 60 mph.",
      },
    ],
  },
  "grade-8": {
    sequence: [
      "State a testable hypothesis",
      "List materials and safety rules",
      "Follow procedure and collect data",
      "Organize results in a table or graph",
      "Write conclusion using evidence",
      "Suggest improvements for next time",
    ],
  },
  "grade-9": {
    math: [
      {
        prompt: "Solve for x: 2x + 5 = 17",
        options: ["5", "6", "7", "8"],
        correctIndex: 1,
        explanation: "2x = 12 → x = 6.",
      },
      {
        prompt: "Slope of y = 3x − 4?",
        options: ["−4", "3", "4", "−3"],
        correctIndex: 1,
        explanation: "In y = mx + b, m = 3.",
      },
      {
        prompt: "Translate: 'five less than twice a number is 13' → 2n − 5 = 13. n = ?",
        options: ["7", "8", "9", "10"],
        correctIndex: 2,
        explanation: "2n = 18 → n = 9.",
      },
      {
        prompt: "Which is a solution to x + y = 10 and x − y = 2?",
        options: ["(4, 6)", "(6, 4)", "(5, 5)", "(8, 2)"],
        correctIndex: 1,
        explanation: "x = 6, y = 4 satisfies both.",
      },
    ],
  },
  "grade-10": {
    script: [
      {
        prompt: "You find a blog post with no author listed for a history paper.",
        options: [
          { text: "Skip it — find a peer-reviewed or credited source", feedback: "Strong research habits start with credible sources.", points: 3 },
          { text: "Use it without citing since there is no author", feedback: "Uncredited sources still need evaluation and citation.", points: 0 },
          { text: "Copy a paragraph and change a few words", feedback: "That is plagiarism even with edits.", points: 0 },
        ],
      },
      {
        prompt: "A .gov statistics page conflicts with a random forum post.",
        options: [
          { text: "Trust the .gov data and cite it properly", feedback: "Government data is usually primary and reliable.", points: 3 },
          { text: "Use whichever supports your opinion", feedback: "Cherry-picking weakens your argument.", points: 0 },
          { text: "Blend both without telling the reader", feedback: "Transparency matters in research.", points: 0 },
        ],
      },
      {
        prompt: "You want to quote three lines from a poem in your essay.",
        options: [
          { text: "Use quotation marks and cite the poem and author", feedback: "Short quotes still require attribution.", points: 3 },
          { text: "Paste them — poems are common knowledge", feedback: "Creative works always need citation.", points: 0 },
          { text: "Summarize without credit since it's only three lines", feedback: "Ideas and wording from sources need credit.", points: 1 },
        ],
      },
    ],
  },
  "grade-11": {
    math: [
      {
        prompt: "Solve x² − 9 = 0",
        options: ["x = 3 only", "x = −3 only", "x = 3 or −3", "x = 9"],
        correctIndex: 2,
        explanation: "x² = 9 → x = ±3.",
      },
      {
        prompt: "Area of circle radius 3? (Use π ≈ 3.14)",
        options: ["18.84", "28.26", "9.42", "37.68"],
        correctIndex: 1,
        explanation: "πr² = 3.14 × 9 ≈ 28.26.",
      },
      {
        prompt: "f(x) = 2x + 1. What is f(4)?",
        options: ["7", "8", "9", "10"],
        correctIndex: 2,
        explanation: "2(4) + 1 = 9.",
      },
      {
        prompt: "Right triangle legs 3 and 4. Hypotenuse?",
        options: ["5", "6", "7", "12"],
        correctIndex: 0,
        explanation: "3-4-5 Pythagorean triple.",
      },
    ],
  },
  "grade-12": {
    sequence: [
      "List target schools and deadlines",
      "Request transcripts and recommendation letters",
      "Complete FAFSA and scholarship applications",
      "Draft and revise personal statement or essays",
      "Submit applications before each deadline",
      "Compare acceptances and financial aid offers",
    ],
  },
  college: {
    typing: [
      { text: "According to Smith (2024), climate data shows a measurable trend.", context: "In-text citation practice" },
      { text: "The hypothesis was not supported by the experimental results.", context: "Lab report sentence" },
      { text: "Furthermore, the literature suggests multiple causal factors.", context: "Academic transition word" },
      { text: "References should follow the style guide assigned by your professor.", context: "Citation reminder" },
      { text: "Office hours are an underused resource for clarifying lecture material.", context: "Study skills note" },
    ],
  },
  "trade-school": {
    math: [
      {
        prompt: "Your tape reads 5 feet and 7 inches. How many total inches is that?",
        options: ["57 in", "60 in", "67 in", "72 in"],
        correctIndex: 2,
        explanation: "5 × 12 = 60, plus 7 = 67 inches.",
      },
      {
        prompt: "Which is longer?",
        options: ["3/8 inch", "1/4 inch", "They are equal", "Cannot tell"],
        correctIndex: 0,
        explanation: "3/8 = 0.375 in, which is bigger than 1/4 = 0.25 in.",
      },
      {
        prompt: "You cut one piece at 2' 6\" and another at 1' 10\". Total lumber used?",
        options: ["4' 2\"", "4' 4\"", "4' 6\"", "3' 16\""],
        correctIndex: 1,
        explanation: "2'6\" + 1'10\" = 3'16\" = 4'4\".",
      },
      {
        prompt: "An 8-foot wall gets studs every 16 inches on center (including both ends). How many studs?",
        options: ["5", "6", "7", "8"],
        correctIndex: 2,
        explanation: "8 ft = 96 in. 96 ÷ 16 = 6 spaces → 7 studs (one at each end).",
      },
      {
        prompt: "Blueprint says cut at 3' 9\". Your board is 4' 0\". How much do you trim off?",
        options: ["2\"", "3\"", "4\"", "5\""],
        correctIndex: 1,
        explanation: "4'0\" − 3'9\" = 48\" − 45\" = 3 inches.",
      },
      {
        prompt: "Two runs of conduit: 18 inches and 2 feet 4 inches. Combined length?",
        options: ["40 in", "42 in", "44 in", "46 in"],
        correctIndex: 3,
        explanation: "18 + (2×12 + 4) = 18 + 28 = 46 inches.",
      },
    ],
  },
  "trade-school-vocabulary": {
    pairs: [
      { term: "Tape measure", definition: "Reads length in feet and inches" },
      { term: "1/16 inch", definition: "Common smallest mark on imperial rulers" },
      { term: "Level", definition: "Checks if a surface is horizontal" },
      { term: "PPE", definition: "Personal protective equipment" },
      { term: "16 inches on center", definition: "Standard wall stud spacing" },
      { term: "Bevel", definition: "An angled cut, not square" },
    ],
  },
};
