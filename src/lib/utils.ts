import { createCn } from "cn/config"

/** Type scale styles defined as `type-*` utilities in globals.css. */
export const TYPE_STYLES = [
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
 * type scale: a `type-*` class replaces any earlier `text-*` size or
 * `type-*`, and a later `text-*` size replaces an earlier `type-*`.
 * Line height / tracking / weight modifiers still compose with `type-*`.
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
      type: ["font-size"],
      "font-size": ["type"],
    },
  },
})
