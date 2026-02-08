import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  animationDurations,
  animationEasings,
  animationDelays,
} from "@/lib/animation-config";

/**
 * Hook that creates and manages a GSAP timeline for choreographed animations
 * Returns the timeline instance and cleanup function
 */
export function useAnimationTimeline() {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    timelineRef.current = gsap.timeline();

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return timelineRef.current;
}

/**
 * Export timing constants for use across components
 */
export const timing = {
  durations: animationDurations,
  easings: animationEasings,
  delays: animationDelays,
} as const;
