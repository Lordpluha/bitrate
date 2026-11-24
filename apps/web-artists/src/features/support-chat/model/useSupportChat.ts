import {
  applySupportEvent,
  chatStateFromView,
  createSupportClient,
  EMPTY_CHAT_STATE,
  failSupportTurn,
  type SupportChatState,
  SupportClientError,
  startSupportTurn,
  watchOperatorReplies,
} from '@bitrate/support-core/client'
import { apiBaseUrl } from '@shared/api/fetchClient'
import type { Locale } from '@shared/i18n'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  clearSupportSession,
  readSupportSession,
  type SupportSession,
  saveSupportSession,
} from './supportSession'

/**
 * The artist's support chat: restores the saved conversation when the panel first opens,
 * starts one with the first message, and streams each reply into the chat state.
 */
export function useSupportChat(locale: Locale, owner: string) {
  const client = useMemo(() => createSupportClient({ baseUrl: apiBaseUrl }), [])
  const [state, setState] = useState<SupportChatState>(EMPTY_CHAT_STATE)
  const session = useRef<SupportSession | undefined>(undefined)
  const restored = useRef(false)

  // Sign-out or another account on this browser: drop the previous owner's chat.
  useEffect(() => {
    if (session.current && session.current.owner !== owner) {
      session.current = undefined
      restored.current = false
      setState(EMPTY_CHAT_STATE)
    }
  }, [owner])

  /** An operator's replies arrive outside the user's turn, so they are polled for (#573). */
  useEffect(() => {
    const current = session.current
    if (state.status !== 'waiting_operator' || !current) return
    return watchOperatorReplies({
      load: () => client.load(current.id, current.token),
      // A send that started meanwhile owns the state; the next tick catches up after it.
      onState: (next) =>
        setState((previous) =>
          previous.status === 'waiting_operator' ? next : previous,
        ),
      isHidden: () => document.hidden,
    })
  }, [client, state.status])

  const forget = useCallback(() => {
    session.current = undefined
    clearSupportSession()
  }, [])

  const restore = useCallback(async () => {
    if (restored.current) return
    restored.current = true
    session.current = readSupportSession(owner)
    if (!session.current) return
    try {
      setState(
        chatStateFromView(
          await client.load(session.current.id, session.current.token),
        ),
      )
    } catch {
      // Deleted after 90 days: the next message starts a new conversation.
      forget()
    }
  }, [client, forget, owner])

  const send = useCallback(
    async (text: string) => {
      setState((current) => startSupportTurn(current, text))
      try {
        if (!session.current) {
          const started = await client.start('artist', locale)
          const { id } = started.conversation
          session.current = started.token
            ? { id, token: started.token, owner }
            : { id, owner }
          saveSupportSession(session.current)
        }
        const { id, token } = session.current
        for await (const event of client.send(id, text, token)) {
          setState((current) => applySupportEvent(current, event))
        }
      } catch (error: unknown) {
        const status =
          error instanceof SupportClientError ? error.status : undefined
        if (status === 404) forget()
        setState((current) => failSupportTurn(current, status))
      }
    },
    [client, locale, forget, owner],
  )

  return { ...state, send, restore }
}
