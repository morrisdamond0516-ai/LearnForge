import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Award,
  Clock,
  ListChecks,
  Lock,
  Loader2,
  ArrowRight,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useExamCatalog, useStartExam } from "@/hooks/use-exams";

export default function Exams() {
  const { data, isLoading } = useExamCatalog();
  const startExam = useStartExam();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [startingSlug, setStartingSlug] = useState<string | null>(null);

  const pro = data?.pro ?? false;

  function start(slug: string) {
    setStartingSlug(slug);
    startExam.mutate(slug, {
      onSuccess: ({ quizId }) => setLocation(`/quizzes/${quizId}`),
      onError: (err) => {
        setStartingSlug(null);
        toast({
          title: "Couldn't start the exam",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <Award className="h-7 w-7 text-primary" />
            Certified Exams
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Full-length practice exams modeled on real high school, college, and
            trade certification tests. Pass with 70% or higher to earn a
            LearnForge certificate (valid for 90 days). Each attempt generates a
            fresh set of questions.
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/certificates">
            <ScrollText className="h-4 w-4" />
            My certificates
          </Link>
        </Button>
      </div>

      {!isLoading && !pro && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center gap-2 text-card-foreground">
            <Lock className="h-4 w-4 text-primary" />
            <p className="font-medium">Certified exams are a Pro feature.</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Upgrade to unlock every certified exam. Under-18 learners get them
            free during their first 9 months.
          </p>
          <Button asChild className="mt-3 gap-2">
            <Link href="/pricing">
              See plans
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        data?.categories.map((category) => (
          <section key={category.key} className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {category.label}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.exams.map((exam) => {
                const isStarting =
                  startExam.isPending && startingSlug === exam.slug;
                return (
                  <Card key={exam.slug} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg">{exam.name}</CardTitle>
                      <CardDescription>{exam.blurb}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto space-y-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <ListChecks className="h-4 w-4" />
                          {exam.questionCount} questions
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {exam.durationMin} min
                        </span>
                      </div>
                      {pro ? (
                        <Button
                          className="w-full gap-2"
                          disabled={startExam.isPending}
                          onClick={() => start(exam.slug)}
                        >
                          {isStarting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Building your exam...
                            </>
                          ) : (
                            <>Start exam</>
                          )}
                        </Button>
                      ) : (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full gap-2"
                        >
                          <Link href="/pricing">
                            <Lock className="h-4 w-4" />
                            Unlock with Pro
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
