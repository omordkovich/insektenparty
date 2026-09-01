"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type ParallaxSideGraphicsProps = {
  leftSrc: string;
  rightSrc: string;
};

// <1 makes the graphics lag behind the normal scroll speed, reading as
// further back than the logo/accents/panels (which scroll at 1:1, "in
// front"). 0 would be a fully fixed background; 1 would be no parallax.
const PARALLAX_FACTOR = 0.3;

export function ParallaxSideGraphics({ leftSrc, rightSrc }: ParallaxSideGraphicsProps) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLImageElement>(null);
  const rightRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let ticking = false;

    function apply() {
      const offset = window.scrollY * PARALLAX_FACTOR;
      const transform = `translateY(${offset}px)`;
      if (backgroundRef.current) backgroundRef.current.style.transform = transform;
      if (leftRef.current) leftRef.current.style.transform = transform;
      if (rightRef.current) rightRef.current.style.transform = transform;
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div
        ref={backgroundRef}
        aria-hidden="true"
        className="parallax-background pointer-events-none absolute inset-0 -z-20 will-change-transform"
      />
      <Image
        ref={rightRef}
        src={rightSrc}
        alt=""
        width={283}
        height={1024}
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 -z-10 h-auto w-[min(283px,45.4vw)] will-change-transform"
      />
      <Image
        ref={leftRef}
        src={leftSrc}
        alt=""
        width={434}
        height={1024}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 -z-10 h-auto w-[min(434px,69.6vw)] will-change-transform"
      />
    </>
  );
}
