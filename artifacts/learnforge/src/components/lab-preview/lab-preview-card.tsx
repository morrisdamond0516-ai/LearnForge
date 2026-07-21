import { Clock, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LabWorkspaceThumbnail } from "@/components/lab-preview/lab-workspace-thumbnail";
import type { LabPreviewEntry } from "@/lib/educational-games/lab-preview-catalog";
import { cn } from "@/lib/utils";

function CoverImageThumbnail({
  src,
  title,
  className,
}: {
  src: string;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-zinc-700 shadow-inner h-44",
        className,
      )}
    >
      <img
        src={src}
        alt={title ?? "Lab cover"}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      {/* Subtle dark overlay at bottom for the window-chrome look */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/40 to-transparent" />
      {/* Mac-style traffic lights to match the workspace thumbnail style */}
      <div className="absolute left-2 top-2 flex gap-1">
        <div className="h-2 w-2 rounded-full bg-red-400/90" />
        <div className="h-2 w-2 rounded-full bg-yellow-400/90" />
        <div className="h-2 w-2 rounded-full bg-green-400/90" />
      </div>
    </div>
  );
}

export function LabPreviewCard({
  entry,
  selected,
  onSelect,
}: {
  entry: LabPreviewEntry;
  selected?: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      className={cn(
        "cursor-pointer overflow-hidden transition hover:border-primary/50 hover:shadow-md",
        selected && "border-primary ring-2 ring-primary/20",
      )}
      onClick={onSelect}
    >
      {entry.image ? (
        <CoverImageThumbnail
          src={entry.image}
          title={entry.moduleTitle}
          className="rounded-none border-0 border-b"
        />
      ) : (
        <LabWorkspaceThumbnail
          gameType={entry.gameType}
          content={entry.content}
          title={entry.moduleTitle}
          size="md"
          className="rounded-none border-0 border-b"
        />
      )}
      <CardHeader className="space-y-1 p-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xl leading-none">{entry.emoji}</span>
          {entry.labCount > 1 ? (
            <Badge variant="outline" className="shrink-0 text-[10px]">
              Lab {entry.labIndex} of {entry.labCount}
            </Badge>
          ) : null}
        </div>
        <CardTitle className="text-sm leading-snug">{entry.moduleTitle}</CardTitle>
        <CardDescription className="line-clamp-2 text-xs">
          {entry.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5 p-3 pt-0">
        <Badge variant="secondary" className="text-[10px]">
          {entry.trackName.length > 28
            ? entry.trackName.slice(0, 26) + "…"
            : entry.trackName}
        </Badge>
        {entry.domain ? (
          <Badge variant="outline" className="text-[10px]">
            {entry.domain}
          </Badge>
        ) : null}
        <Badge className="bg-primary/90 text-[10px]">
          <Layers className="mr-0.5 h-2.5 w-2.5" />
          3-step
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {entry.formatLabel}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          <Clock className="mr-0.5 h-2.5 w-2.5" />
          {entry.duration}
        </Badge>
      </CardContent>
    </Card>
  );
}
