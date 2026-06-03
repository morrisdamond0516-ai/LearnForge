import {
  useListCareerPlans,
  useRecommendSchools,
  useListDocuments,
  getListCareerPlansQueryKey,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Compass, Sparkles, Loader2, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

const ANY = "__any__";

export default function Pathways() {
  const { data: plans, isLoading } = useListCareerPlans();
  const { data: documents } = useListDocuments();
  const recommend = useRecommendSchools();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [careerGoal, setCareerGoal] = useState("");
  const [currentEducation, setCurrentEducation] = useState("");
  const [documentId, setDocumentId] = useState(ANY);
  const [degreeLevel, setDegreeLevel] = useState(ANY);
  const [studyMode, setStudyMode] = useState(ANY);
  const [budget, setBudget] = useState(ANY);
  const [location, setLocation] = useState("");

  const handleSubmit = () => {
    if (!careerGoal.trim()) return;
    const preferences: Record<string, string> = {};
    if (degreeLevel !== ANY) preferences["degreeLevel"] = degreeLevel;
    if (studyMode !== ANY) preferences["studyMode"] = studyMode;
    if (budget !== ANY) preferences["budget"] = budget;
    if (location.trim()) preferences["location"] = location.trim();

    recommend.mutate(
      {
        data: {
          careerGoal: careerGoal.trim(),
          ...(currentEducation.trim()
            ? { currentEducation: currentEducation.trim() }
            : {}),
          ...(documentId !== ANY ? { documentId: parseInt(documentId) } : {}),
          ...(Object.keys(preferences).length > 0 ? { preferences } : {}),
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Recommendations ready" });
          setCareerGoal("");
          setCurrentEducation("");
          setDocumentId(ANY);
          setDegreeLevel(ANY);
          setStudyMode(ANY);
          setBudget(ANY);
          setLocation("");
          queryClient.invalidateQueries({
            queryKey: getListCareerPlansQueryKey(),
          });
        },
        onError: () => {
          toast({
            title: "Failed to generate recommendations",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Careers/Pathways</h1>
        <p className="text-muted-foreground mt-1 mb-8">
          Tell us your career goal and upload your transcript if you have one.
          Our AI will research schools and programs that fit your needs and
          help you take the next step.
        </p>

        <Card className="border-2 border-primary/20 shadow-md">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="goal">What career do you want to pursue?</Label>
              <Input
                id="goal"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g. Become a registered nurse, Data scientist, Software engineer"
                className="text-base py-6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">
                Your current education or background (optional)
              </Label>
              <Textarea
                id="education"
                value={currentEducation}
                onChange={(e) => setCurrentEducation(e.target.value)}
                placeholder="e.g. Associate degree in IT, high school diploma, 2 years of college in biology..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Use an uploaded transcript or document (optional)</Label>
              <Select value={documentId} onValueChange={setDocumentId}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>None</SelectItem>
                  {documents?.map((doc) => (
                    <SelectItem key={doc.id} value={String(doc.id)}>
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Upload files on the Documents page first, then pick one here.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Degree level</Label>
                <Select value={degreeLevel} onValueChange={setDegreeLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>Any</SelectItem>
                    <SelectItem value="Certificate">Certificate</SelectItem>
                    <SelectItem value="Associate">Associate</SelectItem>
                    <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                    <SelectItem value="Master's">Master's</SelectItem>
                    <SelectItem value="Doctorate">Doctorate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Study mode</Label>
                <Select value={studyMode} onValueChange={setStudyMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>Any</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="In-person">In-person</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Budget</Label>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>Any</SelectItem>
                    <SelectItem value="Low cost">Low cost</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="No limit">No limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Preferred location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. California, remote, anywhere"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={recommend.isPending || !careerGoal.trim()}
              className="w-full h-auto py-4"
            >
              {recommend.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              {recommend.isPending
                ? "Researching schools..."
                : "Find my schools"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">Saved Plans</h2>
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
            {plans?.map((plan) => (
              <Link key={plan.id} href={`/pathways/${plan.id}`}>
                <Card className="hover-elevate cursor-pointer h-full transition-all duration-300 border-t-4 border-t-secondary hover:border-t-primary">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium uppercase tracking-wider">
                        {plan.recommendationCount ?? 0} schools
                      </span>
                    </div>
                    <CardTitle className="text-xl line-clamp-2">
                      {plan.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 mt-2">
                      {plan.summary}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
            {plans?.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                <Compass className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No career plans yet.</p>
                <p className="text-sm mt-1">
                  Set a career goal above to get school recommendations.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
