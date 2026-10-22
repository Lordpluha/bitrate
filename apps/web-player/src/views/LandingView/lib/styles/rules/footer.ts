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
]
