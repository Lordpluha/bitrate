'use client'

import { Badge, Button } from '@bitrate/ui-react'
import { useAuth } from '@shared/hooks'
import { ROUTES } from '@shared/routes'
import { PageTitle, Skeleton, StateMessage } from '@shared/ui'
import {
  CircleCheck,
  Clock,
  Search,
  TriangleAlert,
  UserPlus,
} from 'lucide-react'
import Link from 'next/link'
import { useDeferredValue, useState } from 'react'
import {
  getFriendRelation,
  PersonRow,
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useDeclineFriendRequest,
  useFriendRequests,
  useFriends,
  useSendFriendRequest,
} from '@/entities/Friend'
import { type SafeUser, useUsers } from '@/entities/User'

const RESULTS = 20
const SKELETON_KEYS = Array.from({ length: 4 }, (_, row) => `person-${row}`)

type Notice = { body: string; title: string }

const actionClassName = 'h-8 gap-1.5 px-3 text-[13px] font-medium'

/** One search result with the action its relationship calls for. */
const PersonResult = ({
  onNotice,
  person,
  relation,
}: {
  onNotice: (notice: Notice) => void
  person: SafeUser
  relation: ReturnType<typeof getFriendRelation>
}) => {
  const send = useSendFriendRequest()
  const cancel = useCancelFriendRequest()
  const accept = useAcceptFriendRequest()
  const decline = useDeclineFriendRequest()
  const name = person.username

  const meta = {
    friends: 'Friends',
    incoming: 'Wants to be your friend',
    none: `@${name}`,
    outgoing: 'Request sent',
  }[relation.kind]

  const actions =
    relation.kind === 'friends' ? (
      <Badge variant="secondary">Friends</Badge>
    ) : relation.kind === 'outgoing' ? (
      <Button
        aria-label={`Cancel the friend request to ${name}`}
        className={actionClassName}
        disabled={cancel.isPending}
        onClick={() => cancel.mutate(relation.requestId)}
        title="Cancel request"
        variant="outline"
      >
        <Clock className="size-3.5" />
        Requested
      </Button>
    ) : relation.kind === 'incoming' ? (
      <>
        <Button
          className={actionClassName}
          disabled={accept.isPending}
          onClick={() =>
            accept.mutate(relation.requestId, {
              onSuccess: () =>
                onNotice({
                  body: 'You can see each other’s online status.',
                  title: `You and ${name} are now friends`,
                }),
            })
          }
          variant="default"
        >
          Accept
        </Button>
        <Button
          className={actionClassName}
          disabled={decline.isPending}
          onClick={() => decline.mutate(relation.requestId)}
          variant="ghost"
        >
          Decline
        </Button>
      </>
    ) : (
      <Button
        className={actionClassName}
        disabled={send.isPending}
        onClick={() =>
          send.mutate(person.id, {
            onSuccess: ({ status }) =>
              onNotice(
                status === 'accepted'
                  ? {
                      body: `${name} had already asked, so you are friends now.`,
                      title: `You and ${name} are now friends`,
                    }
                  : {
                      body: `${name} will see it in their requests.`,
                      title: 'Friend request sent',
                    },
              ),
          })
        }
        variant="default"
      >
        <UserPlus className="size-3.5" />
        <span className="hidden sm:inline">Add friend</span>
        <span className="sm:hidden">Add</span>
      </Button>
    )

  return <PersonRow actions={actions} meta={meta} user={person} />
}

/** The design's Find friends: search people by name, add, accept or see a sent request. */
export const FindFriendsPage = () => {
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)
  const search = useDeferredValue(query.trim())
  const { user: me } = useAuth()
  const people = useUsers({ limit: RESULTS, username: search })
  const friends = useFriends()
  const incoming = useFriendRequests('incoming')
  const outgoing = useFriendRequests('outgoing')
  const friendIds = new Set((friends.data ?? []).map(({ user }) => user.id))
  const results = (people.data ?? []).filter(({ id }) => id !== me?.id)

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex max-w-190 flex-col gap-5 px-4 pt-2 pb-3 md:gap-6 md:px-8 md:py-6">
        <PageTitle title="Find friends" />
        <label className="relative block">
          <span className="sr-only">Search people</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-11 w-full rounded-[10px] border border-border bg-card pr-4 pl-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary [&::-webkit-search-cancel-button]:appearance-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or @username"
            type="search"
            value={query}
          />
        </label>

        {notice ? (
          <div
            className="flex items-start gap-3 rounded-[10px] border border-border bg-surface px-4 py-3"
            role="status"
          >
            <CircleCheck className="mt-0.5 size-4.5 shrink-0 text-success" />
            <div className="flex flex-col gap-0.5 text-sm">
              <span className="font-semibold text-foreground">
                {notice.title}
              </span>
              <span className="text-muted-foreground">{notice.body}</span>
            </div>
          </div>
        ) : null}

        {!search ? (
          <StateMessage
            description="Find people by their name. Friends see each other’s online status and what they are playing."
            icon={Search}
            secondary={
              incoming.data?.length
                ? {
                    href: ROUTES.friendRequests,
                    label: `${incoming.data.length} friend ${incoming.data.length === 1 ? 'request' : 'requests'}`,
                  }
                : undefined
            }
            title="Search for people you know"
          />
        ) : people.isPending ? (
          <div
            aria-label="Searching"
            className="flex flex-col gap-2"
            role="status"
          >
            {SKELETON_KEYS.map((key) => (
              <Skeleton className="h-16 rounded-[10px]" key={key} />
            ))}
          </div>
        ) : people.isError ? (
          <StateMessage
            description="Try again in a moment."
            icon={TriangleAlert}
            primary={{
              label: 'Try again',
              onClick: () => void people.refetch(),
            }}
            title="Search is unavailable right now"
            tone="error"
          />
        ) : results.length === 0 ? (
          <StateMessage
            description="Check the spelling and try again."
            icon={Search}
            title={`No one found for “${search}”`}
          />
        ) : (
          <section className="flex flex-col gap-2">
            <p className="text-[13px] text-muted-foreground">
              {results.length} {results.length === 1 ? 'person' : 'people'} for
              “{search}”
            </p>
            <div className="flex flex-col">
              {results.map((person) => (
                <PersonResult
                  key={person.id}
                  onNotice={setNotice}
                  person={person}
                  relation={getFriendRelation({
                    friendIds,
                    incoming: incoming.data ?? [],
                    outgoing: outgoing.data ?? [],
                    userId: person.id,
                  })}
                />
              ))}
            </div>
          </section>
        )}

        <p className="text-[13px] text-muted-foreground">
          Already sent some?{' '}
          <Link
            className="text-foreground underline"
            href={ROUTES.friendRequests}
          >
            See your requests
          </Link>
        </p>
      </div>
    </div>
  )
}
