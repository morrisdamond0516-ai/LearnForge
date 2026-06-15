import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { errorMessage } from "@/lib/api-error";

export type Flashcard = { front: string; back: string };

export type FlashcardDeck = {
  id: number;
  userId: string | null;
  subjectId: number | null;
  topic: string;
  title: string;
  cards: Flashcard[];
  createdAt: string;
};

export const DECKS_KEY = ["flashcards"] as const;

async function readError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => undefined);
  return errorMessage({ status: res.status, data }, fallback);
}

export function useDecks() {
  return useQuery<FlashcardDeck[]>({
    queryKey: DECKS_KEY,
    queryFn: async () => {
      const res = await fetch("/api/flashcards", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load your decks");
      const data = (await res.json()) as { decks: FlashcardDeck[] };
      return data.decks;
    },
  });
}

export function useDeck(id: number | null) {
  return useQuery<FlashcardDeck>({
    queryKey: [...DECKS_KEY, id],
    enabled: id != null,
    queryFn: async () => {
      const res = await fetch(`/api/flashcards/${id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load the deck");
      return (await res.json()) as FlashcardDeck;
    },
  });
}

export function useGenerateDeck() {
  const qc = useQueryClient();
  return useMutation<
    FlashcardDeck,
    Error,
    { topic: string; subjectId?: number; count?: number }
  >({
    mutationFn: async (input) => {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        throw new Error(await readError(res, "Couldn't generate the deck"));
      }
      return (await res.json()) as FlashcardDeck;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: DECKS_KEY }),
  });
}

export function useDeleteDeck() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await readError(res, "Couldn't delete deck"));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: DECKS_KEY }),
  });
}
