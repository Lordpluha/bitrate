import type { LandingRule } from './types'

/** Partners and team: the interactive physics zones. */
export const PHYSICS: readonly LandingRule[] = [
  /* partners + team: interactive zones */
  ['drag-zone', 'touch-none [html:not(.has-cursor)_&]:cursor-grab'],
  ['drag-zone', '[html:not(.has-cursor)_&:active]:cursor-grabbing'],
  [
    'pit',
    'overflow-hidden bg-[image:linear-gradient(to_top,color-mix(in_srgb,var(--color-primary)_14%,transparent),transparent_45%)] border border-solid border-border rounded-[26px]',
  ],
  [
    'pit',
    "[&::after]:absolute [&::after]:right-0 [&::after]:bottom-0 [&::after]:left-0 [&::after]:h-[2px] [&::after]:[content:''] [&::after]:bg-[image:linear-gradient(90deg,transparent,var(--accent),var(--magenta),transparent)] [&::after]:opacity-[0.6]",
  ],
  [
    'ball',
    'absolute top-0 left-0 grid place-items-center text-white text-center [-webkit-user-select:none] select-none rounded-[50%] [box-shadow:inset_-10px_-14px_28px_color-mix(in_srgb,var(--color-black)_35%,transparent),inset_8px_10px_22px_color-mix(in_srgb,var(--color-white)_22%,transparent),0_12px_30px_-12px_color-mix(in_srgb,var(--color-black)_60%,transparent)] [will-change:transform]',
  ],
  [
    'ball',
    '[&.person]:font-[700] [&.person]:[font-size:44px] [&.person]:leading-[1] [&.person]:font-[family-name:var(--font-display)] [&.person]:tracking-[-0.02em] [&.person]:[outline:3px_solid_color-mix(in_srgb,var(--color-white)_14%,transparent)] [&.person]:[outline-offset:-3px]',
  ],
  [
    'ball',
    '[&.tech]:box-border [&.tech]:p-[6px] [&.tech]:font-[600] [&.tech]:[font-size:12px] [&.tech]:leading-[1.1] [&.tech]:font-[family-name:var(--font-body)]',
  ],
  [
    'ball',
    '[&.hot]:[outline:2px_solid_var(--accent)] [&.hot]:[outline-offset:2px]',
  ],
  [
    'hc',
    'absolute top-0 left-0 z-[5] w-[290px] p-[16px] pointer-events-none bg-card bg-none border border-solid border-border rounded-[12px] [box-shadow:0_24px_60px_-24px_var(--shadow)] opacity-[0] [scale:0.96] [transition:opacity_0.15s_ease,scale_0.15s_ease]',
  ],
  [
    'hc',
    '[&.open]:pointer-events-auto [&.open]:opacity-[1] [&.open]:[scale:1]',
  ],
  ['row', '[.hc_&]:items-start'],
  [
    'links',
    '[.hc_&]:flex [.hc_&]:flex-wrap [.hc_&]:gap-[8px] [.hc_&]:mt-[12px]',
  ],
  ['stats', 'flex gap-[26px] mt-[30px]'],
]
