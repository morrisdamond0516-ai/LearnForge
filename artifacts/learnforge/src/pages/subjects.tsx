import { useListSubjects, useCreateSubject, getListSubjectsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { BookOpen, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Subjects() {
  const { data: subjects, isLoading } = useListSubjects();
  const createSubject = useCreateSubject();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Custom");

  const handleCreate = () => {
    if (!name.trim()) return;
    createSubject.mutate({ data: { name, description, category } }, {
      onSuccess: () => {
        toast({ title: "Subject created successfully" });
        setIsOpen(false);
        setName("");
        setDescription("");
        queryClient.invalidateQueries({ queryKey: getListSubjectsQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to create subject", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground mt-1">Browse topics or create your own custom subject.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Custom Subject</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Subject</DialogTitle>
              <DialogDescription>
                Add a new topic you'd like to study.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Advanced Rust" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of what you're learning..." />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={createSubject.isPending || !name.trim()}>
                {createSubject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Subject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects?.map((subject) => (
            <Link key={subject.id} href={`/quizzes?subject=${subject.id}`} className="block">
              <Card className="hover-elevate transition-all duration-300 cursor-pointer h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    {subject.isCustom && (
                      <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">Custom</span>
                    )}
                  </div>
                  <CardTitle className="mt-4">{subject.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{subject.description || "No description provided."}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
          {subjects?.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No subjects found. Create your first one!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
