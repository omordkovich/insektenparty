import type { PartyConfig } from "@/lib/event";

type FooterProps = {
  config: PartyConfig;
};

export function Footer({ config }: FooterProps) {
  return (
    <footer className="page-shell border-t border-leaf/20 py-10 text-center">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-leaf-dark">
        Kontakt
      </h2>
      <p className="mt-3 text-muted">
        {config.contact.name}
        <br />
        Tel. {config.contact.phone}
        <br />
        <a className="underline decoration-leaf/40 underline-offset-4" href={`mailto:${config.contact.email}`}>
          {config.contact.email}
        </a>
      </p>
    </footer>
  );
}
