import type { ListeningHistoryEntry } from '@entities/History'

type GroupHistoryLabels = {
  today: string
  yesterday: string
}

const getDayLabel = (
  value: string,
  formatter: Intl.DateTimeFormat,
  labels: GroupHistoryLabels,
) => {
  const date = new Date(value)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return labels.today
  if (date.toDateString() === yesterday.toDateString()) return labels.yesterday
  return formatter.format(date)
}

export const groupListeningHistory = (
  entries: ListeningHistoryEntry[],
  locale: string,
  labels: GroupHistoryLabels,
) => {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  })

  return entries.reduce<Record<string, ListeningHistoryEntry[]>>(
    (groups, entry) => {
      const label = getDayLabel(entry.listenedAt, formatter, labels)
      groups[label] = [...(groups[label] ?? []), entry]
      return groups
    },
    {},
  )
}
