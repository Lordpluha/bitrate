import type { LandingRule } from './types'

/** Late overrides that must win over every rule above. */
export const LATE: readonly LandingRule[] = [
  [
    'hc-bio',
    '[.hc_&]:mt-[10px] [.hc_&]:[font-size:13px] [.hc_&]:text-foreground',
  ],
  ['intro', '[&[hidden]]:hidden'],
  [
    'scene',
    'motion-reduce:relative motion-reduce:visible motion-reduce:h-[100vh] motion-reduce:min-h-[640px]',
  ],
  ['intro', 'motion-reduce:hidden'],
  ['ai-title', '[font-size:14px]'],
  ['ai-fab-x', '[font-size:18px]'],
  ['ai-fab-spark', '[.ai-fab_&:is(svg)]:w-[22px] [.ai-fab_&:is(svg)]:h-[22px]'],
]
