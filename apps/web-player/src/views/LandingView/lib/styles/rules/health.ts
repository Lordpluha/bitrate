import { FOCUS_RING } from './focus'
import type { LandingRule } from './types'

/** Service health: the footer pill and its goo panel. */
export const HEALTH: readonly LandingRule[] = [
  /* service health: pill that blooms into a panel through an SVG goo filter */
  ['health', 'relative'],
  [
    'hpill',
    'relative z-[2] inline-flex gap-[8px] items-center h-[34px] p-[0_12px] font-[500] [font-size:13px] leading-[1] font-[family-name:var(--font-body)] text-foreground [html:not(.has-cursor)_&]:cursor-pointer bg-card bg-none border border-solid border-border rounded-[17px]',
  ],
  ['hpill', FOCUS_RING],
  [
    'hdot',
    'w-[8px] h-[8px] bg-success bg-none rounded-[50%] [box-shadow:0_0_0_0_color-mix(in_srgb,var(--color-success)_55%,transparent)] animate-[landing-hping_2s_infinite]',
  ],
  [
    'goo',
    'absolute right-0 bottom-0 z-[1] w-[540px] h-[520px] pointer-events-none [filter:url(#goo)]',
  ],
  ['blob', 'absolute right-0 bg-card bg-none'],
  ['b-pill', 'bottom-0 w-[210px] h-[34px] rounded-[17px]'],
  [
    'b-panel',
    'bottom-[46px] w-[520px] h-[440px] rounded-[18px] [transform:scale(0.12,0.05)] origin-[100%_100%]',
  ],
  [
    'hpanel',
    'absolute right-0 bottom-[46px] z-[2] box-border flex invisible flex-col w-[520px] max-h-[min(560px,calc(100vh_-_120px))] p-[16px] text-foreground text-left opacity-[0]',
  ],
  /* the rows scroll inside the panel when the window is short; the blob behind it is sized from the panel's own height */
  [
    '#hrows',
    'block min-h-0 pr-[6px] mr-[-6px] overflow-y-auto [overscroll-behavior:contain] [scrollbar-width:thin]',
  ],
  ['hpanel', '[.health.open_&]:visible'],
  [
    'hrow',
    'grid grid-cols-[minmax(0,1fr)_auto_auto] gap-[12px] items-center p-[9px_0] [border-bottom:1px_solid_var(--border)]',
  ],
  [
    'hrow',
    '[&_small]:block [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:[font-size:11px] [&_small]:text-muted-foreground [&_small]:whitespace-nowrap',
  ],
  ['dots', '[transition:opacity_0.2s]'],
  [
    'dots',
    '[.is-health-open_&]:pointer-events-none [.is-health-open_&]:opacity-[0]',
  ],
  [
    'hstate',
    'inline-flex gap-[6px] items-center font-[600] [font-size:12px] leading-[1] font-[family-name:var(--font-body)] text-success',
  ],
  [
    'hstate',
    "[&::before]:w-[6px] [&::before]:h-[6px] [&::before]:[content:''] [&::before]:[background:currentColor] [&::before]:rounded-[50%]",
  ],
  ['hstate', '[&.w]:text-warning'],
]
