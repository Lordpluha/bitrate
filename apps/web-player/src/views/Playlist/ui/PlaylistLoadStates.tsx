import { ApiRequestError } from '@/shared/api/errors'

export const PlaylistLoading = () => (
  <div
    aria-label="Loading playlist"
    className="flex min-h-96 items-center justify-center px-6 text-text-subdued"
    role="status"
  >
    Loading playlist...
  </div>
)

type PlaylistLoadErrorProps = {
  error: unknown
  onRetry: () => void
}

const getPlaylistErrorContent = (status?: number) => {
  if (status === 401) {
    return {
      description: 'Please log in again to continue.',
      title: 'Your session has expired',
    }
  }
  if (status === 403) {
    return {
      description: 'You do not have permission to view this playlist.',
      title: 'Playlist is private',
    }
  }
  if (status === 404) {
    return {
      description: 'This playlist may have been deleted or is unavailable.',
      title: 'Playlist not found',
    }
  }
  if (status === 429) {
    return {
      description: 'Wait a few seconds, then try opening the playlist again.',
      title: 'Too many playlist requests',
    }
  }

  return {
    description: 'The playlist service is temporarily unavailable.',
    title: 'Unable to load playlist',
  }
}

export const PlaylistLoadError = ({
  error,
  onRetry,
}: PlaylistLoadErrorProps) => {
  const status = error instanceof ApiRequestError ? error.status : undefined
  const content = getPlaylistErrorContent(status)
  const canRetry = status !== 401 && status !== 403 && status !== 404

  return (
    <div className="flex min-h-96 flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-3xl font-bold text-text">{content.title}</h1>
      <p className="max-w-110 text-sm text-text-subdued">
        {content.description}
      </p>
      {canRetry && (
        <button
          className="mt-2 rounded-full bg-text px-5 py-2 text-sm font-bold text-text-contrast transition-transform hover:scale-105"
          onClick={onRetry}
          type="button"
        >
          Try again
        </button>
      )}
    </div>
  )
}
