import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import mascot from "@/assets/mascot.png";
import {
  GraduationCap,
  BookOpen,
  Library,
  BookMarked,
  Compass,
  FileText,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

const SEEN_KEY = "learnforge:welcome-seen";
export const START_TOUR_EVENT = "learnforge:start-tour";

// Session-level fallback so a blocked/unavailable localStorage can't make the
// tour auto-open on every mount within the same session.
let sessionSeen = false;

function hasSeenWelcome(): boolean {
  if (sessionSeen) return true;
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return sessionSeen;
  }
}

function persistSeenWelcome() {
  sessionSeen = true;
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* ignore storage errors */
  }
}

type Step = { icon: LucideIcon; title: string; body: string };

const STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "Welcome to LearnForge",
    body: "LearnForge turns any subject, document, or career goal into custom practice tests, study guides, and learning plans. The idea is simple: pick what you want to learn, let the AI build it, then practice and improve.",
  },
  {
    icon: BookOpen,
    title: "Subjects",
    body: "A Subject is just a topic you want to study, like Algebra or Biology. Create your own subjects to keep your tests and study guides organized in one place.",
  },
  {
    icon: GraduationCap,
    title: "Education / Career Test",
    body: "Generate an AI quiz from a subject, a free-form topic, a document you uploaded, or even a real job or certification exam. Choose Placement to find your level, Practice to learn, or Full Exam for a realistic test. You get fresh questions every time, with an explanation for every answer.",
  },
  {
    icon: Library,
    title: "Study Guides",
    body: "Type any topic and the AI researches it and writes a clear study guide with a summary, key points, and next steps. This section also has the Roleplay Job Interview, where you practice a real interview with an AI hiring manager and get scored feedback.",
  },
  {
    icon: BookMarked,
    title: "Curriculum",
    body: "Pick a subject and your level, and the AI builds a step-by-step learning plan with the best real books, videos, and courses to work through in order.",
  },
  {
    icon: Compass,
    title: "College / Trade",
    body: "Tell us your career goal and the AI recommends real schools, programs, and the next steps to get there. You can even add your transcript from the Documents page for tailored advice.",
  },
  {
    icon: FileText,
    title: "Documents",
    body: "Upload your own PDFs, class notes, or textbooks. Once uploaded, you can turn them into quizzes and study guides built from your actual material. The Documents link is at the top right of every page.",
  },
];

export function WelcomeTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!hasSeenWelcome()) {
      setStep(0);
      setOpen(true);
    }
    const handler = () => {
      setStep(0);
      setOpen(true);
    };
    window.addEventListener(START_TOUR_EVENT, handler);
    return () => window.removeEventListener(START_TOUR_EVENT, handler);
  }, []);

  const finish = () => {
    persistSeenWelcome();
    setOpen(false);
  };

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) finish();
        setOpen(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {step === 0 ? (
            <img
              src={mascot}
              alt="LearnForge mascot, a friendly owl in a graduation cap reading a glowing book"
              className="mb-2 h-20 w-20 drop-shadow-sm"
            />
          ) : (
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <DialogTitle className="text-xl">{current.title}</DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-foreground/80">
            {current.body}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-1.5 py-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
            />
          ))}
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-2 sm:justify-between">
          <Button variant="ghost" size="sm" onClick={finish}>
            Skip
          </Button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={finish}>
                Get started
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                Next <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function startTour() {
  window.dispatchEvent(new Event(START_TOUR_EVENT));
}
