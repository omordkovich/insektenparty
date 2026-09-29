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
          Telefon: {LEGAL_INFO.phone}
          <br />
          E-Mail: <EmailLink />
        </p>
      </Section>

      {LEGAL_INFO.vatId ? (
        <Section title="Umsatzsteuer-ID">
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:
            <br />
            {LEGAL_INFO.vatId}
          </p>
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
