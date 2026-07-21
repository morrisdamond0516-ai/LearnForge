import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, RotateCcw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CAPITALS,
  CAREERS_TO_SORT,
  CAREER_CATEGORY_HINTS,
  MEMORY_PACKS,
  SCIENCE_TRIVIA,
  WORD_BANK,
  scrambleWord,
  shuffle,
  type CareerCategory,
} from "@/lib/educational-games/content";
import type { BuiltInGameId } from "@/lib/educational-games/types";
import {
  BossBattleGame,
  CareerQuestGame,
  DayOnTheJobGame,
  JeopardyArenaGame,
  LabEscapeGame,
} from "@/components/games/deep-games";
import {
  CareerMatchPartyGame,
  FuturePathFinderGame,
  SkillsMissionGame,
} from "@/components/games/career-games";
import { CareerSkillsLab } from "@/components/games/career-skills-lab";
import { EducationSkillsLab } from "@/components/games/education-skills-lab";
import { SubjectSimulationsLab } from "@/components/games/subject-sims-lab";
import {
  getCareerSkillBySlug,
  type CareerSkillSlug,
} from "@/lib/educational-games/career-skills-catalog";
import {
  getEducationLevelBySlug,
  type EducationLevelSlug,
} from "@/lib/educational-games/education-levels-catalog";
import {
  getSubjectSimBySlug,
  type SubjectSimSlug,
} from "@/lib/educational-games/subject-sims-catalog";
import {
  FactOrFictionGame,
  LightningQuizGame,
  StepSorterGame,
} from "@/components/games/more-games";
import {
  CareerCashGame,
  QuizShowGame,
  SurvivalRunGame,
} from "@/components/games/popular-games";
import { GameShell } from "@/components/games/game-shell";
import { GameRewardBanner } from "@/components/games/game-reward-banner";
import { useGameReward } from "@/hooks/use-game-reward";
type MathOp = "+" | "-" | "×" | "÷";

