import type { LandingRule } from './types'

/** Partners and team: the interactive physics zones. */
export const PHYSICS: readonly LandingRule[] = [
  /* partners + team: interactive zones */
  ['drag-zone', 'touch-none [html:not(.has-cursor)_&]:cursor-grab'],
  ['drag-zone', '[html:not(.has-cursor)_&:active]:cursor-grabbing'],
  /* the pit is now just the table the jar stands on: its floor line stays */
  ['pit', 'overflow-visible'],
  [
    'pit',
    "[&::after]:absolute [&::after]:right-0 [&::after]:bottom-0 [&::after]:left-0 [&::after]:h-[2px] [&::after]:[content:''] [&::after]:bg-[image:linear-gradient(90deg,transparent,var(--accent),var(--magenta),transparent)] [&::after]:opacity-[0.6]",
  ],
  /* the jar: glass walls, a rounded base and a lip at the rim */
  [
    'jar',
    'absolute box-border pointer-events-none border-[3px] border-t-0 border-solid border-[color:color-mix(in_srgb,var(--color-foreground)_24%,transparent)] rounded-[0_0_64px_64px] bg-[image:linear-gradient(90deg,color-mix(in_srgb,var(--color-foreground)_7%,transparent),transparent_22%,transparent_78%,color-mix(in_srgb,var(--color-foreground)_9%,transparent))] [box-shadow:inset_0_-30px_60px_-30px_color-mix(in_srgb,var(--color-primary)_30%,transparent),0_30px_60px_-40px_var(--shadow)]',
  ],
  [
    'jar',
    "[&::before]:absolute [&::before]:top-[-8px] [&::before]:left-[-12px] [&::before]:right-[-12px] [&::before]:h-[14px] [&::before]:[content:''] [&::before]:border-[3px] [&::before]:border-solid [&::before]:border-[color:color-mix(in_srgb,var(--color-foreground)_28%,transparent)] [&::before]:rounded-[8px]",
  ],
  [
    'jar-shine',
    'absolute top-[10%] bottom-[14%] left-[9%] w-[7%] rounded-[999px] bg-[image:linear-gradient(to_bottom,color-mix(in_srgb,var(--color-white)_26%,transparent),transparent)]',
  ],
  [
    'jar-lid',
    'absolute z-[4] p-0 origin-[90%_50%] border border-solid border-[color:color-mix(in_srgb,var(--color-white)_20%,transparent)] rounded-[10px] bg-[image:linear-gradient(to_bottom,var(--color-neutral-400),var(--color-neutral-700)_55%,var(--color-neutral-800))] [box-shadow:0_10px_24px_-10px_var(--shadow)] [html:not(.has-cursor)_&]:cursor-pointer',
  ],
  [
    'jar-lid',
    "[&::after]:absolute [&::after]:inset-[30%_6%] [&::after]:[content:''] [&::after]:rounded-[3px] [&::after]:bg-[image:repeating-linear-gradient(90deg,color-mix(in_srgb,var(--color-black)_25%,transparent)_0_2px,transparent_2px_7px)]",
  ],
  [
    'jar-lid',
    'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4',
  ],
  [
    'jar-controls',
    'flex flex-wrap gap-[10px] items-center mt-[24px] motion-reduce:hidden',
  ],
  [
    'jar-footer',
    'text-accent [font-size:12px] no-underline [&:hover]:underline [&[hidden]]:hidden',
  ],
  /* bubbles out of the jar: one fixed layer over every scene, below the header */
  ['loose', 'fixed inset-0 z-[30] overflow-hidden pointer-events-none'],
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
    'ball',
    'z-[2] pointer-events-auto touch-none [html:not(.has-cursor)_&]:cursor-grab [html:not(.has-cursor)_&:active]:cursor-grabbing',
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
  /* the cradle listens on its whole scene (it is drawn larger than this slot) */
  ['#cradleSlot', 'pointer-events-none'],
  [
    'cradle-hint',
    'absolute top-[-26px] left-0 right-0 text-center pointer-events-none font-[500] [font-size:10px] leading-[1] font-[family-name:var(--font-data)] text-muted-foreground tracking-[0.14em] uppercase motion-reduce:hidden',
  ],
]
