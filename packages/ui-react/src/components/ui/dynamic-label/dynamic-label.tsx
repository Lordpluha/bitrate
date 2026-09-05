'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import type { LabelHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'
import { useInputContext } from '../input-context'

const labelVariants = cva(
  'absolute left-3 transition-all duration-300 pointer-events-none z-10 px-1',
  {
    variants: {
      variant: {
        default: 'bg-dynamic-label-surface text-dynamic-label-foreground',
        contrast: 'bg-contrast text-grey-400',
        search: 'bg-dynamic-label-surface text-dynamic-label-foreground',
      },
      state: {
        idle: 'top-1/2 -translate-y-1/2 text-base',
        floating: '-top-2 text-xs',
      },
      focused: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        focused: true,
        className: 'text-blue-600',
      },
      {
        variant: 'contrast',
        focused: true,
        className: 'text-green-500',
      },
      {
        variant: 'search',
        focused: true,
        className: 'text-blue-600',
      },
    ],
    defaultVariants: {
      variant: 'default',
      state: 'idle',
      focused: false,
    },
  },
)

export type DynamicLabelProps = PropsWithChildren<
  LabelHTMLAttributes<HTMLLabelElement> &
    Omit<VariantProps<typeof labelVariants>, 'state' | 'focused'>
>

export const DynamicLabel = ({
  variant = 'default',
  children,
  htmlFor,
  className,
  ...props
}: DynamicLabelProps) => {
  const context = useInputContext()
  const isFocused = context?.isFocused ?? false
  const hasValue = context?.hasValue ?? false

  const isFloating = isFocused || hasValue

  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        labelVariants({
          variant,
          state: isFloating ? 'floating' : 'idle',
          focused: isFocused,
          className,
        }),
      )}
      {...props}
    >
      {children}
    </label>
  )
}

export { labelVariants }
