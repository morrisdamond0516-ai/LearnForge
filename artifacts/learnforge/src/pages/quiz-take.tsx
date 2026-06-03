import { useRefreshQuiz, useSubmitAttempt, getListAttemptsQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function QuizTake() {
  const { id } = useParams();
  const quizId = parseInt(id || "0");
  const refreshQuiz = useRefreshQuiz();
  const submitAttempt = useSubmitAttempt();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [advancing, setAdvancing] = useState(false);

  const startedRef = useRef(false);
  const { mutate: refreshMutate } = refreshQuiz;
  useEffect(() => {
    if (!quizId || startedRef.current) return;
    startedRef.current = true;
    refreshMutate({ id: quizId });
  }, [quizId, refreshMutate]);

  const quiz = refreshQuiz.data;

  if (!quizId || refreshQuiz.isError) {
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load quiz. Please go back and try again.
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4 animate-in fade-in duration-500">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <p className="text-lg font-medium">Preparing a fresh set of questions...</p>
        <p className="text-sm text-muted-foreground">
          Each attempt is newly generated so you learn the material, not the answers.
        </p>
      </div>
    );
  }

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
