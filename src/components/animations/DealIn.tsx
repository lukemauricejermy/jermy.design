"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { dealIn } from "@/lib/animation-config";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Deals its direct children in as each one scrolls into view, like the values
 * cards but calmer. Inside each child, mark the parts:
 *   [data-deal="tile"]   the card face: thrown in from below-right, tilted and
 *                        slightly lifted, then sliding to a stop
 *   [data-deal="text"]   lines that follow, rising one after another
 * Children that arrive together (a row on desktop) deal one after another.
 * Nothing fades: everything is visible, just displaced until it settles.
 * Reduced motion shows everything at rest.
 */
export function DealIn({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(container.children) as HTMLElement[];
    const parts = (item: HTMLElement) => ({
      tile: item.querySelector<HTMLElement>('[data-deal="tile"]'),
      text: Array.from(item.querySelectorAll<HTMLElement>('[data-deal="text"]')),
    });

    const ctx = gsap.context(() => {
      items.forEach((item, i) => {
        const { tile, text } = parts(item);
        if (tile) gsap.set(tile, { ...dealIn.from, rotation: dealIn.from.rotation + (i % 2) * dealIn.rotationStep });
        if (text.length) gsap.set(text, { y: dealIn.text.distance });
      });

      ScrollTrigger.batch(items, {
        start: dealIn.start,
        once: true,
        onEnter: (batch) => {
          (batch as HTMLElement[]).forEach((item, n) => {
            const { tile, text } = parts(item);
            const at = n * dealIn.stagger;
            if (tile) {
              gsap.to(tile, { x: 0, y: 0, delay: at, ...dealIn.move });
              gsap.to(tile, { rotation: 0, delay: at, ...dealIn.spin });
              gsap.to(tile, { scale: 1, delay: at, ...dealIn.touchDown });
            }
            const textAt = at + dealIn.text.delay;
            if (text.length) {
              gsap.to(text, {
                y: 0,
                delay: textAt,
                duration: dealIn.text.duration,
                ease: dealIn.text.ease,
                stagger: dealIn.text.stagger,
              });
            }
          });
        },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
