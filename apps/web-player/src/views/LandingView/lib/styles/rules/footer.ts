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
  /* a scene's secondary call to action: a quiet link with room for a thumb */
  [
    'try-link',
    'inline-flex gap-[8px] items-center min-h-[44px] font-[600] [font-size:14px] leading-[1] font-[family-name:var(--font-body)] text-accent no-underline [&_.i]:w-[16px] [&_.i]:h-[16px] [&_.i]:[transition:transform_0.2s] [&:hover_.i]:[transform:translateX(3px)] [&:hover]:underline [&:hover]:underline-offset-4',
  ],
  /* the hero's one-step Google sign-in: the app's own button and consent box, kept narrow */
  [
    'quick-in',
    'w-[360px] max-w-full text-left [font-size:13px] leading-[1.4] max-[820px]:w-full',
  ],
  /* FAQ: native disclosure rows in a glass card; the arrow turns when a row opens */
  [
    'faq-list',
    'flex flex-col h-full box-border p-[8px_24px] overflow-y-auto [background:var(--glass)] [backdrop-filter:blur(10px)] border border-solid border-border rounded-[20px] max-[820px]:p-[4px_16px]',
  ],
  [
    'faq-item',
    '[border-bottom:1px_solid_var(--border)] [&:last-child]:border-b-0',
  ],
  [
    'faq-item',
    '[&>summary]:flex [&>summary]:gap-[16px] [&>summary]:items-center [&>summary]:justify-between [&>summary]:min-h-[64px] [&>summary]:font-[600] [&>summary]:[font-size:17px] [&>summary]:leading-[1.3] [&>summary]:text-foreground [&>summary]:list-none [&>summary::-webkit-details-marker]:hidden max-[820px]:[&>summary]:min-h-[52px] max-[820px]:[&>summary]:[font-size:15px]',
  ],
  [
    'faq-item',
    '[&>summary]:rounded-[8px] [&>summary:focus-visible]:outline-2 [&>summary:focus-visible]:outline-ring [&>summary:focus-visible]:outline-offset-2',
  ],
  [
    'faq-item',
    '[&>p]:m-0 [&>p]:pb-[18px] [&>p]:pr-[36px] [&>p]:[font-size:15px] [&>p]:leading-[1.55] [&>p]:text-muted-foreground max-[820px]:[&>p]:[font-size:14px] max-[820px]:[&>p]:pr-0',
  ],
  [
    'faq-chev',
    'shrink-0 w-[18px]! h-[18px]! text-muted-foreground [transform:rotate(90deg)] [transition:transform_0.25s] [details[open]_&]:[transform:rotate(-90deg)]',
  ],
  ['faq-link', 'text-accent'],
]
