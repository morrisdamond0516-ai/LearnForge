import {
  useListCurricula,
  useGenerateCurriculum,
  useListSubjects,
  getListCurriculaQueryKey,
  ApiError,
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Sparkles, Loader2, Library } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { curriculumPresetGroups } from "@/lib/curriculum-subject-presets";
import { cn } from "@/lib/utils";

const CUSTOM = "__custom__";
const PRESET_PREFIX = "preset:";
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function Curriculum() {
  const { data: curricula, isLoading } = useListCurricula();
  const { data: subjects, isError: subjectsError } = useListSubjects();
  const generate = useGenerateCurriculum();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [subjectChoice, setSubjectChoice] = useState(CUSTOM);
  const [customSubject, setCustomSubject] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [subjectOpen, setSubjectOpen] = useState(false);

  const savedSubjects = subjects ?? [];
  const savedNames = useMemo(
    () => new Set(savedSubjects.map((s) => s.name.toLowerCase())),
    [savedSubjects],
  );
  const presetGroups = useMemo(
    () => curriculumPresetGroups(savedNames),
    [savedNames],
  );

  function renderPresetItem(name: string) {
    const value = `${PRESET_PREFIX}${name}`;
    return (
      <CommandItem
        key={name}
        value={name}
        onSelect={() => {
          setSubjectChoice(value);
          setSubjectOpen(false);
        }}
      >
        <Check
          className={cn(
            "mr-2 h-4 w-4 shrink-0",
            subjectChoice === value ? "opacity-100" : "opacity-0",
          )}
        />
        {name}
      </CommandItem>
    );
  }

  const selectedSubject =
    subjectChoice !== CUSTOM && !subjectChoice.startsWith(PRESET_PREFIX)
      ? savedSubjects.find((s) => String(s.id) === subjectChoice)
      : undefined;
  const subjectName = selectedSubject
    ? selectedSubject.name
    : subjectChoice.startsWith(PRESET_PREFIX)
      ? subjectChoice.slice(PRESET_PREFIX.length)
      : customSubject;

  const subjectLabel =
    subjectChoice === CUSTOM
      ? "Other / type my own"
      : subjectName || "Choose a subject…";

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
        onError: (error) => {
          let description = "Something went wrong. Please try again.";
          if (error instanceof ApiError) {
            if (error.status === 401) {
              description =
                "Your session expired. Sign out, sign back in, then try again.";
            } else if (error.status === 500) {
              description =
                "The AI service may be unavailable — check that AI_INTEGRATIONS_OPENAI_API_KEY is set in .env.";
            } else if (typeof error.data === "object" && error.data && "error" in error.data) {
              description = String((error.data as { error: unknown }).error);
            }
          }
          toast({
            title: "Failed to generate curriculum",
            description,
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
              <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={subjectOpen}
                    className="w-full justify-between font-normal h-auto min-h-9 py-2"
                  >
                    <span
                      className={cn(
                        "truncate text-left",
                        !subjectName.trim() &&
                          subjectChoice === CUSTOM &&
                          "text-muted-foreground",
                      )}
                    >
                      {subjectLabel}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search careers (Data Analyst, IT)…" />
                    <CommandList className="max-h-[min(360px,50vh)]">
                      <CommandEmpty>
                        No match. Pick “Other / type my own” below.
                      </CommandEmpty>
                      {savedSubjects.length > 0 ? (
                        <CommandGroup heading="Your subjects">
                          {savedSubjects.map((s) => (
                            <CommandItem
                              key={s.id}
                              value={s.name}
                              onSelect={() => {
                                setSubjectChoice(String(s.id));
                                setSubjectOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  subjectChoice === String(s.id)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {s.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ) : null}
                      {presetGroups.featured.length > 0 ? (
                        <CommandGroup heading="Featured — Tech & data careers">
                          {presetGroups.featured.map(renderPresetItem)}
                        </CommandGroup>
                      ) : null}
                      {presetGroups.otherCareers.length > 0 ? (
                        <CommandGroup heading="All careers">
                          {presetGroups.otherCareers.map(renderPresetItem)}
                        </CommandGroup>
                      ) : null}
                      {presetGroups.school.length > 0 ? (
                        <CommandGroup heading="School grades">
                          {presetGroups.school.map(renderPresetItem)}
                        </CommandGroup>
                      ) : null}
                      {presetGroups.stem.length > 0 ? (
                        <CommandGroup heading="Science & math sims">
                          {presetGroups.stem.map(renderPresetItem)}
                        </CommandGroup>
                      ) : null}
                      {presetGroups.general.length > 0 ? (
                        <CommandGroup heading="General subjects">
                          {presetGroups.general.map(renderPresetItem)}
                        </CommandGroup>
                      ) : null}
                      <CommandGroup>
                        <CommandItem
                          value="Other type my own custom subject"
                          onSelect={() => {
                            setSubjectChoice(CUSTOM);
                            setSubjectOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              subjectChoice === CUSTOM
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          Other / type my own
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Careers are listed first — search “Data Analyst” or “Information Technology”, or pick Other for any topic.
              </p>
              {subjectsError ? (
                <p className="text-xs text-muted-foreground">
                  Could not load your saved subjects — showing built-in careers
                  and school topics. Sign in again if this persists.
                </p>
              ) : null}
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
