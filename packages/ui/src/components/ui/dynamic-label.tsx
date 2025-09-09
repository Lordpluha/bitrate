'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@spotify/ui/lib/utils'

const labelVariants = cva(
  'absolute left-3 transition-all duration-200 pointer-events-none z-10 px-1',
  {
    variants: {
      variant: {
        default: 'bg-white text-slate-600',
        contrast: 'bg-contrast text-grey-400',
        search: 'bg-white text-gray-600'
      },
      state: {
        idle: 'top-1/2 -translate-y-1/2 text-base',
        floating: '-top-2 text-xs'
      },
      focused: {
        true: '',
        false: ''
      }
    },
    compoundVariants: [
      {
        variant: 'default',
        focused: true,
        className: 'text-blue-600'
      },
      {
        variant: 'contrast',
        focused: true,
        className: 'text-green-500'
      },
      {
        variant: 'search',
        focused: true,
        className: 'text-blue-600'
      }
    ],
    defaultVariants: {
      variant: 'default',
      state: 'idle',
      focused: false
    }
  }
)

export interface DynamicLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    Omit<VariantProps<typeof labelVariants>, 'state' | 'focused'> {
  children: React.ReactNode
}

export const DynamicLabel: React.FC<DynamicLabelProps> = ({
  variant = 'default',
  children,
  htmlFor,
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false)
  const [hasValue, setHasValue] = React.useState(false)

  React.useEffect(() => {
    if (!htmlFor) return

    const input = document.getElementById(htmlFor) as HTMLInputElement
    if (!input) return

    const checkValue = () => {
      setHasValue(!!input.value)
    }

    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => {
      setIsFocused(false)
      checkValue()
    }
    const handleInput = () => checkValue()

    checkValue()

    input.addEventListener('focus', handleFocus)
    input.addEventListener('blur', handleBlur)
    input.addEventListener('input', handleInput)

    return () => {
      input.removeEventListener('focus', handleFocus)
      input.removeEventListener('blur', handleBlur)
      input.removeEventListener('input', handleInput)
    }
  }, [htmlFor])

  const isFloating = isFocused || hasValue

  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        labelVariants({
          variant,
          state: isFloating ? 'floating' : 'idle',
          focused: isFocused,
          className
        })
      )}
      {...props}
    >
      {children}
    </label>
  )
}

export { labelVariants }
