"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { PRODUCTS, formatPrice } from "@/lib/products";
import { THEME_ASSETS, THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { themePortalTarget } from "./themePortalTarget";

/** What was unlocked: the whole event (or a credit for the event being
 *  created), only the one design, or the event without the badge. */
export type UnlockScope = "event" | "theme" | "no_badge";

type UnlockDialogProps = (
  | {
      /** A free event becomes a paid one. */
      kind: "event";
      eventId: string;
    }
  | {
      /** One paid event credit - for a further event, or for the one being
       *  created (the create dialog then asks for a paid event). */
      kind: "credit";
    }
  | {
      /** A locked design: just this design, or the whole event. With an
       *  eventId the event is upgraded; without one (create dialog) a credit
       *  is bought for the event being created. */
      kind: "theme";
      theme: ThemeKey;
      eventId?: string;
    }
  | {
      kind: "no_badge";
      eventId: string;
    }
) & {
  eventCredits: number;
  dummyPayments: boolean;
  onUnlockedAction: (scope: UnlockScope) => void;
  onCloseAction: () => void;
};

type PurchaseBody =
  | { product: "paid_event" }
  | { product: "event_upgrade"; eventId: string }
  | { product: "theme"; theme: ThemeKey }
  | { product: "no_badge"; eventId: string };

// One way to unlock: what it costs and what the button sends. body null =
// an unused credit is spent by the caller itself (creating a paid event).
type UnlockWay = {
  scope: UnlockScope;
  heading?: string;
  priceCents: number;
  usesCredit: boolean;
  body: PurchaseBody | null;
};

const PAID_EVENT_FEATURES = [
  "Alle Designs",
  "Termin abstimmen lassen",
  "Termin offen lassen",
  "Datum bis 12 Monate im Voraus",
];

const FAILED_ERROR = "Das Freischalten hat nicht geklappt. Bitte versuche es erneut.";

const TITLES: Record<UnlockDialogProps["kind"], string> = {
  event: "Dieses Event freischalten",
  credit: "Event freischalten",
  theme: "Design freischalten",
  no_badge: "Ohne GASTZILLA-Hinweis",
};

// The "Freischalten" dialog behind every locked spot. Until real payments
// exist the button is a dummy purchase (PAYMENTS_DUMMY); an unused event
// credit is always spent first. Portalled to the themed page root so it
// stacks above the dialog it was opened from.
export function UnlockDialog(props: UnlockDialogProps) {
  const { kind, eventCredits, dummyPayments, onUnlockedAction, onCloseAction } = props;
  const router = useRouter();
  const titleId = useId();
  const wayId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasCredit = eventCredits > 0;

  // The whole event: an existing event is upgraded (the server spends a
  // credit first); for the event being created a credit is bought - unless
  // one is left, which the create request then spends.
  const wholeEvent = (eventId: string | undefined): UnlockWay => ({
    scope: "event",
    priceCents: PRODUCTS.paid_event.priceCents,
    usesCredit: hasCredit,
    body: eventId ? { product: "event_upgrade", eventId } : hasCredit ? null : { product: "paid_event" },
  });

  const ways: UnlockWay[] =
    props.kind === "event"
      ? [wholeEvent(props.eventId)]
      : props.kind === "credit"
        ? [wholeEvent(undefined)]
        : props.kind === "theme"
          ? [
              {
                scope: "theme",
                heading: `Nur dieses Design – ${formatPrice(PRODUCTS.theme.priceCents)}`,
                priceCents: PRODUCTS.theme.priceCents,
                usesCredit: false,
                body: { product: "theme", theme: props.theme },
              },
              {
                ...wholeEvent(props.eventId),
                heading: `Ganzes Event freischalten – ${formatPrice(PRODUCTS.paid_event.priceCents)}, alle Designs inklusive`,
              },
            ]
          : [
              {
                scope: "no_badge",
                priceCents: PRODUCTS.no_badge.priceCents,
                usesCredit: false,
                body: { product: "no_badge", eventId: props.eventId },
              },
            ];

  async function unlock(way: UnlockWay) {
    if (busy) return;
    if (!way.body) {
      onCloseAction();
      onUnlockedAction(way.scope);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(way.body),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? FAILED_ERROR);
        setBusy(false);
        return;
      }
      onCloseAction();
      onUnlockedAction(way.scope);
      // Entitlements, plan and badge are all server-rendered props.
      router.refresh();
    } catch {
      setError(FAILED_ERROR);
      setBusy(false);
    }
  }

  function renderAction(way: UnlockWay, describedBy?: string) {
    if (way.usesCredit) {
      return (
        <Button variant="primary" onClick={() => unlock(way)} disabled={busy} aria-describedby={describedBy}>
          {busy ? "Wird freigeschaltet ..." : "Mit vorhandenem Event-Guthaben freischalten"}
        </Button>
      );
    }
    if (dummyPayments) {
      return (
        <Button variant="primary" onClick={() => unlock(way)} disabled={busy} aria-describedby={describedBy}>
          {busy ? "Wird freigeschaltet ..." : "Freischalten (Test, ohne Zahlung)"}
        </Button>
      );
    }
    return <p className="text-sm font-semibold text-muted">Bald verfügbar</p>;
  }

  const creditNote =
    eventCredits === 1
      ? "Du hast ein Event-Guthaben – es wird dafür verbraucht."
      : `Du hast ${eventCredits} Event-Guthaben – eins davon wird dafür verbraucht.`;

  return createPortal(
    <Modal titleId={titleId} onCloseAction={onCloseAction} closeDisabled={busy}>
      <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
        {TITLES[kind]}
      </h2>

      {props.kind === "theme" ? (
        <>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-leaf/20 bg-leaf/5 p-3">
            <Image
              src={THEME_ASSETS[props.theme].logo}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 object-contain"
            />
            <p className="font-semibold text-leaf-dark">{THEME_LABELS[props.theme]}</p>
          </div>
          <div className="mt-4 space-y-3">
            {ways.map((way, index) => (
              <div key={way.scope} className="rounded-2xl border border-leaf/20 p-3">
                <p id={`${wayId}-${index}`} className="text-sm font-bold text-leaf-dark">
                  {way.heading}
                </p>
                {way.scope === "event" ? (
                  <p className="mt-1 text-xs text-muted">{PAID_EVENT_FEATURES.join(" · ")}</p>
                ) : (
                  <p className="mt-1 text-xs text-muted">Für alle deine Events nutzbar.</p>
                )}
                {way.usesCredit ? <p className="mt-1 text-xs text-muted">{creditNote}</p> : null}
                <div className="mt-3">{renderAction(way, `${wayId}-${index}`)}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {kind === "no_badge" ? (
            <p className="mt-4 text-sm">
              Das Logo „made with Gastzilla“ unten auf deiner Event-Seite verschwindet – für alle
              Besucher. Teilen-Buttons und die Links zu Impressum, Datenschutz und AGB bleiben.
            </p>
          ) : (
            <>
              <p className="mt-4 text-sm">Ein freigeschaltetes Event kann mehr:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {PAID_EVENT_FEATURES.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-4 text-lg font-bold text-leaf-dark">
            {formatPrice(ways[0].priceCents)}
            <span className="text-sm font-normal text-muted"> pro Event</span>
          </p>
          {ways[0].usesCredit ? <p className="mt-1 text-sm text-muted">{creditNote}</p> : null}
        </>
      )}

      <p className="mt-4 text-xs text-muted">Testphase – es wird nichts berechnet.</p>

      {error ? (
        <p className="mt-4 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Button variant="outline" onClick={onCloseAction} disabled={busy}>
          Abbrechen
        </Button>
        {props.kind === "theme" ? null : renderAction(ways[0])}
      </div>
    </Modal>,
    themePortalTarget(),
  );
}
