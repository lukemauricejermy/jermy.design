"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { StructuredText } from "react-datocms";
import { Card } from "@/components/ui/card";
import { H2, H3, Lead } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { FadeUp, TextReveal } from "@/components/animations";
import {
  animationDurations,
  animationEasings,
  animationDistances,
  animationDelays,
} from "@/lib/animation-config";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowTurnBackwardIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/** DatoCMS Structured Text field – matches StructuredText data prop */
export type StructuredTextData = React.ComponentProps<typeof StructuredText>["data"];

export type ValueIllustrationData = {
  src: string;
  /** Night version for pictures with a screen in them (lit by the screen). */
  darkSrc?: string;
  width: number;
  height: number;
};

type ValueWithSvg = {
  id: string;
  title: string;
  key: string;
  description: StructuredTextData;
  illustration: ValueIllustrationData | null;
};

/**
 * Where each card comes to rest on the stack, relative to its centre. Fixed
 * (not random) so server and client agree and the pile looks the same every
 * visit: a rough, hand-dealt stack, with the later cards straighter so the
 * top one stays readable.
 */
const REST = [
  { x: -22, y: 14, rotation: -7 },
  { x: 18, y: -10, rotation: 5 },
  { x: -10, y: -16, rotation: -4 },
  { x: 24, y: 10, rotation: 6 },
  { x: -16, y: 4, rotation: -3 },
  { x: 8, y: -4, rotation: 2 },
];
const restFor = (i: number) => REST[i % REST.length];

function ValueIllustration({
  illustration,
  className,
}: {
  illustration: ValueIllustrationData | null;
  className?: string;
}) {
  if (!illustration) return null;
  const { src, darkSrc, width, height } = illustration;
  const sizes = "(min-width: 1024px) 400px, 80vw";
  const img =
    "absolute inset-0 size-full object-cover object-top transition-opacity duration-[320ms]";
  return (
    <div
      className={cn(
        "relative",
        // Soft fade at the bottom so waist crops (and the arcade cabinet) dissolve.
        "[mask-image:linear-gradient(to_bottom,black_82%,transparent_98%)]",
        className
      )}
    >
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        sizes={sizes}
        loading="eager"
        className={cn(img, darkSrc && "dark:opacity-0")}
      />
      {darkSrc && (
        <Image
          src={darkSrc}
          alt=""
          width={width}
          height={height}
          sizes={sizes}
        loading="eager"
          className={cn(img, "opacity-0 dark:opacity-100")}
        />
      )}
    </div>
  );
}

const face = "absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]";

