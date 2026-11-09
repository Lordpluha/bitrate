import type { LandingRule } from './types'

/** Footer links with CSS-only underline reveals. */
export const FOOTER_LINKS: readonly LandingRule[] = [
  /* footer links: CSS-only underline reveals (left, right, centre) */
  ['ulink', 'relative text-inherit no-underline'],
  [
    'ulink',
    "[&::after]:absolute [&::after]:right-0 [&::after]:bottom-[-4px] [&::after]:left-0 [&::after]:h-[1.5px] [&::after]:[content:''] [&::after]:[background:currentColor] [&::after]:[transform:scaleX(0)] [&::after]:origin-[left] [&::after]:[transition:transform_0.38s_cubic-bezier(0.2,0.8,0.2,1)]",
  ],
  ['ulink', '[&:hover]:text-foreground [&:focus-visible]:text-foreground'],
  [
    'ulink',
    '[&:hover::after]:[transform:scaleX(1)] [&:focus-visible::after]:[transform:scaleX(1)]',
  ],
  ['ulink', '[&.u-right::after]:origin-[right]'],
  ['ulink', '[&.u-center::after]:origin-[center]'],
  /* hero platform totals: big numbers over small captions, separated by hairlines */
  ['hstats', 'flex gap-[28px] m-0'],
  [
    'hstats',
    '[&_>_div]:flex [&_>_div]:flex-col-reverse [&_>_div]:gap-[6px] [&_>_div+div]:pl-[28px] [&_>_div+div]:[border-left:1px_solid_var(--border)]',
  ],
  [
    'hstats',
    '[&_dd]:m-0 [&_dd]:font-[700] [&_dd]:[font-size:30px] [&_dd]:leading-[1] [&_dd]:font-[family-name:var(--font-display)] [&_dd]:text-foreground [&_dd]:[font-variant-numeric:tabular-nums]',
  ],
  [
    'hstats',
    '[&_dt]:font-[500] [&_dt]:[font-size:11px] [&_dt]:leading-[1] [&_dt]:font-[family-name:var(--font-data)] [&_dt]:text-muted-foreground [&_dt]:tracking-[0.1em] [&_dt]:uppercase',
  ],
  [
    'hstats',
    'max-[820px]:gap-[16px] max-[820px]:[&_>_div+div]:pl-[16px] max-[820px]:[&_dd]:[font-size:22px]',
  ],
  /* hero trust line: free · no install · open source, dots between */
  ['trust', 'flex-wrap gap-[8px_10px] text-muted-foreground'],
  [
    'trust',
    '[&_>_i]:w-[3px] [&_>_i]:h-[3px] [&_>_i]:rounded-[50%] [&_>_i]:bg-muted-foreground [&_>_i]:opacity-[0.6]',
  ],
  [
    'trust-gh',
    'inline-flex gap-[6px] items-center text-foreground [&_.i]:w-[14px] [&_.i]:h-[14px]',
  ],
  /* footer brand: the Bitrate mark and the repository link */
  [
    'f-brand',
    'flex gap-[10px] items-center text-foreground no-underline font-[600] [font-size:20px] leading-[1] font-[family-name:var(--font-display)]',
  ],
  ['f-brand', '[&_svg]:w-[26px] [&_svg]:h-[26px]'],
  /* beats the footer's own `a { color: inherit }` */
  ['f-brand', '[.footer_&]:text-foreground'],
  [
    'f-gh',
    'inline-flex gap-[6px] items-center [&_.i]:w-[15px] [&_.i]:h-[15px]',
  ],
]
