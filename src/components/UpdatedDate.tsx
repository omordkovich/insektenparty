// "Aktualisiert am …" under a public page - a visible freshness signal for
// readers and AI assistants, matching dateModified in the page's schema.
// UTC, so the server-rendered date never shifts by a day.
export function UpdatedDate({ date, className = "" }: { date: string; className?: string }) {
  const label = new Date(`${date}T00:00:00Z`).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return (
    <p className={`text-sm text-muted ${className}`}>
      Aktualisiert am <time dateTime={date}>{label}</time>
    </p>
  );
}
