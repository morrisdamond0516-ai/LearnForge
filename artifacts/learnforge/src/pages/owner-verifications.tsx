import { useEffect, useState } from "react";
import { Redirect } from "wouter";
import { Loader2, FileText, Check, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMe } from "@/hooks/use-me";

type PendingVerification = {
  userId: string;
  email: string | null;
  birthDate: string | null;
  age: number | null;
  hasDocument: boolean;
  createdAt: string;
};

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function OwnerVerifications() {
  const { data: me, isLoading } = useMe();
  const { toast } = useToast();
  const [items, setItems] = useState<PendingVerification[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/me/verifications", {
        credentials: "include",
      });
      if (!res.ok) return;
      setItems((await res.json()) as PendingVerification[]);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (me?.isOwner) void load();
  }, [me?.isOwner]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!me?.isOwner) return <Redirect to="/" />;

  async function review(userId: string, decision: "approve" | "reject") {
    setBusyId(userId);
    try {
      const res = await fetch(`/api/me/verifications/${userId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ decision }),
      });
      if (!res.ok) throw new Error("failed");
      toast({
        title: decision === "approve" ? "Approved" : "Rejected",
      });
      setItems((prev) => prev?.filter((i) => i.userId !== userId) ?? null);
    } catch {
      toast({ title: "Could not save your decision", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Age verifications</h1>
      </div>
      <p className="text-muted-foreground">
        Review official documents submitted by learners after their free period.
      </p>

      {items === null ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-card-border bg-card p-10 text-center text-muted-foreground">
          No documents are waiting for review.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.userId}
              className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-card-foreground">
                  {item.email ?? item.userId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Date of birth: {item.birthDate ?? "—"}
                  {item.age != null ? ` (age ${item.age})` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {item.hasDocument && (
                  <Button asChild variant="outline" className="gap-2">
                    <a
                      href={`${basePath}/api/me/verifications/${item.userId}/document`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FileText className="h-4 w-4" />
                      View document
                    </a>
                  </Button>
                )}
                <Button
                  className="gap-2"
                  onClick={() => review(item.userId, "approve")}
                  disabled={busyId === item.userId}
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => review(item.userId, "reject")}
                  disabled={busyId === item.userId}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
