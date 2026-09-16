"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

type UseModalBehaviorOptions = {
  onCloseAction: () => void;
  closeDisabled?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
};

// Shared body-scroll-lock + Escape-to-close + initial-focus behavior for
// every modal shell (Modal, FormModal). Returns a ref for the caller's own
// close button to use as the initial-focus target when no initialFocusRef
// is given.
export function useModalBehavior({
  onCloseAction,
  closeDisabled = false,
  initialFocusRef,
}: UseModalBehaviorOptions) {
  const internalCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";
    (initialFocusRef ?? internalCloseRef).current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (closeDisabled) return;
        onCloseAction();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("modal-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [closeDisabled, onCloseAction, initialFocusRef]);

  return internalCloseRef;
}
