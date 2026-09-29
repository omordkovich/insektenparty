import { CookieSettingsLink } from "./CookieSettingsLink";
import { LegalLink } from "./LegalLink";

// Cookies / Datenschutz / Impressum / AGB / Widerruf - must be reachable
// from every page, with or without the "made with" badge above it.
export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap justify-center gap-x-4 gap-y-1 ${className}`}>
      <CookieSettingsLink />
      <LegalLink document="privacy" />
      <LegalLink document="imprint" />
      <LegalLink document="terms" />
      <LegalLink document="withdrawal" />
    </div>
  );
}
