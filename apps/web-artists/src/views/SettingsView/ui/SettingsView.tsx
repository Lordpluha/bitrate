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
import { PageSkeleton, PanelIcon } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import {
  Bell,
  CircleAlert,
  CircleCheck,
  CircleUserRound,
  Languages,
  LockKeyhole,
  type LucideIcon,
  Palette,
  TriangleAlert,
} from 'lucide-react'
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
        <PageSkeleton label={t('settings.loading')} />
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
  icon,
  children,
}: {
  id: string
  title: string
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <section
      aria-labelledby={id}
      className="artist-release-workspace-panel space-y-4"
    >
      <h2 id={id}>
        <PanelIcon icon={icon} />
        {title}
      </h2>
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
      <Panel
        icon={CircleUserRound}
        id="settings-account-heading"
        title={t('settings.account')}
      >
        <dl className="grid grid-cols-[minmax(0,1fr)] gap-3 text-sm sm:grid-cols-[repeat(2,minmax(0,1fr))]">
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
            <dd className="[overflow-wrap:anywhere]">
              @{profile.username} ·{' '}
              <Link className="underline" to={ROUTES.dashboard.profile}>
                {t('settings.editProfile')}
              </Link>
            </dd>
          </div>
        </dl>
      </Panel>
      <Panel
        icon={LockKeyhole}
        id="settings-security-heading"
        title={t('settings.security')}
      >
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
      <Panel
        icon={Palette}
        id="settings-appearance-heading"
        title={t('settings.appearance')}
      >
        <AppearancePreferences />
        <p className="text-xs text-text-secondary">
          {t('settings.browserOnly')}
        </p>
      </Panel>
      <Panel
        icon={Languages}
        id="settings-language-heading"
        title={t('settings.language.title')}
      >
        <LanguagePreference artistId={artistId} />
      </Panel>
      <Panel
        icon={Bell}
        id="settings-notifications-heading"
        title={t('shell.notifications')}
      >
        <NotificationPreferences artistId={artistId} />
      </Panel>
      <Panel
        icon={TriangleAlert}
        id="settings-danger-heading"
        title={t('settings.danger')}
      >
        <DeleteAccountSection artistId={artistId} username={profile.username} />
      </Panel>
    </div>
  )
}
