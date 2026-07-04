import { Link } from "wouter";
import { Logo } from "@/components/logo";
import { COMPANY } from "@/lib/company";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background py-10 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Logo className="h-6 w-auto text-primary" />
            <span>{COMPANY.appName}</span>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            <Link href="/pricing" className="transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/refund" className="transition-colors hover:text-foreground">
              Refunds &amp; Cancellation
            </Link>
            <Link href="/contact" className="transition-colors hover:text-foreground">
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex flex-col gap-1 border-t border-border pt-4 text-xs">
          <p>
            &copy; {new Date().getFullYear()} {COMPANY.legalEntity}. All rights
            reserved.
          </p>
          <p>
            Questions?{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-primary">
              {COMPANY.email}
            </a>
            {COMPANY.phone && <> · {COMPANY.phone}</>}
          </p>
          <p className="mt-1">
            LearnForge is a product of{" "}
            <a
              href="https://ebookgamez.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent hover:underline"
            >
              EbookGamez.com
            </a>{" "}
            — your complete gaming, reading &amp; learning hub.
          </p>
        </div>
      </div>
    </footer>
  );
}
