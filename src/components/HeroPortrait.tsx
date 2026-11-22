import { LoopPortrait } from "@/components/LoopPortrait";

/**
 * Hero portrait: an 8-second seamless loop (Gemini Omni from the approved
 * still, keyed off green, transparent) of typing, looking up and waving.
 * Dark mode plays the same take relit for night. See LoopPortrait.
 */
export const HERO_PORTRAIT = { width: 694, height: 602 };

export function HeroPortrait({ className }: { className?: string }) {
  return (
    <LoopPortrait
      light={{ video: "/videos/hero-loop-v10-light", poster: "/images/hero/hero-loop-v10-light-poster.png" }}
      dark={{ video: "/videos/hero-loop-v10-dark", poster: "/images/hero/hero-loop-v10-dark-poster.png" }}
      width={HERO_PORTRAIT.width}
      height={HERO_PORTRAIT.height}
      sizes="(min-width: 768px) 48vh, 60vw"
      priority
      className={className}
    />
  );
}
