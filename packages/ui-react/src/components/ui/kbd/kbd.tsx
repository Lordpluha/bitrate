import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'bg-kbd-surface text-kbd-foreground pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium',
        "[&_svg:not([class*='size-'])]:size-3",
        '[[data-slot=tooltip-content]_&]:bg-kbd-on-overlay-foreground/15 [[data-slot=tooltip-content]_&]:text-kbd-on-overlay-foreground',
        className,
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
