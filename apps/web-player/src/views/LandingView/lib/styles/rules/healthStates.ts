import type { LandingRule } from './types'

/** Service status states; after the mobile and cursor rules so they win. */
export const HEALTH_STATES: readonly LandingRule[] = [
  /* service status states (the footer pill reads the real readiness endpoint) */
  [
    'hdot',
    '[&.is-checking]:bg-muted-foreground [&.is-checking]:bg-none [&.is-checking]:animate-[none]',
  ],
  [
    'hdot',
    '[&.is-degraded]:bg-warning [&.is-degraded]:bg-none [&.is-degraded]:animate-[none]',
  ],
  [
    'hdot',
    '[&.is-unreachable]:bg-destructive [&.is-unreachable]:bg-none [&.is-unreachable]:animate-[none]',
  ],
  ['hstate', '[&.is-checking]:text-muted-foreground'],
  ['hstate', '[&.is-degraded]:text-warning'],
  ['hstate', '[&.is-unreachable]:text-destructive'],
  [
    'hrow',
    '[&.is-single]:grid-cols-[minmax(0,1fr)_auto] [&.is-single]:[border-bottom:0]',
  ],
]
