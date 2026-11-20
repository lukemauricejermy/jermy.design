"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Typography } from "@/components/ui/typography";
import { TextReveal } from "@/components/animations/TextReveal";
import { HeroPortrait } from "@/components/HeroPortrait";
import {
  animationDurations,
  animationEasings,
} from "@/lib/animation-config";

// Non-breaking spaces keep "Head of" and "Still doing" whole, so neither
// word can be stranded; everything else wraps greedily (each line takes as
// many words as fit), e.g. "Still doing the / doing." when "the" fits.
const HEADLINE = "Head\u00a0of design.\nStill\u00a0doing the doing.";

// How far the top of the portrait reaches up into the last line (em of the
// headline): enough to overlap the bottoms of the letters, not more.
const PORTRAIT_OVERLAP_EM = 0.4;
// Portrait height: on desktop a share of the screen height; on phones (stacked
// under the headline) a multiple of the headline's font size.
const PORTRAIT_SCREEN_SHARE = 0.4;
// …but never wider than this share of the screen width (tall windows).
const PORTRAIT_MAX_WIDTH_SHARE = 0.4;
const PORTRAIT_ASPECT = 1456 / 1253;
const PORTRAIT_SCALE_STACKED = 2.2;

type WordBox = { text: string; top: number; right: number; bottom: number };

/**
 * Largest font size at which the headline fits its box: no phrase wider than
 * the box, no short word alone on a line, total height within
 * maxHeight(fontSize), and (optionally) no word colliding with something
 * else (`collides`). Lines wrap greedily, so the line count follows the
 * screen's shape.
 */
function fitHeadline(
  heading: HTMLElement,
  maxHeight: (fontSize: number) => number,
  collides?: (word: WordBox, fontSize: number) => boolean
) {
  const words = heading.querySelectorAll<HTMLElement>("[data-word]");
  // Only fit the real reveal markup, not the hidden pre-preloader placeholder.
  if (words.length === 0) return;
  heading.style.fontSize = "";
  const maxWidth = heading.clientWidth;
  const fits = (fontSize: number) => {
    if (heading.scrollHeight > maxHeight(fontSize)) return false;
    const left = heading.getBoundingClientRect().left;
    const rows: WordBox[] = [...words].map((w) => {
      const r = w.getBoundingClientRect();
      return { text: w.textContent ?? "", top: Math.round(r.top), right: r.right, bottom: r.bottom };
    });
    for (const [i, w] of rows.entries()) {
      if (w.right - left > maxWidth + 0.5) return false;
      if (collides?.(w, fontSize)) return false;
      // A short word (e.g. "the") is never left alone on a line.
      const alone = rows[i - 1]?.top !== w.top && rows[i + 1]?.top !== w.top;
      if (w.text.length <= 3 && alone) return false;
    }
    return true;
  };

  let lo = 24;
  let hi = 640;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    heading.style.fontSize = `${mid}px`;
    if (fits(mid)) lo = mid;
    else hi = mid;
  }
  heading.style.fontSize = `${Math.floor(lo)}px`;
  return Math.floor(lo);
}

/**
 * Hero: the headline, left-aligned, fills the screen inside ~7.5% padding (measured fit;
 * type-hero is the CSS fallback) as the backdrop, and the portrait sits in
 * front of it in the bottom-right corner (facing the type); on
 * phones the two stack.
 */
export default function Hero() {
  const [revealComplete, setRevealComplete] = useState(false);
  const [isPreloaderDone, setIsPreloaderDone] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const portraitRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.__preloaderDone) {
      setIsPreloaderDone(true);
      return;
    }

    const handlePreloaderDone = () => setIsPreloaderDone(true);
    window.addEventListener("preloader:done", handlePreloaderDone);
    return () => window.removeEventListener("preloader:done", handlePreloaderDone);
  }, []);

  // Fit the headline to the space under the header; refit on resize and once
  // the reveal's word spans replace the placeholder.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const portrait = portraitRef.current;
    if (!section || !heading || !portrait) return;

    const fit = () => {
      const s = getComputedStyle(section);
      const available =
        section.clientHeight - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom);
      const p = getComputedStyle(portrait);
      const stacked = p.position !== "absolute";
      const portraitHeight = (fontSize: number) =>
        stacked
          ? PORTRAIT_SCALE_STACKED * fontSize
          : Math.min(
              PORTRAIT_SCREEN_SHARE * section.clientHeight,
              (PORTRAIT_MAX_WIDTH_SHARE * section.clientWidth) / PORTRAIT_ASPECT
            );

      const fontSize = stacked
        ? // Phones: portrait stacked under the headline, in flow.
          fitHeadline(
            heading,
            (fs) => available - portraitHeight(fs) - parseFloat(p.marginTop)
          )
        : (() => {
            // Desktop: headline top left, portrait bottom right at a fixed
            // share of the screen. Only words that sit over him horizontally
            // are limited: they may reach at most PORTRAIT_OVERLAP_EM into
            // the top of the portrait, so he only overlaps the bottoms of
            // their letters. Words clear of him can run lower.
            portrait.style.height = `${portraitHeight(0)}px`;
            const box = portrait.getBoundingClientRect();
            return fitHeadline(
              heading,
              () => available,
              (word, fs) =>
                word.right > box.left && word.bottom > box.top + PORTRAIT_OVERLAP_EM * fs
            );
          })();
      if (fontSize) portrait.style.height = `${portraitHeight(fontSize)}px`;
    };

    fit();
    document.fonts?.ready.then(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(section);
    return () => observer.disconnect();
  }, [isPreloaderDone]);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-svh min-h-[30rem] w-full flex-col justify-center overflow-hidden bg-background px-[7.5vw] pt-[max(7.5svh,6.5rem)] pb-[7.5svh] md:justify-start md:pt-[max(16svh,9rem)]"
    >
      <Typography
        ref={headingRef}
        variant="hero"
        as="h1"
        className="relative z-0 w-full text-left text-foreground"
      >
        {isPreloaderDone ? (
          <TextReveal
            delay={120}
            duration={animationDurations.verySlow}
            stagger={0.025}
            easing={animationEasings.robust}
          >
            {HEADLINE}
          </TextReveal>
        ) : (
          <span className="block whitespace-pre-line opacity-0">{HEADLINE}</span>
        )}
      </Typography>

      {/* Portrait: stacked under the headline on phones; from md, a floating
          vignette in the bottom-right corner inside the padding, facing left so he
          faces into the page towards the type. */}
      <span
        ref={portraitRef}
        aria-hidden
        data-illustration
        data-hero-portrait
        className={`pointer-events-none relative z-10 mt-6 block aspect-[1456/1253] h-[min(24svh,60vw)] self-end md:absolute md:right-[7.5vw] md:bottom-[7.5svh] md:mt-0 md:h-[min(26svh,20vw)] ${
          isPreloaderDone ? "opacity-100" : "opacity-0"
        }`}
      >
        <HeroPortrait />
        {/* Fades out to reveal; removed when done so it doesn't keep a compositing layer */}
        {isPreloaderDone && !revealComplete && (
          <span
            className="absolute inset-0 bg-background hero-portrait-reveal"
            onAnimationEnd={() => setRevealComplete(true)}
          />
        )}
      </span>
    </section>
  );
}
