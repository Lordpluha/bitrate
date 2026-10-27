'use client'

import { useI18n } from '@shared/i18n'
import { ErrorState } from '@shared/ui'

/** The design's Liked Songs error state, instead of the generic page error. */
export default function LikedSongsError({ reset }: { reset: () => void }) {
  const { t } = useI18n()

  return (
    <ErrorState
      description={t('error.tryAgainShort')}
      onRetry={reset}
      title={t('likedSongs.errorTitle')}
    />
  )
}
