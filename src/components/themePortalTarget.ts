import { useSyncExternalStore } from "react";

// Where overlays that live outside an event page's component tree (cookie
// banner, legal texts) should be portalled to. On an event page that is the
// themed wrapper from app/event/[slug]/layout.tsx, so the overlay picks up the
// event's CSS variables; everywhere else it is <body> (neutral theme).
// Browser-only: call it during render of client-only content or in handlers.
export function themePortalTarget(): HTMLElement {
  return document.querySelector<HTMLElement>("[data-theme-root]") ?? document.body;
}

function subscribe(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

// For components that stay mounted across client-side navigation (the root
// layout's cookie banner): the themed wrapper appears and disappears with
// the event pages, so the target is re-read whenever the DOM changes.
// Returns null during server rendering.
export function useThemePortalTarget(): HTMLElement | null {
  return useSyncExternalStore(subscribe, themePortalTarget, () => null);
}
