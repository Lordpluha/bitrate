'use client'

import { Button } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
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
  const { t } = useI18n()
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
      <Link aria-label={t('friends.findFriends')} href={ROUTES.findFriends}>
        <UserPlus className="size-4" />
        <span className="hidden sm:inline">{t('friends.findFriends')}</span>
      </Link>
    </Button>
  )

  return (
    <PageShell>
      <PageTitle action={findFriends} title={t('friends.title')} />

      <div className="-mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
        <SegmentedTabs
          ariaLabel={t('friends.title')}
          chipsOnMobile
          onChange={setTab}
          tabs={[
            {
              id: 'all',
              label: t('friends.countLabel', {
                count: all.length,
                label: t('friends.all'),
              }),
            },
            {
              id: 'online',
              label: t('friends.countLabel', {
                count: online.length,
                label: t('friends.online'),
              }),
            },
          ]}
          value={tab}
        />
        <Link
          className={segmentedTabClassName({ isActive: false })}
          href={ROUTES.friendRequests}
        >
          {requestCount
            ? t('friends.countLabel', {
                count: requestCount,
                label: t('friends.requests'),
              })
            : t('friends.requests')}
        </Link>
      </div>

      {friends.isPending ? (
        <ListSkeleton label={t('friends.loading')} rows={6} />
      ) : friends.isError ? (
        <ErrorState
          description={t('common.tryAgainSoon')}
          onRetry={() => void friends.refetch()}
          title={t('friends.unavailable')}
        />
      ) : all.length === 0 ? (
        <StateMessage
          description={t('friends.emptyDescription')}
          icon={UsersRound}
          primary={{
            href: ROUTES.findFriends,
            label: t('friends.findFriends'),
          }}
          title={t('friends.emptyTitle')}
        />
      ) : tab === 'online' ? (
        online.length === 0 ? (
          <StateMessage
            description={t('friends.nobodyOnlineDescription')}
            icon={Moon}
            title={t('friends.nobodyOnline')}
          />
        ) : (
          <section className="flex flex-col gap-3">
            <SectionHeader
              title={t('friends.countLabel', {
                count: online.length,
                label: t('friends.online'),
              })}
            />
            <FriendList friends={online} />
            <p className="rounded-[10px] bg-surface px-4 py-3 text-[13px] text-muted-foreground">
              {t('friends.privacyNote')} {t('friends.privacyChange')}{' '}
              <Link
                className="text-foreground underline"
                href={ROUTES.settings}
              >
                {t('friends.privacyLink')}
              </Link>
              .
            </p>
          </section>
        )
      ) : (
        <>
          {online.length > 0 ? (
            <section className="flex flex-col gap-3">
              <SectionHeader
                title={t('friends.countLabel', {
                  count: online.length,
                  label: t('friends.onlineNow'),
                })}
              />
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pt-1 md:mx-0 md:px-1">
                {online.slice(0, STRIP_SIZE).map(({ presence, user }) => (
                  <FriendTile key={user.id} presence={presence} user={user} />
                ))}
              </div>
            </section>
          ) : null}
          {online.length > 0 ? (
            <section className="flex flex-col gap-1">
              <SectionHeader
                title={t('friends.countLabel', {
                  count: online.length,
                  label: t('friends.online'),
                })}
              />
              <FriendList friends={online} />
            </section>
          ) : null}
          {offline.length > 0 ? (
            <section className="flex flex-col gap-1">
              <SectionHeader
                title={t('friends.countLabel', {
                  count: offline.length,
                  label: t('friends.offline'),
                })}
              />
              <FriendList friends={offline} />
            </section>
          ) : null}
        </>
      )}
    </PageShell>
  )
}
