import type { GuestDto } from "@/lib/types";
import { formatTimeWindow } from "@/lib/validation";
import { Button } from "./Button";

type GuestItemProps = {
  guest: GuestDto;
  onEdit: (guest: GuestDto) => void;
  onDelete: (guest: GuestDto) => void;
  onShowBringing: (guest: GuestDto) => void;
  onShowAdditionalGuests: (guest: GuestDto) => void;
  onShowMessage: (guest: GuestDto) => void;
  onShowTime: (guest: GuestDto) => void;
  onShowDeclined: (guest: GuestDto) => void;
  disabled?: boolean;
};

export function GuestItem({
  guest,
  onEdit,
  onDelete,
  onShowBringing,
  onShowAdditionalGuests,
  onShowMessage,
  onShowTime,
  onShowDeclined,
  disabled = false,
}: GuestItemProps) {
  return (
    <tr className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-leaf/15 bg-surface/80 px-4 py-3 shadow-(--shadow) backdrop-blur-sm sm:table-row sm:rounded-none sm:border-0 sm:border-b sm:border-leaf/10 sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none sm:backdrop-blur-none sm:last:border-0">
      <td className="block sm:table-cell sm:px-2 sm:py-3 sm:align-middle">
        <span className="font-bold text-leaf-dark">{guest.name}</span>
      </td>
      {/* "+2" must never break between "+" and the number: the global
          overflow-wrap: anywhere would otherwise let the table squeeze this
          column to one character. */}
      <td className="block whitespace-nowrap sm:table-cell sm:px-2 sm:py-3 sm:align-middle">
        {guest.additionalGuests > 0 ? (
          <button
            type="button"
            onClick={() => onShowAdditionalGuests(guest)}
            disabled={disabled}
            aria-label={`Zusätzliche Personen von ${guest.name} anzeigen`}
            title="Zusätzliche Personen"
            className="flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-current px-0.5 text-xs leading-none font-bold text-leaf transition hover:text-leaf-dark disabled:opacity-50"
          >
            +{guest.additionalGuests}
          </button>
        ) : null}
      </td>
      {guest.declined ? (
        <>
          {/* Instead of the clock, gift and message icons (mobile) and the
              time, "Ich bringe was mit" and message columns (desktop): a
              greyed-out "Abgesagt" that opens the guest's message, if any. */}
          <td className="block sm:hidden">
            <button
              type="button"
              onClick={() => onShowDeclined(guest)}
              disabled={disabled}
              aria-label={`${guest.name} hat abgesagt - anzeigen`}
              title="Abgesagt"
              className="block text-muted transition hover:text-ink disabled:opacity-50"
            >
              <DeclinedIcon />
            </button>
          </td>
          <td colSpan={4} className="hidden sm:table-cell sm:px-2 sm:py-3 sm:align-middle">
            <button
              type="button"
              onClick={() => onShowDeclined(guest)}
              disabled={disabled}
              aria-label={`${guest.name} hat abgesagt - anzeigen`}
              className="mx-auto flex items-center gap-2 font-bold text-muted transition hover:text-ink disabled:opacity-50"
            >
              <DeclinedIcon />
              Abgesagt
            </button>
          </td>
        </>
      ) : (
        <>
          {/* Without the table header (below sm) the two time columns are
              ambiguous, so they collapse into one clock icon that opens a dialog. */}
          <td className="block sm:hidden">
            <button
              type="button"
              onClick={() => onShowTime(guest)}
              disabled={disabled}
              aria-label={`Ankunfts- und Abreisezeit von ${guest.name} anzeigen`}
              title="Ankunfts- und Abreisezeit"
              className="block text-leaf transition hover:text-leaf-dark disabled:opacity-50"
            >
              <ClockIcon />
            </button>
          </td>
          <td className="hidden [overflow-wrap:normal] sm:table-cell sm:px-2 sm:py-3 sm:align-middle font-mono text-base font-semibold tracking-wide text-ink">
            {guest.arrivalTime ? formatTimeWindow(guest.arrivalTime, guest.arrivalEndTime) : null}
          </td>
          <td className="hidden [overflow-wrap:normal] sm:table-cell sm:px-2 sm:py-3 sm:align-middle font-mono text-base font-semibold tracking-wide text-ink">
            {guest.departureTime ? formatTimeWindow(guest.departureTime, guest.departureEndTime) : null}
          </td>
          <td className="block sm:table-cell sm:px-2 sm:py-3 sm:align-middle">
            {guest.bringingSomething ? (
              <button
                type="button"
                onClick={() => onShowBringing(guest)}
                disabled={disabled}
                aria-label={`${guest.name} bringt etwas mit - anzeigen`}
                title="Bringt etwas mit"
                className="block text-leaf transition hover:text-leaf-dark disabled:opacity-50"
              >
                <GiftIcon />
              </button>
            ) : (
              <span className="text-muted/40" aria-label="Bringt nichts mit" title="Bringt nichts mit">
                <GiftIcon />
              </span>
            )}
          </td>
          <td className="block sm:table-cell sm:px-2 sm:py-3 sm:align-middle">
            {guest.hasMessage ? (
              <button
                type="button"
                onClick={() => onShowMessage(guest)}
                disabled={disabled}
                aria-label={`Nachricht von ${guest.name} anzeigen`}
                title="Hat eine Nachricht hinterlassen"
                className="block text-leaf transition hover:text-leaf-dark disabled:opacity-50"
              >
                <MessageIcon />
              </button>
            ) : (
              <span className="text-muted/40" aria-label="Keine Nachricht" title="Keine Nachricht">
                <MessageIcon />
              </span>
            )}
          </td>
        </>
      )}
      <td className="block w-full sm:w-auto sm:table-cell sm:px-2 sm:py-3 sm:align-middle">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-surface"
            aria-label={`${guest.name} bearbeiten`}
            onClick={() => onEdit(guest)}
            disabled={disabled}
          >
            <PencilIcon />
          </Button>
          <Button
            variant="outline-danger"
            size="icon"
            aria-label={`${guest.name} löschen`}
            onClick={() => onDelete(guest)}
            disabled={disabled}
          >
            <TrashIcon />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13 6l3 3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="block">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7.5V12l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeclinedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="block">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
      <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="block">
      <rect x="4" y="9" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <path d="M4 13h16" stroke="currentColor" strokeWidth="2" />
      <path d="M12 9v11" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 9c0-2-1.5-4-3.5-4S6 6.5 6 8s1 1 2 1h4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 9c0-2 1.5-4 3.5-4S18 6.5 18 8s-1 1-2 1h-4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="block">
      <path
        d="M4 5h16v11H8l-4 4V5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 9h8M8 12.5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 7h14M10 11v6M14 11v6M9 7V5h6v2M7 7l1 12h8l1-12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
