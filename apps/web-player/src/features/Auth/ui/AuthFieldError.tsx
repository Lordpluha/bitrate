import { cn } from '@bitrate/ui-react'
import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

type AuthFieldErrorProps = {
  children: ReactNode
  className?: string
  id?: string
}

/** One validation message under a field. */
export const AuthFieldError = ({
  children,
  className,
  id,
}: AuthFieldErrorProps) => (
  <p
    className={cn(
      'flex items-center gap-2 text-xs text-destructive',
      className,
    )}
    id={id}
    role="alert"
  >
    <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
    {children}
  </p>
)
