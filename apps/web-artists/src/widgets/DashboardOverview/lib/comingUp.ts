import type { ArtistDashboard } from '@entities/dashboard'

const LIMIT = 4

export interface ComingUpItem {
  key: string
  at: string
  title: string
  detail: string
  releaseId: string
}

/** Planned release dates across the catalogue, soonest first. */
export function comingUp(
  upcoming: ArtistDashboard['upcoming'],
): ComingUpItem[] {
  return upcoming
    .map((release) => ({
      key: `release-${release.id}`,
      at: release.scheduledAt,
      title: 'Planned release date',
      detail: release.title,
      releaseId: release.id,
    }))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
    .slice(0, LIMIT)
}
