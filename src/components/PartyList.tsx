"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "./Button";
import { DeletePartyDialog } from "./DeletePartyDialog";

type PartyListItem = {
  id: string;
  slug: string;
  title: string;
};

type PartyListProps = {
  initialParties: PartyListItem[];
};

export function PartyList({ initialParties }: PartyListProps) {
  const [partyList, setPartyList] = useState(initialParties);
  const [deleteTarget, setDeleteTarget] = useState<PartyListItem | null>(null);

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        {partyList.map((party) => (
          <div key={party.id} className="flex items-center gap-2">
            <Link
              href={`/p/${party.slug}`}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-zinc-300 bg-white px-6 text-base font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              {party.title || "Unbenannte Party"}
            </Link>
            <Link
              href={`/p/${party.slug}/edit`}
              aria-label={`${party.title || "Unbenannte Party"} bearbeiten`}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-leaf/30 font-semibold transition hover:bg-leaf/10"
            >
              <PencilIcon />
            </Link>
            <Button
              variant="outline-danger"
              size="icon"
              aria-label={`${party.title || "Unbenannte Party"} löschen`}
              onClick={() => setDeleteTarget(party)}
            >
              <TrashIcon />
            </Button>
          </div>
        ))}
      </div>

      {deleteTarget ? (
        <DeletePartyDialog
          party={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() =>
            setPartyList((current) => current.filter((p) => p.id !== deleteTarget.id))
          }
        />
      ) : null}
    </>
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
