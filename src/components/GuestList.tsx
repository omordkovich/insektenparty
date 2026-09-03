import type { GuestDto } from "@/lib/types";
import { Button } from "./Button";
import { GuestItem } from "./GuestItem";

type GuestListProps = {
  guests: GuestDto[];
  loading: boolean;
  error: string | null;
  onAdd: () => void;
  onEdit: (guest: GuestDto) => void;
  onDelete: (guest: GuestDto) => void;
  onShowBringing: (guest: GuestDto) => void;
  onShowAdditionalGuests: (guest: GuestDto) => void;
  onShowMessage: (guest: GuestDto) => void;
  actionsDisabled?: boolean;
};

export function GuestList({
  guests,
  loading,
  error,
  onAdd,
  onEdit,
  onDelete,
  onShowBringing,
  onShowAdditionalGuests,
  onShowMessage,
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
            <Button variant="primary" size="lg" onClick={onAdd} className="mt-6">
              + Gast hinzufügen
            </Button>
          </div>
        ) : null}

        {!loading && !error && guests.length > 0 ? (
          <>
            <div className="mt-8">
              <table className="w-full border-collapse text-left">
                <thead className="hidden sm:table-header-group">
                  <tr className="border-b border-leaf/20 text-sm font-bold text-leaf-dark">
                    <th className="px-2 py-2 font-bold">Name:</th>
                    <th className="px-2 py-2" aria-hidden="true" />
                    <th className="px-2 py-2 font-bold">Ankunftszeit</th>
                    <th className="px-2 py-2 font-bold">Ich bringe was mit</th>
                    <th className="px-2 py-2 font-bold">Nachricht</th>
                    <th className="px-2 py-2" aria-hidden="true" />
                  </tr>
                </thead>
                <tbody className="block space-y-3 sm:table-row-group sm:space-y-0">
                  {guests.map((guest) => (
                    <GuestItem
                      key={guest.id}
                      guest={guest}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onShowBringing={onShowBringing}
                      onShowAdditionalGuests={onShowAdditionalGuests}
                      onShowMessage={onShowMessage}
                      disabled={actionsDisabled}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-center">
              <Button variant="secondary" size="lg" onClick={onAdd} disabled={actionsDisabled}>
                + Gast hinzufügen
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
