import { Tooltip as TooltipPrimitive } from '@base-ui-components/react'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = ({
  ref,
  className,
  sideOffset = 4,
  side = 'top',
  ...props
}: ComponentProps<typeof TooltipPrimitive.Popup> &
  Pick<ComponentProps<typeof TooltipPrimitive.Positioner>, 'sideOffset' | 'side'>) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset}>
      <TooltipPrimitive.Popup
        ref={ref}
        className={cn(
          'z-50 overflow-hidden rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-950 shadow-md origin-[--transform-origin] transition-[opacity,scale] data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Positioner>
  </TooltipPrimitive.Portal>
)
TooltipContent.displayName = 'TooltipContent'

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
