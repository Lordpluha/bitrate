import { Menu } from '@base-ui-components/react'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { type ComponentProps, isValidElement } from 'react'

import { cn } from '@/lib/utils'

const POPUP_CLS =
  'z-50 min-w-32 overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md origin-[--transform-origin] transition-[opacity,scale] data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50'

const DropdownMenu = Menu.Root

const DropdownMenuTrigger = ({
  asChild = false,
  children,
  ...props
}: ComponentProps<typeof Menu.Trigger> & { asChild?: boolean }) => {
  if (asChild) {
    if (!isValidElement<Record<string, unknown>>(children)) {
      throw new Error('DropdownMenuTrigger with asChild requires a single React element')
    }
    return <Menu.Trigger {...props} render={children} />
  }

  return <Menu.Trigger {...props}>{children}</Menu.Trigger>
}

const DropdownMenuGroup = Menu.Group

const DropdownMenuPortal = Menu.Portal

const DropdownMenuSub = Menu.SubmenuRoot

const DropdownMenuRadioGroup = Menu.RadioGroup

const DropdownMenuSubTrigger = ({
  className,
  inset,
  children,
  ...props
}: ComponentProps<typeof Menu.SubmenuTrigger> & { inset?: boolean }) => (
  <Menu.SubmenuTrigger
    className={cn(
      'flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-slate-100 data-popup-open:bg-slate-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:focus:bg-slate-800 dark:data-popup-open:bg-slate-800',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </Menu.SubmenuTrigger>
)
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger'

const DropdownMenuSubContent = ({
  ref,
  className,
  ...props
}: ComponentProps<typeof Menu.Popup>) => (
  <Menu.Portal>
    <Menu.Positioner side="right" align="start">
      <Menu.Popup ref={ref} className={cn('shadow-lg', POPUP_CLS, className)} {...props} />
    </Menu.Positioner>
  </Menu.Portal>
)
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent'

const DropdownMenuContent = ({
  ref,
  className,
  sideOffset = 4,
  align = 'center',
  ...props
}: ComponentProps<typeof Menu.Popup> &
  Pick<ComponentProps<typeof Menu.Positioner>, 'sideOffset' | 'align'>) => (
  <Menu.Portal>
    <Menu.Positioner align={align} sideOffset={sideOffset}>
      <Menu.Popup
        ref={ref}
        className={cn(
          'max-h-(--available-height) overflow-y-auto overflow-x-hidden',
          POPUP_CLS,
          className,
        )}
        {...props}
      />
    </Menu.Positioner>
  </Menu.Portal>
)
DropdownMenuContent.displayName = 'DropdownMenuContent'

const DropdownMenuItem = ({
  className,
  inset,
  ...props
}: ComponentProps<typeof Menu.Item> & { inset?: boolean }) => (
  <Menu.Item
    className={cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-slate-100 focus:text-slate-900 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:focus:bg-slate-800 dark:focus:text-slate-50',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
)
DropdownMenuItem.displayName = 'DropdownMenuItem'

const DropdownMenuCheckboxItem = ({
  className,
  children,
  checked,
  ...props
}: ComponentProps<typeof Menu.CheckboxItem>) => (
  <Menu.CheckboxItem
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-slate-100 focus:text-slate-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-slate-800 dark:focus:text-slate-50',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Menu.CheckboxItemIndicator>
        <Check className="h-4 w-4" />
      </Menu.CheckboxItemIndicator>
    </span>
    {children}
  </Menu.CheckboxItem>
)
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem'

const DropdownMenuRadioItem = ({
  className,
  children,
  ...props
}: ComponentProps<typeof Menu.RadioItem>) => (
  <Menu.RadioItem
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-slate-100 focus:text-slate-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-slate-800 dark:focus:text-slate-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Menu.RadioItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </Menu.RadioItemIndicator>
    </span>
    {children}
  </Menu.RadioItem>
)
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem'

const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: ComponentProps<'div'> & { inset?: boolean }) => (
  <div className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)} {...props} />
)
DropdownMenuLabel.displayName = 'DropdownMenuLabel'

const DropdownMenuSeparator = ({ className, ...props }: ComponentProps<typeof Menu.Separator>) => (
  <Menu.Separator
    className={cn('-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800', className)}
    {...props}
  />
)
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

const DropdownMenuShortcut = ({ className, ...props }: ComponentProps<'span'>) => (
  <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />
)
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
}
