import { H2 } from "@/components/ui/typography";
import { Item, ItemContent } from "@/components/ui/item";
import { StaggerChildren, TextReveal } from "@/components/animations";
import {
  animationDurations,
  animationEasings,
  animationDistances,
} from "@/lib/animation-config";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/case-study/rich-text";
import type {
  Callout,
  CalloutBlock as CalloutBlockType,
  DatoImage,
} from "@/lib/queries/case-study";

interface CaseStudyCalloutsProps {
  callouts: Callout[];
}

function CalloutImage({
  image,
  caption,
  fallbackAlt,
}: {
  image: DatoImage | null;
  caption: string | null;
  fallbackAlt: string;
}) {
  if (!image) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={image.alt ?? caption ?? fallbackAlt}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      {caption && (
        <Item
          variant="default"
          className="absolute right-4 bottom-4 max-w-[calc(100%-2rem)] overflow-hidden rounded-xl bg-background/70 backdrop-blur-md"
        >
          <ItemContent>
            <p className="truncate text-sm leading-5 text-foreground">
              {caption}
            </p>
          </ItemContent>
        </Item>
      )}
    </div>
  );
}

function CalloutBlock({
  block,
  fallbackAlt,
}: {
  block: CalloutBlockType;
  fallbackAlt: string;
}) {
  if (block.__typename === "ImageBlockRecord") {
    return (
      <div className="w-full">
        <CalloutImage
          image={block.image}
          caption={block.caption}
          fallbackAlt={fallbackAlt}
        />
      </div>
    );
  }

  // Image + Text. Dato enum: "first" = image-left (default), "second" = image-right.
  const isImageRight = block.layout === "second";

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-8 md:flex-row md:items-center",
        isImageRight && "md:flex-row-reverse"
      )}
    >
      <div className="w-full md:flex-1">
        <CalloutImage
          image={block.image}
          caption={block.caption}
          fallbackAlt={fallbackAlt}
        />
      </div>
      <div className="w-full md:flex-1">
        <RichText data={block.body} />
      </div>
    </div>
  );
}

export function CaseStudyCallouts({ callouts }: CaseStudyCalloutsProps) {
  if (callouts.length === 0) return null;

  return (
    <section className="flex items-center justify-center gap-2 px-3 py-32">
      <div className="flex w-full max-w-[1440px] flex-col items-start">
        {callouts.map((callout) => (
          <div
            key={callout.id}
            className="flex w-full flex-col items-start gap-8 py-20"
          >
            {callout.title && (
              <H2 className="overflow-hidden border-none pb-0 text-4xl font-medium leading-none tracking-tight md:text-5xl lg:text-6xl">
                <TextReveal
                  triggerOnScroll
                  duration={750}
                  stagger={0.02}
                  easing={animationEasings.robust}
                >
                  {callout.title}
                </TextReveal>
              </H2>
            )}
            <StaggerChildren
              triggerOnScroll
              delayBetween={80}
              duration={animationDurations.default}
              distance={animationDistances.default}
              easing={animationEasings.smooth}
              className="flex w-full flex-col items-start gap-12"
            >
              {callout.blocks.map((block) => (
                <CalloutBlock
                  key={block.id}
                  block={block}
                  fallbackAlt={callout.title ?? ""}
                />
              ))}
            </StaggerChildren>
          </div>
        ))}
      </div>
    </section>
  );
}
