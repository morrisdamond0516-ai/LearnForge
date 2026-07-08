import { useMemo, useState } from "react";
import {
  Briefcase,
  ChevronRight,
  Compass,
  PartyPopper,
  RotateCcw,
  Target,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GameShell } from "@/components/games/game-shell";
import { GameRewardBanner } from "@/components/games/game-reward-banner";
import { useGameReward } from "@/hooks/use-game-reward";
import type { CareerCategory } from "@/lib/educational-games/content";
import {
  CAREERS_BY_RIASEC,
  MISSION_TRACKS,
  PATH_CAREER_PROFILES,
  PATH_QUESTIONS,
  RIASEC_LABELS,
  RIASEC_STATIONS,
  type RiasecCode,
} from "@/lib/educational-games/extended-content";

export function CareerMatchPartyGame({ onBack }: { onBack: () => void }) {
  const [stationIdx, setStationIdx] = useState(0);
  const [scores, setScores] = useState<Record<RiasecCode, number>>({
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  });
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);

  const station = RIASEC_STATIONS[stationIdx];
  const reward = useGameReward("career-match-party", finished);

  function toggleActivity(i: number) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function nextStation() {
    if (!station || picked.size === 0) return;
    setScores((s) => ({
      ...s,
      [station.code]: s[station.code] + picked.size,
    }));
    if (stationIdx + 1 >= RIASEC_STATIONS.length) {
      setFinished(true);
    } else {
      setStationIdx((i) => i + 1);
      setPicked(new Set());
    }
  }

  const topCodes = useMemo(() => {
    const entries = (Object.entries(scores) as [RiasecCode, number][]).sort(
      (a, b) => b[1] - a[1],
    );
    return entries.filter((e) => e[1] > 0).slice(0, 3);
  }, [scores]);

  if (finished) {
    return (
      <GameShell title="Career Match Party" onBack={onBack}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-primary" />
              Your interest profile
            </CardTitle>
            <CardDescription>
              Based on activities you chose — inspired by Holland RIASEC career
              theory, built entirely for LearnForge.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {topCodes.map(([code]) => (
                <Badge key={code} className="text-sm">
                  {RIASEC_LABELS[code]} ({code})
                </Badge>
              ))}
            </div>
            {topCodes.map(([code]) => (
              <div key={code} className="rounded-lg border border-border p-3">
                <p className="font-semibold">{RIASEC_LABELS[code]} careers to explore</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {CAREERS_BY_RIASEC[code].join(" · ")}
                </p>
              </div>
            ))}
            <GameRewardBanner reward={reward} />
            <Button
              onClick={() => {
                setStationIdx(0);
                setScores({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
                setPicked(new Set());
                setFinished(false);
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Visit the party again
            </Button>
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  if (!station) return null;

  return (
    <GameShell
      title="Career Match Party"
      subtitle={`Room ${stationIdx + 1}/${RIASEC_STATIONS.length} · ${station.title}`}
      onBack={onBack}
    >
      <Card>
        <CardHeader>
          <CardTitle>{station.title}</CardTitle>
          <CardDescription>{station.vibe}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Tap every activity you would genuinely enjoy. Pick at least one to continue.
          </p>
          {station.activities.map((act, i) => {
            const selected = picked.has(i);
            return (
              <Button
                key={act.label}
                variant={selected ? "default" : "outline"}
                className="h-auto w-full justify-start whitespace-normal py-3 text-left"
                onClick={() => toggleActivity(i)}
              >
                <span>
                  <span className="font-semibold">{act.label}</span>
                  <span className="mt-0.5 block text-xs font-normal opacity-90">
                    {act.detail}
                  </span>
                </span>
              </Button>
            );
          })}
          <Button className="w-full" disabled={picked.size === 0} onClick={nextStation}>
            Next room
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </GameShell>
  );
}

export function SkillsMissionGame({ onBack }: { onBack: () => void }) {
  const [trackId, setTrackId] = useState<string | null>(null);
  const [missionIdx, setMissionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const track = MISSION_TRACKS.find((t) => t.id === trackId);
  const mission = track?.missions[missionIdx];
  const maxScore = track ? track.missions.length * 3 : 0;
  const reward = useGameReward(
    "skills-missions",
    done,
    maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
  );

  function pick(optionIdx: number) {
    if (!mission || feedback) return;
    const opt = mission.options[optionIdx];
    setScore((s) => s + opt.points);
    setFeedback(opt.feedback);
    setTimeout(() => {
      setFeedback(null);
      if (missionIdx + 1 >= (track?.missions.length ?? 0)) setDone(true);
      else setMissionIdx((i) => i + 1);
    }, 1400);
  }

  if (done && track) {
    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    return (
      <GameShell title="Skills Mission Board" onBack={onBack}>
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <Trophy className="mx-auto h-10 w-10 text-amber-600" />
            <p className="text-6xl">{track.emoji}</p>
            <p className="text-xl font-semibold">{track.title} complete</p>
            <p className="text-3xl font-bold text-primary">{pct}% mission score</p>
            <p className="text-muted-foreground">
              {pct >= 80
                ? "You think like a pro — explore internships and LearnForge interview practice next."
                : "Replay to see stronger professional choices."}
            </p>
            <GameRewardBanner reward={reward} />
            <Button
              onClick={() => {
                setTrackId(null);
                setMissionIdx(0);
                setScore(0);
                setDone(false);
              }}
            >
              Try another career track
            </Button>
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  if (!trackId) {
    return (
      <GameShell title="Skills Mission Board" subtitle="Pick a career track" onBack={onBack}>
        <div className="grid gap-4 sm:grid-cols-2">
          {MISSION_TRACKS.map((t) => (
            <Card
              key={t.id}
              className="cursor-pointer transition hover:border-primary/50"
              onClick={() => setTrackId(t.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <span className="text-3xl">{t.emoji}</span>
                  {t.title}
                </CardTitle>
                <CardDescription>{t.intro}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </GameShell>
    );
  }

  if (!mission) return null;

  return (
    <GameShell
      title="Skills Mission Board"
      subtitle={`${track?.emoji} Mission ${missionIdx + 1}/${track?.missions.length}`}
      onBack={onBack}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {mission.title}
          </CardTitle>
          <CardDescription className="text-base text-foreground">
            {mission.scenario}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {feedback ? (
            <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              {feedback}
            </p>
          ) : null}
          {mission.options.map((opt, i) => (
            <Button
              key={opt.text}
              variant="outline"
              className="h-auto w-full justify-start whitespace-normal py-3 text-left"
              disabled={!!feedback}
              onClick={() => pick(i)}
            >
              {opt.text}
            </Button>
          ))}
        </CardContent>
      </Card>
      <Progress
        value={((missionIdx + (feedback ? 1 : 0)) / (track?.missions.length ?? 1)) * 100}
        className="mt-4 h-2"
      />
    </GameShell>
  );
}

export function FuturePathFinderGame({ onBack }: { onBack: () => void }) {
  const [qIdx, setQIdx] = useState(0);
  const [scores, setScores] = useState<Record<CareerCategory, number>>({
    Realistic: 0,
    Investigative: 0,
    Artistic: 0,
    Social: 0,
    Enterprising: 0,
    Conventional: 0,
  });
  const [finished, setFinished] = useState(false);

  const q = PATH_QUESTIONS[qIdx];
  const reward = useGameReward("future-path-finder", finished);

  function answer(optionIdx: number) {
    if (!q) return;
    const opt = q.options[optionIdx];
    setScores((prev) => {
      const next = { ...prev };
      for (const [cat, w] of Object.entries(opt.weights)) {
        const key = cat as CareerCategory;
        next[key] = (next[key] ?? 0) + (w ?? 0);
      }
      return next;
    });
    if (qIdx + 1 >= PATH_QUESTIONS.length) setFinished(true);
    else setQIdx((i) => i + 1);
  }

  const topTypes = useMemo(() => {
    return (Object.entries(scores) as [CareerCategory, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [scores]);

  if (finished) {
    return (
      <GameShell title="Future Path Finder" onBack={onBack}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              Your top career pathways
            </CardTitle>
            <CardDescription>
              Three directions that fit your answers — use them to explore classes,
              clubs, and LearnForge pathways.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topTypes.map(([type], rank) => {
              const profile = PATH_CAREER_PROFILES[type];
              return (
                <div
                  key={type}
                  className="rounded-xl border border-border p-4"
                >
                  <p className="text-xs font-semibold uppercase text-primary">
                    Match #{rank + 1} · {type}
                  </p>
                  <p className="mt-1 font-medium">{profile.blurb}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    <Briefcase className="mr-1 inline h-3.5 w-3.5" />
                    {profile.careers.join(" · ")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Study path: {profile.study}
                  </p>
                </div>
              );
            })}
            <GameRewardBanner reward={reward} />
            <Button
              onClick={() => {
                setQIdx(0);
                setScores({
                  Realistic: 0,
                  Investigative: 0,
                  Artistic: 0,
                  Social: 0,
                  Enterprising: 0,
                  Conventional: 0,
                });
                setFinished(false);
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake the quiz
            </Button>
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  if (!q) return null;

  return (
    <GameShell
      title="Future Path Finder"
      subtitle={`Question ${qIdx + 1} of ${PATH_QUESTIONS.length}`}
      onBack={onBack}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{q.prompt}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {q.options.map((opt, i) => (
            <Button
              key={opt.label}
              variant="outline"
              className="h-auto justify-start whitespace-normal py-3 text-left"
              onClick={() => answer(i)}
            >
              {opt.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </GameShell>
  );
}
