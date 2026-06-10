import { useState } from "react";
import { Link } from "wouter";
import { Show } from "@clerk/react";
import { Building2, Loader2, ArrowRight, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type SchoolPlanKey = "school_semester" | "school_year";

// Display mirror of the server deal in api-server/src/lib/schoolPricing.ts.
// The server recomputes the authoritative price at checkout (anti-tamper) — keep
// these numbers in sync if you change the deal there.
const DEAL: Record<
  SchoolPlanKey,
  {
    label: string;
    months: string;
    tiers: { minQty: number; perSeatCents: number }[];
  }
> = {
  school_year: {
    label: "Full year",
    months: "12 months",
    tiers: [
      { minQty: 5, perSeatCents: 5999 },
      { minQty: 25, perSeatCents: 4999 },
      { minQty: 100, perSeatCents: 3999 },
      { minQty: 300, perSeatCents: 2999 },
    ],
  },
  school_semester: {
    label: "Semester",
    months: "6 months",
    tiers: [
      { minQty: 5, perSeatCents: 3599 },
      { minQty: 25, perSeatCents: 2999 },
      { minQty: 100, perSeatCents: 2399 },
      { minQty: 300, perSeatCents: 1799 },
    ],
  },
};

const MIN_SEATS = 5;
const MAX_SEATS = 5000;

function perSeatFor(plan: SchoolPlanKey, qty: number): number {
  let cents = DEAL[plan].tiers[0].perSeatCents;
  for (const t of DEAL[plan].tiers) if (qty >= t.minQty) cents = t.perSeatCents;
  return cents;
}

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
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

function BuyWidget() {
  const { toast } = useToast();
  const [plan, setPlan] = useState<SchoolPlanKey>("school_year");
  const [qtyInput, setQtyInput] = useState("30");
  const [busy, setBusy] = useState(false);

  const parsed = parseInt(qtyInput, 10);
  const qty = Number.isFinite(parsed) ? parsed : 0;
  const valid = Number.isInteger(qty) && qty >= MIN_SEATS && qty <= MAX_SEATS;
  const perSeat = valid ? perSeatFor(plan, qty) : DEAL[plan].tiers[0].perSeatCents;
  const total = valid ? perSeat * qty : 0;

  async function buy() {
    if (!valid) return;
    setBusy(true);
    try {
      const { url } = await postJson<{ url: string }>("/api/school/checkout", {
        plan,
        quantity: qty,
      });
      window.location.href = url;
    } catch (err) {
      toast({
        title: "Couldn't start checkout",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      {/* Duration */}
      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(DEAL) as SchoolPlanKey[]).map((key) => {
          const active = plan === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setPlan(key)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                active
                  ? "border-primary bg-primary/5"
                  : "border-card-border bg-background/60 hover:border-primary/40"
              }`}
            >
              <p className="text-sm font-semibold text-card-foreground">
                {DEAL[key].label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {DEAL[key].months} of Pro per student. From{" "}
                {fmt(DEAL[key].tiers[DEAL[key].tiers.length - 1].perSeatCents)}
                /seat at volume.
              </p>
            </button>
          );
        })}
      </div>

      {/* Volume discount table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-card-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-background/60 text-muted-foreground">
              <th className="px-4 py-2 text-left font-medium">Seats</th>
              <th className="px-4 py-2 text-right font-medium">
                Price per student ({DEAL[plan].label.toLowerCase()})
              </th>
            </tr>
          </thead>
          <tbody>
            {DEAL[plan].tiers.map((t, i) => {
              const next = DEAL[plan].tiers[i + 1];
              const range = next ? `${t.minQty}–${next.minQty - 1}` : `${t.minQty}+`;
              const isActive = valid && perSeat === t.perSeatCents;
              return (
                <tr
                  key={t.minQty}
                  className={`border-t border-card-border ${
                    isActive ? "bg-primary/5 font-medium text-card-foreground" : ""
                  }`}
                >
                  <td className="px-4 py-2">{range} students</td>
                  <td className="px-4 py-2 text-right">{fmt(t.perSeatCents)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quantity + total */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div>
          <label
            htmlFor="seat-count"
            className="mb-1 block text-sm font-medium text-card-foreground"
          >
            Number of students
          </label>
          <Input
            id="seat-count"
            type="number"
            min={MIN_SEATS}
            max={MAX_SEATS}
            value={qtyInput}
            onChange={(e) => setQtyInput(e.target.value)}
            className="w-40"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {MIN_SEATS}–{MAX_SEATS} seats. {fmt(perSeat)} per student.
          </p>
        </div>
        <div className="sm:ml-auto sm:text-right">
          <p className="text-sm text-muted-foreground">Total today</p>
          <p className="text-2xl font-bold text-card-foreground">
            {valid ? fmt(total) : "—"}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Show when="signed-in">
          <Button onClick={buy} disabled={!valid || busy} className="gap-2">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting checkout...
              </>
            ) : (
              <>
                Buy {valid ? qty : ""} seats
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </Show>
        <Show when="signed-out">
          <Button asChild className="gap-2">
            <Link href="/sign-up">
              Sign in to buy seats
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Show>
        <p className="mt-3 text-sm text-muted-foreground">
          You'll get one redeemable access code per seat right after payment —
          hand them out to your students, who redeem to unlock Pro. One-time
          purchase, no auto-renew.
        </p>
      </div>
    </div>
  );
}

export function SchoolPurchase() {
  return (
    <div className="mt-6 rounded-2xl border border-card-border bg-card p-6 sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </span>
        <div className="w-full">
          <h3 className="font-semibold text-card-foreground">
            Schools &amp; educators — buy seats instantly
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Bring LearnForge to your classroom or district. Pick how many
            students you need and the price per seat drops automatically with
            volume. Pay now and get your redeemable codes on the spot — no
            quotes, no waiting.
          </p>

          <BuyWidget />

          <div className="mt-6 border-t border-card-border pt-4">
            <p className="text-sm text-muted-foreground">
              Questions? We're a real team — reach us anytime.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline" className="shrink-0 gap-2">
                <a href="mailto:ebookgames@yahoo.com?subject=LearnForge%20for%20schools">
                  <Mail className="h-4 w-4" />
                  ebookgames@yahoo.com
                </a>
              </Button>
              <Button asChild variant="outline" className="shrink-0 gap-2">
                <a href="tel:+17023790396">
                  <Phone className="h-4 w-4" />
                  702-379-0396
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
