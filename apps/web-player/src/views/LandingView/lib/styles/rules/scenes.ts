import type { LandingRule } from './types'

/** Per-scene specifics. */
export const SCENES: readonly LandingRule[] = [
  /* scene specifics */
  [
    'tech',
    'flex gap-[28px] items-center h-[70px] p-[0_22px] [border-top:1px_solid_var(--border)]',
  ],
  ['tech', '[&_div]:grid [&_div]:gap-[6px]'],
  [
    'tech',
    '[&_b]:font-[500] [&_b]:[font-size:12px] [&_b]:leading-[1] [&_b]:font-[family-name:var(--font-data)] [&_b]:text-foreground [&_b]:tracking-[0.08em]',
  ],
  ['qrow', 'flex gap-[12px] items-center p-[12px_10px] rounded-[10px]'],
  ['qrow', '[&.now]:bg-secondary [&.now]:bg-none'],
  ['steps', 'relative grid gap-[6px]'],
  [
    'track',
    '[.steps_&]:absolute [.steps_&]:top-[13px] [.steps_&]:right-[14px] [.steps_&]:left-[14px] [.steps_&]:h-[2px] [.steps_&]:bg-border [.steps_&]:bg-none',
  ],
  [
    'fill',
    '[.steps_&]:absolute [.steps_&]:top-[13px] [.steps_&]:right-[14px] [.steps_&]:left-[14px] [.steps_&]:h-[2px] [.steps_&]:bg-[image:linear-gradient(90deg,var(--primary),var(--magenta))] [.steps_&]:[transform:scaleX(0.75)] [.steps_&]:origin-[left]',
  ],
  [
    'step',
    'relative grid gap-[8px] [justify-items:center] font-[500] [font-size:12px] leading-[1.2] font-[family-name:var(--font-body)] text-muted-foreground text-center',
  ],
  [
    'step',
    '[&_b]:grid [&_b]:place-items-center [&_b]:w-[28px] [&_b]:h-[28px] [&_b]:font-[600] [&_b]:[font-size:11px] [&_b]:leading-[1] [&_b]:font-[family-name:var(--font-data)] [&_b]:text-muted-foreground [&_b]:bg-card [&_b]:bg-none [&_b]:border [&_b]:border-solid [&_b]:border-border [&_b]:rounded-[50%]',
  ],
  [
    'stats',
    '[&_b]:block [&_b]:font-[700] [&_b]:[font-size:34px] [&_b]:leading-[1] [&_b]:font-[family-name:var(--font-display)] [&_b]:text-foreground',
  ],
  [
    'ai-welcome',
    '[&_b]:font-[600] [&_b]:[font-size:15px] [&_b]:leading-[1.2] [&_b]:font-[family-name:var(--font-display)]',
  ],
  [
    'intro',
    '[&_b]:absolute [&_b]:left-1/2 [&_b]:whitespace-nowrap [&_b]:[transform:translateX(-50%)]',
  ],
  [
    'mono',
    '[.intro_&]:absolute [.intro_&]:left-1/2 [.intro_&]:whitespace-nowrap [.intro_&]:[transform:translateX(-50%)]',
  ],
  ['intro', '[&_b]:top-[calc(50%_+_min(100vw,100vh)_*_0.15_+_26px)]'],
  [
    'intro',
    '[&_b]:font-[700] [&_b]:[font-size:24px] [&_b]:leading-[1] [&_b]:font-[family-name:var(--font-display)] [&_b]:tracking-[-0.02em]',
  ],
  [
    'hrow',
    '[&_b]:block [&_b]:font-[600] [&_b]:[font-size:13px] [&_b]:leading-[1.2] [&_b]:font-[family-name:var(--font-body)]',
  ],
  [
    'cur-scrub',
    '[&_b]:p-[4px_6px] [&_b]:font-[600] [&_b]:[font-size:11px] [&_b]:leading-[1] [&_b]:font-[family-name:var(--font-data,monospace)] [&_b]:text-background [&_b]:bg-foreground [&_b]:bg-none [&_b]:rounded-[6px]',
  ],
  [
    'step',
    '[&.done_b]:text-white [&.done_b]:bg-primary [&.done_b]:bg-none [&.done_b]:border-primary [&.now_b]:text-white [&.now_b]:bg-primary [&.now_b]:bg-none [&.now_b]:border-primary',
  ],
  ['step', '[&.now]:text-foreground'],
  [
    'now',
    '[&.task]:bg-[color:color-mix(in_srgb,var(--color-primary)_8%,transparent)] [&.task]:bg-none [&.task]:border-accent',
  ],
  ['sel', '[&.ver]:border-accent'],
  [
    'cand',
    'flex gap-[14px] items-center p-[12px_14px] bg-secondary bg-none rounded-[12px]',
  ],
  [
    'r',
    '[.cand_&]:w-[26px] [.cand_&]:font-[600] [.cand_&]:[font-size:13px] [.cand_&]:leading-[1] [.cand_&]:font-[family-name:var(--font-data)] [.cand_&]:text-accent',
  ],
  ['meter', 'grid gap-[6px]'],
  ['prog', '[.meter_&]:h-[6px]'],
  ['bands', 'flex gap-[8px] items-end h-full'],
  [
    'horizon',
    'overflow-hidden [background:radial-gradient(ellipse_at_0%_100%,color-mix(in_srgb,var(--color-primary)_55%,transparent),transparent_65%),radial-gradient(ellipse_at_40%_100%,color-mix(in_srgb,var(--color-magenta-500)_35%,transparent),transparent_60%)] rounded-[0_360px_0_0]',
  ],
  [
    'drop',
    'grid place-items-center p-[10px] [font-size:12px] text-text-subdued text-center border-[length:1.5px] border-dashed border-border rounded-[14px]',
  ],
  [
    'toggle',
    'relative flex-[none] w-[34px] h-[20px] bg-border bg-none rounded-[999px] [transition:background_0.3s]',
  ],
  [
    'toggle',
    "[&::after]:absolute [&::after]:top-[3px] [&::after]:left-[3px] [&::after]:w-[14px] [&::after]:h-[14px] [&::after]:[content:''] [&::after]:bg-white [&::after]:bg-none [&::after]:rounded-[50%] [&::after]:[transition:transform_0.3s]",
  ],
  ['toggle', '[&.on]:bg-primary [&.on]:bg-none'],
  ['toggle', '[&.on::after]:[transform:translateX(14px)]'],
  [
    'lrow',
    'grid grid-cols-[26px_40px_1fr_140px_52px] gap-[12px] items-center p-[10px_12px] [font-size:13px] rounded-[10px]',
  ],
  [
    'lrow',
    '[&.hd]:pt-0 [&.hd]:font-[500] [&.hd]:[font-size:10px] [&.hd]:leading-[1] [&.hd]:font-[family-name:var(--font-data)] [&.hd]:text-text-subdued [&.hd]:tracking-[0.12em]',
  ],
  ['lrow', '[&.lres:hover]:bg-secondary [&.lres:hover]:bg-none'],
  [
    'vrow',
    'relative grid grid-cols-[16px_1fr_auto] gap-[12px] [align-items:start] p-[12px_0]',
  ],
  [
    'dot',
    '[.vrow_&]:relative [.vrow_&]:z-[1] [.vrow_&]:w-[12px] [.vrow_&]:h-[12px] [.vrow_&]:mt-[3px] [.vrow_&]:bg-card [.vrow_&]:bg-none [.vrow_&]:border-[length:2px] [.vrow_&]:border-solid [.vrow_&]:border-border [.vrow_&]:rounded-[50%]',
  ],
  [
    'dot',
    '[.vrow.sel_&]:bg-accent [.vrow.sel_&]:bg-none [.vrow.sel_&]:border-accent',
  ],
  [
    'vline',
    'absolute top-[18px] bottom-[18px] left-[5px] w-[2px] bg-border bg-none',
  ],
  [
    'rail-nav',
    'grid gap-[30px] [justify-items:center] p-[36px_0] [font-size:11px] text-muted-foreground',
  ],
  [
    'on',
    '[.rail-nav_&]:p-[12px_10px] [.rail-nav_&]:text-foreground [.rail-nav_&]:bg-secondary [.rail-nav_&]:bg-none [.rail-nav_&]:rounded-[12px]',
  ],
  [
    'node',
    'absolute flex gap-[10px] items-center p-[10px_14px_10px_10px] whitespace-nowrap [background:var(--glass)] border border-solid border-border rounded-[14px]',
  ],
  [
    'node',
    '[&_small]:block [&_small]:[font-size:11px] [&_small]:text-muted-foreground',
  ],
  [
    'node',
    '[&.focus]:flex-col [&.focus]:justify-center [&.focus]:p-[16px] [&.focus]:border-accent [&.focus]:[box-shadow:0_0_0_6px_color-mix(in_srgb,var(--color-accent)_12%,transparent)]',
  ],
  [
    'av',
    '[.node.focus_&]:w-[76px] [.node.focus_&]:h-[76px] [.node.focus_&]:[font-size:20px]',
  ],
  [
    'tag',
    'absolute p-[6px_9px] font-[500] [font-size:10px] leading-[1] font-[family-name:var(--font-data)] text-muted-foreground tracking-[0.06em] whitespace-nowrap bg-background bg-none border border-solid border-border rounded-[999px]',
  ],
  ['graph', '[&_svg_path]:[fill:none] [&_svg_path]:[stroke-width:1.6]'],
  ['p-inf', '[stroke:var(--accent)]'],
  ['p-sim', '[stroke:var(--magenta)] [stroke-dasharray:5_6]'],
  ['p-scn', '[stroke:var(--blue)] [stroke-dasharray:1_6]'],
  ['legend', 'flex gap-[22px] [font-size:11px] text-muted-foreground'],
  ['route', 'flex gap-[18px] items-center p-[0_18px]'],
  [
    'n',
    '[.route_&]:grid [.route_&]:place-items-center [.route_&]:w-[26px] [.route_&]:h-[26px] [.route_&]:font-[600] [.route_&]:[font-size:11px] [.route_&]:leading-[1] [.route_&]:font-[family-name:var(--font-data)] [.route_&]:text-accent [.route_&]:border [.route_&]:border-solid [.route_&]:border-accent [.route_&]:rounded-[50%]',
  ],
  [
    'phone',
    'p-[16px] bg-card bg-none border border-solid border-border rounded-[38px] [box-shadow:0_50px_100px_-40px_var(--shadow)]',
  ],
  [
    'cmark',
    'absolute top-[-6px] w-[12px] h-[12px] bg-magenta-500 bg-none border-[length:2px] border-solid border-card rounded-[50%] [transform:translateX(-50%)]',
  ],
  [
    'cmt',
    'grid grid-cols-[34px_1fr] gap-[12px] p-[12px_0] [border-bottom:1px_solid_var(--border)]',
  ],
  [
    'ts',
    '[.cmt_&]:mr-[6px] [.cmt_&]:font-[600] [.cmt_&]:[font-size:11px] [.cmt_&]:leading-[1] [.cmt_&]:font-[family-name:var(--font-data)] [.cmt_&]:text-accent',
  ],
  [
    'dome',
    'bg-[image:radial-gradient(ellipse_at_50%_100%,color-mix(in_srgb,var(--color-primary)_45%,transparent),color-mix(in_srgb,var(--color-magenta-500)_14%,transparent)_50%,transparent_72%)] rounded-[600px_600px_0_0]',
  ],
  [
    'footer',
    'flex items-center justify-between h-full p-[0_60px] [font-size:13px] text-muted-foreground [border-top:1px_solid_var(--border)]',
  ],
  ['footer', '[&_a]:text-inherit [&_a]:no-underline'],
  ['footer', '[&_a:hover]:text-foreground'],
]
