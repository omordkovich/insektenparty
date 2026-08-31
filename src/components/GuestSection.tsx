"use client";

import { useCallback, useEffect, useState } from "react";
import type { GuestDto } from "@/lib/types";
import { BringingDetailsDialog } from "./BringingDetailsDialog";
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

type GuestSectionProps = {
  apiBasePath?: string;
};

export function GuestSection({ apiBasePath = "/api/guests" }: GuestSectionProps) {
  const [guests, setGuests] = useState<GuestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(closedModal);
  const [deleteGuest, setDeleteGuest] = useState<GuestDto | null>(null);
  const [bringingGuest, setBringingGuest] = useState<GuestDto | null>(null);

  const refreshGuests = useCallback(async () => {
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

    void (async () => {
      try {
        const data = await fetchGuests(apiBasePath);
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
          onClose={closeModal}
          onSaved={refreshGuests}
        />
      ) : null}

      {deleteGuest ? (
        <DeleteGuestDialog
          key={deleteGuest.id}
          guest={deleteGuest}
          apiBasePath={apiBasePath}
          onClose={() => setDeleteGuest(null)}
          onDeleted={refreshGuests}
        />
      ) : null}

      {bringingGuest ? (
        <BringingDetailsDialog
          key={bringingGuest.id}
          guest={bringingGuest}
          onClose={() => setBringingGuest(null)}
        />
      ) : null}
    </>
  );
}
