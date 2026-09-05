import { PreviewCard as HoverCardPrimitive } from '@base-ui-components/react'
import { type ComponentProps, isValidElement } from 'react'

import { cn } from '@/lib/utils'

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = ({
  asChild = false,
  children,
  ...props
}: ComponentProps<typeof HoverCardPrimitive.Trigger> & {
  asChild?: boolean
}) => {
  if (asChild) {
    if (!isValidElement<Record<string, unknown>>(children)) {
      throw new Error('HoverCardTrigger with asChild requires a single React element')
    }

    return <HoverCardPrimitive.Trigger {...props} render={children} />
  }

  return <HoverCardPrimitive.Trigger {...props}>{children}</HoverCardPrimitive.Trigger>
}

const HoverCardContent = ({
  ref,
  className,
  align = 'center',
  side = 'top',
  sideOffset = 8,
  ...props
}: ComponentProps<typeof HoverCardPrimitive.Popup> &
  Pick<ComponentProps<typeof HoverCardPrimitive.Positioner>, 'align' | 'side' | 'sideOffset'>) => (
  <HoverCardPrimitive.Portal>
    <HoverCardPrimitive.Positioner
      align={align}
      className="z-50"
      side={side}
      sideOffset={sideOffset}
    >
      <HoverCardPrimitive.Popup
        ref={ref}
        className={cn(
          'w-64 origin-[--transform-origin] rounded-md border border-overlay-border bg-overlay-hover-card-surface p-3 text-overlay-hover-card-foreground shadow-xl outline-none transition-[opacity,transform] data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Positioner>
  </HoverCardPrimitive.Portal>
)

HoverCardContent.displayName = 'HoverCardContent'

export { HoverCard, HoverCardContent, HoverCardTrigger }
