"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Lead } from "@/components/ui/typography";
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

function getTimeOfDayGreeting(now: Date) {
  const secondsSinceMidnight =
    now.getHours() * 60 * 60 + now.getMinutes() * 60 + now.getSeconds();
  const morningStart = 4 * 60 * 60 + 1; // 04:00:01
  const afternoonStart = 12 * 60 * 60 + 1; // 12:00:01
  const eveningStart = 16 * 60 * 60 + 1; // 16:00:01
  const nightStart = 20 * 60 * 60 + 1; // 20:00:01

  if (secondsSinceMidnight >= morningStart && secondsSinceMidnight <= 12 * 60 * 60)
    return "👋 Good morning friend!";
  if (secondsSinceMidnight >= afternoonStart && secondsSinceMidnight <= 16 * 60 * 60)
    return "👋 Good afternoon friend!";
  if (secondsSinceMidnight >= eveningStart && secondsSinceMidnight <= 20 * 60 * 60)
    return "👋 Good evening friend!";
  return "🦉 Hello there, night owl!";
}

declare global {
  interface Window {
    __preloaderDone?: boolean;
  }
}

export function PreLoader() {
  const greeting = getTimeOfDayGreeting(new Date());
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary"
    >
      <div ref={textRef} className="opacity-0">
        <Lead className="text-foreground text-xl md:text-2xl">{greeting}</Lead>
      </div>
    </div>
  );
}
