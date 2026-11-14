import { LEGAL_INFO } from "@/lib/legal-info";
import { EmailLink, LegalBody, PostalAddress, Section } from "../LegalText";

// English translation of ImprintDe.tsx - same sections and paragraphs;
// change both together (legal-parity.test.ts).
export function ImprintEn() {
  return (
    <LegalBody>
      <Section title="Information pursuant to § 5 DDG (German Digital Services Act)">
        <p>
          <PostalAddress locale="en" />
        </p>
        <p>GASTZILLA is run by {LEGAL_INFO.name} as a freelancer.</p>
      </Section>

      <Section title="Contact">
        <p>
          Email: <EmailLink />
        </p>
      </Section>

      {LEGAL_INFO.vatId || LEGAL_INFO.businessId ? (
        <Section title="Tax information">
          {LEGAL_INFO.vatId ? (
            <p>VAT identification number pursuant to § 27a UStG: {LEGAL_INFO.vatId}</p>
          ) : null}
          {LEGAL_INFO.businessId ? (
            <p>Business identification number pursuant to § 139c AO: {LEGAL_INFO.businessId}</p>
          ) : null}
        </Section>
      ) : null}

      <Section title="Consumer dispute resolution">
        <p>
          We are neither willing nor obliged to take part in dispute resolution
          proceedings before a consumer arbitration board.
        </p>
      </Section>
    </LegalBody>
  );
}
