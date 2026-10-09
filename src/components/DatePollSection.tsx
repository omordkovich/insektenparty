"use client";

import { useCallback, useEffect, useState } from "react";
import {
  countYes,
  formatPollOptionLabel,
  leadingOptionIds,
  type PollDto,
  type PollOption,
  type PollVoteDto,
  type VoteAnswer,
} from "@/lib/date-poll";
import type { InvitationBase } from "@/lib/invitation-text";
import { Button } from "./Button";
import { DeletePollVoteDialog } from "./DeletePollVoteDialog";
import { PencilIcon } from "./EditIcons";
import { FixPollOptionDialog } from "./FixPollOptionDialog";
import { PollVoteModal } from "./PollVoteModal";

type DatePollSectionProps = {
  eventId: string;
  isOwner: boolean;
  /** Owner only: for the message to the guests after fixing a date. */
  announcement?: InvitationBase | null;
};

// Status "Termin abstimmen lassen": instead of the guest list.
export function DatePollSection({ eventId, isOwner, announcement }: DatePollSectionProps) {
  const apiBasePath = `/api/events/${eventId}/poll-votes`;
  const [poll, setPoll] = useState<PollDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voteModal, setVoteModal] = useState<{ vote: PollVoteDto | null } | null>(null);
  const [deleteVote, setDeleteVote] = useState<PollVoteDto | null>(null);
  const [fixOption, setFixOption] = useState<PollOption | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch(apiBasePath, { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as (PollDto & { error?: string }) | null;
      if (!response.ok || !payload) {
        setError(payload?.error ?? "Die Abstimmung konnte nicht geladen werden.");
        return;
      }
      setPoll(payload);
      setError(null);
    } catch {
      setError("Die Abstimmung konnte nicht geladen werden.");
    }
  }, [apiBasePath]);

  useEffect(() => {
    // Fetching on mount; setState only happens after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const options = poll?.options ?? [];
  const votes = poll?.votes ?? [];
  const leading = leadingOptionIds(options, votes);
  const noneFitNames = votes.filter((vote) => vote.noneFit).map((vote) => vote.name);

  function voteActions(vote: PollVoteDto) {
    return (
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-surface"
          aria-label={`Stimme von ${vote.name} ändern`}
          onClick={() => setVoteModal({ vote })}
        >
          <PencilIcon />
        </Button>
        <Button
          variant="outline-danger"
          size="icon"
          aria-label={`Stimme von ${vote.name} löschen`}
          onClick={() => setDeleteVote(vote)}
        >
          <TrashIcon />
        </Button>
      </div>
    );
  }

  return (
    <section className="page-shell py-6" aria-labelledby="poll-heading">
      <div className="rounded-[2rem] border border-leaf/20 bg-[var(--surface)] p-5 shadow-(--shadow) sm:p-8">
        <h2 id="poll-heading" className="text-center font-display text-3xl text-leaf-dark sm:text-4xl">
          Wann passt es dir?
        </h2>
        <p className="mt-2 text-center text-muted">
          Hake an, welche Termine dir passen. Der Gastgeber legt danach den Termin fest.
        </p>

        {error ? (
          <p className="mt-8 text-center text-danger" role="alert">
            {error}
          </p>
        ) : null}
        {!poll && !error ? (
          <p className="mt-8 text-center text-muted" role="status">
            Abstimmung wird geladen ...
          </p>
        ) : null}

        {poll ? (
          <>
            {/* Desktop: participants × proposals */}
            <div className="mt-8 hidden overflow-x-auto sm:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-leaf/20 text-sm text-leaf-dark">
                    <th className="px-2 py-2 font-bold">Name</th>
                    {options.map((option) => (
                      <th
                        key={option.id}
                        className={`px-2 py-2 text-center font-bold ${leading.includes(option.id) ? "rounded-t-xl bg-leaf/10" : ""}`}
                      >
                        <span className="block whitespace-nowrap">{formatPollOptionLabel(option)}</span>
                        {isOwner ? (
                          <button
                            type="button"
                            onClick={() => setFixOption(option)}
                            className="mt-1 text-xs font-semibold text-leaf underline underline-offset-2 hover:text-leaf-dark"
                          >
                            Diesen Termin festlegen
                          </button>
                        ) : null}
                      </th>
                    ))}
                    <th className="px-2 py-2" aria-hidden="true" />
                  </tr>
                </thead>
                <tbody>
                  {votes.map((vote) => (
                    <tr key={vote.id} className="border-b border-leaf/10">
                      <td className="px-2 py-3">
                        <span className="font-bold text-leaf-dark">{vote.name}</span>
                        {vote.noneFit ? (
                          <span className="block text-xs text-muted">Nichts davon passt</span>
                        ) : null}
                      </td>
                      {options.map((option) => (
                        <td
                          key={option.id}
                          className={`px-2 py-3 text-center ${leading.includes(option.id) ? "bg-leaf/10" : ""}`}
                        >
                          <AnswerMark answer={vote.answers[option.id]} />
                        </td>
                      ))}
                      <td className="px-2 py-3">{voteActions(vote)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="text-sm font-bold text-leaf-dark">
                    <td className="px-2 py-2">Passt</td>
                    {options.map((option) => (
                      <td
                        key={option.id}
                        className={`px-2 py-2 text-center ${leading.includes(option.id) ? "rounded-b-xl bg-leaf/10" : ""}`}
                      >
                        ✓ {countYes(option, votes)}
                      </td>
                    ))}
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile: one card per proposal, then the participants */}
            <div className="mt-6 space-y-3 sm:hidden">
              {options.map((option) => {
                const names = votes
                  .filter((vote) => vote.answers[option.id] === "yes")
                  .map((vote) => vote.name);
                return (
                  <div
                    key={option.id}
                    className={`rounded-2xl border p-4 ${leading.includes(option.id) ? "border-leaf bg-leaf/10" : "border-leaf/15 bg-surface/80"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-leaf-dark">{formatPollOptionLabel(option)}</span>
                      <span className="shrink-0 font-bold text-leaf">✓ {names.length}</span>
                    </div>
                    {names.length > 0 ? <p className="mt-1 text-sm text-muted">{names.join(", ")}</p> : null}
                    {isOwner ? (
                      <Button
                        variant="outline"
                        className="mt-3 w-full bg-surface"
                        onClick={() => setFixOption(option)}
                      >
                        Diesen Termin festlegen
                      </Button>
                    ) : null}
                  </div>
                );
              })}
              {noneFitNames.length > 0 ? (
                <p className="text-sm text-muted">
                  <span className="font-bold">Nichts davon passt:</span> {noneFitNames.join(", ")}
                </p>
              ) : null}
              {votes.length > 0 ? (
                <ul className="space-y-2">
                  {votes.map((vote) => (
                    <li
                      key={vote.id}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-leaf/15 bg-surface/80 px-4 py-2"
                    >
                      <span className="font-bold text-leaf-dark">{vote.name}</span>
                      {voteActions(vote)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {votes.length === 0 ? (
              <p className="mt-6 text-center text-muted">Noch hat niemand abgestimmt.</p>
            ) : null}

            <div className="mt-6 flex justify-center">
              <Button variant="primary" size="lg" onClick={() => setVoteModal({ vote: null })}>
                Abstimmen
              </Button>
            </div>
          </>
        ) : null}
      </div>

      {voteModal && poll ? (
        <PollVoteModal
          key={voteModal.vote?.id ?? "new"}
          options={options}
          vote={voteModal.vote}
          apiBasePath={apiBasePath}
          isOwner={isOwner}
          onCloseAction={() => setVoteModal(null)}
          onSavedAction={load}
        />
      ) : null}
      {deleteVote ? (
        <DeletePollVoteDialog
          key={deleteVote.id}
          vote={deleteVote}
          apiBasePath={apiBasePath}
          isOwner={isOwner}
          onCloseAction={() => setDeleteVote(null)}
          onDeletedAction={load}
        />
      ) : null}
      {fixOption && announcement ? (
        <FixPollOptionDialog
          key={fixOption.id}
          eventId={eventId}
          option={fixOption}
          votes={votes}
          announcement={announcement}
          onCloseAction={() => setFixOption(null)}
        />
      ) : null}
    </section>
  );
}

function AnswerMark({ answer }: { answer: VoteAnswer | undefined }) {
  if (answer === "yes") {
    return (
      <span className="text-lg font-bold text-leaf" role="img" aria-label="passt">
        ✓
      </span>
    );
  }
  if (answer === "unseen") {
    return (
      <span
        className="font-bold text-muted"
        role="img"
        aria-label="noch nicht abgestimmt"
        title="Hat diesen Termin noch nicht gesehen"
      >
        ?
      </span>
    );
  }
  return (
    <span className="text-muted/50" role="img" aria-label="passt nicht">
      –
    </span>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
