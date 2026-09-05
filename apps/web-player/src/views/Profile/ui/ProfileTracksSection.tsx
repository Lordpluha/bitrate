import Image from 'next/image'
import { formatDuration } from '@/shared/utils/apiHelpers'
import { getTrackCoverUrl } from '@/shared/utils/mediaUrl'
import type { ProfileTrack } from '@/views/Profile/model/profile.types'
import { getTrackArtistName } from '@/views/Profile/model/profile.utils'
import { ProfileSection } from '@/views/Profile/ui/ProfileSection'

type ProfileTracksSectionProps = {
  isPending: boolean
  onPlayTrack: (track: ProfileTrack) => void
  tracks: ProfileTrack[]
}

export const ProfileTracksSection = ({
  isPending,
  onPlayTrack,
  tracks,
}: ProfileTracksSectionProps) => (
  <ProfileSection
    className="mt-12"
    subtitle="Only visible to you"
    title="Top tracks this month"
  >
    <div className="space-y-1">
      {isPending ? (
        <p className="text-text-subdued">Loading top tracks...</p>
      ) : tracks.length === 0 ? (
        <p className="text-text-subdued">No tracks yet.</p>
      ) : (
        tracks.slice(0, 4).map((track, index) => (
          <button
            className="grid w-full grid-cols-[36px_44px_minmax(0,1.3fr)_minmax(160px,1fr)_56px] items-center gap-3 rounded px-3 py-2 text-left transition-colors hover:bg-white/10 max-[900px]:grid-cols-[28px_44px_minmax(0,1fr)_48px]"
            key={track.id}
            onClick={() => onPlayTrack(track)}
            type="button"
          >
            <span className="text-right text-sm text-text-subdued">
              {index + 1}
            </span>
            <Image
              alt={track.title}
              className="h-11 w-11 rounded object-cover"
              height={44}
              src={getTrackCoverUrl(track.cover)}
              unoptimized
              width={44}
            />
            <span className="min-w-0">
              <span className="block truncate text-text">{track.title}</span>
              <span className="block truncate text-sm text-text-subdued">
                {getTrackArtistName(track)}
              </span>
            </span>
            <span className="truncate text-sm text-text-subdued max-[900px]:hidden">
              {track.title}
            </span>
            <span className="text-right text-sm text-text-subdued">
              {formatDuration(track.duration ?? 0)}
            </span>
          </button>
        ))
      )}
    </div>
  </ProfileSection>
)
