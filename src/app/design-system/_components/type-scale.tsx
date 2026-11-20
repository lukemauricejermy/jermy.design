"use client"

import * as React from "react"

import { Typography } from "@/components/ui/typography"
import { cn, TYPE_STYLES, type TypeStyle } from "@/lib/utils"
import { useThemeKey, useViewportWidth } from "./use-client-env"

/** Role, default element and sample copy for each style. Specs come from CSS. */
const STYLE_INFO: Record<
  TypeStyle,
  { usage: string; element: string; sample: string }
> = {
  display: {
    usage: "Page-defining statements. Hero and footer sign-off. One per page.",
    element: "h1",
    sample: "Head of design. Still doing the doing.",
  },
  headline: {
    usage: "Section headings: Selected work, values, case study sections.",
    element: "h2",
    sample: "Design of every shape and size",
  },
  "title-lg": {
    usage: "Expanded or featured titles that need more presence than title.",
    element: "h3",
    sample: "Play the game better, or play a better game",
  },
  title: {
    usage: "Sub-section and value card titles.",
    element: "h3",
    sample: "People are always the hardest part",
  },
  "title-sm": {
    usage: "Card titles and list headings.",
    element: "h4",
    sample: "Vemi",
  },
  lead: {
    usage: "Intro paragraphs under a headline. Muted by default.",
    element: "p",
    sample:
      "Leading and crafting digital products across teams and platforms.",
  },
  body: {
    usage: "Default UI copy, descriptions and short paragraphs.",
    element: "p",
    sample:
      "MVP mobile app for the UK’s freshest new Sharia compliant, ethical bank.",
  },
  "body-long": {
    usage: "Long-form reading: case study narrative and rich text.",
    element: "p",
    sample:
      "Equal parts high craft, high stakeholder engagement. Our design sprints felt like a full contact sport, with lots of input from members of the team who could speak to risk, regulatory, operational and financial product requirements.",
  },
  label: {
    usage: "Buttons, pills, navigation and tags. Tight line height.",
    element: "span",
    sample: "Book a chat",
  },
  small: {
    usage: "Secondary detail, meta and captions that still need to be read.",
    element: "p",
    sample: "Worked as part of some of the world’s best design teams.",
  },
  caption: {
    usage: "Fine print, credits and legal. Muted by default.",
    element: "p",
    sample: "© 2026 jermy.design. All rights reserved.",
  },
  overline: {
    usage: "Eyebrows above headings and small section labels. DM Mono.",
    element: "p",
    sample: "Case study",
  },
}

type Spec = {
  fontSize?: string
  lineHeight?: string
  letterSpacing?: string
  fontWeight?: string
  fontFamily?: string
}
type Step = { minWidth: number; spec: Spec }

const BREAKPOINT_NAMES: Record<number, string> = { 0: "base", 768: "md", 1024: "lg", 1280: "xl" }

/** `var(--tw-leading, 1)` → `1` */
function fallback(value: string) {
  const m = value.match(/^var\([^,]+,\s*(.+)\)$/)
  return (m ? m[1] : value).trim()
}

function toPx(value: string, fontSizePx?: number): number | null {
  const v = fallback(value)
  if (v.endsWith("rem")) return parseFloat(v) * 16
  if (v.endsWith("px")) return parseFloat(v)
  if (/^[\d.]+$/.test(v) && fontSizePx) return parseFloat(v) * fontSizePx
  return null
}

function minWidthPx(condition: string): number {
  const m = condition.match(/(?:min-width:|width\s*>=)\s*([\d.]+)(rem|px|em)/)
  if (!m) return 0
  return m[2] === "px" ? parseFloat(m[1]) : parseFloat(m[1]) * 16
}

