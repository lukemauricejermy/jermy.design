import type { Metadata } from "next"

import { Header } from "@/components/Header"
import { Typography } from "@/components/ui/typography"
import {
  BadgeGallery,
  ButtonGallery,
  CardGallery,
  ItemGallery,
  MenuGallery,
  SeparatorGallery,
  ThemeToggleGallery,
} from "./_components/component-gallery"
import { DsNav, type NavGroup } from "./_components/ds-nav"
import { Code, Section, Specimen, SubSection } from "./_components/layout"
import {
  DurationDemo,
  EasingDemo,
  MotionTokenTable,
  StaggerDemo,
} from "./_components/motion-demo"
import { ColorSwatch, RadiusSample } from "./_components/tokens"
import { TypeScale } from "./_components/type-scale"

export const metadata: Metadata = {
  title: "Design system · Jermy Design",
  description:
    "Tokens, type, motion and components that make up jermy.design.",
  robots: { index: false, follow: false },
}

const NAV: NavGroup[] = [
  {
    title: "Foundations",
    items: [
      { id: "colour", label: "Colour" },
      { id: "typography", label: "Typography" },
      { id: "radius", label: "Radius" },
      { id: "motion", label: "Motion" },
    ],
  },
  {
    title: "Components",
    items: [{ id: "components", label: "Components" }],
  },
]

const COLOUR_GROUPS: {
  title: string
  description: string
  tokens: { token: string; note?: string }[]
}[] = [
  {
    title: "Surfaces",
    description: "Page and container backgrounds, lowest to highest.",
    tokens: [
      { token: "background" },
      { token: "card", note: "Also the illustration surface" },
      { token: "popover" },
      { token: "muted" },
      { token: "chip-surface", note: "Info chips, score groups (light mode)" },
    ],
  },
  {
    title: "Text",
    description: "Foreground pairs. Always use the -foreground of the surface you sit on.",
    tokens: [
      { token: "foreground" },
      { token: "muted-foreground" },
      { token: "card-foreground" },
      { token: "popover-foreground" },
    ],
  },
  {
    title: "Actions",
    description: "Interactive fills and their text.",
    tokens: [
      { token: "primary" },
      { token: "primary-foreground" },
      { token: "secondary" },
      { token: "secondary-foreground" },
      { token: "accent" },
      { token: "accent-foreground" },
      { token: "destructive" },
    ],
  },
  {
    title: "Lines",
    description: "Borders, inputs and focus rings.",
    tokens: [{ token: "border" }, { token: "input" }, { token: "ring" }],
  },
  {
    title: "Charts",
    description: "Ordered data series, from the preset.",
    tokens: [1, 2, 3, 4, 5].map((n) => ({ token: `chart-${n}` })),
  },
  {
    title: "Illustration",
    description: "Palette for the hand-drawn portraits and value illustrations.",
    tokens: [
      { token: "illustration-line-work" },
      { token: "illustration-surface" },
      { token: "illustration-skin-tone-primary" },
      { token: "illustration-skin-tone-secondary" },
      { token: "illustration-clothing-primary" },
      { token: "illustration-clothing-secondary" },
      { token: "illustration-clothing-tertiary" },
      { token: "illustration-laptop" },
      { token: "illustration-tongue" },
    ],
  },
]

const RADII = [
  { name: "sm", className: "rounded-sm" },
  { name: "md", className: "rounded-md" },
  { name: "lg", className: "rounded-lg" },
  { name: "xl", className: "rounded-xl" },
  { name: "2xl", className: "rounded-2xl" },
  { name: "3xl", className: "rounded-3xl" },
  { name: "4xl", className: "rounded-4xl" },
  { name: "full", className: "rounded-full" },
]

const FONT_WEIGHTS = [
  { label: "Regular", weight: "font-normal", value: 400 },
  { label: "Medium", weight: "font-medium", value: 500 },
  { label: "SemiBold", weight: "font-semibold", value: 600 },
]

