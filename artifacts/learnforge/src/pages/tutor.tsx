import { useEffect, useRef, useState } from "react";
import { GraduationCap, Send, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api-error";

type TutorMessage = { role: "tutor" | "student"; content: string };

const STORAGE_KEY = "learnforge:tutor-progress";

type Saved = { subject: string; messages: TutorMessage[] };

function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Saved;
    if (!Array.isArray(parsed.messages)) return null;
    return { subject: parsed.subject ?? "", messages: parsed.messages };
  } catch {
    return null;
  }
}

export default function Tutor() {
  const { toast } = useToast();
  const [subject, setSubject] = useState<string>(
    () => loadSaved()?.subject ?? "",
  );
  const [messages, setMessages] = useState<TutorMessage[]>(
    () => loadSaved()?.messages ?? [],
  );
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ subject, messages }));
    } catch {
      /* ignore */
    }
  }, [subject, messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  const started = messages.length > 0;

  async function send(next: TutorMessage[]) {
    setBusy(true);
    try {
      const res = await fetch("/api/tutor/message", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim() || undefined, messages: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => undefined);
        throw new Error(
          errorMessage(
            { status: res.status, data },
            "The tutor couldn't respond.",
          ),
        );
      }
      const data = (await res.json()) as { message: string };
      setMessages([...next, { role: "tutor", content: data.message }]);
    } catch (err) {
      toast({
        title: "Tutor unavailable",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  function begin() {
    if (busy) return;
    void send([]);
  }

  function submitDraft() {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    void send([...messages, { role: "student", content: text }]);
  }

  function reset() {
    setMessages([]);
    setDraft("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col gap-4 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <GraduationCap className="h-7 w-7 text-primary" />
            AI Tutor
          </h1>
          <p className="mt-1 text-muted-foreground">
            Ask anything and get patient, step-by-step help.
          </p>
        </div>
        {started && (
          <Button variant="outline" size="sm" onClick={reset} disabled={busy}>
            <RotateCcw className="mr-2 h-4 w-4" />
            New chat
          </Button>
        )}
      </div>

      {!started ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <label className="block text-sm font-medium text-foreground">
              What would you like help with? (optional)
            </label>
            <Input
              placeholder="e.g. Algebra, the water cycle, essay writing"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && begin()}
            />
            <Button onClick={begin} disabled={busy}>
              {busy ? "Starting..." : "Start tutoring"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-border bg-card/40 p-4"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "student" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "student"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                  Tutor is thinking...
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Type your question..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitDraft()}
              disabled={busy}
            />
            <Button onClick={submitDraft} disabled={busy || !draft.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
