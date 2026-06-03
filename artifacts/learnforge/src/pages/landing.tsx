import { Link } from "wouter";
import {
  GraduationCap,
  BookOpen,
  Library,
  Compass,
  BookMarked,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const features = [
  {
    icon: GraduationCap,
    title: "Custom quizzes & exams",
    description:
      "Generate placement, practice, or exam quizzes for any subject. Fresh questions every time, scored with explanations.",
  },
  {
    icon: BookOpen,
    title: "Any subject",
    description:
      "Browse ready-made subjects or create your own. Track your level as you progress.",
  },
  {
    icon: Library,
    title: "AI study guides",
    description:
      "Get a clear summary, key points, and next steps for any topic you want to learn.",
  },
  {
    icon: BookMarked,
    title: "Tailored curriculum",
    description:
      "Turn an assessment into an ordered learning plan built from real books, videos, and courses.",
  },
  {
    icon: Compass,
    title: "Career pathways",
    description:
      "Upload a transcript and goal to get real school and program recommendations plus skill gaps.",
  },
  {
    icon: FileText,
    title: "Your own materials",
    description:
      "Upload PDFs and notes and turn them straight into quizzes and study sessions.",
  },
];

export default function Landing() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="app-header sticky top-0 z-40 flex items-center justify-between px-4 py-3 shadow-lg sm:px-6 lg:px-8 lg:h-16 lg:py-0">
        <div className="flex shrink-0 items-center gap-2 font-bold text-xl text-white tracking-tight">
          <GraduationCap className="h-6 w-6 text-accent" />
          <span>LearnForge</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sign-in">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/15 hover:text-white"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-white text-primary hover:bg-white/90">
              Get started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Learn anything. Test yourself.
            <span className="block text-primary">Track your progress.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            LearnForge is your AI-powered study partner. Generate custom quizzes,
            find your level, build study guides and curricula, and keep all your
            progress in one place — private to you.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Create your account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">
                I already have an account
              </Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-card-border bg-card p-6 shadow-sm"
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
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <a href={`${basePath}/sign-up`} className="font-medium text-primary">
          Get started
        </a>{" "}
        and your progress is saved to your own account.
      </footer>
    </div>
  );
}
