import type { ReactNode } from 'react'

type MenuItemProps = {
  disabled?: boolean
  icon: ReactNode
  label: string
  onClick?: () => void
}

/** The look of every menu row: menus, the track context menu, the profile menu. */
export const menuItemClassName =
  'flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:shrink-0 [&_svg]:text-muted-foreground'

/** The panel every menu opens in. */
export const menuPanelClassName =
  'rounded-md border border-border bg-popover p-1 text-sm text-foreground shadow-2xl'

/** One row of a popover menu (`role="menuitem"`). */
export const MenuItem = ({
  disabled = false,
  icon,
  label,
  onClick,
}: MenuItemProps) => (
  <button
    className={menuItemClassName}
    disabled={disabled}
    onClick={onClick}
    role="menuitem"
    type="button"
  >
    {icon}
    <span>{label}</span>
  </button>
)
