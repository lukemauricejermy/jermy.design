import { H2 } from "@/components/ui/typography";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@/components/ui/item";
import { FadeUp, StaggerChildren, TextReveal } from "@/components/animations";
import {
  animationDurations,
  animationEasings,
  animationDistances,
} from "@/lib/animation-config";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/case-study/rich-text";
import { SURFACE_CLASS } from "@/components/case-study/surface";
import type {
  CaseStudy,
  ScoreGroup,
  ScoreValue,
} from "@/lib/queries/case-study";

interface CaseStudyOverviewProps {
  caseStudy: CaseStudy;
}

interface InfoChip {
  label: string;
  value: string;
}

interface GroupedScores {
  group: ScoreGroup;
  items: { id: string; name: string; value: number }[];
}

function buildChips(caseStudy: CaseStudy): InfoChip[] {
  const {
    role,
    year,
    projectDuration,
    methodologies,
    technologies,
  } = caseStudy;

  const chips: InfoChip[] = [
    { label: "Role", value: role ?? "" },
    { label: "Year", value: year ?? "" },
    { label: "Project Duration", value: projectDuration ?? "" },
    {
      label: "Methodologies",
      value: methodologies.map((m) => m.name).filter(Boolean).join(", "),
    },
    {
      label: "Technologies",
      value: technologies.map((t) => t.name).filter(Boolean).join(", "),
    },
  ];

  return chips.filter((chip) => chip.value.length > 0);
}

// Group scored items by Score Group, ordered by group position then item
// position. Items without a value are skipped silently.
function groupScores(scores: ScoreValue[]): GroupedScores[] {
  const groups = new Map<string, GroupedScores & { positions: Map<string, number> }>();

  for (const score of scores) {
    const item = score.scoreItem;
    const group = item?.group;
    if (score.value == null || !item || !group) continue;

    if (!groups.has(group.id)) {
      groups.set(group.id, { group, items: [], positions: new Map() });
    }
    const entry = groups.get(group.id)!;
    entry.items.push({ id: score.id, name: item.name ?? "", value: score.value });
    entry.positions.set(score.id, item.scoreItemPosition ?? 0);
  }

  const ordered = Array.from(groups.values());
  ordered.sort(
    (a, b) => (a.group.scorePosition ?? 0) - (b.group.scorePosition ?? 0)
  );
  for (const entry of ordered) {
    entry.items.sort(
      (a, b) =>
        (entry.positions.get(a.id) ?? 0) - (entry.positions.get(b.id) ?? 0)
    );
  }

  return ordered.map(({ group, items }) => ({ group, items }));
}

function ScoreBar({ value }: { value: number }) {
  return (
    <div
      className="flex shrink-0 items-center gap-0.5"
      aria-label={`${value} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-4 w-8",
            index < value ? "bg-chart-4" : SURFACE_CLASS,
            index === 0 && "rounded-l-sm",
            index === 4 && "rounded-r-sm"
          )}
        />
      ))}
    </div>
  );
}

export function CaseStudyOverview({ caseStudy }: CaseStudyOverviewProps) {
  const chips = buildChips(caseStudy);
  const scoreGroups = groupScores(caseStudy.scores);
  const hasScores = scoreGroups.length > 0;

  return (
    <section className="flex items-center justify-center gap-2 px-3 py-24">
      <div className="flex w-full max-w-[1440px] flex-col gap-16 md:gap-24">
        {/* Info chips */}
        {chips.length > 0 && (
          <StaggerChildren
            triggerOnScroll
            delayBetween={60}
            duration={animationDurations.default}
            distance={animationDistances.default}
            easing={animationEasings.smooth}
            className="flex flex-wrap gap-2"
          >
            {chips.map((chip) => (
              <Item
                key={chip.label}
                variant="muted"
                className={cn(
                  "min-w-[11.25rem] flex-1 items-start rounded-2xl",
                  SURFACE_CLASS
                )}
              >
                <ItemContent>
                  <ItemTitle>{chip.label}</ItemTitle>
                  <ItemDescription>{chip.value}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </StaggerChildren>
        )}

        {/* Overview text + scores */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
          {/* Left: heading + overview text. Sticky on desktop so it stays
              pinned near the top of the viewport while the (taller) scores
              column scrolls past, until the section bottom is reached. */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
            <H2 className="overflow-hidden pb-0 text-5xl font-medium leading-none tracking-tight md:text-6xl">
              <TextReveal
                triggerOnScroll
                duration={750}
                stagger={0.02}
                easing={animationEasings.robust}
              >
                Overview
              </TextReveal>
            </H2>
            {caseStudy.overviewText && (
              <FadeUp
                triggerOnScroll
                duration={animationDurations.default}
                distance={animationDistances.default}
                easing={animationEasings.smooth}
              >
                <RichText data={caseStudy.overviewText} />
              </FadeUp>
            )}
          </div>

          {/* Right: scores grouped by rubric group. Scrolls past the pinned
              overview text on desktop. */}
          {hasScores && (
            <FadeUp
              triggerOnScroll
              duration={animationDurations.default}
              distance={animationDistances.default}
              easing={animationEasings.smooth}
              className="flex w-full max-w-[40rem] flex-col gap-8"
            >
              {scoreGroups.map(({ group, items }) => (
                <div key={group.id} className="flex flex-col gap-6">
                  <Item
                    variant="muted"
                    className={cn(
                      "h-12 min-w-[11.25rem] items-center rounded-2xl px-4 py-0",
                      SURFACE_CLASS
                    )}
                  >
                    <ItemContent className="justify-center">
                      <ItemTitle>{group.name}</ItemTitle>
                    </ItemContent>
                  </Item>
                  <div className="flex flex-col gap-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-4"
                      >
                        <p className="min-w-0 flex-1 truncate text-base leading-6 text-muted-foreground">
                          {item.name}
                        </p>
                        <ScoreBar value={item.value} />
                      </div>
                    ))}
                  </div>
                  </div>
                ))}
            </FadeUp>
          )}
        </div>
      </div>
    </section>
  );
}
