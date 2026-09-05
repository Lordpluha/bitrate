import { Select as SelectPrimitive } from '@base-ui-components/react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = ({
  placeholder,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Value> & { placeholder?: string }) => (
  <SelectPrimitive.Value {...props}>
    {placeholder != null
      ? (value: unknown) =>
          value == null ? placeholder : ((children as string | undefined) ?? String(value))
      : children}
  </SelectPrimitive.Value>
)
SelectValue.displayName = 'SelectValue'

const SelectTrigger = ({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) => (
  <SelectPrimitive.Trigger
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-overlay-trigger-border bg-overlay-trigger-surface px-3 py-2 text-sm ring-offset-background data-placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </SelectPrimitive.Trigger>
)
SelectTrigger.displayName = 'SelectTrigger'

const SelectScrollUpButton = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) => (
  <SelectPrimitive.ScrollUpArrow
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpArrow>
)
SelectScrollUpButton.displayName = 'SelectScrollUpButton'

const SelectScrollDownButton = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) => (
  <SelectPrimitive.ScrollDownArrow
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownArrow>
)
SelectScrollDownButton.displayName = 'SelectScrollDownButton'

const SelectContent = ({
  ref,
  className,
  children,
  position = 'popper',
  sideOffset = 4,
  ...props
}: ComponentProps<typeof SelectPrimitive.Popup> &
  Pick<ComponentProps<typeof SelectPrimitive.Positioner>, 'sideOffset'> & {
    position?: 'popper' | 'item-aligned'
  }) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Positioner
      sideOffset={sideOffset}
      style={position === 'popper' ? { width: 'var(--anchor-width)' } : undefined}
    >
      <SelectPrimitive.Popup
        ref={ref}
        className={cn(
          'relative z-50 max-h-(--available-height) min-w-32 overflow-y-auto overflow-x-hidden rounded-md border border-overlay-border bg-overlay-surface text-overlay-foreground shadow-md origin-[--transform-origin] transition-[opacity,scale] data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95',
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.List className="p-1">{children}</SelectPrimitive.List>
        <SelectScrollDownButton />
      </SelectPrimitive.Popup>
    </SelectPrimitive.Positioner>
  </SelectPrimitive.Portal>
)
SelectContent.displayName = 'SelectContent'

const SelectLabel = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.GroupLabel>) => (
  <SelectPrimitive.GroupLabel
    className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
    {...props}
  />
)
SelectLabel.displayName = 'SelectLabel'

const SelectItem = ({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-overlay-item-hover focus:text-overlay-item-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
)
SelectItem.displayName = 'SelectItem'

const SelectSeparator = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Separator>) => (
  <SelectPrimitive.Separator
    className={cn('-mx-1 my-1 h-px bg-overlay-item-hover', className)}
    {...props}
  />
)
SelectSeparator.displayName = 'SelectSeparator'

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
