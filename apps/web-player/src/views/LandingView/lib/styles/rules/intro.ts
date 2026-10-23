import type { LandingRule } from './types'

/** The logo intro overlay. */
export const INTRO: readonly LandingRule[] = [
  /* intro: the logo writes itself, then the hero takes over */
  [
    'intro',
    'fixed inset-0 z-[90] grid gap-[18px] [place-content:center] [justify-items:center] bg-background bg-none',
  ],
  ['intro-ll', 'absolute inset-0'],
  ['mono', '[.intro_&]:top-[calc(50%_+_min(100vw,100vh)_*_0.15_+_62px)]'],
  ['intro', '[.is-static_&]:hidden'],
]
