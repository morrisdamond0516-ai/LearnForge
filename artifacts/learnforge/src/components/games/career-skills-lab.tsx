import { useState } from "react";
import { Briefcase, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GameShell } from "@/components/games/game-shell";
import { SkillGameRenderer } from "@/components/games/skill-game-engines";
import {
  CAREER_SKILL_GAMES,
  careerSkillGameId,
  getCareerSkillBySlug,
  type CareerSkillSlug,
} from "@/lib/educational-games/career-skills-catalog";
import { CAREER_SKILL_CONTENT } from "@/lib/educational-games/career-skills-content";
import {
  getSkillGameFormatSummary,
  SKILL_GAME_TYPE_LABELS,
} from "@/lib/educational-games/skill-game-types";

export function CareerSkillsLab({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<CareerSkillSlug | null>(null);

  if (selected) {
    const entry = getCareerSkillBySlug(selected)!;
    const content = CAREER_SKILL_CONTENT[selected];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            All careers
          </Button>
          <Button variant="ghost" size="sm" onClick={onBack}>
            Exit lab
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{entry.emoji}</span>
          <div>
            <h2 className="text-xl font-bold">{entry.skillTitle}</h2>
            <p className="text-sm text-muted-foreground">{entry.careerName}</p>
          </div>
        </div>
        <SkillGameRenderer
          gameId={careerSkillGameId(selected)}
          gameType={entry.gameType}
          content={content}
          title={entry.skillTitle}
          description={entry.skillDescription}
        />
      </div>
    );
  }

  return (
    <GameShell
      title="Career Skills Lab"
      subtitle="Hands-on practice for every career we support"
      onBack={onBack}
    >
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <Briefcase className="mb-2 inline h-4 w-4 text-primary" /> Each game
          teaches a real job skill — typing, coding, wiring, pharmacy math, PC
          building, and more. Original LearnForge content; no extra cost to run.
        </CardContent>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CAREER_SKILL_GAMES.map((career) => (
          <Card
            key={career.slug}
            className="cursor-pointer transition hover:border-primary/50"
            onClick={() => setSelected(career.slug)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="text-2xl">{career.emoji}</span>
                <span className="line-clamp-2 leading-snug">{career.careerName}</span>
              </CardTitle>
              <CardDescription className="font-medium text-foreground">
                {career.skillTitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {career.skillDescription}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">{SKILL_GAME_TYPE_LABELS[career.gameType]}</Badge>
                <Badge variant="outline">
                  {getSkillGameFormatSummary(career.gameType, CAREER_SKILL_CONTENT[career.slug])}
                </Badge>
                <Badge variant="outline">{career.duration}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </GameShell>
  );
}
