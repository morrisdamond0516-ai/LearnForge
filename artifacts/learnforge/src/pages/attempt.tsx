import { useState } from "react";
import { useGetAttempt, useExplainQuestion, useGenerateCurriculum, getGetAttemptQueryKey } from "@workspace/api-client-react";
import type { ExplainQuestion200 } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, CheckCircle2, XCircle, Brain,
  BookOpen, RotateCcw, Loader2, Lightbulb,
  ChevronDown, ChevronUp, BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Attempt() {
  const { id } = useParams();
  const attemptId = parseInt(id || "0");
  const { data: attempt, isLoading, error } = useGetAttempt(attemptId, {
    query: { enabled: !!attemptId, queryKey: getGetAttemptQueryKey(attemptId) },
  });
  const explainMutation = useExplainQuestion();
  const generateCurriculum = useGenerateCurriculum();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [breakdowns, setBreakdowns] = useState<Record<number, ExplainQuestion200>>({});
  const [loadingBreakdown, setLoadingBreakdown] = useState<Record<number, boolean>>({});
  const [expandedBreakdowns, setExpandedBreakdowns] = useState<Record<number, boolean>>({});

  if (isLoading) return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
  if (error || !attempt) return (
    <div className="p-8 text-center text-destructive">Failed to load results.</div>
  );

  const scoreColor =
    attempt.score >= 80 ? "text-green-500" :
    attempt.score >= 60 ? "text-yellow-500" :
    "text-red-500";

  const wrongResults = attempt.results.filter(r => !r.correct);

  const handleBuildCurriculum = () => {
    const subject = attempt.subjectName ?? attempt.quizTitle ?? "";
    if (!subject.trim() || generateCurriculum.isPending) return;
    generateCurriculum.mutate(
      {
        data: {
          subject: subject.trim(),
          ...(attempt.subjectId != null ? { subjectId: attempt.subjectId } : {}),
          level: attempt.level,
          ...(wrongResults.length > 0
            ? { focusAreas: wrongResults.map(r => r.prompt) }
            : {}),
        },
      },
      {
        onSuccess: (plan) => setLocation(`/curriculum/${plan.id}`),
        onError: () =>
          toast({
            title: "Failed to build curriculum",
            variant: "destructive",
          }),
      },
    );
  };

  const handleBreakdown = (result: typeof attempt.results[0]) => {
    if (loadingBreakdown[result.questionId]) return;

    if (breakdowns[result.questionId]) {
      setExpandedBreakdowns(prev => ({
        ...prev,
        [result.questionId]: !prev[result.questionId],
      }));
      return;
    }

    setLoadingBreakdown(prev => ({ ...prev, [result.questionId]: true }));
    setExpandedBreakdowns(prev => ({ ...prev, [result.questionId]: true }));

    explainMutation.mutate(
      {
        data: {
          prompt: result.prompt,
          options: result.options,
          correctIndex: result.correctIndex,
          selectedIndex: result.selectedIndex,
          subject: attempt.subjectName ?? null,
        },
      },
      {
        onSuccess: (data) => {
          setBreakdowns(prev => ({ ...prev, [result.questionId]: data }));
          setLoadingBreakdown(prev => ({ ...prev, [result.questionId]: false }));
        },
        onError: () => {
          setLoadingBreakdown(prev => ({ ...prev, [result.questionId]: false }));
          setExpandedBreakdowns(prev => ({ ...prev, [result.questionId]: false }));
        },
      },
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      <Link href="/quizzes">
        <Button variant="ghost" className="-ml-4 text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
        </Button>
      </Link>

      {/* Score card */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 border-b border-border text-center">
            <div className={cn("text-7xl font-black mb-3 tracking-tighter tabular-nums", scoreColor)}>
              {Math.round(attempt.score)}%
            </div>
            <Badge variant="outline" className="text-sm font-semibold px-4 py-1 mb-2">
              {attempt.level}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">{attempt.quizTitle || "Untitled Quiz"}</p>
          </div>
          <CardContent className="p-6 space-y-0">
            <div className="flex justify-between items-center py-4 border-b border-border">
              <span className="text-muted-foreground">Correct Answers</span>
              <span className="font-bold text-lg">{attempt.correctCount} / {attempt.totalQuestions}</span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-medium text-sm">{new Date(attempt.completedAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {attempt.feedback && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">
                AI Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-foreground/80">
              {attempt.feedback}
            </CardContent>
          </Card>
        )}
      </div>

      {/* What to Study Next */}
      {wrongResults.length === 0 ? (
        <Card className="border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/10 text-center p-8">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Perfect Score</h3>
          <p className="text-muted-foreground mb-6">
            You answered every question correctly. Time to level up.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {attempt.subjectId != null && (
              <Link href={`/quizzes?subject=${attempt.subjectId}`}>
                <Button variant="outline">Try a harder challenge</Button>
              </Link>
            )}
            <Button onClick={handleBuildCurriculum} disabled={generateCurriculum.isPending} className="gap-2">
              {generateCurriculum.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Building your plan...</>
                : <><BookMarked className="h-4 w-4" /> Build my curriculum</>}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-amber-600" />
              What to Study Next
            </CardTitle>
            <CardDescription>
              You missed {wrongResults.length} question{wrongResults.length !== 1 ? "s" : ""}.
              Use these resources to close the gaps.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-3">
              {attempt.subjectId != null && attempt.subjectName && (
                <>
                  <Link href={`/quizzes?subject=${attempt.subjectId}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Practice {attempt.subjectName} again
                    </Button>
                  </Link>
                  <Link href={`/learn?topic=${encodeURIComponent(attempt.subjectName)}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <BookOpen className="h-4 w-4" />
                      Study Guide for {attempt.subjectName}
                    </Button>
                  </Link>
                </>
              )}
              {attempt.subjectId == null && (
                <>
                  <Link href={`/quizzes/${attempt.quizId}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Retake this test
                    </Button>
                  </Link>
                  <Link href="/quizzes">
                    <Button variant="outline" size="sm" className="gap-2">
                      Try a different quiz
                    </Button>
                  </Link>
                </>
              )}
              <Button
                onClick={handleBuildCurriculum}
                disabled={generateCurriculum.isPending}
                size="sm"
                className="gap-2"
              >
                {generateCurriculum.isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Building your plan...</>
                  : <><BookMarked className="h-4 w-4" /> Build my curriculum</>}
              </Button>
            </div>
            <Separator className="bg-amber-200/60 dark:bg-amber-900/40" />
            <div>
              <p className="text-sm font-semibold mb-3">Questions to revisit:</p>
              <ul className="space-y-2">
                {wrongResults.map(r => (
                  <li key={r.questionId} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-1">{r.prompt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      <div className="space-y-5">
        <h2 className="text-2xl font-bold tracking-tight">Question Breakdown</h2>

        {attempt.results.map((result, i) => (
          <Card
            key={result.questionId}
            className={cn(
              "border-l-4 shadow-sm transition-shadow hover:shadow-md",
              result.correct ? "border-l-green-500" : "border-l-red-500",
            )}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 shrink-0">
                  {result.correct
                    ? <CheckCircle2 className="h-6 w-6 text-green-500" />
                    : <XCircle className="h-6 w-6 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                    Question {i + 1}
                  </span>
                  <CardTitle className="text-xl font-serif leading-relaxed">{result.prompt}</CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pl-14 space-y-4">
              {/* Answer options */}
              <div className="space-y-2">
                {result.options.map((option, idx) => {
                  const isSelected = result.selectedIndex === idx;
                  const isCorrect = result.correctIndex === idx;

                  let classes = "bg-muted/30 border-transparent";
                  if (isSelected && isCorrect) classes = "bg-green-500/10 border-green-500/30";
                  else if (isSelected && !isCorrect) classes = "bg-red-500/10 border-red-500/30";
                  else if (!isSelected && isCorrect) classes = "bg-green-500/5 border-dashed border-green-500/30";

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-lg border text-sm font-medium flex items-center gap-2",
                        classes,
                      )}
                    >
                      <span className="w-5 opacity-50 shrink-0">{String.fromCharCode(65 + idx)}.</span>
                      <span className="flex-1">{option}</span>
                      {isSelected && (
                        <span className="ml-auto text-xs uppercase tracking-wider font-bold opacity-60 shrink-0">
                          Your answer
                        </span>
                      )}
                      {!isSelected && isCorrect && (
                        <span className="ml-auto text-xs uppercase tracking-wider font-bold text-green-600 shrink-0">
                          Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Short explanation */}
              {result.explanation && (
                <div className="bg-muted/60 p-4 rounded-lg text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground block mb-1">Explanation</span>
                  {result.explanation}
                </div>
              )}

              {/* Break it down — wrong answers only */}
              {!result.correct && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBreakdown(result)}
                    disabled={loadingBreakdown[result.questionId]}
                    className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
                  >
                    {loadingBreakdown[result.questionId] ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Generating breakdown...</>
                    ) : breakdowns[result.questionId] ? (
                      expandedBreakdowns[result.questionId]
                        ? <><ChevronUp className="h-4 w-4" /> Hide breakdown</>
                        : <><ChevronDown className="h-4 w-4" /> Show breakdown</>
                    ) : (
                      <><Lightbulb className="h-4 w-4" /> Break it down for me</>
                    )}
                  </Button>

                  {expandedBreakdowns[result.questionId] && breakdowns[result.questionId] && (
                    <div className="bg-primary/[0.04] border border-primary/[0.12] rounded-xl p-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                      {/* Steps */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                          Step-by-Step
                        </h4>
                        <ol className="space-y-3">
                          {breakdowns[result.questionId].steps.map((step, idx) => (
                            <li key={idx} className="flex gap-3 text-sm leading-relaxed">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Worked example */}
                      {breakdowns[result.questionId].example && (
                        <div className="bg-card border border-border rounded-lg p-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                            Worked Example
                          </h4>
                          <p className="text-sm leading-relaxed whitespace-pre-line">
                            {breakdowns[result.questionId].example}
                          </p>
                        </div>
                      )}

                      {/* Tip */}
                      {breakdowns[result.questionId].tip && (
                        <div className="flex gap-3 items-start bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg p-3">
                          <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
                            {breakdowns[result.questionId].tip}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