function makeMathProblem(difficulty: "easy" | "medium" | "hard") {
  const ops: MathOp[] =
    difficulty === "easy"
      ? ["+", "-"]
      : difficulty === "medium"
        ? ["+", "-", "×"]
        : ["+", "-", "×", "÷"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = 0;
  let b = 0;
  let answer = 0;

  if (op === "+") {
    const max = difficulty === "easy" ? 20 : difficulty === "medium" ? 50 : 99;
    a = Math.floor(Math.random() * max) + 1;
    b = Math.floor(Math.random() * max) + 1;
    answer = a + b;
  } else if (op === "-") {
    const max = difficulty === "easy" ? 20 : difficulty === "medium" ? 50 : 99;
    a = Math.floor(Math.random() * max) + 5;
    b = Math.floor(Math.random() * a);
    answer = a - b;
  } else if (op === "×") {
    const max = difficulty === "hard" ? 12 : 10;
    a = Math.floor(Math.random() * max) + 1;
    b = Math.floor(Math.random() * max) + 1;
    answer = a * b;
  } else {
    b = Math.floor(Math.random() * 9) + 2;
    answer = Math.floor(Math.random() * 12) + 1;
    a = b * answer;
  }

  return { text: `${a} ${op} ${b}`, answer };
}

export function MathSprintGame({ onBack }: { onBack: () => void }) {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy",
  );
  const [seconds, setSeconds] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [input, setInput] = useState("");
  const [problem, setProblem] = useState(() => makeMathProblem("easy"));
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const reward = useGameReward(
    "math-sprint",
    done,
    Math.min(100, score * 3),
  );

  useEffect(() => {
    if (!running || done) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setDone(true);
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, done]);

  function start() {
    setSeconds(60);
    setScore(0);
    setStreak(0);
    setInput("");
    setProblem(makeMathProblem(difficulty));
    setDone(false);
    setRunning(true);
  }

  function submit() {
    const val = Number(input.trim());
    if (!Number.isFinite(val)) return;
    if (val === problem.answer) {
      const bonus = Math.min(streak, 5);
      setScore((s) => s + 10 + bonus);
      setStreak((s) => s + 1);
      setSeconds((s) => s + 2);
    } else {
      setStreak(0);
    }
    setInput("");
    setProblem(makeMathProblem(difficulty));
  }

  return (
    <GameShell title="Math Sprint" subtitle="60-second mental math challenge" onBack={onBack}>
      {!running && !done ? (
        <Card>
          <CardHeader>
            <CardTitle>Choose difficulty</CardTitle>
            <CardDescription>
              Correct answers add 2 bonus seconds. Streaks increase your score.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Level</label>
              <Select
                value={difficulty}
                onValueChange={(v) =>
                  setDifficulty(v as "easy" | "medium" | "hard")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (add & subtract)</SelectItem>
                  <SelectItem value="medium">Medium (+ multiply)</SelectItem>
                  <SelectItem value="hard">Hard (all four operations)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={start}>Start sprint</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-6 p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {seconds}s
              </span>
              <span>Score: {score}</span>
              <span>Streak: {streak}</span>
            </div>
            {done ? (
              <div className="text-center space-y-4">
                <p className="text-2xl font-semibold">Time is up!</p>
                <p className="text-muted-foreground">Final score: {score}</p>
                <GameRewardBanner reward={reward} />
                <Button onClick={start}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Play again
                </Button>
              </div>
            ) : (
              <>
                <p className="text-center text-4xl font-bold tracking-tight">
                  {problem.text} = ?
                </p>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                  }}
                >
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Your answer"
                    autoFocus
                  />
                  <Button type="submit">Go</Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </GameShell>
  );
}

export function WordScrambleGame({ onBack }: { onBack: () => void }) {
  const deck = useMemo(() => shuffle(WORD_BANK), []);
  const [idx, setIdx] = useState(0);
  const [guess, setGuess] = useState("");
  const [scrambled, setScrambled] = useState(() => scrambleWord(deck[0].word));
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const item = deck[idx];
  const finished = idx >= deck.length;
  const reward = useGameReward(
    "word-scramble",
    finished,
    deck.length > 0 ? Math.round((score / deck.length) * 100) : 0,
  );

  function nextWord(correct: boolean) {
    if (correct) setScore((s) => s + 1);
    const next = idx + 1;
    if (next >= deck.length) {
      setIdx(deck.length);
      return;
    }
    setIdx(next);
    setGuess("");
    setRevealed(false);
    setScrambled(scrambleWord(deck[next].word));
  }

  if (finished) {
    return (
      <GameShell title="Word Scramble" onBack={onBack}>
        <Card>
          <CardContent className="space-y-4 p-10 text-center">
            <p className="text-xl font-semibold">
              You solved {score} of {deck.length} words
            </p>
            <GameRewardBanner reward={reward} />
            <Button
              onClick={() => {
                setIdx(0);
                setScore(0);
                setGuess("");
                setRevealed(false);
                setScrambled(scrambleWord(deck[0].word));
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Play again
            </Button>
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Word Scramble"
      subtitle={`Word ${idx + 1} of ${deck.length} · ${item.category}`}
      onBack={onBack}
    >
      <Card>
        <CardContent className="space-y-6 p-8">
          <p className="text-center text-3xl font-bold tracking-widest uppercase">
            {scrambled}
          </p>
          <p className="text-center text-sm text-muted-foreground">{item.hint}</p>
          {revealed ? (
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <p className="font-medium text-foreground">{item.word}</p>
              <p className="mt-1 text-muted-foreground">{item.fact}</p>
            </div>
          ) : (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const ok =
                  guess.trim().toLowerCase() === item.word.toLowerCase();
                if (ok) {
                  setRevealed(true);
                  setTimeout(() => nextWord(true), 1400);
                } else {
                  setGuess("");
                }
              }}
            >
              <Input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Unscramble the word"
                autoFocus
              />
              <Button type="submit">Check</Button>
            </form>
          )}
          <Button variant="ghost" size="sm" onClick={() => nextWord(false)}>
            Skip word
          </Button>
        </CardContent>
      </Card>
    </GameShell>
  );
}

type MemoryTile = {
  id: string;
  pairId: number;
  text: string;
  side: "term" | "def";
};

export function MemoryMatchGame({ onBack }: { onBack: () => void }) {
  const [pack, setPack] = useState<string>("Math basics");
  const [resetKey, setResetKey] = useState(0);
  const round = useMemo(() => {
    const pairs = MEMORY_PACKS[pack] ?? MEMORY_PACKS["Math basics"];
    const picked = shuffle(pairs).slice(0, Math.min(6, pairs.length));
    const tiles: MemoryTile[] = [];
    picked.forEach((p, i) => {
      tiles.push({ id: `t${i}`, pairId: i, text: p.term, side: "term" });
      tiles.push({ id: `d${i}`, pairId: i, text: p.definition, side: "def" });
    });
    return { tiles: shuffle(tiles), total: picked.length, key: `${pack}-${resetKey}` };
  }, [pack, resetKey]);

  const [selected, setSelected] = useState<MemoryTile | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);

  function pick(tile: MemoryTile) {
    if (matched.has(tile.pairId) || tile.id === selected?.id) return;
    if (!selected) {
      setSelected(tile);
      return;
    }
    setMoves((m) => m + 1);
    if (selected.pairId === tile.pairId && selected.side !== tile.side) {
      setMatched((prev) => new Set(prev).add(tile.pairId));
      setSelected(null);
    } else {
      setTimeout(() => setSelected(null), 500);
    }
  }

  const done = matched.size === round.total;
  const moveEfficiency =
    round.total > 0 ? Math.round((round.total / Math.max(moves, round.total)) * 100) : 0;
  const reward = useGameReward("memory-match", done, moveEfficiency);

  return (
    <GameShell
      title="Memory Match"
      subtitle={`${matched.size}/${round.total} pairs · ${moves} moves`}
      onBack={onBack}
    >
      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <span className="text-sm font-medium">Topic pack</span>
          <Select value={pack} onValueChange={setPack}>
            <SelectTrigger className="sm:max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(MEMORY_PACKS).map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {done ? (
        <Card>
          <CardContent className="space-y-4 p-10 text-center">
            <Check className="mx-auto h-10 w-10 text-emerald-600" />
            <p className="text-xl font-semibold">All matched in {moves} moves</p>
            <GameRewardBanner reward={reward} />
            <Button onClick={() => { setMatched(new Set()); setMoves(0); setSelected(null); setResetKey((k) => k + 1); }}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Play again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" key={round.key}>
          {round.tiles.map((tile) => {
            const isMatched = matched.has(tile.pairId);
            const isSelected = selected?.id === tile.id;
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => pick(tile)}
                disabled={isMatched}
                className={`min-h-24 rounded-xl border p-3 text-sm font-medium transition ${
                  isMatched
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800"
                    : isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/40"
                }`}
              >
                {isMatched || isSelected ? tile.text : "?"}
              </button>
            );
          })}
        </div>
      )}
    </GameShell>
  );
}

