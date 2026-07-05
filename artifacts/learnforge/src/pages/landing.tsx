import { Link } from "wouter";
import {
  GraduationCap,
  BookOpen,
  Library,
  Compass,
  BookMarked,
  FileText,
  ArrowRight,
  Target,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { Logo } from "@/components/logo";
import mascot from "@/assets/mascot.png";

const features = [
  {
    icon: Compass,
    title: "Real job & certification exams",
    description:
      "Prep for the actual hiring, civil-service, and certification tests employers use — at full length, mirroring how the real exam is built.",
  },
  {
    icon: GraduationCap,
    title: "Custom quizzes & exams",
    description:
      "Generate placement, practice, or exam tests for any subject. Scored instantly with clear explanations for every answer.",
  },
  {
    icon: RefreshCw,
    title: "Fresh questions every time",
    description:
      "Each attempt is newly generated, so you learn the material instead of memorizing a fixed answer key.",
  },
  {
    icon: BookMarked,
    title: "Tailored curriculum",
    description:
      "Turn any assessment into an ordered learning plan built from real books, videos, courses, and tools.",
  },
  {
    icon: Library,
    title: "AI study guides",
    description:
      "Get a clear summary, the key points that matter, and concrete next steps for any topic you want to master.",
  },
  {
    icon: FileText,
    title: "Your own materials",
    description:
      "Upload your PDFs, transcripts, and notes and turn them straight into quizzes and study sessions.",
  },
];

const steps = [
  {
    icon: Target,
    title: "Pick your goal",
    description:
      "Choose a subject, a career or certification, a free-form topic, or upload your own document.",
  },
  {
    icon: Sparkles,
    title: "Generate your exam",
    description:
      "Our AI builds a realistic test — auto-matched to the real exam's length — in seconds.",
  },
  {
    icon: CheckCircle2,
    title: "Learn from every answer",
    description:
      "Get scored results, explanations, your assessed level, and a curriculum to close the gaps.",
  },
];

export default function Landing() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="app-header sticky top-0 z-40 flex items-center justify-between px-4 py-3 shadow-lg sm:px-6 lg:px-8 lg:h-16 lg:py-0">
        <div className="flex shrink-0 items-center gap-2 font-bold text-xl tracking-tight">
          <Logo className="h-8 w-auto text-white" />
          <span>
            <span className="text-white">Learn</span><span style={{ color: "hsl(38 90% 62%)" }}>Forge</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            className="hidden text-white hover:bg-white/15 hover:text-white sm:inline-flex"
          >
            <Link href="/pricing">Pricing</Link>
          </Button>
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
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-foreground/70">AI-powered test prep for students</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              From the team behind{" "}
              <a
                href="https://ebookgamez.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent hover:underline"
              >
                EbookGamez.com
              </a>{" "}
              — your complete gaming, reading &amp; learning hub.
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-accent">Forge the skills to ace the exam, graduate,</span>
              <span className="block text-primary">get hired, and stay ahead.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg font-medium gradient-text-diagonal">
              LearnForge turns any subject, college course, document, or career
              goal into a realistic practice exam — the real test, at full length,
              with fresh questions every time and an instant explanation for every
              answer. From passing the next class to earning a high school diploma,
              a college degree, or a professional certification, it meets every
              student right where they are.
            </p>
            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/sign-up">
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in">I already have an account</Link>
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Free to start. No credit card required.
            </p>
          </div>

          {/* Hero visual: mock exam result card */}
          <div className="relative">
            <div
              className="absolute -inset-4 -z-10 rounded-3xl opacity-60 blur-2xl"
              style={{
                background:
                  "radial-gradient(60% 60% at 70% 20%, hsl(38 92% 50% / 0.18), transparent), radial-gradient(60% 60% at 20% 90%, hsl(224 85% 52% / 0.18), transparent)",
              }}
            />
            <img
              src={mascot}
              alt="LearnForge mascot, a friendly owl in a graduation cap reading a glowing book"
              className="pointer-events-none absolute -top-24 -right-2 z-10 h-28 w-28 drop-shadow-xl sm:-top-28 sm:h-32 sm:w-32"
            />
            <div className="rounded-2xl border border-card-border bg-card p-5 shadow-lg sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Compass className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">
                      Police Officer Entrance Exam
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Practice test · Math section
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  <Clock className="h-3 w-3" />
                  50 questions
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-card-border bg-background p-4">
                <p className="text-sm font-medium text-card-foreground">
                  A client has four overdue bills: $128.50, $76.25, $94.00, and
                  $51.75. What is the total owed?
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2 text-sm text-muted-foreground">
                    <span>$348.50</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-medium text-card-foreground">
                    <span>$350.50</span>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xl font-bold text-card-foreground">92%</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xl font-bold text-card-foreground">Advanced</p>
                  <p className="text-xs text-muted-foreground">Level</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xl font-bold text-card-foreground">46/50</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="border-y border-border bg-card/40">
          <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Studying shouldn't feel like guessing.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Generic flashcards don't look like the test you're actually facing.
              Real exams are long. Practice sets are short. And the night before,
              you still don't know if you're ready.
            </p>
            <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
              {[
                "Practice tests too short to reflect the real exam",
                "No idea what level you're actually at",
                "Memorizing answers instead of learning",
              ].map((pain) => (
                <div
                  key={pain}
                  className="rounded-xl border border-card-border bg-card p-4 text-sm text-card-foreground"
                >
                  {pain}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              From "I should study" to ready — in minutes.
            </h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="h-7 w-7" />
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-primary">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Differentiator band */}
        <section className="app-header">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Practice the real exam — not a watered-down version.
              </h2>
              <p className="mt-4 text-lg text-white/80">
                Most apps hand you 10 quick questions. Real hiring and
                certification exams are far longer. LearnForge matches the real
                exam's length automatically, mirrors how it's actually built, and
                generates a brand-new set every single time.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Target,
                  title: "Auto-matched length",
                  text: "Full-length tests that mirror the real exam.",
                },
                {
                  icon: RefreshCw,
                  title: "Fresh every attempt",
                  text: "New questions each time you retake.",
                },
                {
                  icon: CheckCircle2,
                  title: "Explained answers",
                  text: "Understand why each answer is right.",
                },
                {
                  icon: BookOpen,
                  title: "Any goal",
                  text: "Jobs, certs, subjects, or your own files.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/15 bg-white/5 p-4"
                >
                  <item.icon className="h-6 w-6 text-accent" />
                  <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Everything you need to prepare with confidence.
            </h2>
            <p className="mt-3 text-muted-foreground">
              One workspace for testing yourself, finding your level, and building
              the plan to get better.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-card-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-card-border bg-card p-10 text-center shadow-lg sm:p-14">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your next exam starts here.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Create a free account and generate your first realistic practice
              exam in under a minute. Your progress stays private to you.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href="/sign-up">
                  Create your free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
