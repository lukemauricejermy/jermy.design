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
  const hasImagery = Boolean(desktopImagery ?? mobileImagery);

  return (
    <section className="flex flex-col items-center p-[var(--hero-section-inset)]">
      <div
        className="relative flex w-full flex-col items-center gap-[var(--hero-content-gap)] self-stretch overflow-hidden rounded-4xl px-[var(--spacing-3)] pb-[var(--spacing-3)] pt-[calc(var(--header-content-bottom)+var(--hero-content-gap)-var(--hero-section-inset))] md:grid md:h-[var(--hero-tablet-height)] md:max-h-[var(--hero-tablet-height)] md:min-h-0 md:grid-cols-3 md:grid-rows-[minmax(0,1fr)] md:items-stretch md:gap-0 md:p-0 md:pt-0 lg:h-[var(--hero-desktop-height)] lg:max-h-[var(--hero-desktop-height)]"
        style={{ backgroundColor: backgroundColour ?? "var(--muted)" }}
      >
        {/* Logo — stacked above imagery on mobile; left third on desktop */}
        {logo && (
          <div className="relative z-10 shrink-0 md:col-span-1 md:flex md:h-full md:min-h-0 md:items-center md:justify-center md:px-12 lg:px-24">
            <img
              src={logo.url}
              alt={logo.alt ?? `${title} logo`}
              width={logo.width ?? undefined}
              height={logo.height ?? undefined}
              className="h-auto w-[180px] md:h-auto md:max-h-full md:w-full md:object-contain"
            />
          </div>
        )}

        {/* Mobile imagery — prefers heroImageryMobile from CMS, falls back to desktop */}
        {hasImagery && mobileImagery && (
          <FadeUp
            duration={animationDurations.slow}
            distance={24}
            easing={animationEasings.smooth}
            className="relative z-10 w-full md:hidden"
          >
            <img
              src={mobileImagery.url}
              alt={mobileImagery.alt ?? `${title} app screens`}
              width={mobileImagery.width ?? undefined}
              height={mobileImagery.height ?? undefined}
              className="h-auto w-full object-contain"
            />
          </FadeUp>
        )}

        {/* Tablet/desktop imagery — contain on tablet, edge-to-edge cover on large screens */}
        {desktopImagery && (
          <FadeUp
            duration={animationDurations.slow}
            distance={24}
            easing={animationEasings.smooth}
            className="pointer-events-none relative z-10 col-span-2 hidden h-full min-h-0 w-full overflow-hidden md:block"
          >
            <img
              src={desktopImagery.url}
              alt={desktopImagery.alt ?? `${title} app screens`}
              width={desktopImagery.width ?? undefined}
              height={desktopImagery.height ?? undefined}
              className="h-full w-full object-contain object-right-bottom lg:object-cover lg:object-right-top"
            />
          </FadeUp>
        )}
      </div>
    </section>
  );
}
