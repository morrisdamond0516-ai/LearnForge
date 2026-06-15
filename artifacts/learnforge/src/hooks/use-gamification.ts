import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type BadgeState = {
  key: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt: string | null;
};

export type GamificationMe = {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
  pct: number;
  currentStreak: number;
  longestStreak: number;
  dailyGoal: number;
  todayCount: number;
  goalMet: boolean;
  badges: BadgeState[];
};

export type LeaderboardEntry = {
  rank: number;
  handle: string;
  xp: number;
  level: number;
  isMe: boolean;
};

export const GAMIFICATION_KEY = ["gamification", "me"] as const;
export const LEADERBOARD_KEY = ["gamification", "leaderboard"] as const;

export function useGamification() {
  return useQuery<GamificationMe>({
    queryKey: GAMIFICATION_KEY,
    queryFn: async () => {
      const res = await fetch("/api/gamification/me", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load your progress");
      return (await res.json()) as GamificationMe;
    },
  });
}

export function useLeaderboard() {
  return useQuery<{ leaders: LeaderboardEntry[] }>({
    queryKey: LEADERBOARD_KEY,
    queryFn: async () => {
      const res = await fetch("/api/gamification/leaderboard", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load the leaderboard");
      return (await res.json()) as { leaders: LeaderboardEntry[] };
    },
  });
}

export function useSetDailyGoal() {
  const qc = useQueryClient();
  return useMutation<{ dailyGoal: number }, Error, number>({
    mutationFn: async (goal) => {
      const res = await fetch("/api/gamification/daily-goal", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      if (!res.ok) throw new Error("Couldn't update your daily goal");
      return (await res.json()) as { dailyGoal: number };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: GAMIFICATION_KEY }),
  });
}
