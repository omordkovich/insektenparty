"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { LOCALE_NAMES, LOCALES, type Locale } from "@/i18n/config";
import { rememberLocale } from "@/i18n/locale-cookie";
import { usePathname } from "@/i18n/navigation";
import { languageSwitchHref } from "@/i18n/switch-url";

type LanguageSwitcherProps = {
  /** Signed in: the choice is also saved to the account (all devices, mails). */
  signedIn: boolean;
};

// Top-right language menu (next to the account button). Not shown on event
// pages - those always use the event's language.
export function LanguageSwitcher({ signedIn }: LanguageSwitcherProps) {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    itemRefs.current[LOCALES.indexOf(locale)]?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, locale]);

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  async function choose(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    rememberLocale(next);
    if (signedIn) {
      // Best effort, but awaited (at most a few seconds): the page load
      // below would cancel the request.
      await Promise.race([
        import("@/lib/supabase/client")
          .then(({ createClient }) => createClient().auth.updateUser({ data: { locale: next } }))
          .catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
    }
    // A full page load, not a client-side route change: the new language
    // replaces the whole <html> frame, and React would re-create its inline
    // consent script in the browser (dev warning "Encountered a script tag").
    window.location.assign(languageSwitchHref(pathname, window.location.search + window.location.hash, next));
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = itemRefs.current.findIndex((item) => item === document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      itemRefs.current[(current + step + LOCALES.length) % LOCALES.length]?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={t("language")}
        title={t("language")}
        className="flex h-11 w-11 items-center justify-center gap-1.5 rounded-full border border-leaf/30 bg-[var(--surface)] text-sm sm:w-auto sm:px-3 font-bold text-leaf-dark shadow-(--shadow) transition hover:bg-leaf/10"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        {/* Phones: globe only, so it fits beside the logo. */}
        <span className="hidden sm:inline">{locale.toUpperCase()}</span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={t("language")}
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 top-full z-50 mt-2 min-w-40 overflow-hidden rounded-2xl border border-leaf/20 bg-[var(--surface)] py-1 shadow-(--shadow)"
        >
          {LOCALES.map((option, index) => (
            <button
              key={option}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              type="button"
              role="menuitemradio"
              aria-checked={option === locale}
              lang={option}
              onClick={() => void choose(option)}
              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-base text-zinc-800 transition hover:bg-leaf/10 focus:bg-leaf/10 focus:outline-none"
            >
              <span className={option === locale ? "font-bold text-leaf-dark" : undefined}>{LOCALE_NAMES[option]}</span>
              {option === locale ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-leaf-dark">
                  <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
