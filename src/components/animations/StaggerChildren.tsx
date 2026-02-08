"use client";

import { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";
import {
  animationDurations,
  animationEasings,
  animationDistances,
} from "@/lib/animation-config";

interface StaggerChildrenProps {
  children: ReactNode;
  delayStart?: number;
  delayBetween?: number;
  duration?: number;
  distance?: number;
  easing?: string;
  className?: string;
}

export function StaggerChildren({
  children,
  delayStart = 0,
  delayBetween = 100,
  duration = animationDurations.default,
  distance = animationDistances.default,
  easing = animationEasings.smooth,
  className = "",
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Get direct children only
    const children = Array.from(container.children);

    // Set initial state for all children
    gsap.set(children, {
      y: distance,
      opacity: 0,
    });

    // Animate each child with staggered delay
    children.forEach((child, index) => {
      gsap.to(child, {
        y: 0,
        opacity: 1,
        duration: duration / 1000, // Convert ms to seconds
        delay: (delayStart + index * delayBetween) / 1000,
        ease: easing,
      });
    });

    return () => {
      gsap.killTweensOf(children);
    };
  }, [delayStart, delayBetween, duration, distance, easing]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
