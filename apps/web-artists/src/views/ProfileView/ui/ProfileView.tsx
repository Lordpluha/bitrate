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
} from '@features/edit-profile'
import { countryName } from '@shared/constants/countries'
import { useI18n } from '@shared/i18n'
import { BadgeCheck, UserRound } from 'lucide-react'
import { useState } from 'react'

interface ProfileViewProps {
  artistId: string
}

/** Public artist profile editor with a live preview that never implies the draft is saved. */
export function ProfileView({ artistId }: ProfileViewProps) {
  const { tMessage } = useI18n()
  const profile = useArtistProfile(artistId)
  return (
    <section className="artist-music space-y-6">
      <div>
        <h1 className="text-[1.625rem] font-normal lg:text-[2rem]">Profile</h1>
        <p className="mt-2 text-[0.9375rem] text-text-secondary">
          How listeners see you on Bitrate.
        </p>
      </div>
      {profile.isPending ? (
        <p role="status">Loading your profile…</p>
      ) : profile.isError ? (
        <div className="space-y-3">
          <p role="alert">{tMessage(profile.error.message)}</p>
          <Button
            onClick={() => {
              void profile.refetch()
            }}
            variant="outline"
          >
            Try again
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        <section
          aria-labelledby="profile-images-heading"
          className="artist-release-workspace-panel space-y-5"
        >
          <h2 id="profile-images-heading">Images</h2>
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
        </section>
        <section
          aria-labelledby="profile-details-heading"
          className="artist-release-workspace-panel space-y-5"
        >
          <h2 id="profile-details-heading">Details</h2>
          <ProfileForm
            artistId={artistId}
            onValuesChange={setDraft}
            profile={profile}
          />
        </section>
      </div>
      <ProfilePreview draft={draft} profile={profile} />
    </div>
  )
}

function ProfilePreview({
  profile,
  draft,
}: {
  profile: ArtistProfile
  draft: ProfileFormValues
}) {
  const links = socialLinkKeys.filter((key) => draft[key].trim() !== '')
  return (
    <aside aria-labelledby="profile-preview-heading" className="space-y-2">
      <h2 className="text-sm text-text-secondary" id="profile-preview-heading">
        Preview · unsaved changes are shown but not published
      </h2>
      <div className="artist-release-workspace-panel overflow-hidden p-0">
        <div className="h-28 bg-secondary">
          {profile.backgroundImage && (
            <img
              alt=""
              className="size-full object-cover"
              src={profileImageUrl(profile.backgroundImage)}
            />
          )}
        </div>
        <div className="space-y-3 px-4 pb-5">
          <div className="-mt-10 flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-secondary">
            {profile.avatar ? (
              <img
                alt=""
                className="size-full object-cover"
                src={profileImageUrl(profile.avatar)}
              />
            ) : (
              <UserRound aria-hidden="true" className="size-8 text-accent" />
            )}
          </div>
          <div>
            <p className="flex items-center gap-1 text-lg">
              @{draft.username.trim() || profile.username}
              {profile.verified && (
                <BadgeCheck
                  aria-label="Verified artist"
                  className="size-5 text-accent"
                />
              )}
            </p>
            {draft.country && (
              <p className="text-sm text-text-secondary">
                {countryName(draft.country)}
              </p>
            )}
          </div>
          <p className="whitespace-pre-line text-sm text-text-secondary">
            {draft.bio.trim() || 'No bio yet.'}
          </p>
          {links.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {links.map((key) => (
                <li
                  className="rounded-full border border-border px-3 py-1 text-xs"
                  key={key}
                >
                  {socialLinkLabels[key]}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  )
}
