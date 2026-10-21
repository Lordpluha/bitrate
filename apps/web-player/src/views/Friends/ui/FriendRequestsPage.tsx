'use client'

import { Button, cn } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import { PageTitle, Skeleton, StateMessage } from '@shared/ui'
import { formatRelativeTime } from '@shared/utils/formatRelativeTime'
import { CircleCheck, TriangleAlert, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import {
  type FriendRequest,
  PersonRow,
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useDeclineFriendRequest,
  useFriendRequests,
} from '@/entities/Friend'

type RequestsTab = 'incoming' | 'outgoing'

const SKELETON_KEYS = Array.from({ length: 3 }, (_, row) => `request-${row}`)
const actionClassName = 'h-8 px-3 text-[13px] font-medium'

const ReceivedActions = ({
  onAccepted,
  request,
}: {
  onAccepted: (username: string) => void
  request: FriendRequest
}) => {
  const accept = useAcceptFriendRequest()
  const decline = useDeclineFriendRequest()
  const name = request.user.username

  return (
    <>
      <Button
        className={actionClassName}
        disabled={accept.isPending || decline.isPending}
        onClick={() =>
          accept.mutate(request.id, { onSuccess: () => onAccepted(name) })
        }
        variant="default"
      >
        Accept
      </Button>
      <Button
        aria-label={`Decline ${name}’s request`}
        className={cn(actionClassName, 'max-sm:size-8 max-sm:px-0')}
        disabled={accept.isPending || decline.isPending}
        onClick={() => decline.mutate(request.id)}
        variant="outline"
      >
        <X className="size-4 sm:hidden" />
        <span className="hidden sm:inline">Decline</span>
      </Button>
    </>
  )
}

const CancelAction = ({ request }: { request: FriendRequest }) => {
  const cancel = useCancelFriendRequest()

  return (
    <Button
      className={actionClassName}
      disabled={cancel.isPending}
      onClick={() => cancel.mutate(request.id)}
      variant="ghost"
    >
      Cancel request
    </Button>
  )
}

/** The design's Friend requests: accept or decline what you received, cancel what you sent. */
export const FriendRequestsPage = () => {
  const [tab, setTab] = useState<RequestsTab>('incoming')
  const [acceptedName, setAcceptedName] = useState<string | null>(null)
  const incoming = useFriendRequests('incoming')
  const outgoing = useFriendRequests('outgoing')
  const current = tab === 'incoming' ? incoming : outgoing
  const now = new Date()

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex max-w-190 flex-col gap-5 px-4 pt-2 pb-3 md:gap-6 md:px-8 md:py-6">
        <PageTitle title="Friend requests" />
        <div aria-label="Friend requests" className="flex gap-1" role="tablist">
          {(
            [
              ['incoming', 'Received', incoming.data?.length],
              ['outgoing', 'Sent', outgoing.data?.length],
            ] as const
          ).map(([id, label, count]) => (
            <button
              aria-selected={tab === id}
              className={cn(
                'h-9 shrink-0 rounded-md px-3 text-sm font-medium transition-colors',
                tab === id
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-surface hover:text-foreground',
              )}
              key={id}
              onClick={() => setTab(id)}
              role="tab"
              type="button"
            >
              {count ? `${label} · ${count}` : label}
            </button>
          ))}
        </div>

        {acceptedName && tab === 'incoming' ? (
          <div
            className="flex items-start gap-3 rounded-[10px] border border-border bg-surface px-4 py-3"
            role="status"
          >
            <CircleCheck className="mt-0.5 size-4.5 shrink-0 text-success" />
            <div className="flex flex-col gap-0.5 text-sm">
              <span className="font-semibold text-foreground">
                You and {acceptedName} are now friends
              </span>
              <span className="text-muted-foreground">
                You can see each other’s online status.
              </span>
            </div>
          </div>
        ) : null}

        {current.isPending ? (
          <div
            aria-label="Loading requests"
            className="flex flex-col gap-2"
            role="status"
          >
            {SKELETON_KEYS.map((key) => (
              <Skeleton className="h-16 rounded-[10px]" key={key} />
            ))}
          </div>
        ) : current.isError ? (
          <StateMessage
            description="Try again in a moment."
            icon={TriangleAlert}
            primary={{
              label: 'Try again',
              onClick: () => void current.refetch(),
            }}
            title="Requests are unavailable right now"
            tone="error"
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
            title={
              tab === 'incoming' ? 'No friend requests' : 'No sent requests'
            }
          />
        ) : (
          <div className="flex flex-col">
            {current.data.map((request) => (
              <PersonRow
                actions={
                  tab === 'incoming' ? (
                    <ReceivedActions
                      onAccepted={setAcceptedName}
                      request={request}
                    />
                  ) : (
                    <CancelAction request={request} />
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
      </div>
    </div>
  )
}
