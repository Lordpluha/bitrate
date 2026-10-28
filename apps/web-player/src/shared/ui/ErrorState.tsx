'use client'

import { ROUTES } from '@shared/routes'
import { TriangleAlert } from 'lucide-react'
import { useI18n } from '@/shared/i18n'
import { StateMessage } from './StateMessage'

export type ErrorStateProps = {
  className?: string
  description?: string
  onRetry?: () => void
  title?: string
}

/** The design's error State/Message: retry when it can help, and always a way back home. */
export const ErrorState = ({
  className,
  description,
  onRetry,
  title,
}: ErrorStateProps) => {
  const { t } = useI18n()

  return (
    <StateMessage
      className={className}
      description={description ?? t('error.description')}
      icon={TriangleAlert}
      primary={
        onRetry ? { label: t('common.tryAgain'), onClick: onRetry } : undefined
      }
      secondary={{ href: ROUTES.main, label: t('common.backToHome') }}
      title={title ?? t('error.title')}
      tone="error"
    />
  )
}
