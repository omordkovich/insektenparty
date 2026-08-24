import { eventConfig } from "@/lib/event";

export function Header() {
  return (
    <header className="page-shell flex items-center justify-between gap-4 pt-6 pb-4">
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-leaf/50 bg-white/70 text-xs font-bold uppercase tracking-wide text-leaf"
        aria-hidden="true"
      >

      </div>
      <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-leaf-dark sm:text-3xl">
        {eventConfig.brand}
      </p>
    </header>
  );
}
