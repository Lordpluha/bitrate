'use client'

import { Button } from '@bitrate/ui-react'
import {
  useClearListeningHistory,
  useListeningHistory,
  useRemoveListeningHistoryTrack,
} from '@entities/History'
import { usePlayerStore } from '@entities/Player'
import { getTrackById } from '@entities/Track'
import { showApiErrorToast } from '@shared/api/feedback'
import { ROUTES } from '@shared/routes'
import {
  ErrorState,
  PageTitle,
  StateMessage,
  TrackRowSkeleton,
} from '@shared/ui'
import { History } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '@/shared/i18n'
import { groupListeningHistory } from '@/views/Recents/model/groupListeningHistory'
import { EarlierHistoryLink } from '@/views/Recents/ui/EarlierHistoryLink'
import { HistoryEntryRow } from '@/views/Recents/ui/HistoryEntryRow'

/** Rows standing in for the history while it loads. */
const SKELETON_KEYS = Array.from(
  { length: 8 },
  (_, row) => `recents-row-${row}`,
)

export const RecentsPage = () => {
  const { locale, t } = useI18n()
  const play = usePlayerStore((state) => state.play)
  const removeTrack = useRemoveListeningHistoryTrack()
  const clearHistory = useClearListeningHistory()
  const {
    data: history,
    isError,
    isPending,
    refetch,
  } = useListeningHistory({
    page: 1,
    limit: 50,
  })
  const groups = useMemo(() => {
    return groupListeningHistory(history ?? [], locale, {
      today: t('recents.today'),
      yesterday: t('recents.yesterday'),
    })
  }, [history, locale, t])

  const playTrack = async (trackId: string) => {
    try {
      play(await getTrackById(trackId))
    } catch (error) {
      showApiErrorToast(error, t('profile.playFailed'))
    }
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-7 px-4 pt-2 pb-3 md:px-8 md:py-6">
        <PageTitle
          action={
            (history?.length ?? 0) > 0 ? (
              <Button
                className="h-9 px-4 text-sm font-medium"
                disabled={clearHistory.isPending}
                onClick={() => clearHistory.mutate()}
                variant="ghost"
              >
                {t('recents.clear')}
              </Button>
            ) : null
          }
          title={t('recents.title')}
        />

        {isPending ? (
          <div
            aria-label={t('recents.loading')}
            className="flex flex-col gap-1"
            role="status"
          >
            {SKELETON_KEYS.map((key) => (
              <TrackRowSkeleton key={key} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            onRetry={() => void refetch()}
            title={t('recents.loadFailed')}
          />
        ) : Object.keys(groups).length === 0 ? (
          <StateMessage
            description={t('recents.emptyDescription')}
            icon={History}
            primary={{ href: ROUTES.search(), label: t('queue.find') }}
            title={t('recents.empty')}
          />
        ) : (
          <div className="flex flex-col gap-7">
            {Object.entries(groups).map(([label, entries]) => (
              <section className="flex flex-col gap-2" key={label}>
                <h2 className="text-base font-semibold text-foreground">
                  {label}
                </h2>
                <ul className="flex flex-col">
                  {entries.map((entry) => (
                    <HistoryEntryRow
                      entry={entry}
                      isRemoving={removeTrack.isPending}
                      key={entry.id}
                      onPlay={(trackId) => void playTrack(trackId)}
                      onRemove={(trackId) => removeTrack.mutate(trackId)}
                    />
                  ))}
                </ul>
              </section>
            ))}
            <EarlierHistoryLink />
          </div>
        )}
      </div>
    </div>
  )
}
