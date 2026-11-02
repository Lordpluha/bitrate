import { Button, cn } from '@bitrate/ui-react'
import {
  type ArtistSession,
  describeSessionDevice,
  useArtistSessions,
  useRevokeOtherSessions,
  useRevokeSession,
} from '@entities/artist-account'
import { type I18n, useI18n } from '@shared/i18n'
import { Laptop, Smartphone } from 'lucide-react'

interface ActiveSessionsSectionProps {
  artistId: string
}

const MOBILE = /Android|iPhone|iPad|iPod/

function lastSeen(
  session: ArtistSession,
  { t, locale }: Pick<I18n, 't' | 'locale'>,
) {
  if (session.current) return t('settings.sessions.thisDevice')
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(session.lastUsedAt ?? session.createdAt))
  return session.lastUsedAt
    ? t('settings.sessions.lastActive', { date })
    : t('settings.sessions.signedIn', { date })
}

/** Signed-in devices, with sign-out for each other device and for all of them at once. */
export function ActiveSessionsSection({
  artistId,
}: ActiveSessionsSectionProps) {
  const i18n = useI18n()
  const { t, tMessage, tp } = i18n
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
          <p className="text-sm font-medium">{t('settings.sessions.title')}</p>
          <p className="text-sm text-text-secondary">
            {revokeOthers.isSuccess
              ? tp({
                  count: revokeOthers.data,
                  key: 'settings.sessions.signedOut',
                })
              : t('settings.sessions.hint')}
          </p>
        </div>
        {others > 0 && (
          <Button
            disabled={busy}
            onClick={() => revokeOthers.mutate()}
            size="sm"
            variant="outline"
          >
            {revokeOthers.isPending
              ? t('settings.sessions.signingOut')
              : t('settings.sessions.signOutOthers')}
          </Button>
        )}
      </div>
      {sessions.isPending ? (
        <p className="text-sm" role="status">
          {t('settings.sessions.loading')}
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
            {t('common.tryAgain')}
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
                    {describeSessionDevice(session.userAgent, t)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {lastSeen(session, i18n)}
                  </p>
                </div>
                {!session.current && (
                  <Button
                    aria-label={t('settings.sessions.signOutDevice', {
                      device: describeSessionDevice(session.userAgent, t),
                    })}
                    disabled={busy}
                    onClick={() => revoke.mutate(session.id)}
                    size="sm"
                    variant="ghost"
                  >
                    {t('shell.signOut')}
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {(revoke.error ?? revokeOthers.error) && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage((revoke.error ?? revokeOthers.error)?.message)}
        </p>
      )}
    </div>
  )
}
