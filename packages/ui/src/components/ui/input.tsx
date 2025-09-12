import { cn } from '@/lib/utils'

import * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'

const inputVariants = cva(
  'flex w-full rounded-md border px-3 py-2 text-base placeholder:text-slate-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium',
  {
    variants: {
      variant: {
        default:
          'border-slate-200 bg-white text-slate-900 focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50',
        contrast:
          'border-grey-500 bg-contrast text-textContrast focus:border-green-500',
        search:
          'border-none bg-surface text-black placeholder:text-gray-600 focus:border-white rounded-full px-12 py-4 h-12',
      }

    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input, inputVariants }
