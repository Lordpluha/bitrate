import type { CalendarEntry } from '@entities/promotion'

const DAY_MS = 86_400_000

export interface CalendarGroups {
  earlier: CalendarEntry[]
  thisWeek: CalendarEntry[]
  later: CalendarEntry[]
}

/** Splits the (soonest-first) calendar at the start of today and seven days on, in UTC. */
export function groupCalendar(
  entries: readonly CalendarEntry[],
  now: Date,
): CalendarGroups {
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  )
  const weekEnd = today + 7 * DAY_MS
  const groups: CalendarGroups = { earlier: [], thisWeek: [], later: [] }
  for (const entry of entries) {
    const due = Date.parse(entry.dueAt)
    if (due < today) groups.earlier.push(entry)
    else if (due < weekEnd) groups.thisWeek.push(entry)
    else groups.later.push(entry)
  }
  return groups
}

/** One row per release with a plan in the window, with its step count. */
export function activePlans(entries: readonly CalendarEntry[]) {
  const plans = new Map<
    string,
    { releaseId: string; title: string; steps: number }
  >()
  for (const entry of entries) {
    const plan = plans.get(entry.releaseId)
    if (plan) plan.steps += 1
    else
      plans.set(entry.releaseId, {
        releaseId: entry.releaseId,
        title: entry.releaseTitle,
        steps: 1,
      })
  }
  return [...plans.values()]
}