export function CareerSorterGame({ onBack }: { onBack: () => void }) {
  const [queue, setQueue] = useState(() => shuffle(CAREERS_TO_SORT));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const current = queue[index];
  const categories = Object.keys(CAREER_CATEGORY_HINTS) as CareerCategory[];
  const finished = !current || index >= queue.length;
  const reward = useGameReward(
    "career-sorter",
    finished,
    queue.length > 0 ? Math.round((score / queue.length) * 100) : 0,
  );

  function pick(category: CareerCategory) {
    if (!current || feedback) return;
    const correct = category === current.category;
    if (correct) setScore((s) => s + 1);
    setFeedback(
      correct
        ? `Correct — ${current.career} fits ${category}.`
        : `${current.career} is ${current.category}. ${CAREER_CATEGORY_HINTS[current.category]}`,
    );
    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= queue.length) {
        setIndex(queue.length);
      } else {
        setIndex((i) => i + 1);
      }
    }, 1200);
  }

  if (finished) {
    return (
      <GameShell title="Career Sorter" onBack={onBack}>
        <Card>
          <CardContent className="space-y-4 p-10 text-center">
            <p className="text-xl font-semibold">
              {score} of {queue.length} sorted correctly
            </p>
            <GameRewardBanner reward={reward} />
            <Button
              onClick={() => {
                setQueue(shuffle(CAREERS_TO_SORT));
                setIndex(0);
                setScore(0);
                setFeedback(null);
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Play again
            </Button>
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Career Sorter"
      subtitle={`${index + 1} of ${queue.length}`}
      onBack={onBack}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">{current.career}</CardTitle>
          <CardDescription className="text-center">
            Which Holland career type fits this job best?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {feedback ? (
            <p className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
              {feedback}
            </p>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant="outline"
                className="h-auto min-h-14 whitespace-normal py-3 text-left"
                onClick={() => pick(cat)}
                disabled={!!feedback}
              >
                <span className="font-semibold">{cat}</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {CAREER_CATEGORY_HINTS[cat]}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </GameShell>
  );
}

export function ScienceTriviaGame({ onBack }: { onBack: () => void }) {
  const deck = useMemo(() => shuffle(SCIENCE_TRIVIA), []);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const q = deck[idx];
  const finished = idx >= deck.length;
  const reward = useGameReward(
    "science-trivia",
    finished,
    deck.length > 0 ? Math.round((score / deck.length) * 100) : 0,
  );

  if (finished) {
    return (
      <GameShell title="Science Trivia" onBack={onBack}>
        <Card>
          <CardContent className="space-y-4 p-10 text-center">
            <p className="text-xl font-semibold">
              {score} of {deck.length} correct
            </p>
            <GameRewardBanner reward={reward} />
            <Button onClick={() => { setIdx(0); setScore(0); setPicked(null); }}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Play again
            </Button>
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Science Trivia"
      subtitle={`Question ${idx + 1} of ${deck.length}`}
      onBack={onBack}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-snug">{q.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {q.options.map((opt, i) => {
            let variant: "outline" | "default" | "destructive" = "outline";
            if (picked !== null) {
              if (i === q.correctIndex) variant = "default";
              else if (i === picked) variant = "destructive";
            }
            return (
              <Button
                key={opt}
                variant={variant}
                className="h-auto w-full justify-start whitespace-normal py-3"
                disabled={picked !== null}
                onClick={() => {
                  setPicked(i);
                  if (i === q.correctIndex) setScore((s) => s + 1);
                  setTimeout(() => {
                    setPicked(null);
                    setIdx((n) => n + 1);
                  }, 1500);
                }}
              >
                {opt}
              </Button>
            );
          })}
          {picked !== null ? (
            <p className="text-sm text-muted-foreground">{q.fact}</p>
          ) : null}
        </CardContent>
      </Card>
    </GameShell>
  );
}

export function GeographyCapitalsGame({ onBack }: { onBack: () => void }) {
  const deck = useMemo(() => shuffle(CAPITALS), []);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);

  const item = deck[idx];
  const finished = !item || idx >= deck.length;
  const reward = useGameReward(
    "geography-capitals",
    finished,
    deck.length > 0 ? Math.round((score / deck.length) * 100) : 0,
  );

  useEffect(() => {
    if (!item) return;
    const wrong = shuffle(
      CAPITALS.filter((c) => c.country !== item.country).map((c) => c.capital),
    ).slice(0, 3);
    setOptions(shuffle([item.capital, ...wrong]));
    setPicked(null);
  }, [item, idx]);

  if (finished) {
    return (
      <GameShell title="Capital Challenge" onBack={onBack}>
        <Card>
          <CardContent className="space-y-4 p-10 text-center">
            <p className="text-xl font-semibold">
              {score} of {deck.length} correct
            </p>
            <GameRewardBanner reward={reward} />
            <Button onClick={() => { setIdx(0); setScore(0); }}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Play again
            </Button>
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Capital Challenge"
      subtitle={`${item.region} · ${idx + 1}/${deck.length}`}
      onBack={onBack}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">{item.country}</CardTitle>
          <CardDescription className="text-center">
            What is the capital city?
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {options.map((opt) => {
            const correct = opt === item.capital;
            let variant: "outline" | "default" | "destructive" = "outline";
            if (picked) {
              if (correct) variant = "default";
              else if (opt === picked) variant = "destructive";
            }
            return (
              <Button
                key={opt}
                variant={variant}
                disabled={!!picked}
                onClick={() => {
                  setPicked(opt);
                  if (correct) setScore((s) => s + 1);
                  setTimeout(() => setIdx((i) => i + 1), 900);
                }}
              >
                {opt}
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </GameShell>
  );
}

export function BuiltInGamePlayer({
  gameId,
  onBack,
  careerSlug,
  subjectSlug,
  levelSlug,
  moduleId,
  fromCurriculum,
}: {
  gameId: BuiltInGameId;
  onBack: () => void;
  /** When opening Career Skills Lab from a curriculum link. */
  careerSlug?: string | null;
  /** When opening Subject Simulations from a curriculum link. */
  subjectSlug?: string | null;
  /** When opening School Skills Lab from a curriculum link. */
  levelSlug?: string | null;
  /** Specific lab module within a multi-lab career track. */
  moduleId?: string | null;
  /** Subject name from the curriculum plan that opened this lab, if any. */
  fromCurriculum?: string | null;
}) {
  switch (gameId) {
    case "math-sprint":
      return <MathSprintGame onBack={onBack} />;
    case "word-scramble":
      return <WordScrambleGame onBack={onBack} />;
    case "memory-match":
      return <MemoryMatchGame onBack={onBack} />;
    case "career-sorter":
      return <CareerSorterGame onBack={onBack} />;
    case "science-trivia":
      return <ScienceTriviaGame onBack={onBack} />;
    case "geography-capitals":
      return <GeographyCapitalsGame onBack={onBack} />;
    case "boss-battle":
      return <BossBattleGame onBack={onBack} />;
    case "career-quest":
      return <CareerQuestGame onBack={onBack} />;
    case "lab-escape":
      return <LabEscapeGame onBack={onBack} />;
    case "jeopardy-arena":
      return <JeopardyArenaGame onBack={onBack} />;
    case "day-on-the-job":
      return <DayOnTheJobGame onBack={onBack} />;
    case "career-match-party":
      return <CareerMatchPartyGame onBack={onBack} />;
    case "skills-missions":
      return <SkillsMissionGame onBack={onBack} />;
    case "future-path-finder":
      return <FuturePathFinderGame onBack={onBack} />;
    case "fact-or-fiction":
      return <FactOrFictionGame onBack={onBack} />;
    case "step-sorter":
      return <StepSorterGame onBack={onBack} />;
    case "lightning-quiz":
      return <LightningQuizGame onBack={onBack} />;
    case "quiz-show":
      return <QuizShowGame onBack={onBack} />;
    case "survival-run":
      return <SurvivalRunGame onBack={onBack} />;
    case "career-cash":
      return <CareerCashGame onBack={onBack} />;
    case "career-skills-lab":
      return (
        <CareerSkillsLab
          onBack={onBack}
          initialSlug={
            careerSlug && getCareerSkillBySlug(careerSlug)
              ? (careerSlug as CareerSkillSlug)
              : null
          }
          initialModuleId={moduleId}
          fromCurriculum={fromCurriculum}
        />
      );
    case "education-skills-lab":
      return (
        <EducationSkillsLab
          onBack={onBack}
          initialSlug={
            levelSlug && getEducationLevelBySlug(levelSlug)
              ? (levelSlug as EducationLevelSlug)
              : null
          }
        />
      );
    case "subject-simulations-lab":
      return (
        <SubjectSimulationsLab
          onBack={onBack}
          initialSlug={
            subjectSlug && getSubjectSimBySlug(subjectSlug)
              ? (subjectSlug as SubjectSimSlug)
              : null
          }
        />
      );
    default:
      return null;
  }
}
