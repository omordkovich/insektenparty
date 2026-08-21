import { eventConfig } from "@/lib/event";

export function Footer() {
  return (
    <footer className="page-shell border-t border-leaf/20 py-10 text-center">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-leaf-dark">
        Kontakt
      </h2>
      <p className="mt-3 text-muted">
        {eventConfig.contact.name}
        <br />
        Tel. {eventConfig.contact.phone}
        <br />
        <a className="underline decoration-leaf/40 underline-offset-4" href={`mailto:${eventConfig.contact.email}`}>
          {eventConfig.contact.email}
        </a>
      </p>
    </footer>
  );
}
