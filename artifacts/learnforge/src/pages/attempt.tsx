import { useGetAttempt, getGetAttemptQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, XCircle, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Attempt() {
  const { id } = useParams();
  const attemptId = parseInt(id || "0");
  const { data: attempt, isLoading, error } = useGetAttempt(attemptId, { query: { enabled: !!attemptId, queryKey: getGetAttemptQueryKey(attemptId) } });

  if (isLoading) return <div className="p-8 space-y-6 max-w-4xl mx-auto"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  if (error || !attempt) return <div className="p-8 text-center text-destructive">Failed to load results.</div>;

  const scoreColor = attempt.score >= 80 ? "text-green-500" : attempt.score >= 60 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <Link href="/quizzes">
        <Button variant="ghost" className="-ml-4 text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes</Button>
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-card overflow-hidden">
          <div className="bg-primary/5 p-8 border-b border-border text-center">
            <Award className={cn("h-16 w-16 mx-auto mb-4", scoreColor)} />
            <h1 className="text-4xl font-bold mb-2 text-foreground">{attempt.score}%</h1>
            <p className="text-xl text-muted-foreground font-medium">{attempt.level}</p>
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between items-center py-4 border-b border-border">
              <span className="text-muted-foreground">Quiz</span>
              <span className="font-medium text-right">{attempt.quizTitle || "Untitled Quiz"}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-border">
              <span className="text-muted-foreground">Correct Answers</span>
              <span className="font-medium">{attempt.correctCount} / {attempt.totalQuestions}</span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-muted-foreground">Completed At</span>
              <span className="font-medium">{new Date(attempt.completedAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {attempt.feedback && (
          <Card className="bg-accent text-accent-foreground">
            <CardHeader>
              <CardTitle>AI Feedback</CardTitle>
            </CardHeader>
            <CardContent className="leading-relaxed">
              {attempt.feedback}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold tracking-tight">Detailed Results</h2>
        {attempt.results.map((result, i) => (
          <Card key={result.questionId} className={cn("border-l-4 shadow-sm", result.correct ? "border-l-green-500" : "border-l-red-500")}>
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {result.correct ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <XCircle className="h-6 w-6 text-red-500" />}
                </div>
                <div>
                  <span className="text-sm font-bold text-muted-foreground mb-1 block">Question {i + 1}</span>
                  <CardTitle className="text-xl font-serif leading-relaxed">{result.prompt}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-14 space-y-6">
              <div className="space-y-2">
                {result.options.map((option, idx) => {
                  const isSelected = result.selectedIndex === idx;
                  const isCorrect = result.correctIndex === idx;
                  
                  let bg = "bg-muted/30 border-transparent";
                  let border = "";
                  
                  if (isSelected && isCorrect) {
                    bg = "bg-green-500/10";
                    border = "border-green-500/30";
                  } else if (isSelected && !isCorrect) {
                    bg = "bg-red-500/10";
                    border = "border-red-500/30";
                  } else if (!isSelected && isCorrect) {
                    bg = "bg-green-500/5 border-dashed";
                    border = "border-green-500/30";
                  }

                  return (
                    <div key={idx} className={cn("p-3 rounded-lg border text-sm font-medium flex items-center", bg, border)}>
                      <span className="w-6 opacity-50">{String.fromCharCode(65 + idx)}.</span>
                      {option}
                      {isSelected && <span className="ml-auto text-xs uppercase tracking-wider font-bold opacity-70">Your Answer</span>}
                      {!isSelected && isCorrect && <span className="ml-auto text-xs uppercase tracking-wider font-bold text-green-600 opacity-70">Correct Answer</span>}
                    </div>
                  );
                })}
              </div>
              
              {result.explanation && (
                <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                  <span className="font-bold text-foreground block mb-1">Explanation</span>
                  {result.explanation}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
