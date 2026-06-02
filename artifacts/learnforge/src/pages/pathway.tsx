import {
  useGetCareerPlan,
  getGetCareerPlanQueryKey,
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
  GraduationCap,
  MapPin,
  Clock,
  Wallet,
  Monitor,
  CheckCircle2,
  Target,
  ListChecks,
} from "lucide-react";

export default function Pathway() {
  const { id } = useParams();
  const planId = parseInt(id || "0");
  const {
    data: plan,
    isLoading,
    error,
  } = useGetCareerPlan(planId, {
    query: { enabled: !!planId, queryKey: getGetCareerPlanQueryKey(planId) },
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
        Failed to load career plan.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="space-y-6">
        <Link href="/pathways">
          <Button variant="ghost" className="-ml-4 text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pathways
          </Button>
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide uppercase">
              {plan.careerGoal}
            </span>
            {plan.documentName && (
              <span className="text-muted-foreground text-sm">
                Based on: {plan.documentName}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            {plan.title}
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-primary pl-6 py-2">
          {plan.summary}
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-primary" /> Recommended Schools
          &amp; Programs
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {plan.recommendations.map((rec, idx) => (
            <Card
              key={idx}
              className="h-full border-t-4 border-t-secondary shadow-sm"
            >
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium uppercase tracking-wider">
                    {rec.degreeLevel}
                  </span>
                </div>
                <CardTitle className="text-xl">{rec.schoolName}</CardTitle>
                <p className="text-base font-medium text-primary">
                  {rec.programName}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  {rec.modality && (
                    <span className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 shrink-0" /> {rec.modality}
                    </span>
                  )}
                  {rec.location && (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" /> {rec.location}
                    </span>
                  )}
                  {rec.duration && (
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" /> {rec.duration}
                    </span>
                  )}
                  {rec.estimatedCost && (
                    <span className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 shrink-0" /> {rec.estimatedCost}
                    </span>
                  )}
                </div>
                {rec.whyFit && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {rec.whyFit}
                  </p>
                )}
                {rec.highlights && rec.highlights.length > 0 && (
                  <ul className="space-y-2">
                    {rec.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plan.skillGaps && plan.skillGaps.length > 0 && (
          <Card className="border-t-4 border-t-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-accent" /> Skills to Build
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.skillGaps.map((skill, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {plan.nextSteps && plan.nextSteps.length > 0 && (
          <Card className="bg-muted/50 border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListChecks className="h-5 w-5" /> Next Steps
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
    </div>
  );
}
