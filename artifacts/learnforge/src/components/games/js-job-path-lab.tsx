import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Lightbulb,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Target,
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
import { Textarea } from "@/components/ui/textarea";
import { GameShell } from "@/components/games/game-shell";
import {
  JS_JOB_PATH_MODULES,
  type JsChallenge,
  type JsModule,
} from "@/lib/educational-games/js-job-path-content";
import {
  isModuleMastered,
  isModuleUnlocked,
  loadJsJobPathProgress,
  markChallengePassed,
  markRecallPassed,
  modulePassedCount,
  pathStats,
  resetJsJobPathProgress,
  type JsJobPathProgress,
} from "@/lib/educational-games/js-job-path-progress";
import {
  runJsChallenge,
  type JsRunResult,
} from "@/lib/educational-games/js-playground-runner";

type View =
  | { kind: "hub" }
  | { kind: "module"; moduleId: string }
  | { kind: "challenge"; moduleId: string; challengeId: string }
  | { kind: "recall"; moduleId: string };

type ChallengePhase = "understand" | "predict" | "code" | "reflect" | "done";

export function JsJobPathLab({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>({ kind: "hub" });
  const [progress, setProgress] = useState<JsJobPathProgress>(() =>
    loadJsJobPathProgress(),
  );

  useEffect(() => {
    setProgress(loadJsJobPathProgress());
  }, []);

  const stats = pathStats(progress);

  if (view.kind === "challenge") {
    const mod = JS_JOB_PATH_MODULES.find((m) => m.id === view.moduleId);
    const challenge = mod?.challenges.find((c) => c.id === view.challengeId);
    if (!mod || !challenge) {
      return (
        <GameShell title="JavaScript That Sticks" onBack={onBack}>
          <p className="text-sm text-muted-foreground">Lesson not found.</p>
        </GameShell>
      );
    }
    return (
      <ChallengePlayer
        module={mod}
        challenge={challenge}
        alreadyPassed={progress.passedChallenges.includes(challenge.id)}
        onBack={() => setView({ kind: "module", moduleId: mod.id })}
        onPassed={() => setProgress(markChallengePassed(challenge.id))}
      />
    );
  }

  if (view.kind === "recall") {
    const mod = JS_JOB_PATH_MODULES.find((m) => m.id === view.moduleId);
    if (!mod) {
      return (
        <GameShell title="JavaScript That Sticks" onBack={onBack}>
          <p className="text-sm text-muted-foreground">Module not found.</p>
        </GameShell>
      );
    }
    return (
      <RecallPlayer
        module={mod}
        alreadyPassed={progress.recallPassed.includes(mod.id)}
        onBack={() => setView({ kind: "module", moduleId: mod.id })}
        onPassed={() => setProgress(markRecallPassed(mod.id))}
      />
    );
  }

  if (view.kind === "module") {
    const mod = JS_JOB_PATH_MODULES.find((m) => m.id === view.moduleId);
    const idx = JS_JOB_PATH_MODULES.findIndex((m) => m.id === view.moduleId);
    if (!mod || idx < 0) {
      return (
        <GameShell title="JavaScript That Sticks" onBack={onBack}>
          <p className="text-sm text-muted-foreground">Module not found.</p>
        </GameShell>
      );
    }
    return (
      <ModuleDetail
        module={mod}
        moduleIndex={idx}
        progress={progress}
        onBack={() => setView({ kind: "hub" })}
        onOpenChallenge={(challengeId) =>
          setView({ kind: "challenge", moduleId: mod.id, challengeId })
        }
        onOpenRecall={() => setView({ kind: "recall", moduleId: mod.id })}
      />
    );
  }

  return (
    <GameShell
      title="JavaScript That Sticks"
      subtitle="Understand → practice → explain → recall — from values through the browser"
      onBack={onBack}
    >
      <Card className="overflow-hidden border-teal-500/30 bg-gradient-to-br from-teal-50/80 via-background to-sky-50/60 dark:from-teal-950/40 dark:via-background dark:to-sky-950/30">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-teal-700 hover:bg-teal-700">Learn deeply</Badge>
            <Badge variant="outline">Better retention than scrolling tutorials</Badge>
          </div>
          <CardTitle className="text-2xl tracking-tight">
            Learn JavaScript so it actually sticks
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-relaxed">
            freeCodeCamp-style lessons often let you click through without building a
            mental model. Here every lesson makes you{" "}
            <strong className="text-foreground">understand the idea</strong>, study a
            worked example, <strong className="text-foreground">write the code</strong>,
            then <strong className="text-foreground">explain why it works</strong> —
            so you can use JavaScript from beginning to end, not just copy patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile
              icon={<BookOpen className="h-4 w-4" />}
              label="Learning loop"
              value="Teach → Code → Reflect"
            />
            <StatTile
              icon={<Code2 className="h-4 w-4" />}
              label="Lessons completed"
              value={`${stats.passedChallenges}/${stats.totalChallenges}`}
            />
            <StatTile
              icon={<Target className="h-4 w-4" />}
              label="Modules mastered"
              value={`${stats.masteredModules}/${stats.totalModules}`}
            />
          </div>
          <Progress
            value={
              stats.totalChallenges
                ? (stats.passedChallenges / stats.totalChallenges) * 100
                : 0
            }
          />
          <ol className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <li>
              <strong className="text-foreground">1. Mental model</strong> — how JS
              thinks about the idea
            </li>
            <li>
              <strong className="text-foreground">2. Worked example</strong> — see
              correct code explained
            </li>
            <li>
              <strong className="text-foreground">3. Write & test</strong> — active
              practice from scratch
            </li>
            <li>
              <strong className="text-foreground">4. Reflect + recall</strong> —
              explain it so it sticks
            </li>
          </ol>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Reset all JavaScript That Sticks progress on this device?")) {
                resetJsJobPathProgress();
                setProgress(loadJsJobPathProgress());
              }
            }}
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset progress
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Path from beginning to end
        </h3>
        {JS_JOB_PATH_MODULES.map((mod, index) => {
          const unlocked = isModuleUnlocked(index, progress);
          const passed = modulePassedCount(mod.id, progress);
          const mastered = isModuleMastered(mod.id, progress);
          const pct = Math.round((passed / mod.challenges.length) * 100);
          return (
            <Card
              key={mod.id}
              className={
                unlocked
                  ? "border-border transition-colors hover:border-teal-500/40"
                  : "opacity-70"
              }
            >
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
                      {mod.emoji}
                    </span>
                    <p className="font-semibold text-foreground">{mod.title}</p>
                    {mastered ? (
                      <Badge className="bg-teal-700 hover:bg-teal-700">Mastered</Badge>
                    ) : unlocked ? (
                      <Badge variant="secondary">Unlocked</Badge>
                    ) : (
                      <Badge variant="outline">
                        <Lock className="mr-1 h-3 w-3" />
                        Locked
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{mod.description}</p>
                  <p className="text-xs text-teal-800 dark:text-teal-200">
                    You&apos;ll understand: {mod.youWillUnderstand}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {mod.duration} · complete {mod.masteryRequired}/
                    {mod.challenges.length} lessons + recall to unlock next
                  </p>
                  {unlocked ? (
                    <div className="pt-1">
                      <Progress value={pct} className="h-1.5" />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {passed}/{mod.challenges.length} lessons
                      </p>
                    </div>
                  ) : null}
                </div>
                <Button
                  disabled={!unlocked}
                  onClick={() => setView({ kind: "module", moduleId: mod.id })}
                  className="shrink-0"
                >
                  {mastered ? "Review" : unlocked ? "Continue" : "Locked"}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-teal-700" />
            Why this sticks better than freeCodeCamp-style scrolling
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p>
            <strong className="text-foreground">Mental models first</strong> — you
            learn how JS thinks before typing.
          </p>
          <p>
            <strong className="text-foreground">Worked examples</strong> — study
            correct thinking, then write your own.
          </p>
          <p>
            <strong className="text-foreground">Explain-after</strong> — passing
            tests isn&apos;t enough; you prove you understand.
          </p>
          <p>
            <strong className="text-foreground">Spaced recall</strong> — module
            quizzes pull knowledge back so it lasts.
          </p>
        </CardContent>
      </Card>
    </GameShell>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-background/70 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ModuleDetail({
  module,
  moduleIndex,
  progress,
  onBack,
  onOpenChallenge,
  onOpenRecall,
}: {
  module: JsModule;
  moduleIndex: number;
  progress: JsJobPathProgress;
  onBack: () => void;
  onOpenChallenge: (id: string) => void;
  onOpenRecall: () => void;
}) {
  const passed = modulePassedCount(module.id, progress);
  const recallDone = progress.recallPassed.includes(module.id);
  const unlocked = isModuleUnlocked(moduleIndex, progress);

  if (!unlocked) {
    return (
      <GameShell title={module.title} onBack={onBack}>
        <Card>
          <CardContent className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            Master the previous module (lessons + recall) so foundations stay solid.
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Full path
        </Button>
        <div className="text-right">
          <h2 className="text-lg font-semibold">{module.title}</h2>
          <p className="text-sm text-muted-foreground">
            {passed}/{module.challenges.length} lessons · need {module.masteryRequired}{" "}
            + recall
          </p>
        </div>
      </div>

      <Card className="border-teal-500/20 bg-muted/30">
        <CardContent className="space-y-2 p-4 text-sm">
          <p className="font-medium text-foreground">{module.description}</p>
          <p className="text-teal-800 dark:text-teal-200">
            Goal: {module.youWillUnderstand}
          </p>
          <p className="text-muted-foreground">
            Each lesson: understand → (predict) → write code → explain why. That loop
            is what makes learning stick.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {module.challenges.map((ch, i) => {
          const done = progress.passedChallenges.includes(ch.id);
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => onOpenChallenge(ch.id)}
              className="flex w-full items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:border-teal-500/40"
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? "bg-teal-700 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="min-w-0 flex-1 space-y-1">
                <span className="block font-medium text-foreground">{ch.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {ch.concepts.join(" · ")}
                </span>
              </span>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Spaced recall</CardTitle>
          <CardDescription>
            Pull the ideas back without looking — this is how memory consolidates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant={recallDone ? "outline" : "default"}
            onClick={onOpenRecall}
            disabled={passed < 1}
          >
            {recallDone ? "Review recall" : "Start recall"}
            {recallDone ? <Check className="ml-2 h-4 w-4" /> : null}
          </Button>
          {passed < 1 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Finish at least one lesson before recall.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function ChallengePlayer({
  module,
  challenge,
  alreadyPassed,
  onBack,
  onPassed,
}: {
  module: JsModule;
  challenge: JsChallenge;
  alreadyPassed: boolean;
  onBack: () => void;
  onPassed: () => void;
}) {
  const hasPredict = Boolean(challenge.teach.predict);
  const [phase, setPhase] = useState<ChallengePhase>(
    alreadyPassed ? "done" : "understand",
  );
  const [code, setCode] = useState(challenge.starterCode);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<JsRunResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [predictPick, setPredictPick] = useState<number | null>(null);
  const [reflectPick, setReflectPick] = useState<number | null>(null);

  const visibleResults = useMemo(
    () => result?.results.filter((r) => !r.hidden) ?? [],
    [result],
  );
  const hiddenSummary = useMemo(() => {
    if (!result) return null;
    const hidden = result.results.filter((r) => r.hidden);
    if (!hidden.length) return null;
    return {
      passed: hidden.filter((r) => r.passed).length,
      total: hidden.length,
    };
  }, [result]);

  async function runTests() {
    setRunning(true);
    setResult(null);
    try {
      const next = await runJsChallenge(
        code,
        challenge.functionName,
        challenge.tests,
        challenge.runtime ?? "plain",
      );
      setResult(next);
      if (next.ok) setPhase("reflect");
    } finally {
      setRunning(false);
    }
  }

  function completeReflect(i: number) {
    if (reflectPick !== null) return;
    setReflectPick(i);
    if (i === challenge.reflect.correctIndex) {
      onPassed();
      window.setTimeout(() => setPhase("done"), 700);
    }
  }

  const steps: { id: ChallengePhase; label: string }[] = [
    { id: "understand", label: "Understand" },
    ...(hasPredict ? [{ id: "predict" as const, label: "Predict" }] : []),
    { id: "code", label: "Code" },
    { id: "reflect", label: "Explain" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {module.title}
        </Button>
        <div className="flex items-center gap-2">
          {alreadyPassed || phase === "done" ? (
            <Badge className="bg-teal-700 hover:bg-teal-700">Understood</Badge>
          ) : null}
          <span className="text-sm text-muted-foreground">{challenge.title}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {steps.map((s, i) => {
          const order = ["understand", "predict", "code", "reflect", "done"];
          const activeIdx = order.indexOf(phase === "done" ? "reflect" : phase);
          const stepIdx = order.indexOf(s.id);
          const done = stepIdx < activeIdx || phase === "done";
          const current = s.id === phase || (phase === "done" && s.id === "reflect");
          return (
            <Badge
              key={s.id}
              variant={current ? "default" : done ? "secondary" : "outline"}
              className={current ? "bg-teal-700 hover:bg-teal-700" : ""}
            >
              {i + 1}. {s.label}
              {done ? <Check className="ml-1 h-3 w-3" /> : null}
            </Badge>
          );
        })}
      </div>

      {phase === "understand" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-teal-700" />
              {challenge.title}
            </CardTitle>
            <CardDescription className="text-base text-foreground/90">
              {challenge.teach.idea}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                How JavaScript thinks
              </p>
              <ol className="list-decimal space-y-1.5 pl-5 text-muted-foreground">
                {challenge.teach.mentalModel.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </div>
            <div className="rounded-lg border bg-zinc-950 p-3 text-zinc-100">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Worked example — study this
              </p>
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed">
                {challenge.teach.workedExample.code}
              </pre>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-zinc-300">
                {challenge.teach.workedExample.walkthrough.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-amber-500/30 bg-amber-50/60 p-3 dark:bg-amber-950/20">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
                <Lightbulb className="h-3.5 w-3.5" />
                Common misconception
              </p>
              <p className="mt-1 text-muted-foreground">
                {challenge.teach.misconception}
              </p>
            </div>
            {challenge.runtime === "dom" ? (
              <p className="rounded-md border border-teal-500/20 bg-teal-50/50 p-3 text-xs text-muted-foreground dark:bg-teal-950/20">
                This lesson uses a practice <code className="text-foreground">document</code> —
                same ideas as the real browser DOM (createElement, querySelector, events).
              </p>
            ) : null}
            <Button
              onClick={() => setPhase(hasPredict ? "predict" : "code")}
              className="bg-teal-700 hover:bg-teal-800"
            >
              {hasPredict ? "Next: predict the result" : "Next: write the code"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {phase === "predict" && challenge.teach.predict ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Predict before you code</CardTitle>
            <CardDescription>
              Active recall — figure out what JS will do before typing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-3 font-mono text-xs">
              {challenge.teach.predict.code}
            </pre>
            <p className="text-sm font-medium">{challenge.teach.predict.question}</p>
            <div className="space-y-2">
              {challenge.teach.predict.options.map((opt, i) => {
                const show = predictPick !== null;
                const correct = i === challenge.teach.predict!.correctIndex;
                const picked = predictPick === i;
                return (
                  <Button
                    key={opt}
                    variant="outline"
                    className={`h-auto w-full justify-start whitespace-normal px-4 py-3 text-left ${
                      show && correct
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
                        : show && picked
                          ? "border-destructive/50 bg-destructive/5"
                          : ""
                    }`}
                    disabled={predictPick !== null}
                    onClick={() => {
                      setPredictPick(i);
                      if (i === challenge.teach.predict!.correctIndex) {
                        window.setTimeout(() => setPhase("code"), 800);
                      }
                    }}
                  >
                    {opt}
                  </Button>
                );
              })}
            </div>
            {predictPick !== null ? (
              <p className="text-sm text-muted-foreground">
                {challenge.teach.predict.explanation}
              </p>
            ) : null}
            {predictPick !== null &&
            predictPick !== challenge.teach.predict.correctIndex ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPredictPick(null)}
              >
                Try predict again
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {phase === "code" || phase === "reflect" || phase === "done" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Your turn — write it</CardTitle>
              <CardDescription className="whitespace-pre-wrap leading-relaxed">
                {challenge.prompt}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-1.5">
                {challenge.concepts.map((c) => (
                  <Badge key={c} variant="secondary">
                    {c}
                  </Badge>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHint((v) => !v)}
              >
                {showHint ? "Hide hint" : "Show hint"}
              </Button>
              {showHint ? (
                <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                  {challenge.hint}
                </p>
              ) : null}
              {phase !== "code" ? (
                <Button variant="ghost" size="sm" onClick={() => setPhase("understand")}>
                  Re-read the explanation
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-zinc-700/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-mono text-sm">
                {challenge.functionName}.js
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCode(challenge.starterCode);
                    setResult(null);
                  }}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={runTests}
                  disabled={running || phase === "done"}
                >
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  {running ? "Running…" : "Run tests"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                disabled={phase === "done"}
                className="min-h-[260px] font-mono text-sm leading-relaxed"
              />
              {result?.compileError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {result.compileError}
                </div>
              ) : null}
              {result && !result.compileError ? (
                <div className="space-y-2">
                  <p
                    className={`text-sm font-medium ${
                      result.ok
                        ? "text-teal-700 dark:text-teal-300"
                        : "text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {result.ok
                      ? "Tests passed — now explain why it works."
                      : `${result.passedCount}/${result.totalCount} tests passed — read the failures and fix the idea, not just the syntax.`}
                  </p>
                  <ul className="space-y-1.5">
                    {visibleResults.map((r) => (
                      <li
                        key={r.name}
                        className={`rounded-md border px-3 py-2 text-xs ${
                          r.passed
                            ? "border-teal-500/30 bg-teal-50/50 dark:bg-teal-950/20"
                            : "border-destructive/30 bg-destructive/5"
                        }`}
                      >
                        <span className="font-medium">
                          {r.passed ? "✓" : "✗"} {r.name}
                        </span>
                        {!r.passed && r.error ? (
                          <span className="mt-0.5 block text-muted-foreground">
                            {r.error}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  {hiddenSummary ? (
                    <p className="text-xs text-muted-foreground">
                      Hidden checks: {hiddenSummary.passed}/{hiddenSummary.total}{" "}
                      passed
                    </p>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {phase === "reflect" || phase === "done" ? (
        <Card className="border-teal-500/30">
          <CardHeader>
            <CardTitle className="text-base">Explain it — make it stick</CardTitle>
            <CardDescription>
              If you can explain the why, you own the concept — not just a lucky green
              check.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-medium">{challenge.reflect.prompt}</p>
            {challenge.reflect.options.map((opt, i) => {
              const show = reflectPick !== null || phase === "done";
              const correct = i === challenge.reflect.correctIndex;
              const picked = reflectPick === i;
              return (
                <Button
                  key={opt}
                  variant="outline"
                  className={`h-auto w-full justify-start whitespace-normal px-4 py-3 text-left ${
                    show && correct
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
                      : show && picked
                        ? "border-destructive/50 bg-destructive/5"
                        : ""
                  }`}
                  disabled={phase === "done" || reflectPick !== null}
                  onClick={() => completeReflect(i)}
                >
                  {opt}
                </Button>
              );
            })}
            {reflectPick !== null ? (
              <p className="pt-2 text-sm text-muted-foreground">
                {challenge.reflect.explanation}
              </p>
            ) : null}
            {reflectPick !== null &&
            reflectPick !== challenge.reflect.correctIndex ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReflectPick(null)}
              >
                Try explanation again
              </Button>
            ) : null}
            {phase === "done" ? (
              <Button onClick={onBack} className="mt-2 bg-teal-700 hover:bg-teal-800">
                Back to module
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function RecallPlayer({
  module,
  alreadyPassed,
  onBack,
  onPassed,
}: {
  module: JsModule;
  alreadyPassed: boolean;
  onBack: () => void;
  onPassed: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [reviewMode, setReviewMode] = useState(alreadyPassed);

  const q = module.recall[idx];

  if (!module.recall.length) {
    return (
      <GameShell title="Recall" onBack={onBack}>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No recall questions for this module.
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  if (reviewMode && !done) {
    return (
      <GameShell title={`${module.title} · Recall`} onBack={onBack}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recall complete</CardTitle>
            <CardDescription>
              You already cleared this check. Retry anytime to keep the knowledge warm.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={onBack}>Back to module</Button>
            <Button
              variant="outline"
              onClick={() => {
                setReviewMode(false);
                setIdx(0);
                setSelected(null);
                setScore(0);
                setDone(false);
              }}
            >
              Retry recall
            </Button>
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  if (done) {
    const perfect = score === module.recall.length;
    return (
      <GameShell title={`${module.title} · Recall`} onBack={onBack}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {perfect ? "Knowledge locked in" : "Almost — try again"}
            </CardTitle>
            <CardDescription>
              Score: {score}/{module.recall.length}
              {perfect
                ? " — you can unlock the next module when mastery is met."
                : " — get every question right so the ideas stick."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={onBack}>Back to module</Button>
            <Button
              variant="outline"
              onClick={() => {
                setIdx(0);
                setSelected(null);
                setScore(0);
                setDone(false);
              }}
            >
              Retry recall
            </Button>
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  function pick(i: number) {
    if (!q || selected !== null) return;
    setSelected(i);
    const correct = i === q.correctIndex;
    const nextScore = score + (correct ? 1 : 0);
    if (correct) setScore(nextScore);
    window.setTimeout(() => {
      if (idx + 1 >= module.recall.length) {
        setDone(true);
        if (nextScore === module.recall.length) onPassed();
      } else {
        setIdx((n) => n + 1);
        setSelected(null);
      }
    }, 900);
  }

  return (
    <GameShell
      title={`${module.title} · Recall`}
      subtitle={`Question ${idx + 1} of ${module.recall.length}`}
      onBack={onBack}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base leading-relaxed">{q.prompt}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {q.options.map((opt, i) => {
            const show = selected !== null;
            const isCorrect = i === q.correctIndex;
            const isPick = selected === i;
            return (
              <Button
                key={opt}
                variant="outline"
                className={`h-auto w-full justify-start whitespace-normal px-4 py-3 text-left ${
                  show && isCorrect
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
                    : show && isPick
                      ? "border-destructive/50 bg-destructive/5"
                      : ""
                }`}
                onClick={() => pick(i)}
                disabled={selected !== null}
              >
                {opt}
              </Button>
            );
          })}
          {selected !== null ? (
            <p className="pt-2 text-sm text-muted-foreground">{q.explanation}</p>
          ) : null}
        </CardContent>
      </Card>
    </GameShell>
  );
}
