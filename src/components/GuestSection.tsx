"use client";

import { useCallback, useEffect, useState } from "react";
import { isIdle, shouldPoll } from "@/lib/polling";
import type { GuestDto } from "@/lib/types";
import { AdditionalGuestsDialog } from "./AdditionalGuestsDialog";
import { BringingDetailsDialog } from "./BringingDetailsDialog";
import { DeleteGuestDialog } from "./DeleteGuestDialog";
import { GuestList } from "./GuestList";
import { GuestModal, type GuestModalMode } from "./GuestModal";
import { MessageDetailsDialog } from "./MessageDetailsDialog";

type ModalState = {
  isOpen: boolean;
  mode: GuestModalMode;
  selectedGuest: GuestDto | null;
};

const closedModal: ModalState = {
  isOpen: false,
  mode: "create",
  selectedGuest: null,
};

async function fetchGuests(apiBasePath: string): Promise<GuestDto[]> {
  const response = await fetch(apiBasePath, { cache: "no-store" });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(
      payload?.error ?? "Die Gästeliste konnte nicht geladen werden.",
    );
  }
  return (await response.json()) as GuestDto[];
}

// How often to poll for guest-list changes made by other visitors. Kept
// simple (plain polling) rather than Supabase Realtime since traffic here is
// low - a websocket subscription would be instant but isn't worth the setup
// cost for an event guest list.
const POLL_INTERVAL_MS = 30_000;
// Polling pauses after this long without any interaction, so tabs left open
// in the background stop sending requests; the next interaction (or the tab
// becoming visible again) refreshes immediately.
const IDLE_AFTER_MS = 10 * 60_000;
const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"] as const;

type GuestSectionProps = {
  apiBasePath: string;
  defaultArrivalTime?: string;
  isOwner?: boolean;
};

export function GuestSection({
  apiBasePath,
  defaultArrivalTime = "09:00",
  isOwner = false,
}: GuestSectionProps) {
  const [guests, setGuests] = useState<GuestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(closedModal);
  const [deleteGuest, setDeleteGuest] = useState<GuestDto | null>(null);
  const [bringingGuest, setBringingGuest] = useState<GuestDto | null>(null);
  const [additionalGuestsGuest, setAdditionalGuestsGuest] =
    useState<GuestDto | null>(null);
  const [messageGuest, setMessageGuest] = useState<GuestDto | null>(null);

  // Used for user-triggered refreshes (after save/delete), where showing the
  // loading spinner and any error banner is the desired feedback.
  const loadGuests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGuests(apiBasePath);
      setGuests(data);
    } catch (err) {
      setGuests([]);
      setError(
        err instanceof Error
          ? err.message
          : "Die Gästeliste konnte nicht geladen werden.",
      );
    } finally {
      setLoading(false);
    }
  }, [apiBasePath]);

  useEffect(() => {
    let cancelled = false;

    void fetchGuests(apiBasePath)
      .then((data) => {
        if (cancelled) return;
        setGuests(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setGuests([]);
        setError(
          err instanceof Error
            ? err.message
            : "Die Gästeliste konnte nicht geladen werden.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiBasePath]);

  // Background poll: silently re-fetches and swaps in the new list, without
  // touching the loading/error state, so a visitor who left the tab open
  // sees new entries without a manual refresh. Failures are ignored - the
  // currently-displayed list just stays as-is until the next successful poll.
  // Only polls while someone is looking (see shouldPoll).
  useEffect(() => {
    let lastActivity = Date.now();
    let lastFetch = Date.now();
    const isVisible = () => document.visibilityState === "visible";

    function refresh() {
      lastFetch = Date.now();
      void fetchGuests(apiBasePath)
        .then((data) => setGuests(data))
        .catch(() => {});
    }

    const interval = setInterval(() => {
      if (shouldPoll({ visible: isVisible(), now: Date.now(), lastActivity, idleAfterMs: IDLE_AFTER_MS })) {
        refresh();
      }
    }, POLL_INTERVAL_MS);

    // Back after a pause: refresh at once if the list may be stale.
    function onActivity() {
      const now = Date.now();
      const wasIdle = isIdle({ now, lastActivity, idleAfterMs: IDLE_AFTER_MS });
      lastActivity = now;
      if (wasIdle && now - lastFetch > POLL_INTERVAL_MS) refresh();
    }
    function onVisibilityChange() {
      if (!isVisible()) return;
      lastActivity = Date.now();
      if (Date.now() - lastFetch > POLL_INTERVAL_MS) refresh();
    }

    for (const type of ACTIVITY_EVENTS) {
      window.addEventListener(type, onActivity, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      for (const type of ACTIVITY_EVENTS) window.removeEventListener(type, onActivity);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [apiBasePath]);

  function openCreate() {
    setModal({
      isOpen: true,
      mode: "create",
      selectedGuest: null,
    });
  }

  function openEdit(guest: GuestDto) {
    setModal({
      isOpen: true,
      mode: "edit",
      selectedGuest: guest,
    });
  }

  function closeModal() {
    setModal(closedModal);
  }

  return (
    <>
      <GuestList
        guests={guests}
        loading={loading}
        error={error}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={setDeleteGuest}
        onShowBringing={setBringingGuest}
        onShowAdditionalGuests={setAdditionalGuestsGuest}
        onShowMessage={setMessageGuest}
      />

      {modal.isOpen ? (
        <GuestModal
          key={
            modal.mode === "edit" && modal.selectedGuest
              ? `edit-${modal.selectedGuest.id}`
              : "create"
          }
          mode={modal.mode}
          guest={modal.selectedGuest}
          apiBasePath={apiBasePath}
          defaultArrivalTime={defaultArrivalTime}
          isOwner={isOwner}
          onClose={closeModal}
          onSaved={loadGuests}
        />
      ) : null}

      {deleteGuest ? (
        <DeleteGuestDialog
          key={deleteGuest.id}
          guest={deleteGuest}
          apiBasePath={apiBasePath}
          isOwner={isOwner}
          onCloseAction={() => setDeleteGuest(null)}
          onDeletedAction={loadGuests}
        />
      ) : null}

      {bringingGuest ? (
        <BringingDetailsDialog
          key={bringingGuest.id}
          guest={bringingGuest}
          onCloseAction={() => setBringingGuest(null)}
        />
      ) : null}

      {additionalGuestsGuest ? (
        <AdditionalGuestsDialog
          key={additionalGuestsGuest.id}
          guest={additionalGuestsGuest}
          onCloseAction={() => setAdditionalGuestsGuest(null)}
        />
      ) : null}

      {messageGuest ? (
        <MessageDetailsDialog
          key={messageGuest.id}
          guest={messageGuest}
          onCloseAction={() => setMessageGuest(null)}
        />
      ) : null}
    </>
  );
}
