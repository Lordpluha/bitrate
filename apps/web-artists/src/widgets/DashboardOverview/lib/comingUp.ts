import type { ArtistDashboard } from '@entities/dashboard'
import type { TranslationKey } from '@shared/i18n'

const LIMIT = 4

export interface ComingUpItem {
  key: string
  at: string
  /** Catalog key; render it with `t()`. */
  title: TranslationKey
  detail: string
  releaseId: string
}

/** Planned release dates across the catalogue, soonest first. */
export function comingUp(
  upcoming: ArtistDashboard['upcoming'],
): ComingUpItem[] {
  return upcoming
    .map(
      (release): ComingUpItem => ({
        key: `release-${release.id}`,
        at: release.scheduledAt,
        title: 'dashboard.upcoming.plannedDate',
        detail: release.title,
        releaseId: release.id,
      }),
    )
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
    .slice(0, LIMIT)
}
