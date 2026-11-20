"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { readCssVar, useThemeKey } from "./use-client-env"

let canvasCtx: CanvasRenderingContext2D | null = null

/** Any CSS colour (oklch, lab, var-resolved…) → `#rrggbb` or `#rrggbb · 10%`. */
function toHex(color: string): string {
  if (!color) return ""
  canvasCtx ??= Object.assign(document.createElement("canvas"), {
    width: 1,
    height: 1,
  }).getContext("2d", { willReadFrequently: true })
  if (!canvasCtx) return color
  const sample = (fill: string) => {
    canvasCtx!.clearRect(0, 0, 1, 1)
    canvasCtx!.fillStyle = "#000"
    canvasCtx!.fillStyle = fill
    canvasCtx!.fillRect(0, 0, 1, 1)
    return canvasCtx!.getImageData(0, 0, 1, 1).data
  }
  const a = sample(color)[3]
  // Read RGB at full opacity: translucent pixels lose precision on readback.
  const [r, g, b] = a < 255 ? sample(`rgb(from ${color} r g b / 1)`) : sample(color)
  const hex = `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`
  return a < 255 ? `${hex} · ${Math.round((a / 255) * 100)}%` : hex
}

/** Colour swatch that shows the token's live value in the current theme. */
export function ColorSwatch({ token, note }: { token: string; note?: string }) {
  const themeKey = useThemeKey()
  const value = themeKey === null ? "" : toHex(readCssVar(`--${token}`))

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div
        className="h-20 rounded-2xl ring-1 ring-foreground/10 ring-inset"
        style={{ background: `var(--${token})` }}
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="type-small font-medium">{token}</span>
        <span className="truncate font-mono type-caption text-muted-foreground">
          {value || " "}
        </span>
        {note && (
          <span className="type-caption text-muted-foreground">{note}</span>
        )}
      </div>
    </div>
  )
}

/** Box using a radius utility, labelled with its computed value. */
export function RadiusSample({
  name,
  className,
}: {
  name: string
  className: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [value, setValue] = React.useState("")

  React.useLayoutEffect(() => {
    if (!ref.current) return
    // Reads the rendered radius once after mount.
    const px = parseFloat(getComputedStyle(ref.current).borderTopLeftRadius)
    setValue(px > 999 ? "pill" : `${+px.toFixed(1)}px`)
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={ref}
        className={cn(
          "aspect-square w-full bg-muted ring-1 ring-foreground/10 ring-inset",
          className
        )}
      />
      <div className="flex flex-col gap-0.5">
        <span className="type-small font-medium">{name}</span>
        <span className="font-mono type-caption text-muted-foreground">
          {value || " "}
        </span>
      </div>
    </div>
  )
}
