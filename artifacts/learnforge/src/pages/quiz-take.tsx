import { useGetQuiz, useSubmitAttempt, getListAttemptsQueryKey, getGetQuizQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function QuizTake() {
  const { id } = useParams();
  const quizId = parseInt(id || "0");
  const { data: quiz, isLoading, error } = useGetQuiz(quizId, { query: { enabled: !!quizId, queryKey: getGetQuizQueryKey(quizId) } });
  const submitAttempt = useSubmitAttempt();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [advancing, setAdvancing] = useState(false);

  if (isLoading) return <div className="p-8 space-y-4 max-w-3xl mx-auto"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-64 w-full" /></div>;
  if (error || !quiz) return <div className="p-8 text-center text-destructive">Failed to load quiz.</div>;

  const currentQuestion = quiz.questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === quiz.questions.length - 1;
  const isAnswered = answers[currentQuestion.id] !== undefined;

  const handleSelect = (optionIdx: number) => {
    if (advancing || answers[currentQuestion.id] !== undefined) return;
    const newAnswers = { ...answers, [currentQuestion.id]: optionIdx };
    setAnswers(newAnswers);

    if (!isLastQuestion) {
      setAdvancing(true);
      setTimeout(() => {
        setCurrentQuestionIdx(prev => prev + 1);
        setAdvancing(false);
      }, 600);
    } else {
      const allAnswered = Object.keys(newAnswers).length === quiz.questions.length;
      if (allAnswered) {
        setTimeout(() => {
          const answersArray = quiz.questions.map(q => newAnswers[q.id] ?? -1);
          submitAttempt.mutate({ id: quizId, data: { answers: answersArray } }, {
            onSuccess: (attempt) => {
              queryClient.invalidateQueries({ queryKey: getListAttemptsQueryKey() });
              setLocation(`/attempts/${attempt.id}`);
            },
            onError: () => {
              toast({ title: "Failed to submit quiz", variant: "destructive" });
            }
          });
        }, 700);
      }
    }
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const answersArray = quiz.questions.map(q => answers[q.id] ?? -1);
    submitAttempt.mutate({ id: quizId, data: { answers: answersArray } }, {
      onSuccess: (attempt) => {
        toast({ title: "Quiz submitted!" });
        queryClient.invalidateQueries({ queryKey: getListAttemptsQueryKey() });
        setLocation(`/attempts/${attempt.id}`);
      },
      onError: () => {
        toast({ title: "Failed to submit quiz", variant: "destructive" });
      }
    });
  };

  const progress = ((currentQuestionIdx) / quiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 py-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-muted-foreground uppercase tracking-wider">{quiz.title}</span>
          <span className="text-primary">Question {currentQuestionIdx + 1} of {quiz.questions.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-t-4 border-t-primary shadow-lg">
        <CardHeader className="pb-8">
          <CardTitle className="text-2xl leading-relaxed font-serif">{currentQuestion.prompt}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = answers[currentQuestion.id] === idx;
            return (
              <div 
                key={idx}
                onClick={() => handleSelect(idx)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3",
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-sm" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold",
                  isSelected ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground text-muted-foreground"
                )}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-lg">{option}</span>
              </div>
            );
          })}
        </CardContent>
        <CardFooter className="pt-6 flex justify-between border-t border-border mt-4">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIdx === 0 || submitAttempt.isPending}>
            Previous
          </Button>

          {submitAttempt.isPending ? (
            <Button disabled className="bg-primary text-primary-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </Button>
          ) : !isLastQuestion ? (
            <Button onClick={handleNext} disabled={!isAnswered}>
              Next Question
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== quiz.questions.length}
              className="bg-primary text-primary-foreground"
            >
              Submit Quiz
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
