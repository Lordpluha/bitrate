'use client'

import { SupportChat, type SupportChatLabels } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { useSupportChat } from '../model/useSupportChat'

/** Off until launch: the Privacy Policy must name the model providers first (#572). */
const enabled = process.env.NEXT_PUBLIC_SUPPORT_CHAT_ENABLED === 'true'

/** The support assistant on every page of the listener app (ADR-0074). */
export function SupportChatWidget() {
  if (!enabled) return null
  return <EnabledSupportChat />
}

function EnabledSupportChat() {
  const { t, locale } = useI18n()
  const chat = useSupportChat({ locale })
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
