"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";

type ParallaxSideGraphicsProps = {
  leftSrc?: string;
  rightSrc?: string;
};

// All side graphics are made at 500 x 1024 px. The browser needs the real
// aspect ratio up front: with a wrong one it reserves the wrong width while
// the lazy image loads and the image jumps when it arrives (layout shift).
// So a graphic with other dimensions has to be re-exported at 500 x 1024.
const SIDE_GRAPHIC_WIDTH = 500;
const SIDE_GRAPHIC_HEIGHT = 1024;

// The graphics have a fixed height and their natural width, but Tailwind's
// base styles cap every image at max-width: 100%. On narrow, tall screens
// (e.g. 360 x 900: 855px high -> 417px wide) that cap squeezed the graphic
// to the screen width and distorted it. object-cover keeps the proportions
// and crops the overflow instead, anchored at the graphic's outer edge, so
// the side that touches the screen edge stays complete.
const SIDE_GRAPHIC_CLASS =
  "pointer-events-none absolute bottom-0 -z-10 h-[min(1024px,95vh)] w-auto object-cover will-change-transform";

// Share of the scroll distance the graphics "lag" behind the content (0 = no
// parallax, 1 = they stand still on screen). At the very bottom of the page
// they sit exactly at their CSS position (bottom: 0); the further up you
// scroll, the further they are pushed UP, so they move slower than the
// content. The offset is therefore never positive: a graphic never reaches
// past the bottom of the page, so the scrollable height (the space below
// the contact container) is not affected by the parallax at all.
const PARALLAX_FACTOR = 0.4;

// From this width on the right graphic is shown; below it, it would sit on
// top of the content.
const RIGHT_GRAPHIC_QUERY = "(min-width: 600px)";

function subscribeRightGraphic(callback: () => void): () => void {
  const query = window.matchMedia(RIGHT_GRAPHIC_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export function ParallaxSideGraphics({ leftSrc, rightSrc }: ParallaxSideGraphicsProps) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLImageElement>(null);
  const rightRef = useRef<HTMLImageElement>(null);
  // The right graphic is not rendered at all on narrow screens instead of
  // being hidden by CSS: a hidden lazy image has no box (0 x 0), which
  // browsers flag ("lazy-loaded images should have explicit dimensions"), and
  // an eager one would still be downloaded. False while rendering on the
  // server and hydrating, so it appears right after hydration on wide screens.
  const showRight = useSyncExternalStore(
    subscribeRightGraphic,
    () => window.matchMedia(RIGHT_GRAPHIC_QUERY).matches,
    () => false,
  );

  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let maxScroll = 0;
    let ticking = false;

    function apply() {
      ticking = false;
      const scrolled = Math.min(Math.max(window.scrollY, 0), maxScroll);
      const offset = reduceMotion.matches ? 0 : -PARALLAX_FACTOR * (maxScroll - scrolled);
      const transform = `translateY(${offset}px)`;
      if (backgroundRef.current) backgroundRef.current.style.transform = transform;
      if (leftRef.current) leftRef.current.style.transform = transform;
      if (rightRef.current) rightRef.current.style.transform = transform;
    }

    function measure() {
      maxScroll = Math.max(0, root.scrollHeight - root.clientHeight);
      apply();
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    // The page height changes after load (guest list, images, edits).
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      resizeObserver.disconnect();
    };
    // Runs again when the right graphic appears, so it gets its offset at once.
  }, [showRight]);

  return (
    <>
      <div
        ref={backgroundRef}
        aria-hidden="true"
        className="parallax-background pointer-events-none absolute inset-0 -z-20 will-change-transform"
      />
      {/* Both graphics are in view as soon as the page is, so they load
          eagerly (the largest one is the page's LCP image). */}
      {rightSrc && showRight ? (
        <Image
          ref={rightRef}
          src={rightSrc}
          alt=""
          width={SIDE_GRAPHIC_WIDTH}
          height={SIDE_GRAPHIC_HEIGHT}
          loading="eager"
          aria-hidden="true"
          className={`${SIDE_GRAPHIC_CLASS} right-0 object-[right_bottom]`}
        />
      ) : null}
      {leftSrc ? (
        <Image
          ref={leftRef}
          src={leftSrc}
          alt=""
          width={SIDE_GRAPHIC_WIDTH}
          height={SIDE_GRAPHIC_HEIGHT}
          loading="eager"
          aria-hidden="true"
          className={`${SIDE_GRAPHIC_CLASS} left-0 object-[left_bottom]`}
        />
      ) : null}
    </>
  );
}
