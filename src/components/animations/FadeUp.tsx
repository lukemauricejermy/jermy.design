"use client";

import { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  animationDurations,
  animationEasings,
  animationDistances,
} from "@/lib/animation-config";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface FadeUpProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  easing?: string;
  className?: string;
  triggerOnScroll?: boolean;
}

export function FadeUp({
  children,
  delay = 0,
  duration = animationDurations.default,
  distance = animationDistances.default,
  easing = animationEasings.smooth,
  className = "",
  triggerOnScroll = false,
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

    if (triggerOnScroll) {
      // Scroll-triggered animation
      const animation = gsap.to(element, {
        y: 0,
        opacity: 1,
        duration: duration / 1000,
        delay: delay / 1000,
        ease: easing,
      });

      ScrollTrigger.create({
        trigger: element,
        start: "top 85%",
        animation: animation,
        once: true,
      });

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === element) {
            trigger.kill();
          }
        });
        gsap.killTweensOf(element);
      };
    } else {
      // Page load animation
      gsap.to(element, {
        y: 0,
        opacity: 1,
        duration: duration / 1000,
        delay: delay / 1000,
        ease: easing,
      });

      return () => {
        gsap.killTweensOf(element);
      };
    }
  }, [delay, duration, distance, easing, triggerOnScroll]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
