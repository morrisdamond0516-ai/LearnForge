import {
  useListCurricula,
  useGenerateCurriculum,
  useListSubjects,
  getListCurriculaQueryKey,
} from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { GraduationCap, Sparkles, Loader2, Library } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";

const CUSTOM = "__custom__";
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function Curriculum() {
  const { data: curricula, isLoading } = useListCurricula();
  const { data: subjects } = useListSubjects();
  const generate = useGenerateCurriculum();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [subjectChoice, setSubjectChoice] = useState(CUSTOM);
  const [customSubject, setCustomSubject] = useState("");
  const [level, setLevel] = useState("Beginner");

  const selectedSubject =
    subjectChoice !== CUSTOM
      ? subjects?.find((s) => String(s.id) === subjectChoice)
      : undefined;
  const subjectName = selectedSubject ? selectedSubject.name : customSubject;

  const handleSubmit = () => {
    const subject = subjectName.trim();
    if (!subject) return;

    generate.mutate(
      {
        data: {
          subject,
          ...(selectedSubject ? { subjectId: selectedSubject.id } : {}),
          level,
        },
      },
      {
        onSuccess: (plan) => {
          toast({ title: "Curriculum ready" });
          queryClient.invalidateQueries({
            queryKey: getListCurriculaQueryKey(),
          });
          setLocation(`/curriculum/${plan.id}`);
        },
        onError: () => {
          toast({
            title: "Failed to generate curriculum",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Curriculum</h1>
        <p className="text-muted-foreground mt-1 mb-8">
          Pick a subject and your current level. Our AI builds a step-by-step
          learning plan with the best books, videos, worksheets, tools, and
          courses to take you to the next level.
        </p>

        <Card className="border-2 border-primary/20 shadow-md">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subjectChoice} onValueChange={setSubjectChoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                  <SelectItem value={CUSTOM}>Other / type my own</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {subjectChoice === CUSTOM && (
              <div className="space-y-2">
                <Label htmlFor="custom-subject">What do you want to learn?</Label>
                <Input
                  id="custom-subject"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="e.g. Algebra, Spanish, Python programming"
                  className="text-base py-6"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Your current level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Not sure? Take a placement quiz first and we will assess your
                level for you.
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={generate.isPending || !subjectName.trim()}
              className="w-full h-auto py-4"
            >
              {generate.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              {generate.isPending
                ? "Building your curriculum..."
                : "Build my curriculum"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Saved Curricula
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curricula?.map((c) => (
              <Link key={c.id} href={`/curriculum/${c.id}`}>
                <Card className="hover-elevate cursor-pointer h-full transition-all duration-300 border-t-4 border-t-secondary hover:border-t-primary">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium uppercase tracking-wider">
                        {c.subject}
                      </span>
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider shrink-0">
                        {c.level}
                      </span>
                    </div>
                    <CardTitle className="text-xl line-clamp-2">
                      {c.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 mt-2">
                      {c.summary}
                    </CardDescription>
                    <p className="text-xs text-muted-foreground mt-3">
                      {c.moduleCount ?? 0} module
                      {(c.moduleCount ?? 0) !== 1 ? "s" : ""}
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            ))}
            {curricula?.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                <Library className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No curricula yet.</p>
                <p className="text-sm mt-1">
                  Choose a subject above to build your first learning plan.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