export default function DesignSystemPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1440px] px-6 pt-32 pb-32 md:pt-40">
        <header className="flex max-w-3xl flex-col gap-6 pb-20 md:pb-28">
          <Typography variant="overline">jermy.design</Typography>
          <Typography variant="display" as="h1">
            Design system
          </Typography>
          <Typography variant="lead">
            The tokens, type, motion and components this site is built from.
            Everything on this page is rendered live from the same code as the
            site, so it’s always current.
          </Typography>
          <div className="flex flex-wrap gap-x-6 gap-y-2 type-small text-muted-foreground">
            <span>shadcn/ui · radix-luma</span>
            <span>Tailwind CSS v4</span>
            <span>Matter &amp; DM Mono</span>
            <span>GSAP</span>
          </div>
        </header>

        <div className="grid gap-16 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-20">
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <DsNav groups={NAV} />
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-24">
            <Section
              id="colour"
              eyebrow="Foundations"
              title="Colour"
              description="Semantic tokens from the shadcn preset (zinc), plus the site’s own surface and illustration palette. Values update live when you switch theme."
            >
              {COLOUR_GROUPS.map((group) => (
                <SubSection
                  key={group.title}
                  title={group.title}
                  description={group.description}
                >
                  <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-5">
                    {group.tokens.map((t) => (
                      <ColorSwatch key={t.token} token={t.token} note={t.note} />
                    ))}
                  </div>
                </SubSection>
              ))}
            </Section>

            <Section
              id="typography"
              eyebrow="Foundations"
              title="Typography"
              description={
                <>
                  Twelve styles, each a single <Code>type-*</Code> class that
                  sets size, line height, tracking and weight, stepping up at
                  breakpoints. Highlighted steps show what applies at your
                  current width.
                </>
              }
            >
              <SubSection
                title="Typefaces"
                description="Matter for everything; DM Mono for overlines, code and data."
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <Specimen label="Matter · sans and headings">
                    <div className="flex flex-col gap-6">
                      <span className="type-display">Aa</span>
                      <div className="flex flex-col gap-2">
                        {FONT_WEIGHTS.map((w) => (
                          <div
                            key={w.value}
                            className="flex items-baseline justify-between gap-4"
                          >
                            <span className={`type-title ${w.weight}`}>
                              {w.label}
                            </span>
                            <span className="font-mono type-caption text-muted-foreground">
                              {w.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Specimen>
                  <Specimen label="DM Mono · mono">
                    <div className="flex flex-col gap-6 font-mono">
                      <span className="type-display font-mono font-normal">Aa</span>
                      <div className="flex flex-col gap-2">
                        <span className="type-body">ABCDEFGHIJKLMNOPQRSTUVWXYZ</span>
                        <span className="type-body">abcdefghijklmnopqrstuvwxyz</span>
                        <span className="type-body">0123456789 → ← ↑ ↓ © ·</span>
                      </div>
                    </div>
                  </Specimen>
                </div>
              </SubSection>

              <SubSection
                title="Scale"
                description={
                  <>
                    Use <Code>{'<Typography variant="…" as="…">'}</Code> or the
                    class directly. Choose by role, set the element separately.
                  </>
                }
              >
                <TypeScale />
              </SubSection>
            </Section>

            <Section
              id="radius"
              eyebrow="Foundations"
              title="Radius"
              description={
                <>
                  Derived from a single <Code>--radius</Code>. Nested surfaces
                  use the concentric tokens (<Code>rounded-inner-gap-*</Code>)
                  so inner radius = outer radius − padding.
                </>
              }
            >
              <div className="grid grid-cols-4 gap-4 md:grid-cols-8">
                {RADII.map((r) => (
                  <RadiusSample key={r.name} name={r.name} className={r.className} />
                ))}
              </div>
              <SubSection
                title="Concentric nesting"
                description="Outer rounded-3xl card with 16px padding; inner image uses rounded-inner-gap-4."
              >
                <div className="max-w-sm rounded-3xl bg-card p-4 ring-1 ring-foreground/5 dark:ring-foreground/10">
                  <div className="aspect-[4/3] rounded-inner-gap-4 bg-muted" />
                </div>
              </SubSection>
            </Section>

            <Section
              id="motion"
              eyebrow="Foundations"
              title="Motion"
              description={
                <>
                  GSAP, driven by the shared tokens in{" "}
                  <Code>lib/animation-config</Code>. Entrances fade up a short
                  distance with an ease-out; nothing bounces.
                </>
              }
            >
              <MotionTokenTable />
              <SubSection title="Easing" description="Same distance and duration, different curves.">
                <Specimen>
                  <EasingDemo />
                </Specimen>
              </SubSection>
              <SubSection title="Duration" description="Same curve (smooth), different speeds.">
                <Specimen>
                  <DurationDemo />
                </Specimen>
              </SubSection>
              <SubSection
                title="Text reveal"
                description="Per-character stagger used on headings across the site."
              >
                <Specimen>
                  <StaggerDemo />
                </Specimen>
              </SubSection>
            </Section>

            <Section
              id="components"
              eyebrow="Components"
              title="Components"
              description="shadcn/ui primitives in the radix-luma style, as used across the site. Icons are Hugeicons."
            >
              <ButtonGallery />
              <BadgeGallery />
              <CardGallery />
              <ItemGallery />
              <MenuGallery />
              <SeparatorGallery />
              <ThemeToggleGallery />
            </Section>
          </div>
        </div>
      </main>
    </>
  )
}
