import { useState } from "react";
import { Link } from "wouter";
import { Show } from "@clerk/react";
import {
  Check,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Clock,
  Users,
  Loader2,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AltPayments } from "@/components/alt-payments";
import { SchoolPurchase } from "@/components/school-purchase";
import { SiteFooter } from "@/components/site-footer";

type PlanKey =
  | "pro_monthly"
  | "pro_annual"
  | "junior_monthly"
  | "junior_annual";

type Plan = {
  name: string;
  audience: string;
  price: string;
  period: string;
  note: string;
  cta: string;
  ctaHref: string;
  planKey?: PlanKey;
  highlight?: boolean;
  badge?: string;
  features: string[];
};

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
      // ignore parse errors, keep default message
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

const plans: Plan[] = [
  {
    name: "Junior Monthly",
    audience: "Ages 0-18",
    price: "$3",
    period: "per month",
    note: "9 months free first. After that, just $3/month to keep going — cancel anytime.",
    cta: "Start 9 months free",
    ctaHref: "/sign-up",
    planKey: "junior_monthly",
    features: [
      "9 months completely free to start",
      "Unlimited AI quizzes & full-length exams",
      "AI study guides for any topic",
      "Tailored curriculum & learning plans",
      "College / trade pathway recommendations",
      "AI mock interviews with feedback",
    ],
  },
  {
    name: "Junior Annual",
    audience: "Ages 0-18",
    price: "$30",
    period: "per year",
    note: "9 months free first, then $30/year — just $2.50/month. The best deal for students.",
    cta: "Start 9 months free",
    ctaHref: "/sign-up",
    planKey: "junior_annual",
    highlight: true,
    badge: "Best for students",
    features: [
      "Everything in Junior Monthly",
      "Just $2.50/month, billed yearly",
      "9 months free before any charge",
      "Upload your own PDFs & notes",
      "Earn LearnForge certificates",
      "Cancel anytime",
    ],
  },
  {
    name: "Pro Monthly",
    audience: "Ages 18+",
    price: "$12.99",
    period: "per month",
    note: "Start with 6 months free. Billed monthly after your free period — cancel anytime.",
    cta: "Start 6 months free",
    ctaHref: "/sign-up",
    planKey: "pro_monthly",
    features: [
      "Everything in Junior, with no age limit",
      "Unlimited AI quizzes & full-length exams",
      "Unlimited study guides & curricula",
      "Career & certification exam prep",
      "Priority AI generation",
      "Cancel anytime",
    ],
  },
  {
    name: "Pro Annual",
    audience: "Ages 18+",
    price: "$89.99",
    period: "per year",
    note: "About $7.50/month — save 42% vs. monthly. Start with 6 months free.",
    cta: "Start 6 months free",
    ctaHref: "/sign-up",
    planKey: "pro_annual",
    badge: "Best value",
    features: [
      "Everything in Pro Monthly",
      "Save 42% vs. paying monthly",
      "One simple yearly payment",
      "Priority AI generation",
      "Early access to new features",
      "Cancel anytime",
    ],
  },
];

