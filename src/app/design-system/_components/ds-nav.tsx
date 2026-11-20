"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type NavGroup = { title: string; items: { id: string; label: string }[] }

/** Sticky in-page navigation that highlights the section in view. */
export function DsNav({ groups }: { groups: NavGroup[] }) {
  const ids = React.useMemo(
    () => groups.flatMap((g) => g.items.map((i) => i.id)),
    [groups]
  )
  const [active, setActive] = React.useState<string>(ids[0])

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      // A band across the upper part of the viewport counts as "in view".
      { rootMargin: "-20% 0px -60% 0px" }
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [ids])

  return (
    <nav aria-label="Design system" className="flex flex-col gap-8">
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          <span className="type-overline text-muted-foreground">{group.title}</span>
          <ul className="flex flex-col">
            {group.items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "location" : undefined}
                  className={cn(
                    "-ml-3 block rounded-full px-3 py-1.5 type-small transition-colors hover:text-foreground",
                    active === item.id
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
