import { FadeUp } from "@/components/animations";
import { animationDurations, animationEasings } from "@/lib/animation-config";
import type { DatoImage } from "@/lib/queries/case-study";

interface CaseStudyHeroProps {
  title: string;
  backgroundColour: string | null;
  logo: DatoImage | null;
  imagery: DatoImage | null;
  imageryMobile: DatoImage | null;
}

export function CaseStudyHero({
  title,
  backgroundColour,
  logo,
  imagery,
  imageryMobile,
}: CaseStudyHeroProps) {
  const desktopImagery = imagery;
  const mobileImagery = imageryMobile ?? imagery;

  return (
    <section className="flex flex-col items-center gap-2 p-3">
      <div
        className="relative w-full self-stretch overflow-hidden rounded-4xl min-h-[560px] md:min-h-[80svh] lg:min-h-[88svh]"
        style={{ backgroundColor: backgroundColour ?? "var(--muted)" }}
      >
        {/* Imagery — transparent PNG, bleeds off the top/right by design */}
        {desktopImagery && (
          <FadeUp
            duration={animationDurations.slow}
            distance={24}
            easing={animationEasings.smooth}
            className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center md:inset-y-0 md:left-1/3 md:right-0 md:justify-end"
          >
            {/* Mobile imagery (with fallback) */}
            <img
              src={mobileImagery!.url}
              alt={mobileImagery!.alt ?? `${title} app screens`}
              width={mobileImagery!.width ?? undefined}
              height={mobileImagery!.height ?? undefined}
              className="h-auto w-[88%] max-w-[460px] object-contain object-bottom md:hidden"
            />
            {/* Desktop imagery */}
            <img
              src={desktopImagery.url}
              alt={desktopImagery.alt ?? `${title} app screens`}
              width={desktopImagery.width ?? undefined}
              height={desktopImagery.height ?? undefined}
              className="hidden h-full w-auto max-w-none object-contain object-right-top md:block"
            />
          </FadeUp>
        )}

        {/* Logo — left, vertically centred */}
        {logo && (
          <div className="relative z-10 flex min-h-[inherit] items-start px-6 pt-20 md:items-center md:px-12 md:pt-0 lg:px-24">
            <img
              src={logo.url}
              alt={logo.alt ?? `${title} logo`}
              width={logo.width ?? undefined}
              height={logo.height ?? undefined}
              className="h-auto w-[180px] max-w-[480px] md:w-1/3"
            />
          </div>
        )}
      </div>
    </section>
  );
}
