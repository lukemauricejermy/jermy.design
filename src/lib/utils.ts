import { createCn } from "cn/config"

/** Type scale styles defined as `type-*` utilities in globals.css. */
export const TYPE_STYLES = [
  "hero",
  "display",
  "headline",
  "title-lg",
  "title",
  "title-sm",
  "lead",
  "body",
  "body-long",
  "label",
  "small",
  "caption",
  "overline",
] as const

export type TypeStyle = (typeof TYPE_STYLES)[number]

/**
 * Class merger (shadcn's `cn`, a faster tailwind-merge) extended with the
 * type scale: a `type-*` class replaces any earlier `text-*` size, weight,
 * leading, tracking or `type-*`; a later `text-*` size replaces it; later
 * leading / tracking / weight modifiers still compose with it.
 *
 * UI components in src/components/ui import `cn` from here, not from "cn"
 * directly. After `shadcn add`, repoint the new file's import.
 */
export const cn = createCn<"type">({
  extend: {
    classGroups: {
      type: [{ type: [...TYPE_STYLES] }],
    },
    conflictingClassGroups: {
      // A type style sets size, weight, leading and tracking, so it replaces
      // any of those that come before it (e.g. a component's base
      // font-medium); modifiers placed after it still win.
      type: ["font-size", "font-weight", "leading", "tracking"],
      "font-size": ["type"],
    },
  },
})
