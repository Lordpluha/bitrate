import { Popover as PopoverPrimitive } from '@base-ui-components/react'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = ({
  ref,
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Popup> &
  Pick<ComponentProps<typeof PopoverPrimitive.Positioner>, 'sideOffset' | 'align'>) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Positioner align={align} sideOffset={sideOffset}>
      <PopoverPrimitive.Popup
        ref={ref}
        className={cn(
          'z-50 w-72 rounded-md border border-slate-200 bg-white p-4 text-slate-950 shadow-md outline-none origin-[--transform-origin] transition-[opacity,scale] data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Positioner>
  </PopoverPrimitive.Portal>
)
PopoverContent.displayName = 'PopoverContent'

export { Popover, PopoverContent, PopoverTrigger }
