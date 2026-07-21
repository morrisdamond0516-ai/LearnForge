import { useMemo, useState } from "react";
import { ChevronLeft, GraduationCap } from "lucide-react";
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
import { LabModuleFlowHost } from "@/components/games/lab-module-flow";
import { educationScopeKey } from "@/lib/educational-games/lab-phase-resolver";
import {
  EDUCATION_BAND_LABELS,
  EDUCATION_LEVEL_GAMES,
  eduSkillGameId,
  getEducationLevelBySlug,
  type EducationBand,
  type EducationLevelSlug,
} from "@/lib/educational-games/education-levels-catalog";
import { EDUCATION_LEVEL_CONTENT } from "@/lib/educational-games/education-levels-content";
import { mergeEducationSkillContent } from "@/lib/educational-games/education-workspace-content";
import {
  getSkillGameFormatSummary,
  SKILL_GAME_TYPE_LABELS,
} from "@/lib/educational-games/skill-game-types";

const BAND_ORDER: EducationBand[] = [
  "early",
  "elementary",
  "middle",
  "high",
  "post",
];

export function EducationSkillsLab({
  onBack,
  initialSlug,
}: {
  onBack: () => void;
  initialSlug?: EducationLevelSlug | null;
}) {
  const [selected, setSelected] = useState<EducationLevelSlug | null>(
    initialSlug && getEducationLevelBySlug(initialSlug) ? initialSlug : null,
  );
  const [bandFilter, setBandFilter] = useState<EducationBand | "all">("all");

  const grouped = useMemo(() => {
    const levels =
      bandFilter === "all"
        ? EDUCATION_LEVEL_GAMES
        : EDUCATION_LEVEL_GAMES.filter((l) => l.band === bandFilter);
    return BAND_ORDER.map((band) => ({
      band,
      label: EDUCATION_BAND_LABELS[band],
      levels: levels.filter((l) => l.band === band),
    })).filter((g) => g.levels.length > 0);
  }, [bandFilter]);

  if (selected) {
    const entry = getEducationLevelBySlug(selected)!;
    const content = mergeEducationSkillContent(selected, EDUCATION_LEVEL_CONTENT[selected]);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            All grade levels
          </Button>
          <Button variant="ghost" size="sm" onClick={onBack}>
            Exit lab
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{entry.emoji}</span>
          <div>
            <h2 className="text-xl font-bold">{entry.skillTitle}</h2>
            <p className="text-sm text-muted-foreground">{entry.label}</p>
          </div>
        </div>
        <LabModuleFlowHost
          scopeKey={educationScopeKey(selected)}
          gameId={eduSkillGameId(selected)}
          moduleTitle={entry.skillTitle}
          careerName={entry.label}
          gameType={entry.gameType}
          content={content}
          description={entry.skillDescription}
          onBackToTrack={() => setSelected(null)}
        />
      </div>
    );
  }

  return (
    <GameShell
      title="School Skills Lab"
      subtitle="Kindergarten through college & trade school"
      onBack={onBack}
    >
      <Card className="mb-4 border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <GraduationCap className="mb-2 inline h-4 w-4 text-emerald-600" />{" "}
          One hands-on skill game per grade level — letters for kindergarteners,
          algebra for high school, academic typing for college, and two trade school
          activities (measurement math + vocabulary drill). All built in, no outside links.
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={bandFilter === "all" ? "default" : "outline"}
          onClick={() => setBandFilter("all")}
        >
          All levels
        </Button>
        {BAND_ORDER.map((band) => (
          <Button
            key={band}
            size="sm"
            variant={bandFilter === band ? "default" : "outline"}
            onClick={() => setBandFilter(band)}
          >
            {EDUCATION_BAND_LABELS[band]}
          </Button>
        ))}
      </div>

      <div className="space-y-8">
        {grouped.map(({ band, label, levels }) => (
          <section key={band} className="space-y-3">
            <h3 className="text-lg font-semibold">{label}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {levels.map((level) => (
                <Card
                  key={level.slug}
                  className="cursor-pointer transition hover:border-emerald-500/40"
                  onClick={() => setSelected(level.slug)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="text-2xl">{level.emoji}</span>
                      {level.label}
                    </CardTitle>
                    <CardDescription className="font-medium text-foreground">
                      {level.skillTitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {level.skillDescription}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge className="bg-primary/90">3-step module</Badge>
                      <Badge variant="secondary">{SKILL_GAME_TYPE_LABELS[level.gameType]}</Badge>
                      <Badge variant="outline">
                        {getSkillGameFormatSummary(level.gameType, EDUCATION_LEVEL_CONTENT[level.slug])}
                      </Badge>
                      <Badge variant="outline">{level.duration}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </GameShell>
  );
}
