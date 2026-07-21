import { Link } from "wouter";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  ExternalLink,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LabWorkspaceThumbnail } from "@/components/lab-preview/lab-workspace-thumbnail";
import type { LabPreviewEntry } from "@/lib/educational-games/lab-preview-catalog";

const FLOW_STEPS = [
  {
    key: "prep",
    label: "Warm-up",
    icon: BookOpen,
    desc: "Quick scenario questions to set context before you touch the workspace.",
  },
  {
    key: "practice",
    label: "Hands-on practice",
    icon: Wrench,
    desc: "Real workspace — forms, spreadsheets, terminals, charts, or simulations.",
  },
  {
    key: "recall",
    label: "Recall check",
    icon: ClipboardCheck,
    desc: "Short retention questions to lock in what you just practiced.",
  },
] as const;

function sampleTasks(entry: LabPreviewEntry): string[] {
  const c = entry.content;
  if (!c) return [];
  if (c.intakeForm?.fields)
    return c.intakeForm.fields.slice(0, 4).map((f) => f.label);
  if (c.spreadsheet?.tasks)
    return c.spreadsheet.tasks.slice(0, 4).map((t) => t.instruction);
  if (c.terminal?.steps)
    return c.terminal.steps.slice(0, 4).map((s) => s.instruction);
  if (c.patientChart?.tasks)
    return c.patientChart.tasks.slice(0, 4).map((t) => t.label);
  if (c.helpdeskQueue?.tickets)
    return c.helpdeskQueue.tickets.slice(0, 4).map((t) => t.subject);
  if (c.jobsite?.tasks)
    return c.jobsite.tasks.slice(0, 4).map((t) => t.prompt);
  if (c.labBench?.steps)
    return c.labBench.steps.slice(0, 4).map((s) => s.instruction);
  return [];
}

export function LabPreviewDetail({
  entry,
  open,
  onOpenChange,
  signedIn,
}: {
  entry: LabPreviewEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signedIn?: boolean;
}) {
  if (!entry) return null;
  const tasks = sampleTasks(entry);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-3 text-left">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{entry.emoji}</span>
            <div>
              <SheetTitle className="text-left">{entry.moduleTitle}</SheetTitle>
              <SheetDescription className="text-left">
                {entry.trackName}
                {entry.labCount > 1
                  ? ` · Lab ${entry.labIndex} of ${entry.labCount}`
                  : ""}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          <LabWorkspaceThumbnail
            gameType={entry.gameType}
            content={entry.content}
            title={entry.moduleTitle}
            size="lg"
          />

          <p className="text-sm text-muted-foreground">{entry.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {entry.domain ? <Badge variant="outline">{entry.domain}</Badge> : null}
            <Badge className="bg-primary/90">3-step module</Badge>
            <Badge variant="secondary">{entry.formatLabel}</Badge>
            <Badge variant="outline">{entry.duration}</Badge>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">How each module works</h4>
            <div className="grid gap-2">
              {FLOW_STEPS.map((step, i) => (
                <div
                  key={step.key}
                  className="flex gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <step.icon className="h-3.5 w-3.5 text-primary" />
                      {step.label}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {tasks.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Sample tasks in this lab</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {tasks.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 pt-2">
            {signedIn ? (
              <Button asChild>
                <Link href={entry.href}>
                  Open this lab
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild>
                  <Link href="/sign-up">
                    Start free — try this lab
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/pricing">
                    See pricing
                    <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
