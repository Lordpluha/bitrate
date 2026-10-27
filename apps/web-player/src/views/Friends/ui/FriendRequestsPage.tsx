'use client'

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
}

const tabLabel = ({ count, label }: TabLabelInput) =>
  count ? `${label} · ${count}` : label

/** The design's Friend requests: accept or decline what you received, cancel what you sent. */
export const FriendRequestsPage = () => {
  const [tab, setTab] = useState<RequestsTab>('incoming')
  const [acceptedName, setAcceptedName] = useState<string | null>(null)
  const incoming = useFriendRequests('incoming')
  const outgoing = useFriendRequests('outgoing')
  const current = tab === 'incoming' ? incoming : outgoing
  const now = new Date()

  return (
    <PageShell>
      <PageTitle title="Friend requests" />
      <SegmentedTabs
        ariaLabel="Friend requests"
        onChange={setTab}
        tabs={[
          {
            id: 'incoming',
            label: tabLabel({
              count: incoming.data?.length,
              label: 'Received',
            }),
          },
          {
            id: 'outgoing',
            label: tabLabel({ count: outgoing.data?.length, label: 'Sent' }),
          },
        ]}
        value={tab}
      />

      {acceptedName && tab === 'incoming' ? (
        <InlineNotice
          body="You can see each other’s online status."
          title={`You and ${acceptedName} are now friends`}
        />
      ) : null}

      {current.isPending ? (
        <ListSkeleton label="Loading requests" rows={3} />
      ) : current.isError ? (
        <ErrorState
          description="Try again in a moment."
          onRetry={() => void current.refetch()}
          title="Requests are unavailable right now"
        />
      ) : current.data.length === 0 ? (
        <StateMessage
          description={
            tab === 'incoming'
              ? 'When someone adds you, you can accept it here.'
              : 'Requests you send wait here until they are answered.'
          }
          icon={UserPlus}
          primary={{ href: ROUTES.findFriends, label: 'Find friends' }}
          title={tab === 'incoming' ? 'No friend requests' : 'No sent requests'}
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
                  ? formatRelativeTime({ date: request.createdAt, now })
                  : `Sent ${formatRelativeTime({ date: request.createdAt, now })}`
              }
              user={request.user}
            />
          ))}
        </div>
      )}
    </PageShell>
  )
}
