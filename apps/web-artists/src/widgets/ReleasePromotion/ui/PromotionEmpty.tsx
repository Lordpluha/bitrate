import type { LucideIcon } from 'lucide-react'
import { type ReactNode, useId } from 'react'

interface PromotionEmptyProps {
  icon: LucideIcon
  title: string
  description: string
  /** The one action that moves the artist on, if there is one. */
  action?: ReactNode
  tone?: 'error'
}

/** A promotion state without a plan to show: no profile, no date, failed, not available. */
export function PromotionEmpty({
  icon: Icon,
  title,
  description,
  action,
  tone,
}: PromotionEmptyProps) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className="artist-release-workspace-panel artist-release-empty-stage"
      data-tone={tone}
      role={tone === 'error' ? 'alert' : undefined}
    >
      <Icon aria-hidden="true" />
      <h2 id={id}>{title}</h2>
      <p>{description}</p>
      {action}
    </section>
  )
}
