import {
  applySupportEvent,
  chatStateFromView,
  createSupportClient,
  EMPTY_CHAT_STATE,
  failSupportTurn,
  type SupportChatState,
  SupportClientError,
  startSupportTurn,
} from '@bitrate/support-core/client'
import { apiBaseUrl } from '@shared/api/fetchClient'
import type { Locale } from '@shared/i18n'
import { useCallback, useMemo, useRef, useState } from 'react'
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
export function useSupportChat(locale: Locale) {
  const client = useMemo(() => createSupportClient({ baseUrl: apiBaseUrl }), [])
  const [state, setState] = useState<SupportChatState>(EMPTY_CHAT_STATE)
  const session = useRef<SupportSession | undefined>(undefined)
  const restored = useRef(false)

  const forget = useCallback(() => {
    session.current = undefined
    clearSupportSession()
  }, [])

  const restore = useCallback(async () => {
    if (restored.current) return
    restored.current = true
    session.current = readSupportSession()
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
  }, [client, forget])

  const send = useCallback(
    async (text: string) => {
      setState((current) => startSupportTurn(current, text))
      try {
        if (!session.current) {
          const started = await client.start('artist', locale)
          const { id } = started.conversation
          session.current = started.token
            ? { id, token: started.token }
            : { id }
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
    [client, locale, forget],
  )

  return { ...state, send, restore }
}
