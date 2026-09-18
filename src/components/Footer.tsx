import { EditableField } from "@/components/EditableField";
import { MadeWithBadge } from "@/components/MadeWithBadge";
import type { EventConfig } from "@/lib/event-config";

type FooterProps = {
  config: EventConfig;
  eventId: string;
  isOwner: boolean;
};

export function Footer({ config, eventId, isOwner }: FooterProps) {
  return (
    <footer className="page-shell py-6">
      <div className="rounded-[2rem] border border-leaf/20 bg-[var(--surface)] p-5 text-center shadow-(--shadow) sm:p-8">
        <h2 className="font-display text-2xl text-leaf-dark">
          Kontakt
        </h2>
        <p className="mt-3 text-muted">
          <EditableField
            eventId={eventId}
            fieldKey="contactName"
            value={config.contact.name}
            placeholder="Dein Name"
            isOwner={isOwner}
            ariaLabel="Kontaktname bearbeiten"
            className="text-muted"
          />
          <br />
          <EditableField
            eventId={eventId}
            fieldKey="contactPhone"
            value={config.contact.phone}
            placeholder="Telefonnummer"
            isOwner={isOwner}
            ariaLabel="Telefonnummer bearbeiten"
            className="text-muted"
          />
          <br />
          <EditableField
            eventId={eventId}
            fieldKey="contactEmail"
            value={config.contact.email}
            placeholder="E-Mail-Adresse"
            isOwner={isOwner}
            ariaLabel="E-Mail bearbeiten"
            className="text-muted"
            link={{ href: `mailto:${config.contact.email}` }}
          />
        </p>
        <MadeWithBadge />
      </div>
    </footer>
  );
}
