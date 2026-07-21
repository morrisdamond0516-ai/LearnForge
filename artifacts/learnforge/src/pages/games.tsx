import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import {
  Gamepad2,
  Clock,
  Users,
  Sparkles,
  Filter,
  Star,
  Briefcase,
  GraduationCap,
  Layers,
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
import { BUILT_IN_GAMES, getGameById } from "@/lib/educational-games/catalog";
import { BuiltInGamePlayer } from "@/components/games/built-in-games";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { parseGamesDeepLink } from "@/lib/educational-games/curriculum-sim-link";
import type { AgeBand, BuiltInGameId, GameSubject } from "@/lib/educational-games/types";

const AGE_LABELS: Record<AgeBand, string> = {
  kids: "Kids",
  teens: "Teens",
  adults: "Adults",
  all: "All ages",
};

const SUBJECT_LABELS: Record<GameSubject, string> = {
  math: "Math",
  vocabulary: "Vocabulary",
  science: "Science",
  geography: "Geography",
  careers: "Careers",
  logic: "Logic",
  mixed: "Mixed",
};

export default function GamesPage() {
  const search = useSearch();
  const deepLink = parseGamesDeepLink(search);
  const linkedGame =
    deepLink.game && getGameById(deepLink.game) ? deepLink.game : null;
  const [activeGame, setActiveGame] = useState<BuiltInGameId | null>(linkedGame);
  const [careerSlug, setCareerSlug] = useState<string | null>(deepLink.career);
  const [subjectSlug, setSubjectSlug] = useState<string | null>(deepLink.subject);
  const [levelSlug, setLevelSlug] = useState<string | null>(deepLink.level);
  const [moduleId, setModuleId] = useState<string | null>(deepLink.module);
  const [fromCurriculum, setFromCurriculum] = useState<string | null>(deepLink.from);
  const [ageFilter, setAgeFilter] = useState<AgeBand | "any">("any");
  const [subjectFilter, setSubjectFilter] = useState<GameSubject | "any">("any");

  useEffect(() => {
    const next = parseGamesDeepLink(search);
    if (next.game && getGameById(next.game)) {
      setActiveGame(next.game);
      setCareerSlug(next.career);
      setSubjectSlug(next.subject);
      setLevelSlug(next.level);
      setModuleId(next.module);
      setFromCurriculum(next.from);
    }
  }, [search]);

  if (activeGame && getGameById(activeGame)) {
    return (
      <BuiltInGamePlayer
        gameId={activeGame}
        careerSlug={careerSlug}
        subjectSlug={subjectSlug}
        levelSlug={levelSlug}
        moduleId={moduleId}
        fromCurriculum={fromCurriculum}
        onBack={() => {
          setActiveGame(null);
          setCareerSlug(null);
          setSubjectSlug(null);
          setLevelSlug(null);
          setModuleId(null);
          setFromCurriculum(null);
          window.history.replaceState(null, "", "/games");
        }}
      />
    );
  }

  const filtered = BUILT_IN_GAMES.filter((g) => {
    const ageOk =
      ageFilter === "any" || g.ages.includes(ageFilter) || g.ages.includes("all");
    const subjectOk =
      subjectFilter === "any" || g.subjects.includes(subjectFilter);
    return ageOk && subjectOk;
  });

  const featured = filtered.filter((g) => g.depth === "featured");
  const careerGameIds = new Set([
    "career-skills-lab",
    "career-match-party",
    "skills-missions",
    "future-path-finder",
    "career-quest",
    "day-on-the-job",
  ]);
  const schoolGameIds = new Set(["education-skills-lab"]);
  const careerFeatured = featured.filter((g) => careerGameIds.has(g.id));
  const schoolFeatured = featured.filter((g) => schoolGameIds.has(g.id));
  const otherFeatured = featured.filter(
    (g) => !careerGameIds.has(g.id) && !schoolGameIds.has(g.id),
  );
  const quick = filtered.filter((g) => g.depth === "quick");

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Gamepad2 className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Learn by playing
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Educational Games
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            <strong className="font-medium text-foreground">Best path:</strong> Curriculum plan → hands-on lab
            (warm-up, workspace, recall) → quiz. Career & school labs use real tools — forms, terminals,
            spreadsheets, simulators — not quiz-only screens. Arcade games (Quiz Show, Survival Run) are
            optional fun after you practice.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/curriculum">Start with Curriculum</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/lab-preview">Browse lab gallery</Link>
          </Button>
        </div>
      </div>

      <Card className="border-primary/25 bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Layers className="h-4 w-4" />
              Recommended for learners
            </p>
            <p className="text-sm text-muted-foreground">
              Every lab module has 3 steps so you never wonder if you left the activity:{" "}
              <strong className="text-foreground">warm-up</strong> →{" "}
              <strong className="text-foreground">hands-on workspace</strong> →{" "}
              <strong className="text-foreground">recall check</strong>. Judgment questions from older
              drill screens now live in warm-up/recall — the middle step is always real practice.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/games?game=career-skills-lab">Open Career Skills Lab</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filter games
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <span className="w-full text-xs font-medium text-muted-foreground sm:w-auto sm:py-2">
            Age
          </span>
          {(["any", "kids", "teens", "adults"] as const).map((age) => (
            <Button
              key={age}
              size="sm"
              variant={ageFilter === age ? "default" : "outline"}
              onClick={() => setAgeFilter(age)}
            >
              {age === "any" ? "All ages" : AGE_LABELS[age]}
            </Button>
          ))}
          <span className="mt-2 w-full text-xs font-medium text-muted-foreground sm:mt-0 sm:ml-4 sm:w-auto sm:py-2">
            Subject
          </span>
          {(
            [
              "any",
              "math",
              "science",
              "vocabulary",
              "geography",
              "careers",
              "mixed",
            ] as const
          ).map((sub) => (
            <Button
              key={sub}
              size="sm"
              variant={subjectFilter === sub ? "default" : "outline"}
              onClick={() => setSubjectFilter(sub)}
            >
              {sub === "any" ? "All subjects" : SUBJECT_LABELS[sub]}
            </Button>
          ))}
        </CardContent>
      </Card>

      {schoolFeatured.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold">School Skills Lab</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Pick your grade — kindergarten through grade 12, plus college and trade school. Match letters, solve algebra, sequence lab reports, practice academic writing, and tackle jobsite measurement math.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schoolFeatured.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                variant="school"
                onPlay={() => setActiveGame(game.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {careerFeatured.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Career & future games</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Pick your career — each track is hands-on workspace labs with a 3-step module flow. Practice
            intake forms, ticket queues, terminals, charts, and jobsite math like on the job.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {careerFeatured.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                variant="career"
                onPlay={() => setActiveGame(game.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-600" />
          <h2 className="text-xl font-semibold">Featured adventures</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Deeper games with stories, stakes, and progression for all ages.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherFeatured.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              variant="featured"
              onPlay={() => setActiveGame(game.id)}
            />
          ))}
        </div>
        {otherFeatured.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No featured games match those filters.
          </p>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Quick practice</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Fast rounds when you have a few minutes — great warm-ups before quizzes.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quick.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              variant="quick"
              onPlay={() => setActiveGame(game.id)}
            />
          ))}
        </div>
        {quick.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No quick games match those filters.
          </p>
        ) : null}
      </section>

      <NewsletterSignup source="learnforge-games" />
    </div>
  );
}

function GameCard({
  game,
  variant,
  onPlay,
}: {
  game: (typeof BUILT_IN_GAMES)[number];
  variant: "career" | "school" | "featured" | "quick";
  onPlay: () => void;
}) {
  return (
    <Card
      className={`flex flex-col transition ${
        variant === "career"
          ? "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40"
          : variant === "school"
            ? "border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 to-transparent hover:border-emerald-500/40 dark:from-emerald-950/10"
            : variant === "featured"
              ? "border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-transparent hover:border-amber-500/40 dark:from-amber-950/10"
              : "hover:border-primary/40"
      }`}
    >
      <CardHeader>
        {variant !== "quick" ? (
          <Badge
            className={`mb-2 w-fit ${
              variant === "career"
                ? "bg-primary hover:bg-primary"
                : variant === "school"
                  ? "bg-emerald-600 hover:bg-emerald-600"
                  : "bg-amber-600 hover:bg-amber-600"
            }`}
          >
            {game.hook}
          </Badge>
        ) : null}
        <CardTitle className="text-lg">{game.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {game.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {game.subjects.map((s) => (
            <Badge key={s} variant="secondary">
              {SUBJECT_LABELS[s]}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {game.duration}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {game.ages.map((a) => AGE_LABELS[a]).join(", ")}
          </span>
        </div>
        <Button className="w-full" onClick={onPlay}>
          {variant === "quick" ? "Play now" : "Play adventure"}
        </Button>
      </CardContent>
    </Card>
  );
}
