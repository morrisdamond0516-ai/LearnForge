import { Link, useRoute } from "wouter";
import { Award, ArrowLeft, Printer, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCertificate } from "@/hooks/use-exams";
import { useMe } from "@/hooks/use-me";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Certificate() {
  const [, params] = useRoute("/certificates/:id");
  const id = params?.id ?? "";
  const { data: cert, isLoading, isError } = useCertificate(id);
  const { data: me } = useMe();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !cert) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
        <p className="mt-2 font-medium text-card-foreground">
          We couldn't load this certificate.
        </p>
        <Button asChild variant="outline" className="mt-4 gap-2">
          <Link href="/certificates">
            <ArrowLeft className="h-4 w-4" />
            Back to certificates
          </Link>
        </Button>
      </div>
    );
  }

  const holder = me?.email ?? "LearnForge Learner";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/certificates">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </Button>
      </div>

      {cert.expired && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive print:hidden">
          <AlertCircle className="h-4 w-4" />
          This certificate has expired. Retake the exam to earn a fresh one.
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border-4 border-primary/20 bg-card p-10 text-center shadow-lg">
        <div className="flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Award className="h-9 w-9" />
          </span>
        </div>
        <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Certificate of Completion
        </p>
        <p className="mt-4 text-muted-foreground">This certifies that</p>
        <p className="mt-2 text-2xl font-bold text-foreground">{holder}</p>
        <p className="mt-4 text-muted-foreground">
          has successfully passed the
        </p>
        <p className="mt-2 text-xl font-semibold text-primary">
          {cert.examName}
        </p>
        {cert.category && (
          <p className="mt-1 text-sm text-muted-foreground">{cert.category}</p>
        )}
        <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-8 text-sm">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {Math.round(cert.score)}%
            </p>
            <p className="text-muted-foreground">Score</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{cert.level}</p>
            <p className="text-muted-foreground">Level</p>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-4 text-sm text-muted-foreground">
          <p>Issued {formatDate(cert.issuedAt)}</p>
          <p>Valid through {formatDate(cert.expiresAt)}</p>
          <p className="mt-2 font-semibold text-foreground">LearnForge</p>
        </div>
      </div>
    </div>
  );
}
