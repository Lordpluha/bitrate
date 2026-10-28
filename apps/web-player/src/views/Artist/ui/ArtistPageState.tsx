'use client'

import { ROUTES } from '@shared/routes'
import { Skeleton, StateMessage, TrackRowSkeleton } from '@shared/ui'
import { MicVocal, TriangleAlert } from 'lucide-react'
import { ApiRequestError } from '@/shared/api/errors'
import { useI18n } from '@/shared/i18n'

export type ArtistPageStateProps =
  | { variant: 'loading' }
  | { variant: 'not-found' }
  | { error: unknown; onRetry: () => void; variant: 'error' }

const ROW_KEYS = Array.from({ length: 5 }, (_, row) => `artist-row-${row}`)

/** The design's artist loading, error and not-found frames. */
export const ArtistPageState = (props: ArtistPageStateProps) => {
  const { t } = useI18n()

  if (props.variant === 'loading') {
    return (
      <div
        aria-label={t('artist.loading')}
        className="flex h-full flex-col gap-7 overflow-hidden px-4 pt-2 md:px-8 md:py-6"
        role="status"
      >
        <span className="sr-only">{t('artist.loading')}</span>
        <Skeleton className="h-65 rounded-[14px] md:h-80 md:rounded-2xl" />
        <div className="flex items-center gap-4.5">
          <Skeleton className="size-14 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <div className="flex flex-col gap-1">
          {ROW_KEYS.map((key) => (
            <TrackRowSkeleton key={key} />
          ))}
        </div>
      </div>
    )
  }

  const isNotFound =
    props.variant === 'not-found' ||
    (props.variant === 'error' &&
      props.error instanceof ApiRequestError &&
      props.error.status === 404)

  return (
    <div className="flex h-full flex-1 flex-col px-4 md:px-8">
      {isNotFound ? (
        <StateMessage
          description={t('artist.notFoundDescription')}
          icon={MicVocal}
          primary={{ href: ROUTES.main, label: t('common.backToHome') }}
          title={t('artist.notFound')}
        />
      ) : (
        <StateMessage
          description={t('common.tryAgainSoon')}
          icon={TriangleAlert}
          primary={
            props.variant === 'error'
              ? { label: t('common.tryAgain'), onClick: props.onRetry }
              : undefined
          }
          secondary={{ href: ROUTES.main, label: t('common.backToHome') }}
          title={t('artist.catalogueFailed')}
          tone="error"
        />
      )}
    </div>
  )
}
