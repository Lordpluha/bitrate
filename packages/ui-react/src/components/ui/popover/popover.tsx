import { Popover as PopoverPrimitive } from '@base-ui-components/react'
import { type ComponentProps, isValidElement } from 'react'

import { cn } from '@/lib/utils'

const Popover = PopoverPrimitive.Root

const PopoverTrigger = ({
  asChild = false,
  children,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Trigger> & { asChild?: boolean }) => {
  if (asChild) {
    if (!isValidElement<Record<string, unknown>>(children)) {
      throw new Error('PopoverTrigger with asChild requires a single React element')
    }
    return <PopoverPrimitive.Trigger {...props} render={children} />
  }

  return <PopoverPrimitive.Trigger {...props}>{children}</PopoverPrimitive.Trigger>
}

const PopoverContent = ({
  ref,
  className,
  positionerClassName,
  align = 'center',
  sideOffset = 4,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Popup> &
  Pick<ComponentProps<typeof PopoverPrimitive.Positioner>, 'sideOffset' | 'align'> & {
    positionerClassName?: string
  }) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Positioner
      align={align}
      className={positionerClassName}
      sideOffset={sideOffset}
    >
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
