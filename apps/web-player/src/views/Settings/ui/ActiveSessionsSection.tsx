'use client'

import { Monitor, Trash2 } from 'lucide-react'
import {
  useAuthSessions,
  useRevokeAuthSession,
  useRevokeOtherAuthSessions,
} from '@/entities/AuthSession'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { useAuth } from '@/shared/hooks'
import { SettingsSection } from './controls/SettingsSection'

const formatSessionDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export const ActiveSessionsSection = () => {
  const { isAuthenticated } = useAuth()
  const sessionsQuery = useAuthSessions(isAuthenticated)
  const revokeSession = useRevokeAuthSession()
  const revokeOtherSessions = useRevokeOtherAuthSessions()
  const sessions = sessionsQuery.data ?? []

  const handleRevoke = async (sessionId: string) => {
    try {
      await revokeSession.mutateAsync(sessionId)
      showApiSuccessToast('Session revoked')
    } catch (error) {
      showApiErrorToast(error, 'Could not revoke session')
    }
  }

  const handleRevokeOthers = async () => {
    try {
      await revokeOtherSessions.mutateAsync(undefined)
      showApiSuccessToast('Other sessions revoked')
    } catch (error) {
      showApiErrorToast(error, 'Could not revoke other sessions')
    }
  }

  return (
    <SettingsSection title="Active sessions">
      {sessionsQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Loading sessions...</p>
      ) : sessionsQuery.isError ? (
        <p
          className="rounded-[10px] border border-warning-border bg-warning-surface px-4 py-3 text-[13px] text-warning-text"
          role="alert"
        >
          Sessions could not be loaded. Try again in a moment.
        </p>
      ) : (
        <div className="grid gap-3">
          {sessions.map((session) => (
            <div
              className="flex items-center justify-between gap-4 border-b border-border py-3.5 last:border-b-0"
              key={session.id}
            >
              <div className="flex min-w-0 items-center gap-3">
                <Monitor className="shrink-0 text-muted-foreground" size={20} />
                <div className="min-w-0">
                  <p className="font-semibold text-text">
                    {session.current ? 'This browser' : 'Browser session'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Started {formatSessionDate(session.createdAt)}
                  </p>
                </div>
              </div>
              {!session.current && (
                <button
                  aria-label="Revoke session"
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                  disabled={revokeSession.isPending}
                  onClick={() => void handleRevoke(session.id)}
                  type="button"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
          {sessions.some((session) => !session.current) && (
            <button
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-60"
              disabled={revokeOtherSessions.isPending}
              onClick={() => void handleRevokeOthers()}
              type="button"
            >
              Log out all other sessions
            </button>
          )}
        </div>
      )}
    </SettingsSection>
  )
}
