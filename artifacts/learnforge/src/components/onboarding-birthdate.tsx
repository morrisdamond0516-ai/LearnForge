import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, CalendarDays, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { useMe, ME_QUERY_KEY } from "@/hooks/use-me";

/**
 * One-time onboarding gate: signed-in learners must provide a date of birth so
 * the app can set up the right plan (under-18 get 9 free months, then the
 * low-cost Junior plan). Shown as a blocking overlay until a birthdate is saved.
 * Date of birth is immutable once set.
 */
export function OnboardingBirthdate() {
  const { data: me } = useMe();
  const queryClient = useQueryClient();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!me?.needsBirthDate) return null;

  const today = new Date().toISOString().slice(0, 10);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!value) {
      setError("Please enter your date of birth.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/me/birthdate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ birthDate: value }),
      });
      if (!res.ok) {
        let message = "Could not save your date of birth.";
        try {
          const data = (await res.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          // keep default
        }
        throw new Error(message);
      }
      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-card-border bg-card p-6 shadow-xl sm:p-8">
        <div className="flex items-center gap-2 text-card-foreground">
          <Logo className="h-8 w-auto text-primary" />
          <span className="text-lg font-bold tracking-tight">LearnForge</span>
        </div>

        <div className="mt-5 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-card-foreground">
              One quick step before you start
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your date of birth so we can set up the right plan for you.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-5">
          <label
            htmlFor="birthdate"
            className="text-sm font-medium text-card-foreground"
          >
            Date of birth
          </label>
          <Input
            id="birthdate"
            type="date"
            max={today}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1.5"
          />
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

          <div className="mt-4 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Learners under 18 get 9 months free, then a low $3/month plan.
                Your date of birth is used only to set up your plan and can't be
                changed later, so please enter it correctly.
              </span>
            </p>
          </div>

          <Button type="submit" className="mt-5 w-full gap-2" disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
