import { Directive, input } from '@angular/core'
import { classes } from '@spartan-ng/helm/utils'
import { type VariantProps, cva } from 'class-variance-authority'

/**
 * Status pills. The tone variants (`success`, `warning`, `info`, plus `destructive`) carry the
 * status roles; `secondary` is the neutral "flat" pill; `default` marks the current/selected
 * value with the primary tint.
 */
const badgeVariants = cva(
  'h-6 gap-1 rounded-full border border-transparent px-[9px] text-xs font-semibold transition-colors has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&>ng-icon]:text-[length:--spacing(3)] group/badge focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap [&>ng-icon]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary-soft text-foreground',
        secondary: 'bg-foreground/8 text-muted-foreground',
        destructive: 'bg-error-surface text-error-text',
        success: 'bg-success-surface text-success-text',
        warning: 'bg-warning-surface text-warning-text',
        info: 'bg-info-surface text-info-text',
        outline: 'border-glass-line text-muted-foreground [a]:hover:bg-glass-hover',
        ghost: 'text-muted-foreground hover:bg-glass-hover',
        link: 'text-accent underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>

@Directive({
  selector: '[hlmBadge],hlm-badge',
  host: {
    'data-slot': 'badge',
    '[attr.data-variant]': 'variant()',
  },
})
export class HlmBadge {
  public readonly variant = input<BadgeVariants['variant']>('default')

  constructor() {
    classes(() => badgeVariants({ variant: this.variant() }))
  }
}
