import { MediaImage } from '@shared/ui/MediaImage'
import { useI18n } from '@/shared/i18n'
import { formatDuration } from '@/shared/utils/apiHelpers'
import { getTrackCoverUrl } from '@/shared/utils/mediaUrl'
import type { ProfileTrack } from '@/views/Profile/model/profile.types'
import { getTrackArtistName } from '@/views/Profile/model/profile.utils'
import { ProfileSection } from '@/views/Profile/ui/ProfileSection'

/** How many top tracks the tile shows, as in the design. */
const TOP_TRACKS_SHOWN = 4

type ProfileTracksSectionProps = {
  isPending: boolean
  onPlayTrack: (track: ProfileTrack) => void
  tracks: ProfileTrack[]
}

export const ProfileTracksSection = ({
  isPending,
  onPlayTrack,
  tracks,
}: ProfileTracksSectionProps) => {
  const { t } = useI18n()

  return (
    <ProfileSection
      subtitle={t('profile.onlyYou')}
      title={t('profile.topTracksMonth')}
    >
      {isPending ? (
        <p className="text-sm text-muted-foreground">
          {t('profile.loadingTopTracks')}
        </p>
      ) : tracks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('profile.noTracks')}</p>
      ) : (
        <ol className="flex flex-col">
          {tracks.slice(0, TOP_TRACKS_SHOWN).map((track, index) => (
            <li key={track.id}>
              <button
                aria-label={t('common.playName', { name: track.title })}
                className="grid min-h-16 w-full grid-cols-[42px_minmax(0,1fr)_auto] items-center rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-surface"
                onClick={() => onPlayTrack(track)}
                type="button"
              >
                <span className="text-center text-[13px] font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <span className="flex min-w-0 items-center gap-3">
                  <MediaImage
                    alt=""
                    className="size-11.5 shrink-0 rounded-md object-cover"
                    fallback="track"
                    height={46}
                    src={getTrackCoverUrl(track.cover)}
                    unoptimized
                    width={46}
                  />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {track.title}
                    </span>
                    <span className="truncate text-[13px] text-muted-foreground">
                      {getTrackArtistName(track)}
                    </span>
                  </span>
                </span>
                <span className="pl-3 text-[13px] tabular-nums text-muted-foreground">
                  {formatDuration(track.duration ?? 0)}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </ProfileSection>
  )
}
