"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * A transparent looping character video with a day take (light mode) and the
 * same take relit for night (dark mode), shared by the hero and the footer.
 * Both takes share one crop (scripts/key-video.py), so they line up exactly.
 *
 * Each mode shows its first frame as a poster, so the character is in place
 * at once; the video takes over once it plays. Reduced motion keeps the
 * posters. Both loops run so switching theme is instant, and the incoming one
 * is synced to the same point in the loop.
 *
 * Transparent video needs two encodes: VP9 WebM with alpha (Chrome,
 * Firefox, Edge) and HEVC with alpha (Safari, which can't do VP9 alpha).
 * Process: scripts/generate-video.mjs, then ffmpeg (see CLAUDE.md).
 */
export type LoopPortraitSource = {
  /** Video path without extension: `.webm` and `.mov` must both exist. */
  video: string;
  poster: string;
};

export function LoopPortrait({
  light,
  dark,
  width,
  height,
  sizes,
  priority = false,
  className,
  layerClassName,
}: {
  light: LoopPortraitSource;
  dark: LoopPortraitSource;
  width: number;
  height: number;
  sizes: string;
  /** Preload the light poster (above the fold only). */
  priority?: boolean;
  className?: string;
  /** Extra classes for each poster and video layer, e.g. `object-bottom`. */
  layerClassName?: string;
}) {
  const [ext, setExt] = useState<"mov" | "webm" | null>(null);
  const [playing, setPlaying] = useState({ light: false, dark: false });
  const lightRef = useRef<HTMLVideoElement>(null);
  const darkRef = useRef<HTMLVideoElement>(null);
  const modes = { light, dark };

  // Pick the encode on the client (the server can't know the browser).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ua = navigator.userAgent;
    const safari = /safari/i.test(ua) && !/chrome|chromium|crios|android|edg/i.test(ua);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExt(safari ? "mov" : "webm");
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

  const layer = cn(
    "absolute inset-0 size-full object-contain",
    layerClassName
  );
  const show = { light: "dark:opacity-0", dark: "opacity-0 dark:opacity-100" };

  return (
    <span className={cn("relative block size-full", className)}>
      {(["light", "dark"] as const).map((mode) => (
        <span key={mode} className="contents">
          <Image
            src={modes[mode].poster}
            alt=""
            width={width}
            height={height}
            priority={priority && mode === "light"}
            sizes={sizes}
            className={cn(layer, show[mode], playing[mode] && "invisible")}
          />
          {ext && (
            <video
              ref={mode === "light" ? lightRef : darkRef}
              src={`${modes[mode].video}.${ext}`}
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
