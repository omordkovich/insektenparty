"use client";

import type { ReactNode, RefObject, SubmitEvent } from "react";
import { CloseIcon } from "./Modal";
import { useModalBehavior } from "./useModalBehavior";

type FormModalProps = {
  titleId: string;
  onSubmitAction: (event: SubmitEvent<HTMLFormElement>) => void;
  onCloseAction: () => void;
  closeDisabled?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
};

export function FormModal({
  titleId,
  onSubmitAction,
  onCloseAction,
  closeDisabled = false,
  initialFocusRef,
  header,
  children,
  footer,
}: FormModalProps) {
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
        className="relative z-10 flex max-h-[95dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-surface p-1 shadow-(--shadow)"
      >
        <form onSubmit={onSubmitAction} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 p-5 pb-4 sm:p-7 sm:pb-4">
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

            <h2 id={titleId} className="pr-8 font-display text-2xl text-leaf-dark">
              {header}
            </h2>
          </div>

          <div
            className="mr-4 min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-7 sm:pb-7"
            style={{ scrollbarGutter: "stable" }}
          >
            {children}
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 p-5 pt-3 sm:flex-row sm:justify-end sm:p-7 sm:pt-4">
            {footer}
          </div>
        </form>
      </div>
    </div>
  );
}
