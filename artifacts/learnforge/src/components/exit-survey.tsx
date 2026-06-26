import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const STORAGE_KEY = "learnforge:exit-survey-shown";
const MIN_TIME_MS = 12_000;

const REASONS = [
  "Just exploring, not ready to commit",
  "Couldn't find what I was looking for",
  "Something wasn't working right",
  "Pricing or cost concern",
  "Need to think about it",
  "Other",
] as const;

type Reason = (typeof REASONS)[number];

/**
 * Shows a short exit-intent survey when the user moves their cursor out of the
 * viewport toward the browser UI (tab bar / address bar). Triggered at most
 * once per browser session, only after the visitor has been on the page for at
 * least MIN_TIME_MS milliseconds, so casual accidental movements don't trigger
 * it immediately. Submits as an `exit_survey` analytics event and then
 * dismisses. "No thanks" dismisses without recording anything.
 */
export function ExitSurvey() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason | null>(null);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [location] = useLocation();
  const arrivedAt = useRef(Date.now());
  const triggered = useRef(false);

  // Reset arrival time on navigation so the timer restarts per page.
  useEffect(() => {
    arrivedAt.current = Date.now();
  }, [location]);

  useEffect(() => {
    // If already shown this browser session, don't set up listeners.
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // sessionStorage blocked — skip the survey entirely rather than spam.
      return;
    }

    function maybeShow() {
      if (triggered.current) return;
      const elapsed = Date.now() - arrivedAt.current;
      if (elapsed < MIN_TIME_MS) return;
      try {
        if (sessionStorage.getItem(STORAGE_KEY)) return;
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        return;
      }
      triggered.current = true;
      setOpen(true);
    }

    // Primary trigger: mouse exits through the top of the viewport (heading
    // toward the tab bar / address bar — classic exit intent).
    function onMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0) maybeShow();
    }

    // Secondary trigger: tab becomes hidden (switching tabs or minimizing).
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") maybeShow();
    }

    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  function dismiss() {
    setOpen(false);
  }

  function submit() {
    if (!reason) return;
    trackEvent("exit_survey", window.location.pathname, {
      reason,
      details: details.trim() || null,
    });
    setSubmitted(true);
    setTimeout(() => setOpen(false), 1800);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss(); }}>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="py-6 text-center">
            <p className="text-lg font-semibold text-foreground">Thank you!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your feedback helps us improve LearnForge.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Quick question before you go</DialogTitle>
              <DialogDescription>
                What's the main reason for leaving? One click is all we ask.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 space-y-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                    reason === r
                      ? "border-primary bg-primary/8 text-foreground font-medium"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {reason && (
              <div className="mt-3">
                <Textarea
                  placeholder="Anything specific we could fix? (optional)"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="resize-none text-sm"
                />
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button
                onClick={submit}
                disabled={!reason}
                className="flex-1"
              >
                Send feedback
              </Button>
              <Button variant="ghost" onClick={dismiss} className="flex-1 text-muted-foreground">
                No thanks
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
