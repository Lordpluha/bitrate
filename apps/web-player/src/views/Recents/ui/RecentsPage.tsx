'use client'

import {
  useClearListeningHistory,
  useListeningHistory,
  useRemoveListeningHistoryTrack,
} from '@entities/History'
import { usePlayerStore } from '@entities/Player'
import { getTrackById } from '@entities/Track'
import { showApiErrorToast } from '@shared/api/feedback'
import { useMemo } from 'react'
import { useI18n } from '@/shared/i18n'
import { groupListeningHistory } from '@/views/Recents/model/groupListeningHistory'
import { EarlierHistoryLink } from '@/views/Recents/ui/EarlierHistoryLink'
import { HistoryEntryRow } from '@/views/Recents/ui/HistoryEntryRow'

export const RecentsPage = () => {
  const { locale, t } = useI18n()
  const play = usePlayerStore((state) => state.play)
  const removeTrack = useRemoveListeningHistoryTrack()
  const clearHistory = useClearListeningHistory()
  const { data: history, isPending } = useListeningHistory({
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
      showApiErrorToast(error, 'Unable to play this track.')
    }
  }

  const removeHistoryTrack = async (trackId: string) => {
    try {
      await removeTrack.mutateAsync(trackId)
    } catch (error) {
      showApiErrorToast(error, 'Unable to remove this track from history.')
    }
  }

  const clearListeningHistory = async () => {
    try {
      await clearHistory.mutateAsync()
    } catch (error) {
      showApiErrorToast(error, 'Unable to clear listening history.')
    }
  }

  return (
    <div className="h-full overflow-y-auto rounded-lg bg-background-secondary custom-scrollbar">
      <div className="mx-auto w-full max-w-220 px-4 py-6 sm:px-5 sm:py-10 lg:px-10">
        <div className="mb-8 flex items-center justify-between gap-4 sm:mb-14">
          <h1 className="text-3xl font-black text-text sm:text-4xl">
            {t('recents.title')}
          </h1>
          {(history?.length ?? 0) > 0 ? (
            <button
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-text hover:bg-surface disabled:opacity-50"
              disabled={clearHistory.isPending}
              onClick={() => void clearListeningHistory()}
              type="button"
            >
              {t('recents.clear')}
            </button>
          ) : null}
        </div>

        {isPending ? (
          <p aria-live="polite" className="text-text-subdued">
            {t('recents.loading')}
          </p>
        ) : Object.keys(groups).length === 0 ? (
          <div className="rounded-md bg-surface p-6 text-text-subdued">
            {t('recents.empty')}
          </div>
        ) : (
          <div className="grid gap-9">
            {Object.entries(groups).map(([label, entries]) => (
              <section key={label}>
                <h2 className="mb-4 text-2xl font-bold text-text">{label}</h2>
                <ul className="grid gap-2">
                  {entries.map((entry) => (
                    <HistoryEntryRow
                      entry={entry}
                      isRemoving={removeTrack.isPending}
                      key={entry.id}
                      onPlay={(trackId) => void playTrack(trackId)}
                      onRemove={(trackId) => void removeHistoryTrack(trackId)}
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
