import { useState, useRef, useEffect } from "react";
import {
  useRoleplayMessage,
  useEvaluateRoleplay,
  type RoleplayMessage,
  type RoleplayFeedback,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessagesSquare,
  Loader2,
  Send,
  UserRound,
  Headset,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CAREER_OPTIONS } from "@/lib/careers";
import { errorMessage } from "@/lib/api-error";
import { Link } from "wouter";

type Stage = "setup" | "interview" | "feedback";

export default function Interview() {
  const { toast } = useToast();
  const roleplayMessage = useRoleplayMessage();
  const evaluateRoleplay = useEvaluateRoleplay();

  const [stage, setStage] = useState<Stage>("setup");
  const [career, setCareer] = useState<string>("");
  const [customCareer, setCustomCareer] = useState<string>("");
  const [focus, setFocus] = useState<string>("");
  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<RoleplayFeedback | null>(null);

  const chosenCareer = career === "__custom" ? customCareer.trim() : career;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, roleplayMessage.isPending]);

  const requestHostTurn = (history: RoleplayMessage[]) => {
    roleplayMessage.mutate(
      { data: { career: chosenCareer, focus: focus || null, messages: history } },
      {
        onSuccess: (res) => {
          setMessages([...history, { role: "host", content: res.message }]);
        },
        onError: (err) => {
          toast({
            title: errorMessage(err, "The interviewer didn't respond. Please try again."),
            variant: "destructive",
          });
        },
      },
    );
  };

  const startInterview = () => {
    if (!chosenCareer) return;
    setMessages([]);
    setFeedback(null);
    setStage("interview");
    requestHostTurn([]);
  };

  const sendAnswer = () => {
    const text = answer.trim();
    if (!text || roleplayMessage.isPending) return;
    const history: RoleplayMessage[] = [...messages, { role: "candidate", content: text }];
    setMessages(history);
    setAnswer("");
    requestHostTurn(history);
  };

  const endInterview = () => {
    const answeredCount = messages.filter((m) => m.role === "candidate").length;
    if (answeredCount === 0) {
      toast({ title: "Answer at least one question before ending.", variant: "destructive" });
      return;
    }
    evaluateRoleplay.mutate(
      { data: { career: chosenCareer, focus: focus || null, messages } },
      {
        onSuccess: (res) => {
          setFeedback(res);
          setStage("feedback");
        },
        onError: (err) => {
          toast({
            title: errorMessage(err, "Couldn't generate feedback. Please try again."),
            variant: "destructive",
          });
        },
      },
    );
  };

  const reset = () => {
    setStage("setup");
    setMessages([]);
    setAnswer("");
    setFeedback(null);
  };

  // ---- Setup ----
  if (stage === "setup") {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/learn" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Study Guides
          </Link>
        </div>

        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <MessagesSquare className="h-3.5 w-3.5" /> Mock Interview
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-4">Roleplay Job Interview</h1>
          <p className="text-muted-foreground mt-1">
            Practice a realistic interview with an AI hiring manager for any career. Answer questions out loud or in
            writing, then get scored feedback with specific ways to improve.
          </p>
        </div>

        <Card className="max-w-2xl border-2 border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle>Set up your interview</CardTitle>
            <CardDescription>Pick the role you want to practice for.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Career / Role</label>
              <Select value={career} onValueChange={setCareer}>
                <SelectTrigger><SelectValue placeholder="Select a career to interview for..." /></SelectTrigger>
                <SelectContent>
                  {CAREER_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                  <SelectItem value="__custom">Other (type your own)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {career === "__custom" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Job or role name</label>
                <Input
                  value={customCareer}
                  onChange={(e) => setCustomCareer(e.target.value)}
                  placeholder="e.g. Dental Hygienist, Warehouse Supervisor..."
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Focus area <span className="text-muted-foreground font-normal">(optional)</span></label>
              <Input
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="e.g. behavioral questions, customer service scenarios, safety knowledge..."
              />
            </div>

            <Button
              className="w-full h-auto py-3"
              onClick={startInterview}
              disabled={!chosenCareer || roleplayMessage.isPending}
            >
              {roleplayMessage.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Start the interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Feedback ----
  if (stage === "feedback" && feedback) {
    const score = feedback.overallScore;
    const scoreColor =
      score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600";
    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" /> Interview complete
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-4">Your interview feedback</h1>
          <p className="text-muted-foreground mt-1">Practice for: {chosenCareer}{focus ? ` — ${focus}` : ""}</p>
        </div>

        <Card className="border-2 border-primary/20 shadow-md">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex flex-col items-center justify-center shrink-0">
              <span className={`text-5xl font-bold ${scoreColor}`}>{score}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground mt-1">out of 100</span>
            </div>
            <p className="text-base leading-relaxed">{feedback.summary}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-t-4 border-t-emerald-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm"><span className="text-emerald-500 mt-0.5">•</span><span>{s}</span></li>
                ))}
                {feedback.strengths.length === 0 && <p className="text-sm text-muted-foreground">No strengths noted.</p>}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-amber-500" /> Areas to improve</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm"><span className="text-amber-500 mt-0.5">•</span><span>{s}</span></li>
                ))}
                {feedback.improvements.length === 0 && <p className="text-sm text-muted-foreground">No improvements noted.</p>}
              </ul>
            </CardContent>
          </Card>
        </div>

        {feedback.questionReviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><MessagesSquare className="h-5 w-5 text-primary" /> Question-by-question review</CardTitle>
              <CardDescription>Every question you were asked, your answer, and a strong example of what you could have said instead.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {feedback.questionReviews.map((r, i) => (
                <div key={i} className="space-y-3 border-t pt-5 first:border-t-0 first:pt-0">
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                    <p className="text-sm font-semibold leading-relaxed">{r.question}</p>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Your answer</p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{r.yourAnswer || "(no answer given)"}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Stronger example answer</p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{r.suggestedAnswer}</p>
                  </div>
                  {r.comment && (
                    <p className="flex gap-2 text-sm text-muted-foreground"><TrendingUp className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span>{r.comment}</span></p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {feedback.recommendedTopics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><BookOpen className="h-5 w-5 text-primary" /> Study these next</CardTitle>
              <CardDescription>Build a study guide for any topic to prepare further.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {feedback.recommendedTopics.map((t, i) => (
                <Link
                  key={i}
                  href={`/learn?topic=${encodeURIComponent(t)}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  {t}
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={reset}><RotateCcw className="mr-2 h-4 w-4" /> Practice another interview</Button>
          <Link href="/learn">
            <Button variant="outline">Back to Study Guides</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ---- Interview (chat) ----
  return (
    <div className="space-y-4 animate-in fade-in duration-500 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{chosenCareer} interview</h1>
          {focus && <p className="text-sm text-muted-foreground">Focus: {focus}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={endInterview} disabled={evaluateRoleplay.isPending}>
          {evaluateRoleplay.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          End & get feedback
        </Button>
      </div>

      <Card className="border-2 border-primary/10 shadow-md">
        <div ref={scrollRef} className="h-[55vh] overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "candidate" ? "flex-row-reverse" : ""}`}>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${m.role === "host" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                {m.role === "host" ? <Headset className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "host" ? "bg-muted rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm"}`}>
                {m.content}
              </div>
            </div>
          ))}

          {roleplayMessage.isPending && (
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Headset className="h-4 w-4" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          )}

          {messages.length === 0 && !roleplayMessage.isPending && (
            <p className="text-center text-sm text-muted-foreground py-8">The interviewer is getting ready...</p>
          )}
        </div>

        <CardContent className="border-t p-4">
          <div className="flex gap-3 items-end">
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="min-h-[44px] max-h-40 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendAnswer();
                }
              }}
              disabled={roleplayMessage.isPending}
            />
            <Button onClick={sendAnswer} disabled={!answer.trim() || roleplayMessage.isPending} className="h-11 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for a new line.</p>
        </CardContent>
      </Card>
    </div>
  );
}
