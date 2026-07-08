import { useState } from "react";
import { Link } from "wouter";
import {
  Gamepad2,
  Clock,
  Users,
  Sparkles,
  Filter,
  Star,
  Briefcase,
  GraduationCap,
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
  const [activeGame, setActiveGame] = useState<BuiltInGameId | null>(null);
  const [ageFilter, setAgeFilter] = useState<AgeBand | "any">("any");
  const [subjectFilter, setSubjectFilter] = useState<GameSubject | "any">("any");

  if (activeGame && getGameById(activeGame)) {
    return (
      <BuiltInGamePlayer gameId={activeGame} onBack={() => setActiveGame(null)} />
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
            Start with <strong className="font-medium text-foreground">Quiz Show</strong>,{" "}
            <strong className="font-medium text-foreground">Survival Run</strong>, or{" "}
            <strong className="font-medium text-foreground">Career Cash</strong> for fast quiz-game energy — or dive into{" "}
            <strong className="font-medium text-foreground">School Skills Lab</strong> (K–12, college & trade) and{" "}
            <strong className="font-medium text-foreground">Career Skills Lab</strong>. Boss battles, job sims, and quick drills too. Everything plays here; finish a game to earn XP.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/quizzes">Take a full quiz</Link>
        </Button>
      </div>

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
            Pick your career — practice the actual skills: type addresses like a postal worker, fix code like IT support, match wires like an electrician, calculate doses like pharmacy tech, and more.
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
