'use client'

import * as React from 'react'
import { cn } from '@spotify/ui/lib/utils'

type Variant = 'default' | 'contrast' | 'search'

export interface DynamicLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  variant?: Variant
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

  const labelStyles = cn(
    'absolute left-3 transition-all duration-200 pointer-events-none z-10 px-1',
    variant === 'contrast' ? 'bg-contrast' : 'bg-white',
    variant === 'contrast' ? 'text-grey-400'
      : variant === 'search' ? 'text-gray-600'
      : 'text-slate-600',
    isFocused && (variant === 'contrast' ? 'text-green-500' : 'text-blue-600'),
    isFloating ? '-top-2 text-xs' : 'top-1/2 -translate-y-1/2 text-base',
    className
  )

  return (
    <label
      htmlFor={htmlFor}
      className={labelStyles}
      {...props}
    >
      {children}
    </label>
  )
}
