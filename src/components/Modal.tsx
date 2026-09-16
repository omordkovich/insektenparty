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
  children: ReactNode;
};

export function Modal({
  titleId,
  descriptionId,
  onCloseAction,
  closeDisabled = false,
  initialFocusRef,
  showCloseButton = true,
  children,
}: ModalProps) {
  const internalCloseRef = useModalBehavior({ onCloseAction, closeDisabled, initialFocusRef });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
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
        className="relative z-10 w-full max-w-md rounded-3xl bg-surface p-5 shadow-(--shadow) sm:p-7"
      >
        {showCloseButton ? (
          <button
            ref={internalCloseRef}
            type="button"
            onClick={onCloseAction}
            disabled={closeDisabled}
            aria-label="Schließen"
            className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-leaf-dark transition hover:bg-leaf/10 disabled:opacity-50"
          >
            <CloseIcon />
          </button>
        ) : null}
        {children}
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
