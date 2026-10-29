'use client'

import { Badge } from '@bitrate/ui-react'
import { useAuth } from '@shared/hooks'
import { useI18n } from '@shared/i18n'
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
  const { t } = useI18n()
  const name = person.username

  const meta = {
    friends: t('friends.friends'),
    incoming: t('friends.wantsToBeFriend'),
    none: `@${name}`,
    outgoing: t('friends.requestSent'),
  }[relation.kind]

  const actions =
    relation.kind === 'friends' ? (
      <Badge variant="secondary">{t('friends.friends')}</Badge>
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
            body: t('friends.seeEachOther'),
            title: t('friends.nowFriends', { name }),
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
                  body: t('friends.alreadyAsked', { name }),
                  title: t('friends.nowFriends', { name }),
                }
              : {
                  body: t('friends.willSeeRequest', { name }),
                  title: t('friends.requestSentTitle'),
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
  const { t, tp } = useI18n()
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
      <PageTitle title={t('friends.findFriends')} />
      <SearchField
        label={t('friends.searchPeople')}
        onChange={setQuery}
        placeholder={t('friends.searchPlaceholder')}
        value={query}
      />

      {notice ? <InlineNotice body={notice.body} title={notice.title} /> : null}

      {!search ? (
        <StateMessage
          description={t('friends.searchDescription')}
          icon={Search}
          secondary={
            incoming.data?.length
              ? {
                  href: ROUTES.friendRequests,
                  label: tp({
                    count: incoming.data.length,
                    key: 'friends.requestCount',
                  }),
                }
              : undefined
          }
          title={t('friends.searchTitle')}
        />
      ) : people.isPending ? (
        <ListSkeleton label={t('friends.searching')} rows={4} />
      ) : people.isError ? (
        <ErrorState
          description={t('common.tryAgainSoon')}
          onRetry={() => void people.refetch()}
          title={t('friends.searchUnavailable')}
        />
      ) : results.length === 0 ? (
        <StateMessage
          description={t('friends.checkSpelling')}
          icon={Search}
          title={t('friends.noOneFound', { query: search })}
        />
      ) : (
        <section className="flex flex-col gap-2">
          <p className="text-[13px] text-muted-foreground">
            {tp({
              count: results.length,
              key: 'friends.results',
              values: { query: search },
            })}
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
        {t('friends.alreadySent')}{' '}
        <Link
          className="text-foreground underline"
          href={ROUTES.friendRequests}
        >
          {t('friends.seeRequests')}
        </Link>
      </p>
    </PageShell>
  )
}
