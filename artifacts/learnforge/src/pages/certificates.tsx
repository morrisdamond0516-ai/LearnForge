import { Link } from "wouter";
import { Award, ScrollText, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCertificates } from "@/hooks/use-exams";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Certificates() {
  const { data, isLoading } = useCertificates();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <ScrollText className="h-7 w-7 text-primary" />
          My Certificates
        </h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Certificates you've earned by passing certified exams. Each is valid
          for 90 days from the date it was issued — retake the exam any time to
          renew it.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.map((cert) => (
            <Card key={cert.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <div>
                  <CardTitle className="text-lg">{cert.examName}</CardTitle>
                  {cert.category && (
                    <p className="text-sm text-muted-foreground">
                      {cert.category}
                    </p>
                  )}
                </div>
                {cert.expired ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                    <XCircle className="h-3.5 w-3.5" />
                    Expired
                  </span>
                ) : (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Valid
                  </span>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Score: {Math.round(cert.score)}%</span>
                  <span>Level: {cert.level}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Issued {formatDate(cert.issuedAt)} · Expires{" "}
                  {formatDate(cert.expiresAt)}
                </div>
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link href={`/certificates/${cert.id}`}>
                    View certificate
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-card-border bg-card p-8 text-center">
          <Award className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium text-card-foreground">
            No certificates yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pass a certified exam with 70% or higher to earn your first one.
          </p>
          <Button asChild className="mt-4 gap-2">
            <Link href="/exams">
              Browse certified exams
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
