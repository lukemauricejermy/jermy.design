// Real screens presented the way product studios show work: a few screens in
// device or browser frames on one flat brand-colour canvas per project. Sizes
// use container units, so each canvas scales as one picture.
import { StaggerChildren } from "@/components/animations";
import { animationDurations, animationEasings, animationDistances } from "@/lib/animation-config";
import { cn } from "@/lib/utils";
import type { Showcase, ShowcaseImage } from "@/lib/outcome-case";

function Screen({ image, className }: { image: ShowcaseImage; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.url}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading="lazy"
      className={cn("block h-auto w-full", className)}
    />
  );
}

function Phone({ image, className }: { image: ShowcaseImage; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[4.2cqw] bg-neutral-950 p-[0.7cqw] shadow-[0_3cqw_6cqw_-2cqw_rgb(0_0_0/0.35)]",
        className,
      )}
    >
      <Screen image={image} className="rounded-[3.5cqw]" />
    </div>
  );
}

function Browser({ image, className }: { image: ShowcaseImage; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.6cqw] bg-white shadow-[0_3cqw_6cqw_-2cqw_rgb(0_0_0/0.3)]",
        className,
      )}
    >
      <div className="flex h-[3.2cqw] items-center gap-[0.8cqw] border-b border-black/5 bg-neutral-50 px-[1.6cqw]">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-[0.9cqw] rounded-full bg-black/15" />
        ))}
      </div>
      <Screen image={image} />
    </div>
  );
}

function Canvas({ item }: { item: Showcase }) {
  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-card)] [container-type:inline-size]"
      style={{ backgroundColor: item.bg, color: item.fg ?? "#fff" }}
    >
      {item.kind === "phones" ? (
        <div className={cn("flex items-center justify-center gap-[3cqw]", item.wide ? "aspect-[16/10]" : "aspect-[4/3]")}>
          {item.screens.map((screen, i) => {
            const middle = item.screens.length % 2 === 1 && i === Math.floor(item.screens.length / 2);
            const pair = item.screens.length === 2;
            return (
              <Phone
                key={screen.url}
                image={screen}
                className={pair ? cn("w-[30cqw]", i === 0 ? "translate-y-[6cqw] -rotate-3" : "-translate-y-[2cqw] rotate-3") : middle ? "w-[25cqw] -translate-y-[1cqw]" : "w-[21cqw] translate-y-[4cqw]"}
              />
            );
          })}
        </div>
      ) : (
        <div className="relative aspect-[4/3]">
          <Browser image={item.screen} className="absolute left-[8cqw] top-[9cqw] w-[96cqw]" />
          {item.float && (
            <div className="absolute -bottom-[2cqw] right-[4cqw] w-[54cqw] overflow-hidden rounded-[1.6cqw] shadow-[0_3cqw_6cqw_-1cqw_rgb(0_0_0/0.35)]">
              <Screen image={item.float} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CaseStudyShowcase({ items }: { items: Showcase[] }) {
  return (
    <StaggerChildren
      duration={animationDurations.slow}
      distance={animationDistances.default}
      easing={animationEasings.smooth}
      delayBetween={90}
      className="grid w-full grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2"
    >
      {items.map((item) => (
        <figure key={item.label} className={cn(item.wide && "lg:col-span-2")}>
          <Canvas item={item} />
        </figure>
      ))}
    </StaggerChildren>
  );
}
