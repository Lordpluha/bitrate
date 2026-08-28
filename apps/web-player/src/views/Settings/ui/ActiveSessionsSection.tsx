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
        <p className="text-sm text-text-subdued">Loading sessions...</p>
      ) : sessionsQuery.isError ? (
        <p className="text-sm text-negative">Sessions could not be loaded.</p>
      ) : (
        <div className="grid gap-3">
          {sessions.map((session) => (
            <div
              className="flex items-center justify-between gap-4 rounded-md bg-surface px-4 py-3"
              key={session.id}
            >
              <div className="flex min-w-0 items-center gap-3">
                <Monitor className="shrink-0 text-text-subdued" size={20} />
                <div className="min-w-0">
                  <p className="font-semibold text-text">
                    {session.current ? 'This browser' : 'Browser session'}
                  </p>
                  <p className="truncate text-xs text-text-subdued">
                    Started {formatSessionDate(session.createdAt)}
                  </p>
                </div>
              </div>
              {!session.current && (
                <button
                  aria-label="Revoke session"
                  className="rounded-full p-2 text-text-subdued hover:bg-white/10 hover:text-text"
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
              className="justify-self-start rounded-full border border-white/40 px-5 py-2 text-sm font-bold text-text hover:border-white"
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
