import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  GraduationCap,
  RotateCcw,
  Wrench,
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
import { SkillGameRenderer } from "@/components/games/skill-game-engines";
import { LabModuleFlowContext } from "@/components/games/lab-module-flow-context";
import type {
  LabPhaseQuestion,
  SkillGameContent,
  SkillGameType,
} from "@/lib/educational-games/skill-game-types";
import {
  resolveLabPhases,
  type LabModuleMeta,
} from "@/lib/educational-games/lab-phase-resolver";

export type LabFlowPhase = "prep" | "practice" | "recall" | "complete";

type SavedLabFlow = {
  phase: LabFlowPhase;
  prepScore?: number;
  recallScore?: number;
};

const STORAGE_PREFIX = "lab-module-flow:";

function storageKey(gameId: string) {
  return STORAGE_PREFIX + gameId;
}

function loadSaved(gameId: string): SavedLabFlow | null {
  try {
    const raw = localStorage.getItem(storageKey(gameId));
    if (!raw) return null;
    return JSON.parse(raw) as SavedLabFlow;
  } catch {
    return null;
  }
}

function saveFlow(gameId: string, data: SavedLabFlow) {
  try {
    localStorage.setItem(storageKey(gameId), JSON.stringify(data));
  } catch {
    /* ignore quota / private mode */
  }
}

function clearFlow(gameId: string) {
  try {
    localStorage.removeItem(storageKey(gameId));
  } catch {
    /* ignore */
  }
}

function initialPhase(hasPrep: boolean): LabFlowPhase {
  return hasPrep ? "prep" : "practice";
}

