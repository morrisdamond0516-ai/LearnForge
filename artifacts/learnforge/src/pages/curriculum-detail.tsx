import {
  useGetCurriculum,
  getGetCurriculumQueryKey,
  useGetCurriculumProgress,
  getGetCurriculumProgressQueryKey,
  usePracticeCurriculumModule,
} from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  BookOpen,
  Video,
  Wrench,
  FileText,
  GraduationCap,
  PenLine,
  ListChecks,
  MapPin,
  User,
  Target,
  Loader2,
  CheckCircle2,
  Trophy,
  Dumbbell,
  Table2,
  Gamepad2,
  FlaskConical,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { resolveCurriculumSim, resolveCurriculumLabTrack, labForCurriculumModule } from "@/lib/educational-games/curriculum-sim-link";

function iconForType(type: string): LucideIcon {
  const t = type.toLowerCase();
  if (t.includes("book")) return BookOpen;
  if (t.includes("video")) return Video;
  if (t.includes("course")) return GraduationCap;
  if (t.includes("worksheet") || t.includes("practice")) return PenLine;
  if (t.includes("tool")) return Wrench;
  return FileText;
}

function stripSimSuffix(objective: string): string {
  return objective.replace(/\s*\(Sim:\s*[^)]+\)\s*$/i, "").trim();
}

