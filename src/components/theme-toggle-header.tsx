"use client";

import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { useEffect, useState, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Light/dark switch styled as the preset's segmented control (Tabs list):
 * muted pill track, background-coloured active segment that slides across.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [localIsDark, setLocalIsDark] = useState(false);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    // resolvedTheme resolves "system" to "light" or "dark"
    if (resolvedTheme && !isAnimatingRef.current) {
      setLocalIsDark(resolvedTheme === "dark");
    }
    // Fade in after mount, matching header timing
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [resolvedTheme]);

  const track = cn(
    // Below sm the switch collapses to one segment showing the current mode,
    // so the header fits a 375px screen; tapping still toggles.
    "relative inline-flex h-9 w-9 shrink-0 items-center rounded-full bg-muted p-1 sm:w-[4.5rem]",
    className
  );

  if (!mounted) {
    return <div className={track} aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    if (isAnimatingRef.current) return; // Prevent double-clicks during animation

    const newTheme = isDark ? "light" : "dark";
    isAnimatingRef.current = true;

    // Move the indicator first, then switch theme on the next frames so the
    // slide and the colour transition start together.
    setLocalIsDark(newTheme === "dark");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTheme(newTheme);
        setTimeout(() => {
          isAnimatingRef.current = false;
        }, 320);
      });
    });
  };

  const icon = (active: boolean) =>
    cn(
      "size-4 transition-colors",
      active ? "text-foreground" : "text-foreground/60 dark:text-muted-foreground"
    );

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        track,
        "group cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
      )}
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 900ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sliding active segment */}
      <span
        aria-hidden
        data-dark={localIsDark}
        className="absolute inset-y-1 left-1 w-[calc(100%-0.5rem)] rounded-full border border-transparent bg-background transition-transform duration-[320ms] ease-[cubic-bezier(0.4,0,0.2,1)] sm:w-[calc(50%-0.25rem)] sm:data-[dark=true]:translate-x-full dark:border-input dark:bg-input/30"
      />

      <span className="relative z-10 flex h-full w-full items-center">
        <span
          className={cn(
            "h-full flex-1 items-center justify-center sm:flex",
            localIsDark ? "hidden" : "flex"
          )}
        >
          <HugeiconsIcon icon={Sun03Icon} className={icon(!localIsDark)} />
        </span>
        <span
          className={cn(
            "h-full flex-1 items-center justify-center sm:flex",
            localIsDark ? "flex" : "hidden"
          )}
        >
          <HugeiconsIcon icon={Moon02Icon} className={icon(localIsDark)} />
        </span>
      </span>
    </button>
  );
}
