import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ObjectUploader } from "@workspace/object-storage-web";
import { useRequestUploadUrl } from "@workspace/api-client-react";
import { ShieldAlert, Clock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useMe, ME_QUERY_KEY } from "@/hooks/use-me";

/**
 * Shown to a learner whose under-18 free 9 months have ended and who hasn't
 * been verified yet. They can either subscribe to the low-cost Junior plan, or
 * upload an official document (name + date of birth) for the owner to review.
 */
export function AgeVerification() {
  const { data: me } = useMe();
  const requestUrl = useRequestUploadUrl();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (!me?.needsAgeVerification) return null;

  const pending = me.ageVerificationStatus === "pending";
  const rejected = me.ageVerificationStatus === "rejected";

  async function handleUploadComplete(result: {
    successful?: Array<{
      response?: { body?: { objectPath?: string }; uploadURL?: string };
    }>;
  }) {
    const file = result.successful?.[0];
    const objectPath =
      file?.response?.body?.objectPath ?? file?.response?.uploadURL;
    if (!objectPath) {
      toast({ title: "Upload failed", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch("/api/me/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ objectPath }),
      });
      if (!res.ok) throw new Error("register failed");
      toast({
        title: "Document submitted",
        description: "We'll review it shortly. Thanks!",
      });
      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    } catch {
      toast({ title: "Could not submit document", variant: "destructive" });
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {pending ? (
            <Clock className="h-5 w-5" />
          ) : (
            <ShieldAlert className="h-5 w-5" />
          )}
        </span>
        <div className="w-full">
          {pending ? (
            <>
              <h3 className="font-semibold text-card-foreground">
                Your document is under review
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Thanks for submitting your verification document. We'll review it
                shortly — you can keep using LearnForge in the meantime.
              </p>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-card-foreground">
                {rejected
                  ? "Your verification needs another look"
                  : "Your 9 free months have ended"}
              </h3>
              <p className="mt-1 mb-4 text-sm text-muted-foreground">
                To keep going, either continue on the low-cost Junior plan, or
                upload an official document showing your name and date of birth
                for review.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <ObjectUploader
                  onGetUploadParameters={async (file) => {
                    const res = await requestUrl.mutateAsync({
                      data: {
                        name: file.name,
                        size: file.size ?? 0,
                        contentType: file.type || "application/octet-stream",
                      },
                    });
                    return {
                      method: "PUT",
                      url: res.uploadURL,
                      headers: {
                        "Content-Type": file.type || "application/octet-stream",
                      },
                    };
                  }}
                  onComplete={handleUploadComplete}
                >
                  Upload verification document
                </ObjectUploader>
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/pricing">
                    See the Junior plan
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
