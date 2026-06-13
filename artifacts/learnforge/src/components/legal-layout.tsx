import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { Logo } from "@/components/logo";

export function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="app-header sticky top-0 z-40 flex items-center justify-between px-4 py-3 shadow-lg sm:px-6 lg:h-16 lg:px-8 lg:py-0">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-bold text-xl text-white tracking-tight"
        >
          <Logo className="h-8 w-auto text-white" />
          <span>LearnForge</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/15 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </header>

      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {lastUpdated && (
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          )}
          <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted-foreground">
            {children}
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
      {children}
    </section>
  );
}
