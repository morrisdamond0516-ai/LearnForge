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
import { Activity, BookOpen, GraduationCap, Upload, TrendingUp, Sparkles, BookType, ArrowRight, PlayCircle, HelpCircle, Trash2, Loader2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { startTour } from "@/components/welcome-tour";
import mascot from "@/assets/mascot.png";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const ACTIVITY_PAGE_SIZE = 6;

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: isLoadingActivity } = useGetRecentActivity();
  const { data: progress, isLoading: isLoadingProgress } = useGetSubjectProgress();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<{ type: string; rawId: string; title: string } | null>(null);
  const [activityPage, setActivityPage] = useState(0);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Download results through the app's authenticated fetch (cookie-based) and
  // save via a blob. A plain <a download> link does NOT carry the session, so
  // the server rejected it with 401 — this fixes that.
  const downloadResults = async (url: string, filename: string, key: string) => {
    setDownloadingId(key);
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast({ title: "Could not download your results", variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  };
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

  const totalActivity = activity?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalActivity / ACTIVITY_PAGE_SIZE));
  const safePage = Math.min(activityPage, totalPages - 1);
  const pagedActivity =
    activity?.slice(
      safePage * ACTIVITY_PAGE_SIZE,
      safePage * ACTIVITY_PAGE_SIZE + ACTIVITY_PAGE_SIZE,
    ) ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            src={mascot}
            alt=""
            aria-hidden="true"
            className="hidden h-14 w-14 shrink-0 drop-shadow-sm sm:block"
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Here is an overview of your learning journey.</p>
          </div>
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
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>What you've been up to</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={downloadingId === "all"}
              onClick={() =>
                downloadResults(
                  `${basePath}/api/me/results/export`,
                  "learnforge-results.csv",
                  "all",
                )
              }
            >
              {downloadingId === "all" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download results
            </Button>
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
                {pagedActivity.map((item) => {
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
                      {item.type === "attempt" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Download this result"
                          disabled={downloadingId === item.id}
                          onClick={() =>
                            downloadResults(
                              `${basePath}/api/me/results/${rawId}/export`,
                              `learnforge-result-${rawId}.csv`,
                              item.id,
                            )
                          }
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
                        >
                          {downloadingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        </Button>
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
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={safePage === 0}
                      onClick={() => setActivityPage((p) => Math.max(0, p - 1))}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Page {safePage + 1} of {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={safePage >= totalPages - 1}
                      onClick={() => setActivityPage((p) => Math.min(totalPages - 1, p + 1))}
                    >
                      Next <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="pt-3 text-xs text-muted-foreground">
                  Activity is automatically cleared after 90 days to keep things
                  fast. Saved items (subjects, study guides, curricula, and
                  career plans) stay until you delete them. Download your results
                  anytime with the button above.
                </p>
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
