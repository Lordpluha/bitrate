'use client'

import { type ReactNode, useState } from 'react'
import { Eye, EyeOff } from '@/icons'
import { cn } from '@/lib/utils'

import { Input, type InputProps } from './input'

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showPassword?: boolean
  onTogglePassword?: () => void
  showIcon?: ReactNode
  hideIcon?: ReactNode
}

export const PasswordInput = ({
  className,
  showPassword,
  onTogglePassword,
  showIcon,
  hideIcon,
  ...props
}: PasswordInputProps) => {
  const [internalShowPassword, setInternalShowPassword] = useState(false)

  const isShowPassword = showPassword || internalShowPassword
  const handleToggle = onTogglePassword || (() => setInternalShowPassword(!internalShowPassword))

  const ShowIcon = showIcon || <Eye className="h-4 w-4" />
  const HideIcon = hideIcon || <EyeOff className="h-4 w-4" />

  return (
    <div className="relative">
      <Input
        type={isShowPassword ? 'text' : 'password'}
        className={cn('pr-10', className)}
        {...props}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        onClick={handleToggle}
        tabIndex={-1}
      >
        {isShowPassword ? HideIcon : ShowIcon}
      </button>
    </div>
  )
}
