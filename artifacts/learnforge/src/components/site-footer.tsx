import { Link } from "wouter";
import { GraduationCap } from "lucide-react";
import { COMPANY } from "@/lib/company";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background py-10 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <GraduationCap className="h-5 w-5 text-primary" />
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
            </a>{" "}
            · {COMPANY.phone}
          </p>
        </div>
      </div>
    </footer>
  );
}
