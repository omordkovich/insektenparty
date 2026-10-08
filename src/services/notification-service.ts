import { sendEmail } from "@/lib/email";
import { buildEventShareUrl } from "@/lib/share";
import { getEventForNotification } from "@/repositories/event-repository";
import { getUserContact } from "@/repositories/user-repository";

export type GuestChangeKind = "created" | "updated" | "declined" | "deleted";

function buildMessage(
  kind: GuestChangeKind,
  guestName: string,
  eventTitle: string,
): { subject: string; text: string } {
  switch (kind) {
    case "created":
      return {
        subject: `Neuer Gast bei deinem Event „${eventTitle}“`,
        text: `„${guestName}“ hat sich bei Event „${eventTitle}“ als Gast eingetragen.`,
      };
    case "updated":
      return {
        subject: `Änderung an der Gästeliste von „${eventTitle}“`,
        text: `„${guestName}“ hat den Eintrag bei Event „${eventTitle}“ geändert.`,
      };
    case "declined":
      return {
        subject: `Absage bei deinem Event „${eventTitle}“`,
        text: `„${guestName}“ hat bei Event „${eventTitle}“ abgesagt.`,
      };
    case "deleted":
      return {
        subject: `Gast aus der Gästeliste von „${eventTitle}“ entfernt`,
        text: `„${guestName}“ wurde aus der Gästeliste bei Event „${eventTitle}“ entfernt.`,
      };
  }
}

export type PollVoteChangeKind = "created" | "updated" | "deleted";

export function buildPollVoteMessage(
  kind: PollVoteChangeKind,
  voterName: string,
  choice: string,
  eventTitle: string,
): { subject: string; text: string } {
  switch (kind) {
    case "created":
      return {
        subject: `Neue Stimme bei deinem Event „${eventTitle}“`,
        text: `„${voterName}“ hat bei der Terminabstimmung für „${eventTitle}“ abgestimmt: ${choice}.`,
      };
    case "updated":
      return {
        subject: `Geänderte Stimme bei deinem Event „${eventTitle}“`,
        text: `„${voterName}“ hat die Auswahl bei der Terminabstimmung für „${eventTitle}“ geändert: ${choice}.`,
      };
    case "deleted":
      return {
        subject: `Stimme bei deinem Event „${eventTitle}“ entfernt`,
        text: `„${voterName}“ wurde aus der Terminabstimmung für „${eventTitle}“ entfernt.`,
      };
  }
}

// Best-effort: a failure here must never fail the request that triggered
// it, so every error is caught and logged rather than thrown.
async function notifyOwner(
  eventId: string,
  build: (eventTitle: string) => { subject: string; text: string },
): Promise<void> {
  try {
    const event = await getEventForNotification(eventId);
    if (!event || !event.ownerId) return;

    const owner = await getUserContact(event.ownerId);
    if (!owner?.email) return;

    const { subject, text } = build(event.title);
    const link = buildEventShareUrl(event.slug);

    // "Event ansehen": during a poll the page shows the vote, not the list.
    await sendEmail({
      to: owner.email,
      subject,
      text: `${text}\n\nEvent ansehen: ${link}`,
    });
  } catch (error) {
    console.error("notifyOwner failed:", error);
  }
}

export async function notifyOwnerOfGuestChange(
  eventId: string,
  kind: GuestChangeKind,
  guestName: string,
): Promise<void> {
  await notifyOwner(eventId, (eventTitle) => buildMessage(kind, guestName, eventTitle));
}

export async function notifyOwnerOfPollVote(
  eventId: string,
  kind: PollVoteChangeKind,
  voterName: string,
  choice: string,
): Promise<void> {
  await notifyOwner(eventId, (eventTitle) => buildPollVoteMessage(kind, voterName, choice, eventTitle));
}
