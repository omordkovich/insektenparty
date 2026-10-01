import Link from "next/link";
import { LEGAL_DOCUMENTS, type LegalDocument } from "@/lib/legal-documents";
import { CookieSettingsLink } from "./CookieSettingsLink";

const PAGE_LINKS: LegalDocument[] = ["privacy", "imprint", "terms", "withdrawal"];

const linkClass = "text-sm text-muted underline underline-offset-2 hover:text-leaf-dark";

// Über uns / Cookies / Datenschutz / Impressum / AGB / Widerruf - must be
// reachable from every page, with or without the "made with" badge above it.
// Legal texts link to their own pages; "Cookies" is a settings dialog, not a
// document, so it stays an overlay.
export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap justify-center gap-x-4 gap-y-1 ${className}`}>
      <Link href="/about" className={linkClass}>
        Über uns
      </Link>
      <CookieSettingsLink />
      {PAGE_LINKS.map((doc) => (
        <Link key={doc} href={LEGAL_DOCUMENTS[doc].href} className={linkClass}>
          {LEGAL_DOCUMENTS[doc].label}
        </Link>
      ))}
    </div>
  );
}
