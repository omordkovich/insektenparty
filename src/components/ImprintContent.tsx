import { LEGAL_INFO } from "@/lib/legal-info";
import { EmailLink, LegalBody, PostalAddress, Section } from "./LegalText";

export function ImprintContent() {
  return (
    <LegalBody>
      <Section title="Angaben gemäß § 5 DDG">
        <p>
          <PostalAddress />
        </p>
        <p>GASTZILLA wird von {LEGAL_INFO.name} freiberuflich betrieben.</p>
      </Section>

      <Section title="Kontakt">
        <p>
          E-Mail: <EmailLink />
        </p>
      </Section>

      {LEGAL_INFO.vatId || LEGAL_INFO.businessId ? (
        <Section title="Steuerliche Angaben">
          {LEGAL_INFO.vatId ? (
            <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {LEGAL_INFO.vatId}</p>
          ) : null}
          {LEGAL_INFO.businessId ? (
            <p>Wirtschafts-Identifikationsnummer gemäß § 139c AO: {LEGAL_INFO.businessId}</p>
          ) : null}
        </Section>
      ) : null}

      <Section title="Verbraucherstreitbeilegung">
        <p>
          Wir sind nicht bereit und nicht verpflichtet, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </Section>
    </LegalBody>
  );
}
