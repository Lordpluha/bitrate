import type { LucideIcon } from 'lucide-react'

/** The small accent-coloured icon in front of a panel heading. */
export function PanelIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span aria-hidden="true" className="artist-heading-icon">
      <Icon />
    </span>
  )
}
