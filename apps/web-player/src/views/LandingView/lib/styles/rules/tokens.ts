import type { LandingRule } from './types'

/** The landing root: palette aliases and fonts, the fixed stage, grain, glow and sweep layers. */
export const TOKENS: readonly LandingRule[] = [
  /* Landing — ported from pencil/web-player-design/landing/motion-prototype.html. Every colour is a design token; the prototype's names stay as local aliases so the port reads 1:1. */
  [
    'landing',
    "[--bg:var(--color-background)] [--card:var(--color-card)] [--card-2:var(--color-secondary)] [--glass:color-mix(in_srgb,var(--color-card)_86%,transparent)] [--fg:var(--color-foreground)] [--muted:var(--color-muted-foreground)] [--subdued:var(--color-text-subdued)] [--border:var(--color-border)] [--primary:var(--color-primary)] [--primary-fg:var(--color-primary-foreground)] [--accent:var(--color-accent)] [--magenta:var(--color-magenta-500)] [--blue:var(--color-info)] [--success:var(--color-success)] [--warning:var(--color-warning)] [--grain:0.07] [--glow:color-mix(in_srgb,var(--color-primary)_30%,transparent)] [--shadow:color-mix(in_srgb,var(--color-black)_55%,transparent)] [--font-display:var(--font-landing-display),'Arial_Black',system-ui,sans-serif] [--font-body:var(--font-landing-body),system-ui,-apple-system,'Segoe_UI',sans-serif] [--font-data:var(--font-landing-data),ui-monospace,'SF_Mono',Menlo,monospace] relative min-h-[100dvh] m-0 font-[family-name:var(--font-body)] [font-size:14px] [-webkit-font-smoothing:antialiased] leading-[1.5] text-foreground bg-background bg-none",
  ],
  [
    'landing',
    '[.light_&]:[--grain:0.035] [.light_&]:[--glow:color-mix(in_srgb,var(--color-primary)_16%,transparent)] [.light_&]:[--shadow:color-mix(in_srgb,var(--color-primary)_16%,transparent)]',
  ],
  [
    'landing',
    '[.dim_&]:[--glow:color-mix(in_srgb,var(--color-accent)_24%,transparent)]',
  ],
  /* Eleven fullscreen scenes after the archived "Original Edition" landing. Each scene is a 1440x900 board scaled to the viewport, with layered windows over one fixed WebGL stage. One gesture = one scene. */
  ['landing', '[&.is-static]:overflow-auto'],
  [
    'i',
    '[&:is(svg)]:flex-[none] [&:is(svg)]:w-[18px] [&:is(svg)]:h-[18px] [&:is(svg)]:[fill:none] [&:is(svg)]:[stroke:currentColor] [&:is(svg)]:[stroke-width:2] [&:is(svg)]:[stroke-linecap:round] [&:is(svg)]:[stroke-linejoin:round]',
  ],
  ['#stage', 'fixed inset-0 z-[0] block w-full h-full'],
  [
    'grain',
    'fixed inset-[-50%] z-[30] pointer-events-none [background-image:var(--landing-data-1)] opacity-[var(--grain)]',
  ],
  [
    'cursor-glow',
    'fixed top-0 left-0 z-[1] w-[560px] h-[560px] m-[-280px_0_0_-280px] pointer-events-none bg-[image:radial-gradient(circle,var(--glow),transparent_62%)] rounded-[50%] [will-change:transform]',
  ],
  [
    'sweep',
    'fixed top-0 bottom-0 left-0 z-[25] w-[40vw] pointer-events-none bg-[image:linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-accent)_16%,transparent),color-mix(in_srgb,var(--color-magenta-500)_14%,transparent),transparent)] [transform:translateX(-60vw)]',
  ],
]
