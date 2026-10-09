"use client";

import type { ReactNode, RefObject } from "react";
import { useModalBehavior } from "./useModalBehavior";

type ModalProps = {
  titleId: string;
  descriptionId?: string;
  onCloseAction: () => void;
  closeDisabled?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  showCloseButton?: boolean;
  /** The default centers the dialog vertically. "bottom" pins it to the
   *  bottom edge on every screen size (the cookie banner); "sheet" pins it
   *  to the bottom on small screens and centers it from sm upwards (the
   *  cookie settings). */
  placement?: "default" | "bottom" | "sheet";
  children: ReactNode;
};

export function Modal({
  titleId,
  descriptionId,
  onCloseAction,
  closeDisabled = false,
  initialFocusRef,
  showCloseButton = true,
  placement = "default",
  children,
}: ModalProps) {
  const internalCloseRef = useModalBehavior({ onCloseAction, closeDisabled, initialFocusRef });
  const alignClass =
    placement === "bottom"
      ? "items-end"
      : placement === "sheet"
        ? "items-end sm:items-center"
        : "items-center";
  const widthClass = placement === "bottom" ? "max-w-xl" : "max-w-md";

  return (
    <div className={`fixed inset-0 z-50 flex justify-center p-3 sm:p-6 ${alignClass}`}>
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Dialog schließen"
        onClick={() => !closeDisabled && onCloseAction()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={`relative z-10 flex max-h-[95dvh] w-full flex-col overflow-hidden ${widthClass} rounded-3xl bg-surface p-2 shadow-(--shadow)`}
      >
        {/* The frame (p-2) keeps the scrollbar off the rounded edge; the
            content scrolls inside it. */}
        <div className="relative min-h-0 overflow-y-auto p-3 sm:p-5">
          {showCloseButton ? (
            <button
              ref={internalCloseRef}
              type="button"
              onClick={onCloseAction}
              disabled={closeDisabled}
              aria-label="Schließen"
              className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-leaf-dark transition hover:bg-leaf/10 disabled:opacity-50"
            >
              <CloseIcon />
            </button>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}

export function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
