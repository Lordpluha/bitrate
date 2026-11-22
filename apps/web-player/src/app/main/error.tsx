'use client'

import { type UseReportErrorInput, useReportError } from '@shared/hooks'
import { useI18n } from '@shared/i18n'
import { ErrorState } from '@shared/ui/ErrorState'

export type MainErrorProps = UseReportErrorInput & { reset: () => void }

/** A page that failed to render: the design's error copy, never the exception's text. */
export default function MainError({ error, reset }: MainErrorProps) {
  const { t } = useI18n()
  useReportError({ error })

  return <ErrorState description={t('error.pageDescription')} onRetry={reset} />
}
