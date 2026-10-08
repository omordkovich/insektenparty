import { useId, type ReactNode } from "react";
import type { GuestDto } from "@/lib/types";
import { formatTimeWindow } from "@/lib/validation";
import { Modal } from "./Modal";

type TimeDetailsDialogProps = {
  guest: GuestDto;
  onCloseAction: () => void;
};

export function TimeDetailsDialog({ guest, onCloseAction }: TimeDetailsDialogProps) {
  const titleId = useId();

  return (
    <Modal titleId={titleId} onCloseAction={onCloseAction}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
        Zeiten von {guest.name}
      </h2>

      <dl className="mt-4 space-y-3">
        {guest.arrivalTime ? (
          <TimeRow icon={<DoorInIcon />} label="Ankunftszeit">
            {formatTimeWindow(guest.arrivalTime, guest.arrivalEndTime)}
          </TimeRow>
        ) : null}
        {guest.departureTime ? (
          <TimeRow icon={<DoorOutIcon />} label="Bleibt bis">
            {formatTimeWindow(guest.departureTime, guest.departureEndTime)}
          </TimeRow>
        ) : null}
      </dl>
    </Modal>
  );
}

function TimeRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-leaf/15 bg-surface/80 px-3 py-2">
      <span className="text-leaf" aria-hidden="true">
        {icon}
      </span>
      <div>
        <dt className="text-sm font-bold text-leaf-dark">{label}</dt>
        <dd className="[overflow-wrap:normal] font-mono text-base font-semibold tracking-wide text-ink">
          {children}
        </dd>
      </div>
    </div>
  );
}

function DoorInIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 4h4a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 18 20h-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 12H12M9 8.5 12.5 12 9 15.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DoorOutIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10 4H6a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 6 20h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 12h10.5M17.5 8.5 21 12l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
