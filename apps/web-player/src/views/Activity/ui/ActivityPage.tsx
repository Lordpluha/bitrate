'use client'

import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import {
  ErrorState,
  ListSkeleton,
  PageShell,
  PageTitle,
  StateMessage,
} from '@shared/ui'
import { UsersRound } from 'lucide-react'
import { ActivityRow, useFollowingActivity } from '@/entities/User'
import { usePlayCollection } from '@/features/PlayCollection'

/**
 * The design's Activity feed: what each person you follow played last this week, newest
 * first, with Play beside every track. The API only reports plays, so the design's
 * Likes and Playlists filters wait for it.
 */
export const ActivityPage = () => {
  const { t } = useI18n()
  const activity = useFollowingActivity()
  const playCollection = usePlayCollection()

  return (
    <PageShell>
      <PageTitle title={t('activity.title')} />

      {activity.isPending ? (
        <ListSkeleton
          className="gap-1"
          label={t('activity.loading')}
          rowClassName="h-20"
          rows={6}
        />
      ) : activity.isError ? (
        <ErrorState
          description={t('common.tryAgainSoon')}
          onRetry={() => void activity.refetch()}
          title={t('activity.unavailable')}
        />
      ) : activity.data.length === 0 ? (
        <StateMessage
          description={t('activity.emptyDescription')}
          icon={UsersRound}
          primary={{
            href: ROUTES.search(),
            label: t('activity.findPeople'),
          }}
          title={t('activity.emptyTitle')}
        />
      ) : (
        <ul className="flex flex-col">
          {activity.data.map((entry) => (
            <ActivityRow
              entry={entry}
              key={entry.user.id}
              onPlay={() =>
                void playCollection({
                  id: entry.track.id,
                  kind: 'track',
                  title: entry.track.title,
                })
              }
            />
          ))}
        </ul>
      )}
    </PageShell>
  )
}
