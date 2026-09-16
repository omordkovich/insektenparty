"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { THEME_ASSETS, type ThemeKey } from "@/lib/theme-presets";
import { Button } from "./Button";
import { DeletePartyDialog } from "./DeletePartyDialog";
import { EventDialog } from "./EventDialog";

type PartyListItem = {
  id: string;
  slug: string;
  title: string;
  theme: ThemeKey;
};

type PartyListProps = {
  initialParties: PartyListItem[];
};

export function PartyList({ initialParties }: PartyListProps) {
  const [partyList, setPartyList] = useState(initialParties);
  const [editTarget, setEditTarget] = useState<PartyListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PartyListItem | null>(null);

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        {partyList.map((party) => (
          <div key={party.id} className="flex items-center gap-2">
            <Image
              src={THEME_ASSETS[party.theme].logo}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full object-contain"
            />
            <Link
              href={`/p/${party.slug}`}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-zinc-300 bg-white px-6 text-base font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              {party.title || "Unbenanntes Event"}
            </Link>
            <Button
              variant="outline"
              size="icon"
              aria-label={`${party.title || "Unbenanntes Event"} bearbeiten`}
              onClick={() => setEditTarget(party)}
            >
              <PencilIcon />
            </Button>
            <Button
              variant="outline-danger"
              size="icon"
              aria-label={`${party.title || "Unbenanntes Event"} löschen`}
              onClick={() => setDeleteTarget(party)}
            >
              <TrashIcon />
            </Button>
          </div>
        ))}
      </div>

      {editTarget ? (
        <EventDialog
          mode="edit"
          event={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={(updated) =>
            setPartyList((current) =>
              current.map((p) => (p.id === editTarget.id ? { ...p, ...updated } : p)),
            )
          }
        />
      ) : null}

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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
