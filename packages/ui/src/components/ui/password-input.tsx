import * as React from 'react'
import { cn } from '@spotify/ui/lib/utils'
import { Input, type InputProps } from './input'
import { Eye, EyeOff } from 'lucide-react'

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showPassword?: boolean
  onTogglePassword?: () => void
  showIcon?: React.ReactNode
  hideIcon?: React.ReactNode
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({
    className,
    showPassword = false,
    onTogglePassword,
    showIcon,
    hideIcon,
    ...props
  }, ref) => {
    const [internalShowPassword, setInternalShowPassword] = React.useState(false)

    const isShowPassword = showPassword !== undefined ? showPassword : internalShowPassword
    const handleToggle = onTogglePassword || (() => setInternalShowPassword(!internalShowPassword))

    const ShowIcon = showIcon || <Eye className="h-4 w-4" />
    const HideIcon = hideIcon || <EyeOff className="h-4 w-4" />

    return (
      <div className="relative">
        <Input
          type={isShowPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          ref={ref}
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
)
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }

