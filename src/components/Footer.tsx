import { CopyPasswordButton } from "@/components/CopyPasswordButton";
import { EditableField } from "@/components/EditableField";
import { InvitationTextButton } from "@/components/InvitationTextButton";
import { LockIcon } from "@/components/EditIcons";
import { MadeWithBadge } from "@/components/MadeWithBadge";
import type { EventConfig } from "@/lib/event-config";
import { buildEventShareUrl } from "@/lib/share";
import type { EventFieldKey } from "@/lib/validation";

type FooterProps = {
  config: EventConfig;
  eventId: string;
  slug: string;
  isOwner: boolean;
  /** Owner only (null for everyone else): goes into the invitation text. */
  accessPassword: string | null;
};

type ContactField = {
  fieldKey: EventFieldKey;
  value: string;
  placeholder: string;
  ariaLabel: string;
  link?: { href: string };
};

export function Footer({ config, eventId, slug, isOwner, accessPassword }: FooterProps) {
  const contactFields: ContactField[] = [
    {
      fieldKey: "contactName",
      value: config.contact.name,
      placeholder: "Dein Name",
      ariaLabel: "Kontaktname bearbeiten",
    },
    {
      fieldKey: "contactPhone",
      value: config.contact.phone,
      placeholder: "Telefonnummer",
      ariaLabel: "Telefonnummer bearbeiten",
    },
    {
      fieldKey: "contactEmail",
      value: config.contact.email,
      placeholder: "E-Mail-Adresse",
      ariaLabel: "E-Mail bearbeiten",
      link: { href: `mailto:${config.contact.email}` },
    },
  ];

  // Guests only see filled-in rows (no blank lines, and no "Kontakt"
  // heading at all when nothing is filled in); the owner sees every row with
  // its placeholder so empty ones can still be filled in.
  const visibleFields = isOwner
    ? contactFields
    : contactFields.filter((field) => field.value.trim() !== "");

  return (
    <footer className="page-shell py-6">
      <div className="rounded-[2rem] border border-leaf/20 bg-[var(--surface)] p-5 text-center shadow-(--shadow) sm:p-8">
        {visibleFields.length > 0 ? (
          <>
            <h2 className="font-display text-2xl text-leaf-dark">Kontakt</h2>
            <div className="mt-3 text-muted">
              {visibleFields.map((field) => (
                <div key={field.fieldKey}>
                  <EditableField
                    eventId={eventId}
                    fieldKey={field.fieldKey}
                    value={field.value}
                    placeholder={field.placeholder}
                    isOwner={isOwner}
                    ariaLabel={field.ariaLabel}
                    className="text-muted"
                    link={field.link}
                  />
                </div>
              ))}
            </div>
          </>
        ) : null}
        {isOwner && accessPassword ? (
          <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-leaf/10 px-3 py-1 text-xs font-bold text-leaf-dark">
            <LockIcon />
            Passwortgeschützt
          </p>
        ) : null}
        <MadeWithBadge
          share={{ url: buildEventShareUrl(slug), title: config.title }}
          extraAction={
            isOwner ? (
              <>
                {accessPassword ? (
                  <CopyPasswordButton password={accessPassword} className="bg-surface" />
                ) : null}
                <InvitationTextButton
                  eventId={eventId}
                  className="bg-surface"
                  facts={{
                    title: config.title,
                    dateLabel: config.dateLabel,
                    timeLabel: config.timeLabel,
                    location: config.locationLabel,
                    contactName: config.contact.name,
                    url: buildEventShareUrl(slug),
                    password: accessPassword,
                  }}
                />
              </>
            ) : null
          }
        />
      </div>
    </footer>
  );
}
