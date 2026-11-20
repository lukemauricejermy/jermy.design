import * as React from "react"

import { Typography } from "@/components/ui/typography"
import { cn } from "@/lib/utils"

/** Top-level design system section with eyebrow, headline and intro. */
export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  description?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-32 flex-col gap-12 border-t border-border pt-16 first:border-t-0 first:pt-0"
    >
      <header className="flex max-w-2xl flex-col gap-4">
        <Typography variant="overline">{eyebrow}</Typography>
        <Typography variant="headline" as="h2" id={`${id}-title`}>
          {title}
        </Typography>
        {description && <Typography variant="lead">{description}</Typography>}
      </header>
      {children}
    </section>
  )
}

/** A titled group inside a section. */
export function SubSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex max-w-xl flex-col gap-1.5">
        <Typography variant="title-sm" as="h3">
          {title}
        </Typography>
        {description && (
          <Typography variant="small" className="text-muted-foreground">
            {description}
          </Typography>
        )}
      </div>
      {children}
    </div>
  )
}

/** Framed surface that holds a live example. */
export function Specimen({
  children,
  label,
  className,
}: {
  children: React.ReactNode
  label?: string
  className?: string
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div
        className={cn(
          "rounded-3xl bg-card p-6 ring-1 ring-foreground/5 dark:ring-foreground/10",
          className
        )}
      >
        {children}
      </div>
      {label && (
        <Typography variant="caption" as="span">
          {label}
        </Typography>
      )}
    </div>
  )
}

/** Inline code token. */
export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.8125em] text-foreground">
      {children}
    </code>
  )
}