function PlanCta({ plan }: { plan: Plan }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const variant = plan.highlight ? "default" : "outline";
  const btnClass = "mt-5 w-full gap-2";

  async function startCheckout() {
    if (!plan.planKey) return;
    setBusy(true);
    try {
      const { url } = await postJson<{ url: string | null }>(
        "/api/stripe/checkout",
        { plan: plan.planKey },
      );
      if (!url) throw new Error("Could not start checkout");
      window.location.href = url;
    } catch (err) {
      setBusy(false);
      toast({
        title: "Couldn't start checkout",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
        variant: "destructive",
      });
    }
  }

  // Free plan, or any plan without a Stripe price: just route the user.
  if (!plan.planKey) {
    return (
      <Button asChild size="lg" className={btnClass} variant={variant}>
        <Link href={plan.ctaHref}>
          {plan.cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Show when="signed-out">
        <Button asChild size="lg" className={btnClass} variant={variant}>
          <Link href={plan.ctaHref}>
            {plan.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Show>
      <Show when="signed-in">
        <Button
          size="lg"
          className={btnClass}
          variant={variant}
          onClick={startCheckout}
          disabled={busy}
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting checkout...
            </>
          ) : (
            <>
              {plan.cta}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </Show>
    </>
  );
}

function ManageBillingButton() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function openPortal() {
    setBusy(true);
    try {
      const { url } = await postJson<{ url: string | null }>(
        "/api/stripe/portal",
      );
      if (!url) throw new Error("No billing account yet");
      window.location.href = url;
    } catch (err) {
      setBusy(false);
      toast({
        title: "Couldn't open billing",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
        variant: "destructive",
      });
    }
  }

  return (
    <Button
      variant="ghost"
      className="text-white hover:bg-white/15 hover:text-white"
      onClick={openPortal}
      disabled={busy}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Manage billing"}
    </Button>
  );
}

export default function Pricing() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="app-header sticky top-0 z-40 flex items-center justify-between px-4 py-3 shadow-lg sm:px-6 lg:px-8 lg:h-16 lg:py-0">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-bold text-xl text-white tracking-tight"
        >
          <Logo className="h-8 w-auto text-white" />
          <span>LearnForge</span>
        </Link>
        <div className="flex items-center gap-2">
          <Show when="signed-in">
            <ManageBillingButton />
            <Button asChild className="bg-white text-primary hover:bg-white/90">
              <Link href="/">Go to dashboard</Link>
            </Button>
          </Show>
          <Show when="signed-out">
            <Button
              asChild
              variant="ghost"
              className="text-white hover:bg-white/15 hover:text-white"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild className="bg-white text-primary hover:bg-white/90">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </Show>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-4 pt-16 pb-10 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-foreground/70">Simple, fair pricing</span>
          </div>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            Months free to start.
            <span className="block text-foreground">A fair price to keep going.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Learners under 18 get 9 months completely free, then just $3/month.
            If you're 18 or older, you get the full app free for 6 months — then
            keep going for less than most study apps charge.
          </p>
        </section>

        {/* Model summary band */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-card-border bg-card p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-card-foreground">Under 18? 9 months free.</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Full access to every feature, free for 9 months. After that,
                  keep going for just $3/month (or $30/year).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-card-border bg-card p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-card-foreground">18 or older? 6 months free.</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use everything free for six months, then pick a plan to keep
                  going. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm sm:p-7 ${
                  plan.highlight
                    ? "border-primary shadow-lg ring-1 ring-primary"
                    : "border-card-border"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {plan.badge}
                  </span>
                )}
                <div>
                  <h2 className="text-lg font-bold text-card-foreground">{plan.name}</h2>
                  <p className="text-sm text-muted-foreground">{plan.audience}</p>
                </div>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-tight text-card-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-3 min-h-[2.5rem] text-sm text-muted-foreground">
                  {plan.note}
                </p>
                <PlanCta plan={plan} />
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-card-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Subscription / auto-renewal disclosure */}
          <div className="mt-8 rounded-xl border border-card-border bg-muted/40 p-5 text-sm text-muted-foreground">
            <h3 className="font-semibold text-foreground">Subscription terms</h3>
            <p className="mt-2">
              Paid LearnForge plans are subscriptions that renew automatically.
              After your free period, Junior Monthly is billed $3 each month and
              Junior Annual $30 each year (for learners under 18); Pro Monthly is
              billed $12.99 each month and Pro Annual $89.99 each year, using your
              payment method on file, until you cancel. You can cancel anytime from
              Manage billing in your account; cancelling stops future charges and
              your access continues until the end of the current billing period. By
              subscribing you authorize these recurring charges.
            </p>
            <p className="mt-2">
              To keep your data private and secure, quiz and study activity is
              retained for 90 days. Earned certificates are valid for 90 days from
              the date you complete a certified exam.
            </p>
            <p className="mt-2">
              See our{" "}
              <Link href="/terms" className="font-medium text-foreground underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/refund" className="font-medium text-foreground underline">
                Refunds &amp; Cancellation Policy
              </Link>
              .
            </p>
          </div>

          {/* Schools / educators — self-serve bulk seats */}
          <SchoolPurchase />

          {/* Alternative / international payments */}
          <AltPayments />
        </section>

        {/* Why it's competitive */}
        <section className="border-y border-border bg-card/40">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              More in one place, for less.
            </h2>
            <p className="mx-auto mt-3 text-muted-foreground">
              Most study and test-prep apps charge between $13 and $40 a month —
              and you often need several of them. LearnForge puts unlimited AI
              quizzes, full-length exams, study guides, curricula, career pathways,
              and mock interviews under one plan — with 9 months free for anyone under 18.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              No credit card to start. Cancel anytime.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Pricing questions
          </h2>
          <div className="mt-8 space-y-4">
            {[
              {
                q: "What do learners under 18 get?",
                a: "If you're under 18, you get 9 months completely free with full access to every feature — no credit card required. After that, you can keep going on the Junior plan for just $3/month or $30/year.",
              },
              {
                q: "What happens after my 6 free months as an adult?",
                a: "Once your six free months end, you choose Pro Monthly or Pro Annual to keep your full access. You won't be charged during the free period, and you can cancel before it ends.",
              },
              {
                q: "How long is my activity and certificates kept?",
                a: "To keep your data private, your quiz and study activity is retained for 90 days. Certificates you earn on certified exams are valid for 90 days from the day you complete them.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. You can cancel a Pro plan at any time and keep access until the end of the period you've paid for.",
              },
              {
                q: "What's the difference between monthly and annual?",
                a: "They include the exact same features. Annual is billed once a year and works out to about $7.50/month — a 42% saving over paying monthly.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-card-border bg-card p-5"
              >
                <h3 className="font-semibold text-card-foreground">{item.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-card-border bg-card p-10 text-center shadow-lg sm:p-14">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Start learning for free today.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Create your account and get full access — 9 months free under 18, and
              6 months free for everyone else.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Show when="signed-out">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/sign-up">
                    Get started free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              </Show>
              <Show when="signed-in">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/">
                    Go to dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </Show>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
