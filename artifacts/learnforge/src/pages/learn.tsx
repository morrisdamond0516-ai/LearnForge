import { useListLearnSessions, useResearchTopic, getListLearnSessionsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { BookType, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Learn() {
  const { data: sessions, isLoading } = useListLearnSessions();
  const researchTopic = useResearchTopic();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [topic, setTopic] = useState("");

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
