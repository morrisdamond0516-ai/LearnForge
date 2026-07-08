import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { GAMIFICATION_KEY } from "@/hooks/use-gamification";

export type GameReward = {
  xpAwarded: number;
  newBadges: { key: string; name: string; description: string }[];
};

/**
 * Awards XP and badges when a game is completed. Fires once per completion
 * cycle (resets when `completed` goes false, e.g. "Play again").
 */
export function useGameReward(
  gameId: string,
  completed: boolean,
  scorePct?: number,
) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const reported = useRef(false);
  const [reward, setReward] = useState<GameReward | null>(null);

  useEffect(() => {
    if (!completed) {
      reported.current = false;
      setReward(null);
      return;
    }
    if (reported.current) return;
    reported.current = true;

    fetch("/api/gamification/game-complete", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, scorePct }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as GameReward;
      })
      .then((data) => {
        if (!data) return;
        setReward(data);
        qc.invalidateQueries({ queryKey: GAMIFICATION_KEY });
        const badgeNames = data.newBadges.map((b) => b.name).join(", ");
        toast({
          title: `+${data.xpAwarded} XP earned`,
          description: badgeNames
            ? `New badge${data.newBadges.length > 1 ? "s" : ""}: ${badgeNames}`
            : "Nice work — check your Progress page.",
        });
      })
      .catch(() => {});
  }, [completed, gameId, scorePct, toast, qc]);

  return reward;
}