/** Walk the live stylesheets and collect each `.type-*` rule per breakpoint. */
function readTypeRules(): Record<string, Step[]> {
  const found: Record<string, Map<number, Spec>> = {}

  const record = (name: string, condition: string, style: CSSStyleDeclaration) => {
    const minWidth = minWidthPx(condition)
    const steps = (found[name] ??= new Map())
    const spec = steps.get(minWidth) ?? {}
    const pick = (prop: string) => style.getPropertyValue(prop).trim() || undefined
    steps.set(minWidth, {
      ...spec,
      ...Object.fromEntries(
        Object.entries({
          fontSize: pick("font-size"),
          lineHeight: pick("line-height"),
          letterSpacing: pick("letter-spacing"),
          fontWeight: pick("font-weight"),
          fontFamily: pick("font-family"),
        }).filter(([, v]) => v)
      ),
    })
  }

  const visit = (rules: CSSRuleList, condition: string, current?: string) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        const match = rule.selectorText.match(/^\.type-([\w-]+)$/)
        const name = match?.[1] ?? current
        if (match) record(match[1], condition, rule.style)
        if (rule.cssRules?.length) visit(rule.cssRules, condition, name)
      } else if (rule instanceof CSSMediaRule) {
        visit(rule.cssRules, rule.conditionText, current)
      } else if ("cssRules" in rule) {
        visit((rule as CSSGroupingRule).cssRules, condition, current)
      } else if (current && "style" in rule) {
        // Nested declarations inside a nested @media block.
        record(current, condition, (rule as CSSStyleRule).style)
      }
    }
  }

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules, "")
    } catch {
      // Cross-origin stylesheet; not ours.
    }
  }

  return Object.fromEntries(
    Object.entries(found).map(([name, steps]) => [
      name,
      [...steps.entries()]
        .sort(([a], [b]) => a - b)
        .map(([minWidth, spec]) => ({ minWidth, spec })),
    ])
  )
}

function formatTracking(value?: string) {
  if (!value) return "—"
  const v = fallback(value)
  if (v === "normal" || v === "0") return "0"
  if (v.endsWith("em")) return `${+(parseFloat(v) * 100).toFixed(2)}%`
  return v
}

function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="type-caption text-muted-foreground">{label}</span>
      <span className="font-mono type-small">{value}</span>
    </div>
  )
}

function TypeRow({
  name,
  steps,
  viewport,
}: {
  name: TypeStyle
  steps: Step[] | undefined
  viewport: number | null
}) {
  const info = STYLE_INFO[name]
  const base = steps?.[0]?.spec
  const basePx = base?.fontSize ? toPx(base.fontSize) : null
  const active =
    steps && viewport !== null
      ? [...steps].reverse().find((s) => viewport >= s.minWidth)?.minWidth
      : undefined

  return (
    <article
      id={`type-${name}`}
      className="grid scroll-mt-32 gap-6 border-t border-border py-10 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <Typography variant={name} as="div" className="break-words text-foreground">
          {info.sample}
        </Typography>
        <Typography variant="small" className="max-w-lg text-muted-foreground">
          {info.usage}
        </Typography>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="type-title-sm">{name}</span>
          <code className="font-mono type-caption text-muted-foreground">
            .type-{name} · &lt;{info.element}&gt;
          </code>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SpecCell
            label="Weight"
            value={base?.fontWeight ? fallback(base.fontWeight) : "—"}
          />
          <SpecCell label="Tracking" value={formatTracking(base?.letterSpacing)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="type-caption text-muted-foreground">
            Size / line height
          </span>
          <div className="flex flex-wrap gap-2">
            {steps?.map(({ minWidth, spec }) => {
              const sizePx = spec.fontSize ? toPx(spec.fontSize) : basePx
              const lhSource = spec.lineHeight ?? base?.lineHeight
              const lhPx = lhSource ? toPx(lhSource, sizePx ?? undefined) : null
              return (
                <span
                  key={minWidth}
                  className={cn(
                    "rounded-full px-2.5 py-1 font-mono type-caption ring-1 ring-foreground/10 transition-colors",
                    active === minWidth
                      ? "bg-primary text-primary-foreground ring-transparent"
                      : "text-muted-foreground"
                  )}
                  title={minWidth ? `≥ ${minWidth}px` : "All widths"}
                >
                  {BREAKPOINT_NAMES[minWidth] ?? `${minWidth}px`} {sizePx ?? "?"}
                  {lhPx ? `/${+lhPx.toFixed(1)}` : ""}
                </span>
              )
            }) ?? (
              <span className="font-mono type-caption text-muted-foreground">…</span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export function TypeScale() {
  // Re-read on theme change too, in case a theme ever adjusts type.
  const themeKey = useThemeKey()
  const viewport = useViewportWidth()
  const rules = React.useMemo(
    () => (themeKey === null ? null : readTypeRules()),
    [themeKey]
  )

  return (
    <div className="flex flex-col">
      {TYPE_STYLES.map((name) => (
        <TypeRow
          key={name}
          name={name}
          steps={rules?.[name]}
          viewport={viewport}
        />
      ))}
    </div>
  )
}
