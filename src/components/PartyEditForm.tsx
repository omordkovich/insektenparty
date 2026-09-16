"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Party } from "@/db/schema";
import { normalizeArrivalTime, validatePartyInput } from "@/lib/validation";
import { Button } from "./Button";

type PartyEditFormProps = {
  party: Party;
};

const inputBase =
  "w-full rounded-lg bg-transparent text-center focus:bg-white/60 focus:outline-none";

export function PartyEditForm({ party }: PartyEditFormProps) {
  const router = useRouter();

  const kickerRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const greetingRef = useRef<HTMLTextAreaElement>(null);
  const dateLabelRef = useRef<HTMLInputElement>(null);
  const timeLabelRef = useRef<HTMLInputElement>(null);
  const locationLabelRef = useRef<HTMLInputElement>(null);
  const contactNameRef = useRef<HTMLInputElement>(null);
  const contactPhoneRef = useRef<HTMLInputElement>(null);
  const contactEmailRef = useRef<HTMLInputElement>(null);
  const defaultArrivalTimeRef = useRef<HTMLInputElement>(null);
  const eventDateRef = useRef<HTMLInputElement>(null);
  const eventStartTimeRef = useRef<HTMLInputElement>(null);
  const eventEndTimeRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goBackToParty() {
    router.push(`/p/${party.slug}`);
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setError(null);

    const payload = {
      kicker: kickerRef.current?.value ?? "",
      title: titleRef.current?.value ?? "",
      greeting: greetingRef.current?.value ?? "",
      dateLabel: dateLabelRef.current?.value ?? "",
      timeLabel: timeLabelRef.current?.value ?? "",
      locationLabel: locationLabelRef.current?.value ?? "",
      defaultArrivalTime: defaultArrivalTimeRef.current?.value ?? "",
      eventDate: eventDateRef.current?.value || null,
      eventStartTime: eventStartTimeRef.current?.value || null,
      eventEndTime: eventEndTimeRef.current?.value || null,
      contactName: contactNameRef.current?.value ?? "",
      contactPhone: contactPhoneRef.current?.value ?? "",
      contactEmail: contactEmailRef.current?.value ?? "",
    };

    const validation = validatePartyInput(payload);
    if (!validation.ok) {
      setError(validation.error);
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/parties/${party.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(
          body?.error ?? "Die Party konnte nicht gespeichert werden. Bitte versuche es erneut.",
        );
        setSaving(false);
        return;
      }

      const { slug } = (await response.json()) as { slug: string };
      router.push(`/p/${slug}`);
    } catch {
      setError("Die Party konnte nicht gespeichert werden. Bitte versuche es erneut.");
      setSaving(false);
    }
  }

  return (
    <>
      <section className="page-shell relative py-6">
        <div className="rounded-[2rem] border border-leaf/20 bg-[var(--surface)] p-5 text-center shadow-[var(--shadow)] sm:p-8">
          <input
            ref={kickerRef}
            defaultValue={party.kicker}
            placeholder="z. B. Kindergeburtstag"
            disabled={saving}
            className={`${inputBase} mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-honey-dark placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-honey-dark/40`}
          />
          <input
            ref={titleRef}
            defaultValue={party.title}
            placeholder="Titel deiner Party"
            disabled={saving}
            className={`${inputBase} font-[family-name:var(--font-display)] text-[clamp(1.5rem,9vw,3rem)] leading-none text-leaf-dark placeholder:text-leaf-dark/30 sm:text-6xl md:text-7xl`}
          />
          <textarea
            ref={greetingRef}
            defaultValue={party.greeting}
            placeholder="Begrüßungstext für deine Gäste"
            disabled={saving}
            rows={2}
            className={`${inputBase} mx-auto mt-5 max-w-2xl resize-none text-lg text-muted placeholder:text-muted/40 sm:text-xl`}
          />

          <dl className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-3 sm:text-center">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-leaf">Datum</dt>
              <dd className="mt-1">
                <input
                  ref={dateLabelRef}
                  defaultValue={party.dateLabel}
                  placeholder="z. B. Sonntag, 13. September 2026"
                  disabled={saving}
                  className={`${inputBase} font-semibold placeholder:font-normal placeholder:text-muted/40 sm:text-center`}
                />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-leaf">Uhrzeit</dt>
              <dd className="mt-1">
                <input
                  ref={timeLabelRef}
                  defaultValue={party.timeLabel}
                  placeholder="z. B. ab 09:30 Uhr"
                  disabled={saving}
                  className={`${inputBase} font-semibold placeholder:font-normal placeholder:text-muted/40 sm:text-center`}
                />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-leaf">Ort</dt>
              <dd className="mt-1">
                <input
                  ref={locationLabelRef}
                  defaultValue={party.locationLabel}
                  placeholder="Adresse oder Ort der Feier"
                  disabled={saving}
                  className={`${inputBase} font-semibold placeholder:font-normal placeholder:text-muted/40 sm:text-center`}
                />
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="page-shell py-6">
        <div className="rounded-[2rem] border border-leaf/20 bg-[var(--surface)] p-5 text-center shadow-[var(--shadow)] sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-leaf-dark">
            Kontakt
          </h2>
          <div className="mx-auto mt-3 max-w-sm space-y-2 text-muted">
            <input
              ref={contactNameRef}
              defaultValue={party.contactName}
              placeholder="Dein Name"
              disabled={saving}
              className={inputBase}
            />
            <input
              ref={contactPhoneRef}
              defaultValue={party.contactPhone}
              placeholder="Telefonnummer"
              disabled={saving}
              className={inputBase}
            />
            <input
              ref={contactEmailRef}
              defaultValue={party.contactEmail}
              placeholder="E-Mail-Adresse"
              disabled={saving}
              className={inputBase}
            />
          </div>
        </div>
      </section>

      <section className="page-shell py-6">
        <div className="rounded-[2rem] border border-leaf/15 bg-white/60 p-5 text-left sm:p-8">
          <p className="font-bold text-leaf-dark">Termin für den Kalender-Link</p>
          <p className="mt-1 text-sm text-muted">
            Optional — wird für den klickbaren &bdquo;Datum&ldquo;-Link verwendet
            (&bdquo;Zum Kalender hinzufügen&ldquo;). Ohne diese Angaben zeigt die Seite
            nur den Datumstext oben an.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-sm font-bold">
              Datum
              <input
                ref={eventDateRef}
                type="date"
                defaultValue={party.eventDate ?? ""}
                disabled={saving}
                className="mt-1 w-full rounded-xl border border-leaf/25 bg-white px-3 py-2 font-normal"
              />
            </label>
            <label className="text-sm font-bold">
              Start
              <input
                ref={eventStartTimeRef}
                type="time"
                defaultValue={
                  party.eventStartTime ? normalizeArrivalTime(party.eventStartTime) : ""
                }
                disabled={saving}
                className="mt-1 w-full rounded-xl border border-leaf/25 bg-white px-3 py-2 font-normal"
              />
            </label>
            <label className="text-sm font-bold">
              Ende
              <input
                ref={eventEndTimeRef}
                type="time"
                defaultValue={
                  party.eventEndTime ? normalizeArrivalTime(party.eventEndTime) : ""
                }
                disabled={saving}
                className="mt-1 w-full rounded-xl border border-leaf/25 bg-white px-3 py-2 font-normal"
              />
            </label>
          </div>

          <label className="mt-4 block text-sm font-bold">
            Standard-Ankunftszeit (für neue Gäste vorausgefüllt)
            <input
              ref={defaultArrivalTimeRef}
              type="time"
              defaultValue={party.defaultArrivalTime}
              disabled={saving}
              className="mt-1 w-full max-w-[10rem] rounded-xl border border-leaf/25 bg-white px-3 py-2 font-normal"
            />
          </label>
        </div>
      </section>

      {error ? (
        <div className="page-shell">
          <p className="text-center text-sm text-danger" role="alert">
            {error}
          </p>
        </div>
      ) : null}

      <div className="page-shell flex flex-col-reverse justify-center gap-2 py-6 sm:flex-row">
        <Button variant="outline" onClick={goBackToParty} disabled={saving}>
          Abbrechen
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Wird gespeichert ..." : "Speichern"}
        </Button>
      </div>
    </>
  );
}
