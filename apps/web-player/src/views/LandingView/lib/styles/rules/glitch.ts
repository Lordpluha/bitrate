import type { LandingRule } from './types'

/** Glitch: RGB slice-tear + shake. */
export const GLITCH: readonly LandingRule[] = [
  /* glitch: RGB slice-tear + shake (own implementation of the reference effect) */
  ['glitch', 'relative'],
  ['glitch', '[&:is(span)]:inline-block'],
  [
    'glitch',
    '[&::before]:absolute [&::before]:inset-0 [&::before]:whitespace-nowrap [&::before]:pointer-events-none [&::before]:[content:attr(data-text)] [&::before]:opacity-[0] [&::after]:absolute [&::after]:inset-0 [&::after]:whitespace-nowrap [&::after]:pointer-events-none [&::after]:[content:attr(data-text)] [&::after]:opacity-[0]',
  ],
  [
    'glitch',
    '[&::before]:text-magenta-500 [&::before]:[-webkit-text-fill-color:var(--color-magenta-500)]',
  ],
  [
    'glitch',
    '[&::after]:text-info [&::after]:[-webkit-text-fill-color:var(--color-info)]',
  ],
  ['glitch', '[&.is-glitching]:animate-[landing-g-shake_0.6s_steps(3)_both]'],
  [
    'glitch',
    '[&.is-glitching::before]:animate-[landing-g-tear-a_0.6s_steps(2)_both]',
  ],
  [
    'glitch',
    '[&.is-glitching::after]:animate-[landing-g-tear-b_0.6s_steps(2)_both]',
  ],
]
