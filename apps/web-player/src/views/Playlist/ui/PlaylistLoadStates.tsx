import { ROUTES } from '@shared/routes'
import { CollectionSkeleton, StateMessage } from '@shared/ui'
import { Music, TriangleAlert } from 'lucide-react'
import { ApiRequestError } from '@/shared/api/errors'

export const PlaylistLoading = () => (
  <CollectionSkeleton label="Loading playlist" />
)

type PlaylistLoadErrorProps = {
  error: unknown
  onRetry: () => void
}

const BACK_HOME = { href: ROUTES.main, label: 'Back to home' }

/** The design's playlist error frames, chosen by the API status. */
export const PlaylistLoadError = ({
  error,
  onRetry,
}: PlaylistLoadErrorProps) => {
  const status = error instanceof ApiRequestError ? error.status : undefined
  const retry = { label: 'Try again', onClick: onRetry }

  if (status === 401) {
    return (
      <StateMessage
        description="Log in again to keep listening."
        icon={TriangleAlert}
        primary={{ href: ROUTES.auth.login, label: 'Log in' }}
        secondary={BACK_HOME}
        title="Your session has expired"
        tone="error"
      />
    )
  }
  if (status === 403) {
    return (
      <StateMessage
        description="Only its owner and collaborators can open it."
        icon={TriangleAlert}
        primary={retry}
        secondary={BACK_HOME}
        title="Playlist is private"
        tone="error"
      />
    )
  }
  if (status === 404) {
    return (
      <StateMessage
        description="This playlist may have been removed, or the link is incorrect."
        icon={Music}
        primary={BACK_HOME}
        title="Playlist not found"
      />
    )
  }
  if (status === 429) {
    return (
      <StateMessage
        description="Wait a few seconds, then try opening the playlist again."
        icon={TriangleAlert}
        primary={retry}
        secondary={BACK_HOME}
        title="Too many playlist requests"
        tone="error"
      />
    )
  }

  return (
    <StateMessage
      description="Something went wrong on our side. Try again."
      icon={TriangleAlert}
      primary={retry}
      secondary={BACK_HOME}
      title="Unable to load playlist"
      tone="error"
    />
  )
}
