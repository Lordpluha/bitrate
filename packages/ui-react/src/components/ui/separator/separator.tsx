import { Root } from '@radix-ui/react-separator'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const Separator = ({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: ComponentProps<typeof Root>) => (
  <Root
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-slate-200 dark:bg-grey-500',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className,
    )}
    {...props}
  />
)
