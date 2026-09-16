import { EditableField } from "@/components/EditableField";
import type { PartyConfig } from "@/lib/party-config";

type FooterProps = {
  config: PartyConfig;
  partyId: string;
  isOwner: boolean;
};

export function Footer({ config, partyId, isOwner }: FooterProps) {
  return (
    <footer className="page-shell py-6">
      <div className="rounded-[2rem] border border-leaf/20 bg-[var(--surface)] p-5 text-center shadow-[var(--shadow)] sm:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-leaf-dark">
          Kontakt
        </h2>
        <p className="mt-3 text-muted">
          <EditableField
            partyId={partyId}
            fieldKey="contactName"
            value={config.contact.name}
            placeholder="Dein Name"
            isOwner={isOwner}
            ariaLabel="Kontaktname bearbeiten"
            className="text-muted"
          />
          <br />
          Tel.{" "}
          <EditableField
            partyId={partyId}
            fieldKey="contactPhone"
            value={config.contact.phone}
            placeholder="Telefonnummer"
            isOwner={isOwner}
            ariaLabel="Telefonnummer bearbeiten"
            className="text-muted"
          />
          <br />
          <EditableField
            partyId={partyId}
            fieldKey="contactEmail"
            value={config.contact.email}
            placeholder="E-Mail-Adresse"
            isOwner={isOwner}
            ariaLabel="E-Mail bearbeiten"
            className="text-muted"
            link={{ href: `mailto:${config.contact.email}` }}
          />
        </p>
      </div>
    </footer>
  );
}
