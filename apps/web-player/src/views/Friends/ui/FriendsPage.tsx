'use client'

import { Button } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import {
  ErrorState,
  ListSkeleton,
  PageShell,
  PageTitle,
  SectionHeader,
  SegmentedTabs,
  StateMessage,
  segmentedTabClassName,
} from '@shared/ui'
import { Moon, UserPlus, UsersRound } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import {
  type Friend,
  FriendRow,
  FriendTile,
  useFriendRequests,
  useFriends,
} from '@/entities/Friend'
import { RemoveFriendMenu } from '@/features/RemoveFriend'

type FriendsTab = 'all' | 'online'

/** Friends shown in the Online now strip. */
const STRIP_SIZE = 8

type PartitionByPresenceInput = { friends: Friend[] }

/** Splits friends into online (incl. away) and offline in one pass, keeping order. */
const partitionByPresence = ({ friends }: PartitionByPresenceInput) => {
  const online: Friend[] = []
  const offline: Friend[] = []
  for (const friend of friends) {
    if (friend.presence.status === 'offline') offline.push(friend)
    else online.push(friend)
  }
  return { offline, online }
}

const FriendList = ({ friends }: { friends: Friend[] }) => (
  <div className="flex flex-col">
    {friends.map((friend) => (
      <FriendRow
        actions={<RemoveFriendMenu friend={friend} />}
        key={friend.user.id}
        presence={friend.presence}
        user={friend.user}
      />
    ))}
  </div>
)

/**
 * The design's Friends page: who is online (and what they play) first, then everyone else.
 * Presence is visible to friends only; listening along waits for Jam.
 */
export const FriendsPage = () => {
  const [tab, setTab] = useState<FriendsTab>('all')
  const friends = useFriends()
  const incoming = useFriendRequests('incoming')
  const requestCount = incoming.data?.length ?? 0
  const all = friends.data ?? []
  const { offline, online } = partitionByPresence({ friends: all })

  const findFriends = (
    <Button
      asChild
      className="h-9 gap-2 px-4 text-sm font-medium"
      variant="default"
    >
      <Link aria-label="Find friends" href={ROUTES.findFriends}>
        <UserPlus className="size-4" />
        <span className="hidden sm:inline">Find friends</span>
      </Link>
    </Button>
  )

  return (
    <PageShell>
      <PageTitle action={findFriends} title="Friends" />

      <div className="-mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
        <SegmentedTabs
          ariaLabel="Friends"
          onChange={setTab}
          tabs={[
            { id: 'all', label: `All · ${all.length}` },
            { id: 'online', label: `Online · ${online.length}` },
          ]}
          value={tab}
        />
        <Link
          className={segmentedTabClassName({ isActive: false })}
          href={ROUTES.friendRequests}
        >
          Requests{requestCount ? ` · ${requestCount}` : ''}
        </Link>
      </div>

      {friends.isPending ? (
        <ListSkeleton label="Loading friends" rows={6} />
      ) : friends.isError ? (
        <ErrorState
          description="Try again in a moment."
          onRetry={() => void friends.refetch()}
          title="Friends are unavailable right now"
        />
      ) : all.length === 0 ? (
        <StateMessage
          description="Add people you know to see when they are online and what they are playing."
          icon={UsersRound}
          primary={{ href: ROUTES.findFriends, label: 'Find friends' }}
          title="No friends yet"
        />
      ) : tab === 'online' ? (
        online.length === 0 ? (
          <StateMessage
            description="When a friend comes online, they appear here first."
            icon={Moon}
            title="Nobody is online right now"
          />
        ) : (
          <section className="flex flex-col gap-3">
            <SectionHeader title={`Online · ${online.length}`} />
            <FriendList friends={online} />
            <p className="rounded-[10px] bg-surface px-4 py-3 text-[13px] text-muted-foreground">
              Only friends see your online status and what you are playing.
              Change it in{' '}
              <Link
                className="text-foreground underline"
                href={ROUTES.settings}
              >
                Privacy
              </Link>
              .
            </p>
          </section>
        )
      ) : (
        <>
          {online.length > 0 ? (
            <section className="flex flex-col gap-3">
              <SectionHeader title={`Online now · ${online.length}`} />
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pt-1 md:mx-0 md:px-1">
                {online.slice(0, STRIP_SIZE).map(({ presence, user }) => (
                  <FriendTile key={user.id} presence={presence} user={user} />
                ))}
              </div>
            </section>
          ) : null}
          {online.length > 0 ? (
            <section className="flex flex-col gap-1">
              <SectionHeader title={`Online · ${online.length}`} />
              <FriendList friends={online} />
            </section>
          ) : null}
          {offline.length > 0 ? (
            <section className="flex flex-col gap-1">
              <SectionHeader title={`Offline · ${offline.length}`} />
              <FriendList friends={offline} />
            </section>
          ) : null}
        </>
      )}
    </PageShell>
  )
}
