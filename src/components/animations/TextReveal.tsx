"use client";

import { useLayoutEffect, useRef, useMemo, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  animationDurations,
  animationEasings,
  animationStaggers,
} from "@/lib/animation-config";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TextRevealProps {
  children: string | ReactNode;
  delay?: number;
  duration?: number;
  stagger?: number;
  easing?: string;
  className?: string;
  triggerOnScroll?: boolean;
}

// Split text into lines (by \n) and words (by spaces), preserving structure for proper wrapping
// Words stay together (no mid-word breaks) and each word has its own overflow for the reveal
function splitTextIntoWordsAndChars(text: string): { lines: string[][] } {
  const lines = text.split("\n");
  const result: string[][] = lines.map((line) =>
    line.split(/\s+/).filter(Boolean)
  );
  return { lines: result };
}

export function TextReveal({
  children,
  delay = 0,
  duration = animationDurations.slow,
  stagger = animationStaggers.default,
  easing = animationEasings.robust,
  className = "",
  triggerOnScroll = false,
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Compute textData immediately during render, not in useEffect
  const textData = useMemo(() => {
    if (typeof children === "string") {
      return splitTextIntoWordsAndChars(children);
    }
    return null;
  }, [children]);

  useLayoutEffect(() => {
    if (!textData || !ref.current) return;

    const element = ref.current;
    const charSpans = element.querySelectorAll(".char");

    if (charSpans.length === 0) return;

    // Set initial state before paint - characters start below, fully opaque
    // Use 110% to add buffer and prevent sub-pixel peeking through overflow
    gsap.set(charSpans, {
      y: "110%",
      opacity: 1,
    });

    let scrollTriggerInstance: ScrollTrigger | null = null;
    if (triggerOnScroll) {
        // Scroll-triggered animation
        const animation = gsap.to(charSpans, {
          y: "0%",
          duration: duration / 1000,
          delay: delay / 1000,
          stagger: stagger,
          ease: easing,
        });

      scrollTriggerInstance = ScrollTrigger.create({
        trigger: element,
        start: "top 85%",
        animation: animation,
        once: true,
      });
    } else {
      // Page load animation
      gsap.to(charSpans, {
        y: "0%",
        duration: duration / 1000,
        delay: delay / 1000,
        stagger: stagger,
        ease: easing,
      });
    }

    return () => {
      if (scrollTriggerInstance) scrollTriggerInstance.kill();
      if (ref.current) {
        const spans = ref.current.querySelectorAll(".char");
        gsap.killTweensOf(spans);
      }
    };
  }, [textData, delay, duration, stagger, easing, triggerOnScroll]);

  if (typeof children === "string" && textData) {
    const { lines } = textData;

    return (
      <div ref={ref} className={`overflow-clip ${className}`}>
        {lines.map((lineWords, lineIndex) => (
          <span
            key={lineIndex}
            className="block overflow-clip"
            style={{ paddingBottom: "0.5rem" }}
          >
            {lineWords.map((word, wordIndex) => (
              <span key={`${lineIndex}-${wordIndex}`}>
                {wordIndex > 0 && " "}
                <span
                  className="inline-block whitespace-nowrap overflow-clip align-top leading-none"
                  style={{ paddingBottom: "0.5rem" }}
                >
                  {word.split("").map((char, charIndex) => (
                    <span
                      key={`${lineIndex}-${wordIndex}-${charIndex}`}
                      className="char inline-block"
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </span>
        ))}
      </div>
    );
  }

  // If children is not a string, render as-is (for complex content)
  return <div className={className}>{children}</div>;
}
