import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function NewsletterSignup({
  source,
  title = "Get free learning updates",
  description = "New games, career tools, and exam tips — occasional email, no spam. Same list as EbookGamez Literary Club.",
  compact = false,
}: {
  source: string;
  title?: string;
  description?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok) {
        toast({
          title: "Could not subscribe",
          description: data.error ?? "Please try again later.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "You're subscribed",
        description: data.message ?? "Check your inbox for a welcome email.",
      });
      setEmail("");
    } catch {
      toast({
        title: "Network error",
        description: "Could not reach the server. Try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="sm:flex-1"
          aria-label="Email for updates"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "…" : "Subscribe"}
        </Button>
      </form>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-primary">
        <Mail className="h-5 w-5" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="sm:flex-1"
          aria-label="Email for updates"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Subscribing…" : "Subscribe free"}
        </Button>
      </form>
    </div>
  );
}
