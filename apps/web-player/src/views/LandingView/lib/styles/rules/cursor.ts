import type { LandingRule } from './types'

/** The Signal cursor (fine pointers only). */
export const CURSOR: readonly LandingRule[] = [
  /* Signal cursor — one custom cursor for the landing and the app (fine pointers only; touch keeps the system) */
  ['cur', 'fixed top-0 left-0 z-[9999] pointer-events-none'],
  [
    'cur',
    '[&_>_*]:fixed [&_>_*]:top-0 [&_>_*]:left-0 [&_>_*]:pointer-events-none [&_>_*]:[will-change:transform]',
  ],
  [
    'cur-dot',
    'w-[6px] h-[6px] m-[-3px_0_0_-3px] bg-foreground bg-none rounded-[50%] [transition:opacity_0.2s,scale_0.2s]',
  ],
  [
    'cur-ring',
    'grid place-items-center w-[40px] h-[40px] m-[-20px_0_0_-20px] border-[length:1.5px] border-solid border-accent rounded-[50%] [transition:width_0.32s_cubic-bezier(0.2,0.8,0.2,1),height_0.32s_cubic-bezier(0.2,0.8,0.2,1),margin_0.32s_cubic-bezier(0.2,0.8,0.2,1),background-color_0.3s,border-color_0.3s,opacity_0.2s,scale_0.2s]',
  ],
  [
    'cur-ring',
    '[&_>_*]:[grid-area:1_/_1] [&_>_*]:opacity-[0] [&_>_*]:[transition:opacity_0.2s]',
  ],
  [
    'cur-arrows',
    'pl-[6px] font-[600] [font-size:14px] leading-[1] font-[family-name:var(--font-body,system-ui)] text-accent tracking-[6px]',
  ],
  [
    'cur-ban',
    'relative w-[14px] h-[14px] border-[length:1.5px] border-solid border-muted-foreground rounded-[50%]',
  ],
  [
    'cur-ban',
    "[&::after]:absolute [&::after]:top-[-1px] [&::after]:bottom-[-1px] [&::after]:left-1/2 [&::after]:w-[1.5px] [&::after]:ml-[-0.75px] [&::after]:[content:''] [&::after]:bg-muted-foreground [&::after]:bg-none [&::after]:[transform:rotate(45deg)]",
  ],
  [
    'cur-pill',
    'flex gap-[8px] items-center h-[40px] p-[0_14px] m-[-20px_0_0_-38px] font-[600] [font-size:13px] leading-[1] font-[family-name:var(--font-body,system-ui)] text-background bg-white bg-none rounded-[20px] opacity-[0] [scale:0.5] [transition:opacity_0.2s,scale_0.32s_cubic-bezier(0.3,1.6,0.5,1)]',
  ],
  [
    'cur-beam',
    'w-[2px] h-[22px] m-[-11px_0_0_-1px] bg-accent bg-none rounded-[1px] opacity-[0] [transition:opacity_0.15s]',
  ],
  [
    'cur-scrub',
    'grid gap-[4px] [justify-items:center] w-[40px] m-[-44px_0_0_-20px] opacity-[0] [transition:opacity_0.15s]',
  ],
  [
    'cur-ring',
    '[.cur.m-hover_&]:w-[56px] [.cur.m-hover_&]:h-[56px] [.cur.m-hover_&]:m-[-28px_0_0_-28px] [.cur.m-hover_&]:bg-[color:color-mix(in_srgb,var(--accent)_16%,transparent)] [.cur.m-drag_&]:w-[56px] [.cur.m-drag_&]:h-[56px] [.cur.m-drag_&]:m-[-28px_0_0_-28px] [.cur.m-drag_&]:bg-[color:color-mix(in_srgb,var(--accent)_16%,transparent)]',
  ],
  [
    'cur-dot',
    '[.cur.m-hover_&]:opacity-[0] [.cur.m-drag_&]:opacity-[0] [.cur.m-disabled_&]:opacity-[0]',
  ],
  ['cur-arrows', '[.cur.m-drag_&]:opacity-[1]'],
  ['cur-ban', '[.cur.m-disabled_&]:opacity-[1]'],
  ['cur-ring', '[.cur.m-disabled_&]:border-muted-foreground'],
  [
    'cur-ring',
    '[.cur.m-play_&]:opacity-[0] [.cur.m-text_&]:opacity-[0] [.cur.m-scrub_&]:opacity-[0]',
  ],
  [
    'cur-dot',
    '[.cur.m-play_&]:opacity-[0] [.cur.m-text_&]:opacity-[0] [.cur.m-scrub_&]:opacity-[0]',
  ],
  ['cur', '[&.m-hide_>_*]:opacity-[0]'],
  ['cur-pill', '[.cur.m-play_&]:opacity-[1] [.cur.m-play_&]:[scale:1]'],
  ['cur-beam', '[.cur.m-text_&]:opacity-[1]'],
  ['cur-scrub', '[.cur.m-scrub_&]:opacity-[1]'],
  ['cur-ring', '[.cur.is-press_&]:[scale:0.75]'],
  ['cur-pill', '[.cur.is-press_&]:[scale:0.9]'],
  ['cur', '[&.is-out_>_*]:opacity-[0]!'],
]
