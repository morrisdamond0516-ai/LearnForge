import { useListLearnSessions, useResearchTopic, getListLearnSessionsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { BookType, Sparkles, Loader2, ArrowRight, MessagesSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useSearch } from "wouter";

export default function Learn() {
  const { data: sessions, isLoading } = useListLearnSessions();
  const researchTopic = useResearchTopic();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const search = useSearch();

  const [topic, setTopic] = useState(() => {
    const params = new URLSearchParams(search);
    return params.get("topic") ?? "";
  });

  useEffect(() => {
    const params = new URLSearchParams(search);
    const t = params.get("topic");
    if (t) setTopic(t);
  }, [search]);

  const handleResearch = () => {
    if (!topic.trim()) return;
    researchTopic.mutate({ data: { topic } }, {
      onSuccess: () => {
        toast({ title: "Study guide generated!" });
        setTopic("");
        queryClient.invalidateQueries({ queryKey: getListLearnSessionsQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to research topic", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">AI Study Guides</h1>
        <p className="text-muted-foreground mt-1 mb-8">Enter any topic and our AI will research it and build a structured study guide for you.</p>
        
        <Card className="border-2 border-primary/20 shadow-md">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Input 
                value={topic} 
                onChange={e => setTopic(e.target.value)} 
                placeholder="What do you want to learn about? e.g. Quantum Computing, React Hooks..." 
                className="text-lg py-6"
                onKeyDown={e => e.key === 'Enter' && handleResearch()}
              />
              <Button onClick={handleResearch} disabled={researchTopic.isPending || !topic.trim()} className="h-auto px-8">
                {researchTopic.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                Research
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Link href="/learn/interview">
        <Card className="hover-elevate cursor-pointer border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent transition-all duration-300 hover:border-primary/40">
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MessagesSquare className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold tracking-tight">Roleplay Job Interview</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Practice a realistic mock interview with an AI hiring manager for any career, then get scored feedback and ways to improve.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-primary shrink-0">
              Start practicing <ArrowRight className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </Link>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Saved Guides</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions?.map((session) => (
              <Link key={session.id} href={`/learn/${session.id}`}>
                <Card className="hover-elevate cursor-pointer h-full transition-all duration-300 border-t-4 border-t-secondary hover:border-t-primary">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium uppercase tracking-wider">{session.subjectName || 'General'}</span>
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{session.title}</CardTitle>
                    <CardDescription className="line-clamp-3 mt-2">{session.summary}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
            {sessions?.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                <BookType className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No study guides yet.</p>
                <p className="text-sm mt-1">Research your first topic above to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
