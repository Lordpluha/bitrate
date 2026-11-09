'use client'

import { useI18n } from '@shared/i18n'
import { ErrorState } from '@shared/ui'

/** The page's own error frame: its title and the design's copy, never the exception's text. */
export default function RecentsError({ reset }: { reset: () => void }) {
  const { t } = useI18n()

  return (
    <ErrorState
      description={t('error.tryAgainShort')}
      onRetry={reset}
      title={t('recents.loadFailed')}
    />
  )
}
