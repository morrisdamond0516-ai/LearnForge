import { Link } from "wouter";
import { Star, Trophy } from "lucide-react";
import type { GameReward } from "@/hooks/use-game-reward";

export function GameRewardBanner({ reward }: { reward: GameReward | null }) {
  if (!reward) return null;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-50/80 p-4 text-sm dark:bg-amber-950/20">
      <p className="flex items-center justify-center gap-2 font-semibold text-amber-800 dark:text-amber-200">
        <Star className="h-4 w-4" />
        +{reward.xpAwarded} XP added to your Progress
      </p>
      {reward.newBadges.length > 0 ? (
        <p className="mt-1 flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300">
          <Trophy className="h-4 w-4" />
          New badge: {reward.newBadges.map((b) => b.name).join(", ")}
        </p>
      ) : null}
      <p className="mt-2 text-center text-xs text-muted-foreground">
        <Link href="/progress" className="text-primary underline-offset-4 hover:underline">
          View your streak and badges
        </Link>
      </p>
    </div>
  );
}
