import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearch } from "wouter";
import {
  Building2,
  Loader2,
  Copy,
  Check,
  Download,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type OrderReady = {
  status: "ready";
  plan: string;
  planLabel: string;
  quantity: number;
  durationDays: number;
  amountTotalCents: number;
  currency: string;
  codes: string[];
};
type OrderPending = { status: "pending" };
type OrderResponse = OrderReady | OrderPending;

const MAX_POLLS = 8;

export default function SchoolCodes() {
  const search = useSearch();
  const sessionId = new URLSearchParams(search).get("session_id");
  const { toast } = useToast();

  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "pending" }
    | { kind: "error"; message: string }
    | { kind: "ready"; data: OrderReady }
  >({ kind: "loading" });
  const [copiedAll, setCopiedAll] = useState(false);
  const pollsRef = useRef(0);

  const load = useCallback(async () => {
    if (!sessionId) {
      setState({ kind: "error", message: "Missing order reference." });
      return;
    }
    try {
      const res = await fetch(
        `/api/school/order/${encodeURIComponent(sessionId)}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        let message = "We couldn't load your order.";
        try {
          const data = (await res.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          // ignore
        }
        setState({ kind: "error", message });
        return;
      }
      const data = (await res.json()) as OrderResponse;
      if (data.status === "ready") {
        setState({ kind: "ready", data });
        return;
      }
      // Payment still settling — retry a few times.
      pollsRef.current += 1;
      if (pollsRef.current >= MAX_POLLS) {
        setState({ kind: "pending" });
        return;
      }
      setState({ kind: "pending" });
      setTimeout(() => void load(), 2000);
    } catch {
      setState({
        kind: "error",
        message: "Something went wrong loading your order.",
      });
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  function copyAll(codes: string[]) {
    void navigator.clipboard
      .writeText(codes.join("\n"))
      .then(() => {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      })
      .catch(() => {
        toast({
          title: "Couldn't copy",
          description: "Please copy the codes manually.",
          variant: "destructive",
        });
      });
  }

  function downloadCsv(data: OrderReady) {
    const lines = ["access_code", ...data.codes];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `learnforge-access-codes-${data.quantity}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Your access codes
        </h1>
      </div>

      {state.kind === "loading" && (
        <div className="mt-8 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your order...
        </div>
      )}

      {state.kind === "pending" && (
        <div className="mt-8 rounded-2xl border border-card-border bg-card p-6">
          <div className="flex items-center gap-2 text-card-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="font-medium">Confirming your payment...</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            This can take a few moments. Your codes will appear here as soon as
            the payment settles — it's safe to refresh this page.
          </p>
          <Button onClick={() => void load()} variant="outline" className="mt-4">
            Check again
          </Button>
        </div>
      )}

      {state.kind === "error" && (
        <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="font-medium">{state.message}</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            If you were charged, contact us at ebookgames@yahoo.com or
            702-379-0396 and we'll sort it out right away.
          </p>
          <Button asChild variant="outline" className="mt-4 gap-2">
            <Link href="/pricing">
              Back to pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {state.kind === "ready" && (
        <div className="mt-6">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <p className="font-medium text-card-foreground">
              Payment complete — {state.data.quantity} seats,{" "}
              {state.data.planLabel} ({state.data.durationDays} days each).
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Share one code per student. Each student signs in and redeems their
              code on the pricing page to unlock Pro. Codes are single-use.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              onClick={() => copyAll(state.data.codes)}
              variant="outline"
              className="gap-2"
            >
              {copiedAll ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy all codes
                </>
              )}
            </Button>
            <Button
              onClick={() => downloadCsv(state.data)}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {state.data.codes.map((code) => (
              <div
                key={code}
                className="rounded-lg border border-card-border bg-card px-3 py-2 font-mono text-sm text-card-foreground"
              >
                {code}
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Keep these somewhere safe — you can always return to this page from
            your purchase confirmation. Need help distributing them? Email
            ebookgames@yahoo.com.
          </p>
        </div>
      )}
    </div>
  );
}
