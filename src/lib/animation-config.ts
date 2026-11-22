/**
 * Central animation configuration for consistent choreography across the site
 */

export const animationDurations = {
  fast: 400,
  default: 600,
  slow: 900,
  verySlow: 1200,
} as const;

export const animationEasings = {
  smooth: "power2.out",
  robust: "power3.out",
  gentle: "power1.out",
  veryGentle: "sine.out",
} as const;

export const animationDistances = {
  subtle: 10,
  default: 15,
  medium: 20,
  large: 30,
} as const;

export const animationDelays = {
  immediate: 0,
  short: 200,
  medium: 400,
  long: 600,
  veryLong: 800,
} as const;

export const animationStaggers = {
  fast: 0.01,
  default: 0.025,
  slow: 0.04,
} as const;

/**
 * Case study tiles dealing in as they scroll into view: a calmer cousin of
 * the values deck's deal (thrown in from below-right, slightly lifted,
 * settling on friction), with the text following a beat behind. No fades.
 */
export const dealIn = {
  /** Where each tile starts, relative to its resting place. */
  from: { x: 24, y: 64, rotation: 2, scale: 1.03 },
  /** Alternate tiles start with a little more tilt, so a row doesn't move as one. */
  rotationStep: 1,
  move: { duration: 0.9, ease: "power4.out" },
  // Tilt settles on the same curve as the slide: one firm landing, no
  // overshoot or wobble anywhere.
  spin: { duration: 0.9, ease: "power4.out" },
  touchDown: { duration: 0.3, ease: "power2.in" },
  /** Tiles arriving together (a row on desktop) deal one after another. */
  stagger: 0.14,
  /** The title, year and line follow the tile. */
  text: { delay: 0.2, distance: 10, duration: 0.7, ease: "power3.out", stagger: 0.08 },
  // Starts the moment a tile peeks on screen. Nothing fades: tiles and
  // text are always visible, just displaced until they settle.
  start: "top bottom",
} as const;
