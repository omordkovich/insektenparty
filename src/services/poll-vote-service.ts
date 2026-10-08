import {
  describeChoice,
  voteAnswer,
  type PollDto,
  type PollOption,
  type PollVote,
} from "@/lib/date-poll";
import { getRecaptchaToken, verifyRecaptchaToken } from "@/lib/recaptcha";
import { validatePollVote } from "@/lib/validation";
import {
  deletePollVote,
  getEventDateMode,
  getPollOptions,
  getPollVotes,
  insertPollVote,
  updatePollVote,
} from "@/repositories/date-poll-repository";
import { getEventOwnerId } from "@/repositories/event-repository";
import { notifyOwnerOfPollVote } from "@/services/notification-service";

export type PollServiceResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

const POLL_CLOSED = "Die Abstimmung ist beendet.";
const NOT_FOUND = "Event wurde nicht gefunden.";

export async function getPollForEvent(eventId: string): Promise<PollServiceResult<PollDto>> {
  const mode = await getEventDateMode(eventId);
  if (!mode) return { ok: false, status: 404, error: NOT_FOUND };
  if (mode !== "poll") return { ok: false, status: 409, error: POLL_CLOSED };

  const [options, votes] = await Promise.all([getPollOptions(eventId), getPollVotes(eventId)]);
  return {
    ok: true,
    data: {
      options,
      votes: votes.map((vote) => ({
        ...vote,
        answers: Object.fromEntries(options.map((option) => [option.id, voteAnswer(vote, option)])),
      })),
    },
  };
}

// Shared by every write: event exists, poll still running, and - unless the
// owner is signed in - the bot check passed.
async function checkWrite(
  eventId: string,
  body: unknown,
  requesterId: string | undefined,
): Promise<{ ok: true; isOwner: boolean; options: PollOption[] } | { ok: false; status: number; error: string }> {
  const ownerId = await getEventOwnerId(eventId);
  if (ownerId === undefined) return { ok: false, status: 404, error: NOT_FOUND };
  if ((await getEventDateMode(eventId)) !== "poll") return { ok: false, status: 409, error: POLL_CLOSED };

  const isOwner = requesterId !== undefined && requesterId === ownerId;
  if (!isOwner) {
    const recaptcha = await verifyRecaptchaToken(getRecaptchaToken(body));
    if (!recaptcha.ok) return { ok: false, status: recaptcha.status, error: recaptcha.error };
  }
  return { ok: true, isOwner, options: await getPollOptions(eventId) };
}

export async function createPollVoteForEvent(
  eventId: string,
  body: unknown,
  requesterId?: string,
): Promise<PollServiceResult<PollVote>> {
  const check = await checkWrite(eventId, body, requesterId);
  if (!check.ok) return check;

  const validation = validatePollVote(body, check.options.map((option) => option.id));
  if (!validation.ok) return { ok: false, status: 400, error: validation.error };

  const vote = await insertPollVote(eventId, validation.value);
  if (!check.isOwner) {
    await notifyOwnerOfPollVote(eventId, "created", vote.name, describeChoice(vote, check.options));
  }
  return { ok: true, data: vote };
}

export async function updatePollVoteForEvent(
  eventId: string,
  voteId: string,
  body: unknown,
  requesterId?: string,
): Promise<PollServiceResult<PollVote>> {
  const check = await checkWrite(eventId, body, requesterId);
  if (!check.ok) return check;

  const validation = validatePollVote(body, check.options.map((option) => option.id));
  if (!validation.ok) return { ok: false, status: 400, error: validation.error };

  const vote = await updatePollVote(eventId, voteId, validation.value);
  if (!vote) return { ok: false, status: 404, error: "Stimme wurde nicht gefunden." };
  if (!check.isOwner) {
    await notifyOwnerOfPollVote(eventId, "updated", vote.name, describeChoice(vote, check.options));
  }
  return { ok: true, data: vote };
}

export async function deletePollVoteForEvent(
  eventId: string,
  voteId: string,
  body: unknown,
  requesterId?: string,
): Promise<PollServiceResult<{ ok: true }>> {
  const check = await checkWrite(eventId, body, requesterId);
  if (!check.ok) return check;

  const deleted = await deletePollVote(eventId, voteId);
  if (!deleted) return { ok: false, status: 404, error: "Stimme wurde nicht gefunden." };
  if (!check.isOwner) {
    await notifyOwnerOfPollVote(eventId, "deleted", deleted.name, "");
  }
  return { ok: true, data: { ok: true } };
}
