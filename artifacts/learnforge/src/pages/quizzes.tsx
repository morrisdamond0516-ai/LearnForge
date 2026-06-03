import { useListQuizzes, useGenerateQuiz, getListQuizzesQueryKey, useListSubjects, useListDocuments, QuizGenerateInputMode, QuizGenerateInputDifficulty } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { GraduationCap, Plus, Loader2, Sparkles, Clock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation, useSearch } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CAREER_OPTIONS = [
  "Social Services Caseworker",
  "Certified Nursing Assistant (CNA)",
  "Medical Assistant",
  "Pharmacy Technician",
  "Police Officer",
  "Firefighter / EMT",
  "Postal Worker",
  "Administrative / Office Assistant",
  "Bookkeeper / Accounting Clerk",
  "Bank Teller",
  "Electrician (Apprentice / Journeyman)",
  "HVAC Technician",
  "Commercial Driver (CDL)",
  "IT Support / CompTIA A+",
  "Project Management (PMP / CAPM)",
  "Real Estate Agent",
  "Cosmetology License",
  "Teacher Certification (Praxis)",
] as const;

const CAREER_FOCUS_OPTIONS = [
  { value: "full", label: "Full qualifying test (all sections)" },
  { value: "Math", label: "Math / Quantitative" },
  { value: "Reading Comprehension", label: "Reading Comprehension" },
  { value: "Vocabulary / Verbal", label: "Vocabulary / Verbal" },
  { value: "Writing / Grammar", label: "Writing / Grammar" },
  { value: "Situational Judgment", label: "Situational Judgment" },
  { value: "Job Knowledge / Technical", label: "Job Knowledge / Technical" },
] as const;