/** One playing card: illustration and title on the front, the detail on the back. */
function ValueCard({
  value,
  index,
  total,
  flipped,
  dealt,
  onSelect,
  onTurnBack,
  cardRef,
  flipperRef,
}: {
  value: ValueWithSvg;
  index: number;
  total: number;
  flipped: boolean;
  dealt: boolean;
  onSelect: () => void;
  onTurnBack: () => void;
  cardRef: (el: HTMLDivElement | null) => void;
  flipperRef: (el: HTMLDivElement | null) => void;
}) {
  const number = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  return (
    <div
      ref={cardRef}
      data-value-card
      className="@container absolute inset-0 will-change-transform"
      style={{ zIndex: index + 1 }}
    >
      <div
        ref={flipperRef}
        role="button"
        tabIndex={dealt ? 0 : -1}
        aria-hidden={!dealt}
        aria-pressed={flipped}
        aria-label={flipped ? `${value.title}: turn back over` : `${value.title}: turn over`}
        onClick={flipped ? onTurnBack : onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            (flipped ? onTurnBack : onSelect)();
          }
        }}
        className="relative size-full cursor-pointer rounded-4xl outline-none [transform-style:preserve-3d] focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {/* Front */}
        <Card className={cn(face, "flex flex-col gap-0 p-[8cqw] shadow-lg")}>
          {/* Fixed-height illustration (the square frame, cropped at the faded
              bottom), title straight below it: every title starts on the same line. */}
          <ValueIllustration
            illustration={value.illustration}
            className="h-[68cqw] w-full shrink-0"
          />
          <H3
            className="type-headline pt-[8cqw] text-left text-balance"
            // Proportional to the card (container width), like the padding, so
            // the title keeps the same share of the card at any size.
            style={{ fontSize: "11cqw" }}
          >
            {value.title}
          </H3>
        </Card>

        {/* Back */}
        <Card
          aria-hidden={!flipped}
          className={cn(face, "flex flex-col gap-0 p-6 md:p-7 shadow-lg [transform:rotateY(180deg)]")}
        >
          <span className="type-overline text-muted-foreground">{number}</span>
          <H3 className="type-title-lg pt-4 text-left">{value.title}</H3>
          <div className="type-body mt-4 min-h-0 flex-1 overflow-y-auto pb-6 text-foreground [mask-image:linear-gradient(to_bottom,black_calc(100%-2rem),transparent)] [&_p]:mb-3 [&_p:last-child]:mb-0">
            <StructuredText data={value.description} />
          </div>
          <div className="flex justify-end pt-4">
            <Button
              variant="secondary"
              size="icon-lg"
              type="button"
              tabIndex={flipped ? 0 : -1}
              aria-label="Turn the card back over"
              onClick={(e) => {
                e.stopPropagation();
                onTurnBack();
              }}
            >
              <HugeiconsIcon icon={ArrowTurnBackwardIcon} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function ValuesClient({ values }: { values: ValueWithSvg[] }) {
  const total = values.length;
  const [dealt, setDealt] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const deckAreaRef = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const flippers = useRef<(HTMLDivElement | null)[]>([]);
  const dealtRef = useRef(0);
  const selectedRef = useRef<number | null>(null);

  /** Off-screen starting point: below the viewport, thrown in from the right. */
  const offscreen = useCallback(
    (i: number) => ({
      x: 140 + (i % 2) * 60,
      y: window.innerHeight * 1.15,
      rotation: 28 + (i % 3) * 6,
      scale: 1.06,
    }),
    []
  );

  // Deal the cards while the section holds the screen (see the lock below).
  useLayoutEffect(() => {
    if (!total) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const els = cards.current.filter(Boolean) as HTMLDivElement[];
    flippers.current.forEach((f) => f && gsap.set(f, { transformPerspective: 1800 }));

    if (prefersReduced) {
      els.forEach((el, i) => gsap.set(el, restFor(i)));
      dealtRef.current = total;
      setDealt(total);
      return;
    }

    const ctx = gsap.context(() => {
      els.forEach((el, i) => gsap.set(el, offscreen(i)));

      const deal = (count: number) => {
        const prev = dealtRef.current;
        if (count === prev) return;
        dealtRef.current = count;
        setDealt(count);
        // Scrolling moves on from whatever card is turned over.
        if (selectedRef.current !== null) turnBack(selectedRef.current, true);

        if (count > prev) {
          for (let i = prev; i < count; i++) {
            gsap.killTweensOf(els[i]);
            // Dealt, not dropped: the card arrives slightly lifted, touches
            // down early (scale eases in to 1) and then slides to a stop on
            // friction. Everything decelerates; nothing overshoots.
            const { rotation, ...pos } = restFor(i);
            const delay = (i - prev) * 0.08;
            gsap.to(els[i], { ...pos, duration: 0.7, delay, ease: "power4.out" });
            gsap.to(els[i], { rotation, duration: 0.8, delay, ease: "power3.out" });
            gsap.to(els[i], { scale: 1, duration: 0.28, delay, ease: "power2.in" });
          }
        } else {
          for (let i = prev - 1; i >= count; i--) {
            gsap.killTweensOf(els[i]);
            gsap.to(els[i], {
              ...offscreen(i),
              duration: 0.45,
              delay: (prev - 1 - i) * 0.05,
              ease: "power2.in",
            });
          }
        }
      };

      const mm = gsap.matchMedia();
      mm.add(
        { desktop: "(min-width: 1024px)", mobile: "(max-width: 1023.98px)" },
        (c) => {
          // The part that fills the screen while dealing: the whole two-column
          // layout on desktop, just the deck on mobile.
          const stage = c.conditions?.desktop ? sectionRef.current : deckAreaRef.current;

          // No long pinned track: when the stage reaches the top of the screen
          // the page locks in place, and scrolling deals the cards instead of
          // moving the page. One card per gesture, where a gesture is a run of
          // input with no gap longer than GESTURE_GAP (so a trackpad flick and
          // its momentum count once); input that speeds up again is a fresh
          // push, and active scrolling is never held longer than MAX_HOLD.
          // After the last card the next scroll carries on down the page.
          // Going back up mirrors it: a short scroll up takes back the top card
          // (scrolling up into the section locks it again), and a long scroll
          // up throws every card back and lets the page go.
          const GESTURE_GAP = 160;
          const MIN_STEP = 700; // ms between cards, about the length of a deal
          const MAX_HOLD = 1400;
          const LONG_UP = 600; // px scrolled up in one gesture that means "let me out"
          let locked = false;
          let lockAt = 0;
          const root = document.documentElement;
          /**
           * While locked the page itself can't scroll (overflow hidden), which
           * also stops any smooth-scroll animation already in flight; wheel,
           * touch and key input still arrive and deal the cards.
           */
          const setLocked = (on: boolean, at = lockAt) => {
            locked = on;
            lockAt = at;
            root.style.overflow = on ? "hidden" : "";
            if (on) window.scrollTo({ top: at, behavior: "instant" });
          };
          let lastInput = 0;
          let recent: number[] = []; // the last few deltas of the current flow
          let lastStep = 0;
          let gestureUsed = false;
          let gestureDir: 1 | -1 = 1;
          let gestureDist = 0;
          let readyAt = 0;
          let touchY: number | null = null;

          const st = ScrollTrigger.create({
            trigger: stage,
            start: "top top",
            onEnter: (self) => {
              if (dealtRef.current >= total) return;
              // Loaded or jumped (a link, a reload) well past the section: just
              // show the stack. Scrolling can't travel this far in one frame.
              if (self.scroll() - self.start > window.innerHeight * 1.5) return deal(total);
              // Lock at the stage, swallowing any overshoot. One pixel inside:
              // sitting exactly on the start counts as having left it.
              lockFor(1, self.start + 1);
              deal(Math.max(dealtRef.current, 1));
            },
            onLeaveBack: (self) => {
              if (dealtRef.current > 0) {
                // Scrolling back up into the section: lock again so cards can be
                // taken back one at a time (a long scroll up still gets out).
                lockFor(-1, self.start + 1);
                return;
              }
              setLocked(false);
            },
            onUpdate: (self) => {
              // Anything that still moves the page while locked is undone.
              if (locked && Math.abs(self.scroll() - lockAt) > 2) {
                window.scrollTo({ top: lockAt, behavior: "instant" });
              }
            },
          });

          /** Lock in place, treating the gesture that carried us here as spent. */
          function lockFor(dir: 1 | -1, at: number) {
            setLocked(true, at);
            gestureUsed = true;
            gestureDir = dir;
            gestureDist = 0;
            lastStep = performance.now();
            readyAt = lastStep + MIN_STEP;
          }

          /** Deal the next card; after the last one, let the page go on down. */
          const next = () => {
            if (dealtRef.current >= total) {
              setLocked(false);
              return false;
            }
            deal(dealtRef.current + 1);
            return true;
          };

          /** Take back the top card; with none left, let the page go back up. */
          const prev = () => {
            if (dealtRef.current <= 0) {
              setLocked(false);
              return false;
            }
            deal(dealtRef.current - 1);
            return true;
          };

          /** Throw every card back and let the page scroll up. */
          const leaveUp = () => {
            deal(0);
            setLocked(false);
            return false;
          };

          /**
           * Scroll input. dir 1 is down, -1 is up; delta is the distance, always
           * positive. Returns true to swallow the event.
           */
          const input = (dir: 1 | -1, delta: number) => {
            const now = performance.now();
            const pause = now - lastInput > GESTURE_GAP;
            const turned = dir !== gestureDir;
            if (!locked) {
              // Keep tracking the flow, so arrival momentum isn't a new gesture.
              if (pause || turned) recent = [];
              recent.push(delta);
              if (recent.length > 8) recent.shift();
              lastInput = now;
              gestureDir = dir;
              return false;
            }
            if (pause || turned) recent = [];
            recent.push(delta);
            if (recent.length > 8) recent.shift();
            // Momentum decays; a new push speeds up again. Compare averages, not
            // single events, so one lumpy (coalesced) event can't count as a push.
            const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(xs.length, 1);
            const latest = avg(recent.slice(-3));
            const before = avg(recent.slice(0, -3));
            const push = recent.length >= 8 && latest > before * 2.5 && latest > 20;
            // The hold only lapses for firm, ongoing scrolling, not momentum's tail.
            const held = now - lastStep > MAX_HOLD && latest >= 30;
            if (pause || push || held || turned) gestureUsed = false;
            if (push) recent = recent.slice(-3);
            if (pause || turned) gestureDist = 0;
            gestureDist += delta;
            lastInput = now;
            gestureDir = dir;
            // A long scroll up means "let me out": all the cards go.
            if (dir < 0 && gestureDist > LONG_UP) return leaveUp();
            if (gestureUsed || now < readyAt) return true;
            gestureUsed = true;
            lastStep = now;
            readyAt = now + MIN_STEP;
            return dir > 0 ? next() : prev();
          };

          const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.deltaY === 0) return;
            if (input(e.deltaY > 0 ? 1 : -1, Math.abs(e.deltaY))) e.preventDefault();
          };
          const onTouchStart = (e: TouchEvent) => {
            touchY = e.touches[0]?.clientY ?? null;
          };
          const onTouchMove = (e: TouchEvent) => {
            const y = e.touches[0]?.clientY;
            if (touchY === null || y === undefined) return;
            const delta = touchY - y; // finger moving up = scrolling down
            touchY = y;
            if (Math.abs(delta) > 2 && input(delta > 0 ? 1 : -1, Math.abs(delta))) e.preventDefault();
          };
          const onKey = (e: KeyboardEvent) => {
            if (!locked || e.altKey || e.metaKey || e.ctrlKey) return;
            if (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable]"))
              return;
            // Space on a focused card turns it over instead.
            if (e.key === " " && e.target instanceof Element && e.target.closest("[data-value-card]")) return;
            const down = ["ArrowDown", "PageDown"].includes(e.key) || (e.key === " " && !e.shiftKey);
            const up = ["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey);
            if (e.key === "Home") leaveUp();
            else if (down && next()) e.preventDefault();
            else if (up && prev()) e.preventDefault();
          };
          window.addEventListener("wheel", onWheel, { passive: false });
          window.addEventListener("touchstart", onTouchStart, { passive: true });
          window.addEventListener("touchmove", onTouchMove, { passive: false });
          document.addEventListener("keydown", onKey);

          return () => {
            root.style.overflow = "";
            st.kill();
            window.removeEventListener("wheel", onWheel);
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
            document.removeEventListener("keydown", onKey);
          };
        }
      );
    });
    // Sections above load images after this runs and push the section down;
    // re-measure whenever the page's height changes so the lock engages on time.
    let lastHeight = document.body.scrollHeight;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const resizeObserver = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (h === lastHeight) return;
      lastHeight = h;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 100);
    });
    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(refreshTimer);
      ctx.revert();
    };
    // turnBack is stable (refs only)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, offscreen]);

  const select = useCallback(
    (i: number) => {
      if (i >= dealtRef.current) return;
      const prev = selectedRef.current;
      if (prev === i) return;
      if (prev !== null) turnBack(prev);
      selectedRef.current = i;
      setSelected(i);

      const card = cards.current[i];
      const flipper = flippers.current[i];
      if (!card || !flipper) return;
      gsap.killTweensOf([card, flipper]);
      const isTop = i === dealtRef.current - 1;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        gsap.set(card, { zIndex: 100, x: 0, y: 0, rotation: 0 });
        gsap.set(flipper, { rotationY: 180 });
        return;
      }

      const tl = gsap.timeline();
      if (!isTop) {
        // Slide a buried card out of the pile before it comes to the top.
        tl.to(card, {
          x: card.offsetWidth * 0.62,
          y: -24,
          rotation: 10,
          duration: 0.3,
          ease: animationEasings.smooth,
        });
      }
      tl.set(card, { zIndex: 100 });
      tl.to(card, { x: 0, y: -8, rotation: 0, scale: 1.02, duration: 0.55, ease: animationEasings.robust });
      tl.to(flipper, { rotationY: 180, duration: 0.7, ease: "power3.inOut" }, "<");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const turnBack = useCallback((i: number, quick = false) => {
    const card = cards.current[i];
    const flipper = flippers.current[i];
    if (selectedRef.current === i) {
      selectedRef.current = null;
      setSelected(null);
    }
    if (!card || !flipper) return;
    gsap.killTweensOf([card, flipper]);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rest = i < dealtRef.current ? restFor(i) : null;
    if (reduced) {
      gsap.set(flipper, { rotationY: 0 });
      gsap.set(card, { ...(rest ?? {}), scale: 1, zIndex: i + 1 });
      return;
    }
    const d = quick ? 0.35 : 0.6;
    gsap.to(flipper, { rotationY: 0, duration: d, ease: "power3.inOut" });
    if (rest) {
      gsap.to(card, {
        ...rest,
        scale: 1,
        duration: d,
        ease: animationEasings.robust,
        onComplete: () => {
          gsap.set(card, { zIndex: i + 1 });
        },
      });
    } else {
      gsap.set(card, { scale: 1, zIndex: i + 1 });
    }
  }, []);

  useEffect(() => {
    if (selected === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") turnBack(selected);
    };
    const onPointer = (e: PointerEvent) => {
      if (!deckAreaRef.current?.contains(e.target as Node)) turnBack(selected);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [selected, turnBack]);

  return (
    <section className="overflow-x-clip bg-background px-6 py-24 lg:py-0">
      <div
        ref={sectionRef}
        className="mx-auto grid max-w-[90rem] items-center gap-12 lg:h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16"
      >
        <div className="flex max-w-2xl flex-col gap-6">
          <H2>
            <TextReveal
              triggerOnScroll={true}
              delay={0}
              duration={750}
              stagger={0.015}
              easing={animationEasings.robust}
            >
              {`Let's talk about values`}
            </TextReveal>
          </H2>
          <FadeUp
            triggerOnScroll={true}
            delay={animationDelays.short}
            duration={animationDurations.default}
            distance={animationDistances.default}
            easing={animationEasings.smooth}
          >
            <Lead className="text-foreground">
              There&apos;s a core set of principles that guide how I work — part
              manifesto, part checklist. They&apos;re what I return to when I need
              to sense-check decisions and stay true to myself.
            </Lead>
          </FadeUp>
          <FadeUp
            triggerOnScroll={true}
            delay={animationDelays.medium}
            duration={animationDurations.default}
            distance={animationDistances.default}
            easing={animationEasings.smooth}
          >
            <Lead className="text-foreground">
              If you know me, you&apos;ve probably heard these before.
            </Lead>
          </FadeUp>
        </div>

        <div
          ref={deckAreaRef}
          className="flex h-svh flex-col items-center justify-center gap-8 lg:h-auto"
        >
          <div
            className="relative aspect-[5/7]"
            // Sized by whichever is tightest: a cap, the column (leaving room
            // for the stack's tilt), the screen width, or the screen height.
            style={{ width: "min(36rem, 85%, 78vw, calc((100svh - 10rem) * 5 / 7))" }}
          >
            {values.map((value, i) => (
              <ValueCard
                key={value.id}
                value={value}
                index={i}
                total={total}
                flipped={selected === i}
                dealt={i < dealt}
                onSelect={() => select(i)}
                onTurnBack={() => turnBack(i)}
                cardRef={(el) => {
                  cards.current[i] = el;
                }}
                flipperRef={(el) => {
                  flippers.current[i] = el;
                }}
              />
            ))}
          </div>
          {/* No visible caption; screen readers hear each card as it's dealt. */}
          <p className="sr-only" aria-live="polite">
            {dealt} of {total} values dealt
          </p>
        </div>
      </div>
    </section>
  );
}
