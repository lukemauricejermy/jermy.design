// Sections for the outcome-first case study structure (case-study-writing
// skill): outcome, facts and impact first, then the story, the key decisions
// with their visual proof, how we worked, and the closing principles. Used by
// /work/[slug] (Dato) and /work/[slug]/draft (local draft files).
import type { CSSProperties, ReactNode } from "react";
import { Typography, H2, P } from "@/components/ui/typography";
import { FadeUp, StaggerChildren } from "@/components/animations";
import {
  animationDurations,
  animationEasings,
  animationDistances,
} from "@/lib/animation-config";
import { cn } from "@/lib/utils";
import { SURFACE_CLASS } from "@/components/case-study/surface";
import type { OutcomeCase, DraftImage } from "@/lib/outcome-case";

const fade = {
  triggerOnScroll: true,
  duration: animationDurations.default,
  distance: animationDistances.default,
  easing: animationEasings.smooth,
} as const;

function Paragraphs({ items, className }: { items: string[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {items.map((text) => (
        <P key={text}>{text}</P>
      ))}
    </div>
  );
}

function Figure({ image, className, style }: { image: DraftImage; className?: string; style?: CSSProperties }) {
  return (
    <figure className={cn("flex min-w-0 flex-col gap-3", className)} style={style}>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={image.caption}
          width={image.width}
          height={image.height}
          loading="lazy"
          className="block h-auto w-full"
        />
      </div>
      <figcaption className="type-small text-muted-foreground">{image.caption}</figcaption>
    </figure>
  );
}

// Images sit side by side at the same height, uncropped: each one's share of
// the row is its aspect ratio. Stacks on phones.
function ImageRow({ images }: { images: DraftImage[] }) {
  if (images.length === 0) return null;
  return (
    <StaggerChildren {...fade} delayBetween={80} className="flex w-full flex-col gap-8 md:flex-row md:items-start md:gap-6">
      {images.map((image) => (
        <Figure
          key={image.url}
          image={image}
          style={{ flex: `${image.width / image.height} 1 0%` }}
        />
      ))}
    </StaggerChildren>
  );
}

function Section({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("flex justify-center px-3", className)}>
      <div className="flex w-full max-w-[90rem] flex-col">{children}</div>
    </section>
  );
}

// Heading on the left (pinned while the copy scrolls on desktop), copy on the
// right. Stacks on phones and tablets.
function StoryBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-24">
      <Typography variant="title-lg" as="h2" className="lg:sticky lg:top-28 lg:self-start">
        {title}
      </Typography>
      <FadeUp {...fade} className="max-w-2xl">
        {children}
      </FadeUp>
    </div>
  );
}

