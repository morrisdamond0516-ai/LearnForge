import { useEffect, useMemo, useState } from "react";
import { Check, Code2, Keyboard, RotateCcw, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { GameRewardBanner } from "@/components/games/game-reward-banner";
import { useGameReward } from "@/hooks/use-game-reward";
import { shuffle } from "@/lib/educational-games/content";
import type {
  CodeChallenge,
  MathScenario,
  ScriptScenario,
  SkillGameContent,
  SkillGameType,
  TypingPhrase,
} from "@/lib/educational-games/skill-game-types";
import {
  getSkillGameFormatSummary,
  isWorkspaceLab,
  SKILL_GAME_TYPE_INSTRUCTIONS,
  SKILL_GAME_TYPE_LABELS,
} from "@/lib/educational-games/skill-game-types";
import { useLabModuleFlow } from "@/components/games/lab-module-flow-context";
import {
  IntakeFormWorkspacePlayer,
  JobsiteWorkspacePlayer,
  LabBenchWorkspacePlayer,
  ManipulativeBoardPlayer,
  PatientChartWorkspacePlayer,
  SimCanvasWorkspacePlayer,
  SpreadsheetWorkspacePlayer,
  TerminalWorkspacePlayer,
  HelpdeskTicketQueuePlayer,
} from "@/components/games/simulation-workspace-engines";

function normalizeTyping(s: string) {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

export function SkillGameRenderer({
  gameId,
  gameType,
  content,
  title,
  description,
  hideIntro = false,
}: {
  gameId: string;
  gameType: SkillGameType;
  content: SkillGameContent;
  title: string;
  description?: string;
  hideIntro?: boolean;
}) {
  const formatSummary = getSkillGameFormatSummary(gameType, content);

  return (
    <div className="space-y-4">
      {!hideIntro ? (
        <SkillGameIntro
          gameType={gameType}
          description={description}
          formatSummary={formatSummary}
        />
      ) : null}
      {gameType === "script-choice" && content.script ? (
        <ScriptChoicePlayer gameId={gameId} scenarios={content.script} />
      ) : gameType === "math-scenario" && content.math ? (
        <MathScenarioPlayer gameId={gameId} problems={content.math} />
      ) : gameType === "match-pairs" && content.pairs ? (
        <MatchPairsPlayer gameId={gameId} pairs={content.pairs} />
      ) : gameType === "sequence-build" && content.sequence ? (
        <SequenceBuildPlayer gameId={gameId} steps={content.sequence} title={title} />
      ) : gameType === "typing-drill" && content.typing ? (
        <TypingDrillPlayer gameId={gameId} phrases={content.typing} />
      ) : gameType === "code-trace" && content.code ? (
        <CodeAndBuildPlayer
          gameId={gameId}
          code={content.code}
          pcBuild={content.pcBuild ?? []}
          codeSubtitle={content.codePhaseSubtitle}
          buildTitle={content.buildPhaseTitle}
          buildSubtitle={content.buildPhaseSubtitle}
          finishTitle={content.finishTitle}
        />
      ) : gameType === "spreadsheet-workspace" && content.spreadsheet ? (
        <SpreadsheetWorkspacePlayer gameId={gameId} data={content.spreadsheet} />
      ) : gameType === "terminal-workspace" && content.terminal ? (
        <TerminalWorkspacePlayer gameId={gameId} data={content.terminal} />
      ) : gameType === "patient-chart-workspace" && content.patientChart ? (
        <PatientChartWorkspacePlayer gameId={gameId} data={content.patientChart} />
      ) : gameType === "jobsite-workspace" && content.jobsite ? (
        <JobsiteWorkspacePlayer gameId={gameId} data={content.jobsite} />
      ) : gameType === "sim-canvas-workspace" && content.simCanvas ? (
        <SimCanvasWorkspacePlayer gameId={gameId} data={content.simCanvas} />
      ) : gameType === "lab-bench-workspace" && content.labBench ? (
        <LabBenchWorkspacePlayer gameId={gameId} data={content.labBench} />
      ) : gameType === "manipulative-board" && content.manipulative ? (
        <ManipulativeBoardPlayer gameId={gameId} data={content.manipulative} />
      ) : gameType === "intake-form-workspace" && content.intakeForm ? (
        <IntakeFormWorkspacePlayer gameId={gameId} data={content.intakeForm} />
      ) : gameType === "helpdesk-ticket-queue" && content.helpdeskQueue ? (
        <HelpdeskTicketQueuePlayer gameId={gameId} data={content.helpdeskQueue} />
      ) : (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base">Lab content unavailable</CardTitle>
            <CardDescription>
              This lab could not load its practice content. Go back and pick another
              lab, or refresh the page.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

function SkillGameIntro({
  gameType,
  description,
  formatSummary,
}: {
  gameType: SkillGameType;
  description?: string;
  formatSummary: string;
}) {
  return (
    <Card className="border-muted bg-muted/30">
      <CardContent className="space-y-2 p-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          {isWorkspaceLab(gameType) ? (
            <Badge className="bg-primary/90">Hands-on lab workspace</Badge>
          ) : (
            <Badge variant="outline">Scenario drill (quiz-style)</Badge>
          )}
          <Badge variant="secondary">{SKILL_GAME_TYPE_LABELS[gameType]}</Badge>
          <span className="text-xs text-muted-foreground">{formatSummary}</span>
        </div>
        {!isWorkspaceLab(gameType) ? (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            This module uses multiple-choice scenarios. For full job practice, complete
            the hands-on workspace labs in this track first; save quizzes for Curriculum
            practice after the lab.
          </p>
        ) : null}
        {description ? (
          <p className="font-medium text-foreground">{description}</p>
        ) : null}
        <p className="text-muted-foreground">{SKILL_GAME_TYPE_INSTRUCTIONS[gameType]}</p>
      </CardContent>
    </Card>
  );
}

function ScriptChoicePlayer({
  gameId,
  scenarios,
}: {
  gameId: string;
  scenarios: ScriptScenario[];
}) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const max = scenarios.length * 3;
  const reward = useGameReward(gameId, done, Math.round((score / max) * 100));
  const scene = scenarios[idx];

  function pick(i: number) {
    if (!scene || feedback) return;
    const opt = scene.options[i];
    setScore((s) => s + opt.points);
    setFeedback(opt.feedback);
    setTimeout(() => {
      setFeedback(null);
      if (idx + 1 >= scenarios.length) setDone(true);
      else setIdx((n) => n + 1);
    }, 1400);
  }

  if (done) {
    return (
      <FinishCard
        reward={reward}
        title={`Score: ${score} / ${max}`}
        onRetry={() => {
          setIdx(0);
          setScore(0);
          setDone(false);
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          Scenario {idx + 1}/{scenarios.length}
        </CardDescription>
        <CardTitle className="text-lg">{scene.prompt}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {feedback ? (
          <p className="rounded-lg bg-muted/50 p-3 text-sm">{feedback}</p>
        ) : null}
        {scene.options.map((opt, i) => (
          <Button
            key={opt.text}
            variant="outline"
            className="h-auto w-full justify-start whitespace-normal py-3 text-left"
            disabled={!!feedback}
            onClick={() => pick(i)}
          >
            {opt.text}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

function MathScenarioPlayer({
  gameId,
  problems,
}: {
  gameId: string;
  problems: MathScenario[];
}) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const done = idx >= problems.length;
  const q = problems[idx];
  const reward = useGameReward(
    gameId,
    done,
    problems.length > 0 ? Math.round((score / problems.length) * 100) : 0,
  );

  if (done) {
    return (
      <FinishCard
        reward={reward}
        title={`${score} of ${problems.length} correct`}
        onRetry={() => {
          setIdx(0);
          setScore(0);
          setPicked(null);
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          Problem {idx + 1}/{problems.length}
        </CardDescription>
        <CardTitle className="text-base leading-relaxed">{q.prompt}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
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
              onClick={() => {
                setPicked(i);
                if (i === q.correctIndex) setScore((s) => s + 1);
                setTimeout(() => {
                  setPicked(null);
                  setIdx((n) => n + 1);
                }, 1200);
              }}
            >
              {opt}
            </Button>
          );
        })}
        {picked !== null ? (
          <p className="col-span-full text-sm text-muted-foreground">{q.explanation}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function MatchPairsPlayer({
  gameId,
  pairs,
}: {
  gameId: string;
  pairs: { term: string; definition: string }[];
}) {
  type Tile = { id: string; pairId: number; text: string; side: "term" | "def" };
  const [roundKey, setRoundKey] = useState(0);
  const tiles = useMemo(() => {
    const t: Tile[] = [];
    pairs.forEach((p, i) => {
      t.push({ id: `t${i}`, pairId: i, text: p.term, side: "term" });
      t.push({ id: `d${i}`, pairId: i, text: p.definition, side: "def" });
    });
    return shuffle(t);
  }, [pairs, roundKey]);

  const [selected, setSelected] = useState<Tile | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const done = matched.size === pairs.length;
  const efficiency =
    pairs.length > 0 ? Math.round((pairs.length / Math.max(moves, pairs.length)) * 100) : 0;
  const reward = useGameReward(gameId, done, Math.min(100, efficiency + (done ? 20 : 0)));

  function pick(tile: Tile) {
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

  if (done) {
    return (
      <FinishCard
        reward={reward}
        title={`All ${pairs.length} pairs matched in ${moves} moves`}
        onRetry={() => {
          setMatched(new Set());
          setMoves(0);
          setSelected(null);
          setRoundKey((k) => k + 1);
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {tiles.map((tile) => {
        const isMatched = matched.has(tile.pairId);
        const isSelected = selected?.id === tile.id;
        return (
          <button
            key={tile.id}
            type="button"
            onClick={() => pick(tile)}
            disabled={isMatched}
            className={`min-h-20 rounded-xl border p-2 text-left text-sm transition ${
              isMatched
                ? "border-emerald-500/40 bg-emerald-500/10"
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
  );
}

function SequenceBuildPlayer({
  gameId,
  steps,
  title,
}: {
  gameId: string;
  steps: string[];
  title: string;
}) {
  const [order, setOrder] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const correct = order.every((stepIdx, pos) => stepIdx === pos);
  const reward = useGameReward(gameId, done, done && correct ? 100 : done ? 60 : 0);

  useEffect(() => {
    setOrder(shuffle(steps.map((_, i) => i)));
    setChecked(false);
    setDone(false);
  }, [steps]);

  function move(i: number, dir: -1 | 1) {
    if (checked) return;
    setChecked(false);
    setOrder((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function submit() {
    setChecked(true);
    setAttempts((a) => a + 1);
    if (correct) setTimeout(() => setDone(true), 800);
  }

  if (done) {
    return (
      <FinishCard
        reward={reward}
        title="Perfect sequence!"
        onRetry={() => {
          setOrder(shuffle(steps.map((_, i) => i)));
          setChecked(false);
          setDone(false);
          setAttempts(0);
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wrench className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>Put the steps in order using the arrows.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {order.map((stepIdx, i) => (
          <div key={`${stepIdx}-${i}`} className="flex items-center gap-2 rounded-lg border p-2">
            <span className="w-6 text-center font-bold text-muted-foreground">{i + 1}</span>
            <span className="flex-1 text-sm">{steps[stepIdx]}</span>
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
        ))}
        {checked && !correct ? (
          <p className="text-sm text-muted-foreground">
            Not quite — try again ({attempts} attempt{attempts === 1 ? "" : "s"}).
          </p>
        ) : null}
        <Button className="w-full" onClick={submit} disabled={checked && correct}>
          {checked && !correct ? "Reorder and check again" : "Check order"}
        </Button>
        {checked && !correct ? (
          <Button variant="outline" className="w-full" onClick={() => setChecked(false)}>
            Keep trying
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TypingDrillPlayer({
  gameId,
  phrases,
}: {
  gameId: string;
  phrases: TypingPhrase[];
}) {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const phrase = phrases[idx];
  const reward = useGameReward(
    gameId,
    done,
    phrases.length > 0 ? Math.round((score / phrases.length) * 100) : 0,
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!phrase) return;
    if (normalizeTyping(input) === normalizeTyping(phrase.text)) {
      setScore((s) => s + 1);
    }
    if (idx + 1 >= phrases.length) setDone(true);
    else {
      setIdx((i) => i + 1);
      setInput("");
    }
  }

  if (done) {
    return (
      <FinishCard
        reward={reward}
        title={`${score} of ${phrases.length} typed perfectly`}
        onRetry={() => {
          setIdx(0);
          setInput("");
          setScore(0);
          setDone(false);
        }}
      />
    );
  }

  if (!phrase) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Keyboard className="h-5 w-5" />
          Type exactly — {idx + 1}/{phrases.length}
        </CardTitle>
        <CardDescription>{phrase.context}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="rounded-lg bg-muted/50 p-3 font-mono text-sm">{phrase.text}</p>
        <form onSubmit={submit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type here…"
            autoFocus
            className="font-mono"
          />
          <Button type="submit">Check</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CodeAndBuildPlayer({
  gameId,
  code,
  pcBuild,
  codeSubtitle = "IT support thinking",
  buildTitle = "PC Build Lab",
  buildSubtitle = "Order the assembly steps for a first-time POST.",
  finishTitle,
}: {
  gameId: string;
  code: CodeChallenge[];
  pcBuild: string[];
  codeSubtitle?: string;
  buildTitle?: string;
  buildSubtitle?: string;
  finishTitle?: string;
}) {
  const [phase, setPhase] = useState<"code" | "build">("code");
  const [codeIdx, setCodeIdx] = useState(0);
  const [codeScore, setCodeScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [buildChecked, setBuildChecked] = useState(false);
  const [done, setDone] = useState(false);

  const challenge = code[codeIdx];
  const buildCorrect = order.length > 0 && order.every((stepIdx, pos) => stepIdx === pos);
  const totalParts = code.length + (pcBuild.length > 0 ? 1 : 0);
  const scorePct = done
    ? Math.round(
        ((codeScore + (pcBuild.length === 0 || buildCorrect ? 1 : 0)) /
          Math.max(totalParts, 1)) *
          100,
      )
    : 0;
  const reward = useGameReward(gameId, done, scorePct);

  useEffect(() => {
    if (pcBuild.length) setOrder(shuffle(pcBuild.map((_, i) => i)));
  }, [pcBuild]);

  function answerCode(i: number) {
    if (!challenge || picked !== null) return;
    setPicked(i);
    if (i === challenge.correctIndex) setCodeScore((s) => s + 1);
    setTimeout(() => {
      setPicked(null);
      if (codeIdx + 1 >= code.length) {
        if (pcBuild.length) setPhase("build");
        else setDone(true);
      } else setCodeIdx((n) => n + 1);
    }, 1200);
  }

  function moveBuild(i: number, dir: -1 | 1) {
    if (buildChecked) return;
    setOrder((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  if (done) {
    return (
      <FinishCard
        reward={reward}
        title={finishTitle ?? `Lab complete — ${scorePct}%`}
        onRetry={() => {
          setPhase("code");
          setCodeIdx(0);
          setCodeScore(0);
          setPicked(null);
          setOrder(shuffle(pcBuild.map((_, i) => i)));
          setBuildChecked(false);
          setDone(false);
        }}
      />
    );
  }

  if (phase === "code" && challenge) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            {challenge.title} ({codeIdx + 1}/{code.length})
          </CardTitle>
          <CardDescription>{challenge.codeSubtitle ?? codeSubtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-emerald-400">
            {challenge.code}
          </pre>
          <p className="font-medium">{challenge.question}</p>
          <div className="grid gap-2">
            {challenge.options.map((opt, i) => {
              let variant: "outline" | "default" | "destructive" = "outline";
              if (picked !== null) {
                if (i === challenge.correctIndex) variant = "default";
                else if (i === picked) variant = "destructive";
              }
              return (
                <Button
                  key={opt}
                  variant={variant}
                  disabled={picked !== null}
                  className="h-auto justify-start whitespace-normal py-2 text-left"
                  onClick={() => answerCode(i)}
                >
                  {opt}
                </Button>
              );
            })}
          </div>
          {picked !== null ? (
            <p className="text-sm text-muted-foreground">{challenge.explanation}</p>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          {buildTitle}
        </CardTitle>
        <CardDescription>{buildSubtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {pcBuild.length > 0 ? (
          <Progress value={(code.length / totalParts) * 100} className="mb-4 h-2" />
        ) : null}
        {order.map((stepIdx, i) => (
          <div key={stepIdx} className="flex items-center gap-2 rounded-lg border p-2">
            <span className="w-6 text-center font-bold text-muted-foreground">{i + 1}</span>
            <span className="flex-1 text-sm">{pcBuild[stepIdx]}</span>
            {!buildChecked ? (
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveBuild(i, -1)}>
                  ↑
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveBuild(i, 1)}>
                  ↓
                </Button>
              </div>
            ) : null}
          </div>
        ))}
        <Button
          className="mt-2 w-full"
          onClick={() => {
            setBuildChecked(true);
            setTimeout(() => setDone(true), 600);
          }}
        >
          Finish
        </Button>
      </CardContent>
    </Card>
  );
}

function FinishCard({
  reward,
  title,
  onRetry,
}: {
  reward: ReturnType<typeof useGameReward>;
  title: string;
  onRetry: () => void;
}) {
  const flow = useLabModuleFlow();

  if (flow?.inFlow) {
    return (
      <Card className="border-primary/30">
        <CardContent className="space-y-4 p-8 text-center">
          <Check className="mx-auto h-10 w-10 text-emerald-600" />
          <p className="text-xl font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">
            Practice step complete — you&apos;re still in this lab module.
          </p>
          <GameRewardBanner reward={reward} />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={flow.onPracticeComplete}>
              {flow.practiceCompleteLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={onRetry}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Practice again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-8 text-center">
        <Check className="mx-auto h-10 w-10 text-emerald-600" />
        <p className="text-xl font-semibold">{title}</p>
        <GameRewardBanner reward={reward} />
        <Button onClick={onRetry}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Practice again
        </Button>
      </CardContent>
    </Card>
  );
}