export default function Quizzes() {
  const { data: quizzes, isLoading } = useListQuizzes();
  const { data: subjects } = useListSubjects();
  const { data: documents } = useListDocuments();
  const generateQuiz = useGenerateQuiz();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<QuizGenerateInputMode>("practice");
  const [sourceType, setSourceType] = useState<"subject"|"document"|"topic"|"career">("topic");
  const [subjectId, setSubjectId] = useState<string>("");
  const [career, setCareer] = useState<string>("");
  const [customCareer, setCustomCareer] = useState<string>("");
  const [careerFocus, setCareerFocus] = useState<string>("full");

  const search = useSearch();
  useEffect(() => {
    const params = new URLSearchParams(search);
    const subjectParam = params.get("subject");
    if (subjectParam) {
      setSourceType("subject");
      setSubjectId(subjectParam);
      setIsOpen(true);
    }
  }, [search]);
  const [documentId, setDocumentId] = useState<string>("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<QuizGenerateInputDifficulty>("medium");
  const [questionCount, setQuestionCount] = useState("5");

  const handleGenerate = () => {
    const input: any = {
      mode,
      difficulty,
    };
    if (questionCount === "auto") {
      input.autoLength = true;
    } else {
      input.questionCount = parseInt(questionCount) || 5;
    }
    if (sourceType === "subject" && subjectId) input.subjectId = parseInt(subjectId);
    if (sourceType === "document" && documentId) input.documentId = parseInt(documentId);
    if (sourceType === "topic" && topic.trim()) input.topic = topic.trim();
    if (sourceType === "career") {
      const chosen = career === "__custom" ? customCareer.trim() : career;
      if (chosen) input.career = chosen;
      if (careerFocus && careerFocus !== "full") input.topic = careerFocus;
    }

    generateQuiz.mutate({ data: input }, {
      onSuccess: (res) => {
        toast({ title: "Quiz generated successfully!" });
        setIsOpen(false);
        queryClient.invalidateQueries({ queryKey: getListQuizzesQueryKey() });
        setLocation(`/quizzes/${res.id}`);
      },
      onError: (err: any) => {
        toast({ title: "Failed to generate quiz", description: err?.message || "An error occurred", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes & Exams</h1>
          <p className="text-muted-foreground mt-1">Test your knowledge with AI-generated assessments.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Sparkles className="mr-2 h-4 w-4" /> Generate Quiz</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {sourceType === "subject" && subjectId && subjects?.find(s => s.id.toString() === subjectId)
                  ? `Generate a ${subjects.find(s => s.id.toString() === subjectId)!.name} Quiz`
                  : "Generate New Assessment"}
              </DialogTitle>
              <DialogDescription>
                {sourceType === "subject" && subjectId && subjects?.find(s => s.id.toString() === subjectId)
                  ? `Choose your settings below, then click Generate with AI to create a ${subjects.find(s => s.id.toString() === subjectId)!.name} quiz.`
                  : "AI will craft custom questions based on your selections."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mode</label>
                  <Select value={mode} onValueChange={(v) => setMode(v as QuizGenerateInputMode)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="placement">Placement Test</SelectItem>
                      <SelectItem value="exam">Full Exam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Questions</label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sourceType === "career" && (
                        <SelectItem value="auto">Auto (match real exam)</SelectItem>
                      )}
                      <SelectItem value="3">3 (Quick)</SelectItem>
                      <SelectItem value="5">5 (Standard)</SelectItem>
                      <SelectItem value="10">10 (Deep)</SelectItem>
                      <SelectItem value="15">15 (Exam)</SelectItem>
                      <SelectItem value="20">20 (Full exam)</SelectItem>
                      <SelectItem value="25">25 (Comprehensive)</SelectItem>
                      <SelectItem value="40">40 (Long exam)</SelectItem>
                      <SelectItem value="60">60 (Maximum)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Source Type</label>
                <Select value={sourceType} onValueChange={(v: any) => {
                  setSourceType(v);
                  if (v === "career") setQuestionCount("auto");
                  else if (questionCount === "auto") setQuestionCount("5");
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="topic">Free-form Topic</SelectItem>
                    <SelectItem value="career">Career / Job or Certification Test</SelectItem>
                    <SelectItem value="subject">From Subject</SelectItem>
                    <SelectItem value="document">From Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {sourceType === "topic" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic</label>
                  <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. React Hooks, French Revolution..." />
                </div>
              )}

              {sourceType === "career" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Career / Certification</label>
                    <Select value={career} onValueChange={setCareer}>
                      <SelectTrigger><SelectValue placeholder="Select a career or certification..." /></SelectTrigger>
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
                      <label className="text-sm font-medium">Job or certification name</label>
                      <Input
                        value={customCareer}
                        onChange={(e) => setCustomCareer(e.target.value)}
                        placeholder="e.g. Dental Hygienist, AWS Certified..."
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test section</label>
                    <Select value={careerFocus} onValueChange={setCareerFocus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CAREER_FOCUS_OPTIONS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      The AI researches the real exam for this role and writes practice questions for the section you pick. Leave Questions on "Auto" to match the real exam's length (up to 60).
                    </p>
                  </div>
                </>
              )}

              {sourceType === "subject" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select value={subjectId} onValueChange={setSubjectId}>
                    <SelectTrigger><SelectValue placeholder="Select a subject..." /></SelectTrigger>
                    <SelectContent>
                      {subjects?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {sourceType === "document" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Document</label>
                  <Select value={documentId} onValueChange={setDocumentId}>
                    <SelectTrigger><SelectValue placeholder="Select a document..." /></SelectTrigger>
                    <SelectContent>
                      {documents?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as QuizGenerateInputDifficulty)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Mixed</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="sm:flex-col sm:space-x-0">
              <Button
                size="lg"
                className="w-full"
                onClick={handleGenerate}
                disabled={
                  generateQuiz.isPending ||
                  (sourceType === "topic" && !topic.trim()) ||
                  (sourceType === "subject" && !subjectId) ||
                  (sourceType === "document" && !documentId) ||
                  (sourceType === "career" &&
                    (!career || (career === "__custom" && !customCareer.trim())))
                }
              >
                {generateQuiz.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {generateQuiz.isPending ? "Generating..." : "Generate with AI"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes?.map((quiz) => (
            <Card key={quiz.id} className="hover-elevate overflow-hidden border-l-4 border-l-primary transition-all">
              <div className="flex flex-col sm:flex-row items-center p-6 gap-6">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{quiz.title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium uppercase tracking-wider">{quiz.mode}</span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium uppercase tracking-wider">{quiz.difficulty}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {quiz.questionCount} questions • {quiz.career ? `${quiz.career}${quiz.topic ? ` (${quiz.topic})` : ""}` : quiz.topic || quiz.subjectName || "Custom Assessment"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                  <Clock className="h-4 w-4" />
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </div>
                <div className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                  <Link href={`/quizzes/${quiz.id}`}>
                    <Button variant="secondary" className="w-full sm:w-auto group">
                      Take Quiz <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
          {quizzes?.length === 0 && (
            <div className="text-center py-16 px-4 bg-muted/30 rounded-xl border border-dashed border-border">
              <Sparkles className="h-12 w-12 mx-auto text-primary mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No quizzes generated yet</h3>
              <p className="text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">Generate your first AI-powered quiz to test your knowledge.</p>
              <Button onClick={() => setIsOpen(true)}>Generate your first Quiz</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
