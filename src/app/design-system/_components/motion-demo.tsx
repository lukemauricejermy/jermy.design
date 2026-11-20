"use client"

import * as React from "react"
import { gsap } from "gsap"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlayIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  animationDelays,
  animationDistances,
  animationDurations,
  animationEasings,
  animationStaggers,
} from "@/lib/animation-config"

function Track({
  label,
  detail,
  trackRef,
}: {
  label: string
  detail: string
  trackRef: (el: HTMLDivElement | null) => void
}) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-0.5">
        <span className="type-small font-medium">{label}</span>
        <span className="font-mono type-caption text-muted-foreground">{detail}</span>
      </div>
      <div ref={trackRef} className="relative h-10 rounded-full bg-muted">
        <div
          data-dot
          className="absolute top-1 left-1 size-8 rounded-full bg-primary"
        />
      </div>
    </div>
  )
}

/** Animates one dot per track across its rail. */
function usePlayTracks() {
  const tracks = React.useRef<(HTMLDivElement | null)[]>([])
  const setTrack = (i: number) => (el: HTMLDivElement | null) => {
    tracks.current[i] = el
  }
  const play = (configFor: (i: number) => gsap.TweenVars) => {
    tracks.current.forEach((track, i) => {
      const dot = track?.querySelector<HTMLElement>("[data-dot]")
      if (!track || !dot) return
      const distance = track.clientWidth - dot.offsetWidth - 8
      gsap.killTweensOf(dot)
      gsap.fromTo(dot, { x: 0 }, { x: distance, ...configFor(i) })
    })
  }
  return { setTrack, play }
}

export function EasingDemo() {
  const easings = Object.entries(animationEasings)
  const { setTrack, play } = usePlayTracks()

  return (
    <div className="flex flex-col gap-4">
      {easings.map(([name, ease], i) => (
        <Track key={name} label={name} detail={ease} trackRef={setTrack(i)} />
      ))}
      <div>
        <Button
          variant="outline"
          onClick={() =>
            play((i) => ({
              ease: easings[i][1],
              duration: animationDurations.slow / 1000,
            }))
          }
        >
          <HugeiconsIcon icon={PlayIcon} data-icon="inline-start" />
          Play at slow ({animationDurations.slow}ms)
        </Button>
      </div>
    </div>
  )
}

export function DurationDemo() {
  const durations = Object.entries(animationDurations)
  const { setTrack, play } = usePlayTracks()

  return (
    <div className="flex flex-col gap-4">
      {durations.map(([name, ms], i) => (
        <Track key={name} label={name} detail={`${ms}ms`} trackRef={setTrack(i)} />
      ))}
      <div>
        <Button
          variant="outline"
          onClick={() =>
            play((i) => ({
              ease: animationEasings.smooth,
              duration: durations[i][1] / 1000,
            }))
          }
        >
          <HugeiconsIcon icon={PlayIcon} data-icon="inline-start" />
          Play with smooth
        </Button>
      </div>
    </div>
  )
}

/** The site's signature entrance: characters fade up with a stagger. */
export function StaggerDemo() {
  const ref = React.useRef<HTMLDivElement>(null)
  const staggers = Object.entries(animationStaggers)
  const [stagger, setStagger] = React.useState<keyof typeof animationStaggers>("default")
  const text = "Still doing the doing."

  const play = (key: keyof typeof animationStaggers) => {
    setStagger(key)
    const chars = ref.current?.querySelectorAll("[data-char]")
    if (!chars) return
    gsap.killTweensOf(chars)
    gsap.fromTo(
      chars,
      { opacity: 0, y: animationDistances.default },
      {
        opacity: 1,
        y: 0,
        duration: animationDurations.default / 1000,
        ease: animationEasings.smooth,
        stagger: animationStaggers[key],
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div ref={ref} className="type-headline overflow-hidden" aria-label={text}>
        {Array.from(text).map((ch, i) => (
          <span key={i} data-char aria-hidden className="inline-block whitespace-pre">
            {ch}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {staggers.map(([name, value]) => (
          <Button
            key={name}
            variant={stagger === name ? "default" : "outline"}
            size="sm"
            onClick={() => play(name as keyof typeof animationStaggers)}
          >
            {name} · {value}s
          </Button>
        ))}
      </div>
    </div>
  )
}

export function MotionTokenTable() {
  const groups = [
    { title: "Durations", unit: "ms", values: animationDurations },
    { title: "Delays", unit: "ms", values: animationDelays },
    { title: "Distances", unit: "px", values: animationDistances },
    { title: "Staggers", unit: "s", values: animationStaggers },
  ]
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {groups.map((g) => (
        <div
          key={g.title}
          className="flex flex-col gap-3 rounded-3xl bg-card p-6 ring-1 ring-foreground/5 dark:ring-foreground/10"
        >
          <span className="type-overline text-muted-foreground">{g.title}</span>
          <dl className="flex flex-col gap-1.5">
            {Object.entries(g.values).map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4">
                <dt className="type-small">{k}</dt>
                <dd className="font-mono type-small text-muted-foreground">
                  {v}
                  {g.unit}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}
