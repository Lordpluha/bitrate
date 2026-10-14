import type { ReactNode } from 'react'

type MenuItemProps = {
  disabled?: boolean
  icon: ReactNode
  label: string
  onClick?: () => void
}

/** One row of a popover menu (`role="menuitem"`). */
export const MenuItem = ({
  disabled = false,
  icon,
  label,
  onClick,
}: MenuItemProps) => (
  <button
    className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-text-subdued transition-colors hover:bg-white/10 hover:text-text disabled:cursor-not-allowed disabled:opacity-45"
    disabled={disabled}
    onClick={onClick}
    role="menuitem"
    type="button"
  >
    {icon}
    <span>{label}</span>
  </button>
)