export function CaseStudyOutcome({ draft }: { draft: OutcomeCase }) {
  return (
    <Section className="pt-16 pb-24 md:pt-24">
      <div className="flex flex-col gap-16 md:gap-24">
        {/* Outcome headline (the result, not the project) beside a quiet
            facts list. Stacks below lg, centred. */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-24">
          <FadeUp {...fade} className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <Typography variant="headline" as="h1" className="max-w-5xl text-balance">
              {draft.outcomeHeadline}
            </Typography>
            <Typography variant="lead" as="p" className="max-w-2xl text-balance lg:text-pretty">
              {draft.summary}
            </Typography>
          </FadeUp>

          <FadeUp {...fade} className="lg:self-end">
            <dl className="grid grid-cols-2 gap-x-6 text-center sm:grid-cols-3 lg:grid-cols-1 lg:text-left">
              {draft.facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-1 border-t border-border py-4">
                  <dt className="type-small text-muted-foreground">{fact.label}</dt>
                  <dd className="type-body text-foreground">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </FadeUp>
        </div>

        {/* Impact: two to four results, short labels */}
        <StaggerChildren
          {...fade}
          delayBetween={80}
          className={cn(
            "grid grid-cols-1 gap-3 text-center sm:gap-4 lg:text-left",
            draft.impact.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : draft.impact.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
          )}
        >
          {draft.impact.map((stat) => (
            <div key={stat.value} className={cn("flex flex-col gap-2 rounded-[var(--radius-card)] p-6 md:p-8", SURFACE_CLASS)}>
              <Typography variant="title-lg" as="p">
                {stat.value}
              </Typography>
              <P>{stat.label}</P>
            </div>
          ))}
        </StaggerChildren>
      </div>
    </Section>
  );
}

// One pull quote, set apart from the opening so it gets room to land.
export function CaseStudyQuote({ draft }: { draft: OutcomeCase }) {
  if (!draft.quote) return null;
  return (
    <Section className="py-24 md:py-32">
      <FadeUp {...fade} className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <figure className="flex flex-col items-center gap-6">
          <blockquote>
            <Typography variant="title-lg" as="p" className="text-balance">
              &ldquo;{draft.quote.text}&rdquo;
            </Typography>
          </blockquote>
          <figcaption>
            <Typography variant="small" as="span" className="text-muted-foreground">
              {draft.quote.role}
            </Typography>
          </figcaption>
        </figure>
      </FadeUp>
    </Section>
  );
}

export function CaseStudyStory({ draft }: { draft: OutcomeCase }) {
  return (
    <Section className="py-24">
      <div className="flex flex-col gap-24 md:gap-32">
        <StoryBlock title="The starting point">
          <Paragraphs items={draft.startingPoint} />
        </StoryBlock>
        <StoryBlock title="My role">
          <Paragraphs items={draft.myRole} />
        </StoryBlock>
      </div>
    </Section>
  );
}

export function CaseStudyDecisions({ draft }: { draft: OutcomeCase }) {
  if (draft.decisions.length === 0) return null;
  return (
    <Section className="py-24">
      <H2 className="pb-8 md:pb-12">{draft.decisionsHeading ?? "The work"}</H2>
      <div className="flex flex-col">
        {draft.decisions.map((decision, i) => (
          <article
            key={decision.title}
            className="flex flex-col gap-10 border-t border-border py-16 md:py-20"
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-24">
              <div className="flex flex-col gap-3">
                <Typography variant="overline" as="p" className="text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </Typography>
                <Typography variant="title-lg" as="h3">{decision.title}</Typography>
              </div>
              <FadeUp {...fade} className="max-w-2xl">
                <Paragraphs items={decision.body} />
              </FadeUp>
            </div>
            <ImageRow images={decision.images} />
            {decision.images.length === 0 && decision.placeholder && (
              <div className="flex aspect-video w-full items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border p-6 text-center">
                <P className="max-w-md text-muted-foreground">{decision.placeholder}</P>
              </div>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}

export function CaseStudyHeldTrue({ draft }: { draft: OutcomeCase }) {
  if (draft.heldTrue.length === 0 && !draft.nextTime) return null;
  return (
    <Section className="py-24">
      {/* Same rhythm as the other sections: heading, a rule, then the content. */}
      <H2 className="pb-8 md:pb-12">{draft.heldTrueHeading ?? "What held true"}</H2>
      <div className="flex flex-col gap-12 border-t border-border pt-16 md:pt-20">
        <StaggerChildren {...fade} delayBetween={80} className={cn("grid grid-cols-1 gap-4", draft.heldTrue.length + (draft.nextTime ? 1 : 0) === 2 ? "md:grid-cols-2" : "md:grid-cols-3")}>
          {draft.heldTrue.map((item) => (
            <div key={item.title} className={cn("flex flex-col justify-between gap-6 rounded-[var(--radius-card)] p-6 md:p-8", SURFACE_CLASS)}>
              <Typography variant="title-sm" as="h3">
                {item.title}
              </Typography>
              <P>{item.body}</P>
            </div>
          ))}
          {draft.nextTime && (
            <div className="flex flex-col justify-between gap-6 rounded-[var(--radius-card)] border border-border p-6 md:p-8">
              <Typography variant="title-sm" as="h3">
                One for next time
              </Typography>
              <P>{draft.nextTime}</P>
            </div>
          )}
        </StaggerChildren>
        <ImageRow images={draft.heldTrueImages} />
      </div>
    </Section>
  );
}

// How the squad worked: each point sits beside the picture that shows it.
export function CaseStudyHowWeWorked({ draft }: { draft: OutcomeCase }) {
  if (draft.howWeWorked.length === 0) return null;
  return (
    <Section className="py-24">
      <H2 className="pb-8 md:pb-12">How we worked</H2>
      <div className="flex flex-col">
        {draft.howWeWorked.map((item) => (
          <div
            key={item.body}
            className="grid grid-cols-1 gap-8 border-t border-border py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-24"
          >
            <FadeUp {...fade} className="flex max-w-xl flex-col gap-4">
              {item.title && (
                <Typography variant="title-lg" as="h3">
                  {item.title}
                </Typography>
              )}
              <P>{item.body}</P>
              {item.quote && (
                <figure className="mt-4 flex flex-col gap-3 border-l-2 border-border pl-5">
                  <blockquote>
                    <Typography variant="lead" as="p" className="text-pretty">
                      &ldquo;{item.quote.text}&rdquo;
                    </Typography>
                  </blockquote>
                  <figcaption className="type-small text-muted-foreground">{item.quote.role}</figcaption>
                </figure>
              )}
            </FadeUp>
            {item.visual === "sprint" && (
              <FadeUp {...fade}>
                <SprintStrip />
              </FadeUp>
            )}
            {item.image && (
              <FadeUp {...fade}>
                <Figure image={item.image} />
              </FadeUp>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

// Neverbland's two-week sprint, rebuilt from the pitch deck slide so it stays
// crisp and follows the theme.
const SPRINT = [
  { week: "Week 1: design exploration and definition", days: ["Off", "Kick-off", "Design sync", "Design sync", "Midway review"] },
  { week: "Week 2: documentation and packaging", days: ["Off", "Design system", "User stories", "Dev package", "Show and tell"] },
];

function SprintStrip() {
  return (
    <figure className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-6 rounded-[var(--radius-card)] border border-border bg-muted/40 p-4 sm:p-6 md:grid-cols-2 md:gap-3">
        {SPRINT.map(({ week, days }) => (
          <div key={week} className="flex flex-col gap-3">
            <div className={cn("rounded-[max(0px,calc(var(--radius-card)-1rem))] sm:rounded-[max(0px,calc(var(--radius-card)-1.5rem))] px-4 py-3 text-center type-small text-foreground", SURFACE_CLASS)}>
              {week}
            </div>
            <ol className="grid grid-cols-5 gap-2">
              {days.map((day, i) => (
                <li
                  key={`${day}-${i}`}
                  className={cn(
                    "flex aspect-[4/5] items-center justify-center rounded-[max(0px,calc(var(--radius-card)-1rem))] sm:rounded-[max(0px,calc(var(--radius-card)-1.5rem))] border border-border bg-background p-1 text-center type-caption text-balance",
                    day === "Off" ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {day}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <figcaption className="type-small text-muted-foreground">The two-week sprint</figcaption>
    </figure>
  );
}
