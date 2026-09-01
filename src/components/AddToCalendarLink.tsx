"use client";

import { useSyncExternalStore, type ReactNode } from "react";

type AddToCalendarLinkProps = {
  icsHref: string;
  googleHref: string;
  className?: string;
  children: ReactNode;
};

// iOS/iPadOS/macOS ignore the Google Calendar prefill page's "save" action
// unless the visitor is signed in to a Google account, and it never reaches
// Apple's native Calendar app - a bare .ics link opens that app's own "Add
// Event" sheet directly there. Everywhere else (Android, desktop Chrome/
// Firefox/Edge) a data:text/calendar link is just downloaded as a file
// instead of prompting to add the event, so Google's page is the better fit.
function isApplePlatform(): boolean {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ and real Mac desktop Safari both report "Macintosh" here -
  // that's fine, both should get the .ics link, so no need to tell them
  // apart (which would require the deprecated navigator.platform).
  const isMacUA = /Macintosh/.test(ua);
  return isIOS || isMacUA;
}

// Platform never changes mid-session, so there's nothing to subscribe to -
// this just lets useSyncExternalStore reconcile the server snapshot (always
// false, since navigator doesn't exist there) with the real client value
// without the cascading-render risk of setting state from an effect.
function subscribe() {
  return () => {};
}

function getServerSnapshot() {
  return false;
}

export function AddToCalendarLink({ icsHref, googleHref, className, children }: AddToCalendarLinkProps) {
  const apple = useSyncExternalStore(subscribe, isApplePlatform, getServerSnapshot);

  if (apple) {
    return (
      <a href={icsHref} className={className}>
        {children}
      </a>
    );
  }

  return (
    <a href={googleHref} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
