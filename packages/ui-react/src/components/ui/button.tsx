import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './spinner'

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm ring-offset-white transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-white text-black hover:bg-transparent border-2 border-solid border-white hover:text-text hover:opacity-70 transition-[.3s]',
        destructive:
          'bg-red-500 text-slate-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90',
        outline:
          'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50',
        secondary:
          'bg-slate-800 text-slate-900 hover:bg-slate-800/80 dark:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-100/80',
        primary: 'bg-green-500 text-text hover:opacity-80 transition-[0.3s]',
        contrast:
          'bg-contrast text-textContrast border-2 border-grey-500 border-solid hover:opacity-80 transition-[0.3s]',
        ghost: 'hover:bg-bg-secondary duration-300',
        link: 'text-slate-900 underline-offset-4 hover:underline dark:text-slate-50',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
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
      {children}
      {!asChild && isLoading && <Spinner />}
    </Component>
  )
}
