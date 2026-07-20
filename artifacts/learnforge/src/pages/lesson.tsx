import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import {
  useGetLessonById,
  getGetLessonByIdQueryKey,
  useStartLessonPractice,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  XCircle,
  Lightbulb,
  BookMarked,
  Trophy,
  Zap,
  Loader2,
} from "lucide-react";
import type { LessonSection, LessonKeyTerm } from "@workspace/api-client-react";

type AnswerState = {
  selected: number;
  revealed: boolean;
};

function CheckQuestion({
  question,
  answer,
  onAnswer,
}: {
  question: LessonSection["checkQuestion"];
  answer: AnswerState | null;
  onAnswer: (idx: number) => void;
}) {
  const revealed = answer?.revealed ?? false;
  const selected = answer?.selected ?? -1;
  const correct = question.correctIndex;

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5 space-y-4">
      <p className="font-semibold text-sm uppercase tracking-wider text-primary flex items-center gap-2">
        <Zap className="h-4 w-4" /> Check your understanding
      </p>
      <p className="text-base font-medium leading-snug">{question.prompt}</p>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          let variant: string =
            "border border-border bg-background hover:bg-muted text-foreground";
          if (revealed) {
            if (i === correct) {
              variant =
                "border-2 border-green-500 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200 font-semibold";
            } else if (i === selected && i !== correct) {
              variant =
                "border-2 border-destructive bg-destructive/10 text-destructive font-semibold";
            } else {
              variant = "border border-border/40 bg-muted/40 text-muted-foreground";
            }
          } else if (selected === i) {
            variant =
              "border-2 border-primary bg-primary/10 text-primary font-semibold";
          }

          return (
            <button
              key={i}
              disabled={revealed}
              onClick={() => !revealed && onAnswer(i)}
              className={`w-full text-left rounded-lg px-4 py-3 text-sm transition-colors cursor-pointer disabled:cursor-default ${variant}`}
            >
              <span className="font-bold mr-2">
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div
          className={`flex items-start gap-3 rounded-lg p-4 text-sm ${
            selected === correct
              ? "bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200"
              : "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200"
          }`}
        >
          {selected === correct ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <span>{question.explanation}</span>
        </div>
      )}
    </div>
  );
}

function KeyTermsGlossary({ terms }: { terms: LessonKeyTerm[] }) {
  if (terms.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <BookMarked className="h-5 w-5 text-primary" /> Key Terms
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {terms.map((kt, i) => (
          <div
            key={i}
            className="rounded-lg border bg-muted/40 p-4 space-y-1"
          >
            <p className="font-semibold text-sm text-foreground">{kt.term}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {kt.definition}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const lessonId = parseInt(id || "0");
  const [, setLocation] = useLocation();

  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Map<number, AnswerState>>(new Map());
  const [done, setDone] = useState(false);

  const startPractice = useStartLessonPractice();

  const { data: lesson, isLoading, error } = useGetLessonById(lessonId, {
    query: {
      enabled: !!lessonId,
      queryKey: getGetLessonByIdQueryKey(lessonId),
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <p className="text-destructive font-medium">Lesson not found.</p>
        <Link href="/learn">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learn
          </Button>
        </Link>
      </div>
    );
  }

  const totalSections = lesson.sections.length;
  const section = lesson.sections[currentSection];
  const currentAnswer = answers.get(currentSection) ?? null;
  const isAnswered = currentAnswer?.revealed ?? false;
  const isLastSection = currentSection === totalSections - 1;
  const progress = done ? 100 : Math.round((currentSection / totalSections) * 100);

  const handleAnswer = (idx: number) => {
    const next = new Map(answers);
    next.set(currentSection, { selected: idx, revealed: true });
    setAnswers(next);
  };

  const handleNext = () => {
    if (isLastSection) {
      setDone(true);
    } else {
      setCurrentSection((n) => n + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const levelColors: Record<string, string> = {
    Beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    Advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  };
  const levelClass = levelColors[lesson.level] ?? levelColors["Beginner"];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="space-y-4">
        <Link href="/learn">
          <Button variant="ghost" className="-ml-4 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learn
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${levelClass}`}>
            {lesson.level}
          </span>
          {lesson.subjectName && (
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
              {lesson.subjectName}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
          {lesson.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {lesson.summary}
        </p>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {done
                ? "All sections complete"
                : `Section ${currentSection + 1} of ${totalSections}`}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {!done && section ? (
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                {currentSection + 1}
              </span>
              <h2 className="text-2xl font-bold tracking-tight">
                {section.heading}
              </h2>
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
            {section.content.split(/\n\n+/).map((para, i) => (
              <p key={i} className="text-base leading-relaxed text-foreground">
                {para}
              </p>
            ))}
          </div>

          <Card className="border-l-4 border-l-amber-400 bg-amber-50/50 dark:bg-amber-950/20 shadow-none">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> Worked Example
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {section.example.split(/\n\n+/).map((para, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-foreground/90 mb-2 last:mb-0 font-mono whitespace-pre-wrap"
                >
                  {para}
                </p>
              ))}
            </CardContent>
          </Card>

          {section.practicalTip && (
            <Card className="border-l-4 border-l-blue-400 bg-blue-50/50 dark:bg-blue-950/20 shadow-none">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Pro Tip
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm leading-relaxed text-foreground/90">
                  {section.practicalTip}
                </p>
              </CardContent>
            </Card>
          )}

          <CheckQuestion
            question={section.checkQuestion}
            answer={currentAnswer}
            onAnswer={handleAnswer}
          />

          {isAnswered && (
            <div className="flex justify-end">
              <Button onClick={handleNext} size="lg">
                {isLastSection ? (
                  <>
                    <Trophy className="mr-2 h-5 w-5" /> Finish Lesson
                  </>
                ) : (
                  <>
                    Next Section <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : done ? (
        <div className="space-y-10">
          <Card className="border-2 border-primary/30 bg-primary/5 text-center py-10 px-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Lesson Complete!</h2>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  You worked through all {totalSections} sections of this
                  lesson. Now test what you learned with a practice quiz.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                <Button
                  size="lg"
                  disabled={startPractice.isPending}
                  onClick={() =>
                    startPractice.mutate(
                      { id: lessonId },
                      {
                        onSuccess: (quiz) =>
                          setLocation(`/quizzes/${quiz.id}`),
                      },
                    )
                  }
                >
                  {startPractice.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Building your quiz…</>
                  ) : (
                    <><BookOpen className="mr-2 h-5 w-5" /> Take a Practice Quiz</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setCurrentSection(0);
                    setAnswers(new Map());
                    setDone(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Review Lesson Again
                </Button>
              </div>
            </div>
          </Card>

          <KeyTermsGlossary terms={lesson.keyTerms} />

          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Sections Covered
            </h3>
            <div className="space-y-2">
              {lesson.sections.map((sec, i) => {
                const a = answers.get(i);
                const got = a
                  ? a.selected === sec.checkQuestion.correctIndex
                  : false;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm py-2 border-b border-border/50 last:border-0"
                  >
                    {got ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className={got ? "text-foreground" : "text-muted-foreground"}>
                      {sec.heading}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
