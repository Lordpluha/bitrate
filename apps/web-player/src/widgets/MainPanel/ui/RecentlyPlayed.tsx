'use client'

import { useListeningHistory } from '@entities/History'
import { usePlayerStore } from '@entities/Player'
import { getTrackById } from '@entities/Track'
import { showApiErrorToast } from '@shared/api/feedback'
import { SectionHeader } from '@shared/ui'
import { MediaImage } from '@shared/ui/MediaImage'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import Link from 'next/link'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'

export const RecentlyPlayed = () => {
  const { t } = useI18n()
  const play = usePlayerStore((state) => state.play)
  const { data: history, isPending } = useListeningHistory({
    page: 1,
    limit: 6,
  })
  const recentTracks = history ?? []

  const playHistoryTrack = async (trackId: string) => {
    try {
      play(await getTrackById(trackId))
    } catch (error) {
      showApiErrorToast(error, t('profile.playFailed'))
    }
  }

  if (isPending || recentTracks.length === 0) return null

  return (
    <section className="relative">
      <SectionHeader
        action={
          <Link className="hover:text-foreground" href={ROUTES.recents}>
            {t('common.showAll')}
          </Link>
        }
        title={t('main.recentlyPlayed')}
      />
      <div className="flex flex-col">
        {recentTracks.map((entry) => (
          <button
            className="grid h-16 w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-surface"
            key={entry.id}
            onClick={() => void playHistoryTrack(entry.track.id)}
            type="button"
          >
            <MediaImage
              alt={entry.track.title}
              className="rounded-md object-cover"
              fallback="track"
              height={48}
              src={getTrackCoverUrl(entry.track.cover)}
              unoptimized
              width={48}
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-foreground">
                {entry.track.title}
              </div>
              <div className="truncate text-[13px] text-muted-foreground">
                {entry.track.artist?.username ?? entry.track.artistId}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
