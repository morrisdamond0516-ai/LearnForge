import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Briefcase,
  Check,
  ChevronRight,
  Layers,
  Lightbulb,
  Lock,
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
  AI_JOB_PATH_MODULES,
  foundationModules,
  roleModules,
  type AiLesson,
  type AiModule,
  type AiPractice,
} from "@/lib/educational-games/ai-job-path-content";
import {
  foundationsComplete,
  isModuleMastered,
  isModuleUnlocked,
  loadAiJobPathProgress,
  markLessonPassed,
  markRecallPassed,
  modulePassedCount,
  pathStats,
  resetAiJobPathProgress,
  type AiJobPathProgress,
} from "@/lib/educational-games/ai-job-path-progress";
import {
  evaluatePractice,
  type AiPracticeResult,
} from "@/lib/educational-games/ai-job-path-runner";

type View =
  | { kind: "hub" }
  | { kind: "module"; moduleId: string }
  | { kind: "lesson"; moduleId: string; lessonId: string }
  | { kind: "recall"; moduleId: string };

type LessonPhase = "understand" | "practice" | "reflect" | "done";

function shuffleStrings(items: string[]): string[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function AiJobPathLab({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>({ kind: "hub" });
  const [progress, setProgress] = useState<AiJobPathProgress>(() =>
    loadAiJobPathProgress(),
  );

  useEffect(() => {
    setProgress(loadAiJobPathProgress());
  }, []);

  const stats = pathStats(progress);

  if (view.kind === "lesson") {
    const mod = AI_JOB_PATH_MODULES.find((m) => m.id === view.moduleId);
    const lesson = mod?.lessons.find((l) => l.id === view.lessonId);
    if (!mod || !lesson) {
      return (
        <GameShell title="AI Career Path" onBack={onBack}>
          <p className="text-sm text-muted-foreground">Lesson not found.</p>
        </GameShell>
      );
    }
    return (
      <LessonPlayer
        module={mod}
        lesson={lesson}
        alreadyPassed={progress.passedLessons.includes(lesson.id)}
        onBack={() => setView({ kind: "module", moduleId: mod.id })}
        onPassed={() => setProgress(markLessonPassed(lesson.id))}
      />
    );
  }

  if (view.kind === "recall") {
    const mod = AI_JOB_PATH_MODULES.find((m) => m.id === view.moduleId);
    if (!mod) {
      return (
        <GameShell title="AI Career Path" onBack={onBack}>
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
    const mod = AI_JOB_PATH_MODULES.find((m) => m.id === view.moduleId);
    if (!mod) {
      return (
        <GameShell title="AI Career Path" onBack={onBack}>
          <p className="text-sm text-muted-foreground">Module not found.</p>
        </GameShell>
      );
    }
    return (
      <ModuleDetail
        module={mod}
        progress={progress}
        onBack={() => setView({ kind: "hub" })}
        onOpenLesson={(lessonId) =>
          setView({ kind: "lesson", moduleId: mod.id, lessonId })
        }
        onOpenRecall={() => setView({ kind: "recall", moduleId: mod.id })}
      />
    );
  }

  return (
    <GameShell
      title="AI Career Path"
      subtitle="Foundations first → specialize for the AI jobs employers hire"
      onBack={onBack}
    >
      <Card className="overflow-hidden border-cyan-500/30 bg-gradient-to-br from-cyan-50/80 via-background to-slate-50/60 dark:from-cyan-950/40 dark:via-background dark:to-slate-950/30">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-cyan-800 hover:bg-cyan-800">Career track</Badge>
            <Badge variant="outline">2026 job-market aligned</Badge>
          </div>
          <CardTitle className="text-2xl tracking-tight">
            Learn the AI stack that gets people hired
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-relaxed">
            Master shared foundations (systems, data quality, prompting, evals, safety),
            then specialize into Data for AI, Applied AI Engineering, ML Engineering,
            MLOps, or AI Product judgment. Understand → practice → explain → recall —
            not hype slides.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile
              icon={<BookOpen className="h-4 w-4" />}
              label="Lessons completed"
              value={`${stats.passedLessons}/${stats.totalLessons}`}
            />
            <StatTile
              icon={<Target className="h-4 w-4" />}
              label="Modules mastered"
              value={`${stats.masteredModules}/${stats.totalModules}`}
            />
            <StatTile
              icon={<Layers className="h-4 w-4" />}
              label="Foundations"
              value={stats.foundationsDone ? "Complete — roles unlocked" : "In progress"}
            />
          </div>
          <Progress
            value={
              stats.totalLessons
                ? (stats.passedLessons / stats.totalLessons) * 100
                : 0
            }
          />
          <p className="text-xs text-muted-foreground">
            Honest scope: interactive career practice and judgment — not a GPU training
            cluster or full cloud MLOps suite.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Reset all AI Career Path progress on this device?")) {
                resetAiJobPathProgress();
                setProgress(loadAiJobPathProgress());
              }
            }}
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset progress
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          1. Shared foundations (required)
        </h3>
        {foundationModules().map((mod) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            progress={progress}
            onOpen={() => setView({ kind: "module", moduleId: mod.id })}
          />
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            2. Role tracks
          </h3>
          {!foundationsComplete(progress) ? (
            <Badge variant="outline">
              <Lock className="mr-1 h-3 w-3" />
              Unlocks after foundations
            </Badge>
          ) : (
            <Badge className="bg-cyan-800 hover:bg-cyan-800">Unlocked</Badge>
          )}
        </div>
        {roleModules().map((mod) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            progress={progress}
            onOpen={() => setView({ kind: "module", moduleId: mod.id })}
          />
        ))}
      </section>

      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-cyan-800" />
            Why this matches the 2026 market
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p>
            <strong className="text-foreground">Data for AI</strong> — pipelines
            enable every other role.
          </p>
          <p>
            <strong className="text-foreground">Applied AI</strong> — RAG, agents,
            APIs, evals ship product features.
          </p>
          <p>
            <strong className="text-foreground">ML + MLOps</strong> — train honestly,
            deploy and monitor safely.
          </p>
          <p>
            <strong className="text-foreground">Prompting</strong> — table-stakes
            skill inside broader jobs, not a fake solo career.
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

function ModuleCard({
  module,
  progress,
  onOpen,
}: {
  module: AiModule;
  progress: AiJobPathProgress;
  onOpen: () => void;
}) {
  const unlocked = isModuleUnlocked(module, progress);
  const passed = modulePassedCount(module.id, progress);
  const mastered = isModuleMastered(module.id, progress);
  const pct = Math.round((passed / module.lessons.length) * 100);

  return (
    <Card
      className={
        unlocked
          ? "border-border transition-colors hover:border-cyan-500/40"
          : "opacity-70"
      }
    >
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {module.track === "role" ? (
              <Briefcase className="h-4 w-4 text-cyan-800" />
            ) : (
              <BookOpen className="h-4 w-4 text-cyan-800" />
            )}
            <p className="font-semibold text-foreground">{module.title}</p>
            {module.roleLabel ? (
              <Badge variant="secondary">{module.roleLabel}</Badge>
            ) : null}
            {mastered ? (
              <Badge className="bg-cyan-800 hover:bg-cyan-800">Mastered</Badge>
            ) : unlocked ? (
              <Badge variant="secondary">Unlocked</Badge>
            ) : (
              <Badge variant="outline">
                <Lock className="mr-1 h-3 w-3" />
                Locked
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{module.description}</p>
          <p className="text-xs text-cyan-900 dark:text-cyan-200">
            You&apos;ll understand: {module.youWillUnderstand}
          </p>
          {module.recommendedAfter?.length ? (
            <p className="text-xs text-muted-foreground">
              Recommended after:{" "}
              {module.recommendedAfter
                .map(
                  (id) =>
                    AI_JOB_PATH_MODULES.find((m) => m.id === id)?.title ?? id,
                )
                .join(", ")}
            </p>
          ) : null}
          {unlocked ? (
            <div className="pt-1">
              <Progress value={pct} className="h-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">
                {passed}/{module.lessons.length} lessons · need{" "}
                {module.masteryRequired} + recall
              </p>
            </div>
          ) : null}
        </div>
        <Button disabled={!unlocked} onClick={onOpen} className="shrink-0">
          {mastered ? "Review" : unlocked ? "Continue" : "Locked"}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ModuleDetail({
  module,
  progress,
  onBack,
  onOpenLesson,
  onOpenRecall,
}: {
  module: AiModule;
  progress: AiJobPathProgress;
  onBack: () => void;
  onOpenLesson: (id: string) => void;
  onOpenRecall: () => void;
}) {
  const passed = modulePassedCount(module.id, progress);
  const recallDone = progress.recallPassed.includes(module.id);
  const unlocked = isModuleUnlocked(module, progress);

  if (!unlocked) {
    return (
      <GameShell title={module.title} onBack={onBack}>
        <Card>
          <CardContent className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            {module.track === "foundation"
              ? "Master the previous foundation module first."
              : "Complete all foundation modules (lessons + recall) to unlock role tracks."}
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
          Path overview
        </Button>
        <div className="text-right">
          <h2 className="text-lg font-semibold">{module.title}</h2>
          <p className="text-sm text-muted-foreground">
            {passed}/{module.lessons.length} lessons · need {module.masteryRequired}{" "}
            + recall
          </p>
        </div>
      </div>

      <Card className="border-cyan-500/20 bg-muted/30">
        <CardContent className="space-y-2 p-4 text-sm">
          <p className="font-medium text-foreground">{module.description}</p>
          <p className="text-cyan-900 dark:text-cyan-200">
            Goal: {module.youWillUnderstand}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {module.lessons.map((lesson, i) => {
          const done = progress.passedLessons.includes(lesson.id);
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => onOpenLesson(lesson.id)}
              className="flex w-full items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:border-cyan-500/40"
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? "bg-cyan-800 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="min-w-0 flex-1 space-y-1">
                <span className="block font-medium text-foreground">
                  {lesson.title}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {lesson.concepts.join(" · ")}
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
            Pull the ideas back — required to master the module.
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
        </CardContent>
      </Card>
    </div>
  );
}

function LessonPlayer({
  module,
  lesson,
  alreadyPassed,
  onBack,
  onPassed,
}: {
  module: AiModule;
  lesson: AiLesson;
  alreadyPassed: boolean;
  onBack: () => void;
  onPassed: () => void;
}) {
  const [phase, setPhase] = useState<LessonPhase>(
    alreadyPassed ? "done" : "understand",
  );
  const [practiceOk, setPracticeOk] = useState(alreadyPassed);
  const [reflectPick, setReflectPick] = useState<number | null>(null);

  const steps: { id: LessonPhase; label: string }[] = [
    { id: "understand", label: "Understand" },
    { id: "practice", label: "Practice" },
    { id: "reflect", label: "Explain" },
  ];

  function completeReflect(i: number) {
    if (reflectPick !== null || phase === "done") return;
    setReflectPick(i);
    if (i === lesson.reflect.correctIndex && practiceOk) {
      onPassed();
      window.setTimeout(() => setPhase("done"), 700);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {module.title}
        </Button>
        <div className="flex items-center gap-2">
          {alreadyPassed || phase === "done" ? (
            <Badge className="bg-cyan-800 hover:bg-cyan-800">Understood</Badge>
          ) : null}
          <span className="text-sm text-muted-foreground">{lesson.title}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {steps.map((s, i) => {
          const order = ["understand", "practice", "reflect", "done"];
          const activeIdx = order.indexOf(phase === "done" ? "reflect" : phase);
          const stepIdx = order.indexOf(s.id);
          const done = stepIdx < activeIdx || phase === "done";
          const current =
            s.id === phase || (phase === "done" && s.id === "reflect");
          return (
            <Badge
              key={s.id}
              variant={current ? "default" : done ? "secondary" : "outline"}
              className={current ? "bg-cyan-800 hover:bg-cyan-800" : ""}
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
              <BookOpen className="h-5 w-5 text-cyan-800" />
              {lesson.title}
            </CardTitle>
            <CardDescription className="text-base text-foreground/90">
              {lesson.teach.idea}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Mental model
              </p>
              <ol className="list-decimal space-y-1.5 pl-5 text-muted-foreground">
                {lesson.teach.mentalModel.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {lesson.teach.workedExample.title}
              </p>
              <p className="mt-1 text-muted-foreground">
                {lesson.teach.workedExample.body}
              </p>
            </div>
            <div className="rounded-md border border-amber-500/30 bg-amber-50/60 p-3 dark:bg-amber-950/20">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
                <Lightbulb className="h-3.5 w-3.5" />
                Common misconception
              </p>
              <p className="mt-1 text-muted-foreground">
                {lesson.teach.misconception}
              </p>
            </div>
            <p className="rounded-md border border-cyan-500/20 bg-cyan-50/50 p-3 text-xs text-muted-foreground dark:bg-cyan-950/20">
              <strong className="text-foreground">Job signal:</strong>{" "}
              {lesson.teach.jobSignal}
            </p>
            <Button
              onClick={() => setPhase("practice")}
              className="bg-cyan-800 hover:bg-cyan-900"
            >
              Next: practice
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {phase === "practice" || phase === "reflect" || phase === "done" ? (
        <PracticePanel
          practice={lesson.practice}
          locked={phase !== "practice"}
          onPassed={() => {
            setPracticeOk(true);
            setPhase("reflect");
          }}
        />
      ) : null}

      {phase === "reflect" || phase === "done" ? (
        <Card className="border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-base">Explain it — make it stick</CardTitle>
            <CardDescription>
              Passing practice isn&apos;t enough — prove you understand why.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!practiceOk ? (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Complete practice successfully before explain counts.
              </p>
            ) : null}
            <p className="text-sm font-medium">{lesson.reflect.prompt}</p>
            {lesson.reflect.options.map((opt, i) => {
              const show = reflectPick !== null || phase === "done";
              const correct = i === lesson.reflect.correctIndex;
              const picked = reflectPick === i;
              return (
                <Button
                  key={opt}
                  variant="outline"
                  className={`h-auto w-full justify-start whitespace-normal px-4 py-3 text-left ${
                    show && correct
                      ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30"
                      : show && picked
                        ? "border-destructive/50 bg-destructive/5"
                        : ""
                  }`}
                  disabled={phase === "done" || reflectPick !== null || !practiceOk}
                  onClick={() => completeReflect(i)}
                >
                  {opt}
                </Button>
              );
            })}
            {reflectPick !== null ? (
              <p className="pt-2 text-sm text-muted-foreground">
                {lesson.reflect.explanation}
              </p>
            ) : null}
            {reflectPick !== null &&
            reflectPick !== lesson.reflect.correctIndex ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReflectPick(null)}
              >
                Try explanation again
              </Button>
            ) : null}
            {phase === "done" ? (
              <Button onClick={onBack} className="mt-2 bg-cyan-800 hover:bg-cyan-900">
                Back to module
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function PracticePanel({
  practice,
  locked,
  onPassed,
}: {
  practice: AiPractice;
  locked: boolean;
  onPassed: () => void;
}) {
  const [choiceIndex, setChoiceIndex] = useState<number | null>(null);
  const [promptText, setPromptText] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sequenceOrder, setSequenceOrder] = useState<string[]>(() =>
    practice.kind === "sequence" ? shuffleStrings(practice.correctOrder) : [],
  );
  const [result, setResult] = useState<AiPracticeResult | null>(null);

  const checklistItems = practice.kind === "checklist" ? practice.items : [];

  function submit(partial?: {
    choiceIndex?: number;
    scenarioIndex?: number;
  }) {
    if (locked) return;
    const next = evaluatePractice(practice, {
      choiceIndex: partial?.choiceIndex ?? choiceIndex ?? undefined,
      promptText,
      selectedIds,
      sequenceOrder,
      scenarioIndex: partial?.scenarioIndex,
    });
    setResult(next);
    if (next.ok) onPassed();
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Practice</CardTitle>
        <CardDescription>
          {practice.kind === "prompt-rubric"
            ? practice.brief
            : practice.kind === "sequence"
              ? practice.prompt
              : practice.kind === "checklist"
                ? practice.prompt
                : practice.kind === "choice"
                  ? practice.prompt
                  : practice.prompt}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {practice.kind === "choice" || practice.kind === "scenario" ? (
          <div className="space-y-2">
            {(practice.kind === "choice"
              ? practice.options.map((text, i) => ({ text, i }))
              : practice.options.map((o, i) => ({ text: o.text, i }))
            ).map(({ text, i }) => (
              <Button
                key={text}
                variant="outline"
                className="h-auto w-full justify-start whitespace-normal px-4 py-3 text-left"
                disabled={locked}
                onClick={() => {
                  if (practice.kind === "choice") {
                    setChoiceIndex(i);
                    submit({ choiceIndex: i });
                  } else {
                    submit({ scenarioIndex: i });
                  }
                }}
              >
                {text}
              </Button>
            ))}
          </div>
        ) : null}

        {practice.kind === "prompt-rubric" ? (
          <div className="space-y-2">
            <Textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={practice.placeholder}
              disabled={locked}
              className="min-h-[180px] text-sm"
            />
            <Button
              disabled={locked}
              onClick={() => submit()}
              className="bg-cyan-800 hover:bg-cyan-900"
            >
              Score prompt
            </Button>
          </div>
        ) : null}

        {practice.kind === "checklist" ? (
          <div className="space-y-2">
            {checklistItems.map((item) => {
              const on = selectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={locked}
                  onClick={() =>
                    setSelectedIds((prev) =>
                      on ? prev.filter((x) => x !== item.id) : [...prev, item.id],
                    )
                  }
                  className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm ${
                    on ? "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20" : ""
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                      on ? "bg-cyan-800 text-white" : ""
                    }`}
                  >
                    {on ? "✓" : ""}
                  </span>
                  {item.label}
                </button>
              );
            })}
            <Button
              disabled={locked}
              onClick={() => submit()}
              className="bg-cyan-800 hover:bg-cyan-900"
            >
              Check selection
            </Button>
          </div>
        ) : null}

        {practice.kind === "sequence" ? (
          <SequenceEditor
            order={sequenceOrder}
            locked={locked}
            onChange={setSequenceOrder}
            onCheck={() => submit()}
          />
        ) : null}

        {result ? (
          <div
            className={`rounded-md border p-3 text-sm ${
              result.ok
                ? "border-cyan-500/30 bg-cyan-50/50 dark:bg-cyan-950/20"
                : "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20"
            }`}
          >
            <p className="font-medium">{result.feedback}</p>
            {result.details?.length ? (
              <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
                {result.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SequenceEditor({
  order,
  locked,
  onChange,
  onCheck,
}: {
  order: string[];
  locked: boolean;
  onChange: (next: string[]) => void;
  onCheck: () => void;
}) {
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {order.map((step, i) => (
        <div
          key={`${step}-${i}`}
          className="flex items-center gap-2 rounded-md border px-2 py-2 text-sm"
        >
          <span className="w-6 text-xs text-muted-foreground">{i + 1}.</span>
          <span className="flex-1">{step}</span>
          <Button
            size="icon"
            variant="ghost"
            disabled={locked || i === 0}
            onClick={() => move(i, -1)}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            disabled={locked || i === order.length - 1}
            onClick={() => move(i, 1)}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        disabled={locked}
        onClick={onCheck}
        className="bg-cyan-800 hover:bg-cyan-900"
      >
        Check order
      </Button>
    </div>
  );
}

function RecallPlayer({
  module,
  alreadyPassed,
  onBack,
  onPassed,
}: {
  module: AiModule;
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
        <p className="text-sm text-muted-foreground">No recall for this module.</p>
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
              Already cleared. Retry anytime to keep knowledge warm.
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
              {perfect ? "Knowledge locked in" : "Keep practicing"}
            </CardTitle>
            <CardDescription>
              Score: {score}/{module.recall.length}
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
                    ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30"
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
