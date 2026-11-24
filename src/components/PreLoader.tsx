"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import { Badge } from "@/components/ui/badge";
import {
  animationDistances,
  animationDurations,
  animationEasings,
} from "@/lib/animation-config";

const MIN_DISPLAY_MS = 500;
const MAX_DISPLAY_MS = 2000;
const HOLD_AFTER_TEXT_IN_MS = 500;
const TEXT_INTRO_DELAY_MS = 180;
const TEXT_FADE_DURATION_MS = animationDurations.default + 50;
const TEXT_MOVE_DISTANCE = animationDistances.default;
const SWIPE_DURATION_SECONDS = animationDurations.verySlow / 1000;
const SWIPE_EXIT_Y_PERCENT = -120;

/** Morning 04:00–12:00, afternoon 12:00–17:00, evening otherwise. */
function timeOfDay(now: Date) {
  const h = now.getHours();
  if (h >= 4 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  return "evening";
}

/** The visitor's city, from the cookie set by src/proxy.ts (Vercel geo IP). */
function visitorCity() {
  const match = document.cookie.match(/(?:^|;\s*)visitor-city=([^;]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(decodeURIComponent(match[1])).trim() || null;
  } catch {
    return null;
  }
}

/**
 * The visitor's country as a lower-case ISO code, from the cookie set by
 * src/proxy.ts. Flags are circle-flags (MIT), self-hosted in public/flags.
 */
let cachedCountry: string | null | undefined;
function getCountry() {
  if (cachedCountry === undefined) {
    const match = document.cookie.match(/(?:^|;\s*)visitor-country=([a-z]{2})(?:;|$)/);
    cachedCountry = match ? match[1] : null;
  }
  return cachedCountry;
}

/**
 * "Good evening, Copenhagen." in the visitor's own local time, or just
 * "Good evening." when we don't know where they are. Read on the client
 * only (the server knows neither), so it renders empty on the server.
 */
let cachedGreeting: string | null = null;
function getGreeting() {
  if (cachedGreeting === null) {
    const city = visitorCity();
    cachedGreeting = `Good ${timeOfDay(new Date())}${city ? `, ${city}` : ""}.`;
  }
  return cachedGreeting;
}
const noSubscribe = () => () => {};

declare global {
  interface Window {
    __preloaderDone?: boolean;
  }
}

export function PreLoader() {
  const greeting = useSyncExternalStore(noSubscribe, getGreeting, () => "");
  const country = useSyncExternalStore(noSubscribe, getCountry, () => null);
  const [flagFailed, setFlagFailed] = useState(false);
  const showFlag = country !== null && !flagFailed;
  const [isVisible, setIsVisible] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const hasDismissedRef = useRef(false);
  const hasSignaledDoneRef = useRef(false);
  const startTimeRef = useRef(0);
  const introCompleteAtRef = useRef(0);

  useEffect(() => {
    const overlay = overlayRef.current;
    const text = textRef.current;
    if (!overlay || !text) return;

    startTimeRef.current = Date.now();
    introCompleteAtRef.current =
      startTimeRef.current +
      TEXT_INTRO_DELAY_MS +
      TEXT_FADE_DURATION_MS +
      HOLD_AFTER_TEXT_IN_MS;

    gsap.set(text, { opacity: 0, y: TEXT_MOVE_DISTANCE });
    gsap.to(text, {
      opacity: 1,
      y: 0,
      delay: TEXT_INTRO_DELAY_MS / 1000,
      duration: TEXT_FADE_DURATION_MS / 1000,
      ease: animationEasings.smooth,
    });

    const dismiss = () => {
      if (hasDismissedRef.current) return;
      hasDismissedRef.current = true;

      const signalDone = () => {
        if (hasSignaledDoneRef.current) return;
        hasSignaledDoneRef.current = true;
        window.__preloaderDone = true;
        window.dispatchEvent(new CustomEvent("preloader:done"));
      };

      const exitTimeline = gsap.timeline({
        onComplete: () => {
          signalDone();
          setIsVisible(false);
        },
      });

      exitTimeline.to(text, {
        opacity: 0,
        y: -TEXT_MOVE_DISTANCE,
        duration: TEXT_FADE_DURATION_MS / 1000,
        ease: animationEasings.smooth,
      });

      exitTimeline.to(overlay, {
        yPercent: SWIPE_EXIT_Y_PERCENT,
        duration: SWIPE_DURATION_SECONDS,
        ease: animationEasings.robust,
        onUpdate: () => {
          const currentYPercent = Number(gsap.getProperty(overlay, "yPercent"));
          if (currentYPercent <= -100) signalDone();
        },
      });
    };

    const dismissWhenReady = () => {
      const now = Date.now();
      const elapsed = Date.now() - startTimeRef.current;
      const minDisplayRemaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      const introRemaining = Math.max(0, introCompleteAtRef.current - now);
      const remaining = Math.max(minDisplayRemaining, introRemaining);
      window.setTimeout(dismiss, remaining);
    };

    const maxTimeout = window.setTimeout(dismiss, MAX_DISPLAY_MS);

    if (document.readyState === "complete") {
      dismissWhenReady();
    } else {
      window.addEventListener("load", dismissWhenReady, { once: true });
    }

    return () => {
      window.clearTimeout(maxTimeout);
      window.removeEventListener("load", dismissWhenReady);
      if (overlayRef.current) gsap.killTweensOf(overlayRef.current);
      if (textRef.current) gsap.killTweensOf(textRef.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
    >
      <div ref={textRef} className="opacity-0">
        {greeting && (
          <Badge
            variant="secondary"
            size="lg"
            // With a flag, the pill wraps it evenly: the same 0.25rem inset
            // above, below and to its left, so the flag sits concentric in
            // the rounded end. The pill keeps its height (text 1em + 1rem).
            className={showFlag ? "gap-2 py-1 pl-1" : undefined}
          >
            {showFlag && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/flags/${country}.svg`}
                alt=""
                width={24}
                height={24}
                onError={() => setFlagFailed(true)}
                className="size-[calc(1em+0.5rem)] shrink-0 rounded-full"
              />
            )}
            {greeting}
          </Badge>
        )}
      </div>
    </div>
  );
}
