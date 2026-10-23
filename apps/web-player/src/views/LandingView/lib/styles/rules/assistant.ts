import { FOCUS_RING } from './focus'
import type { LandingRule } from './types'

/** The AI assistant button, chat panel and thinking orb. */
export const ASSISTANT: readonly LandingRule[] = [
  /* AI assistant: bottom-right button that blooms into a chat; a thinking orb shows the phase */
  [
    'ai-fab',
    'fixed right-[24px] bottom-[24px] z-[45] grid place-items-center w-[52px] h-[52px] text-white [html:not(.has-cursor)_&]:cursor-pointer bg-[image:linear-gradient(135deg,var(--color-primary),var(--color-magenta-500))] border-0 border-none rounded-[50%] [box-shadow:0_14px_34px_-12px_color-mix(in_srgb,var(--color-primary)_70%,transparent)]',
  ],
  [
    'ai-fab',
    '[&[aria-expanded=true]]:text-foreground [&[aria-expanded=true]]:bg-card [&[aria-expanded=true]]:bg-none [&[aria-expanded=true]]:border [&[aria-expanded=true]]:border-solid [&[aria-expanded=true]]:border-border [&[aria-expanded=true]]:[box-shadow:none]',
  ],
  ['ai-fab', FOCUS_RING],
  [
    'ai-panel',
    'fixed right-[24px] bottom-[88px] z-[46] flex invisible flex-col w-[380px] h-[540px] max-h-[calc(100vh_-_120px)] overflow-hidden bg-card bg-none border border-solid border-border rounded-[18px] [box-shadow:0_30px_80px_-30px_var(--shadow)] origin-[100%_100%]',
  ],
  ['ai-panel', '[&.open]:visible'],
  [
    'ai-head',
    'flex gap-[10px] items-center h-[60px] p-[0_14px] [border-bottom:1px_solid_var(--border)]',
  ],
  [
    'mk',
    '[.ai-head_&]:grid [.ai-head_&]:place-items-center [.ai-head_&]:w-[32px] [.ai-head_&]:h-[32px] [.ai-head_&]:bg-secondary [.ai-head_&]:bg-none [.ai-head_&]:rounded-[50%]',
  ],
  [
    'intro-ll',
    '[&_svg]:block [&_svg]:w-full [&_svg]:h-full [&_svg]:overflow-visible',
  ],
  ['mk', '[.ai-head_&_svg]:w-[18px] [.ai-head_&_svg]:h-[18px]'],
  [
    'ai-head',
    '[&_small]:block [&_small]:[font-size:11px] [&_small]:text-muted-foreground',
  ],
  [
    'ai-x',
    'p-[6px] ml-auto text-muted-foreground [html:not(.has-cursor)_&]:cursor-pointer [background:none] border-0 border-none',
  ],
  [
    'ai-msgs',
    'flex flex-[1] flex-col gap-[10px] p-[14px] overflow-y-auto [overscroll-behavior:contain]',
  ],
  [
    'ai-b',
    'self-start max-w-[82%] p-[10px_12px] [font-size:13px] leading-[1.45] bg-secondary bg-none rounded-[14px]',
  ],
  [
    'ai-b',
    '[&.me]:self-end [&.me]:text-white [&.me]:bg-primary [&.me]:bg-none',
  ],
  [
    'ai-typing',
    'flex gap-[8px] items-center self-start p-[8px_12px] [font-size:12px] text-muted-foreground bg-secondary bg-none rounded-[14px]',
  ],
  [
    'ai-welcome',
    'grid gap-[8px] [justify-items:center] p-[18px_0_6px] text-center',
  ],
  ['ai-chips', 'flex flex-wrap gap-[8px] justify-center'],
  [
    'ai-chip',
    'h-[32px] p-[0_12px] font-[500] [font-size:12px] leading-[1] font-[family-name:var(--font-body)] text-foreground [html:not(.has-cursor)_&]:cursor-pointer [background:none] border border-solid border-border rounded-[16px]',
  ],
  ['ai-chip', '[&:hover]:border-accent'],
  [
    'ai-comp',
    'grid gap-[8px] p-[10px_12px_12px] [border-top:1px_solid_var(--border)]',
  ],
  [
    'ai-in',
    'flex gap-[8px] items-center h-[44px] p-[0_6px_0_12px] bg-secondary bg-none rounded-[12px]',
  ],
  [
    'ai-in',
    '[&_input]:flex-[1] [&_input]:[font-size:13px] [&_input]:leading-[1] [&_input]:font-[family-name:var(--font-body)] [&_input]:text-foreground [&_input]:[outline:0] [&_input]:[background:none] [&_input]:border-0 [&_input]:border-none',
  ],
  [
    'ai-send',
    'grid place-items-center w-[32px] h-[32px] text-white [html:not(.has-cursor)_&]:cursor-pointer bg-primary bg-none border-0 border-none rounded-[10px]',
  ],
  ['ai-comp', '[&_small]:[font-size:10px] [&_small]:text-text-subdued'],
  ['footer', 'pr-[96px]'],
  ['ai-fab', 'max-[820px]:right-[16px] max-[820px]:bottom-[16px]'],
  [
    'ai-panel',
    'max-[820px]:inset-0 max-[820px]:w-auto max-[820px]:h-auto max-[820px]:max-h-none max-[820px]:rounded-[0]',
  ],
]
