import { COMPANY } from "@/lib/company";
import { LegalLayout, LegalSection } from "@/components/legal-layout";

export default function Refund() {
  return (
    <LegalLayout
      title="Refunds & Cancellation Policy"
      lastUpdated={COMPANY.lastUpdated}
    >
      <p>
        This policy explains how cancellations and refunds work for{" "}
        {COMPANY.appName}. It is part of our Terms of Service.
      </p>

      <LegalSection heading="1. Free trial">
        <p>
          Eligible users 18 and older may receive a free trial period (currently
          six months). You will not be charged during the trial. To avoid being
          charged, cancel before the trial ends. Users under 18 use the service
          for free and are not charged.
        </p>
      </LegalSection>

      <LegalSection heading="2. How to cancel">
        <p>
          You can cancel a paid plan at any time from the billing portal in your
          account ("Manage billing"). When you cancel, future charges stop and you
          keep access until the end of the billing period you have already paid
          for. We do not automatically provide partial refunds for the unused part
          of a period.
        </p>
      </LegalSection>

      <LegalSection heading="3. Subscription refunds">
        <p>
          Subscription charges are generally non-refundable once a billing period
          begins. As a courtesy, if you believe you were charged in error or have
          a special circumstance, contact us within 14 days of the charge and we
          will review your request in good faith. We always honor refunds required
          by applicable law.
        </p>
      </LegalSection>

      <LegalSection heading="4. Annual plans">
        <p>
          Annual plans are billed once per year. If you cancel, you keep access
          for the remainder of the year you paid for, and the plan will not renew.
        </p>
      </LegalSection>

      <LegalSection heading="5. Access codes and bulk (school) purchases">
        <p>
          Prepaid access codes and bulk seat purchases grant a fixed period of
          access. Once a code has been redeemed, it is non-refundable except as
          required by law. If you purchased codes that have not yet been redeemed
          and need help, contact us and we will work with you.
        </p>
      </LegalSection>

      <LegalSection heading="6. Failed, duplicate, or unauthorized charges">
        <p>
          If you see a charge you do not recognize, a duplicate charge, or a
          billing error, contact us right away and we will investigate and correct
          any genuine error promptly.
        </p>
      </LegalSection>

      <LegalSection heading="7. How to request a refund">
        <p>
          Email us at{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-primary">
            {COMPANY.email}
          </a>{" "}
          with the email address on your account, the date and amount of the
          charge, and a brief description of your request. We aim to respond
          within a few business days.
        </p>
      </LegalSection>

      <LegalSection heading="8. Contact">
        <p>
          {COMPANY.legalEntity}
          <br />
          {COMPANY.address}
          <br />
          Email:{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-primary">
            {COMPANY.email}
          </a>
          {COMPANY.phone && (
            <>
              <br />
              Phone: {COMPANY.phone}
            </>
          )}
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
