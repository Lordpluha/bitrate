import { Button } from '@bitrate/ui-react'
import {
  type ArtistProfile,
  useArtistProfile,
  usePasswordResetEmail,
} from '@entities/artist-account'
import {
  ActiveSessionsSection,
  DeleteAccountSection,
  TwoFactorSection,
} from '@features/account-security'
import { NotificationPreferences } from '@features/notification-preferences'
import { LanguagePreference } from '@features/workspace-language'
import { AppearancePreferences, ThemeSwitcher } from '@features/workspace-theme'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { CircleAlert, CircleCheck } from 'lucide-react'
import type { ReactNode } from 'react'

interface SettingsViewProps {
  artistId: string
}

/** Account identity, security, appearance and account removal, separate from the public profile. */
export function SettingsView({ artistId }: SettingsViewProps) {
  const profile = useArtistProfile(artistId)
  return (
    <section className="artist-music space-y-6">
      <div>
        <h1 className="text-[1.625rem] font-normal lg:text-[2rem]">Settings</h1>
        <p className="mt-2 text-[0.9375rem] text-text-secondary">
          Your account, security and workspace preferences.
        </p>
      </div>
      {profile.isPending ? (
        <p role="status">Loading settings…</p>
      ) : profile.isError ? (
        <div className="space-y-3">
          <p role="alert">{profile.error.message}</p>
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
        <SettingsSections artistId={artistId} profile={profile.data} />
      )}
    </section>
  )
}

function Panel({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section
      aria-labelledby={id}
      className="artist-release-workspace-panel space-y-4"
    >
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  )
}

function SettingsSections({
  artistId,
  profile,
}: {
  artistId: string
  profile: ArtistProfile
}) {
  const reset = usePasswordResetEmail()
  const { t } = useI18n()
  return (
    <div className="grid max-w-3xl gap-4">
      <Panel id="settings-account-heading" title="Account">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-secondary">Sign-in email</dt>
            <dd className="flex items-center gap-1 break-all">
              {profile.email}
              {profile.emailVerified ? (
                <CircleCheck
                  aria-label="Verified"
                  className="size-4 shrink-0 text-accent"
                />
              ) : (
                <CircleAlert
                  aria-label="Not verified"
                  className="size-4 shrink-0 text-destructive"
                />
              )}
            </dd>
          </div>
          <div>
            <dt className="text-text-secondary">Public handle</dt>
            <dd>
              @{profile.username} ·{' '}
              <Link className="underline" to={ROUTES.dashboard.profile}>
                Edit profile
              </Link>
            </dd>
          </div>
        </dl>
      </Panel>
      <Panel id="settings-security-heading" title="Security">
        <TwoFactorSection
          artistId={artistId}
          enabled={profile.twoFactorEnabled}
        />
        <div className="flex flex-wrap items-start justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-sm font-medium">Password</p>
            <p className="text-sm text-text-secondary">
              {reset.isSuccess
                ? `If ${profile.email} can receive mail, a reset link is on its way.`
                : 'We email you a link to choose a new password.'}
            </p>
            {reset.error && (
              <p className="text-sm text-destructive" role="alert">
                {reset.error.message}
              </p>
            )}
          </div>
          <Button
            disabled={reset.isPending || reset.isSuccess}
            onClick={() => reset.mutate(profile.email)}
            size="sm"
            variant="outline"
          >
            {reset.isPending ? 'Sending…' : 'Send reset link'}
          </Button>
        </div>
        <ActiveSessionsSection artistId={artistId} />
      </Panel>
      <Panel id="settings-appearance-heading" title="Appearance">
        <ThemeSwitcher />
        <AppearancePreferences />
        <p className="text-xs text-text-secondary">
          Saved in this browser only.
        </p>
      </Panel>
      <Panel
        id="settings-language-heading"
        title={t('settings.language.title')}
      >
        <LanguagePreference />
      </Panel>
      <Panel id="settings-notifications-heading" title="Notifications">
        <NotificationPreferences artistId={artistId} />
      </Panel>
      <Panel id="settings-danger-heading" title="Danger zone">
        <DeleteAccountSection artistId={artistId} username={profile.username} />
      </Panel>
    </div>
  )
}
