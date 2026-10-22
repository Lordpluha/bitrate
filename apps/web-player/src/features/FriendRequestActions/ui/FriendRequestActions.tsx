'use client'

import { Button, cn } from '@bitrate/ui-react'
import { Clock, UserPlus, X } from 'lucide-react'
import {
  type SendFriendRequestResult,
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useDeclineFriendRequest,
  useSendFriendRequest,
} from '@/entities/Friend'

/** Where the actions sit: a Find friends search result, or the Friend requests page. */
type FriendRequestActionPlacement = 'requests' | 'search'

const actionClassName = 'h-8 gap-1.5 px-3 text-[13px] font-medium'

type AcceptDeclineActionsProps = {
  onAccepted?: () => void
  placement: FriendRequestActionPlacement
  requestId: string
  username: string
}

/** Accept or decline a request someone sent you. */
export const AcceptDeclineActions = ({
  onAccepted,
  placement,
  requestId,
  username,
}: AcceptDeclineActionsProps) => {
  const accept = useAcceptFriendRequest()
  const decline = useDeclineFriendRequest()
  const isPending = accept.isPending || decline.isPending
  const declineRequest = () => decline.mutate(requestId)

  return (
    <>
      <Button
        className={actionClassName}
        disabled={isPending}
        onClick={() => accept.mutate(requestId, { onSuccess: onAccepted })}
        variant="default"
      >
        Accept
      </Button>
      {placement === 'requests' ? (
        <Button
          aria-label={`Decline ${username}’s request`}
          className={cn(actionClassName, 'max-sm:size-8 max-sm:px-0')}
          disabled={isPending}
          onClick={declineRequest}
          variant="outline"
        >
          <X className="size-4 sm:hidden" />
          <span className="hidden sm:inline">Decline</span>
        </Button>
      ) : (
        <Button
          className={actionClassName}
          disabled={isPending}
          onClick={declineRequest}
          variant="ghost"
        >
          Decline
        </Button>
      )}
    </>
  )
}

type CancelRequestActionProps = {
  placement: FriendRequestActionPlacement
  requestId: string
  username: string
}

/** Withdraw a request you sent; search results show it as a "Requested" state. */
export const CancelRequestAction = ({
  placement,
  requestId,
  username,
}: CancelRequestActionProps) => {
  const cancel = useCancelFriendRequest()
  const cancelRequest = () => cancel.mutate(requestId)

  return placement === 'search' ? (
    <Button
      aria-label={`Cancel the friend request to ${username}`}
      className={actionClassName}
      disabled={cancel.isPending}
      onClick={cancelRequest}
      title="Cancel request"
      variant="outline"
    >
      <Clock className="size-3.5" />
      Requested
    </Button>
  ) : (
    <Button
      className={actionClassName}
      disabled={cancel.isPending}
      onClick={cancelRequest}
      variant="ghost"
    >
      Cancel request
    </Button>
  )
}

type AddFriendActionProps = {
  onSent?: (result: SendFriendRequestResult) => void
  userId: string
}

/** Send someone a friend request. */
export const AddFriendAction = ({ onSent, userId }: AddFriendActionProps) => {
  const send = useSendFriendRequest()

  return (
    <Button
      className={actionClassName}
      disabled={send.isPending}
      onClick={() => send.mutate(userId, { onSuccess: onSent })}
      variant="default"
    >
      <UserPlus className="size-3.5" />
      <span className="hidden sm:inline">Add friend</span>
      <span className="sm:hidden">Add</span>
    </Button>
  )
}
