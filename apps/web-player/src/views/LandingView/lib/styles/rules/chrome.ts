import { BUTTON_FOCUS_RING, FOCUS_RING } from './focus'
import type { LandingRule } from './types'

/** Chrome: header, theme switch, buttons, scene dots and counter. */
export const CHROME: readonly LandingRule[] = [
  /* chrome */
  [
    'top',
    'fixed inset-[0_0_auto_0] z-[40] flex gap-[16px] items-center justify-between p-[calc(env(safe-area-inset-top,0px)_+_18px)_clamp(16px,3.4vw,48px)_14px] pointer-events-none',
  ],
  ['top', '[&_>_*]:pointer-events-auto'],
  /* a tall landing scrolls under the header: give it a glass backing */
  [
    'top',
    '[.is-tall_&]:pb-[12px] [.is-tall_&]:[background:color-mix(in_srgb,var(--color-background)_78%,transparent)] [.is-tall_&]:[backdrop-filter:blur(14px)] [.is-tall_&]:[border-bottom:1px_solid_var(--border)]',
  ],
  [
    'brand',
    'flex gap-[10px] items-center font-[family-name:var(--font-display)] [font-size:20px] font-[600] text-foreground no-underline',
  ],
  ['mark', 'w-[30px] h-[30px]'],
  /* idle brand motion: runs until the pointer or focus rests on the brand, never with reduced motion */
  [
    'mark',
    '[.brand_&]:animate-[landing-brand-mark_3.6s_ease-in-out_infinite] [.brand:hover_&]:[animation-play-state:paused] [.brand:focus-visible_&]:[animation-play-state:paused] motion-reduce:[.brand_&]:animate-none',
  ],
  [
    'brand-name',
    'bg-[image:linear-gradient(100deg,var(--color-foreground)_40%,var(--color-purple-400)_50%,var(--color-magenta-500)_55%,var(--color-foreground)_65%)] bg-[length:200%_100%] bg-clip-text text-transparent animate-[landing-brand-shimmer_4.8s_linear_infinite]',
  ],
  [
    'brand-name',
    '[.brand:hover_&]:[animation-play-state:paused] [.brand:focus-visible_&]:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:text-foreground',
  ],
  ['nav', 'flex gap-[26px] [font-size:13px] text-muted-foreground'],
  ['nav', '[&_a]:text-inherit [&_a]:no-underline'],
  ['nav', '[&_a:hover]:text-foreground'],
  ['top-actions', 'flex gap-[10px] items-center'],
  /* header: GitHub, language and the always-visible way into the player */
  [
    'top-icon',
    'grid place-items-center w-[36px] h-[36px] text-muted-foreground [background:var(--glass)] border border-solid border-border rounded-[999px] [backdrop-filter:blur(8px)] [transition:color_0.2s,border-color_0.2s] [&:hover]:text-foreground [&:hover]:border-muted-foreground',
  ],
  ['top-icon', '[&_.i]:w-[17px] [&_.i]:h-[17px]'],
  /* language: a pill like the theme switch that opens the app's own dropdown menu */
  [
    'top-lang',
    'inline-flex gap-[6px] items-center h-[36px] p-[0_10px_0_11px] font-[600] [font-size:12px] leading-[1] font-[family-name:var(--font-body)] tracking-[0.04em] text-foreground [background:var(--glass)] border border-solid border-border rounded-[999px] [backdrop-filter:blur(8px)] [html:not(.has-cursor)_&]:cursor-pointer [transition:border-color_0.2s,background-color_0.2s]',
  ],
  [
    'top-lang',
    '[&:hover]:border-muted-foreground [&[data-popup-open]]:border-primary focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
  ],
  ['top-lang-globe', 'w-[15px] h-[15px] text-muted-foreground'],
  [
    'top-lang-chev',
    'w-[13px] h-[13px] text-muted-foreground [transition:transform_0.2s] [[data-popup-open]_&]:[transform:rotate(180deg)]',
  ],
  [
    'top-cta',
    'h-[36px] p-[0_14px] rounded-[999px] [&_.i]:w-[15px] [&_.i]:h-[15px]',
  ],
  [
    'themes',
    'flex min-w-0 p-[3px] m-0 [background:var(--glass)] border border-solid border-border rounded-[999px] [backdrop-filter:blur(8px)]',
  ],
  [
    'themes',
    '[&_button]:p-[7px_11px] [&_button]:font-[500] [&_button]:[font-size:12px] [&_button]:leading-[1] [&_button]:font-[family-name:var(--font-body)] [&_button]:text-muted-foreground [html:not(.has-cursor)_&_button]:cursor-pointer [&_button]:[background:none] [&_button]:border-0 [&_button]:border-none [&_button]:rounded-[999px]',
  ],
  [
    'themes',
    '[&_button[aria-pressed=true]]:text-primary-foreground [&_button[aria-pressed=true]]:bg-primary [&_button[aria-pressed=true]]:bg-none',
  ],
  [
    'btn',
    'relative inline-flex gap-[10px] items-center justify-center h-[54px] p-[0_22px] font-[600] [font-size:15px] leading-[1] font-[family-name:var(--font-body)] whitespace-nowrap no-underline [html:not(.has-cursor)_&]:cursor-pointer border border-solid border-transparent rounded-[12px] [transition:background_0.2s,border-color_0.2s]',
  ],
  [
    'btn-primary',
    'text-primary-foreground bg-primary bg-none [box-shadow:0_12px_40px_-12px_var(--glow)]',
  ],
  [
    'btn-primary',
    '[&:hover]:bg-[color:color-mix(in_srgb,var(--color-primary)_88%,var(--color-black))] [&:hover]:bg-none',
  ],
  ['btn-ghost', 'text-foreground [background:var(--glass)] border-border'],
  ['btn-sm', 'h-[38px] p-[0_14px] [font-size:13px] rounded-[10px]'],
  ['btn-xs', 'h-[32px] p-[0_12px] [font-size:12px] rounded-[8px]'],
  ['btn', FOCUS_RING],
  ['themes', BUTTON_FOCUS_RING],
  ['dots', BUTTON_FOCUS_RING],
  [
    'live',
    '[&_i]:w-[7px] [&_i]:h-[7px] [&_i]:bg-magenta-500 [&_i]:bg-none [&_i]:rounded-[50%] [&_i]:[box-shadow:0_0_0_0_color-mix(in_srgb,var(--color-magenta-500)_60%,transparent)] [&_i]:animate-[landing-ping_1.6s_infinite]',
  ],
  [
    'prog',
    '[&_i]:block [&_i]:h-full [&_i]:bg-[image:linear-gradient(90deg,var(--primary),var(--magenta))] [&_i]:[transform:scaleX(0.42)] [&_i]:origin-[left]',
  ],
  [
    'bands',
    '[&_i]:flex-[1] [&_i]:h-full [&_i]:bg-[image:linear-gradient(to_top,transparent,var(--accent))] [&_i]:rounded-[2px] [&_i]:opacity-[0.5] [&_i]:origin-[bottom]',
  ],
  ['legend', '[&_i]:w-[18px] [&_i]:h-[2px] [&_i]:rounded-[1px]'],
  [
    'cur-pill',
    '[&_i]:w-0 [&_i]:h-0 [&_i]:[border-top:6px_solid_transparent] [&_i]:[border-bottom:6px_solid_transparent] [&_i]:[border-left:9px_solid_var(--color-background)]',
  ],
  [
    'cur-scrub',
    '[&_i]:w-[2px] [&_i]:h-[28px] [&_i]:bg-accent [&_i]:bg-none [&_i]:rounded-[1px]',
  ],
  [
    'dots',
    'fixed top-1/2 right-[clamp(10px,1.6vw,26px)] z-[40] flex flex-col gap-[12px] [transform:translateY(-50%)]',
  ],
  [
    'dots',
    '[&_button]:relative [&_button]:w-[9px] [&_button]:h-[9px] [&_button]:p-0 [html:not(.has-cursor)_&_button]:cursor-pointer [&_button]:bg-transparent [&_button]:bg-none [&_button]:border [&_button]:border-solid [&_button]:border-muted-foreground [&_button]:rounded-[50%] [&_button]:[transition:background_0.3s,border-color_0.3s,transform_0.3s]',
  ],
  [
    'dots',
    '[&_button[aria-current=true]]:bg-accent [&_button[aria-current=true]]:bg-none [&_button[aria-current=true]]:border-accent [&_button[aria-current=true]]:[transform:scale(1.4)]',
  ],
  ['line', '[&_>_span]:inline-block'],
  [
    'rail-nav',
    '[&_span]:grid [&_span]:gap-[6px] [&_span]:[justify-items:center]',
  ],
  ['legend', '[&_span]:flex [&_span]:gap-[8px] [&_span]:items-center'],
  [
    'dots',
    '[&_button_span]:absolute [&_button_span]:top-1/2 [&_button_span]:right-[20px] [&_button_span]:font-[500] [&_button_span]:[font-size:10px] [&_button_span]:leading-[1] [&_button_span]:font-[family-name:var(--font-data)] [&_button_span]:text-muted-foreground [&_button_span]:tracking-[0.08em] [&_button_span]:whitespace-nowrap [&_button_span]:pointer-events-none [&_button_span]:opacity-[0] [&_button_span]:[transform:translateY(-50%)] [&_button_span]:[transition:opacity_0.2s]',
  ],
  [
    'dots',
    /* labels show on hover only: the real blocks reach the right edge, and the counter names the scene */
    '[&_button:hover_span]:opacity-[1] [&_button:focus-visible_span]:opacity-[1]',
  ],
  /* the label sits over real blocks reaching the right edge: give it a glass backing */
  [
    'dots',
    '[&_button_span]:p-[5px_8px] [&_button_span]:rounded-[6px] [&_button_span]:[background:var(--glass)] [&_button_span]:[backdrop-filter:blur(8px)] [&_button_span]:border [&_button_span]:border-solid [&_button_span]:border-border',
  ],
  [
    'counter',
    'fixed bottom-[calc(env(safe-area-inset-bottom,0px)_+_18px)] left-[clamp(16px,3.4vw,48px)] z-[40] flex gap-[12px] items-center font-[500] [font-size:11px] leading-[1] font-[family-name:var(--font-data)] text-muted-foreground tracking-[0.1em]',
  ],
  ['counter', '[&_b]:font-[500] [&_b]:text-foreground'],
  /* the last scene ends in the footer: the counter would sit on it */
  [
    'counter',
    '[transition:opacity_0.3s] [.landing[data-scene=cta]_&]:opacity-0 [.landing[data-scene=cta]_&]:pointer-events-none',
  ],
  [
    'rail',
    '[.counter_&]:w-[110px] [.counter_&]:h-[2px] [.counter_&]:overflow-hidden [.counter_&]:bg-border [.counter_&]:bg-none [.counter_&]:rounded-[2px]',
  ],
  [
    'rail',
    '[.counter_&_i]:block [.counter_&_i]:h-full [.counter_&_i]:bg-[image:linear-gradient(90deg,var(--primary),var(--magenta))] [.counter_&_i]:[transform:scaleX(0.1)] [.counter_&_i]:origin-[left]',
  ],
]
