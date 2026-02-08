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
