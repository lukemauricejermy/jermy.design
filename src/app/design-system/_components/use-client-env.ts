"use client"

import { useSyncExternalStore } from "react"

/**
 * Changes whenever the theme class on <html> changes. `null` during SSR and
 * hydration, so readouts that depend on computed styles render empty on the
 * server and fill in on the client without a hydration mismatch.
 */
export function useThemeKey(): string | null {
  return useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange)
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "style"],
      })
      return () => observer.disconnect()
    },
    () => document.documentElement.className,
    () => null
  )
}

/** Current viewport width, or `null` during SSR and hydration. */
export function useViewportWidth(): number | null {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("resize", onChange)
      return () => window.removeEventListener("resize", onChange)
    },
    () => window.innerWidth,
    () => null
  )
}

/** Resolved value of a CSS custom property on <html>. */
export function readCssVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}
