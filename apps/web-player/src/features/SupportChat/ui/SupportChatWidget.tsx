'use client'

import { SupportChat, type SupportChatLabels } from '@bitrate/ui-react'
import { useAuth } from '@shared/hooks'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import { usePathname } from 'next/navigation'
import { useSupportChat } from '../model/useSupportChat'

/** Off until launch: the Privacy Policy must name the model providers first (#572). */
const enabled = process.env.NEXT_PUBLIC_SUPPORT_CHAT_ENABLED === 'true'

/**
 * The support assistant on every page outside the player (ADR-0074): inside `/main` the button
 * would cover the player bar, so the design docks it everywhere else.
 */
export function SupportChatWidget() {
  const pathname = usePathname()
  if (!enabled || pathname.startsWith(ROUTES.main)) return null
  return <EnabledSupportChat />
}

function EnabledSupportChat() {
  const { t, locale } = useI18n()
  const { user } = useAuth()
  const chat = useSupportChat({ locale, owner: user?.id ?? 'guest' })
  const labels: SupportChatLabels = {
    open: t('support.open'),
    close: t('support.close'),
    title: t('support.title'),
    placeholder: t('support.placeholder'),
    send: t('support.send'),
    emptyTitle: t('support.emptyTitle'),
    emptyDescription: t('support.emptyDescription'),
    sources: t('support.sources'),
    operator: t('support.operator'),
    status: {
      waiting_operator: t('support.status.waitingOperator'),
      error: t('support.status.error'),
      limited: t('support.status.limited'),
      offline: t('support.status.offline'),
    },
  }
  return (
    <SupportChat
      labels={labels}
      messages={chat.messages}
      onOpenChange={(open) => {
        if (open) void chat.restore()
      }}
      onSend={(text) => void chat.send(text)}
      status={chat.status}
    />
  )
}
