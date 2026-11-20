"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { STRIP_SPEED_PX_PER_S, centerOn, nearestCard, stripAdvance } from "@/lib/reviews-banner";

// After a swipe or wheel scroll the strip waits this long before moving on.
const RESUME_AFTER_MS = 3500;

type ReviewsCarouselProps = {
  children: ReactNode; // the <li> cards: the list twice in a row when looping
  /** Endless, constantly moving strip; false: each card once, standing still. */
  loop: boolean;
  perCopy: number; // cards in one copy of the list
  labelledBy: string;
  prevLabel: string;
  nextLabel: string;
};

function Arrow({ direction }: { direction: 1 | -1 }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d={direction > 0 ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Endless review strip. Moves slowly and constantly by itself (the track is
// rendered twice, the position wraps by one copy). Mouse over: it stops, the
// card nearest the middle glides to the middle, the side fade widens and
// arrow buttons appear on both sides (styles: .reviews-carousel in
// globals.css). Touch: swipe freely, it moves on a few seconds later.
// Reduced motion: no automatic movement, swipe and arrows only.
// Not looping (few reviews): each card once, no automatic movement; the
// cards stand centred when they fit, otherwise swipe / arrows (which jump
// from the last card back to the first).
export function ReviewsCarousel({ children, loop, perCopy, labelledBy, prevLabel, nextLabel }: ReviewsCarouselProps) {
  const strip = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(loop);
  const hovering = useRef(false);
  const keyboardFocus = useRef(false);
  const holdUntil = useRef(0);

  function cards(el: HTMLElement) {
    return Array.from(el.querySelectorAll<HTMLLIElement>(":scope > ul > li"));
  }

  function copyWidth(el: HTMLElement) {
    const list = cards(el);
    return list.length > perCopy ? list[perCopy].offsetLeft - list[0].offsetLeft : 0;
  }

  function nearestIndex(el: HTMLElement) {
    const middles = cards(el).map((li) => li.offsetLeft + li.offsetWidth / 2);
    return nearestCard(middles, el.scrollLeft + el.clientWidth / 2);
  }

  function glideTo(el: HTMLElement, index: number) {
    const li = cards(el)[index];
    if (!li) return;
    el.scrollTo({
      left: centerOn(li.offsetLeft, li.offsetWidth, el.clientWidth),
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  }

  // Mouse over: the card nearest the middle glides into the middle. Near the
  // start the first card cannot be centred - jump one copy on first (looks
  // the same).
  function centerNearest() {
    const el = strip.current;
    if (!el) return;
    if (loop && el.scrollLeft < el.clientWidth / 2) el.scrollLeft += copyWidth(el);
    glideTo(el, nearestIndex(el));
  }

  function step(direction: 1 | -1) {
    const el = strip.current;
    if (!el) return;
    if (!loop) {
      const count = cards(el).length;
      glideTo(el, (nearestIndex(el) + direction + count) % count);
      return;
    }
    let index = nearestIndex(el);
    // Stay inside the rendered cards: move one copy (invisible) first.
    if (direction > 0 && index >= perCopy) {
      el.scrollLeft -= copyWidth(el);
      index -= perCopy;
    } else if (direction < 0 && index === 0) {
      el.scrollLeft += copyWidth(el);
      index += perCopy;
    }
    glideTo(el, index + direction);
  }

  function hold() {
    holdUntil.current = performance.now() + RESUME_AFTER_MS;
  }

  // Swiping past either end continues on the other copy.
  function onScroll() {
    const el = strip.current;
    if (!loop || !el || (!hovering.current && performance.now() > holdUntil.current)) return;
    const copy = copyWidth(el);
    if (copy <= 0) return;
    if (el.scrollLeft <= 0) el.scrollLeft += copy;
    else if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) el.scrollLeft -= copy;
  }

  // Arrows and the wider hover fade only when the cards do not all fit.
  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = strip.current;
    if (!loop || !el || reducedMotion()) return;
    let frame = 0;
    let last = performance.now();
    let pos = el.scrollLeft;
    let resync = false;
    const tick = (now: number) => {
      const seconds = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!hovering.current && !keyboardFocus.current && now > holdUntil.current) {
        // Pick up wherever a swipe or the arrows left the strip.
        if (resync) pos = el.scrollLeft;
        resync = false;
        // A float position: scrollLeft alone may round the tiny steps away.
        pos = stripAdvance(pos, seconds, STRIP_SPEED_PX_PER_S, copyWidth(el));
        el.scrollLeft = pos;
      } else {
        resync = true;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // copyWidth only reads the DOM; loop and perCopy are fixed for a rendered page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const arrowClass =
    "reviews-arrow flex h-11 w-11 items-center justify-center rounded-full border border-leaf/30 bg-[var(--surface)] text-leaf-dark shadow-md hover:bg-leaf/10";

  return (
    <div
      className="reviews-carousel relative"
      data-overflow={overflows ? "true" : "false"}
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        hovering.current = true;
        centerNearest();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") hovering.current = false;
      }}
      onFocus={(event) => {
        if (event.target.matches(":focus-visible")) keyboardFocus.current = true;
      }}
      onBlur={() => (keyboardFocus.current = false)}
    >
      <div
        ref={strip}
        className="reviews-strip pt-4 pb-14"
        tabIndex={0}
        role="region"
        aria-labelledby={labelledBy}
        onScroll={onScroll}
        onTouchStart={hold}
        onTouchMove={hold}
        onTouchEnd={hold}
        onWheel={hold}
      >
        <ul className="relative mx-auto flex w-max">{children}</ul>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-4 bottom-14 flex items-center justify-between px-2 sm:px-3">
        <button type="button" className={arrowClass} aria-label={prevLabel} onClick={() => step(-1)}>
          <Arrow direction={-1} />
        </button>
        <button type="button" className={arrowClass} aria-label={nextLabel} onClick={() => step(1)}>
          <Arrow direction={1} />
        </button>
      </div>
    </div>
  );
}
