import type { LandingRule } from './types'

/** Hero device previews: the real player on a laptop and a phone, one screenshot per theme. */
export const DEVICES: readonly LandingRule[] = [
  ['devices', 'relative w-full h-full [transform-style:preserve-3d]'],
  ['laptop', 'absolute top-[30px] left-[80px] w-[600px]'],
  [
    'laptop-screen',
    'relative w-full box-border p-[10px] bg-neutral-900 bg-none rounded-[18px] [box-shadow:0_0_0_1px_color-mix(in_srgb,var(--color-white)_10%,transparent),0_50px_90px_-40px_var(--shadow)]',
  ],
  /* the display itself has the capture's exact proportions, so every hotspot lands on its control */
  [
    'pv-viewport',
    'relative w-full aspect-[1440/900] overflow-hidden rounded-[6px]',
  ],
  [
    'laptop-base',
    'relative w-[108%] h-[14px] ml-[-4%] bg-[image:linear-gradient(to_bottom,var(--color-neutral-500),var(--color-neutral-800))] rounded-[0_0_16px_16px] [box-shadow:0_24px_40px_-20px_var(--shadow)]',
  ],
  [
    'laptop-base',
    "[&::before]:absolute [&::before]:top-0 [&::before]:left-1/2 [&::before]:w-[120px] [&::before]:h-[5px] [&::before]:ml-[-60px] [&::before]:[content:''] [&::before]:bg-neutral-900 [&::before]:rounded-[0_0_8px_8px]",
  ],
  [
    'handset',
    'absolute top-[190px] left-0 z-[2] w-[190px] box-border p-[8px] bg-neutral-900 bg-none rounded-[34px] [box-shadow:0_0_0_1px_color-mix(in_srgb,var(--color-white)_14%,transparent),0_40px_70px_-30px_var(--shadow)]',
  ],
  [
    'handset-screen',
    'relative w-full aspect-[390/844] overflow-hidden rounded-[26px]',
  ],
  [
    'handset-island',
    'absolute top-[7px] left-1/2 z-[1] w-[56px] h-[15px] ml-[-28px] bg-black bg-none rounded-[999px]',
  ],
  ['pv', 'absolute inset-0 w-full h-full'],
  /* a new screen fades in over the old one, like the app's own route change */
  [
    'pv-frame',
    'absolute inset-0 animate-[landing-pv-in_0.28s_ease-out] motion-reduce:animate-none',
  ],
  /* the real controls on the capture: invisible until the device is hovered, then outlined */
  [
    'pv-spot',
    'absolute z-[1] p-0 m-0 bg-transparent bg-none border-0 rounded-[8px] [html:not(.has-cursor)_&]:cursor-pointer [transition:box-shadow_0.2s,background-color_0.2s]',
  ],
  [
    'pv-spot',
    '[&:hover]:[box-shadow:0_0_0_1.5px_var(--color-primary)] [&:hover]:bg-[color:color-mix(in_srgb,var(--color-primary)_18%,transparent)] focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
  ],
  ['pv-dark', 'block [html.light_&]:hidden [html.dim_&]:hidden'],
  ['pv-light', 'hidden [html.light_&]:block'],
  ['pv-dim', 'hidden [html.dim_&]:block'],
  [
    'devices-note',
    'absolute top-[450px] right-[130px] font-[500] [font-size:11px] leading-[1] font-[family-name:var(--font-data)] text-muted-foreground tracking-[0.08em] uppercase',
  ],
  /* phones: only the handset, centred under the call to action */
  [
    'hero-devices',
    'max-[820px]:flex! max-[820px]:justify-center max-[820px]:[perspective:none]',
  ],
  ['devices', 'max-[820px]:flex max-[820px]:justify-center max-[820px]:h-auto'],
  [
    'handset',
    'max-[820px]:relative max-[820px]:top-auto max-[820px]:left-auto max-[820px]:w-[min(136px,34vw)] max-[820px]:p-[6px] max-[820px]:rounded-[24px]',
  ],
  ['handset-screen', 'max-[820px]:rounded-[18px]'],
  [
    'handset-island',
    'max-[820px]:w-[40px] max-[820px]:h-[11px] max-[820px]:ml-[-20px] max-[820px]:top-[5px]',
  ],
]
