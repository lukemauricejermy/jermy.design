import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Hero portrait: 3D renders (Gemini, Plocka-derived style) with the background
 * removed. A floating vignette, cropped at the waist by design, facing left
 * into the page with light from the upper left.
 *
 * Light and dark versions are the same shot cropped to the same box, stacked,
 * and cross-fade with the theme: in dark mode the laptop screen lights his
 * face blue. A wave pose (portrait-wave-v3.png) is ready for the video loop and
 * its reduced-motion still.
 *
 * Generated at 2K (--size 2K) so it stays sharp at 40vh on retina screens.
 * Source and process: art/ with scripts/generate-art.mjs and
 * scripts/cutout.swift (--keep-frame, then a shared crop). The previous
 * hand-drawn version lives in art/reference/character/.
 */
export const HERO_PORTRAIT = { width: 1456, height: 1253 };

// Desktop: 40svh tall, so ~47vh wide; phones: up to ~60vw.
const SIZES = "(min-width: 768px) 48vh, 60vw";

export function HeroPortrait({ className }: { className?: string }) {
  return (
    <span className={cn("relative block size-full", className)}>
      <Image
        src="/images/hero/portrait-typing-light.png"
        alt=""
        width={HERO_PORTRAIT.width}
        height={HERO_PORTRAIT.height}
        priority
        sizes={SIZES}
        className="absolute inset-0 size-full object-contain transition-opacity duration-[320ms] dark:opacity-0"
      />
      <Image
        src="/images/hero/portrait-typing-dark.png"
        alt=""
        width={HERO_PORTRAIT.width}
        height={HERO_PORTRAIT.height}
        priority
        sizes={SIZES}
        className="absolute inset-0 size-full object-contain opacity-0 transition-opacity duration-[320ms] dark:opacity-100"
      />
    </span>
  );
}
