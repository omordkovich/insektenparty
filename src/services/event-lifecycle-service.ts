import { todayInBerlin } from "@/lib/date-poll";
import { lifecycleOf, type LifecycleStage } from "@/lib/event-lifecycle";
import { getLifecycleInput } from "@/repositories/event-repository";

export const EVENT_OVER_ERROR = "Dieses Event ist vorbei.";

// Where an event stands in its life: its Stichtag, the stage today and the
// day it will be deleted. Undefined when the event does not exist.
export async function getEventLifecycle(
  eventId: string,
): Promise<{ stichtag: string; stage: LifecycleStage; deletionDate: string } | undefined> {
  const input = await getLifecycleInput(eventId);
  if (!input) return undefined;
  return lifecycleOf(input, todayInBerlin());
}

// The guard in front of every write: once an event is "over" it is read-only.
// Null = go ahead (also for a missing event - the caller's own existence
// check answers 404).
export async function denyIfOver(eventId: string): Promise<{ ok: false; status: 409; error: string } | null> {
  const lifecycle = await getEventLifecycle(eventId);
  if (!lifecycle || lifecycle.stage === "active") return null;
  return { ok: false, status: 409, error: EVENT_OVER_ERROR };
}
