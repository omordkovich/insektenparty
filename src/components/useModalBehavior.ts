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

  // requestClose-style callbacks are re-created on every render (e.g. on
  // every keystroke in the form), so the effect below must not depend on
  // them directly - that would re-run it (and re-steal focus to the first
  // field) on every keystroke. Refs give the keydown handler the latest
  // values without adding them as effect dependencies.
  const onCloseActionRef = useRef(onCloseAction);
  const closeDisabledRef = useRef(closeDisabled);
  useEffect(() => {
    onCloseActionRef.current = onCloseAction;
    closeDisabledRef.current = closeDisabled;
  });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";
    (initialFocusRef ?? internalCloseRef).current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (closeDisabledRef.current) return;
        onCloseActionRef.current();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("modal-open");
      document.body.style.overflow = previousOverflow;
    };
  }, [initialFocusRef]);

  return internalCloseRef;
}
