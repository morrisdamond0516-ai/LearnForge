import { useGetDashboardSummary, useGetRecentActivity, useGetSubjectProgress } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BookOpen, GraduationCap, Upload, TrendingUp, Sparkles, BookType, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: isLoadingActivity } = useGetRecentActivity();
  const { data: progress, isLoading: isLoadingProgress } = useGetSubjectProgress();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Here is an overview of your learning journey.</p>
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
              <div className="space-y-6">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start">
                    <div className="mr-4 mt-0.5 text-muted-foreground">
                      {item.type === 'quiz' ? <GraduationCap className="h-4 w-4 text-primary" /> : 
                       item.type === 'learn' ? <BookType className="h-4 w-4 text-secondary-foreground" /> :
                       item.type === 'attempt' ? <Activity className="h-4 w-4 text-accent" /> :
                       <Upload className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{item.title}</p>
                      {item.detail && <p className="text-xs text-muted-foreground">{item.detail}</p>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
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
    </div>
  );
}
