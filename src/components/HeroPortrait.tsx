"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Hero portrait: an 8-second seamless loop (Gemini Omni from the approved
 * still, keyed off green, transparent) of typing, looking up and waving.
 * Light mode plays the daylight loop; dark mode plays the same take relit
 * for night by the model (a follow-up turn on the stored interaction), so
 * every frame matches and both share one crop (scripts/key-video.py).
 *
 * Each mode shows its first frame as a poster, so the portrait is in place
 * the instant the preloader reveals the page; the video takes over once it
 * plays. Reduced motion keeps the posters. Both loops run so switching theme
 * is instant, and the incoming one is synced to the same point in the loop.
 *
 * Transparent video needs two encodes: VP9 WebM with alpha (Chrome,
 * Firefox, Edge) and HEVC with alpha (Safari, which can't do VP9 alpha).
 * Process: scripts/generate-video.mjs, then ffmpeg (see CLAUDE.md).
 */
export const HERO_PORTRAIT = { width: 694, height: 602 };

const MODES = {
  light: { video: "/videos/hero-loop-v10-light", poster: "/images/hero/hero-loop-v10-light-poster.png" },
  dark: { video: "/videos/hero-loop-v10-dark", poster: "/images/hero/hero-loop-v10-dark-poster.png" },
} as const;

function prefersSafariHevc() {
  const ua = navigator.userAgent;
  return /safari/i.test(ua) && !/chrome|chromium|crios|android|edg/i.test(ua);
}

export function HeroPortrait({ className }: { className?: string }) {
  const [ext, setExt] = useState<"mov" | "webm" | null>(null);
  const [playing, setPlaying] = useState({ light: false, dark: false });
  const lightRef = useRef<HTMLVideoElement>(null);
  const darkRef = useRef<HTMLVideoElement>(null);

  // Pick the encode on the client (the server can't know the browser).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExt(prefersSafariHevc() ? "mov" : "webm");
  }, []);

  // On theme change, jump the incoming loop to where the outgoing one is.
  useEffect(() => {
    const root = document.documentElement;
    let wasDark = root.classList.contains("dark");
    const observer = new MutationObserver(() => {
      const isDark = root.classList.contains("dark");
      if (isDark === wasDark) return;
      const from = isDark ? lightRef.current : darkRef.current;
      const to = isDark ? darkRef.current : lightRef.current;
      if (from && to && to.duration) to.currentTime = from.currentTime % to.duration;
      wasDark = isDark;
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const layer = "absolute inset-0 size-full object-contain transition-opacity duration-[320ms]";
  const show = { light: "dark:opacity-0", dark: "opacity-0 dark:opacity-100" };

  return (
    <span className={cn("relative block size-full", className)}>
      {(["light", "dark"] as const).map((mode) => (
        <span key={mode} className="contents">
          <Image
            src={MODES[mode].poster}
            alt=""
            width={HERO_PORTRAIT.width}
            height={HERO_PORTRAIT.height}
            priority={mode === "light"}
            sizes="(min-width: 768px) 48vh, 60vw"
            className={cn(layer, show[mode], playing[mode] && "invisible")}
          />
          {ext && (
            <video
              ref={mode === "light" ? lightRef : darkRef}
              src={`${MODES[mode].video}.${ext}`}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden
              onPlaying={() => setPlaying((p) => ({ ...p, [mode]: true }))}
              className={cn(layer, show[mode], !playing[mode] && "invisible")}
            />
          )}
        </span>
      ))}
    </span>
  );
}
