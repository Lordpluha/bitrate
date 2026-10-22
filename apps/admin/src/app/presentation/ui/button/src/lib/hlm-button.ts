import { Directive, input, signal } from '@angular/core'
import { BrnButton } from '@spartan-ng/brain/button'
import { classes } from '@spartan-ng/helm/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ClassValue } from 'clsx'
import { injectBrnButtonConfig } from './hlm-button.token'

/**
 * The console's pill buttons. `default` is the one primary action on a surface (it glows),
 * `secondary` and `ghost` sit on glass, `destructive` is the solid error pill for an
 * irreversible decision.
 */
export const buttonVariants = cva(
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[matches-spartan-invalid=true]:ring-3 data-[matches-spartan-invalid=true]:ring-error/20 rounded-full border border-transparent bg-clip-padding text-[0.8125rem] font-semibold active:not-aria-[haspopup]:translate-y-px [&_ng-icon:not([class*='text-'])]:text-base group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-[background-color,color,box-shadow,opacity] select-none disabled:cursor-not-allowed disabled:opacity-45 data-disabled:pointer-events-none data-disabled:opacity-45 [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-glow hover:bg-primary-hover',
        outline:
          'border-glass-line bg-transparent text-foreground hover:bg-glass-hover aria-expanded:bg-glass-hover',
        secondary:
          'bg-foreground/7 text-foreground hover:bg-foreground/10 aria-expanded:bg-foreground/10',
        ghost: 'text-foreground hover:bg-glass-hover aria-expanded:bg-glass-hover',
        destructive: 'bg-error text-error-foreground hover:bg-error/85 focus-visible:outline-error',
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        default:
          'h-[38px] gap-2 px-4 has-data-[icon=inline-start]:ps-3.5 has-data-[icon=inline-end]:pe-3.5',
        xs: "h-6 gap-1 px-2.5 text-xs [&_ng-icon:not([class*='text-'])]:text-xs",
        sm: 'h-8 gap-1.5 px-3 text-xs',
        lg: 'h-11 gap-2 px-5 text-sm',
        icon: 'size-10',
        'icon-xs': "size-6 [&_ng-icon:not([class*='text-'])]:text-xs",
        'icon-sm': 'size-8',
        'icon-lg': 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>

@Directive({
  selector: 'button[hlmBtn], a[hlmBtn]',
  exportAs: 'hlmBtn',
  hostDirectives: [{ directive: BrnButton, inputs: ['disabled'] }],
  host: { 'data-slot': 'button' },
})
export class HlmButton {
  private readonly _config = injectBrnButtonConfig()

  private readonly _additionalClasses = signal<ClassValue>('')

  public readonly variant = input<ButtonVariants['variant']>(this._config.variant)

  public readonly size = input<ButtonVariants['size']>(this._config.size)

  constructor() {
    classes(() => [
      buttonVariants({ variant: this.variant(), size: this.size() }),
      this._additionalClasses(),
    ])
  }

  setClass(classes: string): void {
    this._additionalClasses.set(classes)
  }
}
