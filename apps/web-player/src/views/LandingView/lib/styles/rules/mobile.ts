import type { LandingRule } from './types'

/** Phone layout (max 820px) and reduced-motion overrides of the rules above. */
export const MOBILE: readonly LandingRule[] = [
  ['landing', 'max-[820px]:[font-size:13px]'],
  ['nav', 'max-[820px]:hidden'],
  ['dots', 'max-[820px]:hidden'],
  ['label', 'max-[820px]:[.top_.btn-ghost_&]:hidden'],
  ['themes', 'max-[820px]:[&_button]:p-[6px_8px]'],
  ['scene', 'max-[820px]:box-border max-[820px]:p-[84px_16px_64px]'],
  [
    'board',
    'max-[820px]:static max-[820px]:flex max-[820px]:flex-col max-[820px]:gap-[16px] max-[820px]:w-full max-[820px]:h-auto max-[820px]:[transform:none]',
  ],
  ['abs', 'max-[820px]:static! max-[820px]:w-auto! max-[820px]:h-auto!'],
  ['pos', 'max-[820px]:static! max-[820px]:w-auto! max-[820px]:h-auto!'],
  ['d-only', 'max-[820px]:hidden!'],
  ['h72', 'max-[820px]:[font-size:36px]'],
  ['h80', 'max-[820px]:[font-size:36px]'],
  ['h56', 'max-[820px]:[font-size:32px]'],
  ['h54', 'max-[820px]:[font-size:32px]'],
  ['h48', 'max-[820px]:[font-size:29px]'],
  ['lede', 'max-[820px]:[font-size:15px] max-[820px]:[&.s]:[font-size:15px]'],
  ['ctas', 'max-[820px]:flex-col'],
  ['btn', 'max-[820px]:max-w-full'],
  ['btn', 'max-[820px]:[.ctas_&]:w-full max-[820px]:[.ctas_&]:h-[48px]'],
  ['win', 'max-[820px]:[transform:none]!'],
  ['card', 'max-[820px]:[transform:none]!'],
  ['m-fit', 'max-[820px]:max-h-[38vh] max-[820px]:overflow-hidden'],
  ['win', 'max-[820px]:[&.m-fit]:h-auto!'],
  ['lrow', 'max-[820px]:grid-cols-[26px_40px_1fr]'],
  ['lrow', 'max-[820px]:[&_>_:nth-child(n_+_4)]:hidden'],
  ['drag-zone', 'max-[820px]:relative! max-[820px]:h-[46vh]!'],
  ['hpanel', 'max-[820px]:w-[calc(100vw_-_32px)]'],
  ['b-panel', 'max-[820px]:w-[calc(100vw_-_32px)]'],
  ['goo', 'max-[820px]:w-[calc(100vw_-_16px)]'],
  ['hrow', 'max-[820px]:gap-[10px]'],
  ['#cradleSlot', 'max-[820px]:h-[26vh]!'],
  /* mobile layout: every scene is a balanced column that fits one screen, nothing wider than the gutter */
  [
    'scene',
    'max-[820px]:[&_*]:box-border max-[820px]:[&_*::before]:box-border max-[820px]:[&_*::after]:box-border',
  ],
  [
    'scene',
    'max-[820px]:p-[calc(env(safe-area-inset-top,0px)_+_76px)_16px_calc(env(safe-area-inset-bottom,0px)_+_84px)]',
  ],
  [
    'board',
    'max-[820px]:gap-[14px] max-[820px]:[justify-content:safe_center] max-[820px]:h-full',
  ],
  [
    'board',
    'max-[820px]:[&_>_*]:flex-[0_0_auto] max-[820px]:[&_>_*]:min-w-0 max-[820px]:[&_>_*]:max-w-full',
  ],
  ['btn', 'max-[820px]:[.ctas_&]:p-[0_18px]'],
  /* the physics fields take whatever height is left instead of a fixed share of the screen */
  [
    'drag-zone',
    'max-[820px]:top-0! max-[820px]:left-0! max-[820px]:flex-[1_1_auto]! max-[820px]:w-full! max-[820px]:h-auto! max-[820px]:min-h-[200px]',
  ],
  [
    '#cradleSlot',
    'max-[820px]:flex-[1_1_auto]! max-[820px]:h-auto! max-[820px]:min-h-[150px] max-[820px]:max-h-[240px]',
  ],
  ['pit', 'max-[820px]:rounded-[20px]'],
  /* the particle field steps back so headlines stay readable on a small screen */
  ['#stage', 'max-[820px]:opacity-[0.5]'],
  [
    'counter',
    'max-[820px]:bottom-[calc(env(safe-area-inset-bottom,0px)_+_28px)]!',
  ],
  /* footer: brand + status in one line, links below */
  [
    'footer',
    'max-[820px]:flex-wrap max-[820px]:gap-[10px_16px] max-[820px]:justify-between max-[820px]:h-auto max-[820px]:p-[12px_0_0]',
  ],
  [
    'row',
    'max-[820px]:[.footer_>_&:last-child]:flex-wrap max-[820px]:[.footer_>_&:last-child]:gap-[14px]! max-[820px]:[.footer_>_&:last-child]:justify-between max-[820px]:[.footer_>_&:last-child]:w-full',
  ],
  ['ulink', 'max-[820px]:[.footer_&]:whitespace-nowrap'],
  ['hpill', 'max-[820px]:h-[32px] max-[820px]:[font-size:12px]'],
  ['hpanel', 'max-[820px]:max-h-[calc(100vh_-_200px)]'],
  ['live', 'motion-reduce:[&_i]:animate-[none]'],
]
