import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ExternalResource, GameSubject } from "@/lib/educational-games/types";

const SUBJECT_LABELS: Record<GameSubject, string> = {
  math: "Math",
  vocabulary: "Vocabulary",
  science: "Science",
  geography: "Geography",
  careers: "Careers",
  logic: "Logic",
  mixed: "Mixed",
};

export function ExternalGamesCarousel({
  resources,
}: {
  resources: ExternalResource[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [resources, updateScrollState]);

  function scrollByPage(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(240, el.clientWidth * 0.75);
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  if (resources.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No external resources match those filters.
      </p>
    );
  }

  return (
    <div className="relative">
      {canScrollLeft ? (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute left-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full shadow-md sm:flex"
          onClick={() => scrollByPage(-1)}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      ) : null}
      {canScrollRight ? (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute right-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full shadow-md sm:flex"
          onClick={() => scrollByPage(1)}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : null}

      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-9 [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {resources.map((resource) => (
          <a
            key={resource.url}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-[min(85vw,260px)] shrink-0 snap-start flex-col rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                {resource.name}
              </p>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </div>
            <p className="mt-2 line-clamp-2 flex-1 text-xs text-muted-foreground">
              {resource.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {resource.subjects.slice(0, 2).map((s) => (
                <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">
                  {SUBJECT_LABELS[s]}
                </Badge>
              ))}
            </div>
          </a>
        ))}
      </div>

      <p className="mt-1 text-center text-xs text-muted-foreground sm:hidden">
        Swipe to see more sites
      </p>
    </div>
  );
}
