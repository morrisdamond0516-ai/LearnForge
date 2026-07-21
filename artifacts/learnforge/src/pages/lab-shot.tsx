import { useEffect } from "react";
import { LAB_PREVIEW_CATALOG } from "@/lib/educational-games/lab-preview-catalog";
import { SkillGameRenderer } from "@/components/games/skill-game-engines";

export default function LabShotPage() {
  const search = typeof window !== "undefined" ? window.location.search : "";
  const id = new URLSearchParams(search).get("id") ?? "";

  useEffect(() => {
    if (id === "list") {
      const noImage = LAB_PREVIEW_CATALOG.filter((e) => !e.image && !!e.content);
      console.log("CATALOG_NO_IMAGE_COUNT:", noImage.length);
      console.log("CATALOG_NO_IMAGE:", JSON.stringify(noImage.map((e) => ({ id: e.id, gameType: e.gameType }))));
    }
  }, [id]);

  if (id === "list") {
    const noImage = LAB_PREVIEW_CATALOG.filter((e) => !e.image && !!e.content);
    return (
      <div className="min-h-screen bg-background p-4">
        <h1 className="mb-2 text-lg font-bold">Labs needing cover images ({noImage.length})</h1>
        <pre className="overflow-auto text-xs leading-5">
          {noImage.map((e) => `${e.id}  [${e.gameType}]`).join("\n")}
        </pre>
      </div>
    );
  }

  const entry = LAB_PREVIEW_CATALOG.find((e) => e.id === id);

  if (!id || !entry) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8 text-muted-foreground">
        {id ? `Lab not found: ${id}` : "Pass ?id=<catalogId>"}
      </div>
    );
  }

  if (!entry.content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8 text-muted-foreground">
        No content for: {id}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-3xl">{entry.emoji}</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">{entry.moduleTitle}</h1>
            <p className="text-xs text-muted-foreground">
              {entry.trackName}
              {entry.domain ? ` · ${entry.domain}` : ""}
            </p>
          </div>
        </div>
        <SkillGameRenderer
          gameId={`shot-${entry.id}`}
          gameType={entry.gameType}
          content={entry.content}
          title={entry.moduleTitle}
          description={entry.description}
          hideIntro
        />
      </div>
    </div>
  );
}
