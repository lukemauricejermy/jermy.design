import Image from "next/image";
import type { ReactNode } from "react";
import { FadeUp } from "@/components/animations";
import {
  animationDelays,
  animationDistances,
  animationDurations,
  animationEasings,
} from "@/lib/animation-config";

// Bespoke hero compositions, keyed by case slug, for cases whose hero is
// built from illustration parts rather than a single image.

/**
 * elsewhere: one big "burst", the confetti of little objects from the
 * studio's design system (Sprout), covering the hero and bleeding off its
 * edges, with the white wordmark appearing in the middle. The artwork is a hero
 * version made in the Sprout file (Illustrations page, "Burst / jermy.design
 * hero"): elsewhere blue ground, blues turned white, objects pulled toward the
 * centre so the crop keeps them. The wordmark alone (no door) sits on top.
 */
function ElsewhereHeroArt() {
  const dir = "/images/cases/elsewhere-v1";
  return (
    <div className="relative h-full w-full overflow-hidden [container-type:size]">
      {/* A square that covers the hero whatever its shape. */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2"
        style={{ width: "calc(max(100cqw, 100cqh) * 1.08)" }}
      >
        <Image src={`${dir}/burst-hero-v2.png`} alt="" fill priority sizes="100vw" className="object-contain" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <FadeUp
          delay={animationDelays.medium}
          duration={animationDurations.slow}
          distance={animationDistances.default}
          easing={animationEasings.smooth}
          className="relative flex w-[min(60%,26rem)] items-center justify-center"
        >
          <Image
            src={`${dir}/wordmark-white.svg`}
            alt="elsewhere"
            width={948}
            height={158}
            priority
            unoptimized
            className="relative h-auto w-full"
          />
        </FadeUp>
      </div>
    </div>
  );
}

export const HERO_ART: Record<string, () => ReactNode> = {
  elsewhere: ElsewhereHeroArt,
};
