import { Avatar, AvatarFallback, AvatarImage, cn } from '@bitrate/ui-react'
import { useWorkspaceActions } from '@features/workspace-actions'
import type { ArtistIdentity } from '@shared/auth/artistSession.types'
import { ChevronsUpDown, UserRound } from 'lucide-react'

export function DashboardAccountMenu({
  artist,
  compact = false,
  onOpen,
}: {
  artist: ArtistIdentity
  compact?: boolean
  onOpen?: () => void
}) {
  const { openAction } = useWorkspaceActions()
  return (
    <button
      aria-label="Artist account menu"
      className={cn(
        'artist-workspace-account flex min-h-15 w-full items-center gap-3 rounded-lg bg-artist-account-surface p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        compact && 'justify-center px-1',
      )}
      onClick={() => {
        onOpen?.()
        openAction('account')
      }}
      type="button"
    >
      <Avatar
        aria-label={artist.username}
        className="size-9 shrink-0"
        role="img"
      >
        {artist.avatar && <AvatarImage alt="" src={artist.avatar} />}
        <AvatarFallback className="artist-workspace-avatar">
          <UserRound aria-hidden="true" className="size-5" />
        </AvatarFallback>
      </Avatar>
      {!compact && (
        <>
          <span className="min-w-0 flex-1">
            <span
              className="block truncate text-[0.8125rem]"
              title={artist.username}
            >
              {artist.username}
            </span>
            <span className="mt-1 block text-[0.6875rem] text-text-secondary">
              Artist account
            </span>
          </span>
          <ChevronsUpDown
            aria-hidden="true"
            className="size-4 shrink-0 text-text-secondary"
          />
        </>
      )}
    </button>
  )
}
