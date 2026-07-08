import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Coins,
  Heart,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GameShell } from "@/components/games/game-shell";
import { GameRewardBanner } from "@/components/games/game-reward-banner";
import { useGameReward } from "@/hooks/use-game-reward";
import {
  pickCareerDeck,
  pickQuizDeck,
  type QuizPoolQuestion,
} from "@/lib/educational-games/quiz-pool";

const QUIZ_SHOW_BEST_KEY = "learnforge-quiz-show-best";
const QUESTION_SECONDS = 15;
const QUIZ_SHOW_COUNT = 10;
const SURVIVAL_COUNT = 12;
const CAREER_CASH_COUNT = 10;

function readPersonalBest(): number {
  try {
    const v = localStorage.getItem(QUIZ_SHOW_BEST_KEY);
    return v ? Number(v) : 0;
  } catch {
    return 0;
  }
}

function savePersonalBest(score: number) {
  try {
    const prev = readPersonalBest();
    if (score > prev) localStorage.setItem(QUIZ_SHOW_BEST_KEY, String(score));
  } catch {
    /* ignore */
  }
}

function McqGrid({
  question,
  picked,
  hiddenOptions,
  onPick,
}: {
  question: QuizPoolQuestion;
  picked: number | null;
  hiddenOptions?: Set<number>;
  onPick: (i: number) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {question.options.map((opt, i) => {
        if (hiddenOptions?.has(i)) return null;
        let variant: "outline" | "default" | "destructive" = "outline";
        if (picked !== null) {
          if (i === question.correctIndex) variant = "default";
          else if (i === picked) variant = "destructive";
        }
        return (
          <Button
            key={`${opt}-${i}`}
            variant={variant}
            disabled={picked !== null}
            className="h-auto min-h-12 whitespace-normal py-3 text-left"
            onClick={() => onPick(i)}
          >
            {opt}
          </Button>
        );
      })}
    </div>
  );
}

function GameIntroCard({
  title,
  description,
  howToPlay,
  onStart,
  extra,
}: {
  title: string;
  description: string;
  howToPlay: string;
  onStart: () => void;
  extra?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          {howToPlay}
        </p>
        {extra}
        <Button onClick={onStart}>Start game</Button>
      </CardContent>
    </Card>
  );
}

