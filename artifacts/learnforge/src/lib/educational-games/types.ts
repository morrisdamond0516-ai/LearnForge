export type AgeBand = "kids" | "teens" | "adults" | "all";

export type GameSubject =
  | "math"
  | "vocabulary"
  | "science"
  | "geography"
  | "careers"
  | "logic"
  | "mixed";

export type BuiltInGameId =
  | "math-sprint"
  | "word-scramble"
  | "memory-match"
  | "career-sorter"
  | "science-trivia"
  | "geography-capitals"
  | "boss-battle"
  | "career-quest"
  | "lab-escape"
  | "jeopardy-arena"
  | "day-on-the-job";

export type GameDepth = "quick" | "featured";

export type BuiltInGame = {
  id: BuiltInGameId;
  title: string;
  description: string;
  subjects: GameSubject[];
  ages: AgeBand[];
  duration: string;
  skills: string[];
  depth: GameDepth;
  hook: string;
};

export type ExternalResource = {
  name: string;
  url: string;
  description: string;
  subjects: GameSubject[];
  ages: AgeBand[];
  free: true;
};
