import { MusicCardLg } from '@shared/ui'
import { MediaImage } from '@shared/ui/MediaImage'
import Link from 'next/link'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import { getArtistAvatarUrl } from '@/shared/utils/mediaUrl'
import type { ProfileArtist } from '@/views/Profile/model/profile.types'
import { ProfileSection } from '@/views/Profile/ui/ProfileSection'

type ProfileArtistsSectionProps = {
  artists: ProfileArtist[]
  emptyMessage?: string
  isPending: boolean
  subtitle?: string
  title?: string
  /** `cards` for the main column, `list` (64px rows) for the narrow side column. */
  variant?: 'cards' | 'list'
}

export const ProfileArtistsSection = ({
  artists,
  emptyMessage,
  isPending,
  subtitle,
  title,
  variant = 'cards',
}: ProfileArtistsSectionProps) => {
  const { t } = useI18n()

  return (
    <ProfileSection
      subtitle={subtitle ?? t('profile.onlyYou')}
      title={title ?? t('profile.topArtistsMonth')}
    >
      {isPending ? (
        <p className="text-sm text-muted-foreground">
          {t('profile.loadingArtists')}
        </p>
      ) : artists.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {emptyMessage ?? t('profile.noArtists')}
        </p>
      ) : variant === 'list' ? (
        <ul className="flex flex-col">
          {artists.map((artist) => (
            <li key={artist.id}>
              <Link
                className="flex h-16 min-w-0 items-center gap-3 rounded-lg px-1 transition-colors hover:bg-surface"
                href={ROUTES.artist(artist.id)}
              >
                <MediaImage
                  alt=""
                  className="size-12 shrink-0 rounded-full object-cover"
                  fallback="artist"
                  height={48}
                  src={getArtistAvatarUrl(artist.avatar)}
                  unoptimized
                  width={48}
                />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {artist.username}
                  </span>
                  <span className="text-[13px] text-muted-foreground">
                    {t('common.artist')}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-3 gap-2.5 md:grid-cols-5 md:gap-4">
          {artists.map((artist) => (
            <li className="min-w-0" key={artist.id}>
              <MusicCardLg
                description={t('common.artist')}
                href={ROUTES.artist(artist.id)}
                id={artist.id}
                imageUrl={getArtistAvatarUrl(artist.avatar)}
                isArtist
                name={artist.username}
              />
            </li>
          ))}
        </ul>
      )}
    </ProfileSection>
  )
}
