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
import { AppearancePreferences } from '@features/workspace-theme'
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
  const { t, tMessage } = useI18n()
  const profile = useArtistProfile(artistId)
  return (
    <section className="artist-music space-y-6">
      <div>
        <h1 className="text-[1.625rem] font-normal lg:text-[2rem]">
          {t('shell.nav.settings')}
        </h1>
        <p className="mt-2 text-[0.9375rem] text-text-secondary">
          {t('settings.subtitle')}
        </p>
      </div>
      {profile.isPending ? (
        <p role="status">{t('settings.loading')}</p>
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
  const { tMessage, t } = useI18n()
  return (
    <div className="grid max-w-3xl gap-4">
      <Panel id="settings-account-heading" title={t('settings.account')}>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-secondary">{t('settings.email')}</dt>
            <dd className="flex items-center gap-1 break-all">
              {profile.email}
              {profile.emailVerified ? (
                <CircleCheck
                  aria-label={t('settings.verified')}
                  className="size-4 shrink-0 text-accent"
                />
              ) : (
                <CircleAlert
                  aria-label={t('settings.notVerified')}
                  className="size-4 shrink-0 text-destructive"
                />
              )}
            </dd>
          </div>
          <div>
            <dt className="text-text-secondary">{t('settings.handle')}</dt>
            <dd>
              @{profile.username} ·{' '}
              <Link className="underline" to={ROUTES.dashboard.profile}>
                {t('settings.editProfile')}
              </Link>
            </dd>
          </div>
        </dl>
      </Panel>
      <Panel id="settings-security-heading" title={t('settings.security')}>
        <TwoFactorSection
          artistId={artistId}
          enabled={profile.twoFactorEnabled}
        />
        <div className="flex flex-wrap items-start justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-sm font-medium">{t('settings.password')}</p>
            <p className="text-sm text-text-secondary">
              {reset.isSuccess
                ? t('settings.resetSent', { email: profile.email })
                : t('settings.resetHint')}
            </p>
            {reset.error && (
              <p className="text-sm text-destructive" role="alert">
                {tMessage(reset.error.message)}
              </p>
            )}
          </div>
          <Button
            disabled={reset.isPending || reset.isSuccess}
            onClick={() => reset.mutate(profile.email)}
            size="sm"
            variant="outline"
          >
            {reset.isPending ? t('common.sending') : t('settings.sendReset')}
          </Button>
        </div>
        <ActiveSessionsSection artistId={artistId} />
      </Panel>
      <Panel id="settings-appearance-heading" title={t('settings.appearance')}>
        <AppearancePreferences />
        <p className="text-xs text-text-secondary">
          {t('settings.browserOnly')}
        </p>
      </Panel>
      <Panel
        id="settings-language-heading"
        title={t('settings.language.title')}
      >
        <LanguagePreference artistId={artistId} />
      </Panel>
      <Panel
        id="settings-notifications-heading"
        title={t('shell.notifications')}
      >
        <NotificationPreferences artistId={artistId} />
      </Panel>
      <Panel id="settings-danger-heading" title={t('settings.danger')}>
        <DeleteAccountSection artistId={artistId} username={profile.username} />
      </Panel>
    </div>
  )
}
