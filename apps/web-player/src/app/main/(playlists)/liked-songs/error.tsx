'use client'

import { type UseReportErrorInput, useReportError } from '@shared/hooks'
import { useI18n } from '@shared/i18n'
import { ErrorState } from '@shared/ui'

export type LikedSongsErrorProps = UseReportErrorInput & { reset: () => void }

/** The design's Liked Songs error state, instead of the generic page error. */
export default function LikedSongsError({
  error,
  reset,
}: LikedSongsErrorProps) {
  const { t } = useI18n()
  useReportError({ error })

  return (
    <ErrorState
      description={t('error.tryAgainShort')}
      onRetry={reset}
      title={t('likedSongs.errorTitle')}
    />
  )
}
