import type { ArtistDashboard } from '@entities/dashboard'
import type { TranslationKey } from '@shared/i18n'

export interface CatalogueShare {
  key: 'live' | 'review' | 'drafts' | 'other'
  count: number
  label: TranslationKey
}

/** Where the releases stand, largest groups named first; empty groups are left out. */
export function catalogueShare(
  counts: ArtistDashboard['counts'],
): CatalogueShare[] {
  const named = counts.released + counts.inReview + counts.drafts
  const shares: CatalogueShare[] = [
    { key: 'live', count: counts.released, label: 'dashboard.numbers.live' },
    {
      key: 'review',
      count: counts.inReview,
      label: 'dashboard.numbers.review',
    },
    { key: 'drafts', count: counts.drafts, label: 'dashboard.numbers.drafts' },
    {
      key: 'other',
      count: Math.max(0, counts.releases - named),
      label: 'dashboard.numbers.other',
    },
  ]
  return shares.filter((share) => share.count > 0)
}
