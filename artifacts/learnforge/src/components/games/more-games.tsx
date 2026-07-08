import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw, Timer, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GameShell } from "@/components/games/game-shell";
import { GameRewardBanner } from "@/components/games/game-reward-banner";
import { useGameReward } from "@/hooks/use-game-reward";
import {
  FACT_OR_FICTION,
  LIGHTNING_QUESTIONS,
  STEP_PUZZLES,
} from "@/lib/educational-games/extended-content";
import { shuffle } from "@/lib/educational-games/content";

export function FactOrFictionGame({ onBack }: { onBack: () => void }) {
  const deck = useMemo(() => shuffle(FACT_OR_FICTION), []);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const finished = idx >= deck.length;
  const item = deck[idx];
  const reward = useGameReward(
    "fact-or-fiction",
    finished,
    deck.length > 0 ? Math.round((score / deck.length) * 100) : 0,
  );

  function answer(guess: boolean) {
    if (!item || picked !== null) return;
    setPicked(guess);
    if (guess === item.isFact) setScore((s) => s + 1);
    setTimeout(() => {
      setPicked(null);
      setIdx((i) => i + 1);
    }, 1600);
  }

  if (finished) {
    return (
      <GameShell title="Fact or Fiction" onBack={onBack}>
        <Card>
          <CardContent className="space-y-4 p-10 text-center">
            <p className="text-xl font-semibold">
              {score} of {deck.length} correct
            </p>
            <GameRewardBanner reward={reward} />
            <Button
              onClick={() => {
                setIdx(0);
                setScore(0);
                setPicked(null);
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

  if (!item) return null;

  return (
    <GameShell
      title="Fact or Fiction"
      subtitle={`${idx + 1}/${deck.length} · ${item.subject}`}
      onBack={onBack}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl leading-snug">
            {item.statement}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {picked !== null ? (
            <p
              className={`rounded-lg p-3 text-sm ${
                picked === item.isFact
                  ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                  : "bg-rose-500/10 text-rose-800 dark:text-rose-200"
              }`}
            >
              {item.isFact ? "Fact!" : "Fiction!"} {item.explanation}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button
                size="lg"
                variant="outline"
                className="h-16"
                onClick={() => answer(true)}
              >
                <Check className="mr-2 h-5 w-5 text-emerald-600" />
                Fact
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-16"
                onClick={() => answer(false)}
              >
                <X className="mr-2 h-5 w-5 text-rose-600" />
                Fiction
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </GameShell>
  );
}

export function StepSorterGame({ onBack }: { onBack: () => void }) {
  const puzzles = useMemo(() => shuffle(STEP_PUZZLES), []);
  const [pIdx, setPIdx] = useState(0);
  const [order, setOrder] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const finished = pIdx >= puzzles.length;
  const puzzle = puzzles[pIdx];

  useEffect(() => {
    if (!puzzle) return;
    const indices = puzzle.steps.map((_, i) => i);
    setOrder(shuffle(indices));
    setChecked(false);
  }, [puzzle, pIdx]);

  const reward = useGameReward(
    "step-sorter",
    finished,
    puzzles.length > 0 ? Math.round((score / puzzles.length) * 100) : 0,
  );

  function move(i: number, dir: -1 | 1) {
    if (checked) return;
    setOrder((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function submit() {
    if (!puzzle || checked) return;
    const correct = order.every((stepIdx, pos) => stepIdx === pos);
    if (correct) setScore((s) => s + 1);
    setChecked(true);
    setTimeout(() => setPIdx((p) => p + 1), correct ? 1200 : 2200);
  }

  if (finished) {
    return (
      <GameShell title="Step Sorter" onBack={onBack}>
        <Card>
          <CardContent className="space-y-4 p-10 text-center">
            <p className="text-xl font-semibold">
              {score} of {puzzles.length} sequences perfect
            </p>
            <GameRewardBanner reward={reward} />
            <Button onClick={() => { setPIdx(0); setScore(0); }}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Play again
            </Button>
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  if (!puzzle) return null;

  const allCorrect = checked && order.every((stepIdx, pos) => stepIdx === pos);

  return (
    <GameShell
      title="Step Sorter"
      subtitle={`${puzzle.title} · ${pIdx + 1}/${puzzles.length}`}
      onBack={onBack}
    >
      <Card>
        <CardHeader>
          <CardTitle>Put the steps in order</CardTitle>
          <CardDescription>
            Use the arrows to reorder. {puzzle.subject} process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {order.map((stepIdx, i) => {
            const isRight = checked && stepIdx === i;
            const isWrong = checked && stepIdx !== i;
            return (
              <div
                key={`${stepIdx}-${i}`}
                className={`flex items-center gap-2 rounded-lg border p-2 ${
                  isRight
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : isWrong
                      ? "border-rose-500/50 bg-rose-500/10"
                      : "border-border"
                }`}
              >
                <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm">{puzzle.steps[stepIdx]}</span>
                {!checked ? (
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => move(i, -1)}>
                      ↑
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => move(i, 1)}>
                      ↓
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
          {checked && !allCorrect ? (
            <p className="text-sm text-muted-foreground">
              Correct order: {puzzle.steps.map((s, i) => `${i + 1}. ${s}`).join(" → ")}
            </p>
          ) : null}
          <Button className="w-full mt-2" disabled={checked} onClick={submit}>
            Check order
          </Button>
        </CardContent>
      </Card>
    </GameShell>
  );
}

export function LightningQuizGame({ onBack }: { onBack: () => void }) {
  const deck = useMemo(() => shuffle(LIGHTNING_QUESTIONS), []);
  const [seconds, setSeconds] = useState(60);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const q = deck[qIdx % deck.length];
  const reward = useGameReward("lightning-quiz", done, Math.min(100, score * 4));

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
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setPicked(null);
    setDone(false);
    setRunning(true);
  }

  function answer(i: number) {
    if (!q || picked !== null || !running) return;
    setPicked(i);
    const correct = i === q.correctIndex;
    if (correct) {
      const bonus = Math.min(streak, 5);
      setScore((s) => s + 10 + bonus);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
    setTimeout(() => {
      setPicked(null);
      setQIdx((n) => n + 1);
    }, 600);
  }

  return (
    <GameShell title="Lightning Quiz" subtitle="60-second streak challenge" onBack={onBack}>
      {!running && !done ? (
        <Card>
          <CardHeader>
            <CardTitle>Ready for lightning round?</CardTitle>
            <CardDescription>
              Fast questions across math, science, careers, and geography.
              Streaks boost your score — like a classroom quiz game, built in-house.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={start}>Start round</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap justify-between gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {seconds}s
              </span>
              <span>Score: {score}</span>
              <span>Streak: {streak}</span>
              {q ? <Badge variant="secondary">{q.subject}</Badge> : null}
            </div>
            {done ? (
              <div className="space-y-4 text-center">
                <p className="text-2xl font-semibold">Time!</p>
                <p className="text-muted-foreground">Final score: {score}</p>
                <GameRewardBanner reward={reward} />
                <Button onClick={start}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Play again
                </Button>
              </div>
            ) : q ? (
              <>
                <p className="text-lg font-medium">{q.prompt}</p>
                <div className="grid gap-2 sm:grid-cols-2">
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
                        disabled={picked !== null}
                        onClick={() => answer(i)}
                      >
                        <Zap className="mr-2 h-4 w-4 shrink-0" />
                        {opt}
                      </Button>
                    );
                  })}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      )}
    </GameShell>
  );
}
