import { Separator as SeparatorPrimitive } from '@base-ui/react/separator'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * A decorative separator is `role="none"`, which does not allow the `aria-orientation` the
 * primitive sets, so that attribute is cleared; `data-orientation` still drives styling.
 */
const DECORATIVE_PROPS = { role: 'none', 'aria-orientation': undefined } as const

export const Separator = ({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: ComponentProps<typeof SeparatorPrimitive> & { decorative?: boolean }) => (
  <SeparatorPrimitive
    orientation={orientation}
    className={cn(
      'shrink-0 bg-separator-color',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className,
    )}
    {...props}
    {...(decorative ? DECORATIVE_PROPS : {})}
  />
)
