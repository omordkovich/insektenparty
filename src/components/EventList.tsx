"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { THEME_ASSETS, type ThemeKey } from "@/lib/theme-presets";
import { Button } from "./Button";
import { CreateEventButton } from "./CreateEventButton";
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
      <section className="mx-auto w-full max-w-xl">
        <div className="rounded-[2rem] border border-leaf/20 bg-[var(--surface)] p-5 shadow-(--shadow) sm:p-8">
          <h2 className="text-center font-display text-3xl text-leaf-dark sm:text-4xl">
            Meine Events
          </h2>

          {eventList.length === 0 ? (
            <div className="mt-8 text-center">
              <p className="text-lg text-muted">Du hast noch keine Events erstellt.</p>
              <p className="mt-1 text-xl font-bold text-leaf-dark">Leg direkt los!</p>
              <div className="mt-6 flex justify-center">
                <CreateEventButton />
              </div>
            </div>
          ) : (
            <>
              <ul className="mt-8 space-y-3">
                {eventList.map((event) => (
                  <li
                    key={event.id}
                    className="flex items-center gap-3 rounded-2xl border border-leaf/15 bg-white/80 px-4 py-3 shadow-(--shadow) backdrop-blur-sm transition-all duration-500 ease-in-out hover:scale-[1.03] hover:border-leaf/30 hover:bg-white hover:shadow-lg hover:brightness-105 active:scale-[0.97] active:brightness-90 active:duration-150"
                  >
                    <Link
                      href={`/p/${event.slug}`}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <Image
                        src={THEME_ASSETS[event.theme].logo}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded-full object-contain"
                      />
                      <span className="min-w-0 flex-1 truncate text-base font-bold text-leaf-dark">
                        {event.title || "Unbenanntes Event"}
                      </span>
                    </Link>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-white"
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
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex justify-center">
                <CreateEventButton />
              </div>
            </>
          )}
        </div>
      </section>

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
