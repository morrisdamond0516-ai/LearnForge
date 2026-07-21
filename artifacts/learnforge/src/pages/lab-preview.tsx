import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useUser } from "@clerk/react";
import {
  Briefcase,
  Filter,
  GraduationCap,
  Layers,
  Microscope,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { LabPreviewCard } from "@/components/lab-preview/lab-preview-card";
import { LabPreviewDetail } from "@/components/lab-preview/lab-preview-detail";
import {
  LAB_CLUSTER_LABELS,
  LAB_PREVIEW_CATALOG,
  type LabPreviewCluster,
  type LabPreviewEntry,
  type LabPreviewKind,
} from "@/lib/educational-games/lab-preview-catalog";
import { cn } from "@/lib/utils";

const KIND_FILTERS: { id: LabPreviewKind | "all"; label: string; icon: typeof Briefcase }[] = [
  { id: "all", label: "All labs", icon: Layers },
  { id: "career", label: "Career labs", icon: Briefcase },
  { id: "school", label: "School skills", icon: GraduationCap },
  { id: "subject", label: "Subject sims", icon: Microscope },
];

const CLUSTER_FILTERS: LabPreviewCluster[] = [
  "healthcare",
  "public-safety",
  "trades",
  "business",
  "technology",
  "education-social",
  "school",
  "subject",
];

type LabPreviewPageProps = {
  /** When true, skip public header/footer (used inside app layout). */
  embedded?: boolean;
};

export function LabPreviewPage({ embedded = false }: LabPreviewPageProps) {
  const { isSignedIn } = useUser();
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<LabPreviewKind | "all">("all");
  const [clusterFilter, setClusterFilter] = useState<LabPreviewCluster | "all">("all");
  const [selected, setSelected] = useState<LabPreviewEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const stats = useMemo(() => {
    const careerTracks = new Set(
      LAB_PREVIEW_CATALOG.filter((e) => e.kind === "career").map((e) => e.trackName),
    );
    return {
      total: LAB_PREVIEW_CATALOG.length,
      careers: careerTracks.size,
      school: LAB_PREVIEW_CATALOG.filter((e) => e.kind === "school").length,
      subjects: LAB_PREVIEW_CATALOG.filter((e) => e.kind === "subject").length,
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LAB_PREVIEW_CATALOG.filter((entry) => {
      if (kindFilter !== "all" && entry.kind !== kindFilter) return false;
      if (clusterFilter !== "all" && entry.cluster !== clusterFilter) return false;
      if (!q) return true;
      const hay = [
        entry.moduleTitle,
        entry.trackName,
        entry.description,
        entry.domain ?? "",
        entry.formatLabel,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, kindFilter, clusterFilter]);

  function openDetail(entry: LabPreviewEntry) {
    setSelected(entry);
    setDetailOpen(true);
  }

  const content = (
    <div className={cn("space-y-8", embedded ? "" : "mx-auto max-w-7xl px-4 py-8")}>
      {/* Hero */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-primary/90">
            <Sparkles className="mr-1 h-3 w-3" />
            Lab gallery
          </Badge>
          <Badge variant="outline">{stats.total} hands-on modules</Badge>
          <Badge variant="outline">{stats.careers} careers</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          See what every lab looks like
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Browse every hands-on workspace module before you sign up. Each lab uses a
          3-step flow — warm-up questions, real practice in a professional workspace,
          then a recall check. No multiple-choice-only drills posing as labs.
        </p>
        {!isSignedIn && !embedded ? (
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/sign-up">Start free — try any lab</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        ) : null}
      </div>

      {/* 3-step explainer strip */}
      <div className="grid gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:grid-cols-3">
        {[
          { step: "1", title: "Warm-up", desc: "Scenario questions set the context" },
          { step: "2", title: "Practice", desc: "Hands-on workspace — forms, terminals, charts" },
          { step: "3", title: "Recall", desc: "Lock in what you just practiced" },
        ].map((s) => (
          <div key={s.step} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {s.step}
            </div>
            <div>
              <div className="text-sm font-semibold">{s.title}</div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search labs, careers, domains…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {KIND_FILTERS.map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={kindFilter === f.id ? "default" : "outline"}
              onClick={() => setKindFilter(f.id)}
            >
              <f.icon className="mr-1.5 h-3.5 w-3.5" />
              {f.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Button
            size="sm"
            variant={clusterFilter === "all" ? "secondary" : "ghost"}
            onClick={() => setClusterFilter("all")}
          >
            All clusters
          </Button>
          {CLUSTER_FILTERS.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={clusterFilter === c ? "secondary" : "ghost"}
              onClick={() => setClusterFilter(c)}
            >
              {LAB_CLUSTER_LABELS[c]}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {stats.total} modules
      </p>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((entry) => (
          <LabPreviewCard
            key={entry.id}
            entry={entry}
            selected={selected?.id === entry.id}
            onSelect={() => openDetail(entry)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No labs match your filters. Try clearing search or choosing a different cluster.
        </div>
      ) : null}

      <LabPreviewDetail
        entry={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        signedIn={!!isSignedIn}
      />
    </div>
  );

  if (embedded) return content;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/">
            <Logo className="h-8" />
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pricing">Pricing</Link>
            </Button>
            {isSignedIn ? (
              <Button size="sm" asChild>
                <Link href="/games">Open labs</Link>
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link href="/sign-up">Sign up free</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{content}</main>
      <SiteFooter />
    </div>
  );
}

/** Public route — standalone page with header/footer for pre-purchase browsing. */
export default function LabPreview() {
  return <LabPreviewPage />;
}
