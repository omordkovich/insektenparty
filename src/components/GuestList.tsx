import type { GuestDto } from "@/lib/types";
import { GuestItem } from "./GuestItem";

type GuestListProps = {
  guests: GuestDto[];
  loading: boolean;
  error: string | null;
  onAdd: () => void;
  onEdit: (guest: GuestDto) => void;
  onDelete: (guest: GuestDto) => void;
  actionsDisabled?: boolean;
};

export function GuestList({
  guests,
  loading,
  error,
  onAdd,
  onEdit,
  onDelete,
  actionsDisabled = false,
}: GuestListProps) {
  return (
    <section className="page-shell py-6" aria-labelledby="guest-heading">
      <div className="rounded-[2rem] border border-leaf/20 bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8">
        <h2
          id="guest-heading"
          className="text-center font-[family-name:var(--font-display)] text-3xl text-leaf-dark sm:text-4xl"
        >
          Wer kommt zur Party?
        </h2>

        {loading ? (
          <p className="mt-8 text-center text-muted" role="status">
            Gästeliste wird geladen ...
          </p>
        ) : null}

        {!loading && error ? (
          <p className="mt-8 text-center text-danger" role="alert">
            {error}
          </p>
        ) : null}

        {!loading && !error && guests.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-lg text-muted">Noch hat sich niemand eingetragen.</p>
            <p className="mt-1 text-xl font-bold text-leaf-dark">Sei der Erste!</p>
            <button
              type="button"
              onClick={onAdd}
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-leaf px-6 text-base font-bold text-white transition hover:bg-leaf-dark"
            >
              + Gast hinzufügen
            </button>
          </div>
        ) : null}

        {!loading && !error && guests.length > 0 ? (
          <>
            <ul className="mt-8 space-y-3">
              {guests.map((guest) => (
                <GuestItem
                  key={guest.id}
                  guest={guest}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  disabled={actionsDisabled}
                />
              ))}
            </ul>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={onAdd}
                disabled={actionsDisabled}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-honey px-6 text-base font-bold text-leaf-dark transition hover:bg-honey-dark hover:text-white disabled:opacity-50"
              >
                + Gast hinzufügen
              </button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
