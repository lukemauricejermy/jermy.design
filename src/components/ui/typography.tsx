import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn, type TypeStyle } from "@/lib/utils"

/**
 * Typography — the site's type scale as a component.
 *
 * Each variant maps to a `type-*` utility in globals.css (size, line height,
 * tracking, weight, responsive steps). Pick the variant for the role the text
 * plays, and set the HTML element separately with `as`, so visual size and
 * document outline stay independent:
 *
 *   <Typography variant="headline" as="h2">Selected work</Typography>
 *
 * The H1–H4 / Lead / P shortcuts pair the usual element with its default
 * style. Colour, spacing, layout and the leading/tracking/weight modifiers are
 * fine to add via className. For a different size, change the variant rather
 * than adding `text-*`.
 */
const typographyVariants = cva("", {
  variants: {
    variant: {
      hero: "type-hero",
      display: "type-display",
      headline: "type-headline",
      "title-lg": "type-title-lg",
      title: "type-title",
      "title-sm": "type-title-sm",
      lead: "type-lead text-foreground",
      body: "type-body",
      "body-long": "type-body-long",
      label: "type-label",
      small: "type-small",
      caption: "type-caption text-muted-foreground",
      overline: "type-overline text-muted-foreground",
    } satisfies Record<TypeStyle, string>,
  },
  defaultVariants: {
    variant: "body",
  },
})

type Variant = NonNullable<VariantProps<typeof typographyVariants>["variant"]>

/** Element used when `as` isn't given. */
const defaultElement: Record<Variant, React.ElementType> = {
  hero: "h1",
  display: "h1",
  headline: "h2",
  "title-lg": "h3",
  title: "h3",
  "title-sm": "h4",
  lead: "p",
  body: "p",
  "body-long": "p",
  label: "span",
  small: "p",
  caption: "p",
  overline: "p",
}

type TypographyProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof typographyVariants> & {
    as?: React.ElementType
    ref?: React.Ref<HTMLElement>
  }

function Typography({ className, variant, as, ...props }: TypographyProps) {
  const Comp = as ?? defaultElement[variant ?? "body"]
  return (
    <Comp
      data-slot="typography"
      data-variant={variant ?? "body"}
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    />
  )
}

type ShortcutProps<E extends HTMLElement> = React.HTMLAttributes<E> & {
  ref?: React.Ref<E>
}

// Shortcuts: common element + default style.
function H1(props: ShortcutProps<HTMLHeadingElement>) {
  return <Typography variant="display" as="h1" {...props} />
}

function H2(props: ShortcutProps<HTMLHeadingElement>) {
  return <Typography variant="headline" as="h2" {...props} />
}

function H3(props: ShortcutProps<HTMLHeadingElement>) {
  return <Typography variant="title" as="h3" {...props} />
}

function H4(props: ShortcutProps<HTMLHeadingElement>) {
  return <Typography variant="title-sm" as="h4" {...props} />
}

function Lead(props: ShortcutProps<HTMLParagraphElement>) {
  return <Typography variant="lead" as="p" {...props} />
}

/** Long-form paragraph; consecutive paragraphs get 24px between them. */
function P({ className, ...props }: ShortcutProps<HTMLParagraphElement>) {
  return (
    <Typography
      variant="body-long"
      as="p"
      className={cn("[&:not(:first-child)]:mt-6", className)}
      {...props}
    />
  )
}

export { Typography, H1, H2, H3, H4, Lead, P, typographyVariants }
export type { TypographyProps }