function PhaseQuestionPlayer({
  questions,
  phaseTitle,
  phaseDescription,
  questionLabel,
  onComplete,
  onSkip,
  skipLabel,
  continueLabel,
}: {
  questions: LabPhaseQuestion[];
  phaseTitle: string;
  phaseDescription: string;
  questionLabel: string;
  onComplete: (score: number) => void;
  onSkip: () => void;
  skipLabel: string;
  continueLabel: string;
}) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const done = idx >= questions.length;
  const q = questions[idx];

  function pick(i: number) {
    if (!q || picked !== null) return;
    setPicked(i);
    if (i === q.correctIndex) setScore((s) => s + 1);
    setShowExplanation(true);
  }

  function advance() {
    setPicked(null);
    setShowExplanation(false);
    setIdx((n) => n + 1);
  }

  if (done) {
    return (
      <Card className="border-primary/30">
        <CardContent className="space-y-4 p-6 text-center">
          <Check className="mx-auto h-9 w-9 text-emerald-600" />
          <p className="text-lg font-semibold">
            {score} of {questions.length} correct
          </p>
          <p className="text-sm text-muted-foreground">
            {phaseTitle} complete — you&apos;re still in this lab module.
          </p>
          <Button onClick={() => onComplete(score)}>
            {continueLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <CardDescription>{phaseTitle}</CardDescription>
            <CardTitle className="text-base leading-snug">{phaseDescription}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onSkip}>
            {skipLabel}
          </Button>
        </div>
        <Progress value={((idx + (picked !== null ? 1 : 0)) / questions.length) * 100} />
        <CardDescription>
          {questionLabel} {idx + 1} of {questions.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-medium leading-relaxed">{q.prompt}</p>
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
                className="h-auto whitespace-normal py-3 text-left"
                disabled={picked !== null}
                onClick={() => pick(i)}
              >
                {opt}
              </Button>
            );
          })}
        </div>
        {showExplanation && picked !== null ? (
          <div className="space-y-3 rounded-lg bg-muted/50 p-3 text-sm">
            <p>{q.explanation}</p>
            <Button size="sm" onClick={advance}>
              {idx + 1 >= questions.length ? "See results" : "Next question"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function LabFlowStepper({
  phase,
  hasPrep,
  hasRecall,
}: {
  phase: LabFlowPhase;
  hasPrep: boolean;
  hasRecall: boolean;
}) {
  const steps = useMemo(() => {
    const list: { id: LabFlowPhase; label: string; icon: typeof BookOpen }[] = [];
    if (hasPrep) list.push({ id: "prep", label: "Warm-up", icon: BookOpen });
    list.push({ id: "practice", label: "Hands-on lab", icon: Wrench });
    if (hasRecall) list.push({ id: "recall", label: "Recall check", icon: ClipboardCheck });
    return list;
  }, [hasPrep, hasRecall]);

  const activeIdx = steps.findIndex((s) => s.id === phase);

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-primary">
        Lab module — you have not left this lab
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = step.id === phase;
          const isPast = activeIdx > i || phase === "complete";
          return (
            <div key={step.id} className="flex flex-1 items-center gap-2">
              <div
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : isPast
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-muted-foreground"
                }`}
              >
                {isPast && !isActive ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <Icon className="h-4 w-4 shrink-0" />
                )}
                <span>
                  Step {i + 1}: {step.label}
                </span>
              </div>
              {i < steps.length - 1 ? (
                <div className="hidden h-px flex-1 bg-border sm:block" aria-hidden />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LabModuleFlow({
  gameId,
  moduleTitle,
  careerName,
  domain,
  gameType,
  content,
  description,
  prep,
  recall,
  onBackToTrack,
  labIndex,
  labCount,
  fromCurriculum,
}: {
  gameId: string;
  moduleTitle: string;
  careerName: string;
  domain?: string;
  gameType: SkillGameType;
  content: SkillGameContent;
  description?: string;
  prep?: LabPhaseQuestion[];
  recall?: LabPhaseQuestion[];
  onBackToTrack: () => void;
  /** 1-based position in the track, e.g. 2 */
  labIndex?: number;
  /** Total workspace labs in this track */
  labCount?: number;
  /** Subject name from curriculum plan that opened this lab */
  fromCurriculum?: string;
}) {
  const hasPrep = (prep?.length ?? 0) > 0;
  const hasRecall = (recall?.length ?? 0) > 0;

  const [phase, setPhase] = useState<LabFlowPhase>(() => {
    const saved = loadSaved(gameId);
    if (saved?.phase) return saved.phase;
    return initialPhase(hasPrep);
  });
  const [prepScore, setPrepScore] = useState<number | null>(() => {
    const saved = loadSaved(gameId);
    return saved?.prepScore ?? null;
  });
  const [recallScore, setRecallScore] = useState<number | null>(() => {
    const saved = loadSaved(gameId);
    return saved?.recallScore ?? null;
  });

  const persist = useCallback(
    (next: LabFlowPhase, scores?: { prep?: number; recall?: number }) => {
      const data: SavedLabFlow = {
        phase: next,
        prepScore: scores?.prep ?? prepScore ?? undefined,
        recallScore: scores?.recall ?? recallScore ?? undefined,
      };
      saveFlow(gameId, data);
    },
    [gameId, prepScore, recallScore],
  );

  useEffect(() => {
    persist(phase);
  }, [phase, persist]);

  function goToPractice(fromPrepScore?: number) {
    if (fromPrepScore !== undefined) setPrepScore(fromPrepScore);
    setPhase("practice");
    persist("practice", { prep: fromPrepScore ?? prepScore ?? undefined });
  }

  function goToRecall() {
    setPhase("recall");
    persist("recall");
  }

  function finishModule(fromRecallScore?: number) {
    if (fromRecallScore !== undefined) setRecallScore(fromRecallScore);
    setPhase("complete");
    persist("complete", { recall: fromRecallScore ?? recallScore ?? undefined });
  }

  function restartModule() {
    clearFlow(gameId);
    setPrepScore(null);
    setRecallScore(null);
    setPhase(initialPhase(hasPrep));
  }

  const practiceCompleteLabel = hasRecall
    ? "Continue to recall check (Step 3)"
    : "Finish lab module";

  const flowContext = {
    inFlow: phase === "practice",
    practiceCompleteLabel,
    onPracticeComplete: () => {
      if (hasRecall) goToRecall();
      else finishModule();
    },
  };

  const stepCount = (hasPrep ? 1 : 0) + 1 + (hasRecall ? 1 : 0);

  return (
    <div className="space-y-4">
      {fromCurriculum ? (
        <div className="flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-primary">
          <GraduationCap className="h-4 w-4 shrink-0" />
          <span>
            From your <strong>{fromCurriculum}</strong> curriculum plan
          </span>
        </div>
      ) : null}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{careerName}</Badge>
          {domain ? <Badge variant="outline">{domain}</Badge> : null}
          <Badge className="bg-primary/90">{stepCount}-step lab module</Badge>
          {labIndex != null && labCount != null && labCount > 1 ? (
            <Badge variant="outline">Lab {labIndex} of {labCount}</Badge>
          ) : null}
        </div>
        <h3 className="text-lg font-bold">{moduleTitle}</h3>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {phase !== "complete" ? (
        <LabFlowStepper phase={phase} hasPrep={hasPrep} hasRecall={hasRecall} />
      ) : null}

      {phase === "prep" && prep ? (
        <PhaseQuestionPlayer
          questions={prep}
          phaseTitle="Step 1 · Warm-up"
          phaseDescription="Quick questions to focus on what matters in the hands-on lab next."
          questionLabel="Warm-up question"
          skipLabel="Skip warm-up → go to lab"
          continueLabel="Start hands-on lab (Step 2)"
          onSkip={() => goToPractice()}
          onComplete={(s) => goToPractice(s)}
        />
      ) : null}

      {phase === "practice" ? (
        <LabModuleFlowContext.Provider value={flowContext}>
          <Card className="border-muted bg-muted/20">
            <CardContent className="p-3 text-sm text-muted-foreground">
              <strong className="text-foreground">Step 2 · Hands-on lab.</strong>{" "}
              Complete the workspace below. Field checks and tasks grade your work as
              you go — this is practice inside the module, not a separate quiz.
            </CardContent>
          </Card>
          <SkillGameRenderer
            gameId={`${gameId}-practice`}
            gameType={gameType}
            content={content}
            title={moduleTitle}
            description={description}
            hideIntro
          />
        </LabModuleFlowContext.Provider>
      ) : null}

      {phase === "recall" && recall ? (
        <PhaseQuestionPlayer
          questions={recall}
          phaseTitle="Step 3 · Recall check"
          phaseDescription="See what stuck after the workspace — still part of this lab module."
          questionLabel="Recall question"
          skipLabel="Skip recall → finish module"
          continueLabel="Finish lab module"
          onSkip={() => finishModule()}
          onComplete={(s) => finishModule(s)}
        />
      ) : null}

      {phase === "complete" ? (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <Check className="h-6 w-6 text-emerald-600" />
              <p className="text-lg font-semibold">Lab module complete</p>
            </div>
            <p className="text-sm text-muted-foreground">
              You finished all steps of <strong>{moduleTitle}</strong>. Curriculum
              quizzes elsewhere cover broader course material — this module checked
              prep, practice, and recall in one place.
            </p>
            <ul className="space-y-1 text-sm">
              {hasPrep ? (
                <li>
                  Warm-up:{" "}
                  {prepScore !== null
                    ? `${prepScore} / ${prep?.length ?? 0} correct`
                    : "Skipped"}
                </li>
              ) : null}
              <li>Hands-on lab: Completed</li>
              {hasRecall ? (
                <li>
                  Recall:{" "}
                  {recallScore !== null
                    ? `${recallScore} / ${recall?.length ?? 0} correct`
                    : "Skipped"}
                </li>
              ) : null}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button onClick={onBackToTrack}>Back to all labs</Button>
              <Button variant="outline" onClick={restartModule}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Run module again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

/** Resolves prep/recall (custom or auto) and runs the 3-step lab module flow. */
export function LabModuleFlowHost({
  scopeKey,
  gameId,
  moduleTitle,
  careerName,
  domain,
  gameType,
  content,
  description = "",
  prep,
  recall,
  onBackToTrack,
  labIndex,
  labCount,
  fromCurriculum,
}: {
  scopeKey: string;
  gameId: string;
  moduleTitle: string;
  careerName: string;
  domain?: string;
  gameType: SkillGameType;
  content: SkillGameContent;
  description?: string;
  prep?: LabPhaseQuestion[];
  recall?: LabPhaseQuestion[];
  onBackToTrack: () => void;
  labIndex?: number;
  labCount?: number;
  fromCurriculum?: string;
}) {
  const meta: LabModuleMeta = {
    scopeKey,
    title: moduleTitle,
    description: description || moduleTitle,
    domain,
    gameType,
  };
  const phases = resolveLabPhases(meta, { prep, recall });

  return (
    <LabModuleFlow
      gameId={gameId}
      moduleTitle={moduleTitle}
      careerName={careerName}
      domain={domain}
      gameType={gameType}
      content={content}
      description={description}
      prep={phases.prep}
      recall={phases.recall}
      onBackToTrack={onBackToTrack}
      labIndex={labIndex}
      labCount={labCount}
      fromCurriculum={fromCurriculum}
    />
  );
}
