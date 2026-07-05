import { COMPANY } from "@/lib/company";
import { LegalLayout, LegalSection } from "@/components/legal-layout";

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated={COMPANY.lastUpdated}>
      <p>
        These Terms of Service ("Terms") govern your access to and use of{" "}
        {COMPANY.appName}, an AI-powered learning and test-preparation service
        operated by {COMPANY.legalEntity} ("we", "us", or "our"). By creating an
        account or using {COMPANY.appName}, you agree to these Terms. If you do
        not agree, please do not use the service.
      </p>

      <LegalSection heading="1. Eligibility and age requirements">
        <p>
          {COMPANY.appName} is available to learners of all ages. The service is
          free for users under 18. Users 18 and older may use a free trial and
          then subscribe to a paid plan. If you are under 18, you may use{" "}
          {COMPANY.appName} only with the involvement and consent of a parent or
          legal guardian who agrees to these Terms on your behalf. If you are
          under 13, a parent or guardian must create and manage the account.
        </p>
        <p>
          By using the service you represent that the information you provide is
          accurate and that you have the legal capacity (or parental/guardian
          consent) to enter into these Terms.
        </p>
      </LegalSection>

      <LegalSection heading="2. Your account">
        <p>
          You are responsible for keeping your login credentials secure and for
          all activity under your account. Notify us promptly of any unauthorized
          use. Accounts and authentication are handled through our login
          provider.
        </p>
      </LegalSection>

      <LegalSection heading="3. Subscriptions, free trial, billing, and automatic renewal">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Plans.</strong> Paid plans are
            Pro Monthly ($12.99 per month) and Pro Annual ($89.99 per year).
            Prices are shown at checkout and may change as described below.
          </li>
          <li>
            <strong className="text-foreground">Free trial.</strong> Eligible
            users 18 and older may receive a free trial period (currently six
            months). You will not be charged during the trial, and you may cancel
            before it ends to avoid any charge.
          </li>
          <li>
            <strong className="text-foreground">Automatic renewal.</strong> Paid
            plans are subscriptions that automatically renew at the end of each
            billing period (monthly or annually) using your payment method on
            file, until you cancel. By subscribing, you authorize us and our
            payment processor to charge the applicable recurring fee.
          </li>
          <li>
            <strong className="text-foreground">Cancellation.</strong> You can
            cancel at any time from the billing portal in your account.
            Cancellation stops future charges; your access continues until the
            end of the period you have already paid for. See our Refunds &amp;
            Cancellation Policy for details.
          </li>
          <li>
            <strong className="text-foreground">Price changes.</strong> We may
            change subscription prices; we will give you reasonable advance
            notice, and changes apply to billing periods after the notice.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="4. Access codes and one-time purchases">
        <p>
          We may offer prepaid access codes, school or organization bulk seats,
          and one-time purchases that grant a fixed period of paid access. Once an
          access code has been redeemed, it is non-refundable except as required
          by law or as stated in our Refunds &amp; Cancellation Policy.
        </p>
      </LegalSection>

      <LegalSection heading="5. Payments">
        <p>
          Payments are processed by third-party payment providers (such as Stripe
          and PayPal). We do not store your full card number. Your use of those
          services is also subject to their terms and privacy policies. You agree
          to provide accurate billing information and authorize the applicable
          charges.
        </p>
      </LegalSection>

      <LegalSection heading="6. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Use the service for any unlawful, harmful, or fraudulent purpose;</li>
          <li>
            Upload content you do not have the right to use, or that is illegal,
            infringing, or confidential to someone else;
          </li>
          <li>
            Attempt to disrupt, reverse engineer, scrape, or gain unauthorized
            access to the service;
          </li>
          <li>
            Use the service to cheat on an exam or in any way that violates the
            rules of a school, employer, or certifying body;
          </li>
          <li>
            Resell or commercially exploit the service except as expressly
            permitted.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="7. Your content">
        <p>
          You retain ownership of the documents, notes, and other materials you
          upload ("Your Content"). You grant us a limited license to host,
          process, and use Your Content solely to operate and provide the service
          to you, including sending it to our AI provider to generate results. You
          represent that you have the rights to upload Your Content and that doing
          so does not violate any law or third-party right.
        </p>
      </LegalSection>

      <LegalSection heading="8. AI-generated content">
        <p>
          {COMPANY.appName} uses artificial intelligence to generate quizzes,
          study guides, recommendations, interview practice, and other materials.
          AI output can be inaccurate, incomplete, or out of date, and is provided
          for educational purposes only. It is not professional, legal, medical,
          financial, or career advice. Always verify important information
          independently before relying on it.
        </p>
      </LegalSection>

      <LegalSection heading="9. Intellectual property">
        <p>
          The {COMPANY.appName} service, including its software, design, and
          branding, is owned by {COMPANY.legalEntity} and protected by law. We
          grant you a personal, non-exclusive, non-transferable right to use the
          service in accordance with these Terms.
        </p>
      </LegalSection>

      <LegalSection heading="10. Disclaimers">
        <p>
          The service is provided "as is" and "as available" without warranties
          of any kind, whether express or implied, including fitness for a
          particular purpose and non-infringement. We do not warrant that the
          service will be uninterrupted, error-free, or that AI output will be
          accurate.
        </p>
      </LegalSection>

      <LegalSection heading="11. Limitation of liability">
        <p>
          To the maximum extent permitted by law, {COMPANY.legalEntity} will not
          be liable for any indirect, incidental, special, consequential, or
          punitive damages, or for any loss of data, profits, or opportunities,
          arising from your use of the service. Our total liability for any claim
          relating to the service will not exceed the amount you paid us in the
          twelve months before the claim.
        </p>
      </LegalSection>

      <LegalSection heading="12. Termination">
        <p>
          You may stop using the service at any time. We may suspend or terminate
          your access if you violate these Terms or to protect the service or
          other users. Provisions that by their nature should survive termination
          will survive.
        </p>
      </LegalSection>

      <LegalSection heading="13. Changes to these Terms">
        <p>
          We may update these Terms from time to time. If we make material
          changes, we will update the "Last updated" date and, where appropriate,
          provide additional notice. Your continued use of the service after
          changes take effect constitutes acceptance.
        </p>
      </LegalSection>

      <LegalSection heading="14. Governing law">
        <p>
          These Terms are governed by the laws of the State of{" "}
          {COMPANY.governingState}, without regard to its conflict-of-laws rules.
          Any disputes will be resolved in the courts located in{" "}
          {COMPANY.governingState}, unless applicable law requires otherwise.
        </p>
      </LegalSection>

      <LegalSection heading="15. Contact us">
        <p>
          {COMPANY.legalEntity}
          <br />
          {COMPANY.address}
          <br />
          Email:{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-foreground underline">
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
