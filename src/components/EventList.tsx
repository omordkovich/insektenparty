"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { THEME_ASSETS, type ThemeKey } from "@/lib/theme-presets";
import { Button } from "./Button";
import { DeleteEventDialog } from "./DeleteEventDialog";
import { EventDialog } from "./EventDialog";

type EventListItem = {
  id: string;
  slug: string;
  title: string;
  theme: ThemeKey;
};

type EventListProps = {
  initialEvents: EventListItem[];
};

export function EventList({ initialEvents }: EventListProps) {
  const [eventList, setEventList] = useState(initialEvents);
  const [editTarget, setEditTarget] = useState<EventListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventListItem | null>(null);

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        {eventList.map((event) => (
          <div key={event.id} className="flex items-center gap-2">
            <Image
              src={THEME_ASSETS[event.theme].logo}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full object-contain"
            />
            <Link
              href={`/p/${event.slug}`}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-zinc-300 bg-white px-6 text-base font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
            >
              {event.title || "Unbenanntes Event"}
            </Link>
            <Button
              variant="outline"
              size="icon"
              aria-label={`${event.title || "Unbenanntes Event"} bearbeiten`}
              onClick={() => setEditTarget(event)}
            >
              <PencilIcon />
            </Button>
            <Button
              variant="outline-danger"
              size="icon"
              aria-label={`${event.title || "Unbenanntes Event"} löschen`}
              onClick={() => setDeleteTarget(event)}
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
          onCloseAction={() => setEditTarget(null)}
          onSavedAction={(updated) =>
            setEventList((current) =>
              current.map((e) => (e.id === editTarget.id ? { ...e, ...updated } : e)),
            )
          }
        />
      ) : null}

      {deleteTarget ? (
        <DeleteEventDialog
          event={deleteTarget}
          onCloseAction={() => setDeleteTarget(null)}
          onDeletedAction={() =>
            setEventList((current) => current.filter((e) => e.id !== deleteTarget.id))
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
