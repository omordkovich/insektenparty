import { and, asc, count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { datePollOptions, datePollVotes, events, guests } from "@/db/schema";
import { formatDateRangeLabel, formatTimeLabel } from "@/lib/calendar";
import { isDateMode, type DateMode, type DateModePlan, type PollOption, type PollVote } from "@/lib/date-poll";
import {
  normalizeArrivalTime,
  type EventSchedule,
  type GuestInput,
  type PollVoteInput,
} from "@/lib/validation";

type OptionRow = typeof datePollOptions.$inferSelect;
type VoteRow = typeof datePollVotes.$inferSelect;

function toOption(row: OptionRow): PollOption {
  return {
    id: row.id,
    date: row.date,
    startTime: row.startTime ? normalizeArrivalTime(String(row.startTime)) : null,
    endTime: row.endTime ? normalizeArrivalTime(String(row.endTime)) : null,
    createdAt: row.createdAt.toISOString(),
  };
}

function toVote(row: VoteRow): PollVote {
  return {
    id: row.id,
    name: row.name,
    optionIds: row.optionIds,
    noneFit: row.noneFit,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getEventDateMode(eventId: string): Promise<DateMode | undefined> {
  const [event] = await getDb()
    .select({ dateMode: events.dateMode })
    .from(events)
    .where(eq(events.id, eventId));
  return event && isDateMode(event.dateMode) ? event.dateMode : undefined;
}

export async function getPollOptions(eventId: string): Promise<PollOption[]> {
  const rows = await getDb()
    .select()
    .from(datePollOptions)
    .where(eq(datePollOptions.eventId, eventId))
    .orderBy(asc(datePollOptions.position));
  return rows.map(toOption);
}

export async function getPollVotes(eventId: string): Promise<PollVote[]> {
  const rows = await getDb()
    .select()
    .from(datePollVotes)
    .where(eq(datePollVotes.eventId, eventId))
    .orderBy(asc(datePollVotes.createdAt));
  return rows.map(toVote);
}

export async function countGuests(eventId: string): Promise<number> {
  const [row] = await getDb().select({ value: count() }).from(guests).where(eq(guests.eventId, eventId));
  return row?.value ?? 0;
}

export async function insertPollVote(eventId: string, input: PollVoteInput): Promise<PollVote> {
  const [row] = await getDb()
    .insert(datePollVotes)
    .values({ eventId, name: input.name, optionIds: input.optionIds, noneFit: input.noneFit })
    .returning();
  return toVote(row);
}

export async function updatePollVote(
  eventId: string,
  voteId: string,
  input: PollVoteInput,
): Promise<PollVote | undefined> {
  const [row] = await getDb()
    .update(datePollVotes)
    .set({ name: input.name, optionIds: input.optionIds, noneFit: input.noneFit, updatedAt: new Date() })
    .where(and(eq(datePollVotes.id, voteId), eq(datePollVotes.eventId, eventId)))
    .returning();
  return row ? toVote(row) : undefined;
}

export async function deletePollVote(
  eventId: string,
  voteId: string,
): Promise<{ id: string; name: string } | undefined> {
  const [row] = await getDb()
    .delete(datePollVotes)
    .where(and(eq(datePollVotes.id, voteId), eq(datePollVotes.eventId, eventId)))
    .returning({ id: datePollVotes.id, name: datePollVotes.name });
  return row;
}

export type DateModeChange = {
  mode: DateMode;
  /** Only for "fixed"; null clears date, time and their labels. */
  schedule: EventSchedule | null;
  plan: DateModePlan;
  transferGuests: GuestInput[];
};

// One transaction: either the whole change happens or nothing does.
export async function applyDateModeChange(
  eventId: string,
  ownerId: string,
  change: DateModeChange,
): Promise<boolean> {
  return getDb().transaction(async (tx) => {
    const { schedule, plan } = change;
    const [updated] = await tx
      .update(events)
      .set({
        dateMode: change.mode,
        eventDate: schedule?.eventDate ?? null,
        eventEndDate: schedule?.eventEndDate ?? null,
        eventStartTime: schedule?.eventStartTime ?? null,
        eventEndTime: schedule?.eventEndTime ?? null,
        dateLabel: schedule ? formatDateRangeLabel(schedule.eventDate, schedule.eventEndDate) : "",
        timeLabel: schedule ? formatTimeLabel(schedule.eventStartTime, schedule.eventEndTime) : "",
        updatedAt: new Date(),
      })
      .where(and(eq(events.id, eventId), eq(events.ownerId, ownerId)))
      .returning({ id: events.id });
    if (!updated) return false;

    if (plan.clearGuests) {
      await tx.delete(guests).where(eq(guests.eventId, eventId));
    }
    if (change.transferGuests.length > 0) {
      await tx.insert(guests).values(change.transferGuests.map((guest) => ({ eventId, ...guest })));
    }
    if (plan.clearPoll) {
      await tx.delete(datePollVotes).where(eq(datePollVotes.eventId, eventId));
      await tx.delete(datePollOptions).where(eq(datePollOptions.eventId, eventId));
    }
    if (plan.newOptions.length > 0) {
      const [existing] = await tx
        .select({ value: count() })
        .from(datePollOptions)
        .where(eq(datePollOptions.eventId, eventId));
      const start = existing?.value ?? 0;
      await tx.insert(datePollOptions).values(
        plan.newOptions.map((proposal, index) => ({
          eventId,
          date: proposal.date,
          startTime: proposal.startTime,
          endTime: proposal.endTime,
          position: start + index,
        })),
      );
    }
    return true;
  });
}
