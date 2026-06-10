import { Link } from "wouter";
import { Show } from "@clerk/react";
import {
  GraduationCap,
  Check,
  Sparkles,
  ShieldCheck,
  Building2,
  ArrowRight,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

type Plan = {
  name: string;
  audience: string;
  price: string;
  period: string;
  note: string;
  cta: string;
  ctaHref: string;
  highlight?: boolean;
  badge?: string;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Students",
    audience: "Ages 0-18",
    price: "$0",
    period: "free forever",
    note: "No credit card. No trial clock. Free for every learner under 18.",
    cta: "Start free",
    ctaHref: "/sign-up",
    features: [
      "Unlimited AI quizzes & full-length exams",
      "AI study guides for any topic",
      "Tailored curriculum & learning plans",
      "College / trade pathway recommendations",
      "AI mock interviews with feedback",
      "Upload your own PDFs & notes",
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
    features: [
      "Everything in Students, with no age limit",
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
    highlight: true,
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

export default function Pricing() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="app-header sticky top-0 z-40 flex items-center justify-between px-4 py-3 shadow-lg sm:px-6 lg:px-8 lg:h-16 lg:py-0">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-bold text-xl text-white tracking-tight"
        >
          <GraduationCap className="h-6 w-6 text-accent" />
          <span>LearnForge</span>
        </Link>
        <div className="flex items-center gap-2">
          <Show when="signed-in">
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
            Free for students.
            <span className="block text-primary">A fair price for everyone else.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            LearnForge is free for every learner under 18. If you're 18 or older,
            you get the full app free for 6 months — then keep going for less than
            most study apps charge.
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
                <h3 className="font-semibold text-card-foreground">Under 18? It's free.</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Full access to every feature, free forever, with no credit card
                  required.
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
          <div className="grid gap-6 lg:grid-cols-3">
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
                <Button
                  asChild
                  size="lg"
                  className="mt-5 w-full gap-2"
                  variant={plan.highlight ? "default" : "outline"}
                >
                  <Link href={plan.ctaHref}>
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
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

          {/* Schools / educators */}
          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-card-border bg-card p-6 sm:flex-row sm:items-center sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-card-foreground">Schools & educators</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bulk seats for classrooms and districts, with simple admin
                  management. Custom pricing for your school.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <a href="mailto:hello@learnforge.app?subject=LearnForge%20for%20schools">
                Contact us
              </a>
            </Button>
          </div>
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
              and mock interviews under one plan, and it's free for anyone under 18.
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
                q: "Is it really free for people under 18?",
                a: "Yes. If you're 18 or younger, LearnForge is free forever with full access to every feature — no credit card required.",
              },
              {
                q: "What happens after my 6 free months as an adult?",
                a: "Once your six free months end, you choose Pro Monthly or Pro Annual to keep your full access. You won't be charged during the free period, and you can cancel before it ends.",
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
              Create your account and get full access — free under 18, and free for
              six months for everyone else.
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

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">LearnForge</span> · Free for
        learners under 18 ·{" "}
        <a href={`${basePath}/sign-up`} className="font-medium text-primary">
          Get started
        </a>
      </footer>
    </div>
  );
}
