import { Button } from '@bitrate/ui-react'
import {
  type ArtistProfile,
  type ProfileFormValues,
  profileFormDefaults,
  socialLinkKeys,
  socialLinkLabels,
  useArtistProfile,
} from '@entities/artist-account'
import {
  ProfileForm,
  ProfileImageField,
  profileImageUrl,
  socialLinkIcons,
} from '@features/edit-profile'
import { countryName } from '@shared/constants/countries'
import { useI18n } from '@shared/i18n'
import { useArtworkAmbience } from '@shared/lib/artworkAmbience'
import { BadgeCheck, MapPin, UserRound } from 'lucide-react'
import { useState } from 'react'

interface ProfileViewProps {
  artistId: string
}

/** Public artist profile editor with a live preview that never implies the draft is saved. */
export function ProfileView({ artistId }: ProfileViewProps) {
  const { t, tMessage } = useI18n()
  const profile = useArtistProfile(artistId)
  return (
    <section className="artist-music space-y-6">
      <div>
        <h1 className="text-[1.625rem] font-normal lg:text-[2rem]">
          {t('shell.nav.profile')}
        </h1>
        <p className="mt-2 text-[0.9375rem] text-text-secondary">
          {t('profile.subtitle')}
        </p>
      </div>
      {profile.isPending ? (
        <p role="status">{t('profile.loading')}</p>
      ) : profile.isError ? (
        <div className="space-y-3">
          <p role="alert">{tMessage(profile.error.message)}</p>
          <Button
            onClick={() => {
              void profile.refetch()
            }}
            variant="outline"
          >
            {t('common.tryAgain')}
          </Button>
        </div>
      ) : (
        <ProfileEditor artistId={artistId} profile={profile.data} />
      )}
    </section>
  )
}

function ProfileEditor({
  artistId,
  profile,
}: {
  artistId: string
  profile: ArtistProfile
}) {
  const [draft, setDraft] = useState<ProfileFormValues>(() =>
    profileFormDefaults(profile),
  )
  return (
    <div className="space-y-6">
      <ProfileCard artistId={artistId} draft={draft} profile={profile} />
      <ProfileForm
        artistId={artistId}
        onValuesChange={setDraft}
        profile={profile}
      />
    </div>
  )
}

/** The public page as it would look now: the saved images with the unsaved text. */
function ProfileCard({
  artistId,
  profile,
  draft,
}: {
  artistId: string
  profile: ArtistProfile
  draft: ProfileFormValues
}) {
  const { t, locale } = useI18n()
  const links = socialLinkKeys.filter((key) => draft[key].trim() !== '')
  const banner = profile.backgroundImage
    ? profileImageUrl(profile.backgroundImage)
    : null
  useArtworkAmbience(banner)
  return (
    <section
      aria-labelledby="profile-preview-heading"
      className="artist-release-workspace-panel artist-profile-card"
    >
      <div className="artist-profile-banner">
        {banner && <img alt="" src={banner} />}
        <h2 className="artist-profile-note" id="profile-preview-heading">
          {t('profile.preview')}
        </h2>
      </div>
      <div className="artist-profile-identity">
        <div className="artist-profile-avatar">
          {profile.avatar ? (
            <img alt="" src={profileImageUrl(profile.avatar)} />
          ) : (
            <UserRound aria-hidden="true" />
          )}
        </div>
        <div className="artist-profile-info">
          <p className="artist-profile-name">
            @{draft.username.trim() || profile.username}
            {profile.verified && (
              <BadgeCheck aria-label={t('profile.verified')} />
            )}
          </p>
          {draft.country && (
            <p className="artist-profile-country">
              <MapPin aria-hidden="true" />
              {countryName(draft.country, locale)}
            </p>
          )}
          <p className="artist-profile-bio">
            {draft.bio.trim() || t('profile.noBio')}
          </p>
          {links.length > 0 && (
            <ul className="artist-profile-links">
              {links.map((key) => {
                const Icon = socialLinkIcons[key]
                return (
                  <li key={key}>
                    <Icon aria-hidden="true" />
                    {t(socialLinkLabels[key])}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="artist-profile-images">
        <ProfileImageField
          artistId={artistId}
          kind="avatar"
          profile={profile}
        />
        <ProfileImageField
          artistId={artistId}
          kind="background"
          profile={profile}
        />
      </div>
    </section>
  )
}
