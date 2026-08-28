import { Download, Pause, Play, Shuffle, UserPlus } from 'lucide-react'
import { LikePlaylistButton } from '@/entities/Playlist'
import type { PlaylistPlayback } from '@/views/Playlist/model/playlist.types'

export type PlaylistActionDetails = {
  cover: string
  id: string
  isOwner: boolean
  ownerName: string
  title: string
  tracksCount: number
}

type PlaylistPrimaryActionsProps = {
  details: PlaylistActionDetails
  playback: PlaylistPlayback
}

export const PlaylistPrimaryActions = ({
  details,
  playback,
}: PlaylistPrimaryActionsProps) => (
  <>
    {details.tracksCount > 0 && (
      <>
        <button
          aria-label={`${playback.isPlaying ? 'Pause' : 'Play'} ${details.title}`}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-black transition-transform hover:scale-105 sm:h-14 sm:w-14"
          onClick={playback.handlePlayPlaylist}
          type="button"
        >
          {playback.isPlaying ? (
            <Pause aria-hidden="true" fill="currentColor" size={26} />
          ) : (
            <Play aria-hidden="true" fill="currentColor" size={26} />
          )}
        </button>
        <button
          aria-label={
            playback.isShuffled ? 'Disable shuffle' : 'Shuffle playlist'
          }
          aria-pressed={playback.isShuffled}
          className={
            playback.isShuffled
              ? 'text-primary transition-colors hover:text-primary-hover'
              : 'transition-colors hover:text-text'
          }
          onClick={playback.handleShufflePlaylist}
          type="button"
        >
          <Shuffle aria-hidden="true" className="h-7 w-7 sm:h-7.5 sm:w-7.5" />
        </button>
        <LikePlaylistButton
          playlist={{
            cover: details.cover,
            id: details.id,
            ownerName: details.ownerName,
            title: details.title,
            tracksCount: details.tracksCount,
          }}
        />
        <button
          aria-label="Download playlist"
          className="transition-colors hover:text-text max-[480px]:hidden"
          type="button"
        >
          <Download aria-hidden="true" className="h-7 w-7 sm:h-7.5 sm:w-7.5" />
        </button>
      </>
    )}
    {details.isOwner && (
      <button
        aria-label="Invite collaborators"
        className="transition-colors hover:text-text max-[480px]:hidden"
        type="button"
      >
        <UserPlus aria-hidden="true" className="h-7 w-7 sm:h-8 sm:w-8" />
      </button>
    )}
    {details.tracksCount > 0 && (
      <button
        className="rounded-full border border-white/40 px-4 py-1.5 text-sm font-bold text-text transition-colors hover:border-white max-[640px]:hidden"
        type="button"
      >
        Mix
      </button>
    )}
  </>
)
