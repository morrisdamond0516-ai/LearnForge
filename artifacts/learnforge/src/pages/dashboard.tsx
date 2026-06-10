import {
  useGetDashboardSummary,
  useGetRecentActivity,
  useGetSubjectProgress,
  useDeleteAttempt,
  useDeleteQuiz,
  useDeleteLearnSession,
  useDeleteDocument,
  getGetRecentActivityQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetSubjectProgressQueryKey,
} from "@workspace/api-client-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Activity, BookOpen, GraduationCap, Upload, TrendingUp, Sparkles, BookType, ArrowRight, PlayCircle, HelpCircle, Trash2, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { startTour } from "@/components/welcome-tour";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: isLoadingActivity } = useGetRecentActivity();
  const { data: progress, isLoading: isLoadingProgress } = useGetSubjectProgress();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<{ type: string; rawId: string; title: string } | null>(null);
  const deleteAttempt = useDeleteAttempt();
  const deleteQuiz = useDeleteQuiz();
  const deleteLearnSession = useDeleteLearnSession();
  const deleteDocument = useDeleteDocument();

  const deletingId =
    deleteAttempt.isPending ? `attempt-${deleteAttempt.variables?.id}` :
    deleteQuiz.isPending ? `quiz-${deleteQuiz.variables?.id}` :
    deleteLearnSession.isPending ? `learn-${deleteLearnSession.variables?.id}` :
    deleteDocument.isPending ? `document-${deleteDocument.variables?.id}` :
    null;

  const handleDeleteActivity = (type: string, rawId: string) => {
    const id = parseInt(rawId, 10);
    if (!Number.isFinite(id)) return;
    const onSuccess = () => {
      toast({ title: "Removed from your activity" });
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetSubjectProgressQueryKey() });
    };
    const onError = () => toast({ title: "Could not remove that item", variant: "destructive" });
    const opts = { onSuccess, onError };
    if (type === "attempt") deleteAttempt.mutate({ id }, opts);
    else if (type === "quiz") deleteQuiz.mutate({ id }, opts);
    else if (type === "learn") deleteLearnSession.mutate({ id }, opts);
    else if (type === "document") deleteDocument.mutate({ id }, opts);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Here is an overview of your learning journey.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={startTour}>
            <PlayCircle className="mr-2 h-4 w-4" /> Take a quick tour
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/help">
              <HelpCircle className="mr-2 h-4 w-4" /> How it works
            </Link>
          </Button>
        </div>
      </div>

      {isLoadingSummary ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-12 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalQuizzes || 0}</div>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.averageScore ? `${Math.round(summary.averageScore)}%` : '-'}</div>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.documentsUploaded || 0}</div>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Guides</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.studyGuides || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Subject Progress</CardTitle>
            <CardDescription>Your current level across active subjects</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProgress ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : progress?.length ? (
              <div className="space-y-4">
                {progress.map((item) => (
                  <div key={item.subjectId} className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 font-semibold">
                      {item.subjectName.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{item.subjectName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.attempts} attempts • Avg: {Math.round(item.averageScore)}%
                      </p>
                    </div>
                    <div className="font-medium text-sm text-primary">{item.level}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No subjects studied yet.</p>
                <Link href="/subjects">
                  <Button variant="link" className="mt-2 text-primary">Browse subjects <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>What you've been up to</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : activity?.length ? (
              <div className="space-y-2">
                {activity.map((item) => {
                  const rawId = item.id.slice(item.id.indexOf("-") + 1);
                  const href =
                    item.type === "attempt" ? `/attempts/${rawId}` :
                    item.type === "quiz" ? `/quizzes/${rawId}` :
                    item.type === "learn" ? `/learn/${rawId}` :
                    item.type === "document" ? "/documents" :
                    null;
                  const actionLabel =
                    item.type === "attempt" ? "Review answers and mistakes" :
                    item.type === "quiz" ? "Take this test again" :
                    item.type === "learn" ? "Open study guide" :
                    item.type === "document" ? "View documents" :
                    null;
                  const icon =
                    item.type === "quiz" ? <GraduationCap className="h-4 w-4 text-primary" /> :
                    item.type === "learn" ? <BookType className="h-4 w-4 text-secondary-foreground" /> :
                    item.type === "attempt" ? <Activity className="h-4 w-4 text-accent" /> :
                    <Upload className="h-4 w-4" />;

                  const inner = (
                    <>
                      <div className="mr-4 mt-0.5 text-muted-foreground">{icon}</div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{item.title}</p>
                        {item.detail && <p className="text-xs text-muted-foreground">{item.detail}</p>}
                        {href && actionLabel && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                            {actionLabel} <ArrowRight className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                    </>
                  );

                  const isDeleting = deletingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-1 rounded-md -mx-2 px-2 hover-elevate transition-colors"
                    >
                      {href ? (
                        <Link href={href} className="flex flex-1 items-start py-2 min-w-0">
                          {inner}
                        </Link>
                      ) : (
                        <div className="flex flex-1 items-start py-2 min-w-0">{inner}</div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove from activity"
                        disabled={isDeleting}
                        onClick={() => setPendingDelete({ type: item.type, rawId, title: item.title })}
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity.</p>
                <div className="flex flex-col gap-2 mt-4 items-center">
                  <Link href="/quizzes">
                    <Button variant="outline" size="sm"><Sparkles className="mr-2 h-4 w-4" /> Generate a Quiz</Button>
                  </Link>
                  <Link href="/learn">
                    <Button variant="outline" size="sm"><BookOpen className="mr-2 h-4 w-4" /> Research a Topic</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => { if (!open) setPendingDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this item?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.type === "quiz"
                ? `This permanently deletes the test "${pendingDelete?.title}" and all of its past attempts. This cannot be undone.`
                : pendingDelete?.type === "document"
                ? `This permanently deletes the document "${pendingDelete?.title}". This cannot be undone.`
                : pendingDelete?.type === "learn"
                ? `This permanently deletes the study guide "${pendingDelete?.title}". This cannot be undone.`
                : `This permanently deletes this attempt and its results. This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deletingId !== null}
              onClick={(e) => {
                e.preventDefault();
                if (pendingDelete) handleDeleteActivity(pendingDelete.type, pendingDelete.rawId);
              }}
            >
              {deletingId !== null ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
