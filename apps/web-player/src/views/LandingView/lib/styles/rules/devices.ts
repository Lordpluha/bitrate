import type { LandingRule } from './types'

/** Hero device previews: the real player on a laptop and a phone, one screenshot per theme. */
export const DEVICES: readonly LandingRule[] = [
  ['devices', 'relative w-full h-full [transform-style:preserve-3d]'],
  ['laptop', 'absolute top-[20px] left-[90px] w-[660px]'],
  [
    'laptop-screen',
    'relative w-full aspect-[1440/900] overflow-hidden bg-neutral-900 bg-none border-[10px] border-solid border-neutral-900 rounded-[18px] [box-shadow:0_0_0_1px_color-mix(in_srgb,var(--color-white)_10%,transparent),0_50px_90px_-40px_var(--shadow)]',
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
    'absolute top-[190px] left-0 z-[2] w-[190px] aspect-[390/844] box-border overflow-hidden bg-neutral-900 bg-none border-[8px] border-solid border-neutral-900 rounded-[34px] [box-shadow:0_0_0_1px_color-mix(in_srgb,var(--color-white)_14%,transparent),0_40px_70px_-30px_var(--shadow)]',
  ],
  ['handset-screen', 'absolute inset-0 overflow-hidden rounded-[26px]'],
  [
    'handset-island',
    'absolute top-[7px] left-1/2 z-[1] w-[56px] h-[15px] ml-[-28px] bg-black bg-none rounded-[999px]',
  ],
  ['pv', 'absolute inset-0 w-full h-full object-cover object-top'],
  ['pv-dark', 'block [html.light_&]:hidden [html.dim_&]:hidden'],
  ['pv-light', 'hidden [html.light_&]:block'],
  ['pv-dim', 'hidden [html.dim_&]:block'],
  [
    'devices-note',
    'absolute top-[470px] right-[70px] font-[500] [font-size:11px] leading-[1] font-[family-name:var(--font-data)] text-muted-foreground tracking-[0.08em] uppercase',
  ],
  /* phones: only the handset, centred under the call to action */
  [
    'hero-devices',
    'max-[820px]:flex! max-[820px]:justify-center max-[820px]:[perspective:none]',
  ],
  ['devices', 'max-[820px]:flex max-[820px]:justify-center max-[820px]:h-auto'],
  [
    'handset',
    'max-[820px]:relative max-[820px]:top-auto max-[820px]:left-auto max-[820px]:w-auto max-[820px]:h-[min(30vh,300px)] max-[820px]:border-[6px] max-[820px]:rounded-[24px]',
  ],
  ['handset-screen', 'max-[820px]:rounded-[18px]'],
  [
    'handset-island',
    'max-[820px]:w-[40px] max-[820px]:h-[11px] max-[820px]:ml-[-20px] max-[820px]:top-[5px]',
  ],
]
