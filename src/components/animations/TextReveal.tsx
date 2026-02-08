"use client";

import { useEffect, useRef, useMemo, ReactNode } from "react";
import { gsap } from "gsap";
import {
  animationDurations,
  animationEasings,
  animationStaggers,
} from "@/lib/animation-config";

interface TextRevealProps {
  children: string | ReactNode;
  delay?: number;
  duration?: number;
  stagger?: number;
  easing?: string;
  className?: string;
}

// Helper function to split text into characters, preserving line breaks
function splitTextIntoChars(text: string): { chars: string[]; lineBreakIndices: number[] } {
  const lines = text.split("\n");
  const chars: string[] = [];
  const lineBreakIndices: number[] = [];
  let charCount = 0;

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      // Mark where the previous line ended (before starting new line)
      lineBreakIndices.push(charCount);
    }
    line.split("").forEach((char) => {
      chars.push(char === " " ? "\u00A0" : char);
      charCount++;
    });
  });

  return { chars, lineBreakIndices };
}

export function TextReveal({
  children,
  delay = 0,
  duration = animationDurations.slow,
  stagger = animationStaggers.default,
  easing = animationEasings.robust,
  className = "",
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Compute textData immediately during render, not in useEffect
  const textData = useMemo(() => {
    if (typeof children === "string") {
      const data = splitTextIntoChars(children);
      console.log("TextReveal: Text data computed", { charCount: data.chars.length, lineBreaks: data.lineBreakIndices });
      return data;
    }
    return null;
  }, [children]);

  useEffect(() => {
    if (!textData || !ref.current) {
      console.log("TextReveal: Waiting for textData or ref", { hasTextData: !!textData, hasRef: !!ref.current });
      return;
    }

    const element = ref.current;
    
    // Use a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const charSpans = element.querySelectorAll(".char");
      console.log("TextReveal: Found character spans", charSpans.length);

      if (charSpans.length === 0) {
        console.warn("TextReveal: No character spans found!");
        return;
      }

      // Set initial state - characters start below, fully opaque
      gsap.set(charSpans, {
        y: "100%",
        opacity: 1,
      });
      console.log("TextReveal: Initial state set");

      // Animate characters up - continuous stagger across all characters
      gsap.to(charSpans, {
        y: "0%",
        duration: duration / 1000, // Convert ms to seconds
        delay: delay / 1000,
        stagger: stagger,
        ease: easing,
        onStart: () => console.log("TextReveal: Animation started"),
        onComplete: () => console.log("TextReveal: Animation completed"),
      });
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      if (ref.current) {
        const charSpans = ref.current.querySelectorAll(".char");
        gsap.killTweensOf(charSpans);
      }
    };
  }, [textData, delay, duration, stagger, easing]);

  if (typeof children === "string" && textData) {
    const { chars, lineBreakIndices } = textData;
    const lines: string[][] = [];
    let currentLineStart = 0;

    lineBreakIndices.forEach((breakIndex) => {
      // Add line from current start to break index
      lines.push(chars.slice(currentLineStart, breakIndex));
      currentLineStart = breakIndex;
    });

    // Add the last line (from last break to end)
    if (currentLineStart < chars.length) {
      lines.push(chars.slice(currentLineStart));
    }

    // If no line breaks, just one line
    if (lines.length === 0) {
      lines.push(chars);
    }

    return (
      <div ref={ref} className={`overflow-hidden ${className}`}>
        {lines.map((line, lineIndex) => {
          return (
            <span 
              key={lineIndex} 
              className="block overflow-hidden"
              style={{ 
                paddingBottom: "0.5rem" // Extra space for descenders (g, y, p, etc.)
              }}
            >
              {line.map((char, charIndex) => {
                return (
                  <span 
                    key={`${lineIndex}-${charIndex}`} 
                    className="char inline-block"
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          );
        })}
      </div>
    );
  }

  // If children is not a string, render as-is (for complex content)
  return <div className={className}>{children}</div>;
}
