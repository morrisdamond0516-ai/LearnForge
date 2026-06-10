import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Show } from "@clerk/react";
import { Globe, Ticket, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type Entitlement = {
  pro: boolean;
  source: "stripe" | "code" | "none";
  until: string | null;
};

type PayPalPlan = {
  plan: "pro_monthly" | "pro_annual";
  amount: string;
  currency: string;
  durationDays: number;
  label: string;
};

type PayPalConfig =
  | { enabled: false; plans: [] }
  | {
      enabled: true;
      clientId: string;
      environment: "live" | "sandbox";
      currency: string;
      plans: PayPalPlan[];
    };

interface PayPalButtonsApi {
  Buttons: (opts: {
    style?: Record<string, unknown>;
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onError?: (err: unknown) => void;
    onCancel?: () => void;
  }) => { render: (el: HTMLElement) => void; close?: () => void };
}

declare global {
  interface Window {
    paypal?: PayPalButtonsApi;
  }
}

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

function loadPayPalSdk(clientId: string, currency: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-paypal-sdk]",
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("PayPal SDK failed to load")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId,
    )}&currency=${encodeURIComponent(currency)}&intent=capture`;
    script.dataset.paypalSdk = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("PayPal SDK failed to load"));
    document.body.appendChild(script);
  });
}

function PayPalButton({
  plan,
  onSuccess,
}: {
  plan: PayPalPlan;
  onSuccess: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!window.paypal || !ref.current) return;
    const buttons = window.paypal.Buttons({
      style: { layout: "horizontal", height: 40, tagline: false },
      createOrder: async () => {
        const { orderId } = await postJson<{ orderId: string }>(
          "/api/paypal/create-order",
          { plan: plan.plan },
        );
        return orderId;
      },
      onApprove: async (data) => {
        try {
          await postJson("/api/paypal/capture", { orderId: data.orderID });
          toast({
            title: "Payment complete",
            description: `Pro is active for ${plan.durationDays} days. Enjoy!`,
          });
          onSuccess();
        } catch (err) {
          toast({
            title: "Payment couldn't be completed",
            description:
              err instanceof Error ? err.message : "Please try again.",
            variant: "destructive",
          });
        }
      },
      onError: () => {
        toast({
          title: "PayPal error",
          description: "Something went wrong with PayPal. Please try again.",
          variant: "destructive",
        });
      },
    });
    buttons.render(ref.current);
    return () => {
      try {
        buttons.close?.();
      } catch {
        // ignore teardown errors
      }
    };
  }, [plan, onSuccess, toast]);

  const dollars = `$${plan.amount}`;
  const period = plan.durationDays >= 365 ? "1 year" : "1 month";

  return (
    <div className="rounded-xl border border-card-border bg-background/60 p-4">
      <p className="text-sm font-semibold text-card-foreground">
        {dollars} — {period} of Pro
      </p>
      <p className="mt-1 mb-3 text-xs text-muted-foreground">
        One-time payment via PayPal. Does not auto-renew.
      </p>
      <div ref={ref} />
    </div>
  );
}

function RedeemForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    try {
      const res = await postJson<{ grantedDays: number }>(
        "/api/access-codes/redeem",
        { code: code.trim() },
      );
      toast({
        title: "Code redeemed",
        description: `Pro is active for ${res.grantedDays} days. Enjoy!`,
      });
      setCode("");
      onSuccess();
    } catch (err) {
      toast({
        title: "Couldn't redeem code",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter access code (e.g. LF-XXXX-XXXX)"
        className="sm:max-w-xs"
        autoCapitalize="characters"
        spellCheck={false}
      />
      <Button type="submit" disabled={busy} className="gap-2">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redeeming...
          </>
        ) : (
          "Redeem code"
        )}
      </Button>
    </form>
  );
}

function ProStatus({ entitlement }: { entitlement: Entitlement | null }) {
  if (!entitlement?.pro) return null;
  const until = entitlement.until
    ? new Date(entitlement.until).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const text =
    entitlement.source === "stripe"
      ? "Pro is active on your subscription."
      : until
        ? `Pro is active until ${until}.`
        : "Pro is active.";
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
      <CheckCircle2 className="h-4 w-4" />
      {text}
    </div>
  );
}

function SignedInAltPayments() {
  const [config, setConfig] = useState<PayPalConfig | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);

  async function refreshEntitlement() {
    try {
      const res = await fetch("/api/entitlement", { credentials: "include" });
      if (res.ok) setEntitlement((await res.json()) as Entitlement);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    void refreshEntitlement();
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/paypal/config", {
          credentials: "include",
        });
        if (!res.ok) return;
        const cfg = (await res.json()) as PayPalConfig;
        if (cancelled) return;
        setConfig(cfg);
        if (cfg.enabled) {
          await loadPayPalSdk(cfg.clientId, cfg.currency);
          if (!cancelled) setSdkReady(true);
        }
      } catch {
        // PayPal stays hidden if anything fails
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <ProStatus entitlement={entitlement} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-2 text-card-foreground">
            <Ticket className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">Have an access code?</h4>
          </div>
          <p className="mt-1 mb-3 text-sm text-muted-foreground">
            Schools and sponsors can buy codes and share them with learners.
            Redeem one here to unlock Pro.
          </p>
          <RedeemForm onSuccess={refreshEntitlement} />
        </div>

        {config?.enabled && sdkReady && config.plans.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-card-foreground">
              <Globe className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Pay with PayPal</h4>
            </div>
            <p className="mt-1 mb-3 text-sm text-muted-foreground">
              A one-time payment that unlocks Pro for the chosen period — handy
              where card checkout isn't available.
            </p>
            <div className="grid gap-3">
              {config.plans.map((p) => (
                <PayPalButton
                  key={p.plan}
                  plan={p}
                  onSuccess={refreshEntitlement}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AltPayments() {
  return (
    <div className="mt-6 rounded-2xl border border-card-border bg-card p-6 sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Globe className="h-5 w-5" />
        </span>
        <div className="w-full">
          <h3 className="font-semibold text-card-foreground">
            More ways to pay (including outside card-supported countries)
          </h3>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Card checkout isn't available everywhere. Redeem an access code from
            a school or sponsor, or pay with PayPal, to get Pro from anywhere.
          </p>

          <Show when="signed-in">
            <SignedInAltPayments />
          </Show>
          <Show when="signed-out">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/sign-up">
                Sign up to redeem a code or pay with PayPal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Show>
        </div>
      </div>
    </div>
  );
}
