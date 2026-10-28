import { ROUTES } from '@shared/routes'
import { CollectionSkeleton, StateMessage } from '@shared/ui'
import { ListMusic, Lock, LogIn, TriangleAlert } from 'lucide-react'
import { ApiRequestError } from '@/shared/api/errors'
import { useI18n } from '@/shared/i18n'

export const PlaylistLoading = () => {
  const { t } = useI18n()

  return <CollectionSkeleton label={t('playlist.loading')} />
}

type PlaylistLoadErrorProps = {
  error: unknown
  onRetry: () => void
}

/** The design's playlist error frames, chosen by the API status. */
export const PlaylistLoadError = ({
  error,
  onRetry,
}: PlaylistLoadErrorProps) => {
  const status = error instanceof ApiRequestError ? error.status : undefined
  const { t } = useI18n()
  const BACK_HOME = { href: ROUTES.main, label: t('common.backToHome') }
  const retry = { label: t('common.tryAgain'), onClick: onRetry }

  if (status === 401) {
    return (
      <StateMessage
        description={t('playlist.sessionExpiredDescription')}
        icon={LogIn}
        primary={{ href: ROUTES.auth.login, label: t('profile.logIn') }}
        secondary={BACK_HOME}
        title={t('playlist.sessionExpired')}
        tone="error"
      />
    )
  }
  if (status === 403) {
    return (
      <StateMessage
        description={t('playlist.privateDescription')}
        icon={Lock}
        primary={retry}
        secondary={BACK_HOME}
        title={t('playlist.private')}
        tone="error"
      />
    )
  }
  if (status === 404) {
    return (
      <StateMessage
        description={t('playlist.notFoundDescription')}
        icon={ListMusic}
        primary={BACK_HOME}
        title={t('playlist.notFound')}
      />
    )
  }
  if (status === 429) {
    return (
      <StateMessage
        description={t('playlist.tooManyDescription')}
        icon={TriangleAlert}
        primary={retry}
        secondary={BACK_HOME}
        title={t('playlist.tooMany')}
        tone="error"
      />
    )
  }

  return (
    <StateMessage
      description={t('error.tryAgainShort')}
      icon={TriangleAlert}
      primary={retry}
      secondary={BACK_HOME}
      title={t('playlist.loadFailed')}
      tone="error"
    />
  )
}
