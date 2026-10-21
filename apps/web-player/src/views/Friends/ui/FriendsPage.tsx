'use client'

import {
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import {
  MenuItem,
  PageTitle,
  SectionHeader,
  Skeleton,
  StateMessage,
} from '@shared/ui'
import {
  Ellipsis,
  Moon,
  TriangleAlert,
  UserMinus,
  UserPlus,
  UserRound,
  UsersRound,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  type Friend,
  FriendRow,
  FriendTile,
  useFriendRequests,
  useFriends,
  useRemoveFriend,
} from '@/entities/Friend'
import { Z_INDEX_CLASS } from '@/shared/constants'

type FriendsTab = 'all' | 'online'

const SKELETON_KEYS = Array.from({ length: 6 }, (_, row) => `friend-${row}`)
/** Friends shown in the Online now strip. */
const STRIP_SIZE = 8

const tabClassName = (isActive: boolean) =>
  cn(
    'flex h-9 shrink-0 items-center rounded-md px-3 text-sm font-medium transition-colors',
    isActive
      ? 'bg-secondary text-foreground'
      : 'text-muted-foreground hover:bg-surface hover:text-foreground',
  )

/** The row's ellipsis menu, and the inline "Remove friend?" confirmation it opens. */
const FriendActions = ({ friend }: { friend: Friend }) => {
  const router = useRouter()
  const removeFriend = useRemoveFriend()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (isConfirming) {
    return (
      <>
        <Button
          className="h-8 px-3 text-[13px]"
          onClick={() => setIsConfirming(false)}
          variant="ghost"
        >
          Cancel
        </Button>
        <Button
          className="h-8 px-3 text-[13px]"
          disabled={removeFriend.isPending}
          onClick={() => removeFriend.mutate(friend.user.id)}
          variant="destructive"
        >
          Remove friend
        </Button>
      </>
    )
  }

  return (
    <Popover onOpenChange={setIsMenuOpen} open={isMenuOpen}>
      <PopoverTrigger
        aria-label={`More options for ${friend.user.username}`}
        className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
      >
        <Ellipsis className="size-4.5" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className={cn(
          Z_INDEX_CLASS.popover,
          'w-52 rounded-md border border-border bg-popover p-1 text-sm shadow-2xl',
        )}
        positionerClassName={Z_INDEX_CLASS.popover}
        sideOffset={6}
      >
        <div role="menu">
          <MenuItem
            icon={<UserRound size={17} />}
            label="View profile"
            onClick={() => router.push(ROUTES.user(friend.user.id))}
          />
          <MenuItem
            icon={<UserMinus size={17} />}
            label="Remove friend"
            onClick={() => {
              setIsMenuOpen(false)
              setIsConfirming(true)
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

const FriendList = ({ friends }: { friends: Friend[] }) => (
  <div className="flex flex-col">
    {friends.map((friend) => (
      <FriendRow
        actions={<FriendActions friend={friend} />}
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
  const online = all.filter(({ presence }) => presence.status !== 'offline')
  const offline = all.filter(({ presence }) => presence.status === 'offline')

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
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex max-w-190 flex-col gap-5 px-4 pt-2 pb-3 md:gap-6 md:px-8 md:py-6">
        <PageTitle action={findFriends} title="Friends" />

        <div className="-mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
          <div aria-label="Friends" className="flex gap-1" role="tablist">
            {(
              [
                ['all', `All · ${all.length}`],
                ['online', `Online · ${online.length}`],
              ] as const
            ).map(([id, label]) => (
              <button
                aria-selected={tab === id}
                className={tabClassName(tab === id)}
                key={id}
                onClick={() => setTab(id)}
                role="tab"
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          <Link className={tabClassName(false)} href={ROUTES.friendRequests}>
            Requests{requestCount ? ` · ${requestCount}` : ''}
          </Link>
        </div>

        {friends.isPending ? (
          <div
            aria-label="Loading friends"
            className="flex flex-col gap-2"
            role="status"
          >
            {SKELETON_KEYS.map((key) => (
              <Skeleton className="h-16 rounded-[10px]" key={key} />
            ))}
          </div>
        ) : friends.isError ? (
          <StateMessage
            description="Try again in a moment."
            icon={TriangleAlert}
            primary={{
              label: 'Try again',
              onClick: () => void friends.refetch(),
            }}
            title="Friends are unavailable right now"
            tone="error"
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
      </div>
    </div>
  )
}
