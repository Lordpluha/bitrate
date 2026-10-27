'use client'

import { type Translate, useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import {
  ErrorState,
  InlineNotice,
  ListSkeleton,
  PageShell,
  PageTitle,
  SegmentedTabs,
  StateMessage,
} from '@shared/ui'
import { formatRelativeTime } from '@shared/utils/formatRelativeTime'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { PersonRow, useFriendRequests } from '@/entities/Friend'
import {
  AcceptDeclineActions,
  CancelRequestAction,
} from '@/features/FriendRequestActions'

type RequestsTab = 'incoming' | 'outgoing'

type TabLabelInput = {
  count: number | undefined
  label: string
  t: Translate
}

const tabLabel = ({ count, label, t }: TabLabelInput) =>
  count ? t('friends.countLabel', { count, label }) : label

/** The design's Friend requests: accept or decline what you received, cancel what you sent. */
export const FriendRequestsPage = () => {
  const { locale, t } = useI18n()
  const [tab, setTab] = useState<RequestsTab>('incoming')
  const [acceptedName, setAcceptedName] = useState<string | null>(null)
  const incoming = useFriendRequests('incoming')
  const outgoing = useFriendRequests('outgoing')
  const current = tab === 'incoming' ? incoming : outgoing
  const now = new Date()

  return (
    <PageShell>
      <PageTitle title={t('friends.requestsTitle')} />
      <SegmentedTabs
        ariaLabel={t('friends.requestsTitle')}
        onChange={setTab}
        tabs={[
          {
            id: 'incoming',
            label: tabLabel({
              count: incoming.data?.length,
              label: t('friends.received'),
              t,
            }),
          },
          {
            id: 'outgoing',
            label: tabLabel({
              count: outgoing.data?.length,
              label: t('friends.sent'),
              t,
            }),
          },
        ]}
        value={tab}
      />

      {acceptedName && tab === 'incoming' ? (
        <InlineNotice
          body={t('friends.seeEachOther')}
          title={t('friends.nowFriends', { name: acceptedName })}
        />
      ) : null}

      {current.isPending ? (
        <ListSkeleton label={t('friends.loadingRequests')} rows={3} />
      ) : current.isError ? (
        <ErrorState
          description={t('common.tryAgainSoon')}
          onRetry={() => void current.refetch()}
          title={t('friends.requestsUnavailable')}
        />
      ) : current.data.length === 0 ? (
        <StateMessage
          description={
            tab === 'incoming'
              ? t('friends.incomingEmpty')
              : t('friends.outgoingEmpty')
          }
          icon={UserPlus}
          primary={{
            href: ROUTES.findFriends,
            label: t('friends.findFriends'),
          }}
          title={t(
            tab === 'incoming'
              ? 'friends.noRequests'
              : 'friends.noSentRequests',
          )}
        />
      ) : (
        <div className="flex flex-col">
          {current.data.map((request) => (
            <PersonRow
              actions={
                tab === 'incoming' ? (
                  <AcceptDeclineActions
                    onAccepted={() => setAcceptedName(request.user.username)}
                    placement="requests"
                    requestId={request.id}
                    username={request.user.username}
                  />
                ) : (
                  <CancelRequestAction
                    placement="requests"
                    requestId={request.id}
                    username={request.user.username}
                  />
                )
              }
              key={request.id}
              meta={
                tab === 'incoming'
                  ? formatRelativeTime({ date: request.createdAt, locale, now })
                  : t('friends.sentAgo', {
                      time: formatRelativeTime({
                        date: request.createdAt,
                        locale,
                        now,
                      }),
                    })
              }
              user={request.user}
            />
          ))}
        </div>
      )}
    </PageShell>
  )
}
