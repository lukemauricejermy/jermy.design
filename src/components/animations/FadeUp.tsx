"use client";

import { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";
import {
  animationDurations,
  animationEasings,
  animationDistances,
} from "@/lib/animation-config";

interface FadeUpProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  easing?: string;
  className?: string;
}

export function FadeUp({
  children,
  delay = 0,
  duration = animationDurations.default,
  distance = animationDistances.default,
  easing = animationEasings.smooth,
  className = "",
}: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Set initial state
    gsap.set(element, {
      y: distance,
      opacity: 0,
    });

    // Animate in
    gsap.to(element, {
      y: 0,
      opacity: 1,
      duration: duration / 1000, // Convert ms to seconds
      delay: delay / 1000,
      ease: easing,
    });

    return () => {
      gsap.killTweensOf(element);
    };
  }, [delay, duration, distance, easing]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
