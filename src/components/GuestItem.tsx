import type { GuestDto } from "@/lib/types";
import { Button } from "./Button";

type GuestItemProps = {
  guest: GuestDto;
  onEdit: (guest: GuestDto) => void;
  onDelete: (guest: GuestDto) => void;
  onShowBringing: (guest: GuestDto) => void;
  disabled?: boolean;
};

export function GuestItem({
  guest,
  onEdit,
  onDelete,
  onShowBringing,
  disabled = false,
}: GuestItemProps) {
  return (
    <tr className="border-b border-leaf/10 last:border-0">
      <td className="px-2 py-3 align-middle">
        <span className="font-bold text-leaf-dark">{guest.name}</span>
      </td>
      <td className="px-2 py-3 align-middle text-sm font-semibold text-honey-dark">
        {guest.additionalGuests > 0 ? `+${guest.additionalGuests}` : null}
      </td>
      <td className="px-2 py-3 align-middle font-mono text-base font-semibold tracking-wide text-ink">
        {guest.arrivalTime}
      </td>
      <td className="px-2 py-3 align-middle">
        {guest.bringingSomething ? (
          <button
            type="button"
            onClick={() => onShowBringing(guest)}
            disabled={disabled}
            className="font-bold text-leaf underline underline-offset-2 hover:text-leaf-dark disabled:opacity-50"
          >
            JA
          </button>
        ) : (
          <span className="text-muted">NEIN</span>
        )}
      </td>
      <td className="px-2 py-3 align-middle">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-white"
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