export function QuizShowGame({ onBack }: { onBack: () => void }) {
  const deck = useMemo(() => pickQuizDeck(QUIZ_SHOW_COUNT), []);
  const [phase, setPhase] = useState<"intro" | "play" | "flash" | "done">("intro");
  const [qIdx, setQIdx] = useState(0);
  const [seconds, setSeconds] = useState(QUESTION_SECONDS);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [lastGain, setLastGain] = useState(0);
  const [personalBest, setPersonalBest] = useState(readPersonalBest);

  const q = deck[qIdx];
  const done = phase === "done";
  const scorePct = Math.min(100, Math.round(score / 80));
  const reward = useGameReward("quiz-show", done, scorePct);

  useEffect(() => {
    if (phase !== "play" || picked !== null) return;
    if (seconds <= 0) {
      setPicked(-1);
      setStreak(0);
      setLastGain(0);
      setPhase("flash");
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, seconds, picked]);

  useEffect(() => {
    if (phase !== "flash") return;
    const t = setTimeout(() => {
      setPicked(null);
      if (qIdx + 1 >= deck.length) {
        setPhase("done");
        savePersonalBest(score);
        setPersonalBest(readPersonalBest());
      } else {
        setQIdx((n) => n + 1);
        setSeconds(QUESTION_SECONDS);
        setPhase("play");
      }
    }, 1400);
    return () => clearTimeout(t);
  }, [phase, qIdx, deck.length, score]);

  function start() {
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setSeconds(QUESTION_SECONDS);
    setPicked(null);
    setPhase("play");
  }

  function answer(i: number) {
    if (!q || picked !== null || phase !== "play") return;
    setPicked(i);
    const correct = i === q.correctIndex;
    if (correct) {
      const timeBonus = Math.round((seconds / QUESTION_SECONDS) * 600);
      const streakBonus = streak * 75;
      const gain = 400 + timeBonus + streakBonus;
      setLastGain(gain);
      setScore((s) => s + gain);
      setStreak((s) => s + 1);
    } else {
      setLastGain(0);
      setStreak(0);
    }
    setPhase("flash");
  }

  return (
    <GameShell
      title="Quiz Show"
      subtitle="Game-show quiz — beat your personal best"
      onBack={onBack}
    >
      {phase === "intro" ? (
        <GameIntroCard
          title="Ready for the Quiz Show?"
          description="Ten questions, fifteen seconds each. Faster correct answers earn more points — like a classroom quiz game, built right here."
          howToPlay="Pick the best answer before the timer runs out. Streaks boost your score. Your personal best is saved on this device — no account needed for that."
          extra={
            personalBest > 0 ? (
              <p className="text-sm text-muted-foreground">
                <Trophy className="mr-1 inline h-4 w-4 text-amber-600" />
                Personal best: <strong>{personalBest.toLocaleString()}</strong> points
              </p>
            ) : null
          }
          onStart={start}
        />
      ) : (
        <Card className="border-amber-500/20">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <Badge variant="secondary">
                Question {Math.min(qIdx + 1, deck.length)}/{deck.length}
              </Badge>
              <span className="font-semibold tabular-nums">{score.toLocaleString()} pts</span>
              <span className="text-muted-foreground">Streak: {streak}</span>
              {q ? <Badge variant="outline">{q.subject}</Badge> : null}
            </div>

            {phase === "play" && q ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      {seconds}s left
                    </span>
                  </div>
                  <Progress value={(seconds / QUESTION_SECONDS) * 100} className="h-2" />
                </div>
                <p className="text-lg font-medium">{q.prompt}</p>
                <McqGrid question={q} picked={picked} onPick={answer} />
              </>
            ) : null}

            {phase === "flash" && q ? (
              <div className="space-y-3 text-center">
                {picked === -1 ? (
                  <p className="text-lg font-semibold text-rose-600">Time&apos;s up!</p>
                ) : picked === q.correctIndex ? (
                  <p className="text-lg font-semibold text-emerald-600">
                    <Sparkles className="mr-1 inline h-5 w-5" />
                    Correct! +{lastGain.toLocaleString()}
                  </p>
                ) : (
                  <p className="text-lg font-semibold text-rose-600">Not quite</p>
                )}
                <p className="text-sm text-muted-foreground">{q.explanation}</p>
              </div>
            ) : null}

            {done ? (
              <div className="space-y-4 text-center">
                <p className="text-2xl font-bold">{score.toLocaleString()} points</p>
                {score >= personalBest ? (
                  <p className="text-sm text-amber-600">New personal best!</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Personal best: {personalBest.toLocaleString()}
                  </p>
                )}
                <GameRewardBanner reward={reward} />
                <Button onClick={start}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Play again
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </GameShell>
  );
}

export function SurvivalRunGame({ onBack }: { onBack: () => void }) {
  const deck = useMemo(() => pickQuizDeck(SURVIVAL_COUNT), []);
  const [phase, setPhase] = useState<"intro" | "play" | "flash" | "done">("intro");
  const [qIdx, setQIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const q = deck[qIdx];
  const won = phase === "done" && lives > 0;
  const done = phase === "done";
  const scorePct = deck.length > 0 ? Math.round((correct / deck.length) * 100) : 0;
  const reward = useGameReward(
    "survival-run",
    done,
    won ? 100 : Math.max(20, scorePct),
  );

  useEffect(() => {
    if (phase !== "flash") return;
    const t = setTimeout(() => {
      setPicked(null);
      if (lives <= 0 || qIdx + 1 >= deck.length) {
        setPhase("done");
      } else {
        setQIdx((n) => n + 1);
        setPhase("play");
      }
    }, 1600);
    return () => clearTimeout(t);
  }, [phase, lives, qIdx, deck.length]);

  function start() {
    setQIdx(0);
    setLives(3);
    setCorrect(0);
    setPicked(null);
    setPhase("play");
  }

  function answer(i: number) {
    if (!q || picked !== null || phase !== "play") return;
    setPicked(i);
    const isRight = i === q.correctIndex;
    if (isRight) setCorrect((c) => c + 1);
    else setLives((l) => l - 1);
    setPhase("flash");
  }

  return (
    <GameShell
      title="Survival Run"
      subtitle="Three lives — how far can you go?"
      onBack={onBack}
    >
      {phase === "intro" ? (
        <GameIntroCard
          title="Survival Run"
          description="Answer questions to advance. Wrong answers cost a life — arcade-style review, all in-app."
          howToPlay="You start with 3 hearts. Each wrong answer removes one. Clear all 12 questions without running out of lives to win. Explanations show after every answer so you learn as you go."
          onStart={start}
        />
      ) : (
        <Card className="border-rose-500/20">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`h-6 w-6 ${
                      i < lives
                        ? "fill-rose-500 text-rose-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.min(qIdx + 1, deck.length)}/{deck.length}
              </span>
              <span className="text-sm font-medium">{correct} correct</span>
            </div>
            <Progress value={((qIdx + (phase === "flash" ? 1 : 0)) / deck.length) * 100} />

            {phase === "play" && q ? (
              <>
                <p className="text-lg font-medium">{q.prompt}</p>
                <McqGrid question={q} picked={picked} onPick={answer} />
              </>
            ) : null}

            {phase === "flash" && q ? (
              <div className="space-y-3 text-center">
                <p
                  className={`text-lg font-semibold ${
                    picked === q.correctIndex ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {picked === q.correctIndex ? "Safe!" : lives > 0 ? "Life lost!" : "Game over"}
                </p>
                <p className="text-sm text-muted-foreground">{q.explanation}</p>
              </div>
            ) : null}

            {done ? (
              <div className="space-y-4 text-center">
                <p className="text-xl font-bold">
                  {won ? "You survived!" : "Out of lives"}
                </p>
                <p className="text-muted-foreground">
                  {correct} of {deck.length} correct
                </p>
                <GameRewardBanner reward={reward} />
                <Button onClick={start}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try again
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </GameShell>
  );
}

export function CareerCashGame({ onBack }: { onBack: () => void }) {
  const deck = useMemo(() => pickCareerDeck(CAREER_CASH_COUNT), []);
  const [phase, setPhase] = useState<"intro" | "shop" | "play" | "flash" | "done">("intro");
  const [qIdx, setQIdx] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [fiftyFifty, setFiftyFifty] = useState(false);
  const [usedFifty, setUsedFifty] = useState(false);
  const [hidden, setHidden] = useState<Set<number>>(new Set());

  const q = deck[qIdx];
  const done = phase === "done";
  const maxCoins = CAREER_CASH_COUNT * 25 + 50;
  const scorePct = Math.min(100, Math.round((coins / maxCoins) * 100));
  const reward = useGameReward("career-cash", done, scorePct);

  useEffect(() => {
    if (phase !== "flash") return;
    const t = setTimeout(() => {
      setPicked(null);
      setFiftyFifty(false);
      setHidden(new Set());
      if (qIdx + 1 >= deck.length) {
        setPhase("done");
      } else {
        setQIdx((n) => n + 1);
        setPhase("shop");
      }
    }, 1400);
    return () => clearTimeout(t);
  }, [phase, qIdx, deck.length]);

  function start() {
    setQIdx(0);
    setCoins(0);
    setStreak(0);
    setPicked(null);
    setUsedFifty(false);
    setFiftyFifty(false);
    setHidden(new Set());
    setPhase("shop");
  }

  function buyFiftyFifty() {
    if (usedFifty || coins < 25 || !q) return;
    const wrong = q.options
      .map((_, i) => i)
      .filter((i) => i !== q.correctIndex);
    const toHide = wrong.sort(() => Math.random() - 0.5).slice(0, 2);
    setHidden(new Set(toHide));
    setCoins((c) => c - 25);
    setUsedFifty(true);
    setFiftyFifty(true);
    setPhase("play");
  }

  function skipShop() {
    setPhase("play");
  }

  function answer(i: number) {
    if (!q || picked !== null || phase !== "play") return;
    setPicked(i);
    const isRight = i === q.correctIndex;
    if (isRight) {
      const gain = 15 + streak * 5;
      setCoins((c) => c + gain);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
    setPhase("flash");
  }

  return (
    <GameShell
      title="Career Cash"
      subtitle="Earn coins on career questions — spend on power-ups"
      onBack={onBack}
    >
      {phase === "intro" ? (
        <GameIntroCard
          title="Career Cash"
          description="Gimkit-style career quiz: correct answers earn coins you can spend on a 50/50 power-up for the next question."
          howToPlay="Answer career and workplace questions to earn coins. Between questions, optionally buy 50/50 ($25) to hide two wrong answers once per game. All original content — stays on LearnForge."
          onStart={start}
        />
      ) : (
        <Card className="border-primary/20">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300">
                <Coins className="h-4 w-4" />
                ${coins}
              </span>
              <span className="text-muted-foreground">Streak: {streak}</span>
              <Badge variant="secondary">
                Q {Math.min(qIdx + 1, deck.length)}/{deck.length}
              </Badge>
            </div>

            {phase === "shop" && q ? (
              <div className="space-y-4 rounded-lg border border-dashed p-4">
                <p className="text-sm font-medium">Power-up shop (optional)</p>
                <p className="text-sm text-muted-foreground">Next: {q.prompt}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    disabled={usedFifty || coins < 25}
                    onClick={buyFiftyFifty}
                  >
                    50/50 — $25
                    {usedFifty ? " (used)" : ""}
                  </Button>
                  <Button onClick={skipShop}>Play without power-up</Button>
                </div>
              </div>
            ) : null}

            {phase === "play" && q ? (
              <>
                {fiftyFifty ? (
                  <p className="text-xs text-amber-600">50/50 active — two wrong answers hidden</p>
                ) : null}
                <p className="text-lg font-medium">{q.prompt}</p>
                <McqGrid
                  question={q}
                  picked={picked}
                  hiddenOptions={hidden}
                  onPick={answer}
                />
              </>
            ) : null}

            {phase === "flash" && q ? (
              <div className="space-y-3 text-center">
                <p
                  className={`text-lg font-semibold ${
                    picked === q.correctIndex ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {picked === q.correctIndex ? (
                    <span className="inline-flex items-center gap-1">
                      <Zap className="h-5 w-5" />
                      +${15 + Math.max(0, streak - 1) * 5}
                    </span>
                  ) : (
                    "No coins this time"
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{q.explanation}</p>
              </div>
            ) : null}

            {done ? (
              <div className="space-y-4 text-center">
                <p className="text-2xl font-bold">${coins} earned</p>
                <p className="text-sm text-muted-foreground">
                  Career Cash complete — keep practicing in Career Skills Lab!
                </p>
                <GameRewardBanner reward={reward} />
                <Button onClick={start}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Play again
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </GameShell>
  );
}
