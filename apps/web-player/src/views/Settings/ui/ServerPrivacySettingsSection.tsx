'use client'

import {
  type MeSettings,
  useMeSettings,
  useUpdateMeSettings,
} from '@/entities/Me'
import { useAuth } from '@/shared/hooks'
import { useI18n } from '@/shared/i18n'
import {
  SettingsRow,
  SettingsSection,
} from '@/views/Settings/ui/controls/SettingsSection'
import { SettingsSwitch } from '@/views/Settings/ui/controls/SettingsSwitch'

type PrivacyKey = keyof Pick<
  MeSettings,
  | 'explicitContent'
  | 'followersVisible'
  | 'privateSession'
  | 'publicPlaylistsOnProfile'
  | 'showListeningActivity'
>

/** Account privacy, applied by the server: activity feed, follower lists, profile playlists, history. */
export const ServerPrivacySettingsSection = () => {
  const { t } = useI18n()
  const { isAuthenticated } = useAuth()
  const { data: settings } = useMeSettings(isAuthenticated)
  const updateSettings = useUpdateMeSettings()

  if (!settings) return null

  const toggle = (key: PrivacyKey) => {
    updateSettings.mutate({ [key]: !settings[key] })
  }

  const row = (key: PrivacyKey, label: string, description?: string) => (
    <SettingsRow description={description} label={label}>
      <SettingsSwitch
        ariaLabel={label}
        checked={settings[key]}
        onChange={() => toggle(key)}
      />
    </SettingsRow>
  )

  return (
    <>
      <SettingsSection title={t('settings.privacy.activity')}>
        {row(
          'showListeningActivity',
          t('settings.privacy.activity.label'),
          t('settings.privacy.activity.description'),
        )}
        {row(
          'privateSession',
          'Private session',
          'Listening is not saved to your history and does not appear in activity.',
        )}
      </SettingsSection>

      <SettingsSection title={t('settings.privacy.profile')}>
        {row(
          'followersVisible',
          t('settings.privacy.followers'),
          t('settings.privacy.followers.description'),
        )}
        {row('publicPlaylistsOnProfile', t('settings.privacy.playlists'))}
      </SettingsSection>

      <SettingsSection searchTerms={['explicit content']} title="Content">
        {row(
          'explicitContent',
          'Explicit content',
          'Show tracks marked as explicit in search and recommendations.',
        )}
      </SettingsSection>
    </>
  )
}
