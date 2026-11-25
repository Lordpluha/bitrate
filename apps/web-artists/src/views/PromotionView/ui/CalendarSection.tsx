import {
  type CalendarEntry,
  channelNames,
  kindLabels,
  StepStateChip,
} from '@entities/promotion'
import { useI18n } from '@shared/i18n'
import { PanelIcon } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { useId } from 'react'

interface CalendarSectionProps {
  title: string
  icon: LucideIcon
  entries: readonly CalendarEntry[]
}

/** A dated list of plan steps; each row opens the release's Promotion stage. */
export function CalendarSection({
  title,
  icon,
  entries,
}: CalendarSectionProps) {
  const { t, locale } = useI18n()
  const id = useId()
  if (entries.length === 0) return null
  const month = new Intl.DateTimeFormat(locale, {
    month: 'short',
    timeZone: 'UTC',
  })
  const day = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    timeZone: 'UTC',
  })
  return (
    <section aria-labelledby={id} className="artist-release-workspace-panel">
      <h2 id={id}>
        <PanelIcon icon={icon} />
        {title}
      </h2>
      <ul className="artist-release-rows">
        {entries.map((entry) => {
          const due = new Date(entry.dueAt)
          const channels = entry.channels.map((c) => channelNames[c]).join(', ')
          return (
            <li key={entry.stepId}>
              <span aria-hidden="true" className="artist-promotion-date">
                {month.format(due)}
                <strong>{day.format(due)}</strong>
              </span>
              <span className="min-w-0">
                <Link
                  className="artist-release-row-title hover:underline"
                  params={{ releaseId: entry.releaseId }}
                  to="/dashboard/music/$releaseId"
                >
                  {entry.title} — {entry.releaseTitle}
                </Link>
                <span>
                  {t(kindLabels[entry.kind])}
                  {channels && ` · ${channels}`}
                </span>
              </span>
              <StepStateChip state={entry.state} />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
