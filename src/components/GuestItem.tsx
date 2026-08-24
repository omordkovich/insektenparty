import type { GuestDto } from "@/lib/types";

type GuestItemProps = {
  guest: GuestDto;
  onEdit: (guest: GuestDto) => void;
  onDelete: (guest: GuestDto) => void;
  disabled?: boolean;
};

export function GuestItem({
  guest,
  onEdit,
  onDelete,
  disabled = false,
}: GuestItemProps) {
  return (
    <li className="rounded-2xl border border-leaf/15 bg-white/80 px-4 py-3 shadow-[var(--shadow)] backdrop-blur-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
          <span className="truncate text-lg font-bold text-leaf-dark">
            {guest.name}
          </span>
          {guest.additionalGuests > 0 ? (
            <span className="text-sm font-semibold text-honey-dark sm:min-w-12">
              +{guest.additionalGuests}
            </span>
          ) : (
            <span className="hidden sm:inline sm:min-w-12" aria-hidden="true" />
          )}
          <span className="font-mono text-base font-semibold tracking-wide text-ink">
            {guest.arrivalTime}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-leaf/30 bg-white text-leaf-dark transition hover:bg-leaf/10 disabled:opacity-50"
            aria-label={`${guest.name} bearbeiten`}
            onClick={() => onEdit(guest)}
            disabled={disabled}
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-danger/30 bg-white text-danger transition hover:bg-red-50 disabled:opacity-50"
            aria-label={`${guest.name} löschen`}
            onClick={() => onDelete(guest)}
            disabled={disabled}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </li>
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
