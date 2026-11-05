import type { ArtistDashboard } from '@entities/dashboard'

export const COMING_UP_LIMIT = 4

type UpcomingRelease = ArtistDashboard['upcoming'][number]

export interface ComingUpItem {
  key: string
  at: string
  title: string
  status: UpcomingRelease['status']
  cover: UpcomingRelease['cover']
  releaseId: string
}

/** Planned release dates across the catalogue, soonest first. */
export function comingUp(upcoming: UpcomingRelease[]): ComingUpItem[] {
  return upcoming
    .map(
      (release): ComingUpItem => ({
        key: `release-${release.id}`,
        at: release.scheduledAt,
        title: release.title,
        status: release.status,
        cover: release.cover,
        releaseId: release.id,
      }),
    )
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
    .slice(0, COMING_UP_LIMIT)
}

/** The releases sharing the soonest moment still ahead of `now`; expects `comingUp` order. */
export function nextPremieres(
  items: ComingUpItem[],
  now: number,
): ComingUpItem[] {
  const soonest = items.find((item) => Date.parse(item.at) > now)
  if (!soonest) return []
  const moment = Date.parse(soonest.at)
  return items.filter((item) => Date.parse(item.at) === moment)
}
