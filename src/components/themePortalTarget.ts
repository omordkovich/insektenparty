// Where overlays that live outside an event page's component tree (legal
// texts, small info dialogs) should be portalled to. On an event page that is the
// themed wrapper from app/event/[slug]/layout.tsx, so the overlay picks up the
// event's CSS variables; everywhere else it is <body> (neutral theme).
// Browser-only: call it during render of client-only content or in handlers.
export function themePortalTarget(): HTMLElement {
  return document.querySelector<HTMLElement>("[data-theme-root]") ?? document.body;
}
