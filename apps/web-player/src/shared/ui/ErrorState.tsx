'use client'

import { ROUTES } from '@shared/routes'
import { TriangleAlert } from 'lucide-react'
import { StateMessage } from './StateMessage'

export type ErrorStateProps = {
  description?: string
  onRetry?: () => void
  title?: string
}

/** The design's error State/Message: retry when it can help, and always a way back home. */
export const ErrorState = ({
  description = 'Something went wrong on our side. Try again, or head back home.',
  onRetry,
  title = 'Something went wrong',
}: ErrorStateProps) => (
  <StateMessage
    description={description}
    icon={TriangleAlert}
    primary={onRetry ? { label: 'Try again', onClick: onRetry } : undefined}
    secondary={{ href: ROUTES.main, label: 'Back to home' }}
    title={title}
    tone="error"
  />
)
