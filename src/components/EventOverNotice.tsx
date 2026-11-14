import { useTranslations } from "next-intl";

type EventOverNoticeProps =
  | { isOwner: false; /** The party's date, already formatted. */ dateLabel: string }
  | { isOwner: true; /** The day the event is deleted, already formatted. */ deletionDateLabel: string };

// Banner on top of an event that is over: guests learn the party is past,
// the owner when the event will be deleted.
export function EventOverNotice(props: EventOverNoticeProps) {
  const t = useTranslations("event");
  return (
    <div className="page-shell pt-2">
      <p
        role="status"
        className="rounded-2xl border border-leaf/20 bg-[var(--surface)] px-4 py-3 text-center font-semibold text-leaf-dark shadow-(--shadow)"
      >
        {props.isOwner
          ? t("overOwner", { date: props.deletionDateLabel })
          : t("overGuest", { date: props.dateLabel })}
      </p>
    </div>
  );
}
