import { useState } from "react";
import { Briefcase, ChevronLeft, Layers, ExternalLink } from "lucide-react";
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
import {
  CAREER_SKILL_GAMES,
  careerSkillGameId,
  getCareerSkillBySlug,
  type CareerSkillSlug,
} from "@/lib/educational-games/career-skills-catalog";
import { CAREER_SKILL_CONTENT } from "@/lib/educational-games/career-skills-content";
import { mergeCareerSkillContent } from "@/lib/educational-games/career-workspace-content";
import {
  getCareerLabTrack,
  getCareerLabTrackRaw,
  getCareerAbsorbedDrills,
  type CareerLabModule,
} from "@/lib/educational-games/career-lab-tracks";
import { getExternalPracticeForCareer } from "@/lib/educational-games/it-external-practice";
import { LabModuleFlowHost } from "@/components/games/lab-module-flow";
import { careerModuleScopeKey } from "@/lib/educational-games/lab-phase-resolver";
import {
  SKILL_GAME_TYPE_LABELS,
  type SkillGameContent,
} from "@/lib/educational-games/skill-game-types";

export function CareerSkillsLab({
  onBack,
  initialSlug,
  initialModuleId,
  fromCurriculum,
}: {
  onBack: () => void;
  initialSlug?: CareerSkillSlug | null;
  /** Deep-link into a specific lab in a multi-lab track (from curriculum). */
  initialModuleId?: string | null;
  /** Subject name from the curriculum plan that opened this lab */
  fromCurriculum?: string | null;
}) {
  const [selected, setSelected] = useState<CareerSkillSlug | null>(
    initialSlug && getCareerSkillBySlug(initialSlug) ? initialSlug : null,
  );
  const [moduleId, setModuleId] = useState<string | null>(() => {
    if (!initialSlug || !initialModuleId) return null;
    const track = getCareerLabTrack(initialSlug);
    if (track?.some((m) => m.id === initialModuleId)) return initialModuleId;
    // Deep link to a removed scenario drill → open first hands-on lab
    return track?.[0]?.id ?? null;
  });

  if (selected) {
    const entry = getCareerSkillBySlug(selected)!;
    const track = getCareerLabTrack(selected);
    const activeModule: CareerLabModule | undefined =
      track?.find((m) => m.id === moduleId) ??
      (track?.length === 1 ? track[0] : undefined);

    // Multi-lab track: pick a module first
    if (track && track.length > 1 && !activeModule) {
      const absorbed = getCareerAbsorbedDrills(selected);
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelected(null);
                setModuleId(null);
              }}
            >
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
              <h2 className="text-xl font-bold">{entry.careerName}</h2>
              <p className="text-sm text-muted-foreground">
                {track.length} hands-on workspace labs — scenario drills are built into
                warm-up and recall steps
              </p>
            </div>
          </div>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-2 p-4 text-sm text-muted-foreground">
              <Layers className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Work through each hands-on workspace lab. Every module uses warm-up →
              workspace practice → recall. Quiz-style judgment from older drills is now
              in the warm-up/recall steps, not a separate fake lab.
              {absorbed.length > 0 ? (
                <span className="mt-2 block text-xs">
                  {absorbed.length} scenario drill{absorbed.length === 1 ? "" : "s"} merged
                  into these labs:{" "}
                  {absorbed.map((d) => d.title).join(" · ")}
                </span>
              ) : null}
            </CardContent>
          </Card>
          <div className="grid gap-3 sm:grid-cols-2">
            {track.map((mod, idx) => (
              <Card
                key={mod.id}
                className="cursor-pointer transition hover:border-primary/50"
                onClick={() => setModuleId(mod.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base leading-snug">
                    <span className="mr-2 text-muted-foreground">{idx + 1}.</span>
                    {mod.title}
                  </CardTitle>
                  <CardDescription>{mod.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{mod.domain}</Badge>
                  <Badge className="bg-primary/90">3-step module</Badge>
                  <Badge className="bg-primary/90">Hands-on workspace</Badge>
                  <Badge variant="outline">
                    {SKILL_GAME_TYPE_LABELS[mod.gameType]}
                  </Badge>
                  <Badge variant="outline">{mod.duration}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          {(() => {
            const external = getExternalPracticeForCareer(selected);
            if (!external) return null;
            return (
              <Card className="border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{external.title}</CardTitle>
                  <CardDescription>{external.intro}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {external.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm transition hover:border-primary/40"
                    >
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        <span className="font-medium text-foreground">
                          {link.name}
                        </span>
                        <span className="mt-0.5 block text-muted-foreground">
                          {link.covers} · {link.cost}
                        </span>
                      </span>
                    </a>
                  ))}
                </CardContent>
              </Card>
            );
          })()}
        </div>
      );
    }

    const content: SkillGameContent = activeModule
      ? activeModule.content
      : mergeCareerSkillContent(
          selected,
          CAREER_SKILL_CONTENT[selected] as SkillGameContent,
        );
    const gameType = activeModule?.gameType ?? entry.gameType;
    const title = activeModule?.title ?? entry.skillTitle;
    const description = activeModule?.description ?? entry.skillDescription;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (track && track.length > 1 && moduleId) {
                setModuleId(null);
              } else {
                setSelected(null);
                setModuleId(null);
              }
            }}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {track && track.length > 1 && moduleId
              ? "All labs"
              : "All careers"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onBack}>
            Exit lab
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{entry.emoji}</span>
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {entry.careerName}
              {activeModule ? ` · ${activeModule.domain}` : ""}
            </p>
          </div>
        </div>
        <LabModuleFlowHost
          scopeKey={
            activeModule
              ? careerModuleScopeKey(selected, activeModule.id)
              : `career:${selected}:main`
          }
          gameId={`${careerSkillGameId(selected)}${activeModule ? `-${activeModule.id}` : ""}`}
          moduleTitle={title}
          careerName={entry.careerName}
          domain={activeModule?.domain}
          gameType={gameType}
          content={content}
          description={description}
          prep={activeModule?.prep}
          recall={activeModule?.recall}
          labIndex={
            activeModule && track && track.length > 1
              ? track.findIndex((m) => m.id === activeModule.id) + 1
              : undefined
          }
          labCount={track && track.length > 1 ? track.length : undefined}
          fromCurriculum={fromCurriculum ?? undefined}
          onBackToTrack={() => {
            if (track && track.length > 1 && moduleId) setModuleId(null);
            else {
              setSelected(null);
              setModuleId(null);
            }
          }}
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
          building, and more. IT and Data Analyst include multi-lab tracks (Data Analyst
          covers spreadsheets, metrics, and AI-assisted analytics judgment).
          Original LearnForge content; no extra cost to run.
        </CardContent>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CAREER_SKILL_GAMES.map((career) => {
          const track = getCareerLabTrack(career.slug);
          return (
            <Card
              key={career.slug}
              className="cursor-pointer transition hover:border-primary/50"
              onClick={() => {
                setSelected(career.slug);
                setModuleId(null);
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="text-2xl">{career.emoji}</span>
                  <span className="line-clamp-2 leading-snug">
                    {career.careerName}
                  </span>
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
                  <Badge variant="secondary">
                    {SKILL_GAME_TYPE_LABELS[career.gameType]}
                  </Badge>
                  {track && track.length > 1 ? (
                    <Badge variant="default">{track.length} labs</Badge>
                  ) : null}
                  <Badge className="bg-primary/90">3-step modules</Badge>
                  <Badge variant="outline">{career.duration}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </GameShell>
  );
}
