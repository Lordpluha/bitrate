'use client'

import { useI18n } from '@shared/i18n'
import { ErrorState } from '@shared/ui/ErrorState'

/** A page that failed to render: the design's error copy, never the exception's text. */
export default function MainError({ reset }: { reset: () => void }) {
  const { t } = useI18n()

  return <ErrorState description={t('error.pageDescription')} onRetry={reset} />
}
