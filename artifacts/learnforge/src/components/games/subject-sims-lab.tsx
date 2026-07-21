import { useState } from "react";
import { Atom, ChevronLeft } from "lucide-react";
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
import { subjectScopeKey } from "@/lib/educational-games/lab-phase-resolver";
import {
  getSubjectSimBySlug,
  SUBJECT_SIMULATIONS,
  subjectSimGameId,
  type SubjectSimSlug,
} from "@/lib/educational-games/subject-sims-catalog";
import { SUBJECT_SIM_CONTENT } from "@/lib/educational-games/subject-sims-content";
import {
  getSkillGameFormatSummary,
  SKILL_GAME_TYPE_LABELS,
} from "@/lib/educational-games/skill-game-types";

export function SubjectSimulationsLab({
  onBack,
  initialSlug,
}: {
  onBack: () => void;
  initialSlug?: SubjectSimSlug | null;
}) {
  const [selected, setSelected] = useState<SubjectSimSlug | null>(
    initialSlug && getSubjectSimBySlug(initialSlug) ? initialSlug : null,
  );

  if (selected) {
    const entry = getSubjectSimBySlug(selected)!;
    const content = SUBJECT_SIM_CONTENT[selected];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            All subjects
          </Button>
          <Button variant="ghost" size="sm" onClick={onBack}>
            Exit lab
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{entry.emoji}</span>
          <div>
            <h2 className="text-xl font-bold">{entry.title}</h2>
            <p className="text-sm text-muted-foreground">{entry.subject}</p>
          </div>
        </div>
        <LabModuleFlowHost
          scopeKey={subjectScopeKey(selected)}
          gameId={subjectSimGameId(selected)}
          moduleTitle={entry.title}
          careerName={entry.subject}
          gameType={entry.gameType}
          content={content}
          description={entry.description}
          onBackToTrack={() => setSelected(null)}
        />
      </div>
    );
  }

  return (
    <GameShell
      title="Subject Simulations"
      subtitle="Interactive science & math labs — physics, aerospace, biology, chemistry, and more"
      onBack={onBack}
    >
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <Atom className="mb-2 inline h-4 w-4 text-primary" /> PhET and Labster-inspired
          simulations built in-app. Manipulate variables, run lab procedures, and master
          concepts before your quiz — no external links or paid APIs.
        </CardContent>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SUBJECT_SIMULATIONS.map((sim) => (
          <Card
            key={sim.slug}
            className="cursor-pointer transition hover:border-primary/50"
            onClick={() => setSelected(sim.slug)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="text-2xl">{sim.emoji}</span>
                <span className="line-clamp-2 leading-snug">{sim.title}</span>
              </CardTitle>
              <CardDescription className="font-medium text-foreground">
                {sim.subject}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-xs text-muted-foreground">{sim.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="bg-primary/90">3-step module</Badge>
                <Badge variant="secondary">{SKILL_GAME_TYPE_LABELS[sim.gameType]}</Badge>
                <Badge variant="outline">
                  {getSkillGameFormatSummary(sim.gameType, SUBJECT_SIM_CONTENT[sim.slug])}
                </Badge>
                <Badge variant="outline">{sim.duration}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </GameShell>
  );
}
