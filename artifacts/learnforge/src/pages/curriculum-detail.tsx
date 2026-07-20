import {
  useGetCurriculum,
  getGetCurriculumQueryKey,
  useGetCurriculumProgress,
  getGetCurriculumProgressQueryKey,
  usePracticeCurriculumModule,
  useGenerateLesson,
} from "@workspace/api-client-react";
import { useState } from "react";
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
  Brain,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

function iconForType(type: string): LucideIcon {
  const t = type.toLowerCase();
  if (t.includes("book")) return BookOpen;
  if (t.includes("video")) return Video;
  if (t.includes("course")) return GraduationCap;
  if (t.includes("worksheet") || t.includes("practice")) return PenLine;
  if (t.includes("tool")) return Wrench;
  return FileText;
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
  const studyLesson = useGenerateLesson();
  const [studyingIndex, setStudyingIndex] = useState<number | null>(null);

  const startStudy = (index: number) => {
    if (!plan) return;
    const mod = plan.modules[index];
    if (!mod) return;
    const levelMap: Record<string, "Beginner" | "Intermediate" | "Advanced"> = {
      Beginner: "Beginner",
      Intermediate: "Intermediate",
      Advanced: "Advanced",
    };
    const level = levelMap[plan.level] ?? "Beginner";
    setStudyingIndex(index);
    studyLesson.mutate(
      {
        data: {
          topic: mod.title,
          level,
          focusAreas: mod.skills ?? [],
        },
      },
      {
        onSuccess: (lesson) => {
          setLocation(`/learn/lesson/${lesson.id}`);
        },
        onError: () => {
          setStudyingIndex(null);
          toast({
            title: "Could not generate lesson",
            description: "Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

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
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" /> Your Learning Path
        </h2>
        <div className="space-y-6">
          {plan.modules.map((mod, idx) => {
            const skills = mod.skills ?? [];
            const prog = progressByModule.get(idx);
            const hasAttempts = (prog?.attempts ?? 0) > 0;
            const mastered = prog?.mastered ?? false;
            const isPending = pendingIndex === idx;
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
                      {mod.objective && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {mod.objective}
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
                    <Button
                      variant="outline"
                      onClick={() => startStudy(idx)}
                      disabled={studyLesson.isPending || practice.isPending}
                    >
                      {studyingIndex === idx && studyLesson.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Brain className="mr-2 h-4 w-4" />
                      )}
                      {studyingIndex === idx && studyLesson.isPending
                        ? "Building lesson…"
                        : "Study this module"}
                    </Button>
                    <Button
                      onClick={() => startPractice(idx)}
                      disabled={practice.isPending || studyLesson.isPending}
                    >
                      {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Dumbbell className="mr-2 h-4 w-4" />
                      )}
                      {isPending
                        ? "Building your test..."
                        : hasAttempts
                          ? "Practice again"
                          : "Practice this module"}
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
