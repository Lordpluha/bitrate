/**
 * The landing's styles as Tailwind utilities, in cascade order: each entry adds utilities to
 * elements carrying that marker class (or `#id`). `lc()` merges the entries an element matches,
 * so later entries win exactly as later CSS rules did. Context selectors are arbitrary variants.
 */
export const LANDING_RULES: readonly (readonly [string, string])[] = [
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
  /* Ten fullscreen scenes after the archived "Original Edition" landing. Each scene is a 1440x900 board scaled to the viewport, with layered windows over one fixed WebGL stage. One gesture = one scene. */
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
  /* chrome */
  [
    'top',
    'fixed inset-[0_0_auto_0] z-[40] flex gap-[16px] items-center justify-between p-[calc(env(safe-area-inset-top,0px)_+_18px)_clamp(16px,3.4vw,48px)_14px] pointer-events-none',
  ],
  ['top', '[&_>_*]:pointer-events-auto'],
  [
    'brand',
    'flex gap-[10px] items-center font-[family-name:var(--font-display)] [font-size:20px] font-[600] text-foreground no-underline',
  ],
  ['mark', 'w-[30px] h-[30px]'],
  ['nav', 'flex gap-[26px] [font-size:13px] text-muted-foreground'],
  ['nav', '[&_a]:text-inherit [&_a]:no-underline'],
  ['nav', '[&_a:hover]:text-foreground'],
  ['top-actions', 'flex gap-[10px] items-center'],
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
  [
    'btn',
    '[&:focus-visible]:[outline:2px_solid_var(--accent)] [&:focus-visible]:[outline-offset:3px]',
  ],
  [
    'themes',
    '[&_button:focus-visible]:[outline:2px_solid_var(--accent)] [&_button:focus-visible]:[outline-offset:3px]',
  ],
  [
    'dots',
    '[&_button:focus-visible]:[outline:2px_solid_var(--accent)] [&_button:focus-visible]:[outline-offset:3px]',
  ],
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
    '[&_button:hover_span]:opacity-[1] [&_button[aria-current=true]_span]:opacity-[1]',
  ],
  [
    'counter',
    'fixed bottom-[calc(env(safe-area-inset-bottom,0px)_+_18px)] left-[clamp(16px,3.4vw,48px)] z-[40] flex gap-[12px] items-center font-[500] [font-size:11px] leading-[1] font-[family-name:var(--font-data)] text-muted-foreground tracking-[0.1em]',
  ],
  ['counter', '[&_b]:font-[500] [&_b]:text-foreground'],
  [
    'rail',
    '[.counter_&]:w-[110px] [.counter_&]:h-[2px] [.counter_&]:overflow-hidden [.counter_&]:bg-border [.counter_&]:bg-none [.counter_&]:rounded-[2px]',
  ],
  [
    'rail',
    '[.counter_&_i]:block [.counter_&_i]:h-full [.counter_&_i]:bg-[image:linear-gradient(90deg,var(--primary),var(--magenta))] [.counter_&_i]:[transform:scaleX(0.1)] [.counter_&_i]:origin-[left]',
  ],
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
  /* partners + team: interactive zones */
  ['drag-zone', 'touch-none [html:not(.has-cursor)_&]:cursor-grab'],
  ['drag-zone', '[html:not(.has-cursor)_&:active]:cursor-grabbing'],
  [
    'pit',
    'overflow-hidden bg-[image:linear-gradient(to_top,color-mix(in_srgb,var(--color-primary)_14%,transparent),transparent_45%)] border border-solid border-border rounded-[26px]',
  ],
  [
    'pit',
    "[&::after]:absolute [&::after]:right-0 [&::after]:bottom-0 [&::after]:left-0 [&::after]:h-[2px] [&::after]:[content:''] [&::after]:bg-[image:linear-gradient(90deg,transparent,var(--accent),var(--magenta),transparent)] [&::after]:opacity-[0.6]",
  ],
  [
    'ball',
    'absolute top-0 left-0 grid place-items-center text-white text-center [-webkit-user-select:none] select-none rounded-[50%] [box-shadow:inset_-10px_-14px_28px_color-mix(in_srgb,var(--color-black)_35%,transparent),inset_8px_10px_22px_color-mix(in_srgb,var(--color-white)_22%,transparent),0_12px_30px_-12px_color-mix(in_srgb,var(--color-black)_60%,transparent)] [will-change:transform]',
  ],
  [
    'ball',
    '[&.person]:font-[700] [&.person]:[font-size:44px] [&.person]:leading-[1] [&.person]:font-[family-name:var(--font-display)] [&.person]:tracking-[-0.02em] [&.person]:[outline:3px_solid_color-mix(in_srgb,var(--color-white)_14%,transparent)] [&.person]:[outline-offset:-3px]',
  ],
  [
    'ball',
    '[&.tech]:box-border [&.tech]:p-[6px] [&.tech]:font-[600] [&.tech]:[font-size:12px] [&.tech]:leading-[1.1] [&.tech]:font-[family-name:var(--font-body)]',
  ],
  [
    'ball',
    '[&.hot]:[outline:2px_solid_var(--accent)] [&.hot]:[outline-offset:2px]',
  ],
  [
    'hc',
    'absolute top-0 left-0 z-[5] w-[290px] p-[16px] pointer-events-none bg-card bg-none border border-solid border-border rounded-[12px] [box-shadow:0_24px_60px_-24px_var(--shadow)] opacity-[0] [scale:0.96] [transition:opacity_0.15s_ease,scale_0.15s_ease]',
  ],
  [
    'hc',
    '[&.open]:pointer-events-auto [&.open]:opacity-[1] [&.open]:[scale:1]',
  ],
  ['row', '[.hc_&]:items-start'],
  [
    'links',
    '[.hc_&]:flex [.hc_&]:flex-wrap [.hc_&]:gap-[8px] [.hc_&]:mt-[12px]',
  ],
  ['stats', 'flex gap-[26px] mt-[30px]'],
  /* AI assistant: bottom-right button that blooms into a chat; a thinking orb shows the phase */
  [
    'ai-fab',
    'fixed right-[24px] bottom-[24px] z-[45] grid place-items-center w-[52px] h-[52px] text-white [html:not(.has-cursor)_&]:cursor-pointer bg-[image:linear-gradient(135deg,var(--color-primary),var(--color-magenta-500))] border-0 border-none rounded-[50%] [box-shadow:0_14px_34px_-12px_color-mix(in_srgb,var(--color-primary)_70%,transparent)]',
  ],
  [
    'ai-fab',
    '[&[aria-expanded=true]]:text-foreground [&[aria-expanded=true]]:bg-card [&[aria-expanded=true]]:bg-none [&[aria-expanded=true]]:border [&[aria-expanded=true]]:border-solid [&[aria-expanded=true]]:border-border [&[aria-expanded=true]]:[box-shadow:none]',
  ],
  [
    'ai-fab',
    '[&:focus-visible]:[outline:2px_solid_var(--accent)] [&:focus-visible]:[outline-offset:3px]',
  ],
  [
    'ai-panel',
    'fixed right-[24px] bottom-[88px] z-[46] flex invisible flex-col w-[380px] h-[540px] max-h-[calc(100vh_-_120px)] overflow-hidden bg-card bg-none border border-solid border-border rounded-[18px] [box-shadow:0_30px_80px_-30px_var(--shadow)] origin-[100%_100%]',
  ],
  ['ai-panel', '[&.open]:visible'],
  [
    'ai-head',
    'flex gap-[10px] items-center h-[60px] p-[0_14px] [border-bottom:1px_solid_var(--border)]',
  ],
  [
    'mk',
    '[.ai-head_&]:grid [.ai-head_&]:place-items-center [.ai-head_&]:w-[32px] [.ai-head_&]:h-[32px] [.ai-head_&]:bg-secondary [.ai-head_&]:bg-none [.ai-head_&]:rounded-[50%]',
  ],
  [
    'intro-ll',
    '[&_svg]:block [&_svg]:w-full [&_svg]:h-full [&_svg]:overflow-visible',
  ],
  ['mk', '[.ai-head_&_svg]:w-[18px] [.ai-head_&_svg]:h-[18px]'],
  [
    'ai-head',
    '[&_small]:block [&_small]:[font-size:11px] [&_small]:text-muted-foreground',
  ],
  [
    'ai-x',
    'p-[6px] ml-auto text-muted-foreground [html:not(.has-cursor)_&]:cursor-pointer [background:none] border-0 border-none',
  ],
  [
    'ai-msgs',
    'flex flex-[1] flex-col gap-[10px] p-[14px] overflow-y-auto [overscroll-behavior:contain]',
  ],
  [
    'ai-b',
    'self-start max-w-[82%] p-[10px_12px] [font-size:13px] leading-[1.45] bg-secondary bg-none rounded-[14px]',
  ],
  [
    'ai-b',
    '[&.me]:self-end [&.me]:text-white [&.me]:bg-primary [&.me]:bg-none',
  ],
  [
    'ai-typing',
    'flex gap-[8px] items-center self-start p-[8px_12px] [font-size:12px] text-muted-foreground bg-secondary bg-none rounded-[14px]',
  ],
  [
    'ai-welcome',
    'grid gap-[8px] [justify-items:center] p-[18px_0_6px] text-center',
  ],
  ['ai-chips', 'flex flex-wrap gap-[8px] justify-center'],
  [
    'ai-chip',
    'h-[32px] p-[0_12px] font-[500] [font-size:12px] leading-[1] font-[family-name:var(--font-body)] text-foreground [html:not(.has-cursor)_&]:cursor-pointer [background:none] border border-solid border-border rounded-[16px]',
  ],
  ['ai-chip', '[&:hover]:border-accent'],
  [
    'ai-comp',
    'grid gap-[8px] p-[10px_12px_12px] [border-top:1px_solid_var(--border)]',
  ],
  [
    'ai-in',
    'flex gap-[8px] items-center h-[44px] p-[0_6px_0_12px] bg-secondary bg-none rounded-[12px]',
  ],
  [
    'ai-in',
    '[&_input]:flex-[1] [&_input]:[font-size:13px] [&_input]:leading-[1] [&_input]:font-[family-name:var(--font-body)] [&_input]:text-foreground [&_input]:[outline:0] [&_input]:[background:none] [&_input]:border-0 [&_input]:border-none',
  ],
  [
    'ai-send',
    'grid place-items-center w-[32px] h-[32px] text-white [html:not(.has-cursor)_&]:cursor-pointer bg-primary bg-none border-0 border-none rounded-[10px]',
  ],
  ['ai-comp', '[&_small]:[font-size:10px] [&_small]:text-text-subdued'],
  ['footer', 'pr-[96px]'],
  ['ai-fab', 'max-[820px]:right-[16px] max-[820px]:bottom-[16px]'],
  [
    'ai-panel',
    'max-[820px]:inset-0 max-[820px]:w-auto max-[820px]:h-auto max-[820px]:max-h-none max-[820px]:rounded-[0]',
  ],
  /* intro: the logo writes itself, then the hero takes over */
  [
    'intro',
    'fixed inset-0 z-[90] grid gap-[18px] [place-content:center] [justify-items:center] bg-background bg-none',
  ],
  ['intro-ll', 'absolute inset-0'],
  ['mono', '[.intro_&]:top-[calc(50%_+_min(100vw,100vh)_*_0.15_+_62px)]'],
  ['intro', '[.is-static_&]:hidden'],
  ['mark', 'w-[30px] h-[30px]'],
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
  /* service health: pill that blooms into a panel through an SVG goo filter */
  ['health', 'relative'],
  [
    'hpill',
    'relative z-[2] inline-flex gap-[8px] items-center h-[34px] p-[0_12px] font-[500] [font-size:13px] leading-[1] font-[family-name:var(--font-body)] text-foreground [html:not(.has-cursor)_&]:cursor-pointer bg-card bg-none border border-solid border-border rounded-[17px]',
  ],
  [
    'hpill',
    '[&:focus-visible]:[outline:2px_solid_var(--accent)] [&:focus-visible]:[outline-offset:3px]',
  ],
  [
    'hdot',
    'w-[8px] h-[8px] bg-success bg-none rounded-[50%] [box-shadow:0_0_0_0_color-mix(in_srgb,var(--color-success)_55%,transparent)] animate-[landing-hping_2s_infinite]',
  ],
  [
    'goo',
    'absolute right-0 bottom-0 z-[1] w-[540px] h-[520px] pointer-events-none [filter:url(#goo)]',
  ],
  ['blob', 'absolute right-0 bg-card bg-none'],
  ['b-pill', 'bottom-0 w-[210px] h-[34px] rounded-[17px]'],
  [
    'b-panel',
    'bottom-[46px] w-[520px] h-[440px] rounded-[18px] [transform:scale(0.12,0.05)] origin-[100%_100%]',
  ],
  [
    'hpanel',
    'absolute right-0 bottom-[46px] z-[2] box-border flex invisible flex-col w-[520px] max-h-[min(560px,calc(100vh_-_120px))] p-[16px] text-foreground text-left opacity-[0]',
  ],
  /* the rows scroll inside the panel when the window is short; the blob behind it is sized from the panel's own height */
  [
    '#hrows',
    'block min-h-0 pr-[6px] mr-[-6px] overflow-y-auto [overscroll-behavior:contain] [scrollbar-width:thin]',
  ],
  ['hpanel', '[.health.open_&]:visible'],
  [
    'hrow',
    'grid grid-cols-[minmax(0,1fr)_auto_auto] gap-[12px] items-center p-[9px_0] [border-bottom:1px_solid_var(--border)]',
  ],
  [
    'hrow',
    '[&_small]:block [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:[font-size:11px] [&_small]:text-muted-foreground [&_small]:whitespace-nowrap',
  ],
  ['dots', '[transition:opacity_0.2s]'],
  [
    'dots',
    '[.is-health-open_&]:pointer-events-none [.is-health-open_&]:opacity-[0]',
  ],
  [
    'hstate',
    'inline-flex gap-[6px] items-center font-[600] [font-size:12px] leading-[1] font-[family-name:var(--font-body)] text-success',
  ],
  [
    'hstate',
    "[&::before]:w-[6px] [&::before]:h-[6px] [&::before]:[content:''] [&::before]:[background:currentColor] [&::before]:rounded-[50%]",
  ],
  ['hstate', '[&.w]:text-warning'],
  ['landing', 'max-[820px]:[font-size:13px]'],
  ['nav', 'max-[820px]:hidden'],
  ['dots', 'max-[820px]:hidden'],
  ['label', 'max-[820px]:[.top_.btn-ghost_&]:hidden'],
  ['themes', 'max-[820px]:[&_button]:p-[6px_8px]'],
  ['scene', 'max-[820px]:box-border max-[820px]:p-[84px_16px_64px]'],
  [
    'board',
    'max-[820px]:static max-[820px]:flex max-[820px]:flex-col max-[820px]:gap-[16px] max-[820px]:w-full max-[820px]:h-auto max-[820px]:[transform:none]',
  ],
  ['abs', 'max-[820px]:static! max-[820px]:w-auto! max-[820px]:h-auto!'],
  ['pos', 'max-[820px]:static! max-[820px]:w-auto! max-[820px]:h-auto!'],
  ['d-only', 'max-[820px]:hidden!'],
  ['h72', 'max-[820px]:[font-size:36px]'],
  ['h80', 'max-[820px]:[font-size:36px]'],
  ['h56', 'max-[820px]:[font-size:32px]'],
  ['h54', 'max-[820px]:[font-size:32px]'],
  ['h48', 'max-[820px]:[font-size:29px]'],
  ['lede', 'max-[820px]:[font-size:15px] max-[820px]:[&.s]:[font-size:15px]'],
  ['ctas', 'max-[820px]:flex-col'],
  ['btn', 'max-[820px]:max-w-full'],
  ['btn', 'max-[820px]:[.ctas_&]:w-full max-[820px]:[.ctas_&]:h-[48px]'],
  ['win', 'max-[820px]:[transform:none]!'],
  ['card', 'max-[820px]:[transform:none]!'],
  ['m-fit', 'max-[820px]:max-h-[38vh] max-[820px]:overflow-hidden'],
  ['win', 'max-[820px]:[&.m-fit]:h-auto!'],
  ['lrow', 'max-[820px]:grid-cols-[26px_40px_1fr]'],
  ['lrow', 'max-[820px]:[&_>_:nth-child(n_+_4)]:hidden'],
  ['drag-zone', 'max-[820px]:relative! max-[820px]:h-[46vh]!'],
  ['hpanel', 'max-[820px]:w-[calc(100vw_-_32px)]'],
  ['b-panel', 'max-[820px]:w-[calc(100vw_-_32px)]'],
  ['goo', 'max-[820px]:w-[calc(100vw_-_16px)]'],
  [
    'hrow',
    'max-[820px]:grid-cols-[minmax(0,1fr)_auto_auto] max-[820px]:gap-[10px]',
  ],
  [
    'hrow',
    'max-[820px]:[&_small]:block max-[820px]:[&_small]:overflow-hidden max-[820px]:[&_small]:text-ellipsis max-[820px]:[&_small]:whitespace-nowrap',
  ],
  ['#cradleSlot', 'max-[820px]:h-[26vh]!'],
  /* mobile layout: every scene is a balanced column that fits one screen, nothing wider than the gutter */
  [
    'scene',
    'max-[820px]:[&_*]:box-border max-[820px]:[&_*::before]:box-border max-[820px]:[&_*::after]:box-border',
  ],
  [
    'scene',
    'max-[820px]:p-[calc(env(safe-area-inset-top,0px)_+_76px)_16px_calc(env(safe-area-inset-bottom,0px)_+_84px)]',
  ],
  [
    'board',
    'max-[820px]:gap-[14px] max-[820px]:[justify-content:safe_center] max-[820px]:h-full',
  ],
  [
    'board',
    'max-[820px]:[&_>_*]:flex-[0_0_auto] max-[820px]:[&_>_*]:min-w-0 max-[820px]:[&_>_*]:max-w-full',
  ],
  ['btn', 'max-[820px]:[.ctas_&]:p-[0_18px]'],
  /* the physics fields take whatever height is left instead of a fixed share of the screen */
  [
    'drag-zone',
    'max-[820px]:top-0! max-[820px]:left-0! max-[820px]:flex-[1_1_auto]! max-[820px]:w-full! max-[820px]:h-auto! max-[820px]:min-h-[200px]',
  ],
  [
    '#cradleSlot',
    'max-[820px]:flex-[1_1_auto]! max-[820px]:h-auto! max-[820px]:min-h-[150px] max-[820px]:max-h-[240px]',
  ],
  ['pit', 'max-[820px]:rounded-[20px]'],
  /* the particle field steps back so headlines stay readable on a small screen */
  ['#stage', 'max-[820px]:opacity-[0.5]'],
  [
    'counter',
    'max-[820px]:bottom-[calc(env(safe-area-inset-bottom,0px)_+_28px)]!',
  ],
  /* footer: brand + status in one line, links below */
  [
    'footer',
    'max-[820px]:flex-wrap max-[820px]:gap-[10px_16px] max-[820px]:justify-between max-[820px]:h-auto max-[820px]:p-[12px_0_0]',
  ],
  [
    'row',
    'max-[820px]:[.footer_>_&:last-child]:flex-wrap max-[820px]:[.footer_>_&:last-child]:gap-[14px]! max-[820px]:[.footer_>_&:last-child]:justify-between max-[820px]:[.footer_>_&:last-child]:w-full',
  ],
  ['ulink', 'max-[820px]:[.footer_&]:whitespace-nowrap'],
  ['hpill', 'max-[820px]:h-[32px] max-[820px]:[font-size:12px]'],
  ['hpanel', 'max-[820px]:max-h-[calc(100vh_-_200px)]'],
  ['grain', 'motion-reduce:animate-[none]'],
  ['live', 'motion-reduce:[&_i]:animate-[none]'],
  /* Signal cursor — one custom cursor for the landing and the app (fine pointers only; touch keeps the system) */
  ['cur', 'fixed top-0 left-0 z-[9999] pointer-events-none'],
  [
    'cur',
    '[&_>_*]:fixed [&_>_*]:top-0 [&_>_*]:left-0 [&_>_*]:pointer-events-none [&_>_*]:[will-change:transform]',
  ],
  [
    'cur-dot',
    'w-[6px] h-[6px] m-[-3px_0_0_-3px] bg-foreground bg-none rounded-[50%] [transition:opacity_0.2s,scale_0.2s]',
  ],
  [
    'cur-ring',
    'grid place-items-center w-[40px] h-[40px] m-[-20px_0_0_-20px] border-[length:1.5px] border-solid border-accent rounded-[50%] [transition:width_0.32s_cubic-bezier(0.2,0.8,0.2,1),height_0.32s_cubic-bezier(0.2,0.8,0.2,1),margin_0.32s_cubic-bezier(0.2,0.8,0.2,1),background-color_0.3s,border-color_0.3s,opacity_0.2s,scale_0.2s]',
  ],
  [
    'cur-ring',
    '[&_>_*]:[grid-area:1_/_1] [&_>_*]:opacity-[0] [&_>_*]:[transition:opacity_0.2s]',
  ],
  [
    'cur-arrows',
    'pl-[6px] font-[600] [font-size:14px] leading-[1] font-[family-name:var(--font-body,system-ui)] text-accent tracking-[6px]',
  ],
  [
    'cur-ban',
    'relative w-[14px] h-[14px] border-[length:1.5px] border-solid border-muted-foreground rounded-[50%]',
  ],
  [
    'cur-ban',
    "[&::after]:absolute [&::after]:top-[-1px] [&::after]:bottom-[-1px] [&::after]:left-1/2 [&::after]:w-[1.5px] [&::after]:ml-[-0.75px] [&::after]:[content:''] [&::after]:bg-muted-foreground [&::after]:bg-none [&::after]:[transform:rotate(45deg)]",
  ],
  [
    'cur-pill',
    'flex gap-[8px] items-center h-[40px] p-[0_14px] m-[-20px_0_0_-38px] font-[600] [font-size:13px] leading-[1] font-[family-name:var(--font-body,system-ui)] text-background bg-white bg-none rounded-[20px] opacity-[0] [scale:0.5] [transition:opacity_0.2s,scale_0.32s_cubic-bezier(0.3,1.6,0.5,1)]',
  ],
  [
    'cur-beam',
    'w-[2px] h-[22px] m-[-11px_0_0_-1px] bg-accent bg-none rounded-[1px] opacity-[0] [transition:opacity_0.15s]',
  ],
  [
    'cur-scrub',
    'grid gap-[4px] [justify-items:center] w-[40px] m-[-44px_0_0_-20px] opacity-[0] [transition:opacity_0.15s]',
  ],
  [
    'cur-ring',
    '[.cur.m-hover_&]:w-[56px] [.cur.m-hover_&]:h-[56px] [.cur.m-hover_&]:m-[-28px_0_0_-28px] [.cur.m-hover_&]:bg-[color:color-mix(in_srgb,var(--accent)_16%,transparent)] [.cur.m-drag_&]:w-[56px] [.cur.m-drag_&]:h-[56px] [.cur.m-drag_&]:m-[-28px_0_0_-28px] [.cur.m-drag_&]:bg-[color:color-mix(in_srgb,var(--accent)_16%,transparent)]',
  ],
  [
    'cur-dot',
    '[.cur.m-hover_&]:opacity-[0] [.cur.m-drag_&]:opacity-[0] [.cur.m-disabled_&]:opacity-[0]',
  ],
  ['cur-arrows', '[.cur.m-drag_&]:opacity-[1]'],
  ['cur-ban', '[.cur.m-disabled_&]:opacity-[1]'],
  ['cur-ring', '[.cur.m-disabled_&]:border-muted-foreground'],
  [
    'cur-ring',
    '[.cur.m-play_&]:opacity-[0] [.cur.m-text_&]:opacity-[0] [.cur.m-scrub_&]:opacity-[0]',
  ],
  [
    'cur-dot',
    '[.cur.m-play_&]:opacity-[0] [.cur.m-text_&]:opacity-[0] [.cur.m-scrub_&]:opacity-[0]',
  ],
  ['cur', '[&.m-hide_>_*]:opacity-[0]'],
  ['cur-pill', '[.cur.m-play_&]:opacity-[1] [.cur.m-play_&]:[scale:1]'],
  ['cur-beam', '[.cur.m-text_&]:opacity-[1]'],
  ['cur-scrub', '[.cur.m-scrub_&]:opacity-[1]'],
  ['cur-ring', '[.cur.is-press_&]:[scale:0.75]'],
  ['cur-pill', '[.cur.is-press_&]:[scale:0.9]'],
  ['cur', '[&.is-out_>_*]:opacity-[0]!'],
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
  [
    'hc-bio',
    '[.hc_&]:mt-[10px] [.hc_&]:[font-size:13px] [.hc_&]:text-foreground',
  ],
  ['intro', '[&[hidden]]:hidden'],
  [
    'scene',
    'motion-reduce:relative motion-reduce:visible motion-reduce:h-[100vh] motion-reduce:min-h-[640px]',
  ],
  ['intro', 'motion-reduce:hidden'],
  ['ai-title', '[font-size:14px]'],
  ['ai-fab-x', '[font-size:18px]'],
  ['ai-fab-spark', '[.ai-fab_&:is(svg)]:w-[22px] [.ai-fab_&:is(svg)]:h-[22px]'],
]
