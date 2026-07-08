import { useState } from "react";
import {
  Trophy,
  Flame,
  Star,
  Target,
  Award,
  Medal,
  Lock,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useGamification,
  useLeaderboard,
  useSetDailyGoal,
} from "@/hooks/use-gamification";
import { NewsletterSignup } from "@/components/newsletter-signup";

function StatTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Progress() {
  const { data, isLoading } = useGamification();
  const { data: lb } = useLeaderboard();
  const setGoal = useSetDailyGoal();
  const { toast } = useToast();
  const [goalDraft, setGoalDraft] = useState<number | null>(null);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const goal = goalDraft ?? data.dailyGoal;
  const earnedCount = data.badges.filter((b) => b.earned).length;

  function saveGoal() {
    setGoal.mutate(goal, {
      onSuccess: () => toast({ title: "Daily goal updated" }),
      onError: (err) =>
        toast({
          title: "Couldn't update goal",
          description: err.message,
          variant: "destructive",
        }),
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <Trophy className="h-7 w-7 text-primary" />
          Your Progress
        </h1>
        <p className="mt-1 text-muted-foreground">
          Earn XP from tests and learning games, keep your streak alive, and collect badges.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={<Star className="h-6 w-6" />}
          label="Total XP"
          value={data.xp}
          hint={`Level ${data.level}`}
        />
        <StatTile
          icon={<Flame className="h-6 w-6" />}
          label="Day streak"
          value={data.currentStreak}
          hint={`Longest: ${data.longestStreak}`}
        />
        <StatTile
          icon={<Medal className="h-6 w-6" />}
          label="Badges earned"
          value={`${earnedCount} / ${data.badges.length}`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Level {data.level}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {data.xpIntoLevel} / {data.xpForLevel} XP to level {data.level + 1}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressBar value={data.pct} className="h-3" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Daily goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Completed today: {data.todayCount} of {data.dailyGoal}
              <span className="hidden sm:inline"> (tests and games count)</span>
            </p>
            {data.goalMet && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
                <Check className="h-3.5 w-3.5" />
                Goal met
              </span>
            )}
          </div>
          <ProgressBar
            value={Math.min(100, (data.todayCount / data.dailyGoal) * 100)}
            className="h-2"
          />
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={50}
              value={goal}
              onChange={(e) => setGoalDraft(Number(e.target.value))}
              className="w-20 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground"
            />
            <span className="text-sm text-muted-foreground">tests per day</span>
            <Button
              size="sm"
              variant="outline"
              onClick={saveGoal}
              disabled={setGoal.isPending || goal === data.dailyGoal}
            >
              Save goal
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-primary" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.badges.map((badge) => (
              <div
                key={badge.key}
                className={`flex items-start gap-3 rounded-xl border p-3 ${
                  badge.earned
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-muted/30 opacity-70"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    badge.earned
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {badge.earned ? (
                    <Award className="h-5 w-5" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {badge.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-primary" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lb && lb.leaders.length > 0 ? (
              <ol className="space-y-1">
                {lb.leaders.map((entry) => (
                  <li
                    key={entry.rank}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                      entry.isMe
                        ? "bg-primary/10 font-semibold text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 text-right tabular-nums">
                        {entry.rank}
                      </span>
                      <span>
                        {entry.handle}
                        {entry.isMe && " (you)"}
                      </span>
                    </span>
                    <span className="tabular-nums">
                      {entry.xp} XP · Lv {entry.level}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">
                Take a test to claim your spot on the leaderboard.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <NewsletterSignup
        source="learnforge-progress"
        title="Weekly learning picks"
        description="Get notified when we add new games, career labs, and study features. Free — powered by your EbookGamez Resend account."
      />
    </div>
  );
}
