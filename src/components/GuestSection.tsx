"use client";

import { useCallback, useEffect, useState } from "react";
import type { GuestDto } from "@/lib/types";
import { DeleteGuestDialog } from "./DeleteGuestDialog";
import { GuestList } from "./GuestList";
import { GuestModal, type GuestModalMode } from "./GuestModal";

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

async function fetchGuests(): Promise<GuestDto[]> {
  const response = await fetch("/api/guests", { cache: "no-store" });
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

export function GuestSection() {
  const [guests, setGuests] = useState<GuestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(closedModal);
  const [deleteGuest, setDeleteGuest] = useState<GuestDto | null>(null);

  const refreshGuests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGuests();
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
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchGuests();
        if (cancelled) return;
        setGuests(data);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setGuests([]);
        setError(
          err instanceof Error
            ? err.message
            : "Die Gästeliste konnte nicht geladen werden.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
          onClose={closeModal}
          onSaved={refreshGuests}
        />
      ) : null}

      {deleteGuest ? (
        <DeleteGuestDialog
          key={deleteGuest.id}
          guest={deleteGuest}
          onClose={() => setDeleteGuest(null)}
          onDeleted={refreshGuests}
        />
      ) : null}
    </>
  );
}
