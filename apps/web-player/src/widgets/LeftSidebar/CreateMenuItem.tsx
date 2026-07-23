import type { ReactNode } from 'react'

type CreateMenuItemProps = {
  description: string
  disabled?: boolean
  icon: ReactNode
  onClick?: () => void
  title: string
}

export const CreateMenuItem = ({
  description,
  disabled = false,
  icon,
  onClick,
  title,
}: CreateMenuItemProps) => (
  <button
    className="grid w-full grid-cols-[48px_minmax(0,1fr)] items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-55"
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-text-subdued">
      {icon}
    </span>
    <span className="min-w-0">
      <span className="block font-bold text-text">{title}</span>
      <span className="block truncate text-sm text-text-subdued">
        {description}
      </span>
    </span>
  </button>
)
