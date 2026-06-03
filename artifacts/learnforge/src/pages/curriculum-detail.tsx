import {
  useGetCurriculum,
  getGetCurriculumQueryKey,
} from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BookOpen,
  Video,
  Wrench,
  FileText,
  GraduationCap,
  PenLine,
  ListChecks,
  MapPin,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

function iconForType(type: string): LucideIcon {
  const t = type.toLowerCase();
  if (t.includes("book")) return BookOpen;
  if (t.includes("video")) return Video;
  if (t.includes("course")) return GraduationCap;
  if (t.includes("worksheet") || t.includes("practice")) return PenLine;
  if (t.includes("tool")) return Wrench;
  return FileText;
}

export default function CurriculumDetail() {
  const { id } = useParams();
  const curriculumId = parseInt(id || "0");
  const {
    data: plan,
    isLoading,
    error,
  } = useGetCurriculum(curriculumId, {
    query: {
      enabled: !!curriculumId,
      queryKey: getGetCurriculumQueryKey(curriculumId),
    },
  });

  if (isLoading)
    return (
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  if (error || !plan)
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load curriculum.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="space-y-6">
        <Link href="/curriculum">
          <Button variant="ghost" className="-ml-4 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Curriculum
          </Button>
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium tracking-wide uppercase">
              {plan.subject}
            </span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide uppercase">
              {plan.level}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            {plan.title}
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-primary pl-6 py-2">
          {plan.summary}
        </p>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" /> Your Learning Path
        </h2>
        <div className="space-y-8">
          {plan.modules.map((mod, idx) => (
            <div key={idx} className="relative">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">
                    {mod.title}
                  </h3>
                  {mod.objective && (
                    <p className="text-sm text-muted-foreground">
                      {mod.objective}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 md:pl-12">
                {mod.materials.map((mat, i) => {
                  const Icon = iconForType(mat.type);
                  return (
                    <Card
                      key={i}
                      className="h-full border-l-4 border-l-secondary shadow-sm"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4 text-primary shrink-0" />
                          <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium uppercase tracking-wider">
                            {mat.type}
                          </span>
                        </div>
                        <CardTitle className="text-base leading-snug">
                          {mat.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-muted-foreground">
                        {mat.author && (
                          <span className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 shrink-0" />
                            {mat.author}
                          </span>
                        )}
                        {mat.description && (
                          <p className="leading-relaxed">{mat.description}</p>
                        )}
                        {mat.whereToFind && (
                          <span className="flex items-start gap-2 text-foreground/70">
                            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>{mat.whereToFind}</span>
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {plan.nextSteps && plan.nextSteps.length > 0 && (
        <Card className="bg-muted/50 border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="h-5 w-5" /> Where to Start
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-decimal pl-4 space-y-2 text-sm text-muted-foreground">
              {plan.nextSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
