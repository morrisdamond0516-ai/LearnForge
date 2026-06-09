import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import { startTour } from "@/components/welcome-tour";
import {
  GraduationCap,
  BookOpen,
  Library,
  BookMarked,
  Compass,
  FileText,
  MessagesSquare,
  Sparkles,
  PlayCircle,
  Target,
  Wand2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  href: string;
  what: string;
  how: string[];
};

const FEATURES: Feature[] = [
  {
    icon: BookOpen,
    title: "Subjects",
    href: "/subjects",
    what: "A Subject is a topic you want to study, like Algebra, Biology, or US History. Subjects keep your tests and study guides organized.",
    how: [
      "Open Subjects from the menu.",
      "Browse the ready-made subjects, or click to create your own.",
      "Once you have a subject, you can generate tests and learning plans for it.",
    ],
  },
  {
    icon: GraduationCap,
    title: "Education / Career Test",
    href: "/quizzes",
    what: "Create an AI practice test from a subject, a topic you type in, a document you uploaded, or a real job or certification exam.",
    how: [
      "Click Generate and pick a Source Type (subject, topic, document, or career).",
      "Choose a Mode: Placement to find your level, Practice to learn, or Full Exam for a realistic test.",
      "Take the test. You get fresh questions every time and an explanation for every answer, so you learn the material instead of memorizing answers.",
    ],
  },
  {
    icon: Library,
    title: "Study Guides",
    href: "/learn",
    what: "Type any topic and the AI researches it and writes a clear study guide with a summary, key points, and next steps.",
    how: [
      "Open Study Guides and type a topic to research.",
      "Read your generated guide, saved for you to revisit any time.",
    ],
  },
  {
    icon: MessagesSquare,
    title: "Roleplay Job Interview",
    href: "/learn/interview",
    what: "Practice a realistic job interview with an AI hiring manager for any career, then get scored feedback on how you did.",
    how: [
      "Find it inside Study Guides, or open it directly.",
      "Pick the career you want to practice for and start the interview.",
      "Answer the questions, then end the interview to get your score, strengths, and tips to improve.",
    ],
  },
  {
    icon: BookMarked,
    title: "Curriculum",
    href: "/curriculum",
    what: "A step-by-step learning plan for a subject at your level, built from the best real books, videos, and courses.",
    how: [
      "Pick a subject and your current level (take a Placement test first if you're unsure).",
      "The AI builds an ordered plan of materials to work through.",
    ],
  },
  {
    icon: Compass,
    title: "College / Trade",
    href: "/pathways",
    what: "Tell us your career goal and the AI recommends real schools, programs, and the next steps to get there.",
    how: [
      "Optionally upload your transcript on the Documents page first for tailored advice.",
      "Enter your career goal and preferences, then generate your plan.",
    ],
  },
  {
    icon: FileText,
    title: "Documents",
    href: "/documents",
    what: "Upload your own PDFs, class notes, or textbooks to turn them into quizzes and study guides built from your real material.",
    how: [
      "Open Documents (the link is at the top right of every page).",
      "Upload a PDF or text file.",
      "Choose 'From Document' when generating a test to use it as the source.",
    ],
  },
];

const STEPS = [
  {
    icon: Target,
    title: "1. Pick what to learn",
    body: "Choose a subject, type a topic, upload a document, or set a career goal.",
  },
  {
    icon: Wand2,
    title: "2. Let the AI build it",
    body: "Generate a practice test, a study guide, or a full learning plan in seconds.",
  },
  {
    icon: TrendingUp,
    title: "3. Learn and improve",
    body: "Practice with fresh questions, read explanations, and track your progress.",
  },
];

export default function Help() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" /> How it works
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Welcome to LearnForge</h1>
        <p className="mt-1 text-muted-foreground">
          A quick guide to everything you can do here. New? Take the short tour and we'll point out each feature.
        </p>
        <Button className="mt-4" onClick={startTour}>
          <PlayCircle className="mr-2 h-4 w-4" /> Take the tour
        </Button>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold tracking-tight">The basic idea</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <Card key={s.title}>
              <CardContent className="p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold tracking-tight">Every feature, explained</h2>
        <Card>
          <CardHeader>
            <CardTitle>Feature guide</CardTitle>
            <CardDescription>Tap any feature to learn what it does and how to use it.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {FEATURES.map((f) => (
                <AccordionItem key={f.title} value={f.title}>
                  <AccordionTrigger className="text-left">
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <f.icon className="h-4 w-4" />
                      </span>
                      <span className="font-semibold">{f.title}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pl-11">
                      <p className="text-sm text-foreground/80">{f.what}</p>
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          How to use it
                        </p>
                        <ol className="list-decimal space-y-1 pl-4 text-sm text-foreground/80">
                          {f.how.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      <Link
                        href={f.href}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                      >
                        Go to {f.title}
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
