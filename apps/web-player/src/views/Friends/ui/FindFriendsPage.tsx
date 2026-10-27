'use client'

import { Badge } from '@bitrate/ui-react'
import { useAuth } from '@shared/hooks'
import { ROUTES } from '@shared/routes'
import {
  ErrorState,
  InlineNotice,
  ListSkeleton,
  PageShell,
  PageTitle,
  SearchField,
  StateMessage,
} from '@shared/ui'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'
import {
  type FriendRelation,
  getFriendRelation,
  PersonRow,
  useFriendRequests,
  useFriends,
} from '@/entities/Friend'
import { type SafeUser, useUsers } from '@/entities/User'
import {
  AcceptDeclineActions,
  AddFriendAction,
  CancelRequestAction,
} from '@/features/FriendRequestActions'

const RESULTS = 20

type Notice = { body: string; title: string }

type PersonResultProps = {
  onNotice: (notice: Notice) => void
  person: SafeUser
  relation: FriendRelation
}

/** One search result with the action its relationship calls for. */
const PersonResult = ({ onNotice, person, relation }: PersonResultProps) => {
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
      <CancelRequestAction
        placement="search"
        requestId={relation.requestId}
        username={name}
      />
    ) : relation.kind === 'incoming' ? (
      <AcceptDeclineActions
        onAccepted={() =>
          onNotice({
            body: 'You can see each other’s online status.',
            title: `You and ${name} are now friends`,
          })
        }
        placement="search"
        requestId={relation.requestId}
        username={name}
      />
    ) : (
      <AddFriendAction
        onSent={({ status }) =>
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
          )
        }
        userId={person.id}
      />
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
  const results = useMemo(() => {
    const friendIds = new Set((friends.data ?? []).map(({ user }) => user.id))
    return (people.data ?? [])
      .filter(({ id }) => id !== me?.id)
      .map((person) => ({
        person,
        relation: getFriendRelation({
          friendIds,
          incoming: incoming.data ?? [],
          outgoing: outgoing.data ?? [],
          userId: person.id,
        }),
      }))
  }, [friends.data, incoming.data, me?.id, outgoing.data, people.data])

  return (
    <PageShell>
      <PageTitle title="Find friends" />
      <SearchField
        label="Search people"
        onChange={setQuery}
        placeholder="Search by name or @username"
        value={query}
      />

      {notice ? <InlineNotice body={notice.body} title={notice.title} /> : null}

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
        <ListSkeleton label="Searching" rows={4} />
      ) : people.isError ? (
        <ErrorState
          description="Try again in a moment."
          onRetry={() => void people.refetch()}
          title="Search is unavailable right now"
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
            {results.length} {results.length === 1 ? 'person' : 'people'} for “
            {search}”
          </p>
          <div className="flex flex-col">
            {results.map(({ person, relation }) => (
              <PersonResult
                key={person.id}
                onNotice={setNotice}
                person={person}
                relation={relation}
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
    </PageShell>
  )
}