export default function CurriculumDetail() {
  const { id } = useParams();
  const curriculumId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const {
    data: plan,
    isLoading,
    error,
  } = useGetCurriculum(curriculumId, {
    query: {
      enabled: !!curriculumId,
      queryKey: getGetCurriculumQueryKey(curriculumId),
    },
  });

  const { data: progress } = useGetCurriculumProgress(curriculumId, {
    query: {
      enabled: !!curriculumId,
      queryKey: getGetCurriculumProgressQueryKey(curriculumId),
    },
  });

  const practice = usePracticeCurriculumModule();
  const sim = plan ? resolveCurriculumSim(plan.subject) : null;
  const labTrack = plan ? resolveCurriculumLabTrack(plan.subject) : [];
  const hasMultiLabTrack = labTrack.length > 1;

  const startPractice = (index: number) => {
    practice.mutate(
      { id: curriculumId, index },
      {
        onSuccess: (res) => {
          setLocation(`/quizzes/${res.quizId}`);
        },
        onError: () => {
          toast({
            title: "Could not start practice",
            description: "Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  if (isLoading)
    return (
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  if (error || !plan)
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load curriculum.
      </div>
    );

  const progressByModule = new Map(
    (progress ?? []).map((p) => [p.moduleIndex, p]),
  );
  const masteredCount = (progress ?? []).filter((p) => p.mastered).length;
  const pendingIndex = practice.isPending
    ? (practice.variables?.index ?? null)
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="space-y-6">
        <Link href="/curriculum">
          <Button variant="ghost" className="-ml-4 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Curriculum
          </Button>
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium tracking-wide uppercase">
              {plan.subject}
            </span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide uppercase">
              {plan.level}
            </span>
            {plan.modules.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium tracking-wide">
                {masteredCount} of {plan.modules.length} modules mastered
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            {plan.title}
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-primary pl-6 py-2">
          {plan.summary}
        </p>

        {hasMultiLabTrack ? (
          <Card className="border-2 border-primary/30 bg-primary/5 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
                <Gamepad2 className="h-4 w-4" />
                Hands-on labs ({labTrack.length}) — open each from this plan
              </CardTitle>
              <p className="text-sm text-muted-foreground font-normal">
                {sim?.emoji} {plan.subject} includes a full lab track. Use these
                links to jump into every lab (not just one).
              </p>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {labTrack.map((lab, i) => (
                <div
                  key={lab.id}
                  className="flex flex-col gap-3 rounded-lg border bg-background/80 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {i + 1}. {lab.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lab.isWorkspace ? "Hands-on workspace" : "Scenario drill"} ·{" "}
                      {lab.formatLabel} · {lab.domain} · {lab.duration}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {lab.description}
                    </p>
                  </div>
                  <Button asChild size="sm" className="shrink-0">
                    <Link href={lab.href}>Open lab</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          sim && (
            <Card className="border-2 border-primary/30 bg-primary/5 shadow-sm">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                    {sim.gameType === "spreadsheet-workspace" ? (
                      <Table2 className="h-4 w-4" />
                    ) : sim.gameType === "lab-bench-workspace" ||
                      sim.gameType === "sim-canvas-workspace" ? (
                      <FlaskConical className="h-4 w-4" />
                    ) : (
                      <Gamepad2 className="h-4 w-4" />
                    )}
                    Hands-on lab (do this first)
                  </p>
                  <p className="text-base font-medium text-foreground">
                    {sim.emoji} {sim.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {sim.formatLabel} — {sim.description}
                  </p>
                </div>
                <Button asChild size="lg" className="shrink-0">
                  <Link href={sim.href}>{sim.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" /> Your Learning Path
        </h2>
        <p className="text-sm text-muted-foreground -mt-4">
          {hasMultiLabTrack
            ? "Each module: open its matched lab, then take the quiz until you score 80%+."
            : sim
              ? "Each module: practice in the lab above, then take the quiz until you score 80%+."
              : "Practice each module with the quiz until you score 80%+."}
        </p>
        <div className="space-y-6">
          {plan.modules.map((mod, idx) => {
            const skills = mod.skills ?? [];
            const prog = progressByModule.get(idx);
            const hasAttempts = (prog?.attempts ?? 0) > 0;
            const mastered = prog?.mastered ?? false;
            const isPending = pendingIndex === idx;
            const objective = stripSimSuffix(mod.objective ?? "");
            const moduleLab =
              labForCurriculumModule(plan.subject, idx) ??
              (sim
                ? {
                    href: sim.href,
                    title: sim.title,
                    formatLabel: sim.formatLabel,
                  }
                : null);
            return (
              <Card
                key={idx}
                className={`border-l-4 shadow-sm ${
                  mastered ? "border-l-primary" : "border-l-secondary"
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex-shrink-0 w-9 h-9 rounded-full text-sm font-bold flex items-center justify-center ${
                        mastered
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {mastered ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold tracking-tight">
                          {mod.title}
                        </h3>
                        {mastered && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                            <Trophy className="h-3.5 w-3.5" /> Mastered
                          </span>
                        )}
                      </div>
                      {objective && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {objective}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {skills.length > 0 && (
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <Target className="h-4 w-4 text-primary" /> What you
                        will practice and master
                      </p>
                      <ul className="grid gap-1.5 sm:grid-cols-2">
                        {skills.map((skill, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {moduleLab && (
                      <Button variant="secondary" asChild>
                        <Link href={moduleLab.href}>
                          {sim?.gameType === "spreadsheet-workspace" ? (
                            <Table2 className="mr-2 h-4 w-4" />
                          ) : sim?.gameType === "lab-bench-workspace" ||
                            sim?.gameType === "sim-canvas-workspace" ? (
                            <FlaskConical className="mr-2 h-4 w-4" />
                          ) : (
                            <Gamepad2 className="mr-2 h-4 w-4" />
                          )}
                          {hasMultiLabTrack
                            ? `Lab: ${moduleLab.title}`
                            : "Lab"}
                        </Link>
                      </Button>
                    )}
                    <Button
                      onClick={() => startPractice(idx)}
                      disabled={practice.isPending}
                      variant={moduleLab ? "outline" : "default"}
                    >
                      {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Dumbbell className="mr-2 h-4 w-4" />
                      )}
                      {isPending
                        ? "Building your test..."
                        : hasAttempts
                          ? "Practice quiz again"
                          : "Practice quiz"}
                    </Button>
                    {hasAttempts && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Best score:{" "}
                          <span className="font-semibold text-foreground">
                            {Math.round(prog?.bestScore ?? 0)}%
                          </span>
                        </span>
                        <span>
                          {prog?.attempts}{" "}
                          {prog?.attempts === 1 ? "attempt" : "attempts"}
                        </span>
                      </div>
                    )}
                  </div>

                  {mod.materials.length > 0 && (
                    <details className="group pt-2">
                      <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground select-none">
                        Optional extra resources ({mod.materials.length})
                      </summary>
                      <div className="grid gap-4 md:grid-cols-2 mt-4">
                        {mod.materials.map((mat, i) => {
                          const Icon = iconForType(mat.type);
                          return (
                            <Card
                              key={i}
                              className="h-full border-l-4 border-l-muted shadow-none bg-muted/30"
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium uppercase tracking-wider">
                                    {mat.type}
                                  </span>
                                </div>
                                <CardTitle className="text-base leading-snug">
                                  {mat.name}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm text-muted-foreground">
                                {mat.author && (
                                  <span className="flex items-center gap-2">
                                    <User className="h-3.5 w-3.5 shrink-0" />
                                    {mat.author}
                                  </span>
                                )}
                                {mat.description && (
                                  <p className="leading-relaxed">
                                    {mat.description}
                                  </p>
                                )}
                                {mat.whereToFind && (
                                  <span className="flex items-start gap-2 text-foreground/70">
                                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    <span>{mat.whereToFind}</span>
                                  </span>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {plan.nextSteps && plan.nextSteps.length > 0 && (
        <Card className="bg-muted/50 border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="h-5 w-5" /> Where to Start
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-decimal pl-4 space-y-2 text-sm text-muted-foreground">
              {plan.nextSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
