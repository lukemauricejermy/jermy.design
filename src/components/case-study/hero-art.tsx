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

/**
 * Plocka: the lemon wordmark, then the Grow screen in a phone frame on Plocka
 * green, lit by a soft glow, with real components from the app in two straight
 * columns either side (soil, ground and frost tiles on the left; the soil read,
 * daylight and a crop card on the right), cut from light-theme captures.
 * Nothing is tilted: both columns share a top line and sit the same gap from
 * the phone. Everything is sized by the hero's height so the composition keeps
 * its shape; narrow heroes (phones) keep just the phone.
 */
const PLOCKA_COLUMN = "28cqh"; // column width
const PLOCKA_GAP = "4cqh"; // gap between phone and columns, and between items
// r is the corner radius in source pixels; 999 makes a pill.
type PlockaFloat = { src: string; w: number; h: number; r: number; alt: string };
// Each entry is a row; most rows hold one component, the soil read holds its two chips.
const PLOCKA_LEFT: PlockaFloat[][] = [
  [{ src: "tile-soil-v3", w: 496, h: 298, r: 70, alt: "Soil: 0 °C, too cold to sow" }],
  [{ src: "tile-ground-v3", w: 496, h: 298, r: 70, alt: "Ground: under snow" }],
  [{ src: "tile-frost-v3", w: 496, h: 298, r: 70, alt: "Frost tonight, 7 frosty nights ahead" }],
];
const PLOCKA_RIGHT: PlockaFloat[][] = [
  [
    { src: "chip-clay-v3", w: 246, h: 96, r: 999, alt: "Clay loam" },
    { src: "chip-acidic-v3", w: 329, h: 96, r: 999, alt: "Acidic, pH 5.2" },
  ],
  [{ src: "tile-daylight-v3", w: 496, h: 298, r: 70, alt: "Daylight: 6h 5m, losing 5 minutes a day" }],
  [{ src: "card-tomato-v3", w: 536, h: 778, r: 64, alt: "Crop card: tomato, a little trickier" }],
];

function PlockaColumn({ rows, side, dir }: { rows: PlockaFloat[][]; side: "left" | "right"; dir: string }) {
  return (
    <div
      className="absolute z-10 hidden flex-col @min-[40rem]:flex"
      style={{
        top: "max(34cqh, 12rem)",
        width: PLOCKA_COLUMN,
        gap: `calc(${PLOCKA_GAP} * 0.6)`,
        [side === "left" ? "right" : "left"]: `calc(50% + 26cqh + ${PLOCKA_GAP})`,
      }}
    >
      {rows.map((row, i) => {
        const total = row.reduce((sum, f) => sum + f.w, 0);
        return (
          <FadeUp
            key={row[0].src}
            delay={animationDelays.medium + i * 80}
            duration={animationDurations.slow}
            distance={animationDistances.default}
            easing={animationEasings.smooth}
            className="flex gap-[1cqh]"
          >
            {row.map((f) => (
              <div
                key={f.src}
                className="min-w-0 overflow-hidden shadow-[0_3cqh_6cqh_-2.5cqh_rgb(0_20_9/0.5)]"
                style={{
                  flex: `${f.w} 1 0`,
                  borderRadius: f.r >= 999 ? "999px" : `calc(${PLOCKA_COLUMN} * ${(f.r / total).toFixed(4)})`,
                }}
              >
                <Image src={`${dir}/components/${f.src}.webp`} alt={f.alt} width={f.w} height={f.h} sizes="20vw" className="block h-auto w-full" />
              </div>
            ))}
          </FadeUp>
        );
      })}
    </div>
  );
}

function PlockaHeroArt() {
  const dir = "/images/cases/plocka-v1";
  return (
    <div className="@container relative h-full w-full overflow-hidden [container-type:size]">
      {/* A soft pool of light behind the phone. */}
      <div
        aria-hidden
        className="absolute left-1/2 aspect-square -translate-x-1/2 rounded-full"
        style={{
          top: "max(20cqh, 7rem)",
          width: "min(140cqh, 160cqw)",
          background: "radial-gradient(closest-side, rgb(254 248 232 / 0.22), rgb(254 248 232 / 0.06) 55%, transparent)",
        }}
      />
      <div className="absolute inset-x-0 top-[max(9cqh,5.5rem)] flex justify-center">
        <FadeUp
          delay={animationDelays.short}
          duration={animationDurations.slow}
          distance={animationDistances.default}
          easing={animationEasings.smooth}
          className="w-[min(30cqw,34cqh,16rem)]"
        >
          <Image src={`${dir}/logo-lemon.svg`} alt="Plocka" width={535} height={133} priority unoptimized className="h-auto w-full" />
        </FadeUp>
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-[6cqh] bg-neutral-950 p-[1cqh] shadow-[0_4cqh_10cqh_-3cqh_rgb(0_20_9/0.55)]"
        style={{ top: "max(26cqh, 9rem)", height: "min(112cqh, 100cqw)" }}
      >
        <Image
          src={`${dir}/screens/grow-cloudy-v3.webp`}
          alt="Plocka Grow screen on a cloudy day: the garden, and what this week is about"
          width={750}
          height={1624}
          priority
          sizes="30vw"
          className="h-full w-auto rounded-[5cqh]"
        />
      </div>
      <PlockaColumn rows={PLOCKA_LEFT} side="left" dir={dir} />
      <PlockaColumn rows={PLOCKA_RIGHT} side="right" dir={dir} />
    </div>
  );
}

export const HERO_ART: Record<string, () => ReactNode> = {
  elsewhere: ElsewhereHeroArt,
  plocka: PlockaHeroArt,
};
