import { useState, useEffect } from "react";
import { Redirect } from "wouter";
import { Copy, Check, Mail, ExternalLink, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMe } from "@/hooks/use-me";
import { OUTREACH } from "@/lib/outreach-constants";
import { OUTREACH_TEMPLATES } from "@/lib/outreach-templates";

export default function OwnerOutreachPage() {
  const { data: me, isLoading } = useMe();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [digestLoading, setDigestLoading] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const [resendOk, setResendOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (!me?.isOwner) return;
    void (async () => {
      try {
        const res = await fetch("/api/newsletter/status");
        const data = (await res.json()) as { configured?: boolean };
        setResendOk(!!data.configured);
      } catch {
        setResendOk(false);
      }
    })();
  }, [me?.isOwner]);

  if (!isLoading && !me?.isOwner) return <Redirect to="/" />;

  async function copyTemplate(id: string, subject: string, body: string) {
    const full = `Subject: ${subject}\n\nCC: ${OUTREACH.yahooEmail}\n\n${body}`;
    await navigator.clipboard.writeText(full);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied", description: "Paste into Gmail. CC Yahoo is in the header." });
  }

  async function sendWeeklyDigest() {
    setDigestLoading(true);
    try {
      const res = await fetch("/api/owner/outreach/weekly-digest", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok) {
        toast({
          title: "Could not send digest",
          description: data.error ?? "Check Resend env vars on the server.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Digest sent",
        description: data.message ?? `Check ${OUTREACH.yahooEmail}`,
      });
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setDigestLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Outreach & email hub</h1>
        <p className="text-muted-foreground">
          Partnership mail via <strong>Gmail</strong> (CC {OUTREACH.yahooEmail}). Subscriber mail via{" "}
          <strong>Resend</strong>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Quick status
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant={resendOk ? "default" : "secondary"}>
            Resend: {resendOk === null ? "…" : resendOk ? "configured" : "not configured"}
          </Badge>
          <Badge variant="outline">Gmail MCP: set up in Cursor (see docs/email-setup-guide.md)</Badge>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Partnership emails (copy → Gmail)</h2>
        <p className="text-sm text-muted-foreground">
          Send from Gmail. Always CC <strong>{OUTREACH.yahooEmail}</strong>. Optional Reply-To: same address.
        </p>
        {OUTREACH_TEMPLATES.map((t) => {
          const body = t.body(origin);
          return (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t.org}</CardTitle>
                <CardDescription>
                  <a
                    href={t.where.split(" ")[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary underline"
                  >
                    {t.where}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-medium">Subject: {t.subject}</p>
                <pre className="max-h-40 overflow-auto rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap">
                  {body}
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyTemplate(t.id, t.subject, body)}
                >
                  {copiedId === t.id ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  Copy for Gmail
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Weekly digest draft
          </CardTitle>
          <CardDescription>
            Emails a draft update to {OUTREACH.yahooEmail} via Resend (for your Literary Club / subscriber
            broadcasts).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={sendWeeklyDigest} disabled={digestLoading || resendOk === false}>
            {digestLoading ? "Sending…" : "Email me this week's digest"}
          </Button>
          {resendOk === false ? (
            <p className="mt-2 text-sm text-destructive">
              Add RESEND_API_KEY and RESEND_FROM to server env first.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gmail + Cursor (one-time)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ol className="list-decimal space-y-2 pl-5">
            <li>Copy <code className="text-xs">docs/mcp-gmail.example.json</code> into your Cursor MCP settings.</li>
            <li>Run <code className="text-xs">npx gmail-mcp-server setup</code> and sign in with Google once.</li>
            <li>
              In Cursor: &quot;Draft the SCORE email, CC {OUTREACH.yahooEmail}, do not send.&quot;
            </li>
          </ol>
          <p>Full guide: <code className="text-xs">docs/email-setup-guide.md</code> in the repo.</p>
        </CardContent>
      </Card>
    </div>
  );
}
