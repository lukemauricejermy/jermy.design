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

interface StaggerChildrenProps {
  children: ReactNode;
  delayStart?: number;
  delayBetween?: number;
  duration?: number;
  distance?: number;
  easing?: string;
  className?: string;
  triggerOnScroll?: boolean;
}

export function StaggerChildren({
  children,
  delayStart = 0,
  delayBetween = 100,
  duration = animationDurations.default,
  distance = animationDistances.default,
  easing = animationEasings.smooth,
  className = "",
  triggerOnScroll = false,
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Get direct children only
    const childElements = Array.from(container.children);

    // Set initial state for all children
    gsap.set(childElements, {
      y: distance,
      opacity: 0,
    });

    if (triggerOnScroll) {
      // Scroll-triggered animation with stagger
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
          once: true,
        },
      });

      childElements.forEach((child, index) => {
        timeline.to(
          child,
          {
            y: 0,
            opacity: 1,
            duration: duration / 1000,
            ease: easing,
          },
          (delayStart + index * delayBetween) / 1000
        );
      });

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === container) {
            trigger.kill();
          }
        });
        gsap.killTweensOf(childElements);
      };
    } else {
      // Page load animation
      childElements.forEach((child, index) => {
        gsap.to(child, {
          y: 0,
          opacity: 1,
          duration: duration / 1000,
          delay: (delayStart + index * delayBetween) / 1000,
          ease: easing,
        });
      });

      return () => {
        gsap.killTweensOf(childElements);
      };
    }
  }, [delayStart, delayBetween, duration, distance, easing, triggerOnScroll]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
