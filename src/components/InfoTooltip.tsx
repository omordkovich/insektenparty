"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type InfoTooltipProps = {
  label: string;
  children: ReactNode;
};

// "i" button with a speech bubble. Opens on click/tap (a title attribute
// never shows on phones) and closes on a click elsewhere or Escape - the
// Escape is kept from also closing a surrounding dialog. The bubble spans
// the nearest positioned ancestor, so give the surrounding row "relative".
export function InfoTooltip({ label, children }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const bubbleId = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <span ref={wrapperRef}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? bubbleId : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.stopPropagation();
            setOpen(false);
          }
        }}
        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-current text-xs leading-none font-bold text-leaf transition hover:text-leaf-dark"
      >
        i
      </button>
      {open ? (
        <span
          id={bubbleId}
          role="tooltip"
          className="absolute top-full right-0 left-0 z-20 mt-2 block rounded-xl border border-leaf/20 bg-surface p-3 text-left text-xs leading-relaxed font-normal text-ink shadow-(--shadow)"
        >
          {children}
        </span>
      ) : null}
    </span>
  );
}
