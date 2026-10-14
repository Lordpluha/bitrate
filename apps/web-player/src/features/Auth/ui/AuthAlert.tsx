import { cn } from '@bitrate/ui-react'
import { Info } from 'lucide-react'
import type { ReactNode } from 'react'

type AuthAlertProps = {
  children: ReactNode
  title: string
  tone?: 'info' | 'destructive'
}

/** A boxed message above or instead of a form: a failed sign-in, a sent link, a broken link. */
export const AuthAlert = ({
  children,
  title,
  tone = 'info',
}: AuthAlertProps) => {
  const isDestructive = tone === 'destructive'

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border bg-card p-4',
        isDestructive ? 'border-destructive' : 'border-border',
      )}
      role={isDestructive ? 'alert' : 'status'}
    >
      <Info
        aria-hidden="true"
        className={cn(
          'mt-0.5 size-4.5 shrink-0',
          isDestructive ? 'text-destructive' : 'text-foreground',
        )}
      />
      <div className="flex min-w-0 flex-col gap-1">
        <p
          className={cn(
            'text-base font-medium leading-normal',
            isDestructive ? 'text-destructive' : 'text-foreground',
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            'text-sm',
            isDestructive ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {children}
        </p>
      </div>
    </div>
  )
}
