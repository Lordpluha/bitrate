'use client'

import {
  type ListeningHistoryEntry,
  useListeningHistory,
} from '@entities/History'
import { play } from '@entities/Player'
import { getTrackById } from '@entities/Track'
import { showApiErrorToast } from '@shared/api/feedback'
import { useAppDispatch } from '@shared/hooks'
import { ROUTES } from '@shared/routes'
import { getPlaylistCoverUrl, getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { ChevronDown, MoreHorizontal } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  weekday: 'short',
})

const getDayLabel = (value: string) => {
  const date = new Date(value)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return dayFormatter.format(date)
}

export const RecentsPage = () => {
  const dispatch = useAppDispatch()
  const { data: history, isPending } = useListeningHistory({
    page: 1,
    limit: 50,
  })
  const groups = (history ?? []).reduce<
    Record<string, ListeningHistoryEntry[]>
  >((acc, entry) => {
    const label = getDayLabel(entry.listenedAt)
    acc[label] = [...(acc[label] ?? []), entry]
    return acc
  }, {})

  const playTrack = async (trackId: string) => {
    try {
      dispatch(play(await getTrackById(trackId)))
    } catch (error) {
      showApiErrorToast(error, 'Unable to play this track.')
    }
  }

  return (
    <div className="h-full overflow-y-auto rounded-lg bg-background-secondary custom-scrollbar">
      <div className="mx-auto w-full max-w-220 px-4 py-6 sm:px-5 sm:py-10 lg:px-10">
        <h1 className="mb-8 text-3xl font-black text-text sm:mb-14 sm:text-4xl">
          Recents
        </h1>

        {isPending ? (
          <p className="text-text-subdued">Loading recents...</p>
        ) : Object.keys(groups).length === 0 ? (
          <div className="rounded-md bg-surface p-6 text-text-subdued">
            No recent listening activity yet.
          </div>
        ) : (
          <div className="grid gap-9">
            {Object.entries(groups).map(([label, entries]) => (
              <section key={label}>
                <h2 className="mb-4 text-2xl font-bold text-text">{label}</h2>
                <div className="grid gap-2">
                  {entries?.map((entry) => (
                    <div
                      className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-1 py-1 transition-colors hover:bg-white/10 sm:grid-cols-[64px_minmax(0,1fr)_auto]"
                      key={entry.id}
                    >
                      <button
                        className="contents text-left"
                        onClick={() => void playTrack(entry.track.id)}
                        type="button"
                      >
                        <Image
                          alt={entry.track.title}
                          className="h-13 w-13 rounded object-cover sm:h-16 sm:w-16"
                          height={64}
                          src={getTrackCoverUrl(entry.track.cover)}
                          unoptimized
                          width={64}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-base text-text">
                            {entry.track.title}
                          </span>
                          <span className="block truncate text-sm text-text-subdued">
                            {entry.track.artist?.username ??
                              entry.track.artistId}
                          </span>
                        </span>
                      </button>
                      <button
                        aria-label={`More actions for ${entry.track.title}`}
                        className="p-2 text-text-subdued transition-colors hover:text-text"
                        type="button"
                      >
                        <ChevronDown size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <section>
              <h2 className="mb-4 text-2xl font-bold text-text">Earlier</h2>
              <div className="grid gap-2">
                <Link
                  className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-1 py-1 transition-colors hover:bg-white/10 sm:grid-cols-[64px_minmax(0,1fr)_auto]"
                  href={ROUTES.likedSongs}
                >
                  <Image
                    alt="Liked Songs"
                    className="h-13 w-13 rounded object-cover sm:h-16 sm:w-16"
                    height={64}
                    src={getPlaylistCoverUrl(null)}
                    unoptimized
                    width={64}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-base text-text">
                      Liked Songs
                    </span>
                    <span className="block truncate text-sm text-text-subdued">
                      Playlist
                    </span>
                  </span>
                  <MoreHorizontal className="text-text-subdued" size={20} />
                </Link>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
