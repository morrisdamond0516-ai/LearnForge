import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  RotateCcw,
  Swords,
  Sparkles,
  FlaskConical,
  Briefcase,
  Trophy,
  Heart,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { GameShell } from "@/components/games/game-shell";
import { GameRewardBanner } from "@/components/games/game-reward-banner";
import { useGameReward } from "@/hooks/use-game-reward";
import {
  BOSS_QUESTIONS,
  BOSS_ROSTER,
  CAREER_QUEST_NODES,
  JEOPARDY_BOARD,
  JOB_ROLES,
  JOB_SCENARIOS,
  LAB_ROOMS,
  resolveCareerEnding,
  type QuestStats,
} from "@/lib/educational-games/deep-content";
import { shuffle } from "@/lib/educational-games/content";

const EMPTY_STATS: QuestStats = {
  stem: 0,
  creative: 0,
  people: 0,
  builder: 0,
};

export function BossBattleGame({ onBack }: { onBack: () => void }) {
  const [bossIdx, setBossIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [combo, setCombo] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);

  const boss = BOSS_ROSTER[bossIdx];
  const questions = useMemo(
    () => shuffle(BOSS_QUESTIONS[boss.id]),
    [boss.id],
  );
  const q = questions[qIdx];

  const reward = useGameReward("boss-battle", won);

  function resetAll() {
    setBossIdx(0);
    setQIdx(0);
    setPlayerHp(100);
    setBossHp(100);
    setCombo(0);
    setPicked(null);
    setWon(false);
    setLost(false);
  }

  function answer(i: number) {
    if (picked !== null || !q) return;
    setPicked(i);
    const correct = i === q.correctIndex;
    setTimeout(() => {
      if (correct) {
        const damage = 14 + Math.min(combo, 5) * 2;
        const newBossHp = Math.max(0, bossHp - damage);
        setBossHp(newBossHp);
        setCombo((c) => c + 1);
        setShake(true);
        setTimeout(() => setShake(false), 400);
        if (newBossHp === 0) {
          if (bossIdx + 1 >= BOSS_ROSTER.length) {
            setWon(true);
          } else {
            setBossIdx((b) => b + 1);
            setQIdx(0);
            setBossHp(100);
          }
        } else {
          setQIdx((n) => n + 1);
        }
      } else {
        const newPlayerHp = Math.max(0, playerHp - 16);
        setPlayerHp(newPlayerHp);
        if (newPlayerHp === 0) setLost(true);
        setCombo(0);
        setQIdx((n) => (n + 1) % questions.length);
      }
      setPicked(null);
    }, 900);
  }

  if (won) {
    return (
      <GameShell title="Boss Battle" onBack={onBack}>
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardContent className="space-y-4 p-10 text-center">
            <Trophy className="mx-auto h-12 w-12 text-amber-600" />
            <p className="text-2xl font-bold">Victory!</p>
            <p className="text-muted-foreground">
              You defeated all knowledge bosses. Your study powers are legendary.
            </p>
            <GameRewardBanner reward={reward} />
            <Button onClick={resetAll}>
              <RotateCcw className="mr-2 h-4 w-4" />
              New campaign
            </Button>
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  if (lost) {
    return (
      <GameShell title="Boss Battle" onBack={onBack}>
        <Card>
          <CardContent className="space-y-4 p-10 text-center">
            <p className="text-xl font-semibold">The boss won this round</p>
            <p className="text-muted-foreground">Review the topic and try again!</p>
            <Button onClick={resetAll}>Try again</Button>
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Knowledge Boss Battle"
      subtitle={`${boss.name} · Combo ×${combo}`}
      onBack={onBack}
    >
      <motion.div animate={shake ? { x: [0, -8, 8, -4, 4, 0] } : {}}>
        <Card className={`overflow-hidden border-0 bg-gradient-to-r ${boss.color} text-white`}>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Boss {bossIdx + 1}/{BOSS_ROSTER.length}</p>
                <p className="text-2xl font-bold">{boss.name}</p>
                <p className="text-sm opacity-90">{boss.tagline}</p>
              </div>
              <Swords className="h-10 w-10 opacity-80" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Boss HP</span>
                <span>{bossHp}%</span>
              </div>
              <Progress value={bossHp} className="h-3 bg-white/20" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card className="mt-4">
        <CardContent className="space-y-2 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-1 text-rose-600">
              <Heart className="h-4 w-4" />
              You {playerHp}%
            </span>
            <Badge variant="secondary">{q?.subject}</Badge>
          </div>
          <Progress value={playerHp} className="h-2" />
        </CardContent>
      </Card>

      {q ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">{q.prompt}</CardTitle>
            <CardDescription>Correct answers deal extra damage at high combo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {q.options.map((opt, i) => {
              let variant: "outline" | "default" | "destructive" = "outline";
              if (picked !== null) {
                if (i === q.correctIndex) variant = "default";
                else if (i === picked) variant = "destructive";
              }
              return (
                <Button
                  key={opt}
                  variant={variant}
                  className="h-auto justify-start whitespace-normal py-3"
                  disabled={picked !== null}
                  onClick={() => answer(i)}
                >
                  <Zap className="mr-2 h-4 w-4 shrink-0" />
                  {opt}
                </Button>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </GameShell>
  );
}

export function CareerQuestGame({ onBack }: { onBack: () => void }) {
  const [nodeId, setNodeId] = useState("start");
  const [stats, setStats] = useState<QuestStats>({ ...EMPTY_STATS });
  const [log, setLog] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [lastReaction, setLastReaction] = useState<string | null>(null);

  const node = CAREER_QUEST_NODES.find((n) => n.id === nodeId);

  const reward = useGameReward("career-quest", finished);

  function choose(next: string, effects: Partial<QuestStats>, reaction: string) {
    setStats((s) => ({
      stem: s.stem + (effects.stem ?? 0),
      creative: s.creative + (effects.creative ?? 0),
      people: s.people + (effects.people ?? 0),
      builder: s.builder + (effects.builder ?? 0),
    }));
    setLog((l) => [...l, reaction]);
    setLastReaction(reaction);
    if (next === "end") {
      setFinished(true);
    } else {
      setNodeId(next);
    }
  }

  const ending = resolveCareerEnding(stats);

  if (finished) {
    return (
      <GameShell title="Career Life Quest" onBack={onBack}>
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">{ending.title}</CardTitle>
            <CardDescription>Your story shaped this future</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-medium text-foreground">{ending.career}</p>
            <p className="text-muted-foreground">{ending.blurb}</p>
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              {(["stem", "creative", "people", "builder"] as const).map((k) => (
                <div key={k} className="rounded-lg border border-border p-2 text-center">
                  <p className="text-xs uppercase text-muted-foreground">{k}</p>
                  <p className="text-xl font-bold">{stats[k]}</p>
                </div>
              ))}
            </div>
            <GameRewardBanner reward={reward} />
            <Button
              onClick={() => {
                setNodeId("start");
                setStats({ ...EMPTY_STATS });
                setLog([]);
                setFinished(false);
                setLastReaction(null);
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Play a new life path
            </Button>
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  if (!node) return null;

  return (
    <GameShell title="Career Life Quest" subtitle={node.chapter} onBack={onBack}>
      <AnimatePresence mode="wait">
        <motion.div
          key={node.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Your story
              </CardTitle>
              <CardDescription className="text-base leading-relaxed text-foreground">
                {node.scene}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lastReaction ? (
                <p className="rounded-lg bg-muted/50 p-3 text-sm italic text-muted-foreground">
                  {lastReaction}
                </p>
              ) : null}
              {node.choices.map((c) => (
                <Button
                  key={c.label}
                  variant="outline"
                  className="h-auto w-full justify-start whitespace-normal py-3 text-left"
                  onClick={() => choose(c.next, c.effects, c.reaction)}
                >
                  {c.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
      {log.length > 0 ? (
        <p className="text-center text-xs text-muted-foreground">
          {log.length} chapter{log.length === 1 ? "" : "s"} completed
        </p>
      ) : null}
    </GameShell>
  );
}

export function LabEscapeGame({ onBack }: { onBack: () => void }) {
  const [roomIdx, setRoomIdx] = useState(0);
  const [clues, setClues] = useState<string[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [escaped, setEscaped] = useState(false);

  const room = LAB_ROOMS[roomIdx];

  const reward = useGameReward("lab-escape", escaped);

  function answer(i: number) {
    if (!room || picked !== null) return;
    setPicked(i);
    setTimeout(() => {
      if (i === room.correctIndex) {
        setClues((c) => [...c, room.clue]);
        if (roomIdx + 1 >= LAB_ROOMS.length) setEscaped(true);
        else setRoomIdx((r) => r + 1);
      }
      setPicked(null);
    }, 800);
  }

  if (escaped) {
    return (
      <GameShell title="Lab Escape" onBack={onBack}>
        <Card className="border-emerald-500/30">
          <CardContent className="space-y-4 p-10 text-center">
            <FlaskConical className="mx-auto h-12 w-12 text-emerald-600" />
            <p className="text-2xl font-bold">You escaped the lab!</p>
            <p className="text-4xl font-mono tracking-widest text-primary">
              {clues.join("")}
            </p>
            <p className="text-muted-foreground">
              Science + logic unlocked every door.
            </p>
            <GameRewardBanner reward={reward} />
            <Button
              onClick={() => {
                setRoomIdx(0);
                setClues([]);
                setEscaped(false);
              }}
            >
              Play again
            </Button>
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  if (!room) return null;

  return (
    <GameShell
      title="Lab Escape"
      subtitle={`Room ${roomIdx + 1} of ${LAB_ROOMS.length} · ${room.name}`}
      onBack={onBack}
    >
      <Card>
        <CardHeader>
          <CardTitle>{room.name}</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            {room.story}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-medium">{room.question}</p>
          {room.options.map((opt, i) => {
            let variant: "outline" | "default" | "destructive" = "outline";
            if (picked !== null) {
              if (i === room.correctIndex) variant = "default";
              else if (i === picked) variant = "destructive";
            }
            return (
              <Button
                key={opt}
                variant={variant}
                className="h-auto w-full justify-start whitespace-normal py-3"
                disabled={picked !== null}
                onClick={() => answer(i)}
              >
                {opt}
              </Button>
            );
          })}
        </CardContent>
      </Card>
      {clues.length > 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Clues collected: <span className="font-mono font-semibold">{clues.join("")}</span>
        </p>
      ) : null}
    </GameShell>
  );
}

export function JeopardyArenaGame({ onBack }: { onBack: () => void }) {
  const board = useMemo(() => JEOPARDY_BOARD, []);
  const categories = [...new Set(board.map((c) => c.category))];
  const values = [100, 200, 300];
  const [score, setScore] = useState(0);
  const [active, setActive] = useState<(typeof board)[0] | null>(null);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [picked, setPicked] = useState<number | null>(null);

  const cellsLeft = board.length - used.size;
  const boardCleared = cellsLeft === 0 && !active;
  const maxScore = board.reduce((sum, c) => sum + c.value, 0);
  const scorePct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const reward = useGameReward("jeopardy-arena", boardCleared, scorePct);

  function pickCell(cat: string, value: number) {
    const key = `${cat}-${value}`;
    if (used.has(key)) return;
    const cell = board.find((c) => c.category === cat && c.value === value);
    if (cell) setActive(cell);
  }

  function answer(i: number) {
    if (!active || picked !== null) return;
    setPicked(i);
    const key = `${active.category}-${active.value}`;
    setTimeout(() => {
      if (i === active.correctIndex) setScore((s) => s + active.value);
      else setScore((s) => Math.max(0, s - active.value));
      setUsed((u) => new Set(u).add(key));
      setActive(null);
      setPicked(null);
    }, 1000);
  }

  if (boardCleared) {
    return (
      <GameShell title="Jeopardy Arena" onBack={onBack}>
        <Card>
          <CardContent className="space-y-4 p-10 text-center">
            <Trophy className="mx-auto h-10 w-10 text-amber-600" />
            <p className="text-2xl font-bold">Final score: ${score}</p>
            <GameRewardBanner reward={reward} />
            <Button
              onClick={() => {
                setScore(0);
                setUsed(new Set());
              }}
            >
              Play again
            </Button>
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  return (
    <GameShell title="Jeopardy Arena" subtitle={`Score: $${score}`} onBack={onBack}>
      {active ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {active.category} — ${active.value}
            </CardTitle>
            <CardDescription className="text-base text-foreground">
              {active.question}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {active.options.map((opt, i) => {
              let variant: "outline" | "default" | "destructive" = "outline";
              if (picked !== null) {
                if (i === active.correctIndex) variant = "default";
                else if (i === picked) variant = "destructive";
              }
              return (
                <Button
                  key={opt}
                  variant={variant}
                  disabled={picked !== null}
                  onClick={() => answer(i)}
                  className="h-auto justify-start whitespace-normal py-3"
                >
                  What is {opt}?
                </Button>
              );
            })}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-center text-sm">
            <thead>
              <tr>
                {categories.map((cat) => (
                  <th key={cat} className="border border-border bg-muted p-2 font-semibold">
                    {cat}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {values.map((val) => (
                <tr key={val}>
                  {categories.map((cat) => {
                    const key = `${cat}-${val}`;
                    const done = used.has(key);
                    return (
                      <td key={key} className="border border-border p-1">
                        <button
                          type="button"
                          disabled={done}
                          onClick={() => pickCell(cat, val)}
                          className={`w-full rounded-md py-4 font-bold transition ${
                            done
                              ? "bg-muted text-muted-foreground line-through"
                              : "bg-primary/10 text-primary hover:bg-primary/20"
                          }`}
                        >
                          ${val}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GameShell>
  );
}

export function DayOnTheJobGame({ onBack }: { onBack: () => void }) {
  const [roleId, setRoleId] = useState<string | null>(null);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const role = JOB_ROLES.find((r) => r.id === roleId);
  const scenes = roleId ? JOB_SCENARIOS[roleId] : [];
  const scene = scenes[sceneIdx];

  const readinessPct =
    role && scenes.length > 0
      ? Math.round((score / (scenes.length * 3)) * 100)
      : 0;
  const reward = useGameReward("day-on-the-job", done, readinessPct);

  function pick(optionIdx: number) {
    if (!scene || feedback) return;
    const opt = scene.options[optionIdx];
    setScore((s) => s + opt.score);
    setFeedback(opt.feedback);
    setTimeout(() => {
      setFeedback(null);
      if (sceneIdx + 1 >= scenes.length) setDone(true);
      else setSceneIdx((i) => i + 1);
    }, 1600);
  }

  if (done && role) {
    const max = scenes.length * 3;
    const pct = Math.round((score / max) * 100);
    return (
      <GameShell title="Day One on the Job" onBack={onBack}>
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <p className="text-6xl">{role.emoji}</p>
            <p className="text-xl font-semibold">{role.title}</p>
            <p className="text-3xl font-bold text-primary">{pct}% ready</p>
            <p className="text-muted-foreground">
              {pct >= 80
                ? "You would thrive in this role — try a real internship or LearnForge interview practice next."
                : pct >= 50
                  ? "Good instincts. Replay to see stronger professional choices."
                  : "Every pro started here. Replay and learn what great looks like."}
            </p>
            <GameRewardBanner reward={reward} />
            <Button
              onClick={() => {
                setRoleId(null);
                setSceneIdx(0);
                setScore(0);
                setDone(false);
              }}
            >
              Try another job
            </Button>
          </CardContent>
        </Card>
      </GameShell>
    );
  }

  if (!roleId) {
    return (
      <GameShell title="Day One on the Job" subtitle="Pick a role to simulate" onBack={onBack}>
        <div className="grid gap-4 sm:grid-cols-2">
          {JOB_ROLES.map((r) => (
            <Card
              key={r.id}
              className="cursor-pointer transition hover:border-primary/50"
              onClick={() => setRoleId(r.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <span className="text-3xl">{r.emoji}</span>
                  {r.title}
                </CardTitle>
                <CardDescription>{r.intro}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </GameShell>
    );
  }

  if (!scene) return null;

  return (
    <GameShell
      title="Day One on the Job"
      subtitle={`${role?.emoji} ${role?.title} · Scene ${sceneIdx + 1}/${scenes.length}`}
      onBack={onBack}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5" />
            What do you do?
          </CardTitle>
          <CardDescription className="text-base text-foreground">
            {scene.prompt}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {feedback ? (
            <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              {feedback}
            </p>
          ) : null}
          {scene.options.map((opt, i) => (
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
    </GameShell>
  );
}
