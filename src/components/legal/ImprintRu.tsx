import { LEGAL_INFO } from "@/lib/legal-info";
import { EmailLink, LegalBody, PostalAddress, Section } from "../LegalText";

// Russian translation of ImprintDe.tsx - same sections and paragraphs;
// change all languages together (legal-parity.test.ts).
export function ImprintRu() {
  return (
    <LegalBody>
      <Section title="Сведения согласно § 5 DDG (закон Германии о цифровых услугах)">
        <p>
          <PostalAddress locale="ru" />
        </p>
        <p>GASTZILLA ведёт {LEGAL_INFO.name} в качестве лица свободной профессии (freiberuflich).</p>
      </Section>

      <Section title="Контакты">
        <p>
          E-mail: <EmailLink />
        </p>
      </Section>

      {LEGAL_INFO.vatId || LEGAL_INFO.businessId ? (
        <Section title="Налоговые сведения">
          {LEGAL_INFO.vatId ? (
            <p>Идентификационный номер плательщика НДС согласно § 27a UStG: {LEGAL_INFO.vatId}</p>
          ) : null}
          {LEGAL_INFO.businessId ? (
            <p>Хозяйственный идентификационный номер согласно § 139c AO: {LEGAL_INFO.businessId}</p>
          ) : null}
        </Section>
      ) : null}

      <Section title="Урегулирование потребительских споров">
        <p>
          Мы не готовы и не обязаны участвовать в процедурах урегулирования
          споров в потребительской арбитражной комиссии.
        </p>
      </Section>
    </LegalBody>
  );
}
