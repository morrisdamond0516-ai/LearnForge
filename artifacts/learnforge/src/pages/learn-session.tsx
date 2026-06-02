import { useGetLearnSession, getGetLearnSessionQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function LearnSession() {
  const { id } = useParams();
  const sessionId = parseInt(id || "0");
  const { data: session, isLoading, error } = useGetLearnSession(sessionId, { query: { enabled: !!sessionId, queryKey: getGetLearnSessionQueryKey(sessionId) } });

  if (isLoading) return <div className="p-8 space-y-6 max-w-4xl mx-auto"><Skeleton className="h-12 w-2/3" /><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  if (error || !session) return <div className="p-8 text-center text-destructive">Failed to load study guide.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-12">
      <div className="space-y-6">
        <Link href="/learn">
          <Button variant="ghost" className="-ml-4 text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Guides</Button>
        </Link>
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide uppercase">{session.topic}</span>
            {session.subjectName && <span className="text-muted-foreground text-sm">{session.subjectName}</span>}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">{session.title}</h1>
        </div>
        <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-primary pl-6 py-2">{session.summary}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-12">
          {session.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-2xl font-bold font-serif text-foreground flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary text-secondary-foreground text-sm">{idx + 1}</span>
                {section.heading}
              </h2>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                {section.content.split('\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </section>
          ))}
        </div>

        <div className="space-y-8">
          <Card className="bg-card shadow-md border-t-4 border-t-accent sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-accent" /> Key Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {session.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          {session.nextSteps && session.nextSteps.length > 0 && (
            <Card className="bg-muted/50 border-none">
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-decimal pl-4 space-y-2 text-sm text-muted-foreground">
                  {session.nextSteps.map((step, idx) => <li key={idx}>{step}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
