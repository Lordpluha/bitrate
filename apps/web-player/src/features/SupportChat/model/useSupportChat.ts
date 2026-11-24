'use client'

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
import { fetchWithAuthRefresh } from '@shared/api/client'
import type { Locale } from '@shared/i18n'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  clearSupportSession,
  readSupportSession,
  type SupportSession,
  saveSupportSession,
} from './supportSession'

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''

/** Input of {@link useSupportChat}. */
export interface UseSupportChatInput {
  locale: Locale
  /** The signed-in user's id, or `guest`; another owner never sees this conversation. */
  owner: string
}

/**
 * The listener's support chat: restores the saved conversation when the panel first opens,
 * starts one with the first message, and streams each reply into the chat state.
 */
export function useSupportChat({ locale, owner }: UseSupportChatInput) {
  const client = useMemo(
    () =>
      createSupportClient({ baseUrl: apiBaseUrl, fetch: fetchWithAuthRefresh }),
    [],
  )
  const [state, setState] = useState<SupportChatState>(EMPTY_CHAT_STATE)
  const session = useRef<SupportSession | undefined>(undefined)
  const restored = useRef(false)

  /** Sign-out or another account on this browser: drop the previous owner's chat. */
  useEffect(() => {
    if (session.current && session.current.owner !== owner) {
      session.current = undefined
      restored.current = false
      setState(EMPTY_CHAT_STATE)
    }
  }, [owner])

  const forget = useCallback(() => {
    session.current = undefined
    clearSupportSession()
  }, [])

  const restore = useCallback(async () => {
    if (restored.current) return
    restored.current = true
    session.current = readSupportSession({ owner })
    if (!session.current) return
    try {
      setState(
        chatStateFromView(
          await client.load(session.current.id, session.current.token),
        ),
      )
    } catch {
      /** Deleted after 90 days, or the account changed: the next message starts a new one. */
      forget()
    }
  }, [client, forget, owner])

  const send = useCallback(
    async (text: string) => {
      setState((current) => startSupportTurn(current, text))
      try {
        if (!session.current) {
          const started = await client.start('listener', locale)
          const { id } = started.conversation
          session.current = started.token
            ? { id, token: started.token, owner }
            : { id, owner }
          saveSupportSession({ session: session.current })
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
