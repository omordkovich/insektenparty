import { sendEmail } from "@/lib/email";
import { getEventForNotification } from "@/repositories/event-repository";
import { getUserContact } from "@/repositories/user-repository";

export type GuestChangeKind = "created" | "updated" | "deleted";

function buildMessage(
  kind: GuestChangeKind,
  guestName: string,
  eventTitle: string,
): { subject: string; text: string } {
  switch (kind) {
    case "created":
      return {
        subject: "Neuer Gast auf der Kinderparty",
        text: `„${guestName}“ hat sich bei Event „${eventTitle}“ als Gast eingetragen.`,
      };
    case "updated":
      return {
        subject: "Änderung an der Gästeliste",
        text: `„${guestName}“ hat seinen Eintrag bei Event „${eventTitle}“ geändert.`,
      };
    case "deleted":
      return {
        subject: "Gast aus der Gästeliste entfernt",
        text: `„${guestName}“ wurde aus der Gästeliste bei Event „${eventTitle}“ entfernt.`,
      };
  }
}

// Best-effort: a failure here must never fail the guest request that
// triggered it, so every error is caught and logged rather than thrown.
export async function notifyOwnerOfGuestChange(
  eventId: string,
  kind: GuestChangeKind,
  guestName: string,
): Promise<void> {
  try {
    const event = await getEventForNotification(eventId);
    if (!event || !event.ownerId) return;

    const owner = await getUserContact(event.ownerId);
    if (!owner?.email) return;

    const { subject, text } = buildMessage(kind, guestName, event.title);
    const link = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/p/${event.slug}`;

    await sendEmail({
      to: owner.email,
      subject,
      text: `${text}\n\nGästeliste ansehen: ${link}`,
    });
  } catch (error) {
    console.error("notifyOwnerOfGuestChange failed:", error);
  }
}
