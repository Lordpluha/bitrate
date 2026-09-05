import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { Slot, Slottable } from '@/lib/slot'
import { cn } from '@/lib/utils'
import { Spinner } from '../spinner'

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-white text-black hover:bg-transparent border-2 border-solid border-white hover:text-text hover:opacity-70 transition-[.3s]',
        destructive:
          'bg-button-destructive text-button-destructive-foreground hover:bg-button-destructive/90',
        outline:
          'border border-button-outline-border bg-button-outline-surface hover:bg-button-outline-hover hover:text-foreground',
        secondary:
          'bg-button-secondary text-button-secondary-foreground hover:bg-button-secondary-hover',
        primary:
          'bg-button-primary text-button-primary-foreground hover:bg-button-primary-hover active:bg-button-primary-active transition-[0.3s]',
        contrast:
          'bg-button-contrast-surface text-button-contrast-foreground border-2 border-button-outline-border border-solid hover:opacity-80 transition-[0.3s]',
        ghost: 'hover:bg-button-ghost-hover duration-300',
        artistCard:
          'inline-flex items-center p-4 text-black font-bold text-xl rounded-3xl border-solid bg-white border cursor-pointer transition-transform duration-300 hover:scale-105',
        link: 'text-button-link-foreground underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-full px-8',
        icon: 'h-10 w-10',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends ComponentProps<'button'>,
    Omit<VariantProps<typeof buttonVariants>, 'disabled'> {
  isLoading?: boolean
  asChild?: boolean
}

export const Button = ({
  className,
  children,
  isLoading = false,
  disabled,
  variant,
  asChild = false,
  size,
  ...props
}: ButtonProps) => {
  const Component = asChild ? Slot : 'button'

  return (
    <Component
      className={cn(buttonVariants({ variant, size, className, disabled }))}
      aria-disabled={disabled}
      disabled={disabled}
      {...props}
    >
      <Slottable>{children}</Slottable>
      {!asChild && isLoading && <Spinner />}
    </Component>
  )
}
