"use client";

import { DATE_MODES, POLL_MAX_OPTIONS, formatPollOptionLabel, sameProposal, type DateMode } from "@/lib/date-poll";
import { emptyRow, type DateDraft, type DateSettings, type ProposalRow } from "@/lib/date-poll-form";
import { Button } from "./Button";

type DateModeFieldsProps = {
  original: DateSettings | null;
  draft: DateDraft;
  onChange: (draft: DateDraft) => void;
  disabled?: boolean;
};

const MODE_LABELS: Record<DateMode, string> = {
  unknown: "Noch kein Termin bekannt",
  poll: "Termin abstimmen lassen",
  fixed: "Fester Termin",
};

const inputClass = "w-full min-w-0 rounded-xl border border-leaf/25 bg-surface px-2 py-2 text-sm";
const boxClass = "mt-3 space-y-3 rounded-xl border border-leaf/15 bg-leaf/5 p-3";

// The "Termin" dialog on the owner's event page: no date yet, a poll (new,
// running or restarted) or a fixed date - see lib/date-poll-form.ts.
export function DateModeFields({ original, draft, onChange, disabled = false }: DateModeFieldsProps) {
  const update = (changes: Partial<DateDraft>) => onChange({ ...draft, ...changes });
  const runningOptions = original?.mode === "poll" && !draft.restart ? original.options : null;
  const canAddRow = (runningOptions?.length ?? 0) + draft.rows.length < POLL_MAX_OPTIONS;
  const fixedProposal = {
    date: draft.fixed.date,
    startTime: draft.fixed.startTime,
    endTime: draft.fixed.endTime || null,
  };
  const pollOptions = original?.mode === "poll" ? original.options : [];
  const matchesOption =
    !draft.fixed.endDate && pollOptions.some((option) => sameProposal(option, fixedProposal));

  function setRow(key: number, changes: Partial<ProposalRow>) {
    update({ rows: draft.rows.map((row) => (row.key === key ? { ...row, ...changes } : row)) });
  }

  return (
    <fieldset className="mt-4">
      <legend className="sr-only">Termin-Art</legend>
      <div className="space-y-1">
        {DATE_MODES.map((mode) => (
          <label key={mode} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="dateMode"
              checked={draft.mode === mode}
              disabled={disabled}
              onChange={() => update({ mode })}
              className="h-5 w-5"
            />
            {MODE_LABELS[mode]}
          </label>
        ))}
      </div>

      {draft.mode === "poll" ? (
        <div className={boxClass}>
          {runningOptions ? (
            <div>
              <p className="text-sm font-semibold text-leaf-dark">Laufende Abstimmung</p>
              <ul className="mt-1 space-y-1 text-sm">
                {runningOptions.map((option) => (
                  <li key={option.id} className="flex justify-between gap-2">
                    <span>{formatPollOptionLabel(option)}</span>
                    <span className="font-bold text-leaf-dark">✓ {option.yesCount}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {draft.rows.map((row) => (
            <div key={row.key} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                type="date"
                aria-label="Datum"
                value={row.date}
                disabled={disabled}
                onChange={(event) => setRow(row.key, { date: event.target.value })}
                className={`${inputClass} col-span-2`}
              />
              <Button
                variant="outline-danger"
                size="icon"
                aria-label="Termin entfernen"
                disabled={disabled}
                onClick={() => update({ rows: draft.rows.filter((other) => other.key !== row.key) })}
              >
                <TrashIcon />
              </Button>
              <label className="flex items-center gap-1 text-xs">
                <span className="shrink-0">von</span>
                <input
                  type="time"
                  value={row.startTime}
                  disabled={disabled}
                  onChange={(event) => setRow(row.key, { startTime: event.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="flex items-center gap-1 text-xs">
                <span className="shrink-0">bis</span>
                <input
                  type="time"
                  value={row.endTime}
                  disabled={disabled}
                  onChange={(event) => setRow(row.key, { endTime: event.target.value })}
                  className={inputClass}
                />
              </label>
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            {canAddRow ? (
              <Button
                variant="outline"
                disabled={disabled}
                onClick={() => update({ rows: [...draft.rows, emptyRow()] })}
              >
                + Termin hinzufügen
              </Button>
            ) : null}
            {runningOptions ? (
              <Button
                variant="outline-danger"
                disabled={disabled}
                onClick={() => update({ restart: true, rows: [emptyRow(), emptyRow()] })}
              >
                Abstimmung neu machen
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-muted">
            {runningOptions
              ? "Neue Termine kommen zur laufenden Abstimmung dazu, die Stimmen bleiben erhalten."
              : "2 bis 4 Termine. Uhrzeit ist optional; liegt „bis“ vor „von“, geht der Termin bis nach Mitternacht."}
          </p>
        </div>
      ) : null}

      {draft.mode === "fixed" ? (
        <div className={boxClass}>
          {pollOptions.length > 0 ? (
            <div>
              <p className="text-xs text-muted">Vorschlag aus der Abstimmung übernehmen:</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {pollOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      update({
                        fixed: {
                          date: option.date,
                          endDate: "",
                          startTime: option.startTime ?? "",
                          endTime: option.endTime ?? "",
                        },
                      })
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      !draft.fixed.endDate && sameProposal(option, fixedProposal)
                        ? "border-leaf bg-leaf/15 text-leaf-dark"
                        : "border-leaf/30 hover:bg-leaf/10"
                    }`}
                  >
                    {formatPollOptionLabel(option)} (✓ {option.yesCount})
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs">
              <span>Datum</span>
              <input
                type="date"
                value={draft.fixed.date}
                disabled={disabled}
                onChange={(event) => update({ fixed: { ...draft.fixed, date: event.target.value } })}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span>bis Datum (optional)</span>
              <input
                type="date"
                value={draft.fixed.endDate}
                min={draft.fixed.date || undefined}
                disabled={disabled}
                onChange={(event) => update({ fixed: { ...draft.fixed, endDate: event.target.value } })}
                className={inputClass}
              />
            </label>
            <label className="flex items-center gap-1 text-xs">
              <span className="shrink-0">von</span>
              <input
                type="time"
                value={draft.fixed.startTime}
                disabled={disabled}
                onChange={(event) => update({ fixed: { ...draft.fixed, startTime: event.target.value } })}
                className={inputClass}
              />
            </label>
            <label className="flex items-center gap-1 text-xs">
              <span className="shrink-0">bis</span>
              <input
                type="time"
                value={draft.fixed.endTime}
                disabled={disabled}
                onChange={(event) => update({ fixed: { ...draft.fixed, endTime: event.target.value } })}
                className={inputClass}
              />
            </label>
          </div>
          <p className="text-xs text-muted">
            Uhrzeit ist optional. „bis Datum“ nur für Events über mehrere Tage; liegt „bis“ bei einem Tag
            vor „von“, geht der Termin bis nach Mitternacht.
          </p>
          {original?.mode === "poll" && original.voteCount > 0 && !matchesOption ? (
            <p className="text-xs text-muted">
              Dieser Termin ist kein Vorschlag der Abstimmung – die Stimmen verfallen.
            </p>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 7h14M10 11v6M14 11v6M9 7V5h6v2M7 7l1 12h8l1-12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
