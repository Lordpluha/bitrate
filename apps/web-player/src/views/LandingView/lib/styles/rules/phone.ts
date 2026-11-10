import type { LandingRule } from './types'

/**
 * Phones (max 820px): every scene is one screen — its copy on top, its main block filling the
 * rest and scrolling inside — and a bottom bar holds the way into the player where the thumb
 * rests. After the general mobile rules, so these win.
 */
export const PHONE: readonly LandingRule[] = [
  /* room for the header above and the bottom bar below */
  [
    'scene',
    'max-[820px]:p-[calc(env(safe-area-inset-top,0px)_+_68px)_16px_calc(env(safe-area-inset-bottom,0px)_+_92px)]!',
  ],
  ['board', 'max-[820px]:[&:has(.scene-block,.scene-fill)]:justify-start!'],
  /* the scene's main block takes the height left and scrolls on its own */
  [
    'scene-block',
    'max-[820px]:flex-[1_1_0]! max-[820px]:min-h-[180px] max-[820px]:h-auto!',
  ],
  [
    'scene-block',
    'max-[820px]:[&>section]:h-full! max-[820px]:[&>section]:max-h-none! max-[820px]:[&>section]:overflow-y-auto! max-[820px]:[&>section]:[overscroll-behavior:contain] max-[820px]:[&>section]:touch-pan-y',
  ],
  [
    'scene-fill',
    'max-[820px]:flex-[1_1_0]! max-[820px]:min-h-[160px] max-[820px]:h-auto!',
  ],
  /* the bottom bar replaces the header button and the scene counter */
  ['top-cta', 'max-[820px]:hidden!'],
  ['counter', 'max-[820px]:hidden!'],
  ['try-link', 'max-[820px]:hidden!'],
  [
    'm-bar',
    'hidden max-[820px]:flex fixed right-[12px] bottom-[calc(env(safe-area-inset-bottom,0px)_+_12px)] left-[12px] z-[45] gap-[8px] p-[8px] [background:var(--glass)] [backdrop-filter:blur(14px)] border border-solid border-border rounded-[18px] [box-shadow:0_18px_40px_-18px_var(--shadow)] [transition:transform_0.35s_cubic-bezier(0.2,0.8,0.2,1),opacity_0.25s]',
  ],
  /* the hero and the final scene carry their own buttons: the bar steps out of the way there */
  [
    'm-bar',
    '[.landing:not([data-scene])_&]:translate-y-[140%] [.landing[data-scene=hero]_&]:translate-y-[140%] [.landing[data-scene=cta]_&]:translate-y-[140%] [.landing:not([data-scene])_&]:opacity-0 [.landing[data-scene=hero]_&]:opacity-0 [.landing[data-scene=cta]_&]:opacity-0 [.landing.is-static_&]:hidden',
  ],
  ['m-bar-cta', 'flex-[1_1_auto] h-[48px]! rounded-[12px]! [font-size:15px]'],
  [
    'm-bar-next',
    'grid place-items-center w-[48px] h-[48px] p-0 shrink-0 text-foreground bg-card bg-none border border-solid border-border rounded-[12px] [&_.i]:[transform:rotate(90deg)] [html:not(.has-cursor)_&]:cursor-pointer',
  ],
  /* the assistant sits above the bar, smaller */
  [
    'ai-fab',
    'max-[820px]:bottom-[calc(env(safe-area-inset-bottom,0px)_+_84px)]! max-[820px]:w-[46px]! max-[820px]:h-[46px]!',
  ],
  /* the theme swatches get a thumb-sized target */
  [
    'themes',
    'max-[560px]:[&_button]:w-[36px]! max-[560px]:[&_button]:h-[36px]! max-[560px]:[&_button::before]:inset-[10px]!',
  ],
  /* the assistant would cover a scene's block: on phones it shows only where the bar does not */
  [
    'ai-fab',
    'max-[820px]:[.landing[data-scene]:not([data-scene=hero]):not([data-scene=cta])_&]:hidden!',
  ],
  /* generic phone helpers: leave something out, or set a column of buttons as a row */
  ['m-hide', 'max-[820px]:hidden!'],
  [
    'm-row',
    'max-[820px]:flex-row! max-[820px]:[&_.btn]:flex-[1_1_0] max-[820px]:[&_.btn]:h-[44px]! max-[820px]:[&_.btn]:p-[0_12px]! max-[820px]:[&_.btn]:[font-size:14px]',
  ],
  /* the status pill's goo blob is laid out for the desktop footer: on a phone it floats loose */
  ['goo', 'max-[820px]:hidden!'],
  /* the final scene on a short phone: the heading, the button and the footer come first */
  ['h80', 'max-[820px]:[font-size:32px]!'],
  ['#cradleSlot', 'max-[820px]:[@media(max-height:700px)]:hidden!'],
]
