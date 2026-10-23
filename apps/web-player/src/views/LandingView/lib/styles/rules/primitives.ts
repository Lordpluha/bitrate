import type { LandingRule } from './types'

/** Shared primitives: scenes and the board, type, surfaces (windows, cards, rows). */
export const PRIMITIVES: readonly LandingRule[] = [
  /* scenes + board */
  ['scene', 'fixed inset-0 z-[5] invisible overflow-hidden'],
  ['scene', '[&.is-active]:visible'],
  [
    'scene',
    '[.is-static_&]:relative [.is-static_&]:visible [.is-static_&]:h-[100vh] [.is-static_&]:min-h-[640px]',
  ],
  [
    'board',
    'absolute top-1/2 left-1/2 w-[1440px] h-[900px] [transform:translate(-50%,-50%)_scale(var(--s,1))] origin-[50%_50%]',
  ],
  [
    'abs',
    'absolute top-[calc(var(--y)_*_1px)] left-[calc(var(--x)_*_1px)] w-[calc(var(--w)_*_1px)]',
  ],
  ['abs', '[&[style*=--h]]:h-[calc(var(--h)_*_1px)]'],
  ['persp', '[perspective:1600px]'],
  ['pos', 'absolute'],
  /* type */
  [
    'eyebrow',
    'flex gap-[10px] items-center font-[500] [font-size:11px] leading-[1] font-[family-name:var(--font-data)] text-accent uppercase tracking-[0.18em]',
  ],
  [
    'eyebrow',
    "[&::before]:w-[24px] [&::before]:h-[1px] [&::before]:[content:''] [&::before]:[background:currentColor]",
  ],
  [
    'label',
    'font-[500] [font-size:11px] leading-[1] font-[family-name:var(--font-data)] text-text-subdued uppercase tracking-[0.16em]',
  ],
  ['disc', '[font-size:12px] text-text-subdued'],
  [
    'sig',
    'font-[600] [font-size:9px] leading-[1] font-[family-name:var(--font-data)] text-text-subdued tracking-[0.3em]',
  ],
  [
    'h',
    'm-0 font-[family-name:var(--font-display)] font-[700] leading-[0.98] tracking-[-0.03em]',
  ],
  ['h72', '[font-size:58px]'],
  ['h80', '[font-size:64px] leading-[0.98]'],
  ['h56', '[font-size:46px]'],
  ['h48', '[font-size:40px] leading-[1.06]'],
  ['h54', '[font-size:44px]'],
  ['line', 'block p-[0_0.04em_0.08em_0] mb-[-0.06em] overflow-hidden'],
  [
    'hl',
    'text-accent [-webkit-text-fill-color:transparent] bg-[image:linear-gradient(100deg,var(--accent),var(--magenta)_60%,var(--blue))] [-webkit-background-clip:text] [background-clip:text]',
  ],
  [
    'hl',
    '[&.split]:[-webkit-text-fill-color:currentColor] [&.split]:[background:none]',
  ],
  ['char', 'inline-block [will-change:transform]'],
  ['lede', 'm-0 [font-size:20px] leading-[1.45] text-muted-foreground'],
  ['lede', '[&.s]:[font-size:18px]'],
  ['ctas', 'flex gap-[12px]'],
  /* surfaces */
  [
    'win',
    'overflow-hidden [background:var(--glass)] border border-solid border-border rounded-[18px] [box-shadow:0_40px_100px_-40px_var(--shadow)]',
  ],
  ['card', 'bg-card bg-none border border-solid border-border rounded-[14px]'],
  ['soft', 'bg-secondary bg-none rounded-[12px]'],
  [
    'wbar',
    'flex gap-[14px] items-center h-[52px] p-[0_18px] font-[500] [font-size:10px] leading-[1] font-[family-name:var(--font-data)] text-text-subdued tracking-[0.16em] [border-bottom:1px_solid_var(--border)]',
  ],
  ['dots3', '[.wbar_&]:flex [.wbar_&]:gap-[6px]'],
  [
    'dots3',
    '[.wbar_&_i]:w-[9px] [.wbar_&_i]:h-[9px] [.wbar_&_i]:bg-border [.wbar_&_i]:bg-none [.wbar_&_i]:rounded-[50%]',
  ],
  ['live', 'inline-flex gap-[8px] items-center text-foreground'],
  ['live', '[&.ok_i]:bg-success [&.ok_i]:bg-none'],
  ['grow', 'flex-[1]'],
  ['row', 'flex gap-[12px] items-center'],
  ['col', 'flex flex-col gap-[12px]'],
  [
    't-title',
    'm-0 font-[600] [font-size:14px] leading-[1.25] font-[family-name:var(--font-body)]',
  ],
  ['t-meta', 'm-0 [font-size:12px] text-muted-foreground'],
  [
    'mono',
    'font-[500] [font-size:11px] leading-[1] font-[family-name:var(--font-data)] text-text-subdued tracking-[0.06em]',
  ],
  ['cv', 'flex-[none] w-[48px] h-[48px] rounded-[8px]'],
  ['cv', '[&.s]:w-[40px] [&.s]:h-[40px] [&.s]:rounded-[7px]'],
  [
    'cv1',
    'bg-[image:linear-gradient(135deg,color-mix(in_srgb,var(--color-primary)_88%,var(--color-black)),var(--color-magenta-500))]',
  ],
  [
    'cv2',
    'bg-[image:linear-gradient(135deg,color-mix(in_srgb,var(--color-info)_85%,var(--color-black)),var(--color-primary))]',
  ],
  [
    'cv3',
    'bg-[image:linear-gradient(135deg,color-mix(in_srgb,var(--color-info)_70%,var(--color-white)),color-mix(in_srgb,var(--color-info)_45%,var(--color-primary)))]',
  ],
  [
    'cv4',
    'bg-[image:linear-gradient(135deg,color-mix(in_srgb,var(--color-magenta-500)_80%,var(--color-black)),color-mix(in_srgb,var(--color-primary)_70%,var(--color-black)))]',
  ],
  [
    'cv5',
    'bg-[image:linear-gradient(135deg,var(--color-warning),color-mix(in_srgb,var(--color-magenta-500)_80%,var(--color-black)))]',
  ],
  [
    'art',
    'relative overflow-hidden [background:radial-gradient(circle_at_50%_118%,var(--color-magenta-500),transparent_55%),radial-gradient(circle_at_30%_0%,var(--color-primary),transparent_62%),radial-gradient(circle_at_80%_30%,var(--color-info),transparent_45%),color-mix(in_srgb,var(--color-primary)_10%,var(--color-black))] rounded-[14px]',
  ],
  [
    'art',
    "[&::after]:absolute [&::after]:top-[54%] [&::after]:left-1/2 [&::after]:w-[46%] [&::after]:aspect-[1] [&::after]:[content:''] [&::after]:[background:radial-gradient(circle_at_35%_30%,color-mix(in_srgb,var(--color-white)_53%,transparent),transparent_30%),radial-gradient(circle,var(--color-accent),var(--color-primary)_55%,color-mix(in_srgb,var(--color-primary)_35%,var(--color-black))_75%,transparent_76%)] [&::after]:rounded-[50%] [&::after]:[box-shadow:0_0_80px_color-mix(in_srgb,var(--color-accent)_53%,transparent)] [&::after]:[transform:translate(-50%,-50%)]",
  ],
  ['prog', 'h-[4px] overflow-hidden bg-border bg-none rounded-[2px]'],
  [
    'times',
    'flex justify-between mt-[8px] font-[500] [font-size:11px] leading-[1] font-[family-name:var(--font-data)] text-text-subdued',
  ],
  [
    'transport',
    'flex gap-[26px] items-center justify-center text-muted-foreground',
  ],
  [
    'playbtn',
    'grid place-items-center w-[52px] h-[52px] text-white bg-primary bg-none rounded-[50%] [box-shadow:0_10px_30px_-8px_var(--glow)]',
  ],
  [
    'pill',
    'p-[7px_10px] font-[600] [font-size:11px] leading-[1] font-[family-name:var(--font-body)] text-muted-foreground whitespace-nowrap border border-solid border-border rounded-[999px]',
  ],
  [
    'pill',
    '[&.info]:text-info-text [&.info]:bg-[color:color-mix(in_srgb,var(--color-info)_14%,transparent)] [&.info]:bg-none [&.info]:border-[color:color-mix(in_srgb,var(--color-info)_50%,transparent)]',
  ],
  [
    'pill',
    '[&.ok]:text-success-text [&.ok]:bg-[color:color-mix(in_srgb,var(--color-success)_12%,transparent)] [&.ok]:bg-none [&.ok]:border-[color:color-mix(in_srgb,var(--color-success)_45%,transparent)]',
  ],
  [
    'pill',
    '[&.acc]:text-primary-foreground [&.acc]:bg-primary [&.acc]:bg-none [&.acc]:border-primary',
  ],
  [
    'pill',
    '[.light_&.info]:text-info-text [.light_&.info]:bg-info-surface [.light_&.info]:bg-none [.light_&.info]:border-info-border',
  ],
  [
    'pill',
    '[.light_&.ok]:text-success-text [.light_&.ok]:bg-success-surface [.light_&.ok]:bg-none [.light_&.ok]:border-success-border',
  ],
  [
    'chip',
    'p-[7px_11px] font-[500] [font-size:12px] leading-[1] font-[family-name:var(--font-body)] text-muted-foreground whitespace-nowrap border border-solid border-border rounded-[999px]',
  ],
  [
    'chip',
    '[&.on]:text-white [&.on]:bg-primary [&.on]:bg-none [&.on]:border-primary',
  ],
  [
    'av',
    'grid flex-[none] place-items-center w-[28px] h-[28px] font-[600] [font-size:10px] leading-[1] font-[family-name:var(--font-body)] text-white border-[length:2px] border-solid border-card rounded-[50%]',
  ],
  ['avs', 'flex'],
  [
    'av',
    '[.node_&]:w-[40px] [.node_&]:h-[40px] [.node_&]:[font-size:12px] [.node_&]:border-0 [.node_&]:border-none',
  ],
  ['av', '[.listeners_&]:w-[32px] [.listeners_&]:h-[32px]'],
  [
    'av',
    '[.hc_&]:w-[48px] [.hc_&]:h-[48px] [.hc_&]:[font-size:15px] [.hc_&]:border-0 [.hc_&]:border-none',
  ],
  ['av', '[.avs_.av_+_&]:ml-[-8px]'],
  [
    'medal',
    'grid flex-[none] place-items-center w-[56px] h-[56px] text-accent border border-solid border-accent rounded-[50%]',
  ],
  [
    'num',
    'font-[600] [font-size:12px] leading-[1] font-[family-name:var(--font-data)] text-accent tracking-[0.1em]',
  ],
  ['spec', '[&:is(canvas)]:block [&:is(canvas)]:w-full [&:is(canvas)]:h-full'],
  ['wave', '[&:is(canvas)]:block [&:is(canvas)]:w-full [&:is(canvas)]:h-full'],
]
