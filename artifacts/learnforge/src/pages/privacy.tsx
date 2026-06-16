import { COMPANY } from "@/lib/company";
import { LegalLayout, LegalSection } from "@/components/legal-layout";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated={COMPANY.lastUpdated}>
      <p>
        This Privacy Policy explains how {COMPANY.legalEntity} ("we", "us", or
        "our") collects, uses, and shares information when you use{" "}
        {COMPANY.appName}. By using the service, you agree to this policy.
      </p>

      <LegalSection heading="1. Information we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Account information.</strong> When
            you sign up, our authentication provider collects information such as
            your name and email address.
          </li>
          <li>
            <strong className="text-foreground">Content you provide.</strong> The
            subjects, topics, career goals, and documents or notes you upload to
            generate quizzes, study guides, and other materials.
          </li>
          <li>
            <strong className="text-foreground">Usage information.</strong> How
            you use the service, such as quizzes taken, scores, and progress, so
            we can provide and improve features.
          </li>
          <li>
            <strong className="text-foreground">Payment information.</strong> When
            you subscribe or make a purchase, our payment processors (such as
            Stripe and PayPal) collect and process your payment details. We do not
            store your full card number.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="2. How we use your information">
        <ul className="list-disc space-y-1 pl-5">
          <li>To provide, operate, and maintain the service;</li>
          <li>
            To generate your quizzes, study guides, curricula, and other AI
            results;
          </li>
          <li>To process payments, subscriptions, and access codes;</li>
          <li>To track your learning progress and personalize your experience;</li>
          <li>To communicate with you about your account and support requests;</li>
          <li>
            To protect the security and integrity of the service and comply with
            law.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. AI processing">
        <p>
          To generate results, we send the inputs and uploaded content you provide
          to our third-party AI provider. That content is processed to produce
          your quizzes, study guides, recommendations, and similar output. Please
          do not upload sensitive personal information you would not want processed
          this way.
        </p>
      </LegalSection>

      <LegalSection heading="4. How we share information">
        <p>
          We do not sell your personal information. We share information only
          with:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Service providers who help us run the service (authentication, payment
            processing, AI generation, hosting, and storage);
          </li>
          <li>
            Authorities or others when required by law or to protect rights,
            safety, and security;
          </li>
          <li>
            A successor in connection with a merger, acquisition, or sale of
            assets.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Children's privacy">
        <p>
          {COMPANY.appName} is offered to learners including those under 18. If
          your child is under 13, a parent or legal guardian must create and
          manage the account and consent to the collection and use of the child's
          information as described here, consistent with the Children's Online
          Privacy Protection Act (COPPA). Parents and guardians may contact us to
          review, update, or delete their child's information, or to withdraw
          consent.
        </p>
      </LegalSection>

      <LegalSection heading="6. Data retention">
        <p>
          We keep your information for as long as your account is active or as
          needed to provide the service, comply with our legal obligations,
          resolve disputes, and enforce our agreements. You can ask us to delete
          your account and associated data as described below.
        </p>
      </LegalSection>

      <LegalSection heading="7. Your choices and rights">
        <p>
          Depending on where you live, you may have the right to access, correct,
          or delete your personal information, or to object to or restrict certain
          processing. To exercise these rights, or to delete your account, contact
          us using the details below. You can cancel a paid plan at any time from
          the billing portal in your account.
        </p>
      </LegalSection>

      <LegalSection heading="8. Security">
        <p>
          We use reasonable technical and organizational measures to protect your
          information. However, no method of transmission or storage is completely
          secure, and we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection heading="9. Cookies and sessions">
        <p>
          We use cookies and similar technologies that are necessary to keep you
          signed in and to operate the service.
        </p>
      </LegalSection>

      <LegalSection heading="10. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. We will update the
          "Last updated" date above and, where appropriate, provide additional
          notice.
        </p>
      </LegalSection>

      <LegalSection heading="11. Contact us">
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
