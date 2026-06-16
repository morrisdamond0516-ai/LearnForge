import { Mail, Phone, MapPin } from "lucide-react";
import { COMPANY } from "@/lib/company";
import { LegalLayout } from "@/components/legal-layout";

export default function Contact() {
  return (
    <LegalLayout title="Contact us">
      <p>
        We're here to help with questions about {COMPANY.appName}, your account,
        billing and refunds, or privacy. Reach us using any of the options below
        and we'll get back to you within a few business days.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-card-border bg-card p-5">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold text-foreground">Email</h2>
          <a
            href={`mailto:${COMPANY.email}`}
            className="mt-1 block break-words text-sm text-primary"
          >
            {COMPANY.email}
          </a>
        </div>
        {COMPANY.phone && (
          <div className="rounded-xl border border-card-border bg-card p-5">
            <Phone className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-semibold text-foreground">Phone</h2>
            <a
              href={`tel:${COMPANY.phone.replace(/[^0-9+]/g, "")}`}
              className="mt-1 block text-sm text-primary"
            >
              {COMPANY.phone}
            </a>
          </div>
        )}
        <div className="rounded-xl border border-card-border bg-card p-5">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold text-foreground">Mail</h2>
          <p className="mt-1 text-sm text-muted-foreground">{COMPANY.address}</p>
        </div>
      </div>

      <p>
        {COMPANY.appName} is operated by {COMPANY.legalEntity}. For billing
        questions you can also manage your subscription anytime from the billing
        portal in your account.
      </p>
    </LegalLayout>
  );
}
