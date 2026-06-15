import { useMemo, useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  ArrowLeft,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useDecks,
  useGenerateDeck,
  useDeleteDeck,
  type Flashcard,
  type FlashcardDeck,
} from "@/hooks/use-flashcards";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function StudyMode({ deck, onBack }: { deck: FlashcardDeck; onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = deck.cards[idx];

  function go(delta: number) {
    setFlipped(false);
    setIdx((i) => Math.min(deck.cards.length - 1, Math.max(0, i + delta)));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <span className="text-sm text-muted-foreground">
          Card {idx + 1} of {deck.cards.length}
        </span>
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition hover:border-primary/40"
      >
        <span className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
          {flipped ? "Answer" : "Prompt"}
        </span>
        <span className="text-xl font-medium leading-relaxed text-foreground">
          {flipped ? card.back : card.front}
        </span>
        <span className="mt-4 text-xs text-muted-foreground">
          Tap to {flipped ? "see prompt" : "reveal answer"}
        </span>
      </button>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => go(-1)} disabled={idx === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Prev
        </Button>
        <Button
          variant="outline"
          onClick={() => go(1)}
          disabled={idx === deck.cards.length - 1}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

type Tile = {
  id: string;
  pairId: number;
  text: string;
  side: "front" | "back";
};

function MatchGame({ deck, onBack }: { deck: FlashcardDeck; onBack: () => void }) {
  const round = useMemo(() => {
    const picked = shuffle(deck.cards).slice(0, Math.min(6, deck.cards.length));
    const tiles: Tile[] = [];
    picked.forEach((c: Flashcard, i: number) => {
      tiles.push({ id: `f${i}`, pairId: i, text: c.front, side: "front" });
      tiles.push({ id: `b${i}`, pairId: i, text: c.back, side: "back" });
    });
    return { tiles: shuffle(tiles), total: picked.length };
  }, [deck]);

  const [selected, setSelected] = useState<Tile | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [key, setKey] = useState(0);

  function reset() {
    setSelected(null);
    setMatched(new Set());
    setWrong(null);
    setMoves(0);
    setKey((k) => k + 1);
  }

  function pick(tile: Tile) {
    if (matched.has(tile.pairId) || tile.id === selected?.id) return;
    if (!selected) {
      setSelected(tile);
      return;
    }
    setMoves((m) => m + 1);
    if (selected.pairId === tile.pairId && selected.side !== tile.side) {
      setMatched((prev) => new Set(prev).add(tile.pairId));
      setSelected(null);
    } else {
      setWrong(tile.id);
      setTimeout(() => {
        setWrong(null);
        setSelected(null);
      }, 600);
    }
  }

  const done = matched.size === round.total;

  return (
    <div className="mx-auto max-w-3xl space-y-6" key={key}>
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <span className="text-sm text-muted-foreground">
          Matched {matched.size}/{round.total} · {moves} moves
        </span>
      </div>

      {done ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <Check className="h-7 w-7" />
            </span>
            <p className="text-xl font-semibold text-foreground">
              All matched in {moves} moves
            </p>
            <Button onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Play again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {round.tiles.map((tile) => {
            const isMatched = matched.has(tile.pairId);
            const isSelected = selected?.id === tile.id;
            const isWrong = wrong === tile.id;
            return (
              <button
                key={tile.id}
                onClick={() => pick(tile)}
                disabled={isMatched}
                className={`flex min-h-24 items-center justify-center rounded-xl border p-3 text-center text-sm transition ${
                  isMatched
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 opacity-60"
                    : isWrong
                      ? "border-destructive bg-destructive/10 text-foreground"
                      : isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                }`}
              >
                {tile.text}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Flashcards() {
  const { data: decks, isLoading } = useDecks();
  const generate = useGenerateDeck();
  const del = useDeleteDeck();
  const { toast } = useToast();

  const [topic, setTopic] = useState("");
  const [active, setActive] = useState<{
    deck: FlashcardDeck;
    mode: "study" | "match";
  } | null>(null);

  function create() {
    const t = topic.trim();
    if (!t) return;
    generate.mutate(
      { topic: t },
      {
        onSuccess: () => {
          setTopic("");
          toast({ title: "Deck created" });
        },
        onError: (err) =>
          toast({
            title: "Couldn't create deck",
            description: err.message,
            variant: "destructive",
          }),
      },
    );
  }

  if (active) {
    return (
      <div className="animate-in fade-in duration-300">
        {active.mode === "study" ? (
          <StudyMode deck={active.deck} onBack={() => setActive(null)} />
        ) : (
          <MatchGame deck={active.deck} onBack={() => setActive(null)} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <Layers className="h-7 w-7 text-primary" />
          Flashcards & Games
        </h1>
        <p className="mt-1 text-muted-foreground">
          Generate a deck on any topic, then study it or play a matching game.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
          <Input
            placeholder="Topic, e.g. Photosynthesis, World War II, Fractions"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
          />
          <Button onClick={create} disabled={generate.isPending || !topic.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            {generate.isPending ? "Generating..." : "Generate deck"}
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : decks && decks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Card key={deck.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">{deck.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {deck.cards.length} cards
                </p>
              </CardHeader>
              <CardContent className="mt-auto flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setActive({ deck, mode: "study" })}>
                  <Layers className="mr-1.5 h-4 w-4" />
                  Study
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActive({ deck, mode: "match" })}
                  disabled={deck.cards.length < 2}
                >
                  <Gamepad2 className="mr-1.5 h-4 w-4" />
                  Match
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    del.mutate(deck.id, {
                      onError: (err) =>
                        toast({
                          title: "Couldn't delete",
                          description: err.message,
                          variant: "destructive",
                        }),
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No decks yet. Generate your first one above.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
