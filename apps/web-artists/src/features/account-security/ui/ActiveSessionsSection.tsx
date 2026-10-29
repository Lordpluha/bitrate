import { Button, cn } from '@bitrate/ui-react'
import {
  type ArtistSession,
  describeSessionDevice,
  useArtistSessions,
  useRevokeOtherSessions,
  useRevokeSession,
} from '@entities/artist-account'
import { useI18n } from '@shared/i18n'
import { Laptop, Smartphone } from 'lucide-react'

const usedFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

interface ActiveSessionsSectionProps {
  artistId: string
}

const MOBILE = /Android|iPhone|iPad|iPod/

function lastSeen(session: ArtistSession) {
  if (session.current) return 'This device · active now'
  const at = session.lastUsedAt ?? session.createdAt
  return `${session.lastUsedAt ? 'Last active' : 'Signed in'} ${usedFormat.format(new Date(at))}`
}

/** Signed-in devices, with sign-out for each other device and for all of them at once. */
export function ActiveSessionsSection({
  artistId,
}: ActiveSessionsSectionProps) {
  const { tMessage } = useI18n()
  const sessions = useArtistSessions(artistId)
  const revoke = useRevokeSession(artistId)
  const revokeOthers = useRevokeOtherSessions(artistId)
  const others =
    sessions.data?.filter((session) => !session.current).length ?? 0
  const busy = revoke.isPending || revokeOthers.isPending

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Signed-in devices</p>
          <p className="text-sm text-text-secondary">
            {revokeOthers.isSuccess
              ? `Signed out ${revokeOthers.data} ${revokeOthers.data === 1 ? 'device' : 'devices'}.`
              : 'Sign out anywhere you no longer use or do not recognise.'}
          </p>
        </div>
        {others > 0 && (
          <Button
            disabled={busy}
            onClick={() => revokeOthers.mutate()}
            size="sm"
            variant="outline"
          >
            {revokeOthers.isPending ? 'Signing out…' : 'Sign out other devices'}
          </Button>
        )}
      </div>
      {sessions.isPending ? (
        <p className="text-sm" role="status">
          Loading devices…
        </p>
      ) : sessions.isError ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-destructive" role="alert">
            {tMessage(sessions.error.message)}
          </p>
          <Button
            onClick={() => {
              void sessions.refetch()
            }}
            size="sm"
            variant="outline"
          >
            Try again
          </Button>
        </div>
      ) : (
        <ul aria-busy={busy} className="divide-y divide-border">
          {sessions.data.map((session) => {
            const Icon = MOBILE.test(session.userAgent ?? '')
              ? Smartphone
              : Laptop
            return (
              <li className="flex items-center gap-3 py-3" key={session.id}>
                <Icon
                  aria-hidden="true"
                  className={cn(
                    'size-5 shrink-0',
                    session.current ? 'text-accent' : 'text-text-secondary',
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {describeSessionDevice(session.userAgent)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {lastSeen(session)}
                  </p>
                </div>
                {!session.current && (
                  <Button
                    aria-label={`Sign out ${describeSessionDevice(session.userAgent)}`}
                    disabled={busy}
                    onClick={() => revoke.mutate(session.id)}
                    size="sm"
                    variant="ghost"
                  >
                    Sign out
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {(revoke.error ?? revokeOthers.error) && (
        <p className="text-sm text-destructive" role="alert">
          {(revoke.error ?? revokeOthers.error)?.message}
        </p>
      )}
    </div>
  )
}
