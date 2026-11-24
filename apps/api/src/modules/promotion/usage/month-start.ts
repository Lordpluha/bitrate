/** First instant of the calendar month (UTC) that contains `now`; quotas reset there. */
export const monthStart = (now: Date) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
