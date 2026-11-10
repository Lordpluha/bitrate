'use client'

import { type ReactNode, useState } from 'react'
import { Eye, EyeOff } from '@/icons'
import { cn } from '@/lib/utils'

import { Input, type InputProps } from '../input'

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showPassword?: boolean
  onTogglePassword?: () => void
  showIcon?: ReactNode
  hideIcon?: ReactNode
  /** Accessible name of the toggle while the password is hidden. Pass a translated string. */
  showLabel?: string
  /** Accessible name of the toggle while the password is visible. Pass a translated string. */
  hideLabel?: string
}

export const PasswordInput = ({
  className,
  showPassword,
  onTogglePassword,
  showIcon,
  hideIcon,
  showLabel = 'Show password',
  hideLabel = 'Hide password',
  ...props
}: PasswordInputProps) => {
  const [internalShowPassword, setInternalShowPassword] = useState(false)

  const isShowPassword = showPassword || internalShowPassword
  const handleToggle = onTogglePassword || (() => setInternalShowPassword(!internalShowPassword))

  const ShowIcon = showIcon || <Eye aria-hidden className="h-4 w-4" />
  const HideIcon = hideIcon || <EyeOff aria-hidden className="h-4 w-4" />

  return (
    <div className="relative">
      <Input
        type={isShowPassword ? 'text' : 'password'}
        className={cn('pr-10', className)}
        {...props}
      />
      <button
        type="button"
        aria-label={isShowPassword ? hideLabel : showLabel}
        aria-pressed={isShowPassword}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-input-addon-foreground hover:text-foreground"
        onClick={handleToggle}
        tabIndex={-1}
      >
        {isShowPassword ? HideIcon : ShowIcon}
      </button>
    </div>
  )
}
