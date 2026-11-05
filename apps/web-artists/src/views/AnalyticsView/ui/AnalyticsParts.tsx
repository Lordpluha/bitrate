import { changeLabel } from '@entities/analytics'
import { useI18n } from '@shared/i18n'
import { PanelIcon } from '@shared/ui'
import {
  ArrowDownRight,
  ArrowUpRight,
  type LucideIcon,
  Minus,
} from 'lucide-react'
import type { ReactNode } from 'react'

/** The change against the previous period: arrow and words, never colour alone. */
export function Change({
  current,
  previous,
}: {
  current: number
  previous: number
}) {
  const { t } = useI18n()
  const trend = current > previous ? 'up' : current < previous ? 'down' : 'flat'
  const Icon =
    trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus
  return (
    <span className="artist-analytics-change" data-trend={trend}>
      <Icon aria-hidden="true" />
      {changeLabel(current, previous, t)}
    </span>
  )
}

export function StatTile({
  icon,
  label,
  hue,
  children,
}: {
  icon: LucideIcon
  label: string
  hue: 'blue' | 'purple' | 'amber'
  children: ReactNode
}) {
  return (
    <div
      className="artist-release-workspace-panel artist-analytics-stat"
      data-hue={hue}
    >
      <p className="artist-analytics-label">
        <PanelIcon icon={icon} />
        {label}
      </p>
      {children}
    </div>
  )
}
