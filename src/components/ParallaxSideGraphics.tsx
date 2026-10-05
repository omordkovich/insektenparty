"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type ParallaxSideGraphicsProps = {
  leftSrc?: string;
  rightSrc?: string;
};

// Share of the scroll distance the graphics "lag" behind the content (0 = no
// parallax, 1 = they stand still on screen). At the very bottom of the page
// they sit exactly at their CSS position (bottom: 0); the further up you
// scroll, the further they are pushed UP, so they move slower than the
// content. The offset is therefore never positive: a graphic never reaches
// past the bottom of the page, so the scrollable height (the space below
// the contact container) is not affected by the parallax at all.
const PARALLAX_FACTOR = 0.4;

export function ParallaxSideGraphics({ leftSrc, rightSrc }: ParallaxSideGraphicsProps) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLImageElement>(null);
  const rightRef = useRef<HTMLImageElement>(null);

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
  }, []);

  return (
    <>
      <div
        ref={backgroundRef}
        aria-hidden="true"
        className="parallax-background pointer-events-none absolute inset-0 -z-20 will-change-transform"
      />
      {rightSrc ? (
        <Image
          ref={rightRef}
          src={rightSrc}
          alt=""
          width={283}
          height={1024}
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 -z-10 h-[min(1024px,95vh)] w-auto will-change-transform"
        />
      ) : null}
      {leftSrc ? (
        <Image
          ref={leftRef}
          src={leftSrc}
          alt=""
          width={434}
          height={1024}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 -z-10 h-[min(1024px,95vh)] w-auto will-change-transform"
        />
      ) : null}
    </>
  );
}
