const DAY_MS = 86_400_000

/** The step's date: the release date moved by the offset, so the plan follows the release. */
export const stepDate = (scheduledAt: Date, offsetDays: number) =>
  new Date(scheduledAt.getTime() + offsetDays * DAY_MS)
