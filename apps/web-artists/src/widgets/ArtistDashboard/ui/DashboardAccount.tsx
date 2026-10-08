import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  cn,
} from '@bitrate/ui-react'
import type { ArtistIdentity } from '@shared/auth/artistSession.types'
import { useAuthContext } from '@shared/hooks'
import { LogOut } from 'lucide-react'

interface DashboardAccountProps {
  artist: ArtistIdentity
  compact?: boolean
}

export function DashboardAccount({
  artist,
  compact = false,
}: DashboardAccountProps) {
  const { logout, isLoggingOut, logoutError } = useAuthContext()

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar
          aria-label={artist.username}
          className="size-9 shrink-0"
          role="img"
        >
          {artist.avatar && <AvatarImage alt="" src={artist.avatar} />}
          <AvatarFallback>
            {artist.username.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className={cn('min-w-0 flex-1', compact && 'hidden lg:block')}>
          <p
            className="max-w-64 truncate text-sm font-semibold"
            title={artist.username}
          >
            {artist.username}
          </p>
          <p className="text-xs text-text-secondary lg:hidden">
            Artist account
          </p>
        </div>
        <Button
          aria-label="Sign out"
          className="shrink-0"
          disabled={isLoggingOut}
          onClick={logout}
          size="icon"
          variant="ghost"
        >
          <LogOut aria-hidden="true" className="size-5" />
        </Button>
      </div>
      {logoutError && (
        <p className="mt-2 text-sm text-error" role="alert">
          {logoutError}
        </p>
      )}
    </div>
  )
}
