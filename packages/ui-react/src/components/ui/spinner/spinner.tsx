import { Loader2Icon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** A loading indicator. Its English default name is a fallback; pass a translated `aria-label`. */
export function Spinner({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      role="status"
      className={cn('size-4 animate-spin', className)}
      {...props}
      aria-label={props['aria-label'] ?? 'Loading'}
    />
  )
}
