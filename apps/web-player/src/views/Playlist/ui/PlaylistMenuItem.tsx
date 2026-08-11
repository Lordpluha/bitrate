import type { ReactNode } from 'react'

type PlaylistMenuItemProps = {
  disabled?: boolean
  icon: ReactNode
  label: string
  onClick?: () => void
}

export const PlaylistMenuItem = ({
  disabled = false,
  icon,
  label,
  onClick,
}: PlaylistMenuItemProps) => (
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
