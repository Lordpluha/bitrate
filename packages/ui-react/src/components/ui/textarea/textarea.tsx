import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const Textarea = ({ className, ...props }: ComponentProps<'textarea'>) => {
  return (
    <textarea
      className={cn(
        'flex min-h-20 w-full rounded-md border border-input-border bg-input-surface px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}
